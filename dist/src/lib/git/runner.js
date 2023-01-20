"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandKilledError = exports.CommandFailedError = exports.runGitCommand = exports.runGitCommandAndSplitLines = void 0;
const child_process_1 = require("child_process");
const cute_string_1 = require("../utils/cute_string");
const tracer_1 = require("../utils/tracer");
function runGitCommandAndSplitLines(params) {
    return runGitCommand(params)
        .split('\n')
        .filter((l) => l.length > 0);
}
exports.runGitCommandAndSplitLines = runGitCommandAndSplitLines;
function runGitCommand(params) {
    // Only measure if we're with an existing span.
    return params.resource && tracer_1.tracer.currentSpanId
        ? tracer_1.tracer.spanSync({
            name: 'spawnedCommand',
            resource: params.resource,
            meta: { runCommandArgs: (0, cute_string_1.cuteString)(params) },
        }, () => {
            return runGitCommandInternal(params);
        })
        : runGitCommandInternal(params);
}
exports.runGitCommand = runGitCommand;
function runGitCommandInternal(params) {
    const spawnSyncOutput = (0, child_process_1.spawnSync)('git', params.args, {
        ...params.options,
        encoding: 'utf-8',
        // 1MB should be enough to never have to worry about this
        maxBuffer: 1024 * 1024 * 1024,
        windowsHide: true,
    });
    // this is a syscall failure, not a command failure
    if (spawnSyncOutput.error) {
        throw spawnSyncOutput.error;
    }
    // if killed with a signal
    if (spawnSyncOutput.signal) {
        throw new CommandKilledError({
            command: 'git',
            args: params.args,
            signal: spawnSyncOutput.signal,
            stdout: spawnSyncOutput.stdout,
            stderr: spawnSyncOutput.stderr,
        });
    }
    // command succeeded, return output
    if (!spawnSyncOutput.status) {
        return spawnSyncOutput.stdout?.trim() || '';
    }
    // command failed but we ignore it
    if (params.onError === 'ignore') {
        return '';
    }
    throw new CommandFailedError({
        command: 'git',
        args: params.args,
        status: spawnSyncOutput.status,
        stdout: spawnSyncOutput.stdout,
        stderr: spawnSyncOutput.stderr,
    });
}
class CommandFailedError extends Error {
    constructor(failure) {
        super([
            failure.errno && failure.code
                ? `Command failed with error ${failure.code} (${failure.errno}), exit code ${failure.status}:`
                : `Command failed with error exit code ${failure.status}:`,
            [failure.command].concat(failure.args).join(' '),
            failure.stdout,
            failure.stderr,
        ].join('\n'));
        this.name = 'CommandFailed';
    }
}
exports.CommandFailedError = CommandFailedError;
class CommandKilledError extends Error {
    constructor(failure) {
        super([
            `Command killed with signal ${failure.signal}:`,
            [failure.command].concat(failure.args).join(' '),
            failure.stdout,
            failure.stderr,
        ].join('\n'));
        this.name = 'CommandKilled';
    }
}
exports.CommandKilledError = CommandKilledError;
//# sourceMappingURL=runner.js.map