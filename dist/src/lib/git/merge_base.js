"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMergeBase = void 0;
const runner_1 = require("./runner");
function getMergeBase(left, right) {
    return (0, runner_1.runGitCommand)({
        args: [`merge-base`, left, right],
        onError: 'throw',
        resource: 'getMergeBase',
    });
}
exports.getMergeBase = getMergeBase;
//# sourceMappingURL=merge_base.js.map