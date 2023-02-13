/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
export declare function runGitCommandAndSplitLines(params: TRunGitCommandParameters): string[];
export declare function runGitCommand(params: TRunGitCommandParameters): string;
export declare type TRunGitCommandParameters = {
    args: string[];
    options?: Omit<SpawnSyncOptions, 'encoding' | 'maxBuffer'>;
    onError: 'throw' | 'ignore';
    resource: string | null;
};
export declare class CommandFailedError extends Error {
    constructor(failure: {
        command: string;
        args: string[];
        status: number;
        errno?: number;
        code?: string;
        stdout: string;
        stderr: string;
    });
}
export declare class CommandKilledError extends Error {
    constructor(failure: {
        command: string;
        args: string[];
        signal: string;
        stdout: string;
        stderr: string;
    });
}
