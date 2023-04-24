"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const pr_templates_1 = require("../../lib/utils/pr_templates");
const fs_1 = __importDefault(require("fs"));
const args = {};
exports.command = 'templates';
exports.canonical = 'interactive templates';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const templateFiles = (0, pr_templates_1.getPRTemplateFilepaths)();
        context.splog.info(JSON.stringify(Object.fromEntries(templateFiles.map((templateFile) => {
            return [templateFile, fs_1.default.readFileSync(templateFile).toString()];
        }))));
    });
};
exports.handler = handler;
//# sourceMappingURL=templates.js.map