---
name: superpowers-plan
description: Writes an implementation plan with small steps, exact files to touch, and verification commands. Use before making non-trivial changes.
---

# Planning Skill

## When to use this skill
- any multi-file change
- any change that impacts behavior, data, auth, billing, or production workflows
- any debugging that needs systematic isolation

## Planning rules
- Steps should be **small** (2–10 minutes each).
- Every step must include **verification**.
- Prefer **incremental deliverables** (avoid “big bang” edits).
- Identify **rollback** and **risk controls** early.
- **[MCP ZORUNLULUĞU]**: If the task requires external framework knowledge, explicitly add a step to use `context7-live` MCP (`resolve-library-id` -> `live_query-docs`). If it touches Database architecture or Supabase logic, Step 0 or 1 MUST use Supabase MCP tools (`mcp_supabase_list_tables`, `mcp_supabase_execute_sql` vb.) to verify schema before proceeding.

## Scope Police & Budget Constraints (CRITICAL)
- **Scope Limitations:** When generating `plan.json` or `trivial.json` for VentHub, you MUST define explicit operational boundaries.
- `allowed_paths`: Specify EXACT directories or files. **DO NOT USE global wildcards like `src/**`**. Broad targeting acts as an exploit and is forbidden.
- `forbidden_paths`: Explicitly block areas you should not touch.
- `max_files_changed`: Enforce a hard budget constraint. Max **10 for normal plans**, Max **5 for trivial bypass**. Exceeding this budget will result in an immediate `check-scope` Git diff block and execution failure. Modifying uncharted files is a violation.

## Plan format (use this exact structure)
### Goal
### Assumptions
### Plan
1. Step name
   - Files: `path/to/file.ext`, `...`
   - Change: (1–2 bullets)
   - Verify: (exact commands or checks)
2. ...

### Risks & mitigations
### Rollback plan
