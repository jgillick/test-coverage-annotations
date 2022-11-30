import { FileAnnotations } from "./FileAnnotation";
import type { Coverage, Annotation } from "./types";

/**
 * Read the test coverage JSON and stream positions that are missing coverage.
 */
export function parseCoverage(
  coverage: Coverage,
  files: string[],
  filePrefix: string = ""
): Annotation[] {
  let annotations: Annotation[] = [];

  for (let filepath of files) {
    // Get coverage for file
    if (typeof coverage[filepath] === "undefined") {
      console.warn(`No file coverage for ${filepath}`);
      continue;
    }
    const fileCoverage = coverage[filepath];
    console.warn(`Checking coverage for ${filepath}`);

    const fileAnnotations = new FileAnnotations(filepath, filePrefix);

    // Statements
    for (const [id, count] of Object.entries(fileCoverage.s)) {
      if (count === 0) {
        const statement = fileCoverage.statementMap[id];
        fileAnnotations.addAnnotation(
          "statement",
          statement.start.line,
          statement.start.column
        );
      }
    }

    // Functions
    for (const [id, count] of Object.entries(fileCoverage.f)) {
      if (count === 0) {
        const func = fileCoverage.fnMap[id];
        fileAnnotations.addAnnotation(
          "function",
          func.decl.start.line,
          func.decl.start.column
        );
      }
    }

    // Branches
    for (const [id, counts] of Object.entries(fileCoverage.b)) {
      for (let i = 0; i < counts.length; i++) {
        const count = counts[i];
        if (count === 0) {
          const branch = fileCoverage.branchMap[id];
          fileAnnotations.addAnnotation(
            "branch",
            branch.locations[i].start.line,
            branch.locations[i].start.column
          );
        }
      }
    }

    annotations = [...annotations, ...fileAnnotations.getAnnotations()];
  }

  return annotations;
}
