import type { Annotation } from "./types";

type AnnotationType = "statement" | "function" | "branch";

type PartialAnnotation = {
  line: number;
  message: string[];
};

/**
 * Collect annotations for a single file
 */
export class FileAnnotations {
  filepath: string;
  annotations: Record<number, PartialAnnotation>;

  constructor(filepath: string, filePrefix: string) {
    this.annotations = {};

    // Strip path prefix off filepath for annotation
    if (filePrefix.length) {
      if (filepath.startsWith(filePrefix)) {
        filepath = filepath.substring(filePrefix.length);
      } else {
        console.warn(
          `The coverage working directory '${filePrefix}' does not exist on coverage file entry: ${filepath}.`
        );
      }
    }
    this.filepath = filepath;
  }

  /**
   * Get existing partial annotation for a line
   */
  getAnnotation(line: number): PartialAnnotation {
    let annotation = this.annotations[line];
    if (!annotation) {
      annotation = {
        line,
        message: [],
      };
      this.annotations[line] = annotation;
    }
    return annotation;
  }

  /**
   * Define an annotation type for a line
   */
  addAnnotation(type: AnnotationType, line: number, column: number) {
    const annotation = this.getAnnotation(line);
    annotation.message.push(`${type} starting at column ${column}`);
  }

  /**
   * Get all full annotations
   */
  getAnnotations() {
    return Object.values(this.annotations).map(
      ({ line, message }: PartialAnnotation): Annotation => ({
        title: "Line missing test coverage",
        start_line: line,
        end_line: line,
        start_column: 0,
        path: this.filepath,
        annotation_level: "warning",
        message: message.join("\n").trim(),
      })
    );
  }
}
