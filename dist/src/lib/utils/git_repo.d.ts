export declare class GitRepo {
    dir: string;
    userConfigPath: string;
    constructor(dir: string, opts?: {
        existingRepo?: boolean;
        repoUrl?: string;
    });
    runGitCommand(args: string[]): void;
    runCliCommand(command: string[], opts?: {
        cwd?: string;
    }): void;
    runGitCommandAndGetOutput(args: string[]): string;
    runCliCommandAndGetOutput(args: string[]): string;
    createChange(textValue: string, prefix?: string, unstaged?: boolean): void;
    createChangeAndCommit(textValue: string, prefix?: string): void;
    createChangeAndAmend(textValue: string, prefix?: string): void;
    deleteBranch(name: string): void;
    createPrecommitHook(contents: string): void;
    createAndCheckoutBranch(name: string): void;
    checkoutBranch(name: string): void;
    rebaseInProgress(): boolean;
    resolveMergeConflicts(): void;
    markMergeConflictsAsResolved(): void;
    currentBranchName(): string;
    getRef(refName: string): string;
    listCurrentBranchCommitMessages(): string[];
    mergeBranch(args: {
        branch: string;
        mergeIn: string;
    }): void;
    trackBranch(branch: string, parentBranch?: string): void;
}
