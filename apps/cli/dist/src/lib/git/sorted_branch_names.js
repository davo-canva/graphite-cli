"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchNamesAndRevisions = void 0;
const runner_1 = require("./runner");
function getBranchNamesAndRevisions() {
    const branches = {};
    (0, runner_1.runGitCommandAndSplitLines)({
        args: [
            `for-each-ref`,
            `--format=%(refname:short):%(objectname)`,
            `--sort=-committerdate`,
            `refs/heads/`,
        ],
        onError: 'throw',
        resource: 'getBranchNamesAndRevisions',
    })
        .map((line) => line.split(':'))
        .filter((lineSplit) => lineSplit.length === 2 && lineSplit.every((s) => s.length > 0))
        .forEach(([branchName, sha]) => (branches[branchName] = sha));
    return branches;
}
exports.getBranchNamesAndRevisions = getBranchNamesAndRevisions;
//# sourceMappingURL=sorted_branch_names.js.map