"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.description = exports.command = void 0;
exports.command = 'interactive <command>';
exports.description = false;
const builder = function (yargs) {
    return yargs
        .commandDir('interactive-commands', {
        extensions: ['js'],
    })
        .strict()
        .demandCommand();
};
exports.builder = builder;
//# sourceMappingURL=interactive.js.map