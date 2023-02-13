"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const tmp_1 = __importDefault(require("tmp"));
const runner_1 = require("../lib/runner");
const git_repo_1 = require("../lib/utils/git_repo");
const make_id_1 = require("../lib/utils/make_id");
exports.command = 'demo';
exports.canonical = 'demo';
exports.description = false;
const args = {};
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        const tmpDir = tmp_1.default.dirSync();
        context.splog.info(tmpDir.name);
        const repo = new git_repo_1.GitRepo(tmpDir.name);
        const id = (0, make_id_1.makeId)(8);
        repo.createChangeAndCommit('First commit');
        repo.createChangeAndCommit('Second commit');
        repo.runCliCommand(['repo', 'init', `--no-interactive`]);
        repo.createChange('[Product] Add review queue filter api');
        repo.runCliCommand([
            'branch',
            'create',
            `${id}-review_queue_api`,
            '-m',
            '[Product] Add review queue filter api',
        ]);
        repo.createChange('[Product] Add review queue filter server');
        repo.runCliCommand([
            'branch',
            'create',
            `${id}-review_queue_server`,
            '-m',
            '[Product] Add review queue filter server',
        ]);
        repo.createChange('[Product] Add review queue filter frontend');
        repo.runCliCommand([
            'branch',
            'create',
            `${id}-review_queue_frontend`,
            '-m',
            '[Product] Add review queue filter frontend',
        ]);
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Fix crashes on reload');
        repo.runCliCommand([
            'branch',
            'create',
            `${id}-fix_crash_on_reload`,
            '-m',
            '[Bug Fix] Fix crashes on reload',
        ]);
        repo.checkoutBranch('main');
        repo.createChange('[Bug Fix] Account for empty state');
        repo.runCliCommand([
            'branch',
            'create',
            `${id}-account_for_empty_state`,
            '-m',
            '[Bug Fix] Account for empty state',
        ]);
        repo.checkoutBranch('main');
        repo.runGitCommand([
            'remote',
            'add',
            'origin',
            'git@github.com:withgraphite/graphite-demo-repo.git',
        ]);
        repo.runGitCommand(['push', 'origin', 'main', '-f']);
    });
};
exports.handler = handler;
//# sourceMappingURL=demo.js.map