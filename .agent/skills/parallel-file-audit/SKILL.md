---
name: parallel-file-audit
description: Runs a multi-agent parallel audit on a list of files or directories using a deterministic count tool (like ESLint, grep, or AST parsers), mapping analysis to blind subagents, and reducing and validating outputs via a Synthesizer and a rule-driven deterministic Validator.
category: orchestration
metadata:
  triggers:
    - kör analiz başlat
    - paralel denetim kur
    - blind audit
    - parallel file audit
  inputs:
    - target-files
    - audit-command
    - json-schema
    - audit-rules
  outputs:
    - synthesized-scope-plan
    - validator-verdict
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# Parallel File Audit & Synthesis Skill

This skill defines a robust, deterministic multi-agent auditing methodology designed to map code diagnostics to isolated, parallel analysts and compile them into a verified strategic roadmap.

## Workflow Phases

```
          ┌──────────────────────────────────────────────┐
          │                  STEP 0                      │
          │  Run Deterministic Tool (e.g., ESLint JSON)  │
          └──────────────────────┬───────────────────────┘
                                 │
                     [Deterministic Seed Counts]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 1                      │
          │   Spawn Parallel Analysts (isolated/blind)   │
          └──────────────────────┬───────────────────────┘
                                 │
                           [Strict JSON]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 2                      │
          │         Compile via Synthesizer              │
          └──────────────────────┬───────────────────────┘
                                 │
                         [Synthesized Plan]
                                 │
                                 ▼
          ┌──────────────────────────────────────────────┐
          │                  STEP 3                      │
          │      Verify via Deterministic Validator      │
          └──────────────────────┬───────────────────────┘
                                 │
                           [PASS / FAIL]
```

---

## 1. Step 0: Deterministic Seeding (Lead Ajan)
* **Goal**: Establish exact counts of metrics (e.g., eslint warnings, match occurrences) using a command-line tool. **Do not let agents guess or estimate.**
* **Command Pattern**:
  ```bash
  pnpm exec eslint src/path --format json > audit_temp.json
  ```
* **Seeding**: Parse the JSON tool output and pass the exact counts as arguments to the corresponding file analyst subagents.

## 2. Step 1: Isolated Parallel Analysis (Analysts)
* **Goal**: Analyze each file with strict boundaries. Analysts must run in parallel and be **completely blind to each other** to prevent consensus or anchor bias.
* **Constraints**:
  - Must accept the seed count as input.
  - Must return a strict JSON block conforming to the defined schema.
  - Must enforce mathematical consistency (e.g., `chromeLiteralCount + proseLiteralCount === exactLiteralCount`).

## 3. Step 2: Synthesis (Synthesizer)
* **Goal**: Aggregate the strict JSON blocks.
* **Tasks**:
  - Sum metrics mathematically (no guessing).
  - Draft an architectural decision based on the aggregated findings.
  - Group files into safe, non-breaking execution waves (roadmap).

## 4. Step 3: Deterministic Quality Verification (Validator Gate)
* **Goal**: Validate the mathematical, logical, and structural alignment of the Analysts' reports and the Synthesizer's plan using a deterministic script rather than LLM intuition.
* **Why**: LLM critics are prone to arithmetic errors, sycophancy, or overlooking small details. A code-based validator is absolute.
* **Validator Script**: `generic-validator.cjs` runs rules configured dynamically in an `audit-rules.json` file.
* **Execution Pattern**:
  ```bash
  node .agent/skills/parallel-file-audit/generic-validator.cjs findings.json plan.json audit-rules.json
  ```
* **Validation Categories**:
  - **Scope/Duplicates**: Ensure no empty listings and no duplicate file analyses.
  - **Scope Omissions**: Verifies that all expected target files are present in the findings (preventing silent analyst skips).
  - **Deterministic Seed Parity**: Dynamically runs a command (e.g., eslint count) on the source files and compares the actual CLI output to the analyst's `exactLiteralCount` field.
  - **Per-file Arithmetic**: Compares mathematical properties per file based on specified equations (e.g. `chromeLiteralCount + proseLiteralCount === exactLiteralCount`).
  - **Enums Validation**: Checks file archetype, contentType, and recommendation against a strict array of valid values.
  - **Plan Summation**: Confirms that synthesized plans correctly sum the counts of all individual analyst files without guessing or rounding errors.
  - **Sibling Parity**: Enforces parity (e.g., within 2 warning count difference) between matching translations/locales (e.g., TR vs EN versions of the same file).
  - **Exclusions**: Validates that files flagged with recommendations like `TRIVIAL` or `ALREADY_DONE` do not end up as work items in the implementation waves.
* **Rules Schema (`audit-rules.json`):**
  ```json
  {
    "scope": {
      "expectedFiles": [
        "src/views/legal/PrivacyPolicyPage.tsx",
        "src/views/legal/CookiePolicyPage.tsx",
        "src/views/legal/DistanceSalesAgreementPage.tsx",
        "src/views/legal/PreInformationPage.tsx",
        "src/views/legal/TermsOfUsePage.tsx",
        "src/views/legal/components/tr/KvkkContent.tsx",
        "src/views/legal/components/en/KvkkContent.tsx",
        "src/views/legal/KVKKPage.tsx"
      ]
    },
    "cliValidation": {
      "commandTemplate": "npx eslint {files} --format json",
      "parserType": "eslint-jsx-literals",
      "exactKey": "exactLiteralCount"
    },
    "arithmetic": [
      { "equation": "chromeLiteralCount + proseLiteralCount === exactLiteralCount" }
    ],
    "enums": {
      "archetype": ["ALREADY_CLIENT_I18N", "NEEDS_USE_CLIENT", "RSC_SERVER", "TR_EN_SPLIT_CONTENT", "THIN_WRAPPER"],
      "contentType": ["LONG_FORM_LEGAL_PROSE", "UI_CHROME", "MIXED"],
      "recommendation": ["DICT", "KEEP_SPLIT", "RESTRUCTURE", "ALREADY_DONE", "TRIVIAL"]
    },
    "summation": [
      { "findingKey": "exactLiteralCount", "planKey": "totalLiteralEstimate" },
      { "findingKey": "chromeLiteralCount", "planKey": "totalChromeLiteralEstimate" }
    ],
    "siblingParity": {
      "pattern": "/(tr|en)/([^/]+)$",
      "key": "chromeLiteralCount",
      "maxDifference": 2
    },
    "exclusions": {
      "recommendations": ["TRIVIAL", "ALREADY_DONE"]
    }
  }
  ```
* **Verdict**: Returns a JSON object with `{ verdict: 'PASS' | 'FAIL', failures: [] }`. Exit code is `0` on PASS and `1` on FAIL. If `FAIL`, the Lead must correct the findings and re-run.

> [!IMPORTANT]
> **Strategic Validation vs. Mathematical Validation (Yargı vs. Doğruluk)**
> The deterministic Validator guarantees structural correctness, CLI counts matching, arithmetic sanity, and schema adherence.
> However, it **cannot** detect strategic architectural mistakes, scope creep (e.g., refactoring a completed file), or missed blockers.
> **Orchestrator Responsibility**: A `PASS` from the validator only proves the data is self-consistent and mathematically correct. The Lead Agent / Orchestrator MUST review the synthesized plan's strategic soundness before presenting it to the user.
