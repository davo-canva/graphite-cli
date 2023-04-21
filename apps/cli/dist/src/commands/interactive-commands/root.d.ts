import yargs from 'yargs';
declare const args: {
    readonly dotdir: {
        readonly type: "boolean";
        readonly default: false;
        readonly describe: "Point to the dotdir instead.";
    };
};
export declare const command = "root";
export declare const canonical = "interactive root";
export declare const description = false;
export declare const builder: {
    readonly dotdir: {
        readonly type: "boolean";
        readonly default: false;
        readonly describe: "Point to the dotdir instead.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
