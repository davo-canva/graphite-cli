"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentBranchOnto = void 0;
const scope_spec_1 = require("../lib/engine/scope_spec");
const preconditions_1 = require("../lib/preconditions");
const restack_1 = require("./restack");
function currentBranchOnto(ontoBranchName, context) {
    (0, preconditions_1.uncommittedTrackedChangesPrecondition)();
    const currentBranch = context.engine.currentBranchPrecondition;
    context.engine.setParent(currentBranch, ontoBranchName);
    (0, restack_1.restackBranches)(context.engine.getRelativeStack(currentBranch, scope_spec_1.SCOPE.UPSTACK), context);
}
exports.currentBranchOnto = currentBranchOnto;
//# sourceMappingURL=current_branch_onto.js.map