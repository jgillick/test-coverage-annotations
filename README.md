# Test Coverage Annotations - Github Action

A github action that add test coverage annotations to your files using an [istanbul-style coverage JSON file](https://github.com/gotwarlost/istanbul/blob/master/coverage.json.md) (jest compatible).

<img src="./screenshot.png" style="max-width: 600px;" />

Requires the following permission:

- `checks: write`

```yaml
- name: Coverage annotations
  uses: jgillick/test-coverage-annotations@main
  with:
    access-token: ${{ secrets.GITHUB_TOKEN }}
    coverage: ./coverage/coverage-final.json
    only-changed-files: true
```

## Input parameters

- `access-token`: Your github access token. Needed to add annotations.
- `coverage`: Path to the test coverage JSON file.
- `coverage-working-directory`: The path of the directory that the coverage was generated in. Defaults to pwd of the run. (see below for more details)
- `only-changed-files`: Only annotate changed files in the PR.

## Full Example

Assuming you use jest, here's how you can use this action:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      checks: write
    steps:
      # First generate coverage
      - name: Get coverage
        run: yarn jest --coverage

      # Generate annotations
      - name: Coverage annotations
        uses: jgillick/test-coverage-annotations@main
        with:
          access-token: ${{ secrets.GITHUB_TOKEN }}
          coverage: coverage/coverage-final.json
          only-changed-files: true
```

## Coverage Working Directory

**This is important.** The coverage JSON file will contain the _full path_ to each file in the report. This includes a path before your repository. For example: `/home/app/my_repo/file/test.ts`.
In order to apply annotations to files correctly, we only need the path starting at the repo directory and need to strip the prefix `/home/app/my_repo/`.

By default, this action will use the current working directory of the run.
