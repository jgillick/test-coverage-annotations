# Test Coverage Annotations - Github Action

A github action that add file annotations to areas of code lacking test coverage. This requires the following permission:

- `checks: write`
- `pull-requests: read` (if `using only-changed-files` is `true`)

```yaml
- name: Coverage annotations
  uses: jgillick/test-coverage-annotations@main
  with:
    access-token: ${{ secrets.GITHUB_TOKEN }}
    coverage: ./coverage/coverage-final.json
    only-changed-files: true
```

## Full Example

Assuming you use jest, here's how you can use this action:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read
      checks: write
    steps:
      # First generate coverage
      - name: Get coverage
        run: yarn jest --coverage

      - name: Coverage annotations
        uses: jgillick/test-coverage-annotations@main
        with:
          access-token: ${{ secrets.GITHUB_TOKEN }}
          coverage: ./coverage/coverage-final.json
          only-changed-files: true
```
