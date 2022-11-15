import chalk from 'chalk';
import { TContext } from '../lib/context';
import { PreconditionsFailedError, RebaseConflictError } from '../lib/errors';
import { clearContinuation, persistContinuation } from './persist_continuation';
import { printConflictStatus } from './print_conflict_status';
import { restackBranches } from './restack';
import { getBranchesFromRemote } from './sync/get';

export async function continueAction(
  opts: { addAll: boolean },
  context: TContext
): Promise<void> {
  if (!context.metaCache.rebaseInProgress()) {
    clearContinuation(context);
    throw new PreconditionsFailedError(`No Graphite command to continue.`);
  }

  if (opts.addAll) {
    context.metaCache.addAll();
  }
  const rebasedBranchBase = context.continueConfig.data.rebasedBranchBase;
  const branchesToSync = context.continueConfig.data?.branchesToSync;
  const branchesToRestack = context.continueConfig.data?.branchesToRestack;

  if (!rebasedBranchBase) {
    context.splog.info(
      `No Graphite operation to continue — passing through to git.`
    );
    clearContinuation(context);

    context.splog.info(`Running: "${chalk.yellow('git rebase --continue')}"`);
    const cont = context.metaCache.continueRebase();

    if (cont.result === 'REBASE_CONFLICT') {
      printConflictStatus(`Rebase conflict is not yet resolved.`, context);
      throw new RebaseConflictError();
    }

    return;
  }

  const cont = context.metaCache.continueRebase(rebasedBranchBase);
  if (cont.result === 'REBASE_CONFLICT') {
    persistContinuation(
      { branchesToRestack: branchesToRestack, rebasedBranchBase },
      context
    );
    printConflictStatus(`Rebase conflict is not yet resolved.`, context);
    throw new RebaseConflictError();
  }

  context.splog.info(
    `Resolved rebase conflict for ${chalk.green(cont.branchName)}.`
  );

  if (branchesToSync) {
    await getBranchesFromRemote(
      {
        downstack: branchesToSync,
        base: context.metaCache.currentBranchPrecondition,
        force: false,
      },
      context
    );
  }

  if (branchesToRestack) {
    restackBranches(branchesToRestack, context);
  }
  clearContinuation(context);
}
