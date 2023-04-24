"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLong = void 0;
const runner_1 = require("./runner");
function logLong() {
    (0, runner_1.runGitCommand)({
        args: [
            `log`,
            `--graph`,
            `--abbrev-commit`,
            `--decorate`,
            `--format=format:%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)`,
            `--branches`,
        ],
        options: { stdio: 'inherit' },
        onError: 'throw',
        resource: `logLong`,
    });
}
exports.logLong = logLong;
//# sourceMappingURL=log.js.map