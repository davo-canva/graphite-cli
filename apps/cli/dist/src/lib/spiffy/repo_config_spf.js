"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerAndNameFromURL = exports.repoConfigFactory = void 0;
const t = __importStar(require("@withgraphite/retype"));
const errors_1 = require("../errors");
const runner_1 = require("../git/runner");
const spiffy_1 = require("./spiffy");
const schema = t.shape({
    owner: t.optional(t.string),
    name: t.optional(t.string),
    trunk: t.optional(t.string),
    remote: t.optional(t.string),
    lastFetchedPRInfoMs: t.optional(t.number),
});
exports.repoConfigFactory = (0, spiffy_1.spiffy)({
    schema,
    defaultLocations: [
        {
            relativePath: '.graphite_repo_config',
            relativeTo: 'REPO',
        },
    ],
    initialize: () => {
        return {};
    },
    helperFunctions: (data, update) => {
        return {
            setRemote: (remote) => {
                update((data) => (data.remote = remote));
            },
            getRemote: () => data.remote ?? 'origin',
            setTrunk: (trunk) => {
                update((data) => (data.trunk = trunk));
            },
            graphiteInitialized: () => !!data.trunk,
            getRepoOwner: () => {
                const configOwner = data.owner;
                if (configOwner) {
                    return configOwner;
                }
                const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
                if (inferredInfo?.repoOwner) {
                    return inferredInfo.repoOwner;
                }
                throw new errors_1.ExitFailedError("Could not determine the owner of this repo (e.g. 'withgraphite' in the repo 'withgraphite/graphite-cli'). Please run `gt repo owner --set <owner>` to manually set the repo owner.");
            },
            getRepoName: () => {
                if (data.name) {
                    return data.name;
                }
                const inferredInfo = inferRepoGitHubInfo(data.remote ?? 'origin');
                if (inferredInfo?.repoName) {
                    return inferredInfo.repoName;
                }
                throw new errors_1.ExitFailedError("Could not determine the name of this repo (e.g. 'graphite-cli' in the repo 'withgraphite/graphite-cli'). Please run `gt repo name --set <owner>` to manually set the repo name.");
            },
        };
    },
});
function inferRepoGitHubInfo(remote) {
    // This assumes the remote to fetch from is the same as the remote to push to.
    // If a user runs into this is not true, they can manually edit the repo config
    // file to overrule what our CLI tries to intelligently infer.
    const url = (0, runner_1.runGitCommand)({
        args: [`config`, `--get`, `remote.${remote}.url`],
        onError: 'ignore',
        resource: 'inferRepoGitHubInfo',
    });
    const inferError = new errors_1.ExitFailedError(`Failed to infer the owner and name of this repo from remote ${remote} "${url}". Please run \`gt repo owner --set <owner>\` and \`gt repo name --set <name>\` to manually set the repo owner/name. (e.g. in the repo 'withgraphite/graphite-cli', 'withgraphite' is the repo owner and 'graphite-cli' is the repo name)`);
    if (!url) {
        throw inferError;
    }
    const match = getOwnerAndNameFromURL(url);
    if (match === null) {
        throw inferError;
    }
    return {
        repoOwner: match.owner,
        repoName: match.name,
    };
}
/**
 * FROM ISL: https://github.com/facebook/sapling/blob/main/addons/isl-server/src/Repository.ts#L887-L914
 *
 * extract repo info from a remote url, typically for GitHub or GitHub Enterprise,
 * in various formats:
 * https://github.com/owner/repo
 * https://github.com/owner/repo.git
 * github.com:owner/repo.git
 * git@github.com:owner/repo.git
 * ssh:git@github.com:owner/repo.git
 * ssh://git@github.com/owner/repo.git
 * git+ssh:git@github.com:owner/repo.git
 *
 * or similar urls with GitHub Enterprise hostnames:
 * https://ghe.myCompany.com/owner/repo
 */
function getOwnerAndNameFromURL(url) {
    const match = /(?:https:\/\/(.*)\/|(?:git\+ssh:\/\/|ssh:\/\/)?(?:git@)?([^:/]*)[:/])([^/]+)\/(.+?)(?:\.git)?$/.exec(url);
    if (match == null) {
        return null;
    }
    const [, hostname1, hostname2, owner, repo] = match;
    void hostname1, hostname2;
    return { owner, name: repo };
}
exports.getOwnerAndNameFromURL = getOwnerAndNameFromURL;
//# sourceMappingURL=repo_config_spf.js.map