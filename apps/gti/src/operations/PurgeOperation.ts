import type {
  ApplyUncommittedChangesPreviewsFuncType,
  UncommittedChangesPreviewContext,
} from "../previews";
import type { UncommittedChanges } from "../types";

import { Operation } from "./Operation";

/**
 * This deletes untracked files from disk. Often used in conjunction with "Discard" aka `goto --clean .`
 */
export class PurgeOperation extends Operation {
  static opName = "Purge";

  constructor() {
    super("PurgeOperation");
  }

  getArgs() {
    const args = ["interactive", "purge"];
    return args;
  }

  makeOptimisticUncommittedChangesApplier?(
    context: UncommittedChangesPreviewContext
  ): ApplyUncommittedChangesPreviewsFuncType | undefined {
    const untrackedChangeTypes = ["?"];
    if (
      context.uncommittedChanges.length === 0 ||
      // no untracked files should be left
      context.uncommittedChanges.every(
        (change) => !untrackedChangeTypes.includes(change.status)
      )
    ) {
      return undefined;
    }

    const func: ApplyUncommittedChangesPreviewsFuncType = (
      changes: UncommittedChanges
    ) => {
      // remove all untracked files
      return changes.filter(
        (change) => !untrackedChangeTypes.includes(change.status)
      );
    };
    return func;
  }
}
