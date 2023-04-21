"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const path_1 = __importDefault(require("path"));
const preconditions_1 = require("../../lib/preconditions");
const runner_1 = require("../../lib/runner");
const args = {
    dotdir: {
        type: 'boolean',
        default: false,
        describe: 'Point to the dotdir instead.',
    },
};
exports.command = 'root';
exports.canonical = 'interactive root';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const root = argv.dotdir
            ? (0, preconditions_1.getRepoRootPathPrecondition)()
            : (0, preconditions_1.currentGitRepoPrecondition)();
        context.splog.info(path_1.default.resolve(root));
    });
};
exports.handler = handler;
//# sourceMappingURL=root.js.map