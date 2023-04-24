import yargs from 'yargs';
declare const args: {
    readonly branch: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
    readonly title: {
        readonly type: "string";
    };
    readonly body: {
        readonly type: "string";
    };
};
export declare const command = "metaedit [branch]";
export declare const canonical = "interactive metaedit";
export declare const description = false;
export declare const builder: {
    readonly branch: {
        readonly type: "string";
        readonly required: true;
        readonly positional: true;
    };
    readonly title: {
        readonly type: "string";
    };
    readonly body: {
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
