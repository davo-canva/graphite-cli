"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const sync_1 = require("../../actions/sync/sync");
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'pulltrunk';
exports.canonical = 'interactive pulltrunk';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        await (0, sync_1.pullTrunk)(true, context);
    });
};
exports.handler = handler;
//# sourceMappingURL=pulltrunk.js.map