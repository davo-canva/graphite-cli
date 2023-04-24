"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'log';
exports.canonical = 'interactive log';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const commitInfos = await Promise.all(context.engine.allBranchNames.map((branchName) => {
            const prInfo = context.engine.getPrInfo(branchName);
            const parent = context.engine.getParent(branchName);
            const commitDate = context.engine.getCommitDate(branchName);
            const commitAuthor = context.engine.getCommitAuthor(branchName);
            const filesChanged = context.engine.getChangedFiles(branchName);
            return {
                branch: branchName,
                // Cache
                parents: parent ? [parent] : [],
                isHead: context.engine.currentBranch === branchName,
                partOfTrunk: context.engine.isMergedIntoTrunk(branchName) ||
                    context.engine.isTrunk(branchName),
                // Git
                author: commitAuthor,
                date: commitDate.toISOString(),
                // Files
                filesSample: filesChanged.map((file) => ({
                    path: file.path,
                    status: {
                        added: 'A',
                        modified: 'M',
                        deleted: 'R',
                        renamed: 'M',
                        copied: 'A',
                    }[file.status],
                })),
                totalFileCount: filesChanged.length,
                // PR
                title: prInfo?.title || '',
                description: prInfo?.body || '',
                pr: prInfo && prInfo.number
                    ? {
                        number: prInfo.number?.toString(),
                        isDraft: prInfo.isDraft || false,
                    }
                    : undefined,
            };
        }));
        context.splog.info(JSON.stringify(commitInfos));
    });
};
exports.handler = handler;
//# sourceMappingURL=log.js.map