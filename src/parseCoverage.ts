import type { Coverage, Annotation } from "./types";

/**
 * Read the test coverage JSON and stream positions that are missing coverage.
 */
export function parseCoverage(
  coverage: Coverage,
  files: string[],
  filePrefix: string = ""
): Annotation[] {
  const annotations = [];

  for (let filepath of files) {
    // Get coverage for file
    if (typeof coverage[filepath] === "undefined") {
      console.warn(`No file coverage for ${filepath}`);
      continue;
    }
    const fileCoverage = coverage[filepath];

    // Strip path prefix off filepath for annotation
    let annotationPath = filepath;
    if (filePrefix.length) {
      if (annotationPath.startsWith(filePrefix)) {
        annotationPath = annotationPath.substring(filePrefix.length);
      } else {
        console.warn(
          `The coverage working directory '${filePrefix}' does not exist on coverage file entry: ${annotationPath}.`
        );
      }
    }

    // Base annotation object
    const annotation: Pick<Annotation, "path" | "annotation_level"> = {
      path: annotationPath,
      annotation_level: "warning",
    };

    // Statements
    for (const [id, count] of Object.entries(fileCoverage.s)) {
      if (count === 0) {
        const statement = fileCoverage.statementMap[id];
        const message = "This statement lacks test coverage";
        annotations.push({
          ...annotation,
          message,
          start_line: statement.start.line,
          start_column: statement.start.column,
          end_line: statement.end.line,
          end_column: statement.end.column,
        });
      }
    }

    // Functions
    for (const [id, count] of Object.entries(fileCoverage.f)) {
      if (count === 0) {
        const func = fileCoverage.fnMap[id];
        const message = "This function lacks test coverage";
        annotations.push({
          ...annotation,
          message,
          start_line: func.decl.start.line,
          start_column: func.decl.start.column,
          end_line: func.loc.end.line,
          end_column: func.loc.end.column,
        });
      }
    }

    // Branches
    for (const [id, counts] of Object.entries(fileCoverage.b)) {
      for (let i = 0; i < counts.length; i++) {
        const count = counts[i];
        if (count === 0) {
          const branch = fileCoverage.branchMap[id];
          const message = "This branch lacks test coverage";
          annotations.push({
            ...annotation,
            message,
            start_line: branch.locations[i].start.line,
            start_column: branch.locations[i].start.column,
            end_line: branch.locations[i].end.line,
            end_column: branch.locations[i].end.column,
          });
        }
      }
    }
  }

  return annotations;
}
