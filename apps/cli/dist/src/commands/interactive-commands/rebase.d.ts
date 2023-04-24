import yargs from 'yargs';
declare const args: {
    readonly source: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
    readonly dest: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
};
export declare const command = "rebase [source] [dest]";
export declare const canonical = "interactive rebase";
export declare const description = false;
export declare const builder: {
    readonly source: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
    readonly dest: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
