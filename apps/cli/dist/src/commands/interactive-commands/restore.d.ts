import yargs from 'yargs';
declare const args: {
    readonly file: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The file to restore.";
    };
};
export declare const command = "restore [file]";
export declare const canonical = "interactive restore";
export declare const description = false;
export declare const builder: {
    readonly file: {
        readonly demandOption: true;
        readonly type: "string";
        readonly positional: true;
        readonly describe: "The file to restore.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
