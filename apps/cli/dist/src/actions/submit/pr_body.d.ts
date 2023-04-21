import { TContext } from '../../lib/context';
export declare function getPRBody(args: {
    branchName: string;
    editPRFieldsInline: boolean | undefined;
}, context: TContext): Promise<string>;
export declare function editPRBody(initial: string, context: TContext): Promise<string>;
export declare function inferPRBody({ branchName, template }: {
    branchName: string;
    template?: string;
}, context: TContext): {
    inferredBody: string;
    skipDescription: string;
};
