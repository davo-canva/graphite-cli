export declare function getShaOrThrow(ref: string): string;
export declare function getSha(ref: string): string;
export declare function composeGetRemoteSha(): {
    populateRemoteShas: (remote: string) => Promise<void>;
    getRemoteSha: (branchName: string) => string | undefined;
};
