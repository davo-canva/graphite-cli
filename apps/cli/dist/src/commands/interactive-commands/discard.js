"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'discard';
exports.canonical = 'interactive discard';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.engine.hardReset();
    });
};
exports.handler = handler;
//# sourceMappingURL=discard.js.map