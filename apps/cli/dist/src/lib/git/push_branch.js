"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBranch = void 0;
const runner_1 = require("./runner");
function pushBranch(opts) {
    const forceOption = opts.forcePush ? '--force' : '--force-with-lease';
    (0, runner_1.runGitCommand)({
        args: [
            `push`,
            `-u`,
            opts.remote,
            forceOption,
            opts.branchName,
            ...(opts.noVerify ? ['--no-verify'] : []),
        ],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'pushBranch',
    });
}
exports.pushBranch = pushBranch;
//# sourceMappingURL=push_branch.js.map