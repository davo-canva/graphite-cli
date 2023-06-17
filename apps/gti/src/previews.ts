import type { CommitTree, CommitTreeWithPreviews } from "./getCommitTree";
import type { Operation } from "./operations/Operation";
import type { OperationInfo, OperationList } from "./serverAPIState";
import type { MergeConflicts, UncommittedChanges } from "./types";

import { getTracker } from "./analytics/globalTracker";
import { getOpName } from "./operations/Operation";
import {
  latestCommitsData,
  latestUncommittedChangesData,
  mergeConflicts,
  operationBeingPreviewed,
} from "./serverAPIState";

import type {
  BranchInfo,
  BranchName,
  ChangedFile,
} from "@withgraphite/gti-cli-shared-types";
import { notEmpty, unwrap } from "@withgraphite/gti-shared/utils";
import { computed } from "mobx";
import { useEffect } from "react";
import {
  latestCommitTree,
  latestCommitTreeMap,
  latestHeadCommit,
  latestUncommittedChanges,
  operationList,
  queuedOperations,
} from "./serverAPIState";

export enum CommitPreview {
  REBASE_ROOT = "rebase-root",
  REBASE_DESCENDANT = "rebase-descendant",
  REBASE_OLD = "rebase-old",
  REBASE_OPTIMISTIC_ROOT = "rebase-optimistic-root",
  REBASE_OPTIMISTIC_DESCENDANT = "rebase-optimistic-descendant",
  GOTO_DESTINATION = "goto-destination",
  GOTO_PREVIOUS_LOCATION = "goto-previous-location",
  HIDDEN_ROOT = "hidden-root",
  HIDDEN_DESCENDANT = "hidden-descendant",
  STACK_EDIT_ROOT = "stack-edit-root",
  STACK_EDIT_DESCENDANT = "stack-edit-descendant",
  // Commit being rendered in some other context than the commit tree,
  // such as the commit info sidebar
  NON_ACTIONABLE_COMMIT = "non-actionable-commit",
}

/**
 * A preview applier function provides a way of iterating the tree of commits and modify it & mark commits as being in a preview state.
 * Given a commit in the tree, you can overwrite what children to render and what preview type to set.
 * This function is used to walk the entire tree and alter how it would be rendered without needing to make a copy of the entire tree that needs to be mutated.
 * The preview type is used when rendering the commit to de-emphasize it, put it in a green color, add a confirm rebase button, etc.
 * If the preview applier returns null, it means to hide the commit and all of its children.
 *
 * Preview Appliers may also be called on individual commits (as opposed to walking the entire tree)
 * when rendering their details in the Commit Info View. As such, they should not depend on being called in
 * any specific order of commits.
 */
export type ApplyPreviewsFuncType = (
  tree: CommitTree,
  previewType: CommitPreview | undefined,
  childPreviewType?: CommitPreview | undefined
) => (
  | {
      info: null;
      children?: undefined;
    }
  | { info: BranchInfo; children: Array<CommitTree> }
) & {
  previewType?: CommitPreview;
  childPreviewType?: CommitPreview;
};

/**
 * Like ApplyPreviewsFuncType, this provides a way to alter the set of Uncommitted Changes.
 */
export type ApplyUncommittedChangesPreviewsFuncType = (
  changes: UncommittedChanges
) => UncommittedChanges;

/**
 * Like ApplyPreviewsFuncType, this provides a way to alter the set of Merge Conflicts.
 */
export type ApplyMergeConflictsPreviewsFuncType = (
  conflicts: MergeConflicts | undefined
) => MergeConflicts | undefined;

function applyPreviewsToChangedFiles(
  files: Array<ChangedFile>,
  list: OperationList,
  queued: Array<Operation>
): Array<ChangedFile> {
  const currentOperation = list.currentOperation;

  // gather operations from past, current, and queued commands which could have optimistic state appliers
  type Applier = (
    context: UncommittedChangesPreviewContext
  ) => ApplyUncommittedChangesPreviewsFuncType | undefined;
  const appliersSources: Array<Applier> = [];

  // previous commands
  for (const op of list.operationHistory) {
    if (op != null && !op.hasCompletedUncommittedChangesOptimisticState) {
      if (op.operation.makeOptimisticUncommittedChangesApplier != null) {
        appliersSources.push(
          op.operation.makeOptimisticUncommittedChangesApplier.bind(
            op.operation
          )
        );
      }
    }
  }

  // currently running/last command
  if (
    currentOperation != null &&
    !currentOperation.hasCompletedUncommittedChangesOptimisticState &&
    // don't show optimistic state if we hit an error
    (currentOperation.exitCode == null || currentOperation.exitCode === 0)
  ) {
    if (
      currentOperation.operation.makeOptimisticUncommittedChangesApplier != null
    ) {
      appliersSources.push(
        currentOperation.operation.makeOptimisticUncommittedChangesApplier.bind(
          currentOperation.operation
        )
      );
    }
  }

  // queued commands
  for (const op of queued) {
    if (op != null) {
      if (op.makeOptimisticUncommittedChangesApplier != null) {
        appliersSources.push(
          op.makeOptimisticUncommittedChangesApplier.bind(op)
        );
      }
    }
  }

  // apply in order
  if (appliersSources.length) {
    let finalChanges = files;

    for (const applierSource of appliersSources) {
      const context: UncommittedChangesPreviewContext = {
        uncommittedChanges: files,
      };

      const applier = applierSource(context);
      if (applier == null) {
        continue;
      }

      finalChanges = applier(finalChanges);
    }
    return finalChanges;
  }

  return files;
}

