export declare type TChangedFile = {
    path: string;
    status: 'added' | 'copied' | 'deleted' | 'modified' | 'renamed';
};
export declare type TStatusFile = {
    path: string;
    status: 'added' | 'copied' | 'deleted' | 'modified' | 'renamed' | 'unresolved' | 'untracked_added' | 'untracked_deleted';
};
