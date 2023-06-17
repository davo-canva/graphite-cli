import type { RepoRelativePath } from "@withgraphite/gti-cli-shared-types";
import type {
  ApplyUncommittedChangesPreviewsFuncType,
  UncommittedChangesPreviewContext,
} from "../previews";
import type { UncommittedChanges } from "../types";

import { Operation } from "./Operation";

import type { Comparison } from "@withgraphite/gti-shared/Comparison";

export class RevertOperation extends Operation {
  static opName = "Revert";

  constructor(
    private files: Array<RepoRelativePath>,
    private revset?: Comparison
  ) {
    super("RevertOperation");
  }

  getArgs() {
    // @nocommit do something with revset (pass to interactive restore)
    const args = [
      "interactive",
      "restore",
      ...this.files.map((file) =>
        // tag file arguments specialy so the remote repo can convert them to the proper cwd-relative format.
        ({
          type: "repo-relative-file" as const,
          path: file,
        })
      ),
    ];
    return args;
  }

  makeOptimisticUncommittedChangesApplier?(
    context: UncommittedChangesPreviewContext
  ): ApplyUncommittedChangesPreviewsFuncType | undefined {
    if (this.revset == null) {
      const filesToHide = new Set(this.files);
      if (
        context.uncommittedChanges.every(
          (change) => !filesToHide.has(change.path)
        )
      ) {
        return undefined;
      }

      const func: ApplyUncommittedChangesPreviewsFuncType = (
        changes: UncommittedChanges
      ) => {
        return changes.filter((change) => !filesToHide.has(change.path));
      };
      return func;
    } else {
      // If reverting back to a specific commit, the file will probably become 'M', not disappear.
      // Note: this is just a guess, in reality the file could do any number of things.

      const filesToMarkChanged = new Set(this.files);
      if (
        context.uncommittedChanges.find((change) =>
          filesToMarkChanged.has(change.path)
        ) != null
      ) {
        return undefined;
      }
      const func: ApplyUncommittedChangesPreviewsFuncType = (
        changes: UncommittedChanges
      ) => {
        const existingChanges = new Set(changes.map((change) => change.path));
        const revertedChangesToInsert = this.files.filter(
          (file) => !existingChanges.has(file)
        );
        return [
          ...changes.map((change) =>
            filesToMarkChanged.has(change.path)
              ? { ...change, status: "M" as const }
              : change
          ),
          ...revertedChangesToInsert.map((path) => ({
            path,
            status: "M" as const,
          })),
        ];
      };
      return func;
    }
  }
}
