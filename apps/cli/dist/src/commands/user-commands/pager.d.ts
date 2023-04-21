import yargs from 'yargs';
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly type: "string";
        readonly describe: "Set default pager for Graphite. e.g. --set \"less -FRX\".";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable pager for Graphite";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default pager for Graphite and default to git pager.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "pager";
export declare const description = "The pager opened by Graphite.";
export declare const canonical = "user pager";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly type: "string";
        readonly describe: "Set default pager for Graphite. e.g. --set \"less -FRX\".";
    };
    readonly disable: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Disable pager for Graphite";
    };
    readonly unset: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly describe: "Unset default pager for Graphite and default to git pager.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
