import { TContext } from '../../lib/context';
import { TScopeSpec } from '../../lib/engine/scope_spec';
export declare function submitAction(args: {
    scope: TScopeSpec;
    editPRFieldsInline: boolean | undefined;
    draft: boolean;
    publish: boolean;
    dryRun: boolean;
    updateOnly: boolean;
    reviewers: string | undefined;
    confirm: boolean;
    forcePush: boolean;
    select: boolean;
}, context: TContext): Promise<void>;
