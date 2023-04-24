"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbranch = void 0;
const chalk_1 = __importDefault(require("chalk"));
const errors_1 = require("../lib/errors");
function unbranch(context) {
    const currentBranchName = context.engine.currentBranchPrecondition;
    const parentBranchName = context.engine.getParentPrecondition(currentBranchName);
    if (context.engine.getChildren(currentBranchName).length > 0) {
        throw new errors_1.ExitFailedError(`Can't unbranch a branch with children!`);
    }
    context.engine.unbranch();
    context.splog.info(`Unbranched ${chalk_1.default.red(currentBranchName)}. Now on ${chalk_1.default.blueBright(parentBranchName)}.`);
}
exports.unbranch = unbranch;
//# sourceMappingURL=unbranch.js.map