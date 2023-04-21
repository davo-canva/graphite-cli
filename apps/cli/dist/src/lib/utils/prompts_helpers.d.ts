import prompts from 'prompts';
export declare const suggest: (input: string, choices: prompts.Choice[]) => Promise<prompts.Choice[]>;
export declare const clearPromptResultLine: () => void;
