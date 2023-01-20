"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRInfoForBranches = void 0;
const chalk_1 = __importDefault(require("chalk"));
const pr_body_1 = require("./pr_body");
const pr_draft_1 = require("./pr_draft");
const pr_title_1 = require("./pr_title");
const reviewers_1 = require("./reviewers");
/**
 * For now, we only allow users to update the following PR properties which
 * necessitate a PR update:
 * - the PR base
 * - the PR's code contents
 * - the PR's title
 * - the PR's body
 *
 * Therefore, we should only update the PR iff either of these properties
 * differ from our stored data on the previous PR submission.
 */
async function getPRInfoForBranches(args, context) {
    const submissionInfo = [];
    for await (const branchName of args.branchNames) {
        const action = await getPRAction({
            branchName,
            updateOnly: args.updateOnly,
            draft: args.draft,
            publish: args.publish,
            dryRun: args.dryRun,
            select: args.select,
            editPRFieldsInline: args.editPRFieldsInline,
        }, context);
        if (!action) {
            continue;
        }
        const parentBranchName = context.metaCache.getParentPrecondition(action.branchName);
        submissionInfo.push({
            head: action.branchName,
            headSha: context.metaCache.getRevision(action.branchName),
            base: parentBranchName,
            baseSha: context.metaCache.getRevision(parentBranchName),
            ...(action.update
                ? {
                    action: 'update',
                    prNumber: action.prNumber,
                    ...(await getPRUpdateInfo({
                        branchName: action.branchName,
                        editPRFieldsInline: args.editPRFieldsInline,
                        draft: args.draft,
                        publish: args.publish,
                        reviewers: args.reviewers,
                    }, context)),
                }
                : {
                    action: 'create',
                    ...(await getPRCreationInfo({
                        branchName: action.branchName,
                        editPRFieldsInline: args.editPRFieldsInline,
                        draft: args.draft,
                        publish: args.publish,
                        reviewers: args.reviewers,
                    }, context)),
                }),
        });
    }
    context.splog.newline();
    return submissionInfo;
}
exports.getPRInfoForBranches = getPRInfoForBranches;
async function getPRAction(args, context) {
    // The branch here should always have a parent - above, the branches we've
    // gathered should exclude trunk which ensures that every branch we're submitting
    // a PR for has a valid parent.
    const parentBranchName = context.metaCache.getParentPrecondition(args.branchName);
    const prInfo = context.metaCache.getPrInfo(args.branchName);
    const prNumber = prInfo?.number;
    const status = prNumber === undefined
        ? args.updateOnly
            ? 'NOOP'
            : 'CREATE'
        : parentBranchName !== prInfo?.base
            ? 'RESTACK'
            : !context.metaCache.branchMatchesRemote(args.branchName) ||
                args.editPRFieldsInline
                ? 'CHANGE'
                : args.draft === true && prInfo.isDraft !== true
                    ? 'DRAFT'
                    : args.publish === true && prInfo.isDraft !== false
                        ? 'PUBLISH'
                        : 'NOOP';
    context.splog.info({
        NOOP: `▸ ${chalk_1.default.gray(args.branchName)} (No-op)`,
        CREATE: `▸ ${chalk_1.default.cyan(args.branchName)} (Create)`,
        RESTACK: `▸ ${chalk_1.default.cyan(args.branchName)} (New parent)`,
        CHANGE: `▸ ${chalk_1.default.cyan(args.branchName)} (Update)`,
        DRAFT: `▸ ${chalk_1.default.blueBright(args.branchName)} (Mark as draft)`,
        PUBLISH: `▸ ${chalk_1.default.blueBright(args.branchName)} (Ready for review)`,
    }[status]);
    return args.dryRun || status === 'NOOP'
        ? undefined
        : {
            branchName: args.branchName,
            ...(prNumber === undefined
                ? { update: false }
                : { update: true, prNumber }),
        };
}
async function getPRCreationInfo(args, context) {
    if (args.editPRFieldsInline) {
        context.splog.newline();
        context.splog.info(`Enter info for new pull request for ${chalk_1.default.cyan(args.branchName)} ▸ ${chalk_1.default.blueBright(context.metaCache.getParentPrecondition(args.branchName))}:`);
    }
    const submitInfo = {};
    try {
        submitInfo.title = await (0, pr_title_1.getPRTitle)({
            branchName: args.branchName,
            editPRFieldsInline: args.editPRFieldsInline,
        }, context);
        submitInfo.body = await (0, pr_body_1.getPRBody)({
            branchName: args.branchName,
            editPRFieldsInline: args.editPRFieldsInline,
        }, context);
    }
    finally {
        // Save locally in case this command fails
        context.metaCache.upsertPrInfo(args.branchName, submitInfo);
    }
    const reviewers = await (0, reviewers_1.getReviewers)(args.reviewers);
    const createAsDraft = args.publish
        ? false
        : args.draft || !context.interactive
            ? true
            : await (0, pr_draft_1.getPRDraftStatus)(context);
    return {
        title: submitInfo.title,
        body: submitInfo.body,
        reviewers,
        draft: createAsDraft,
    };
}
async function getPRUpdateInfo(args, context) {
    const submitInfo = {};
    if (args.editPRFieldsInline) {
        context.splog.newline();
        context.splog.info(`Enter updated info for pull request for ${chalk_1.default.cyan(args.branchName)} ▸ ${chalk_1.default.blueBright(context.metaCache.getParentPrecondition(args.branchName))}:`);
        try {
            submitInfo.title = await (0, pr_title_1.getPRTitle)({
                branchName: args.branchName,
                editPRFieldsInline: args.editPRFieldsInline,
            }, context);
            const prInfo = context.metaCache.getPrInfo(args.branchName);
            if (prInfo === undefined) {
                context.splog.warn('Cannot find existing PR body; starting from scratch');
            }
            const body = prInfo?.body || '';
            submitInfo.body = await (0, pr_body_1.editPRBody)(body, context);
        }
        finally {
            // Save locally in case this command fails
            context.metaCache.upsertPrInfo(args.branchName, submitInfo);
        }
    }
    const reviewers = await (0, reviewers_1.getReviewers)(args.reviewers);
    const draft = args.draft ? true : args.publish ? false : undefined;
    return {
        title: submitInfo.title,
        body: submitInfo.body,
        reviewers,
        draft,
    };
}
//# sourceMappingURL=prepare_branches.js.map