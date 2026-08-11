---
name: to-issues
description: Breaks a plan, specification, or PRD into structured issues or tasks.
  Trigger for creating issues (issue oluştur), dividing plans (planı böl), or tasks
  to issues. Do NOT use for general git operations, styling fonts, or running unit
  tests.
category: utils
metadata:
  triggers:
  - issue oluştur
  - planı böl
  - tasks to issues
  inputs:
  - approved implementation plan
  outputs:
  - structured issues list
depends_on:
- to-prd
next_steps: []
run_last: false
exclusions: []
---

# To Issues

Break a plan or PRD into vertical slices (tracer bullets) and write them as a checklist.

## Process

1. Gather context from the PRD and the codebase.
2. Draft vertical slices: Each issue is a thin vertical slice that cuts through ALL integration layers (schema, API, UI, tests).
3. Write the checklist of issues to `task.md` or a local file.
