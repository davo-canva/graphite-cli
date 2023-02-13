"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const all_scenes_1 = require("../../lib/scenes/all_scenes");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of all_scenes_1.allScenes) {
    describe('(${scene}): continue', function () {
        (0, configure_test_1.configureTest)(this, scene);
        beforeEach(function () {
            scene.repo.createAndCheckoutBranch('a');
            scene.repo.trackBranch('a', 'main');
            scene.repo.createChangeAndCommit('a1');
            scene.repo.createAndCheckoutBranch('b');
            scene.repo.trackBranch('b', 'a');
            scene.repo.createChangeAndCommit('b1');
            scene.repo.checkoutBranch('a');
            scene.repo.createChangeAndCommit('a2');
        });
        describe('While not during a rebase', function () {
            it('Will error', () => {
                (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
            });
        });
        describe('During a git initiated rebase', function () {
            beforeEach(function () {
                scene.repo.checkoutBranch('b');
                scene.repo.runGitCommand(['rebase', 'a']);
            });
            it('Stops during a rebase', function () {
                (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            });
            it('Will not continue', () => {
                (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
            });
            describe('After resolving conflict', function () {
                beforeEach(function () {
                    scene.repo.resolveMergeConflicts();
                    scene.repo.markMergeConflictsAsResolved();
                });
                it('Will not continue', () => {
                    (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
                });
            });
        });
        describe('During a Grahite initiated rebase', function () {
            beforeEach(function () {
                scene.repo.checkoutBranch('b');
                (0, chai_1.expect)(() => scene.repo.runCliCommand(['stack', 'restack'])).to.throw();
            });
            it('Stops during a rebase conflict', function () {
                (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.true;
            });
            it('Will not continue without resolving conflict', function () {
                (0, chai_1.expect)(() => scene.repo.runCliCommand(['continue'])).to.throw();
            });
            describe('After resolving conflict and continuing', function () {
                beforeEach(function () {
                    scene.repo.resolveMergeConflicts();
                    scene.repo.markMergeConflictsAsResolved();
                    scene.repo.runCliCommand(['continue']);
                });
                it('Lands on the restacked branch', function () {
                    (0, chai_1.expect)(scene.repo.currentBranchName()).to.equal('b');
                });
                it('No longer is in a rebase', function () {
                    (0, chai_1.expect)(scene.repo.rebaseInProgress()).to.be.false;
                });
            });
        });
    });
}
//# sourceMappingURL=continue.test.js.map