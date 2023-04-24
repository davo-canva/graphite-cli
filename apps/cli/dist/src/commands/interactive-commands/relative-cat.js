"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const errors_1 = require("../../lib/errors");
const runner_1 = require("../../lib/runner");
const args = {
    target: {
        demandOption: true,
        choices: ['uncommitted', 'head', 'stack'],
        positional: true,
        describe: 'What to diff against.',
    },
    file: {
        demandOption: true,
        type: 'string',
        positional: true,
        describe: 'The config to load.',
    },
    ref: {
        type: 'string',
        describe: 'Only respected for stack merge. The branch to show changes of.',
    },
};
exports.command = 'relative-cat [target] [file]';
exports.canonical = 'interactive relative-cat';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        if (argv.target === 'uncommitted') {
            context.splog.info(context.engine.getFileContents('HEAD', argv.file));
            return;
        }
        if (argv.target === 'head') {
            context.splog.info(context.engine.getFileContents('HEAD~', argv.file));
            return;
        }
        if (argv.target === 'stack') {
            const current = argv.ref || context.engine.currentBranch;
            if (!current) {
                throw new errors_1.PreconditionsFailedError('Running stack diff when not on a branch and without passing --ref');
            }
            context.splog.info(context.engine.getFileContents(context.engine.getParentOrPrev(current), argv.file));
            return;
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=relative-cat.js.map