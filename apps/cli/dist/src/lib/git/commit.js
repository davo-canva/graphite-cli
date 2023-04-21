"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = void 0;
const runner_1 = require("./runner");
function commit(opts) {
    (0, runner_1.runGitCommand)({
        args: [
            'commit',
            ...(opts.amend ? [`--amend`] : []),
            ...(opts.message ? [`-m`, opts.message] : []),
            ...(opts.noEdit ? [`--no-edit`] : []),
            ...(opts.edit ? [`-e`] : []),
            ...(opts.patch ? [`-p`] : []),
            ...(opts.noVerify ? ['-n'] : []),
        ],
        options: {
            stdio: 'inherit',
        },
        onError: 'throw',
        resource: 'commit',
    });
}
exports.commit = commit;
//# sourceMappingURL=commit.js.map