import yargs from 'yargs';
declare const args: {
    readonly target: {
        readonly demandOption: true;
        readonly choices: readonly ["uncommitted", "head", "stack"];
        readonly positional: true;
        readonly describe: "What to diff against.";
    };
    readonly ref: {
        readonly type: "string";
        readonly describe: "Only respected for stack merge. The branch to show changes of.";
    };
};
export declare const command = "diff [target]";
export declare const canonical = "interactive diff";
export declare const description = false;
export declare const builder: {
    readonly target: {
        readonly demandOption: true;
        readonly choices: readonly ["uncommitted", "head", "stack"];
        readonly positional: true;
        readonly describe: "What to diff against.";
    };
    readonly ref: {
        readonly type: "string";
        readonly describe: "Only respected for stack merge. The branch to show changes of.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
