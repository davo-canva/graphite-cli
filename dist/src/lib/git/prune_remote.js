"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneRemote = void 0;
const runner_1 = require("./runner");
function pruneRemote(remote) {
    (0, runner_1.runGitCommand)({
        args: [`remote`, `prune`, remote],
        onError: 'ignore',
        resource: 'pruneRemote',
    });
}
exports.pruneRemote = pruneRemote;
//# sourceMappingURL=prune_remote.js.map