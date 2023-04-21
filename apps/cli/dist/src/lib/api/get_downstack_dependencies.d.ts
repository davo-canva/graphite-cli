import { TContext } from '../context';
import { TRepoParams } from './common_params';
export declare function getDownstackDependencies(args: {
    branchName: string;
    trunkName: string;
}, params: TRepoParams, context: TContext): Promise<string[]>;
