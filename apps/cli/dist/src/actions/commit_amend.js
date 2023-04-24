"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitAmendAction = void 0;
const scope_spec_1 = require("../lib/engine/scope_spec");
const errors_1 = require("../lib/errors");
const restack_1 = require("./restack");
function commitAmendAction(opts, context) {
    if (context.engine.isBranchEmpty(context.engine.currentBranchPrecondition)) {
        throw new errors_1.PreconditionsFailedError('No commits in this branch to amend');
    }
    if (context.engine.rebaseInProgress()) {
        throw new errors_1.BlockedDuringRebaseError();
    }
    if (opts.addAll) {
        context.engine.addAll();
    }
    context.engine.commit({
        amend: true,
        noEdit: opts.noEdit,
        message: opts.message,
        patch: !opts.addAll && opts.patch,
    });
    if (!opts.noEdit) {
        context.splog.tip('In the future, you can skip editing the commit message with the `--no-edit` flag.');
    }
    (0, restack_1.restackBranches)(context.engine.getRelativeStack(context.engine.currentBranchPrecondition, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE), context);
}
exports.commitAmendAction = commitAmendAction;
//# sourceMappingURL=commit_amend.js.map