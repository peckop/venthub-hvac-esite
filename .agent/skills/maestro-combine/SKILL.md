---
name: maestro-combine
description: Coordinates parallel code changes from disjoint files and combines them centrally using JSON deltas to prevent Git merge conflicts on shared central files (maestro-combine, paralel birleştirme, PMCM).
category: orchestration
metadata:
  triggers:
    - paralel birleştirme
    - çakışmasız birleştirme
    - maestro-combine
    - parallel combine changes
    - PMCM orkestrasyonu
  inputs:
    - target-files
    - seed-command
    - worker-prompt-template
    - merge-rules-or-script
    - verification-gate-commands
  outputs:
    - mutated-files
    - merged-central-files
    - gate-verdict
  commands:
    validate: node -e "const fs = require('fs'); if (!fs.existsSync('scripts/admin-i18n-merger.cjs')) throw new Error('Merge script missing'); console.log('Parallel code mutation ready.');"
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# maestro-combine — Paralel Çakışmasız Değişiklik Birleştirme (PMCM) Skill

This skill defines a robust, conflict-free, multi-agent refactoring methodology. It coordinates parallel code mutations across multiple files without creating Git merge conflicts on shared central files (like routes, dictionary index files, type indices, or style sheets).

## PMCM Workflow Phases

```
          ┌──────────────────────────────────────────────┐
          │                  STEP 0                      │
          │  Deterministic Seeding (Target & Weight)    │
          └──────────────────────┬───────────────────────┘
                                 │
                      [Target Files & Seed Counts]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 1                      │
          │  Parallel Disjoint Workers (Mutations)       │
          └──────────────────────┬───────────────────────┘
                                 │
                   [Changed Files + JSON Deltas]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 2                      │
          │     Centralized Merge (Conflict Prevention)  │
          └──────────────────────┬───────────────────────┘
                                 │
                      [Merged Central Configs]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 3                      │
          │      Multi-Stage Deterministic Gate          │
          └──────────────────────┬───────────────────────┘
                                 │
                           [PASS / FAIL]
```

---

## 1. Step 0: Deterministic Seeding
* **Goal**: Identify the exact set of files needing changes and measure the scope/weight of each file (e.g. number of ESLint errors, type issues, or inline style occurrences).
* **Execution**:
  - Run a diagnostic tool or command (e.g., `eslint --format json` or a custom grep script) to extract exact counts.
  - Group the files into disjoint execution waves based on their weights (complex files first to establish patterns early; simple files later).

## 2. Step 1: Parallel Disjoint Workers (Conflict-Free Mutations)
* **Goal**: Perform changes on individual component/view files concurrently.
* **Constraints**:
  - **No Shared File Modifications**: Parallel worker agents are strictly forbidden from modifying shared central files (e.g., `tr.ts`, `types/index.d.ts`, or central CSS).
  - **Output Format**: Workers must return the modified file content AND a structured list of changes (a **JSON delta**) representing any registrations, dictionary keys, or styles that need to go into the shared central files.
  - **Allowed Exclusions**: Ignore items matched by a configuration-driven blacklist/allowedStrings template.

## 3. Step 2: Centralized Merge
* **Goal**: Merge all JSON deltas produced by the parallel workers into the shared central files.
* **Execution**:
  - Run a single-threaded merge script or task (handled by the Lead Agent) to read all JSON deltas.
  - Write these additions to the shared configuration or dictionary files.
  - Enforce bilingual or schematic parity (e.g., ensuring both TR and EN keys are added for every i18n change).
  - This step eliminates Git merge conflicts entirely.

## 4. Step 3: Multi-Stage Deterministic Gate
* **Goal**: Enforce absolute correctness before committing. Do not trust LLM evaluations.
* **Checks**:
  1. **Linter Gate**: Run the seeding lint/diagnostic tool to ensure the target files now have a count of 0.
  2. **Type Gate**: Run the compiler (`tsc --noEmit` or equivalent) to verify no compilation errors exist.
  3. **Build Gate**: Run the framework builder (`npm run build` or equivalent) to catch SSR boundaries, hydration mismatches, and static generation issues.
  4. **Parity & Keycheck Gate**: Verify dictionary key symmetry (TR/EN parity) and run the project's keycheck tests to ensure that every `t('...')` key called in the codebase resolves successfully to a translation string and does not display raw keys.
  5. **Regression Gate**: Run the test runner (`pnpm test` or equivalent) to prevent functionality regressions.
* **Outcome**: Exit code `0` for `PASS`, non-zero for `FAIL` (listing failures for correction).

> [!IMPORTANT]
> **Strategic Validation vs. Mathematical Validation (Yargı vs. Doğruluk)**
> The deterministic Quality Gate guarantees syntax correctness, compiler safety, lint count matching, and static build sanity.
> However, it **cannot** detect strategic architectural mistakes, scope creep (e.g., editing files outside the task scope), or missed business logic blockers.
> **Orchestrator Responsibility**: A `PASS` from the gate only proves the code builds and is self-consistent. The Lead Agent / Orchestrator MUST review the synthesized plan's strategic soundness before presenting it to the user.
