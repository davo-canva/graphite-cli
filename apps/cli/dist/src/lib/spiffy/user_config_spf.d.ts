import * as t from '@withgraphite/retype';
declare const schema: (value: unknown, opts?: {
    logFailures: boolean;
} | undefined) => value is {
    authToken?: string | undefined;
    restackCommitterDateIsAuthorDate?: boolean | undefined;
    branchPrefix?: string | undefined;
    branchDate?: boolean | undefined;
    branchReplacement?: "" | "_" | "-" | undefined;
    tips?: boolean | undefined;
    editor?: string | undefined;
    pager?: string | undefined;
    submitIncludeCommitMessages?: boolean | undefined;
    alternativeProfiles?: ({
        authToken?: string | undefined;
    } & {
        name: string;
        hostPrefix: string;
    })[] | undefined;
} & {};
export declare type TProfile = Required<t.TypeOf<typeof schema>>['alternativeProfiles'][number];
export declare type TApiServerUrl = string;
export declare type TAppServerUrl = string;
export declare const DEFAULT_GRAPHITE_API_SERVER: TApiServerUrl;
export declare const DEFAULT_GRAPHITE_APP_SERVER: TAppServerUrl;
export declare const userConfigFactory: {
    load: (filePath?: string | undefined) => {
        readonly data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "_" | "-" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
            pager?: string | undefined;
            submitIncludeCommitMessages?: boolean | undefined;
            alternativeProfiles?: ({
                authToken?: string | undefined;
            } & {
                name: string;
                hostPrefix: string;
            })[] | undefined;
        } & {};
        readonly update: (mutator: (data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "_" | "-" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
            pager?: string | undefined;
            submitIncludeCommitMessages?: boolean | undefined;
            alternativeProfiles?: ({
                authToken?: string | undefined;
            } & {
                name: string;
                hostPrefix: string;
            })[] | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
        getApiServerUrl: () => TApiServerUrl;
        getAppServerUrl: () => TAppServerUrl;
        getAuthToken: () => string | undefined;
        getPager: () => string | undefined;
        execEditor: (editFilePath: string) => void;
    };
    loadIfExists: (filePath?: string | undefined) => ({
        readonly data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "_" | "-" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
            pager?: string | undefined;
            submitIncludeCommitMessages?: boolean | undefined;
            alternativeProfiles?: ({
                authToken?: string | undefined;
            } & {
                name: string;
                hostPrefix: string;
            })[] | undefined;
        } & {};
        readonly update: (mutator: (data: {
            authToken?: string | undefined;
            restackCommitterDateIsAuthorDate?: boolean | undefined;
            branchPrefix?: string | undefined;
            branchDate?: boolean | undefined;
            branchReplacement?: "" | "_" | "-" | undefined;
            tips?: boolean | undefined;
            editor?: string | undefined;
            pager?: string | undefined;
            submitIncludeCommitMessages?: boolean | undefined;
            alternativeProfiles?: ({
                authToken?: string | undefined;
            } & {
                name: string;
                hostPrefix: string;
            })[] | undefined;
        } & {}) => void) => void;
        readonly path: string;
        delete: () => void;
    } & {
        getEditor: () => string;
        getApiServerUrl: () => TApiServerUrl;
        getAppServerUrl: () => TAppServerUrl;
        getAuthToken: () => string | undefined;
        getPager: () => string | undefined;
        execEditor: (editFilePath: string) => void;
    }) | undefined;
};
export declare type TUserConfig = ReturnType<typeof userConfigFactory.load>;
export {};
