"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBranch = void 0;
const runner_1 = require("./runner");
function pullBranch(remote, branchName) {
    (0, runner_1.runGitCommand)({
        args: [`pull`, `--ff-only`, remote, branchName],
        options: { stdio: 'pipe' },
        onError: 'throw',
        resource: 'pullBranch',
    });
}
exports.pullBranch = pullBranch;
//# sourceMappingURL=pull_branch.js.map