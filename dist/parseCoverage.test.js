"use strict";
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
require("jest");
const fs_1 = __importDefault(require("fs"));
const parseCoverage_1 = require("./parseCoverage");
describe("parseCoverage", () => {
    let coverage;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        coverage = JSON.parse(fs_1.default.readFileSync("test-coverage.json").toString());
    }));
    test("parse coverage", () => {
        const annotations = (0, parseCoverage_1.parseCoverage)(coverage, Object.keys(coverage));
        expect(annotations).toEqual([
            {
                path: "/test/src/file1.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this statement",
                start_line: 2,
                start_column: 0,
                end_line: 2,
                end_column: 30,
            },
            {
                path: "/test/src/file1.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this function",
                start_line: 3,
                start_column: 0,
                end_line: 4,
                end_column: 20,
            },
            {
                path: "/test/src/file1.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this branch",
                start_line: 6,
                start_column: 10,
                end_line: 6,
                end_column: 20,
            },
            {
                path: "/test/src/file2.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this statement",
                start_line: 1,
                start_column: 0,
                end_line: 2,
                end_column: 34,
            },
            {
                path: "/test/src/file2.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this function",
                start_line: 4,
                start_column: 2,
                end_line: 5,
                end_column: 30,
            },
            {
                path: "/test/src/file2.ts",
                annotation_level: "warning",
                message: "Missing test coverage for this branch",
                start_line: 5,
                start_column: 30,
                end_line: 6,
                end_column: 40,
            },
        ]);
    });
    test("limit files annotated", () => {
        const annotations = (0, parseCoverage_1.parseCoverage)(coverage, ["/test/src/file1.ts"]);
        const files = new Set(annotations.map((i) => i.path));
        expect([...files]).toEqual(["/test/src/file1.ts"]);
    });
    test("strip path prefix", () => {
        const annotations = (0, parseCoverage_1.parseCoverage)(coverage, Object.keys(coverage), "/test/src/");
        const files = new Set(annotations.map((i) => i.path));
        expect([...files]).toEqual(["file1.ts", "file2.ts"]);
    });
});
//# sourceMappingURL=parseCoverage.test.js.map