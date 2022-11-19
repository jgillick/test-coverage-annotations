"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCoverage = void 0;
/**
 * Read the test coverage JSON and stream positions that are missing coverage.
 */
function parseCoverage(coverage, files, filePrefix = "") {
    const annotations = [];
    for (let filename of files) {
        const fileCoverage = coverage[filename];
        let path = filename;
        if (filePrefix.length && path.startsWith(filePrefix)) {
            path = path.substring(filePrefix.length);
        }
        const annotation = {
            path,
            annotation_level: "warning",
        };
        // Statements
        for (const [id, count] of Object.entries(fileCoverage.s)) {
            if (count === 0) {
                const statement = fileCoverage.statementMap[id];
                const message = "Missing test coverage for this statement";
                annotations.push(Object.assign(Object.assign({}, annotation), { message, start_line: statement.start.line, start_column: statement.start.column, end_line: statement.end.line, end_column: statement.end.column }));
            }
        }
        // Functions
        for (const [id, count] of Object.entries(fileCoverage.f)) {
            if (count === 0) {
                const func = fileCoverage.fnMap[id];
                const message = "Missing test coverage for this function";
                annotations.push(Object.assign(Object.assign({}, annotation), { message, start_line: func.decl.start.line, start_column: func.decl.start.column, end_line: func.loc.end.line, end_column: func.loc.end.column }));
            }
        }
        // Branches
        for (const [id, counts] of Object.entries(fileCoverage.b)) {
            for (let i = 0; i < counts.length; i++) {
                const count = counts[i];
                if (count === 0) {
                    const branch = fileCoverage.branchMap[id];
                    const message = "Missing test coverage for this branch";
                    annotations.push(Object.assign(Object.assign({}, annotation), { message, start_line: branch.locations[i].start.line, start_column: branch.locations[i].start.column, end_line: branch.locations[i].end.line, end_column: branch.locations[i].end.column }));
                }
            }
        }
    }
    return annotations;
}
exports.parseCoverage = parseCoverage;
//# sourceMappingURL=parseCoverage.js.map