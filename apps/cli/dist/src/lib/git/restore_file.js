"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreFile = void 0;
const runner_1 = require("./runner");
function restoreFile(file) {
    (0, runner_1.runGitCommand)({
        args: ['restore', '-SW', file],
        options: { stdio: 'ignore' },
        onError: 'throw',
        resource: 'clean',
    });
}
exports.restoreFile = restoreFile;
//# sourceMappingURL=restore_file.js.map