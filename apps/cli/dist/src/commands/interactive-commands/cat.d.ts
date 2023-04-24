import yargs from 'yargs';
declare const args: {
    readonly ref: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The ref to load the file from.";
    };
    readonly file: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The config to load.";
    };
};
export declare const command = "cat [ref] [file]";
export declare const canonical = "interactive cat";
export declare const description = false;
export declare const builder: {
    readonly ref: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The ref to load the file from.";
    };
    readonly file: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The config to load.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
