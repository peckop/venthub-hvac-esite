## 2026-05-30T19:11:46Z
You are running as a forensic auditor subagent with the role of "Forensic Quality & Integrity Auditor".
Your working directory is `c:\Users\alize\venthub-hvac\.agents\auditor_m1`.
Your parent is the Milestone 1 Database Sub-Orchestrator (conversation ID: 744ad993-7877-41e9-925f-575cb8954dbc).

You are tasked with executing Milestone 4: Audit & Handoff (specifically running Forensic Integrity Checks on the Milestone 1 database migration output).

Please execute the following steps meticulously:
1. Initialize your `BRIEFING.md` and `progress.md` in your working directory `c:\Users\alize\venthub-hvac\.agents\auditor_m1`.
2. Load and read the `venthub-auditor` skill under `c:\Users\alize\venthub-hvac\.agent\skills\venthub-auditor\SKILL.md`.
3. Inspect the newly written migration script: `c:\Users\alize\venthub-hvac\supabase\migrations\20260530220000_tenant_schema_setup.sql`.
4. Perform the following integrity forensics:
   a. **Golden Triad Validation**: For each of the 21 Tenant-Aware tables (including the `admin_audit_log` table), verify that the migration SQL strictly follows the Golden Triad sequence in this exact order:
      1. `GRANT` privileges (public API access: `anon` -> SELECT; `authenticated` -> SELECT, INSERT, UPDATE, DELETE; `service_role` -> ALL).
      2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
      3. `CREATE POLICY` (enforcing multi-tenant isolation via `tenant_id = public.jwt_tenant_id()`).
   b. **RPC Claim Security**: Ensure that the claims helper `public.jwt_tenant_id()` is defined with `SECURITY DEFINER` and its search path is explicitly set to `SET search_path = public, pg_catalog;` (preventing search path hijacking).
   c. **Idempotency Verification**: Ensure that the SQL uses `IF NOT EXISTS` for all column/table additions, index creations, and checks, and `DROP POLICY IF EXISTS` before recreating policies to guarantee safe rerun capabilities.
   d. **No Overwrite / Integrity Violations Check**: Ensure there are no dummy/facade implementations, no hardcoded values trying to bypass checks, and no unexpected overrides of critical tables.
5. Run the integrity checklist script from the codebase:
   - Command: `python .agent/scripts/check_integrity.py`
   - Capture its stdout and confirm that it reports 0 Blockers (returns exit code 0).
6. Run the TypeScript type-checking `pnpm run type-check` (or compile check) to confirm that the codebase remains completely type-safe with no errors.
7. Write a detailed handoff report in `handoff.md` inside your working directory with the full details of your audit verification, including commands executed and stdout. Provide a binary verdict: `VERDICT: CLEAN` or `VERDICT: VIOLATED`.
8. Send a completion message to your parent conversation ID 744ad993-7877-41e9-925f-575cb8954dbc when complete.
