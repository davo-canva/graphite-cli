"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullBranch = void 0;
const runner_1 = require("./runner");
/**
 * Returns OK if the branch was fast-forwarded successfully
 * Returns CONFLICT if it could not be fast-forwarded
 */
function pullBranch(remote, branchName) {
    try {
        (0, runner_1.runGitCommand)({
            args: [`pull`, `--ff-only`, remote, branchName],
            options: { stdio: 'pipe' },
            onError: 'throw',
            resource: 'pullBranch',
        });
        return 'OK';
    }
    catch (e) {
        if (e instanceof runner_1.CommandFailedError &&
            e.message.includes('fatal: Not possible to fast-forward, aborting.')) {
            return 'CONFLICT';
        }
        throw e;
    }
}
exports.pullBranch = pullBranch;
//# sourceMappingURL=pull_branch.js.map