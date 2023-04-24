import yargs from 'yargs';
declare const args: {
    readonly config: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The config to load.";
    };
};
export declare const command = "config [config]";
export declare const canonical = "interactive config";
export declare const description = false;
export declare const builder: {
    readonly config: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The config to load.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
