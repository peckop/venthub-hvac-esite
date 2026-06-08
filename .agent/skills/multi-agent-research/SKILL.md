---
name: multi-agent-research
description: Reusable worker-judge multi-agent orchestrator for high-quality codebase
  research, architectural analysis, design, and RAG technical verification. Trigger
  when analyzing the codebase, performing RAG research, or executing architectural
  reviews. Do NOT use for database resets, formatting, git branching, or running local
  unit tests.
category: orchestration
metadata:
  triggers:
  - kod tabanını araştır
  - mimari analiz
  - RAG research
  inputs:
  - research query
  outputs:
  - research_notes.md
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# Multi-Agent Research Orchestrator

This skill defines a reusable workflow and prompt templates to launch a coordinated team of parallel research/development subagents (Workers) combined with verification subagents (Judges/Auditors) and a Resource Auditor to keep projects bloat-free.

## Architecture & Communication Flow

```
                  ┌──────────────────────────────────┐
                  │           MAIN AGENT             │
                  │   (Coordinator & Final Judge)    │
                  └────────┬────────────────┬────────┘
                           │                │
            [Worker Generation]          [Auditing Loop]
                           │                │
                           ▼                ▼
                  ┌────────────────┐  ┌──────────────┐
                  │    Workers     │  │    Judges    │
                  │  (R1, R2, R3)  ├──► (J1, J2, J3) │
                  └────────────────┘  └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │   Resource   │
                                      │   Auditor    │
                                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │ Final Report │
                                      └──────────────┘
```

## How to Deploy the Orchestrator

When deploying this workflow for a new task, follow these steps:

### Step 1: Define the Workers
Create specialized workers for distinct sub-domains. Examples:
- **Code Scanner:** Crawls local files for variables, APIs, and signatures.
- **Skill/Package Searcher:** Looks up existing internal/external packages.
- **GitHub Scanner:** Searches open-source codebases for implementation patterns.

### Step 2: Define the Judges
Assign a dedicated Judge to audit each Worker's output:
- **Judge A (Technical Auditor):** Checks code-related outputs against physical files to prevent halucinations.
- **Judge B (Design Auditor):** Verifies UI/UX designs against Web Design Guidelines (a11y, layout shifts, contrast).

### Step 3: Define the Resource Auditor (Guardrail)
- **Role:** Reviews all worker reports and filters out unnecessary dependencies, remote tools, or bloatware.
- **Core Check:** "Can this be implemented using native APIs or existing dependencies? Is installing a new package truly justified?"

---

## Agent Prompt Templates

### 1. Researcher/Worker Template
```markdown
You are a specialized Research Subagent focusing on: [SUB-DOMAIN].
Your task is to analyze [TARGET] in the context of [PROJECT_NAME].

Investigate:
1. All available features, options, and APIs related to [SUB-DOMAIN].
2. Identify design patterns, configurations, or parameters.
3. Save your findings to [OUTPUT_FILE_PATH].

Rules:
- Be factual and provide direct file paths, line numbers, or URL citations.
- Do not make any code changes. This is a read-only research task.
```

### 2. Auditor/Judge Template
```markdown
You are an independent Quality Auditor focusing on [SUB-DOMAIN].
Your task is to verify the research report created by the Worker at [OUTPUT_FILE_PATH].

Verification Steps:
1. Verify each claim, file path, and signature by inspecting the actual source code or documentation.
2. Flag any hallucinations, missing details, or outdated information.
3. Check against quality standards (e.g. accessibility, design guides, or performance).
4. Save your final certified audit report to [AUDIT_FILE_PATH].
```

### 3. Resource Auditor Template
```markdown
You are the Resource Auditor for this project.
Your task is to review the following research reports:
- [WORKER_1_REPORT]
- [WORKER_2_REPORT]
- [WORKER_3_REPORT]

Evaluate:
1. Do we actually need to install new libraries or external skills?
2. What can be implemented purely using local resources and existing dependencies?
3. Synthesize the findings into a minimal, zero-bloat recommendation plan.
4. Save your assessment to [RESOURCE_ASSESSMENT_PATH].
```

## Project-Specific Resource Registry

Use the following curated repositories and NotebookLM digital twins as primary reference sources for research subagents:

### GitHub Repositories (Agent Skills & Harnesses)
1. **[affaan-m/ECC (Everything Claude Code)](https://github.com/affaan-m/ECC):**
   - **Scope:** Modular agent harness, parallel workers, verification loops, and specific coding-practice skill packs (TDD, benchmark optimization, latency-critical systems, cost auditing).
2. **[davila7/claude-code-templates](https://github.com/davila7/claude-code-templates):**
   - **Scope:** Extensive repository of 400+ agent profiles, ready-to-use hooks, and custom commands. Very useful for modeling specialized developer/auditor subagents.
3. **[mattpocock/skills](https://github.com/mattpocock/skills):**
   - **Scope:** Highly polished developer workflow slash commands (e.g. `/grill-with-docs`, `/tdd`, `/to-prd`, `/to-issues`, `/handoff`) and instructions for structured, non-vibe coding.
4. **[sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills):**
   - **Scope:** Searchable and installable catalog of over 1,400+ structured agentic skills (`SKILL.md`) for general programming, security, and operations.
5. **[obra/superpowers](https://github.com/obra/superpowers):**
   - **Scope:** Composable skills framework utilizing git worktrees, enforcing specifications, plans, subagents, and automated quality gates.

### NotebookLM Digital Twins (Knowledge Hubs)
1. **Agent Skills Arşivi — Orkestrasyon & CLI** (ID: `c7c29d37-e284-49ca-a411-70a8758433f1`):
   - **Scope:** In-depth documentation on custom MCP servers, agent configurations, commands, and orchestration strategies.
2. **Antigravity: Yapay Zeka İçin 1400+ Ajan Yeteneği Kütüphanesi** (ID: `fe83b525-4562-461d-b73f-b3f03edc2fa0`):
   - **Scope:** Full dictionary and descriptions of pre-built skill models across all domains.
