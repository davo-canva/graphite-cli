"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCommits = void 0;
const runner_1 = require("./runner");
function showCommits(base, head, patch) {
    return (0, runner_1.runGitCommand)({
        args: [
            `-c`,
            `color.ui=always`,
            `--no-pager`,
            `log`,
            ...(patch ? ['-p'] : []),
            `${base}..${head}`,
            `--`,
        ],
        onError: 'throw',
        resource: 'showCommits',
    });
}
exports.showCommits = showCommits;
//# sourceMappingURL=show_commits.js.map