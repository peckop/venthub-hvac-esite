## 2026-05-30T19:18:20Z
Act as a teamwork_preview_auditor tasked with auditing Milestone 2 (Middleware & Auth Integration) changes in the c:\Users\alize\venthub-hvac workspace.
Your working directory is c:\Users\alize\venthub-hvac\.agents\auditor_m2.

Your objective is to perform a strict forensic integrity check on the files modified or created during Milestone 2:
1. `src/lib/tenantResolver.ts`
2. `src/middleware.ts`
3. `supabase/migrations/20260530221000_tenant_auth_integration.sql`
4. `src/contexts/AuthContext.tsx`

Please execute the following checks exactly:
1. **Architectural & Integrity Script Check**:
   - Read and use the instructions in `c:\Users\alize\venthub-hvac\.agent\skills\venthub-auditor\SKILL.md`.
   - Run the integrity audit check command: `python .agent/scripts/check_integrity.py` on the workspace and specifically on the modified/created files. Ensure there are 0 BLOCKER reports.
2. **Middleware Rule Check**:
   - Verify that there are absolutely NO direct database queries (e.g. `supabase.from(...)` or SQL executions) made within `src/middleware.ts` for tenant resolution.
   - Verify that all redirects and response exits in `src/middleware.ts` are decorated with the `setTenantCookie` decorator to inject the `tenant_id` cookie.
3. **No-Cheating Verification**:
   - Verify that the tenant resolution logic in `src/lib/tenantResolver.ts` is genuine, handles ports cleanly, supports subdomain/localhost conditions, and doesn't hardcode individual custom-domain mappings to dummies.
   - Verify that Supabase triggers (`public.handle_new_user_metadata()` and `public.handle_new_user_profile()`) are fully compliant, secure (use SECURITY DEFINER), and explicitly bind search_path safely.
4. **Compile check verification**:
   - Run `pnpm run type-check` to verify that there are absolutely no compilation errors.

Produce a detailed audit handoff report (`c:\Users\alize\venthub-hvac\.agents\auditor_m2\handoff.md`) with the execution outputs and a clear verdict (e.g., CLEAN or BLOCKED/INTEGRITY VIOLATION).
Send a message back to the orchestrator (conversation ID: c61ebd5e-14be-426b-a262-9dc3f90f4762) when finished.
