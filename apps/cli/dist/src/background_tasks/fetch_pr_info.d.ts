import { TPRInfoToUpsert } from '../lib/api/pr_info';
import { TContext } from '../lib/context';
import { TRepoConfig } from '../lib/spiffy/repo_config_spf';
import { TUserConfig } from '../lib/spiffy/user_config_spf';
export declare function refreshPRInfoInBackground(context: TContext): void;
export declare function getPrInfoToUpsert({ userConfig, repoConfig, }: {
    userConfig: TUserConfig;
    repoConfig: TRepoConfig;
}): Promise<TPRInfoToUpsert>;
