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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const parseCoverage_1 = require("./parseCoverage");
/**
 * Get the action inputs
 */
function loadInputs() {
    return {
        accessToken: core.getInput("access-token"),
        coverageFile: core.getInput("coverage"),
        onlyChangedFiles: core.getInput("only-changed-files").toLowerCase() === "true",
    };
}
/**
 * Get list of files changed
 */
function getChangedFiles(accessToken, pwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = github.getOctokit(accessToken);
        const repoName = github.context.repo.repo;
        const repoOwner = github.context.repo.owner;
        const prNumber = github.context.issue.number;
        const results = yield client.rest.pulls.listFiles({
            owner: repoOwner,
            repo: repoName,
            pull_number: prNumber,
        });
        if (results.status !== 200) {
            throw new Error("Could not get changed files.");
        }
        // Return files with the working directory added to match local file paths
        return results.data.map((item) => path_1.default.join(pwd, item.filename));
    });
}
/**
 * Read coverage file
 */
function readCoverageFile(filepath) {
    return JSON.parse(fs_1.default.readFileSync(filepath).toString());
}
/**
 * Save annotations to PR check
 */
function saveAnnotations(annotations, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = github.getOctokit(accessToken);
        return client.rest.checks.create({
            name: "Test Coverage Annotations",
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            head_sha: github.context.sha,
            status: "completed",
            conclusion: "neutral",
            output: {
                title: "Test Coverage",
                summary: `Found ${annotations.length} areas of code missing test coverage. View files for annotations`,
                annotations: annotations,
            },
        });
    });
}
/**
 * Action entry point
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = loadInputs();
            const pwd = (0, child_process_1.execSync)("pwd").toString().trim();
            console.log("Current working directory", pwd);
            // Read coverage file
            const coverage = readCoverageFile(inputs.coverageFile);
            // Get files to annotate
            let files;
            if (inputs.onlyChangedFiles) {
                files = yield getChangedFiles(inputs.accessToken, pwd);
            }
            else {
                files = Object.keys(coverage);
            }
            // Get annotations
            const annotations = (0, parseCoverage_1.parseCoverage)(coverage, files, pwd);
            console.log("Annotations", annotations.length);
            // Save annotations
            yield saveAnnotations(annotations, inputs.accessToken);
        }
        catch (error) {
            core.setFailed(error);
        }
    });
}
main();
//# sourceMappingURL=index.js.map