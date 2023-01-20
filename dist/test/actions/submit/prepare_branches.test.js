"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const prompts_1 = __importDefault(require("prompts"));
const prepare_branches_1 = require("../../../src/actions/submit/prepare_branches");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
const fs_extra_1 = __importDefault(require("fs-extra"));
(0, chai_1.use)(chai_as_promised_1.default);
const scene = new basic_scene_1.BasicScene();
describe(`(${scene}): correctly get PR information for branches`, function () {
    (0, configure_test_1.configureTest)(this, scene);
    // TODO: Add more tests for different scenarios
    it('should be able to update PR title and body if editPRFieldsInline is set', async () => {
        const title = 'Test Title';
        const body = 'Test body';
        const message = `${title}\n\n${body}`;
        scene.repo.createChange('a');
        scene.repo.runCliCommand([`branch`, `create`, `a`, `-m`, message]);
        const context = scene.getContext();
        const updatedTitle = 'updatedTitle';
        prompts_1.default.inject([updatedTitle]);
        const updatedBody = 'updatedBody';
        // Skip editor and inject the updated body
        context.userConfig.execEditor = function (editFilePath) {
            fs_extra_1.default.writeFileSync(editFilePath, updatedBody);
        };
        // Pretend the stack has been submitted
        context.metaCache.getPrInfo = function (_branchName) {
            return {
                number: 1,
            };
        };
        await (0, chai_1.expect)((0, prepare_branches_1.getPRInfoForBranches)({
            branchNames: ['a'],
            editPRFieldsInline: true,
            draft: false,
            publish: true,
            updateOnly: false,
            dryRun: false,
            reviewers: undefined,
            select: false,
        }, context)).to.eventually.satisfy((info) => {
            if (info.length !== 1) {
                return false;
            }
            const datum = info[0];
            return (datum.action === 'update' &&
                datum.title === updatedTitle &&
                datum.body === updatedBody);
        });
    });
});
//# sourceMappingURL=prepare_branches.test.js.map