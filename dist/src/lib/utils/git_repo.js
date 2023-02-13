"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitRepo = void 0;
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const context_1 = require("../context");
const TEXT_FILE_NAME = 'test.txt';
// This class should only be used by tests and `gt demo`
class GitRepo {
    dir;
    userConfigPath;
    constructor(dir, opts) {
        this.dir = dir;
        this.userConfigPath = path_1.default.join(dir, '.git/.graphite_user_config');
        if (opts?.existingRepo) {
            return;
        }
        (0, child_process_1.spawnSync)('git', opts?.repoUrl ? [`clone`, opts.repoUrl, dir] : [`init`, dir, `-b`, `main`]);
    }
    runGitCommand(args) {
        (0, child_process_1.spawnSync)('git', args, {
            stdio: process.env.DEBUG ? 'inherit' : 'pipe',
            cwd: this.dir,
        });
    }
    runCliCommand(command, opts) {
        const result = (0, child_process_1.spawnSync)(process.argv[0], [
            path_1.default.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
            ...command,
        ], {
            stdio: process.env.DEBUG ? 'inherit' : 'pipe',
            cwd: opts?.cwd || this.dir,
            env: {
                ...process.env,
                [context_1.USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
                GRAPHITE_DISABLE_TELEMETRY: '1',
                GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
            },
        });
        if (result.status) {
            throw new Error([
                `command result: ${JSON.stringify(result)}`,
                'stdout:',
                result.stdout.toString(),
                'stderr:',
                result.stderr.toString(),
            ].join('\n'));
        }
    }
    runGitCommandAndGetOutput(args) {
        return ((0, child_process_1.spawnSync)('git', args, {
            encoding: 'utf-8',
            cwd: this.dir,
        }).stdout?.trim() ?? '');
    }
    runCliCommandAndGetOutput(args) {
        return ((0, child_process_1.spawnSync)(process.argv[0], [
            path_1.default.join(__dirname, `..`, `..`, `..`, `..`, `dist`, `src`, `index.js`),
            ...args,
        ], {
            encoding: 'utf-8',
            cwd: this.dir,
            env: {
                ...process.env,
                [context_1.USER_CONFIG_OVERRIDE_ENV]: this.userConfigPath,
                GRAPHITE_DISABLE_TELEMETRY: '1',
                GRAPHITE_DISABLE_UPGRADE_PROMPT: '1',
            },
        }).stdout?.trim() ?? '');
    }
    createChange(textValue, prefix, unstaged) {
        const filePath = path_1.default.join(`${this.dir}`, `${prefix ? prefix + '_' : ''}${TEXT_FILE_NAME}`);
        fs_extra_1.default.writeFileSync(filePath, textValue);
        if (!unstaged) {
            this.runGitCommand([`add`, filePath]);
        }
    }
    createChangeAndCommit(textValue, prefix) {
        this.createChange(textValue, prefix);
        this.runGitCommand([`add`, `.`]);
        this.runGitCommand([`commit`, `-m`, textValue]);
    }
    createChangeAndAmend(textValue, prefix) {
        this.createChange(textValue, prefix);
        this.runGitCommand([`add`, `.`]);
        this.runGitCommand([`commit`, `--amend`, `--no-edit`]);
    }
    deleteBranch(name) {
        this.runGitCommand([`branch`, `-D`, name]);
    }
    createPrecommitHook(contents) {
        fs_extra_1.default.mkdirpSync(`${this.dir}/.git/hooks`);
        fs_extra_1.default.writeFileSync(`${this.dir}/.git/hooks/pre-commit`, contents);
        (0, child_process_1.spawnSync)('chmod', [`+x`, `${this.dir}/.git/hooks/pre-commit`]);
    }
    createAndCheckoutBranch(name) {
        this.runGitCommand([`checkout`, `-b`, name]);
    }
    checkoutBranch(name) {
        this.runGitCommand([`checkout`, name]);
    }
    rebaseInProgress() {
        return fs_extra_1.default.existsSync(path_1.default.join(this.dir, '.git', 'rebase-merge'));
    }
    resolveMergeConflicts() {
        this.runGitCommand([`checkout`, `--theirs`, `.`]);
    }
    markMergeConflictsAsResolved() {
        this.runGitCommand([`add`, `.`]);
    }
    currentBranchName() {
        return this.runGitCommandAndGetOutput([`branch`, `--show-current`]);
    }
    getRef(refName) {
        return this.runGitCommandAndGetOutput([`show-ref`, `-s`, refName]);
    }
    listCurrentBranchCommitMessages() {
        return this.runGitCommandAndGetOutput([`log`, `--oneline`, `--format=%B`])
            .split('\n')
            .filter((l) => l.length > 0);
    }
    mergeBranch(args) {
        this.checkoutBranch(args.branch);
        this.runGitCommand([`merge`, args.mergeIn]);
    }
    trackBranch(branch, parentBranch) {
        return this.runCliCommand(['branch', 'track']
            .concat(parentBranch ? ['--parent', parentBranch] : [])
            .concat([branch]));
    }
}
exports.GitRepo = GitRepo;
//# sourceMappingURL=git_repo.js.map