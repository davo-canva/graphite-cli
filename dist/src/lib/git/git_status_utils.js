"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedUncommittedChanges = exports.unstagedChanges = void 0;
const runner_1 = require("./runner");
function doChangesExist(args) {
    return ((0, runner_1.runGitCommand)({
        args,
        onError: 'throw',
        resource: 'doChangesExist',
    }).length > 0);
}
function unstagedChanges() {
    return doChangesExist([`ls-files`, `--others`, `--exclude-standard`]); // untracked changes only
}
exports.unstagedChanges = unstagedChanges;
function trackedUncommittedChanges() {
    return doChangesExist([`status`, `-uno`, `--porcelain=v1`]); // staged but uncommitted changes only
}
exports.trackedUncommittedChanges = trackedUncommittedChanges;
//# sourceMappingURL=git_status_utils.js.map