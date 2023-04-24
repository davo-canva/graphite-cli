"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMerged = void 0;
const runner_1 = require("./runner");
const merge_base_1 = require("./merge_base");
const commit_range_1 = require("./commit_range");
const get_sha_1 = require("./get_sha");
function isMerged({ branchName, trunkName, }) {
    const mergeBase = (0, merge_base_1.getMergeBase)(branchName, trunkName);
    const branchCommits = (0, commit_range_1.getCommitRange)(trunkName, branchName, 'SHA').reverse();
    // note - we copied this code from the server
    const lastMergedCommitSha = branchCommits.reduce((currentBase, nextCommit) => {
        // Create a commit of all changes between currentBase and nextCommit
        const testCommit = (0, runner_1.runGitCommand)({
            args: [
                `commit-tree`,
                `${nextCommit}^{tree}`,
                `-p`,
                currentBase,
                `-m`,
                `_`,
            ],
            onError: 'ignore',
            resource: 'mergeBaseCommitTree',
        });
        // Does a commit with these changes exist in trunk?
        const isMerged = (0, runner_1.runGitCommand)({
            args: [`cherry`, trunkName, testCommit, currentBase],
            onError: 'ignore',
            resource: 'isMerged',
        }).startsWith('-');
        // If so, move the base forward to nextCommit
        return isMerged ? nextCommit : currentBase;
    }, mergeBase);
    return lastMergedCommitSha === (0, get_sha_1.getSha)(branchName);
}
exports.isMerged = isMerged;
//# sourceMappingURL=is_merged.js.map