"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedReset = exports.hardReset = exports.softReset = void 0;
const runner_1 = require("./runner");
function softReset(sha) {
    (0, runner_1.runGitCommand)({
        args: [`reset`, `-q`, `--soft`, sha],
        onError: 'throw',
        resource: 'softReset',
    });
}
exports.softReset = softReset;
function hardReset(sha) {
    (0, runner_1.runGitCommand)({
        args: [`reset`, `-q`, `--hard`, sha],
        onError: 'throw',
        resource: 'hardReset',
    });
}
exports.hardReset = hardReset;
function trackedReset(sha) {
    (0, runner_1.runGitCommand)({
        args: [`reset`, `-Nq`, sha],
        onError: 'throw',
        resource: 'trackedReset',
    });
}
exports.trackedReset = trackedReset;
//# sourceMappingURL=reset_branch.js.map