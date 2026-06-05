# Fallow CLI Reference

Complete command and flag specifications for all fallow CLI commands.

---

## Table of Contents

- [`dead-code`: Dead Code Analysis](#dead-code-dead-code-analysis)
- [`dupes`: Duplication Detection](#dupes-duplication-detection)
- [`fix`: Auto-Remove Unused Code](#fix-auto-remove-unused-code)
- [`list`: Project Introspection](#list-project-introspection)
- [`init`: Config Generation](#init-config-generation)
- [`migrate`: Config Migration](#migrate-config-migration)
- [`health`: Function Complexity Analysis](#health-function-complexity-analysis)
- [`audit`: Changed-File Quality Gate](#audit-changed-file-quality-gate)
- [`flags`: Feature Flag Detection](#flags-feature-flag-detection)
- [`security`: Security Candidate Detection](#security-security-candidate-detection)
- [`explain`: Rule Explanation](#explain-rule-explanation)
- [`schema`: CLI Introspection](#schema-cli-introspection)
- [`config-schema`: Config JSON Schema](#config-schema-config-json-schema)
- [`plugin-schema`: Plugin JSON Schema](#plugin-schema-plugin-json-schema)
- [`config`: Show Resolved Config](#config-show-resolved-config)
- [Global Flags](#global-flags)
- [Environment Variables](#environment-variables)
- [Output Formats](#output-formats)
- [JSON Output Structure](#json-output-structure)
- [Configuration File Format](#configuration-file-format)
- [Inline Suppression Comments](#inline-suppression-comments)

---

## `dead-code`: Dead Code Analysis

Analyzes the project for unused files, exports, dependencies, types, members, and more. Running `fallow` with no subcommand runs all analyses (dead code + duplication + complexity). Use `fallow dead-code` for dead code only.

### Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--format` | `human\|json\|sarif\|compact\|markdown\|codeclimate\|gitlab-codequality\|pr-comment-github\|pr-comment-gitlab\|review-github\|review-gitlab` | `human` | Output format |
| `--quiet` | bool | `false` | Suppress progress bars and timing on stderr |
| `--legacy-envelope` | bool | `false` | Remove the top-level `kind` field from typed JSON roots for one migration cycle |
| `--changed-since` | string | — | Only analyze files changed since a git ref (e.g., `main`, `HEAD~3`) |
| `--production` | bool | `false` | Exclude test/dev files, only start/build scripts (applies to every analysis) |
| `--production-dead-code` | bool | `false` | Per-analysis production mode for dead-code. Bare combined runs and `fallow audit` only. |
| `--production-health` | bool | `false` | Per-analysis production mode for health. Bare combined runs and `fallow audit` only. |
| `--production-dupes` | bool | `false` | Per-analysis production mode for duplication. Bare combined runs and `fallow audit` only. |
| `--baseline` | path | — | Compare against a saved baseline |
| `--save-baseline` | path | — | Save current results as a baseline |
| `--workspace` | string | — | Scope to one or more workspaces. Comma-separated values, globs (`apps/*`, `@scope/*`), and `!`-prefixed negation (`!apps/legacy`) supported. Matched against package name AND workspace path relative to repo root. |
| `--changed-workspaces` | string (git ref) | — | Git-derived monorepo CI scoping: scope to workspaces containing any file changed since `REF` (e.g. `origin/main`). Auto-derives the workspace set from `git diff`. Mutually exclusive with `--workspace`. Missing ref is a hard error (exit 2), not silent full-scope fallback. |
| `--include-dupes` | bool | `false` | Cross-reference with duplication findings |
| `--dupes-mode` | enum | `config` | Override duplicate detection mode in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --mode`. |
| `--dupes-threshold` | number | `config` | Override the duplication percentage failure threshold in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --threshold`. |
| `--dupes-min-tokens` | number | `config` | Override the minimum token count for clone detection in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --min-tokens`. |
| `--dupes-min-lines` | number | `config` | Override the minimum line count for clone detection in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --min-lines`. |
| `--dupes-min-occurrences` | number | `config` | Override the minimum clone occurrences in combined mode (must be >= 2). Falls back to the config value when unset. Mirrors the standalone `dupes --min-occurrences`. |
| `--dupes-skip-local` | bool | `config` | Only report cross-directory duplicates in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --skip-local`. |
| `--dupes-cross-language` | bool | `config` | Enable TypeScript to JavaScript duplicate matching in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --cross-language`. |
| `--dupes-ignore-imports` | bool | `config` | Exclude import declarations from duplicate detection in combined mode. Falls back to the config value when unset. Mirrors the standalone `dupes --ignore-imports`. |
| `--file` | path (multiple) | — | Scope output to specific files. Only issues in the specified files are reported. Project-wide dependency issues are suppressed. Warns on non-existent paths. Useful for lint-staged |
| `--include-entry-exports` | bool | `false` | Report unused exports in entry files (package.json `main`/`exports`, framework pages). Catches typos like `meatdata` vs `metadata`. Global flag, also accepted on combined mode (`fallow --include-entry-exports`) and `fallow audit`. Also configurable as `includeEntryExports: true` in fallow config |
| `--trace` | `FILE:EXPORT` | — | Trace export usage chain |
| `--trace-file` | path | — | Show all edges for a file |
| `--trace-dependency` | string | — | Trace where a dependency is used |

### Issue Type Filters

| Flag | Issue Type |
|------|------------|
| `--unused-files` | Unused files |
| `--unused-exports` | Unused exports |
| `--unused-types` | Unused types |
| `--private-type-leaks` | Opt-in API hygiene check (default `off`) for exported signatures that reference same-file private types. Storybook `*.stories.*` story files and framework routing convention files (Next.js App + Pages Router, Gatsby, Remix v2, TanStack Router, Expo Router) are skipped to avoid noise. Enable via this flag or `private-type-leaks: "warn"` / `"error"` in [`rules`](#rules-configuration). |
| `--unused-deps` | Unused dependencies, devDependencies, optionalDependencies, type-only production deps, and test-only production deps |
| `--unused-enum-members` | Unused enum members |
| `--unused-class-members` | Unused class members |
| `--unresolved-imports` | Unresolved imports |
| `--unlisted-deps` | Unlisted dependencies |
| `--duplicate-exports` | Duplicate exports |
| `--circular-deps` | Circular dependencies |
| `--re-export-cycles` | Re-export cycles (`kind: multi-node` for barrel files re-exporting from each other in a loop, `kind: self-loop` for a barrel re-exporting from itself). File-scoped finding; chain propagation through the loop is a no-op so imports may silently come up empty. Distinct from `--circular-deps` (runtime cycles). |
| `--boundary-violations` | Boundary violations (imports crossing architecture zone boundaries) |
| `--stale-suppressions` | Stale suppression comments or `@expected-unused` JSDoc tags |
| `--unused-catalog-entries` | Unused pnpm catalog entries |
| `--empty-catalog-groups` | Empty named pnpm catalog groups |
| `--unresolved-catalog-references` | Package references to missing pnpm catalog entries |
| `--unused-dependency-overrides` | Unused pnpm dependency overrides |
| `--misconfigured-dependency-overrides` | Malformed pnpm dependency overrides |

### Examples

```bash
# Full analysis with JSON output
fallow dead-code --format json --quiet

# Only unused exports
fallow dead-code --format json --quiet --unused-exports

# PR check: only changed files
fallow dead-code --format json --quiet --changed-since main --fail-on-issues

# CI mode with SARIF upload
fallow dead-code --ci

# Production-only analysis
fallow dead-code --format json --quiet --production

# Single workspace package
fallow dead-code --format json --quiet --workspace my-package

# Multiple workspaces: comma-separated
fallow dead-code --format json --quiet --workspace web,admin

# Glob (matches package name OR relative path)
fallow dead-code --format json --quiet --workspace 'apps/*'

# Exclude a workspace from the set
fallow dead-code --format json --quiet --workspace 'apps/*,!apps/legacy'

# Monorepo CI: auto-scope to workspaces containing any file changed since origin/main
fallow dead-code --format json --quiet --changed-workspaces origin/main

# Debug: trace an export
fallow dead-code --format json --quiet --trace src/utils.ts:myFunction

# Incremental adoption with baseline
fallow dead-code --format json --quiet --save-baseline fallow-baselines/dead-code.json
fallow dead-code --format json --quiet --baseline fallow-baselines/dead-code.json --fail-on-issues

# Regression detection: save baseline on main, compare on PRs
fallow dead-code --format json --quiet --save-regression-baseline
fallow dead-code --format json --quiet --fail-on-regression --tolerance 2%

# Scope to specific files (e.g., lint-staged)
fallow dead-code --format json --quiet --file src/utils.ts --file src/helpers.ts

# Catch typos in entry file exports
fallow dead-code --format json --quiet --include-entry-exports
```

---

## `dupes`: Duplication Detection

Finds code duplication and clones across the project.

By default, `fallow dupes` skips generated framework output matching `**/.next/**`, `**/.nuxt/**`, `**/.svelte-kit/**`, `**/.turbo/**`, `**/.parcel-cache/**`, `**/.vite/**`, `**/.cache/**`, `**/out/**`, and `**/storybook-static/**`. These defaults merge with `duplicates.ignore`. Set `duplicates.ignoreDefaults = false` to opt out and use only your configured ignore list. If the reported duplication percentage drops after upgrading, this generated-output filtering is the expected reason.

### Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--format` | `human\|json\|sarif\|compact\|markdown\|codeclimate\|gitlab-codequality\|pr-comment-github\|pr-comment-gitlab\|review-github\|review-gitlab` | `human` | Output format |
| `--quiet` | bool | `false` | Suppress progress bars |
| `--top` | number | — | Show only the N most-duplicated clone groups (sorted by instance count desc, tiebreak: line count desc, then path/line). Summary stats reflect the full project. |
| `--mode` | `strict\|mild\|weak\|semantic` | `mild` | Detection mode |
| `--min-tokens` | number | `50` | Minimum token count for a clone |
| `--min-lines` | number | `5` | Minimum line count for a clone |
| `--min-occurrences` | number | `2` | Minimum number of occurrences before a clone group is reported (must be ≥ 2). Raise to skip pair-only clones and focus on widespread copy-paste worth refactoring. `fallow init` writes `minOccurrences: 3` into new projects. |
| `--threshold` | number | `0` | Fail if duplication exceeds this percentage |
| `--skip-local` | bool | `false` | Only report cross-directory duplicates |
| `--cross-language` | bool | `false` | Strip type annotations for TS↔JS matching |
| `--ignore-imports` | bool | `false` | Exclude import declarations from clone detection |
| `--explain-skipped` | bool | `false` | Human/markdown only: show per-pattern counts for files skipped by default duplicates ignores |
| `--trace` | `FILE:LINE` \| `dup:<fp>` | — | Deep-dive clones. `FILE:LINE` traces all clones at a location; `dup:<id>` traces a clone group by the stable fingerprint shown in the listing and on `clone_groups[].fingerprint` in JSON. Fingerprints are usually `dup:<8hex>` and widen only on rare report collisions. Trace output adds an extract-function suggestion, estimated savings, and a best-effort proposed name per group |
| `--changed-since` | string | — | Only report duplication in files changed since a git ref |
| `--baseline` | path | — | Compare against baseline |
| `--save-baseline` | path | — | Save results as baseline |
| `--workspace` | string | — | Scope to one or more workspaces. Comma-separated values, globs (`apps/*`, `@scope/*`), and `!`-prefixed negation (`!apps/legacy`) supported. Matched against package name AND workspace path relative to repo root. |
| `--changed-workspaces` | string (git ref) | — | Git-derived monorepo CI scoping: scope to workspaces containing any file changed since `REF`. Mutually exclusive with `--workspace`. Missing ref is a hard error. |
| `--group-by` | `owner\|directory\|package\|section` | — | Partition the report into per-group sections. Each clone group is attributed to its **largest owner** (most instances; alphabetical tiebreak): a group split 2 src / 1 lib appears under `src`. JSON adds `grouped_by` plus a `groups` array; each bucket carries dedup-aware `stats`, `clone_groups` (every group tagged with `primary_owner` and per-instance `owner`), and `clone_families`. SARIF results carry `properties.group`, CodeClimate issues a top-level `group` field. Compact and markdown fall back to ungrouped with a stderr note. |

### Detection Modes

| Mode | Behavior |
|------|----------|
| `strict` | Exact token match (no normalization) |
| `mild` | Syntax normalized (whitespace, semicolons) |
| `weak` | Different literal values treated as equivalent |
| `semantic` | Renamed variables also treated as equivalent |

### Examples

```bash
# Default duplication scan
fallow dupes --format json --quiet

# Semantic mode (detects renames)
fallow dupes --format json --quiet --mode semantic

# Cross-directory only, fail at 5%
fallow dupes --format json --quiet --skip-local --threshold 5

# Trace clones at a specific location
fallow dupes --format json --quiet --trace src/utils.ts:42

# Deep-dive a clone group by its dup:<id> fingerprint (from the listing or JSON)
fallow dupes --format json --quiet --trace dup:7f3a2c1e

# Only check duplication in changed files
fallow dupes --format json --quiet --changed-since main
```
