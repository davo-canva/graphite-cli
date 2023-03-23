"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const prompts_1 = __importDefault(require("prompts"));
const reviewers_1 = require("../../../src/actions/submit/reviewers");
(0, chai_1.use)(chai_as_promised_1.default);
describe('reviewers.ts unit tests', function () {
    it('should return empty list when the value of reviewers is undefined', async () => {
        await (0, chai_1.expect)((0, reviewers_1.getReviewers)(undefined)).to.eventually.eql([]);
    });
    it('should prompt for reviewers when the value of reviewers is empty', async () => {
        prompts_1.default.inject([['user1', 'user2']]);
        await (0, chai_1.expect)((0, reviewers_1.getReviewers)('')).to.eventually.eql(['user1', 'user2']);
    });
    it('should parse reviewers when the value of reviewers is a string', async () => {
        await (0, chai_1.expect)((0, reviewers_1.getReviewers)('user1,user2')).to.eventually.eql([
            'user1',
            'user2',
        ]);
        // Test can handle extra spaces
        await (0, chai_1.expect)((0, reviewers_1.getReviewers)('user3, user4')).to.eventually.eql([
            'user3',
            'user4',
        ]);
    });
});
//# sourceMappingURL=reviewers.test.js.map