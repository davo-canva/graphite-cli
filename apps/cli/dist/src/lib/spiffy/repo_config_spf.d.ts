export declare const repoConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            name?: string | undefined;
            remote?: string | undefined;
            owner?: string | undefined;
            trunk?: string | undefined;
            lastFetchedPRInfoMs?: number | undefined;
        } & {};
        readonly update: (mutator: (data: {
            name?: string | undefined;
            remote?: string | undefined;
            owner?: string | undefined;
            trunk?: string | undefined;
            lastFetchedPRInfoMs?: number | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        readonly setRemote: (remote: string) => void;
        readonly getRemote: () => string;
        readonly setTrunk: (trunk: string) => void;
        readonly graphiteInitialized: () => boolean;
        readonly getRepoOwner: () => string;
        readonly getRepoName: () => string;
    };
    loadIfExists: (filePath?: string | undefined) => ({
        readonly data: {
            name?: string | undefined;
            remote?: string | undefined;
            owner?: string | undefined;
            trunk?: string | undefined;
            lastFetchedPRInfoMs?: number | undefined;
        } & {};
        readonly update: (mutator: (data: {
            name?: string | undefined;
            remote?: string | undefined;
            owner?: string | undefined;
            trunk?: string | undefined;
            lastFetchedPRInfoMs?: number | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        readonly setRemote: (remote: string) => void;
        readonly getRemote: () => string;
        readonly setTrunk: (trunk: string) => void;
        readonly graphiteInitialized: () => boolean;
        readonly getRepoOwner: () => string;
        readonly getRepoName: () => string;
    }) | undefined;
};
/**
 * FROM ISL: https://github.com/facebook/sapling/blob/main/addons/isl-server/src/Repository.ts#L887-L914
 *
 * extract repo info from a remote url, typically for GitHub or GitHub Enterprise,
 * in various formats:
 * https://github.com/owner/repo
 * https://github.com/owner/repo.git
 * github.com:owner/repo.git
 * git@github.com:owner/repo.git
 * ssh:git@github.com:owner/repo.git
 * ssh://git@github.com/owner/repo.git
 * git+ssh:git@github.com:owner/repo.git
 *
 * or similar urls with GitHub Enterprise hostnames:
 * https://ghe.myCompany.com/owner/repo
 */
export declare function getOwnerAndNameFromURL(url: string): {
    name: string;
    owner: string;
} | null;
export declare type TRepoConfig = ReturnType<typeof repoConfigFactory.load>;
