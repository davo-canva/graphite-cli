"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    ref: {
        demandOption: true,
        type: 'string',
        positional: true,
        describe: 'The ref to load the file from.',
    },
    file: {
        demandOption: true,
        type: 'string',
        positional: true,
        describe: 'The config to load.',
    },
};
exports.command = 'cat [ref] [file]';
exports.canonical = 'interactive cat';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.splog.info(context.engine.getFileContents(argv.ref, argv.file));
    });
};
exports.handler = handler;
//# sourceMappingURL=cat.js.map