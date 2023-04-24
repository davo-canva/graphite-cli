"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrInfoToUpsert = exports.refreshPRInfoInBackground = void 0;
const pr_info_1 = require("../lib/api/pr_info");
const metadata_ref_1 = require("../lib/engine/metadata_ref");
const pr_info_spf_1 = require("../lib/spiffy/pr_info_spf");
const repo_config_spf_1 = require("../lib/spiffy/repo_config_spf");
const user_config_spf_1 = require("../lib/spiffy/user_config_spf");
const spawn_1 = require("../lib/utils/spawn");
function refreshPRInfoInBackground(context) {
    if (!context.repoConfig.graphiteInitialized()) {
        return;
    }
    const now = Date.now();
    const lastFetchedMs = context.repoConfig.data.lastFetchedPRInfoMs;
    const msInSecond = 1000;
    // rate limit refreshing PR info to once per minute
    if (lastFetchedMs === undefined || now - lastFetchedMs > 60 * msInSecond) {
        // do our potential write before we kick off the child process so that we
        // don't incur a possible race condition with the write
        context.repoConfig.update((data) => (data.lastFetchedPRInfoMs = now));
        (0, spawn_1.spawnDetached)(__filename);
    }
}
exports.refreshPRInfoInBackground = refreshPRInfoInBackground;
async function getPrInfoToUpsert({ userConfig, repoConfig, }) {
    const { authToken, repoName, repoOwner } = {
        authToken: userConfig.getAuthToken(),
        repoName: repoConfig.getRepoName(),
        repoOwner: repoConfig.getRepoOwner(),
    };
    if (!authToken || !repoName || !repoOwner) {
        return [];
    }
    const branchNamesWithExistingPrNumbers = Object.keys((0, metadata_ref_1.getMetadataRefList)()).map((branchName) => ({
        branchName,
        prNumber: (0, metadata_ref_1.readMetadataRef)(branchName)?.prInfo?.number,
    }));
    return await (0, pr_info_1.getPrInfoForBranches)(branchNamesWithExistingPrNumbers, {
        authToken,
        repoName,
        repoOwner,
    }, userConfig.getApiServerUrl());
}
exports.getPrInfoToUpsert = getPrInfoToUpsert;
async function refreshPRInfo() {
    try {
        const prInfoToUpsert = await getPrInfoToUpsert({
            userConfig: user_config_spf_1.userConfigFactory.load(),
            repoConfig: repo_config_spf_1.repoConfigFactory.load(),
        });
        pr_info_spf_1.prInfoConfigFactory
            .load()
            .update((data) => (data.prInfoToUpsert = prInfoToUpsert));
    }
    catch (err) {
        pr_info_spf_1.prInfoConfigFactory.load().delete();
    }
}
if (process.argv[1] === __filename) {
    void refreshPRInfo();
}
//# sourceMappingURL=fetch_pr_info.js.map