function applyPreviewsToMergeConflicts(
  conflicts: MergeConflicts,
  list: OperationList,
  queued: Array<Operation>
): MergeConflicts | undefined {
  const currentOperation = list.currentOperation;
  if (conflicts.state !== "loaded") {
    return conflicts;
  }

  // gather operations from past, current, and queued commands which could have optimistic state appliers
  type Applier = (
    context: MergeConflictsPreviewContext
  ) => ApplyMergeConflictsPreviewsFuncType | undefined;
  const appliersSources: Array<Applier> = [];

  // previous commands
  for (const op of list.operationHistory) {
    if (op != null && !op.hasCompletedMergeConflictsOptimisticState) {
      if (op.operation.makeOptimisticMergeConflictsApplier != null) {
        appliersSources.push(
          op.operation.makeOptimisticMergeConflictsApplier.bind(op.operation)
        );
      }
    }
  }

  // currently running/last command
  if (
    currentOperation != null &&
    !currentOperation.hasCompletedMergeConflictsOptimisticState &&
    // don't show optimistic state if we hit an error
    (currentOperation.exitCode == null || currentOperation.exitCode === 0)
  ) {
    if (
      currentOperation.operation.makeOptimisticMergeConflictsApplier != null
    ) {
      appliersSources.push(
        currentOperation.operation.makeOptimisticMergeConflictsApplier.bind(
          currentOperation.operation
        )
      );
    }
  }

  // queued commands
  for (const op of queued) {
    if (op != null) {
      if (op.makeOptimisticMergeConflictsApplier != null) {
        appliersSources.push(op.makeOptimisticMergeConflictsApplier.bind(op));
      }
    }
  }

  // apply in order
  if (appliersSources.length) {
    let finalChanges: MergeConflicts | undefined = conflicts;

    for (const applierSource of appliersSources) {
      const context: MergeConflictsPreviewContext = {
        conflicts,
      };

      const applier = applierSource(context);
      if (applier == null) {
        continue;
      }

      finalChanges = applier(finalChanges);
    }
    return finalChanges;
  }
  return conflicts;
}

export const uncommittedChangesWithPreviews = computed(
  (): Array<ChangedFile> => {
    const list = operationList.get();
    const queued = queuedOperations.get();
    const uncommittedChanges = latestUncommittedChanges.get();

    return applyPreviewsToChangedFiles(uncommittedChanges, list, queued);
  }
);

export const optimisticMergeConflicts = computed(
  (): MergeConflicts | undefined => {
    const list = operationList.get();
    const queued = queuedOperations.get();
    const conflicts = mergeConflicts.get();
    if (conflicts?.files == null) {
      return conflicts;
    }
    return applyPreviewsToMergeConflicts(conflicts, list, queued);
  }
);

