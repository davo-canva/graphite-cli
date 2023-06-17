import type {
  ApplyMergeConflictsPreviewsFuncType,
  ApplyPreviewsFuncType,
  ApplyUncommittedChangesPreviewsFuncType,
  MergeConflictsPreviewContext,
  PreviewContext,
  UncommittedChangesPreviewContext,
} from "../previews";
import type { CommandArg } from "../types";

import { CommandRunner } from "../types";
import { randomId } from "@withgraphite/gti-shared/utils";
import type { TrackEventName } from "@withgraphite/gti-server/src/analytics/eventNames";

/**
 * Operations represent commands that mutate the repository, such as rebasing, committing, etc.
 * Operations are intended to be relatively long-lived processses which show progress, are cancellable, and must be run one-at-a-time.
 * This is as opposed to other commands like status, log, cat, which may be run in parallel and do not (necessarily) show stdout progress.
 * You can get arguments, get the preview applier function, get the optimistic state applier function, get documentation, etc.
 */
export abstract class Operation {
  static operationName: string;
  public id: string = randomId();

  constructor(public trackEventName: TrackEventName) { }

  abstract getArgs(): Array<CommandArg>;

  /** Optional stdin data piped to the process. */
  getStdin(): string | undefined {
    return undefined;
  }

  /** Description of the operation. This can replace the default display. */
  getDescriptionForDisplay(): OperationDescription | undefined {
    return undefined;
  }

  public runner: CommandRunner = CommandRunner.Graphite;

  /** Used to preview how this operation would affect the tree, if you ran it. */
  makePreviewApplier?(
    context: PreviewContext
  ): ApplyPreviewsFuncType | undefined;

  /** Used to show how this operation will affect the tree, after it's finished running and we get new data from hg. */
  makeOptimisticApplier?(
    context: PreviewContext
  ): ApplyPreviewsFuncType | undefined;

  makeOptimisticUncommittedChangesApplier?(
    context: UncommittedChangesPreviewContext
  ): ApplyUncommittedChangesPreviewsFuncType | undefined;

  makeOptimisticMergeConflictsApplier?(
    context: MergeConflictsPreviewContext
  ): ApplyMergeConflictsPreviewsFuncType | undefined;
}

/** Access static opName field of an operation */
export function getOpName(op: Operation): string {
  return (op.constructor as unknown as { opName: string }).opName;
}

/** Descirbe how to display a operation. */
export type OperationDescription = {
  /** If set, this replaces the default command arguments. */
  description?: string;

  /** If set, this replaces the default command + output tooltip. */
  tooltip?: string;
};
