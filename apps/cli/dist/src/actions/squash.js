"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squashCurrentBranch = void 0;
const scope_spec_1 = require("../lib/engine/scope_spec");
const restack_1 = require("./restack");
function squashCurrentBranch(opts, context) {
    context.engine.squashCurrentBranch({
        noEdit: opts.noEdit,
        message: opts.message,
    });
    (0, restack_1.restackBranches)(context.engine.getRelativeStack(context.engine.currentBranchPrecondition, scope_spec_1.SCOPE.UPSTACK_EXCLUSIVE), context);
}
exports.squashCurrentBranch = squashCurrentBranch;
//# sourceMappingURL=squash.js.map