# Test Coverage Annotations - Github Action

A github action that add test coverage annotations to your files using an [istanbul-style coverage JSON file](https://github.com/gotwarlost/istanbul/blob/master/coverage.json.md) (jest compatible).

This requires the following permission:

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
