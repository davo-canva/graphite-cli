"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.canonical = exports.description = exports.command = void 0;
const chalk_1 = __importDefault(require("chalk"));
const runner_1 = require("../../lib/runner");
const args = {
    set: {
        demandOption: false,
        type: 'string',
        describe: 'Set default pager for Graphite. e.g. --set "less -FRX".',
    },
    disable: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Disable pager for Graphite',
    },
    unset: {
        demandOption: false,
        default: false,
        type: 'boolean',
        describe: 'Unset default pager for Graphite and default to git pager.',
    },
};
exports.command = 'pager';
exports.description = 'The pager opened by Graphite.';
exports.canonical = 'user pager';
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphiteWithoutRepo)(argv, exports.canonical, async (context) => {
        if (argv.disable) {
            context.userConfig.update((data) => (data.pager = ''));
            context.splog.info(`Pager disabled`);
        }
        else if (argv.set) {
            context.userConfig.update((data) => (data.pager = argv.set));
            context.splog.info(`Pager set to ${chalk_1.default.cyan(argv.set)}`);
        }
        else if (argv.unset) {
            context.userConfig.update((data) => (data.pager = undefined));
            const currentPager = context.userConfig.getPager();
            context.splog.info(`Pager preference erased. Defaulting to your git pager (currently ${currentPager ? chalk_1.default.cyan(currentPager) : 'disabled'})`);
        }
        else {
            const currentPager = context.userConfig.getPager();
            !currentPager
                ? context.splog.info(`Pager is disabled`)
                : context.userConfig.data.pager
                    ? context.splog.info(chalk_1.default.cyan(context.userConfig.data.pager))
                    : context.splog.info(`Pager is not set. Graphite will use your git pager (currently ${chalk_1.default.cyan(currentPager)})`);
        }
    });
};
exports.handler = handler;
//# sourceMappingURL=pager.js.map