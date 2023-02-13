"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAll = void 0;
const runner_1 = require("./runner");
function addAll() {
    (0, runner_1.runGitCommand)({
        args: ['add', '--all'],
        onError: 'throw',
        resource: 'addAll',
    });
}
exports.addAll = addAll;
//# sourceMappingURL=add_all.js.map