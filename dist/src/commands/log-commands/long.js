"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.canonical = exports.aliases = exports.builder = exports.description = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'long';
exports.description = 'Display a graph of the commit ancestry of all branches.';
exports.builder = args;
exports.aliases = ['l'];
exports.canonical = 'log long';
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => context.metaCache.logLong());
exports.handler = handler;
//# sourceMappingURL=long.js.map