export const treeWithPreviews = computed(
  (): {
    trees: Array<CommitTree>;
    treeMap: Map<BranchName, CommitTree>;
    headCommit?: BranchInfo;
  } => {
    const trees = latestCommitTree.get();

    // gather operations from past, current, and queued commands which could have optimistic state appliers
    type Applier = (
      context: PreviewContext
    ) => ApplyPreviewsFuncType | undefined;
    const appliersSources: Array<Applier> = [];

    // preview applier can either come from an operation being previewed...
    const currentPreview = operationBeingPreviewed.get();
    // ...or from an operation that is being run right now
    // or ran recently and is still showing optimistic state while waiting for new commits or uncommitted changes
    const list = operationList.get();
    const queued = queuedOperations.get();
    const currentOperation = list.currentOperation;

    // previous commands
    for (const op of list.operationHistory) {
      if (op != null && !op.hasCompletedOptimisticState) {
        if (op.operation.makeOptimisticApplier != null) {
          appliersSources.push(
            op.operation.makeOptimisticApplier.bind(op.operation)
          );
        }
      }
    }

    // currently running/last command
    if (
      currentOperation != null &&
      !currentOperation.hasCompletedOptimisticState &&
      // don't show optimistic state if we hit an error
      (currentOperation.exitCode == null || currentOperation.exitCode === 0)
    ) {
      if (currentOperation.operation.makeOptimisticApplier != null) {
        appliersSources.push(
          currentOperation.operation.makeOptimisticApplier.bind(
            currentOperation.operation
          )
        );
      }
    }

    // queued commands
    for (const op of queued) {
      if (op != null) {
        if (op.makeOptimisticApplier != null) {
          appliersSources.push(op.makeOptimisticApplier.bind(op));
        }
      }
    }

    // operation being previewed (would be queued next)
    if (currentPreview?.makePreviewApplier != null) {
      appliersSources.push(
        currentPreview.makePreviewApplier.bind(currentPreview)
      );
    }

    let headCommit = latestHeadCommit.get();
    let treeMap = latestCommitTreeMap.get();

    // apply in order
    if (appliersSources.length) {
      let finalTrees = trees;

      for (const applierSource of appliersSources) {
        const context: PreviewContext = {
          trees: finalTrees,
          headCommit,
          treeMap,
        };
        let nextHeadCommit = headCommit;
        const nextTreeMap = new Map<BranchName, CommitTree>();

        const applier = applierSource(context);
        if (applier == null) {
          continue;
        }

        const processTree = (
          tree: CommitTreeWithPreviews,
          inheritedPreviewType?: CommitPreview
        ): CommitTreeWithPreviews | undefined => {
          const result = applier(tree, inheritedPreviewType);
          if (result?.info == null) {
            return undefined;
          }
          if (result.info.isHead) {
            nextHeadCommit = result.info;
          }
          const { info, children, previewType, childPreviewType } = result;
          const newTree = {
            info,
            previewType,
            children: children
              .map((child) => processTree(child, childPreviewType))
              .filter((tree): tree is CommitTreeWithPreviews => tree != null),
          };

          nextTreeMap.set(newTree.info.branch, result);
          return newTree;
        };
        finalTrees = finalTrees
          .map((tree) => processTree(tree))
          .filter(notEmpty);
        headCommit = nextHeadCommit;
        treeMap = nextTreeMap;
      }
      return { trees: finalTrees, treeMap, headCommit };
    }

    return { trees, treeMap, headCommit };
  }
);

/**
 * Mark operations as completed when their optimistic applier is no longer needed.
 * Similarly marks uncommitted changes optimistic state resolved.
 * n.b. this must be a useEffect since React doesn't like setCurrentOperation getting called during render
 * when ongoingOperation is used elsewhere in the tree
 */
