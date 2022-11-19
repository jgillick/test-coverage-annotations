export type Inputs = {
  accessToken: string;
  coverageFile: string;
  onlyChangedFiles: boolean;
};

export type Annotation = {
  path: string;
  message: string;
  annotation_level: string;
  start_line: number;
  end_line: number;
  start_column: number;
  end_column: number;
};

export type Coverage = {
  [key: string]: CoverageFile;
};

type CoverageFile = {
  path: string;
  statementMap: StatementMap;
  fnMap: FunctionMap;
  branchMap: BranchMap;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number[]>;
};

type StatementMap = {
  [key: string]: CodeLocation;
};

type FunctionMap = {
  [key: string]: {
    name: string;
    decl: CodeLocation;
    loc: CodeLocation;
  };
};

type BranchMap = {
  [key: string]: {
    type: string;
    loc: CodeLocation;
    locations: CodeLocation[];
  };
};

type CodeLocation = {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
};
