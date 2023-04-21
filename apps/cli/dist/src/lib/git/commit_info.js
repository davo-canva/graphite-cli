"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitDate = exports.getCommitAuthor = void 0;
const runner_1 = require("./runner");
// Using pretty formats specified here
function getCommitAuthor(ref) {
    return (0, runner_1.runGitCommand)({
        args: [`log`, '--format=%an', '-n', '1', ref],
        onError: 'ignore',
        resource: 'commitInfoAuthor',
    });
}
exports.getCommitAuthor = getCommitAuthor;
function getCommitDate(ref) {
    const result = (0, runner_1.runGitCommand)({
        args: [`log`, '--format=%cd', '-n', '1', ref],
        onError: 'ignore',
        resource: 'commitInfoBody',
    });
    return new Date(result);
}
exports.getCommitDate = getCommitDate;
//# sourceMappingURL=commit_info.js.map