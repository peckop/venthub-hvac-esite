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

---

## 2. Step 1: Isolated Parallel Analysis (Analysts)
* **Goal**: Analyze each file with strict boundaries. Analysts must run in parallel and be **completely blind to each other** to prevent consensus or anchor bias.
* **Constraints**:
  - Must accept the seed count as input.
  - Must return a strict JSON block conforming to the defined schema.
  - Must enforce mathematical consistency (e.g., `chromeLiteralCount + proseLiteralCount === exactLiteralCount`).

---

## 3. Step 2: Synthesis (Synthesizer)
* **Goal**: Aggregate the strict JSON blocks.
* **Tasks**:
  - Sum metrics mathematically (no guessing).
  - Draft an architectural decision based on the aggregated findings.
  - Group files into safe, non-breaking execution waves (roadmap).

---

## 4. Step 3: Deterministic Quality Verification (Validator Gate)
* **Goal**: Validate the mathematical, logical, and structural alignment of the Analysts' reports and the Synthesizer's plan using a deterministic script rather than LLM intuition.
* **Execution Pattern**:
  ```bash
  node .agent/skills/parallel-file-audit/generic-validator.cjs findings.json plan.json audit-rules.json
  ```
  *(Note: The findings parameter can either be a single compiled `findings.json` file OR a directory containing individual analyst JSON outputs `findings/` to isolate malformed outputs.)*

---

## Domain Configuration Reference

### 1. i18n Dictionary Localization Example

#### `audit-rules.json` Configuration
```json
{
  "seedMode": "counter",
  "scope": {
    "expectedFiles": [
      "src/views/legal/PrivacyPolicyPage.tsx",
      "src/views/legal/CookiePolicyPage.tsx"
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
    "archetype": ["RSC_SERVER", "TR_EN_SPLIT_CONTENT", "THIN_WRAPPER"],
    "contentType": ["LONG_FORM_LEGAL_PROSE", "UI_CHROME"],
    "recommendation": ["DICT", "KEEP_SPLIT", "RESTRUCTURE"]
  },
  "summation": [
    { "findingKey": "exactLiteralCount", "planKey": "totalLiteralEstimate" }
  ],
  "siblingParity": {
    "pattern": "/(tr|en)/([^/]+)$",
    "variantIndex": 1,
    "groupIndex": 2,
    "metric": "chromeLiteralCount",
    "maxDelta": 2
  },
  "exclusions": {
    "recommendations": ["TRIVIAL", "ALREADY_DONE"]
  }
}
```

---

### 2. Security / RLS Policy Audit Example

This configuration demonstrates how to audit database tables for row-level security (RLS), verifying that every table has RLS enabled and has active policies without missing any schema objects.

#### `audit-rules.json` Configuration
```json
{
  "seedMode": "structural",
  "scope": {
    "expectedFiles": [
      "supabase/migrations/20260601000000_init_auth.sql",
      "supabase/migrations/20260602000000_add_tenants.sql"
    ]
  },
  "cliValidation": {
    "commandTemplate": "grep -rn \"ROW LEVEL SECURITY\" {files}",
    "exactKey": "rlsStatementCount"
  },
  "arithmetic": [
    { "equation": "selectPolicyCount + writePolicyCount === totalPolicyCount" }
  ],
  "enums": {
    "archetype": ["MIGRATION_SQL"],
    "recommendation": ["ENFORCE_RLS", "AUDITED_OK"]
  },
  "summation": [
    { "findingKey": "totalPolicyCount", "planKey": "totalSystemPolicies" }
  ],
  "exclusions": {
    "recommendations": ["AUDITED_OK"]
  }
}
```

---

## Configuration Reference Table

The following table documents the structure, values, and constraints for keys defined inside `audit-rules.json`:

| Config Parameter | Type | Required | Description / Allowed Values |
| :--- | :--- | :--- | :--- |
| `seedMode` | `string` | No | Seed validation mode. Options:<br>• `counter` (Default): Strict CLI-based numeric warning match.<br>• `structural`: Graceful verification (mismatch yields warnings, no FAIL).<br>• `none`: Skips CLI verification entirely. |
| `scope` | `object` | Yes | Defines the expected scope of files.<br>• `expectedFiles`: `string[]` (Exact relative paths of files requiring analysis). |
| `cliValidation` | `object` | No | CLI verification details.<br>• `commandTemplate`: `string` (Command string containing `{files}`).<br>• `parserType`: `string` (e.g. `eslint-jsx-literals` to parse ESLint JSON outputs).<br>• `exactKey`: `string` (The key in findings compared to the CLI count). |
| `arithmetic` | `object[]` | No | Equation checking array. Structure:<br>`[ { "equation": "fieldA + fieldB === fieldC" } ]` |
| `enums` | `object` | No | Restricts analyst properties to predefined strings. Structure:<br>`{ "fieldName": [ "allowedVal1", "allowedVal2" ] }` |
| `summation` | `object[]` | No | Validates plan summation. Structure:<br>`[ { "findingKey": "exactCount", "planKey": "planTotal" } ]` |
| `siblingParity` | `object` | No | Enforces variants balance (e.g. TR vs EN delta). Structure:<br>• `pattern`: `string` (Regex string capturing group and variant).<br>• `variantIndex`/`groupIndex`: `number` (Match capture group index).<br>• `metric`: `string` (Field key to compare).<br>• `maxDelta`: `number` (Maximum allowed numeric variance). |
| `exclusions` | `object` | No | Roadmap exclusions config.<br>• `recommendations`: `string[]` (Recommendations that disqualify a file from waves). |
| `waveCompleteness` | `boolean` | No | Automatically active if waves exist. Verifies that **every** non-excluded scope file is mapped to **exactly one** implementation wave. |
