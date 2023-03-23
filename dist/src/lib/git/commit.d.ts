export declare type TCommitOpts = {
    amend?: boolean;
    message?: string;
    noEdit?: boolean;
    edit?: boolean;
    patch?: boolean;
};
export declare function commit(opts: TCommitOpts & {
    noVerify: boolean;
}): void;
