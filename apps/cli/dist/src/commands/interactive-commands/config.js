"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    config: {
        demandOption: true,
        type: 'string',
        positional: true,
        describe: 'The config to load.',
    },
};
exports.command = 'config [config]';
exports.canonical = 'interactive config';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        void context;
        throw new Error('Unimplemented');
    });
};
exports.handler = handler;
//# sourceMappingURL=config.js.map