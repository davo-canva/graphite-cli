"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = exports.aliases = void 0;
const unbranch_1 = require("../../actions/unbranch");
const runner_1 = require("../../lib/runner");
const args = {};
exports.aliases = ['ub'];
exports.command = 'unbranch';
exports.canonical = 'branch unbranch';
exports.description = 'Delete the current branch but retain the state of files in the working tree.';
exports.builder = args;
const handler = async (argv) => (0, runner_1.graphite)(argv, exports.canonical, async (context) => (0, unbranch_1.unbranch)(context));
exports.handler = handler;
//# sourceMappingURL=unbranch.js.map