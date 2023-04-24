/**
 * Returns OK if the branch was fast-forwarded successfully
 * Returns CONFLICT if it could not be fast-forwarded
 */
export declare function pullBranch(remote: string, branchName: string): 'OK' | 'CONFLICT';
