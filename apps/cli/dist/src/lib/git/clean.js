"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
const runner_1 = require("./runner");
function clean() {
    (0, runner_1.runGitCommand)({
        args: ['clean', '--force'],
        options: { stdio: 'ignore' },
        onError: 'throw',
        resource: 'clean',
    });
}
exports.clean = clean;
//# sourceMappingURL=clean.js.map