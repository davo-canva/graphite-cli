"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    file: {
        demandOption: true,
        type: 'string',
        positional: true,
        describe: 'The file to restore.',
    },
};
exports.command = 'restore [file]';
exports.canonical = 'interactive restore';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.engine.restoreFile(argv.file);
    });
};
exports.handler = handler;
//# sourceMappingURL=restore.js.map