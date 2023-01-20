export declare class ExitFailedError extends Error {
    constructor(message: string);
}
export declare class RebaseConflictError extends Error {
    constructor();
}
export declare class PreconditionsFailedError extends Error {
    constructor(message: string);
}
export declare class ConcurrentExecutionError extends Error {
    constructor();
}
export declare class DetachedError extends Error {
    constructor(extraMsg?: string);
}
export declare class NoBranchError extends Error {
    constructor(branchName: string);
}
export declare class UntrackedBranchError extends Error {
    constructor(branchName: string);
}
export declare class BadTrunkOperationError extends Error {
    constructor();
}
export declare class KilledError extends Error {
    constructor();
}
export declare class BlockedDuringRebaseError extends Error {
    constructor();
}
export declare class NoGraphiteContinue extends Error {
    constructor(didYouMean?: string);
}
