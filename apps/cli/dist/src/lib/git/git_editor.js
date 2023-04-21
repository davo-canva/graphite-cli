"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitPager = exports.getGitEditor = void 0;
const runner_1 = require("./runner");
function getGitEditor() {
    const editor = (0, runner_1.runGitCommand)({
        args: [`config`, `--global`, `core.editor`],
        onError: 'ignore',
        resource: 'getGitEditor',
    });
    return editor.length > 0 ? editor : undefined;
}
exports.getGitEditor = getGitEditor;
function getGitPager() {
    const editor = (0, runner_1.runGitCommand)({
        args: [`config`, `--global`, `core.pager`],
        onError: 'ignore',
        resource: 'getGitEditor',
    });
    return editor.length > 0 ? editor : undefined;
}
exports.getGitPager = getGitPager;
//# sourceMappingURL=git_editor.js.map