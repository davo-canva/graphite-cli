"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const tmp_1 = __importDefault(require("tmp"));
const fs = __importStar(require("fs-extra"));
const user_config_spf_1 = require("../../../src/lib/spiffy/user_config_spf");
// Test cases for userConfigFactory with a focus on the profile helper functions.
describe('userConfigFactory', () => {
    let originalEnv;
    let configPath;
    let tmpDir;
    beforeEach(() => {
        originalEnv = { ...process.env };
        tmpDir = tmp_1.default.dirSync();
        configPath = `${tmpDir.name}/config.json`;
    });
    afterEach(() => {
        Object.assign(process.env, originalEnv);
        fs.removeSync(configPath);
        fs.emptyDirSync(tmpDir.name);
        tmpDir.removeCallback();
    });
    const testCases = [
        {
            // Default profile case.
            envVars: {},
            profile: {
                alternativeProfiles: [
                    {
                        name: 'default',
                        hostPrefix: 'prod',
                        authToken: '123',
                    },
                ],
            },
            results: {
                apiServer: 'https://api.prod.graphite.dev/v1',
                appServer: 'https://app.prod.graphite.dev',
                authToken: '123',
            },
        },
        {
            // Case with no alternative profiles.
            envVars: {},
            profile: {
                authToken: '123',
            },
            results: {
                apiServer: 'https://api.graphite.dev/v1',
                appServer: 'https://app.graphite.dev',
                authToken: '123',
            },
        },
        {
            // Case testing a staging profile.
            envVars: { GRAPHITE_PROFILE: 'STAGING' },
            profile: {
                alternativeProfiles: [
                    {
                        name: 'STAGING',
                        hostPrefix: 'stg',
                        authToken: '234',
                    },
                ],
            },
            results: {
                apiServer: 'https://api.stg.graphite.dev/v1',
                appServer: 'https://app.stg.graphite.dev',
                authToken: '234',
            },
        },
    ];
    testCases.forEach((data) => {
        it('Can read the expected values from a user config profile', () => {
            Object.assign(process.env, { ...originalEnv, ...data.envVars });
            fs.writeFileSync(configPath, JSON.stringify(data.profile));
            const userConfig = user_config_spf_1.userConfigFactory.load(configPath);
            (0, chai_1.expect)(userConfig.getApiServerUrl()).to.equal(data.results.apiServer);
            (0, chai_1.expect)(userConfig.getAppServerUrl()).to.equal(data.results.appServer);
            (0, chai_1.expect)(userConfig.getAuthToken()).to.equal(data.results.authToken);
        });
    });
});
//# sourceMappingURL=profiles.test.js.map