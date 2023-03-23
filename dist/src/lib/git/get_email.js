"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEmail = void 0;
const runner_1 = require("./runner");
function getUserEmail() {
    try {
        return (0, runner_1.runGitCommand)({
            args: [`config`, `user.email`],
            onError: 'ignore',
            resource: 'getUserEmail',
        });
    }
    catch {
        return undefined;
    }
}
exports.getUserEmail = getUserEmail;
//# sourceMappingURL=get_email.js.map