import { TContext } from '../../lib/context';
import { TPRSubmissionInfo } from './submit_prs';
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
export declare function getPRInfoForBranches(args: {
    branchNames: string[];
    editPRFieldsInline: boolean | undefined;
    draft: boolean;
    publish: boolean;
    updateOnly: boolean;
    dryRun: boolean;
    reviewers: string | undefined;
    select: boolean;
}, context: TContext): Promise<TPRSubmissionInfo>;
