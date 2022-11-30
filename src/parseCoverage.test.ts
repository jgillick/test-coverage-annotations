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
        message: "statement starting at column 0",
        start_line: 2,
        end_line: 2,
        start_column: 0,
        title: "Line missing test coverage",
      },
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: "function starting at column 0",
        start_line: 3,
        end_line: 3,
        start_column: 0,
        title: "Line missing test coverage",
      },
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: "branch starting at column 10",
        start_line: 6,
        end_line: 6,
        start_column: 0,
        title: "Line missing test coverage",
      },
      {
        path: "/test/src/file1.ts",
        annotation_level: "warning",
        message: [
          "statement starting at column 0",
          "function starting at column 2",
          "branch starting at column 10",
          "branch starting at column 30",
        ].join("\n"),
        start_line: 8,
        end_line: 8,
        start_column: 0,
        title: "Line missing test coverage",
      },
      {
        title: "Line missing test coverage",
        start_line: 1,
        end_line: 1,
        start_column: 0,
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "statement starting at column 0",
      },
      {
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "function starting at column 2",
        start_line: 4,
        end_line: 4,
        start_column: 0,
        title: "Line missing test coverage",
      },
      {
        path: "/test/src/file2.ts",
        annotation_level: "warning",
        message: "branch starting at column 30",
        start_line: 5,
        end_line: 5,
        start_column: 0,
        title: "Line missing test coverage",
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
