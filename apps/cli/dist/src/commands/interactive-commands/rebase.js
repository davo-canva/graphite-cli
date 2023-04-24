"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const current_branch_onto_1 = require("../../actions/current_branch_onto");
const runner_1 = require("../../lib/runner");
const args = {
    source: {
        type: 'string',
        required: true,
        positional: true,
    },
    dest: {
        type: 'string',
        required: true,
        positional: true,
    },
};
exports.command = 'rebase [source] [dest]';
exports.canonical = 'interactive rebase';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const current = context.engine.currentBranch;
        context.engine.checkoutBranch(argv.source);
        (0, current_branch_onto_1.currentBranchOnto)(argv.dest, context);
        current && context.engine.checkoutBranch(current);
    });
};
exports.handler = handler;
//# sourceMappingURL=rebase.js.map