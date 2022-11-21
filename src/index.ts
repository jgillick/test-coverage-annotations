import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import * as core from "@actions/core";
import * as github from "@actions/github";

import type { Inputs, Coverage, Annotation } from "./types";
import { parseCoverage } from "./parseCoverage";

const ANNOTATION_BATCH = 50;

/**
 * Get the action inputs
 */
function loadInputs(): Inputs {
  const pwd = execSync("pwd").toString().trim();
  return {
    accessToken: core.getInput("access-token"),
    coverageFile: core.getInput("coverage"),
    coverageCwd: core.getInput("coverage-working-directory") || pwd,
    onlyChangedFiles:
      core.getInput("only-changed-files").toLowerCase() === "true",
  };
}

/**
 * Get list of files changed
 */
async function getChangedFiles(
  accessToken: string,
  coverageCwd: string = ""
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
  return results.data.map((item) => {
    let filepath = item.filename;
    if (coverageCwd.length) {
      filepath = path.join(coverageCwd, filepath);
    }
    return filepath;
  });
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
  const sha =
    github.context.payload.pull_request?.head?.sha || github.context.sha;
  const total = annotations.length;

  console.log("Total annotations:", total);
  const output = {
    title: "Test Coverage",
    summary: `Found ${total} areas of code missing test coverage. View files for annotations`,
  };

  // Send in batches of 50
  let checkId;
  while (annotations.length) {
    const batch = annotations.splice(0, ANNOTATION_BATCH);

    let status = "in_progress";
    let conclusion: string | undefined = undefined;
    if (annotations.length) {
      status = "completed";
      conclusion = "success";
    }

    // Create check
    if (!checkId) {
      console.log(`Create check run for commit: ${sha}`);
      const res = await client.rest.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        head_sha: sha,
        name: "Test Coverage Annotations",
        status,
        conclusion,
        output: {
          ...output,
          annotations: batch,
        },
      });
      checkId = res.data.id;
    } else {
      console.log("Update check run", checkId);
      await client.rest.checks.update({
        check_run_id: checkId,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        head_sha: github.context.sha,
        status,
        conclusion,
        output: {
          ...output,
          annotations: batch,
        },
      });
    }
  }
}

/**
 * Action entry point
 */
async function main() {
  try {
    const inputs = loadInputs();

    // Read coverage file
    const coverage = readCoverageFile(inputs.coverageFile);

    // Get files to annotate
    let files: string[];
    if (inputs.onlyChangedFiles) {
      files = await getChangedFiles(inputs.accessToken, inputs.coverageCwd);
      console.log("Check coverage for changed files");
    } else {
      files = Object.keys(coverage);
      console.log("Check coverage for all files");
    }

    // Get annotations
    const annotations = parseCoverage(coverage, files, inputs.coverageCwd);

    // Save annotations
    await saveAnnotations(annotations, inputs.accessToken);
  } catch (error) {
    core.setFailed(error as Error);
  }
}

main();
