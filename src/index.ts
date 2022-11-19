import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as core from "@actions/core";
import * as github from "@actions/github";

import type { Inputs, Coverage, Annotation } from "./types";
import { parseCoverage } from "./parseCoverage";

/**
 * Get the action inputs
 */
function loadInputs(): Inputs {
  return {
    accessToken: core.getInput("access-token"),
    coverageFile: core.getInput("coverage"),
    onlyChangedFiles:
      core.getInput("only-changed-files").toLowerCase() === "true",
  };
}

/**
 * Get list of files changed
 */
async function getChangedFiles(
  accessToken: string,
  pwd: string
): Promise<string[]> {
  const client = github.getOctokit(accessToken);

  const repoName = github.context.repo.repo;
  const repoOwner = github.context.repo.owner;
  const prNumber = github.context.issue.number;

  const results = await client.rest.pulls.listFiles({
    owner: repoOwner,
    repo: repoName,
    pull_number: prNumber,
  });

  if (results.status !== 200) {
    throw new Error("Could not get changed files.");
  }

  // Return files with the working directory added to match local file paths
  return results.data.map((item) => path.join(pwd, item.filename));
}

/**
 * Read coverage file
 */
function readCoverageFile(filepath: string): Coverage {
  console.log(`Reading coverage file: ${filepath}`);
  try {
    return JSON.parse(fs.readFileSync(filepath).toString()) as Coverage;
  } catch (error) {
    throw new Error(`Could not load coverage file: ${String(error)}`);
  }
}

/**
 * Save annotations to PR check
 */
async function saveAnnotations(annotations: Annotation[], accessToken: string) {
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
}

/**
 * Action entry point
 */
async function main() {
  try {
    const inputs = loadInputs();
    const pwd = execSync("pwd").toString().trim();
    console.log("Current working directory", pwd);

    // Read coverage file
    const coverage = readCoverageFile(inputs.coverageFile);

    // Get files to annotate
    let files: string[];
    if (inputs.onlyChangedFiles) {
      files = await getChangedFiles(inputs.accessToken, pwd);
    } else {
      files = Object.keys(coverage);
    }

    console.log("Coverage for files");
    console.log(files);

    // Get annotations
    const annotations = parseCoverage(coverage, files, pwd);
    console.log("Annotations", annotations.length);

    // Save annotations
    await saveAnnotations(annotations, inputs.accessToken);
  } catch (error) {
    core.setFailed(error as Error);
  }
}

main();
