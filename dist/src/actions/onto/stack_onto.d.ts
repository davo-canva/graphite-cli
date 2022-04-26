import { TMergeConflictCallstack, TStackOntoBaseRebaseStackFrame, TStackOntoFixStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context/context';
import { Branch } from '../../wrapper-classes/branch';
export declare function stackOnto(opts: {
    currentBranch: Branch;
    onto: string;
    mergeConflictCallstack: TMergeConflictCallstack;
}, context: TContext): Promise<void>;
export declare function stackOntoBaseRebaseContinuation(frame: TStackOntoBaseRebaseStackFrame, mergeConflictCallstack: TMergeConflictCallstack, context: TContext): Promise<void>;
export declare function stackOntoFixContinuation(frame: TStackOntoFixStackFrame): Promise<void>;
