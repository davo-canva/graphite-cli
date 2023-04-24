"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const fetch_pr_info_1 = require("../../background_tasks/fetch_pr_info");
const runner_1 = require("../../lib/runner");
const cute_string_1 = require("../../lib/utils/cute_string");
const args = {};
exports.command = 'sync';
exports.canonical = 'dev sync';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        context.splog.info((0, cute_string_1.cuteString)((0, fetch_pr_info_1.getPrInfoToUpsert)(context)));
    });
};
exports.handler = handler;
//# sourceMappingURL=sync.js.map