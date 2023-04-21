"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeGetRemoteSha = exports.getSha = exports.getShaOrThrow = void 0;
const runner_1 = require("./runner");
function getShaOrThrow(ref) {
    return (0, runner_1.runGitCommand)({
        args: [`rev-parse`, ref],
        onError: 'throw',
        resource: 'getShaOrThrow',
    });
}
exports.getShaOrThrow = getShaOrThrow;
function getSha(ref) {
    return (0, runner_1.runGitCommand)({
        args: [`rev-parse`, ref],
        onError: 'ignore',
        resource: 'getSha',
    });
}
exports.getSha = getSha;
function composeGetRemoteSha() {
    let remoteShas = undefined;
    const populateRemoteShas = async (remote) => new Promise((resolve) => {
        remoteShas = fetchRemoteShas(remote);
        resolve();
    });
    const getRemoteSha = (branchName) => remoteShas?.[branchName];
    return { populateRemoteShas, getRemoteSha };
}
exports.composeGetRemoteSha = composeGetRemoteSha;
function fetchRemoteShas(remote) {
    const remoteShas = {};
    (0, runner_1.runGitCommandAndSplitLines)({
        args: [`ls-remote`, '--heads', remote],
        onError: 'ignore',
        resource: 'fetchRemoteShas',
    })
        // sample line of output
        // 7edb7094e4c66892d783c1effdd106df277a860e        refs/heads/main
        .map((line) => line.split(/\s+/))
        .filter((lineSplit) => lineSplit.length === 2 &&
        lineSplit.every((s) => s.length > 0) &&
        lineSplit[1].startsWith('refs/heads/'))
        .forEach(([sha, ref]) => (remoteShas[ref.slice('refs/heads/'.length)] = sha));
    return remoteShas;
}
//# sourceMappingURL=get_sha.js.map