import "jest";
import fs from "fs";
import type { Coverage } from "./types";
import { parseCoverage } from "./parseCoverage";

describe("parseCoverage", () => {
  let coverage: Coverage;

  beforeEach(async () => {
    coverage = JSON.parse(
      fs.readFileSync("test-coverage.json").toString()
    ) as Coverage;
  });

  test("parse coverage", () => {
    const annotations = parseCoverage(coverage, Object.keys(coverage));
    expect(annotations).toEqual([
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: "This statement lacks test coverage",
        start_line: 2,
        start_column: 0,
        end_line: 2,
        end_column: 30,
      },
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: "This function lacks test coverage",
        start_line: 3,
        start_column: 0,
        end_line: 4,
        end_column: 20,
      },
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: "This branch lacks test coverage",
        start_line: 6,
        start_column: 10,
        end_line: 6,
        end_column: 20,
      },
      {
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "This statement lacks test coverage",
        start_line: 1,
        start_column: 0,
        end_line: 2,
        end_column: 34,
      },
      {
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "This function lacks test coverage",
        start_line: 4,
        start_column: 2,
        end_line: 5,
        end_column: 30,
      },
      {
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "This branch lacks test coverage",
        start_line: 5,
        start_column: 30,
        end_line: 6,
        end_column: 40,
      },
    ]);
  });

  test("limit files annotated", () => {
    const annotations = parseCoverage(coverage, ["/test/src/file1.ts"]);
    const files = new Set(annotations.map((i) => i.path));
    expect([...files]).toEqual(["/test/src/file1.ts"]);
  });

  test("strip path prefix", () => {
    const annotations = parseCoverage(
      coverage,
      Object.keys(coverage),
      "/test/src/"
    );
    const files = new Set(annotations.map((i) => i.path));
    expect([...files]).toEqual(["file1.ts", "file2.ts"]);
  });
});
