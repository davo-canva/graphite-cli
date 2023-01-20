"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeSplog = void 0;
/* eslint-disable no-console */
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const runner_1 = require("../git/runner");
function composeSplog(opts = {}) {
    return {
        newline: opts.quiet ? () => void 0 : () => console.log(),
        info: opts.quiet ? () => void 0 : (s) => console.log(s),
        debug: opts.outputDebugLogs
            ? (s) => console.log(chalk_1.default.dim(`${chalk_1.default.bold(`${new Date().toISOString()}:`)} ${s}`))
            : () => void 0,
        error: (s) => console.log(chalk_1.default.redBright(`ERROR: ${s}`)),
        warn: (s) => console.log(chalk_1.default.yellow(`WARNING: ${s}`)),
        message: (s) => console.log(chalk_1.default.yellow(`${chalk_1.default.yellow(s)}\n\n`)),
        tip: (s) => opts.tips && !opts.quiet
            ? console.log(chalk_1.default.gray([
                '',
                `${chalk_1.default.bold('tip')}: ${s}`,
                chalk_1.default.italic('Feeling expert? `gt user tips --disable`'),
                '',
            ].join('\n')))
            : () => void 0,
        page: (s) => {
            if (!opts.pager) {
                console.log(s);
                return;
            }
            try {
                (0, child_process_1.execSync)(`${opts.pager}`, {
                    input: s,
                    stdio: ['pipe', 'inherit', 'inherit'],
                    encoding: 'utf-8',
                    // match what git does for pager env vars
                    // https://github.com/git/git/blob/master/Documentation/config/core.txt#L550
                    env: { LESS: 'FRX', LV: '-c', ...process.env },
                });
            }
            catch (e) {
                if (e.status !== 0 || e.code !== 'EPIPE') {
                    console.log(s);
                    console.log(chalk_1.default.yellow(`NOTE: Tried to send output to your pager (${chalk_1.default.cyan(opts.pager)}) but encountered an error.\nYou can change your configured pager or disable paging: ${chalk_1.default.cyan(`gt user pager --help`)}`));
                    throw new runner_1.CommandFailedError({
                        command: opts.pager,
                        ...e,
                    });
                }
            }
        },
    };
}
exports.composeSplog = composeSplog;
//# sourceMappingURL=splog.js.map