"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'purge';
exports.canonical = 'interactive purge';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.engine.clean();
    });
};
exports.handler = handler;
//# sourceMappingURL=purge.js.map