import yargs from 'yargs';
declare const args: {};
export declare const command = "log";
export declare const canonical = "interactive log";
export declare const description = false;
export declare const builder: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
