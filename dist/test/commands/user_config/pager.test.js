"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const basic_scene_1 = require("../../lib/scenes/basic_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new basic_scene_1.BasicScene()]) {
    describe(`(${scene}): user pager`, function () {
        (0, configure_test_1.configureTest)(this, scene);
        it('Sanity check - can check pager', () => {
            (0, chai_1.expect)(() => scene.repo.runCliCommand([`user`, `pager`])).to.not.throw(Error);
        });
        it('Sanity check - can set pager', () => {
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([
                `user`,
                `pager`,
                `--set`,
                `less -FRX`,
            ])).to.equal('Pager set to less -FRX');
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `pager`])).to.equal('less -FRX');
        });
        it('Sanity check - can disable pager', () => {
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `pager`, `--disable`])).to.equal('Pager disabled');
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `pager`])).to.equal('Pager is disabled');
        });
        it('Sanity check - can unset pager', () => {
            process.env.TEST_GT_PAGER = 'less';
            (0, chai_1.expect)(scene.repo.runCliCommandAndGetOutput([`user`, `pager`, `--unset`])).to.equal('Pager preference erased. Defaulting to your git pager (currently less)');
        });
    });
}
//# sourceMappingURL=pager.test.js.map