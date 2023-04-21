import { TCommitOpts } from '../git/commit';
import { TCommitFormat } from '../git/commit_range';
import { TGit } from '../git/git';
import { TSplog } from '../utils/splog';
import { TChangedFile, TStatusFile } from '../git/changed_files';
import { TBranchPRInfo } from './metadata_ref';
import { TScopeSpec } from './scope_spec';
export declare type TEngine = {
    debug: string;
    persist: () => void;
    clear: () => void;
    reset: (newTrunkName?: string) => void;
    rebuild: (newTrunkName?: string) => void;
    trunk: string;
    isTrunk: (branchName: string) => boolean;
    branchExists(branchName: string | undefined): branchName is string;
    allBranchNames: string[];
    isBranchTracked: (branchName: string) => boolean;
    isDescendantOf: (branchName: string, parentBranchName: string) => boolean;
    trackBranch: (branchName: string, parentBranchName: string) => void;
    untrackBranch: (branchName: string) => void;
    currentBranch: string | undefined;
    currentBranchPrecondition: string;
    rebaseInProgress: () => boolean;
    detectStagedChanges: () => boolean;
    findRemoteBranch: () => string | undefined;
    getUnmergedFiles: () => string[];
    getRebaseHead: () => string | undefined;
    getUnstagedChanges: () => string;
    getStatus: () => TStatusFile[];
    logLong: () => void;
    showCommits: (branchName: string, patch: boolean) => string;
    showDiff: (branchName: string) => string;
    getDiff: (left: string, right: string | undefined) => string;
    getStackDiff: (branchName: string) => string;
    getParentOrPrev: (branchName: string) => string;
    getChangedFiles: (branchName: string) => TChangedFile[];
    getFileContents: (ref: string, file: string) => string;
    restoreFile: (file: string) => void;
    getRevision: (branchName: string) => string;
    getBaseRevision: (branchName: string) => string;
    getAllCommits: (branchName: string, format: TCommitFormat) => string[];
    getCommitDate: (branchName: string) => Date;
    getCommitAuthor: (branchName: string) => string;
    getPrInfo: (branchName: string) => TBranchPRInfo | undefined;
    upsertPrInfo: (branchName: string, prInfo: Partial<TBranchPRInfo>) => void;
    clearPrInfo: (branchName: string) => void;
    getChildren: (branchName: string) => string[];
    setParent: (branchName: string, parentBranchName: string) => void;
    getParent: (branchName: string) => string | undefined;
    getParentPrecondition: (branchName: string) => string;
    getRelativeStack: (branchName: string, scope: TScopeSpec) => string[];
    checkoutNewBranch: (branchName: string) => void;
    checkoutBranch: (branchName: string) => void;
    renameCurrentBranch: (branchName: string) => void;
    foldCurrentBranch: (keep: boolean) => void;
    deleteBranch: (branchName: string) => void;
    commit: (opts: TCommitOpts) => void;
    squashCurrentBranch: (opts: {
        message?: string;
        noEdit?: boolean;
    }) => void;
    addAll: () => void;
    detach: () => void;
    unbranch: () => void;
    detachAndResetBranchChanges: () => void;
    applySplitToCommits: (args: {
        branchToSplit: string;
        branchNames: string[];
        branchPoints: number[];
    }) => void;
    forceCheckoutBranch: (branchToSplit: string) => void;
    restackBranch: (branchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE' | 'REBASE_UNNEEDED';
    };
    rebaseInteractive: (branchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE';
    };
    continueRebase: (parentBranchRevision: string) => {
        result: 'REBASE_DONE';
        branchName: string;
    } | {
        result: 'REBASE_CONFLICT';
    };
    abortRebase: () => void;
    isMergedIntoTrunk: (branchName: string) => boolean;
    isBranchFixed: (branchName: string) => boolean;
    isBranchEmpty: (branchName: string) => boolean;
    populateRemoteShas: () => Promise<void>;
    branchMatchesRemote: (branchName: string) => boolean;
    pushBranch: (branchName: string, forcePush: boolean) => void;
    pullTrunk: () => 'PULL_DONE' | 'PULL_UNNEEDED' | 'PULL_CONFLICT';
    hardReset: (sha?: string) => void;
    resetTrunkToRemote: () => void;
    clean: () => void;
    fetchBranch: (branchName: string, parentBranchName: string) => void;
    branchMatchesFetched: (branchName: string) => boolean;
    checkoutBranchFromFetched: (branchName: string, parentBranchName: string) => void;
    rebaseBranchOntoFetched: (branchName: string) => {
        result: 'REBASE_CONFLICT';
        rebasedBranchBase: string;
    } | {
        result: 'REBASE_DONE';
    };
};
export declare function composeEngine({ git, trunkName, currentBranchOverride, splog, noVerify, remote, restackCommitterDateIsAuthorDate, }: {
    git: TGit;
    trunkName?: string;
    currentBranchOverride?: string;
    splog: TSplog;
    noVerify: boolean;
    remote: string;
    restackCommitterDateIsAuthorDate?: boolean;
}): TEngine;
