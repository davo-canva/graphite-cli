"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = void 0;
const runner_1 = require("./runner");
// Using pretty formats specified here
function getStatus() {
    const result = (0, runner_1.runGitCommand)({
        args: [`status`, '-z'],
        onError: 'ignore',
        resource: 'getStatus',
        options: { noTrim: true },
    });
    const files = [];
    const tokens = result.split('\0');
    // Last character is always whitespace as it ends in a NULL terminator
    for (let i = 0; i < tokens.length - 1; i) {
        const rawStatus = tokens[i];
        // https://git-scm.com/docs/git-status#_short_format
        const indexStatus = rawStatus[0];
        const workingTreeStatus = rawStatus[1];
        const path = rawStatus.slice(3);
        const status = statusFromStatusCode(indexStatus, workingTreeStatus);
        // Renamed and copied files include the origin before the destination
        const parameters = status === 'copied' || status === 'renamed' ? 2 : 1;
        files.push({ path, status });
        i += parameters;
    }
    return files;
}
exports.getStatus = getStatus;
function statusFromStatusCode(indexStatus, workingTreeStatus) {
    if ((indexStatus === 'A' && workingTreeStatus === 'A') ||
        (indexStatus === 'D' && workingTreeStatus === 'D') ||
        indexStatus === 'U' ||
        workingTreeStatus === 'U') {
        return 'unresolved';
    }
    if (workingTreeStatus === 'M' || workingTreeStatus === 'T') {
        return 'modified';
    }
    if (workingTreeStatus === 'D') {
        return 'deleted';
    }
    if (workingTreeStatus === 'C') {
        return 'copied';
    }
    if (workingTreeStatus === 'R') {
        return 'renamed';
    }
    if (workingTreeStatus === 'D') {
        return 'untracked_deleted';
    }
    if (workingTreeStatus === '?') {
        return 'untracked_added';
    }
    if (workingTreeStatus === ' ' &&
        (indexStatus === 'M' || indexStatus === 'T')) {
        return 'modified';
    }
    if (workingTreeStatus === ' ' && indexStatus === 'A') {
        return 'added';
    }
    if (workingTreeStatus === ' ' && indexStatus === 'R') {
        return 'renamed';
    }
    if (workingTreeStatus === ' ' && indexStatus === 'C') {
        return 'copied';
    }
    return 'modified';
}
//# sourceMappingURL=status.js.map