export function useMarkOperationsCompleted(): void {
  const fetchedCommits = latestCommitsData.get();
  const trees = latestCommitTree.get();
  const headCommit = latestHeadCommit.get();
  const treeMap = latestCommitTreeMap.get();
  const uncommittedChanges = latestUncommittedChangesData.get();
  const conflicts = mergeConflicts.get();

  const list = operationList.get();

  // Mark operations as completed when their optimistic applier is no longer needed
  // n.b. this must be a useEffect since React doesn't like setCurrentOperation getting called during render
  // when ongoingOperation is used elsewhere in the tree
  useEffect(() => {
    const toMarkResolved: Array<
      ReturnType<typeof shouldMarkOptimisticChangesResolved>
    > = [];
    const context = {
      trees,
      headCommit,
      treeMap,
    };
    const uncommittedContext = {
      uncommittedChanges: uncommittedChanges.files ?? [],
    };
    const mergeConflictsContext = {
      conflicts,
    };
    const currentOperation = list.currentOperation;

    for (const operation of [...list.operationHistory, currentOperation]) {
      if (operation) {
        toMarkResolved.push(
          shouldMarkOptimisticChangesResolved(
            operation,
            context,
            uncommittedContext,
            mergeConflictsContext
          )
        );
      }
    }
    if (toMarkResolved.some(notEmpty)) {
      const operationHistory = [...list.operationHistory];
      const currentOperation =
        list.currentOperation == null
          ? undefined
          : { ...list.currentOperation };
      for (let i = 0; i < toMarkResolved.length - 1; i++) {
        if (toMarkResolved[i]?.commits) {
          operationHistory[i] = {
            ...operationHistory[i],
            hasCompletedOptimisticState: true,
          };
        }
        if (toMarkResolved[i]?.files) {
          operationHistory[i] = {
            ...operationHistory[i],
            hasCompletedUncommittedChangesOptimisticState: true,
          };
        }
        if (toMarkResolved[i]?.conflicts) {
          operationHistory[i] = {
            ...operationHistory[i],
            hasCompletedMergeConflictsOptimisticState: true,
          };
        }
      }
      const markCurrentOpResolved = toMarkResolved[toMarkResolved.length - 1];
      if (markCurrentOpResolved && currentOperation != null) {
        if (markCurrentOpResolved.commits) {
          currentOperation.hasCompletedOptimisticState = true;
        }
        if (markCurrentOpResolved.files) {
          currentOperation.hasCompletedUncommittedChangesOptimisticState = true;
        }
        if (markCurrentOpResolved.conflicts) {
          currentOperation.hasCompletedMergeConflictsOptimisticState = true;
        }
      }
      operationList.set({ operationHistory, currentOperation });
    }

    // eslint-disable-next-line max-params
    function shouldMarkOptimisticChangesResolved(
      operation: OperationInfo,
      context: PreviewContext,
      uncommittedChangesContext: UncommittedChangesPreviewContext,
      mergeConflictsContext: MergeConflictsPreviewContext
    ): { commits: boolean; files: boolean; conflicts: boolean } | undefined {
      let files = false;
      let commits = false;
      let conflicts = false;

      if (
        operation != null &&
        !operation.hasCompletedUncommittedChangesOptimisticState
      ) {
        if (
          operation.operation.makeOptimisticUncommittedChangesApplier != null
        ) {
          const optimisticApplier =
            operation.operation.makeOptimisticUncommittedChangesApplier(
              uncommittedChangesContext
            );
          if (operation.exitCode != null) {
            if (optimisticApplier == null || operation.exitCode !== 0) {
              files = true;
            } else if (
              uncommittedChanges.fetchStartTimestamp >
              unwrap(operation.endTime).valueOf()
            ) {
              getTracker()?.track("OptimisticFilesStateForceResolved", {
                extras: {},
              });
              files = true;
            }
          }
        } else if (operation.exitCode != null) {
          files = true;
        }
      }

      if (
        operation != null &&
        !operation.hasCompletedMergeConflictsOptimisticState
      ) {
        if (operation.operation.makeOptimisticMergeConflictsApplier != null) {
          const optimisticApplier =
            operation.operation.makeOptimisticMergeConflictsApplier(
              mergeConflictsContext
            );
          if (operation.exitCode != null) {
            if (optimisticApplier == null || operation.exitCode !== 0) {
              conflicts = true;
            } else if (
              (mergeConflictsContext.conflicts?.fetchStartTimestamp ?? 0) >
              unwrap(operation.endTime).valueOf()
            ) {
              getTracker()?.track("OptimisticConflictsStateForceResolved", {
                extras: { operation: getOpName(operation.operation) },
              });
              conflicts = true;
            }
          }
        } else if (operation.exitCode != null) {
          conflicts = true;
        }
      }

      if (operation != null && !operation.hasCompletedOptimisticState) {
        if (operation.operation.makeOptimisticApplier != null) {
          const optimisticApplier =
            operation.operation.makeOptimisticApplier(context);
          if (operation.exitCode != null) {
            if (optimisticApplier == null || operation.exitCode !== 0) {
              commits = true;
            } else if (
              fetchedCommits.fetchStartTimestamp >
              unwrap(operation.endTime).valueOf()
            ) {
              getTracker()?.track("OptimisticCommitsStateForceResolved", {
                extras: {},
              });
              commits = true;
            }
          }
        } else if (operation.exitCode != null) {
          commits = true;
        }
      }

      if (commits || files || conflicts) {
        return { commits, files, conflicts };
      }
      return undefined;
    }
  }, [
    list,
    headCommit,
    trees,
    treeMap,
    uncommittedChanges,
    conflicts,
    fetchedCommits,
  ]);
}

/** Set of info about commit tree to generate appropriate previews */
export type PreviewContext = {
  trees: Array<CommitTree>;
  headCommit?: BranchInfo;
  treeMap: Map<string, CommitTree>;
};

export type UncommittedChangesPreviewContext = {
  uncommittedChanges: UncommittedChanges;
};

export type MergeConflictsPreviewContext = {
  conflicts: MergeConflicts | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Class<T> = new (...args: any[]) => T;
/**
 * React hook which looks in operation queue and history to see if a
 * particular operation is running or queued to run.
 * ```
 * const isRunning = useIsOperationRunningOrQueued(PullOperation);
 * ```
 */
export function useIsOperationRunningOrQueued(
  cls: Class<Operation>
): "running" | "queued" | undefined {
  const list = operationList.get();
  const queued = queuedOperations.get();
  if (
    list.currentOperation?.operation instanceof cls &&
    list.currentOperation?.exitCode == null
  ) {
    return "running";
  } else if (queued.some((op) => op instanceof cls)) {
    return "queued";
  }
  return undefined;
}

export const useMostRecentPendingOperation = (): Operation | undefined => {
  const list = operationList.get();
  const queued = queuedOperations.get();
  if (queued.length > 0) {
    return queued.at(-1);
  }
  if (list.currentOperation?.exitCode == null) {
    return list.currentOperation?.operation;
  }
  return undefined;
};
