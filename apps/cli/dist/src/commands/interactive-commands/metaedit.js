"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {
    branch: {
        type: 'string',
        required: true,
        positional: true,
    },
    title: {
        type: 'string',
    },
    body: {
        type: 'string',
    },
};
exports.command = 'metaedit [branch]';
exports.canonical = 'interactive metaedit';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.engine.upsertPrInfo(argv.branch, {
            title: argv.title,
            body: argv.body,
        });
    });
};
exports.handler = handler;
//# sourceMappingURL=metaedit.js.map