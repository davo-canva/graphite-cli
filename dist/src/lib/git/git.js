"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeGit = void 0;
const add_all_1 = require("./add_all");
const branch_ops_1 = require("./branch_ops");
const commit_1 = require("./commit");
const commit_range_1 = require("./commit_range");
const commit_tree_1 = require("./commit_tree");
const diff_1 = require("./diff");
const fetch_branch_1 = require("./fetch_branch");
const find_remote_branch_1 = require("./find_remote_branch");
const get_email_1 = require("./get_email");
const get_sha_1 = require("./get_sha");
const git_editor_1 = require("./git_editor");
const git_status_utils_1 = require("./git_status_utils");
const is_merged_1 = require("./is_merged");
const log_1 = require("./log");
const merge_base_1 = require("./merge_base");
const merge_conflict_help_1 = require("./merge_conflict_help");
const prune_remote_1 = require("./prune_remote");
const pull_branch_1 = require("./pull_branch");
const push_branch_1 = require("./push_branch");
const rebase_1 = require("./rebase");
const rebase_in_progress_1 = require("./rebase_in_progress");
const reset_branch_1 = require("./reset_branch");
const set_remote_tracking_1 = require("./set_remote_tracking");
const show_commits_1 = require("./show_commits");
const sorted_branch_names_1 = require("./sorted_branch_names");
function composeGit() {
    return composeGitInternal();
}
exports.composeGit = composeGit;
function composeGitInternal() {
    return {
        ...(0, get_sha_1.composeGetRemoteSha)(),
        addAll: add_all_1.addAll,
        getCurrentBranchName: branch_ops_1.getCurrentBranchName,
        moveBranch: branch_ops_1.moveBranch,
        deleteBranch: branch_ops_1.deleteBranch,
        switchBranch: branch_ops_1.switchBranch,
        forceCheckoutNewBranch: branch_ops_1.forceCheckoutNewBranch,
        forceCreateBranch: branch_ops_1.forceCreateBranch,
        getCommitRange: commit_range_1.getCommitRange,
        getCommitTree: commit_tree_1.getCommitTree,
        commit: commit_1.commit,
        detectStagedChanges: diff_1.detectStagedChanges,
        getUnstagedChanges: diff_1.getUnstagedChanges,
        showDiff: diff_1.showDiff,
        isDiffEmpty: diff_1.isDiffEmpty,
        fetchBranch: fetch_branch_1.fetchBranch,
        readFetchHead: fetch_branch_1.readFetchHead,
        readFetchBase: fetch_branch_1.readFetchBase,
        writeFetchBase: fetch_branch_1.writeFetchBase,
        findRemoteBranch: find_remote_branch_1.findRemoteBranch,
        getUserEmail: get_email_1.getUserEmail,
        getShaOrThrow: get_sha_1.getShaOrThrow,
        getSha: get_sha_1.getSha,
        getGitEditor: git_editor_1.getGitEditor,
        getGitPager: git_editor_1.getGitPager,
        unstagedChanges: git_status_utils_1.unstagedChanges,
        trackedUncommittedChanges: git_status_utils_1.trackedUncommittedChanges,
        isMerged: is_merged_1.isMerged,
        logLong: log_1.logLong,
        getMergeBase: merge_base_1.getMergeBase,
        getUnmergedFiles: merge_conflict_help_1.getUnmergedFiles,
        getRebaseHead: merge_conflict_help_1.getRebaseHead,
        pruneRemote: prune_remote_1.pruneRemote,
        showCommits: show_commits_1.showCommits,
        pullBranch: pull_branch_1.pullBranch,
        pushBranch: push_branch_1.pushBranch,
        rebaseInProgress: rebase_in_progress_1.rebaseInProgress,
        rebase: rebase_1.rebase,
        rebaseContinue: rebase_1.rebaseContinue,
        rebaseAbort: rebase_1.rebaseAbort,
        rebaseInteractive: rebase_1.rebaseInteractive,
        softReset: reset_branch_1.softReset,
        trackedReset: reset_branch_1.trackedReset,
        setRemoteTracking: set_remote_tracking_1.setRemoteTracking,
        getBranchNamesAndRevisions: sorted_branch_names_1.getBranchNamesAndRevisions,
    };
}
//# sourceMappingURL=git.js.map