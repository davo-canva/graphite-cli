"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.canonical = exports.command = void 0;
const runner_1 = require("../../lib/runner");
const args = {};
exports.command = 'status';
exports.canonical = 'interactive status';
exports.description = false;
exports.builder = args;
const handler = async (argv) => {
    return (0, runner_1.graphite)(argv, exports.canonical, async (context) => {
        const statusFiles = context.engine.getStatus();
        const rebaseInProgress = context.engine.rebaseInProgress();
        const statusFilesForInteractive = statusFiles.map((file) => ({
            status: interactiveStatusFromStatus(file.status),
            path: file.path,
        }));
        const status = {
            conflicts: rebaseInProgress,
            files: statusFilesForInteractive,
        };
        context.splog.info(JSON.stringify(status));
    });
};
exports.handler = handler;
function interactiveStatusFromStatus(status) {
    if (status === 'unresolved') {
        return 'U';
    }
    if (status === 'untracked_added') {
        return '?';
    }
    if (status === 'untracked_deleted') {
        return '!';
    }
    if (status === 'added') {
        return 'A';
    }
    if (status === 'deleted') {
        return 'R';
    }
    return 'M';
}
//# sourceMappingURL=status.js.map