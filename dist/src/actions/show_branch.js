"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchInfo = exports.showBranchInfo = void 0;
const chalk_1 = __importDefault(require("chalk"));
async function showBranchInfo(branchName, opts, context) {
    const output = getBranchInfo({ branchName }, context);
    const parentBranchName = context.metaCache.getParent(branchName);
    if (parentBranchName) {
        output.push(`${chalk_1.default.cyan('Parent')}: ${parentBranchName}`);
    }
    const children = context.metaCache.getChildren(branchName);
    if (children.length) {
        output.push(`${chalk_1.default.cyan('Children')}:`);
        output.concat(children.map((c) => `▸ ${c}`));
    }
    const body = opts.body && context.metaCache.getPrInfo(branchName)?.body;
    if (body) {
        output.push('');
        output.push(body);
    }
    output.push('');
    output.push(context.metaCache.showCommits(branchName, opts.patch && !opts.diff));
    if (opts.diff) {
        output.push('');
        output.push(context.metaCache.showDiff(branchName));
    }
    context.splog.page(output.join('\n'));
}
exports.showBranchInfo = showBranchInfo;
function getBranchInfo(args, context) {
    const prInfo = context.metaCache.isTrunk(args.branchName)
        ? undefined
        : context.metaCache.getPrInfo(args.branchName);
    const prTitleLine = getPRTitleLine(prInfo);
    const branchInfoLines = [
        `${args.displayAsCurrent
            ? chalk_1.default.cyan(`${args.branchName} (current)`)
            : chalk_1.default.blueBright(args.branchName)} ${context.metaCache.isBranchFixed(args.branchName)
            ? ''
            : chalk_1.default.yellow(`(needs restack)`)}`,
        `${chalk_1.default.dim(context.metaCache.getAllCommits(args.branchName, 'COMMITTER_DATE')[0] ??
            '')}`,
        ...(prTitleLine ? ['', prTitleLine] : []),
        ...(prInfo?.url ? [chalk_1.default.magenta(prInfo.url)] : []),
        '',
        ...(args.showCommitNames
            ? getCommitLines(args.branchName, args.showCommitNames === 'REVERSE', context)
            : []),
    ];
    return prInfo?.state === 'MERGED' || prInfo?.state === 'CLOSED'
        ? branchInfoLines.map((line) => chalk_1.default.dim.gray(line))
        : branchInfoLines;
}
exports.getBranchInfo = getBranchInfo;
function getPRTitleLine(prInfo) {
    if (!prInfo?.title || !prInfo?.number) {
        return undefined;
    }
    const prNumber = `PR #${prInfo.number}`;
    if (prInfo?.state === 'MERGED') {
        return `${prNumber} (Merged) ${prInfo.title}`;
    }
    else if (prInfo?.state === 'CLOSED') {
        return `${prNumber} (Abandoned) ${chalk_1.default.strikethrough(`${prInfo.title}`)}`;
    }
    else {
        return `${chalk_1.default.yellow(prNumber)} ${getPRState(prInfo)} ${prInfo.title}`;
    }
}
function getPRState(prInfo) {
    if (prInfo === undefined) {
        return '';
    }
    if (prInfo.isDraft) {
        return chalk_1.default.gray('(Draft)');
    }
    const reviewDecision = prInfo.reviewDecision;
    switch (reviewDecision) {
        case 'APPROVED':
            return chalk_1.default.green('(Approved)');
        case 'CHANGES_REQUESTED':
            return chalk_1.default.magenta('(Changes Requested)');
        case 'REVIEW_REQUIRED':
            return chalk_1.default.yellow('(Review Required)');
        default:
            // Intentional fallthrough - if there's no review decision, that means that
            // review isn't required and we can skip displaying a review status.
            return '';
    }
}
function getCommitLines(branchName, reverse, context) {
    const lines = context.metaCache
        .getAllCommits(branchName, 'READABLE')
        .map((line) => chalk_1.default.gray(line));
    return reverse ? lines.reverse() : lines;
}
//# sourceMappingURL=show_branch.js.map