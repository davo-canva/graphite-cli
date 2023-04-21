"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullTrunk = exports.syncAction = void 0;
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const scope_spec_1 = require("../../lib/engine/scope_spec");
const errors_1 = require("../../lib/errors");
const preconditions_1 = require("../../lib/preconditions");
const restack_1 = require("../restack");
const sync_pr_info_1 = require("../sync_pr_info");
const clean_branches_1 = require("./clean_branches");
async function syncAction(opts, context) {
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    if (opts.pull) {
        await pullTrunk(opts.force, context);
        context.splog.tip('You can skip pulling trunk with the `--no-pull` flag.');
    }
    const branchesToRestack = [];
    await (0, sync_pr_info_1.syncPrInfo)(context.engine.allBranchNames, context);
    if (opts.delete) {
        context.splog.info(`🧹 Checking if any branches have been merged/closed and can be deleted...`);
        const branchesWithNewParents = await (0, clean_branches_1.cleanBranches)({ showDeleteProgress: opts.showDeleteProgress, force: opts.force }, context);
        context.splog.tip([
            'You can skip deleting branches with the `--no-delete` flag.',
            ...(opts.force
                ? []
                : [
                    'Try the `--force` flag to delete merged branches without prompting for each.',
                ]),
            ...(opts.restack
                ? []
                : [
                    'Try the `--restack` flag to automatically restack the current stack as well as any stacks with deleted branches.',
                ]),
        ].join('\n'));
        if (!opts.restack) {
            return;
        }
        branchesWithNewParents
            .flatMap((branchName) => context.engine.getRelativeStack(branchName, scope_spec_1.SCOPE.UPSTACK))
            .forEach((branchName) => branchesToRestack.push(branchName));
    }
    if (!opts.restack) {
        context.splog.tip('Try the `--restack` flag to automatically restack the current stack.');
        return;
    }
    const currentBranch = context.engine.currentBranch;
    // The below conditional doesn't handle the trunk case because
    // isBranchTracked returns false for trunk.  Also, in this case
    // we don't want to append to our existing branchesToRestack
    // because trunk's stack will include everything anyway.
    if (currentBranch && context.engine.isTrunk(currentBranch)) {
        (0, restack_1.restackBranches)(context.engine.getRelativeStack(currentBranch, scope_spec_1.SCOPE.STACK), context);
        return;
    }
    if (currentBranch &&
        context.engine.isBranchTracked(currentBranch) &&
        !branchesToRestack.includes(currentBranch)) {
        context.engine
            .getRelativeStack(currentBranch, scope_spec_1.SCOPE.STACK)
            .forEach((branchName) => branchesToRestack.push(branchName));
    }
    (0, restack_1.restackBranches)(branchesToRestack, context);
}
exports.syncAction = syncAction;
async function pullTrunk(force, context) {
    context.splog.info(`🌲 Pulling ${chalk_1.default.cyan(context.engine.trunk)} from remote...`);
    const pullResult = context.engine.pullTrunk();
    if (pullResult !== 'PULL_CONFLICT') {
        context.splog.info(pullResult === 'PULL_UNNEEDED'
            ? `${chalk_1.default.green(context.engine.trunk)} is up to date.`
            : `${chalk_1.default.green(context.engine.trunk)} fast-forwarded to ${chalk_1.default.gray(context.engine.getRevision(context.engine.trunk))}.`);
        return;
    }
    // If trunk cannot be fast-forwarded, prompt the user to reset to remote
    context.splog.warn(`${chalk_1.default.blueBright(context.engine.trunk)} could not be fast-forwarded.`);
    if (force ||
        (context.interactive &&
            (await (0, prompts_1.default)({
                type: 'confirm',
                name: 'value',
                message: `Overwrite ${chalk_1.default.yellow(context.engine.trunk)} with the version from remote?`,
                initial: true,
            }, {
                onCancel: () => {
                    throw new errors_1.KilledError();
                },
            })).value)) {
        context.engine.resetTrunkToRemote();
        context.splog.info(`${chalk_1.default.green(context.engine.trunk)} set to ${chalk_1.default.gray(context.engine.getRevision(context.engine.trunk))}.`);
    }
    else {
        throw new errors_1.KilledError();
    }
}
exports.pullTrunk = pullTrunk;
//# sourceMappingURL=sync.js.map