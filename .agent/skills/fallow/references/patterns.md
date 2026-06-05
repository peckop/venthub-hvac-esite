# Fallow: Common Workflow Patterns & Recipes

Step-by-step workflows for common fallow usage scenarios.

---

## Table of Contents

- [Full Project Audit](#full-project-audit)
- [PR Dead Code Check](#pr-dead-code-check)
- [CI Pipeline Setup](#ci-pipeline-setup)
- [Incremental Adoption with Baselines](#incremental-adoption-with-baselines)
- [Monorepo Analysis](#monorepo-analysis)
- [Duplication Threshold CI Gate](#duplication-threshold-ci-gate)
- [Migration from knip](#migration-from-knip)
- [Migration from jscpd](#migration-from-jscpd)
- [Safe Auto-Fix Workflow](#safe-auto-fix-workflow)
- [Production vs Full Audit](#production-vs-full-audit)
- [Debugging False Positives](#debugging-false-positives)
- [Combined Dead Code + Duplication](#combined-dead-code--duplication)
- [Custom Plugin Setup](#custom-plugin-setup)
- [GitHub Code Scanning Integration](#github-code-scanning-integration)
- [Guard `git push` with a Claude Code PreToolUse hook](#guard-git-push-with-a-claude-code-pretooluse-hook)

---

## Full Project Audit

Complete codebase hygiene audit.

### Step 1: Run full analysis

```bash
fallow dead-code --format json --quiet
```

### Step 2: Review issue counts

Parse `total_issues` and individual arrays (`unused_files`, `unused_exports`, etc.) to understand the scope.

### Step 3: Find duplication

```bash
fallow dupes --format json --quiet
```

### Step 4: Preview auto-fix

```bash
fallow fix --dry-run --format json --quiet
```

### Step 5: Apply fixes (after user confirmation)

```bash
fallow fix --yes --format json --quiet
```

### Step 6: Verify

```bash
fallow dead-code --format json --quiet
```

---

## PR Dead Code Check

Check if a pull request introduces new dead code.

### Step 1: Analyze changed files

```bash
fallow dead-code --format json --quiet --changed-since main --fail-on-issues
```

Exit code 1 if the PR introduces new dead code. Exit code 0 if clean.

### Step 2: If issues found, show specifics

```bash
fallow dead-code --format json --quiet --changed-since main
```

Parse the JSON to list specific files and exports that became unused.

---

## CI Pipeline Setup

### GitHub Actions: Basic

```yaml
- name: Dead code check
  run: npx fallow dead-code --fail-on-issues --quiet
```

### GitHub Actions: With SARIF Upload

```yaml
- name: Fallow analysis
  run: npx fallow dead-code --ci > fallow.sarif
  continue-on-error: true  # --ci sets --fail-on-issues; continue to upload SARIF even if issues found

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: fallow.sarif
```

### GitHub Actions: Using the Official Action

```yaml
- uses: fallow-rs/fallow@v2
  with:
    command: dead-code
    fail-on-issues: true
    changed-since: main
```

### GitHub Actions: With Health Score

```yaml
- uses: fallow-rs/fallow@v2
  with:
    score: true
    changed-since: main
```

Computes a health score (0-100 with letter grade) in combined mode and enables the health delta header in PR comments.

### GitHub Actions: Severity-Aware PR Quality Gate (Audit)

```yaml
- uses: fallow-rs/fallow@v2
  with:
    command: audit
    gate: new-only        # default; fails only on findings introduced by this PR
    fail-on-issues: true
```

Runs `fallow audit` to combine dead-code + complexity + duplication scoped to changed files. The gate respects rule severity from `.fallowrc.json`, so `unused-exports: warn` projects do not fail when a PR touches a file with pre-existing warn-tier findings. Use `gate: all` to fail on every finding in changed files.

The action exposes `outputs.verdict` (`pass`/`warn`/`fail`) and `outputs.gate` for downstream conditionals; `outputs.issues` holds the introduced count under `gate: new-only` and the total count under `gate: all`.

```yaml
- uses: fallow-rs/fallow@v2
  id: fallow
  with:
    command: audit

- name: Block release on regression
  if: steps.fallow.outputs.verdict == 'fail'
  run: exit 1
```

Three additional outputs surface silent failures in the action's PR comment / review steps. `outputs.changed-files-unavailable` (`true`/`false`, default `false`) signals that the analyze step could not enumerate PR-changed files (transient GitHub API failure, expired token, missing permissions), so analysis ran against the full codebase. `outputs.post-skipped-reason` (`none`/`pagination_failure`) signals the Post review comments step aborted to avoid duplicate threads. `outputs.dedup-lookup-failed` (`true`/`false`) signals a dedup lookup failed on either the Post PR comment or Post review comments step. All three are always emitted regardless of which failure path was taken, so downstream `if:` gates can match positively without absent-vs-false ambiguity. Gate on these to detect degraded posting state and re-run the action.

### GitHub Actions: Inline PR Annotations (No Advanced Security)

The official action supports inline PR annotations via GitHub workflow commands. This does not require Advanced Security (unlike SARIF upload) and works on any GitHub plan.

```yaml
- uses: fallow-rs/fallow@v2
  with:
    command: dead-code
    changed-since: main
    annotations: true
    max-annotations: 50   # default: 50, limits annotation count
```

Annotations appear as inline warnings on the PR diff. They work with all commands (`dead-code`, `dupes`, `health`, and the default combined mode). The `max-annotations` input prevents annotation flooding on large projects.

### GitHub Actions: PR-Scoped Check

```yaml
- name: Check for new dead code
  run: npx fallow dead-code --format json --quiet --changed-since ${{ github.event.pull_request.base.sha }} --fail-on-issues
```

### GitHub Actions: Duplication Gate

```yaml
- name: Duplication check
  run: npx fallow dupes --format json --quiet --threshold 5 --mode mild
```

Fails if overall duplication exceeds 5%.

### GitHub Actions: PR-Scoped Duplication Check

```yaml
- name: Check duplication in changed files
  run: npx fallow dupes --format json --quiet --changed-since ${{ github.event.pull_request.base.sha }}
```

Only reports duplication in files modified by the PR.

### GitLab CI: Using the Official Template

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/fallow-rs/fallow/main/ci/gitlab-ci.yml'

fallow:
  extends: .fallow
  variables:
    FALLOW_COMMAND: "dead-code"
    FALLOW_FAIL_ON_ISSUES: "true"
```

Generates Code Quality reports (inline MR annotations) automatically. In MR pipelines, `--changed-since` is automatically set to the target branch — no manual configuration needed.

If runners cannot reach `raw.githubusercontent.com`, run `fallow ci-template gitlab --vendor`, commit the generated `ci/` and `action/` files, and use GitLab's local include syntax:

```yaml
include:
  - local: 'ci/gitlab-ci.yml'
```

### GitLab CI: With MR Summary Comments

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/fallow-rs/fallow/main/ci/gitlab-ci.yml'

fallow:
  extends: .fallow
  variables:
    FALLOW_COMMENT: "true"
    FALLOW_SUMMARY_SCOPE: "diff"
```

Posts a summary comment on the MR with issue counts and findings. In MR pipelines, `--changed-since` is auto-detected from `$CI_MERGE_REQUEST_TARGET_BRANCH_NAME`, so only issues from changed files are reported. `FALLOW_SUMMARY_SCOPE: "diff"` also hides project-level dependency/catalog/override findings whose anchor line is outside the diff. Requires `GITLAB_TOKEN` CI/CD variable (project access token with `api` scope); `CI_JOB_TOKEN` is read-only for MR notes in the official GitLab API.
