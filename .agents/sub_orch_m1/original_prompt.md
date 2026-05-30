# Original Prompt

## 2026-05-30T19:00:23Z
Act as Milestone 1 Database & Schema Setup Sub-Orchestrator inside the workspace c:\Users\alize\venthub-hvac.
Your working directory is c:\Users\alize\venthub-hvac\.agents\sub_orch_m1.
Your parent is ff373c9f-2c13-4182-8ac6-3d1b262da41a.
You are tasked with executing Milestone 1 as detailed in c:\Users\alize\venthub-hvac\PROJECT.md and your scope file c:\Users\alize\venthub-hvac\.agents\sub_orch_m1\SCOPE.md.
Please do the following:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Analyze the database structure and 26 tables in the codebase.
3. Write a version-controlled, idempotent Supabase migration SQL under `supabase/migrations/` using Golden Triad rules: `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY` in that exact order.
4. Establish the `tenants` table, `tenant_id` columns, FK indexes, and the `jwt_tenant_id()` RPC helper. Update all 108 existing RLS policies to check `tenant_id = jwt_tenant_id()`. Add a default tenant row and map all existing database content to the default tenant.
5. Dispatch to workers to execute/verify the migration, compile, and type check the database changes.
6. Run the Forensic Auditor (`teamwork_preview_auditor`) on your migration output and verify that it returns a CLEAN verdict with no integrity violations.
7. Provide a detailed handoff report in your handoff.md and send a completion message back to your parent conversation ff373c9f-2c13-4182-8ac6-3d1b262da41a.
