"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesChanged = void 0;
const runner_1 = require("./runner");
// Using pretty formats specified here
// https://git-scm.com/docs/pretty-formats
function getFilesChanged(from, to) {
    const result = (0, runner_1.runGitCommand)({
        args: [`diff`, '-z', '--name-status', from, to],
        onError: 'ignore',
        resource: 'getFilesChanged',
    });
    const files = [];
    const tokens = result.split('\0');
    // Last character is always whitespace as it ends in a NULL terminator
    for (let i = 0; i < tokens.length - 1; i) {
        const rawStatus = tokens[i];
        /**
         * R and C are returned with scores. For example, renamed with 100% match is encoded
         * as R100.
         */
        const status = statusFromStatusCode(rawStatus[0]);
        // Renamed and copied files include the origin before the destination
        const parameters = status === 'copied' || status === 'renamed' ? 2 : 1;
        const path = tokens[i + parameters];
        files.push({ path, status });
        i += parameters + 1;
    }
    return files;
}
exports.getFilesChanged = getFilesChanged;
function statusFromStatusCode(code) {
    switch (code) {
        case 'A':
            return 'added';
        case 'C':
            return 'copied';
        case 'D':
            return 'deleted';
        case 'M':
            return 'modified';
        case 'R':
            return 'renamed';
        default:
            return 'modified';
    }
}
//# sourceMappingURL=files_changed.js.map