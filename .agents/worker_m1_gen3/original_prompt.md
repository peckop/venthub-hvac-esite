## 2026-06-02T07:06:51Z
You are the Implementation Worker (Gen 3). Your working directory is c:\Users\alize\venthub-hvac\.agents\worker_m1_gen3.
Please implement the security hardening fixes to resolve the database vulnerabilities and access token hook requirements identified by the reviewers.

### Skills to Load & Follow:
- `supabase` at c:\Users\alize\venthub-hvac\.agent\skills\supabase\SKILL.md
- `supabase-security` at c:\Users\alize\venthub-hvac\.agent\skills\supabase-security\SKILL.md
- `venthub-auditor` at c:\Users\alize\venthub-hvac\.agent\skills\venthub-auditor\SKILL.md

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Tasks to Perform:

1. **Create Database Migration (`supabase/migrations/20260602080000_security_hardening_fixes.sql`)**:
   - **R1 Fix (Cross-Tenant Leak)**: Recreate the `user_profiles_select_policy` to restore the multi-tenant isolation constraint:
     `CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );`
   - **R6 (Custom Access Token Auth Hook)**: Define the `public.custom_access_token_hook(event jsonb)` database function. Set up schema/function/table grants for `supabase_auth_admin` and revoke execution privileges from public roles:
     - `GRANT USAGE ON SCHEMA public TO supabase_auth_admin;`
     - `GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;`
     - `REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;`
     - `GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;`
   - **Prevent Role Self-Elevation**: Refactor trigger functions `handle_new_user_metadata()` and `handle_new_user_profile()` to prevent client-writable `raw_user_meta_data ->> 'role'` from promoting the user role unless the caller is `service_role` or an existing admin user. Force the role to `'user'` for normal public signups.
   - **Internal Authorization Checks (Defense-in-depth)**: Redefine `set_user_admin_role`, `adjust_stock`, and `set_stock` to include internal checks verifying if the calling user (`auth.uid()`) is an admin, moderater, or warehouse manager, or executing via `service_role`. Raise an exception if not authorized.
   - **R7 Fix (Explicit Function Execution Revocation)**: Revoke `EXECUTE` privileges on all 30 SECURITY DEFINER functions explicitly `FROM anon, authenticated, public;`. Grant it back to `authenticated` and `anon` only for RLS helper functions: `is_admin_user`, `jwt_tenant_id`, `is_user_admin(uuid)`, `is_admin`, `is_staff_user`.

2. **Apply Migration**:
   Run the newly created migration against the remote database using the linked database query commands.

3. **Verification**:
   - Run type checking: `pnpm run type-check`
   - Run linter: `pnpm run lint`
   - Run E2E tests: `pnpm run test:e2e` (make sure all 89/89 tests pass)

Write a detailed handoff report to `c:\Users\alize\venthub-hvac\.agents\worker_m1_gen3\handoff.md` and send me a message with the results of your tests and code changes.
