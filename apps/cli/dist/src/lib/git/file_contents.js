"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContents = void 0;
const runner_1 = require("./runner");
function getFileContents(ref, file) {
    return (0, runner_1.runGitCommand)({
        args: [`show`, `${ref}:${file}`],
        onError: 'throw',
        resource: 'fileContents',
    });
}
exports.getFileContents = getFileContents;
//# sourceMappingURL=file_contents.js.map