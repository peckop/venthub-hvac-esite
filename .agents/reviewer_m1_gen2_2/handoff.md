# Handoff Report — Security Hardening and Admin Login Review

## 1. Observation
1. In `supabase/migrations/20260602070000_security_hardening.sql`, the SELECT policy for `public.user_profiles` was recreated at lines 46-47 as:
   ```sql
   CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT
     USING ( id = auth.uid() OR public.is_admin_user() );
   ```
   However, the original policy defined in `supabase/migrations/20260530220000_tenant_schema_setup.sql` at lines 524-526 was:
   ```sql
   CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
     FOR SELECT TO authenticated
     USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));
   ```
   The reconstructed policy is missing the multi-tenant isolation constraint: `tenant_id = public.jwt_tenant_id()`.

2. Direct database inspection of the active function privileges on the remote Supabase database returned that `anon` and `authenticated` roles still have `EXECUTE` privileges on key security definer functions, despite the migration's attempt to revoke them:
   ```json
   {
     "anon_execute": true,
     "args": "p_product_id uuid, p_delta integer, p_reason text",
     "auth_execute": true,
     "proname": "adjust_stock"
   },
   {
     "anon_execute": true,
     "args": "user_id uuid, new_role text",
     "auth_execute": true,
     "proname": "set_user_admin_role"
   }
   ```
   This is because the migration `20260602070000_security_hardening.sql` used `REVOKE EXECUTE ON FUNCTION ... FROM public;` instead of explicitly revoking them from `anon` and `authenticated`. In PostgreSQL (especially with Supabase's default privileges schema), default permissions or previous explicit grants bypass a standard `FROM public` revocation.

3. The sensitive functions `set_user_admin_role` and `adjust_stock` do not contain any internal caller authorization checks (such as verifying if the calling user `auth.uid()` possesses an administrator role).

4. E2E tests are mocked in `tests/e2e/auth.test.ts` and `tests/e2e/adversarial.test.ts` by stubbing the `@supabase/ssr` client:
   ```typescript
   vi.mock('@supabase/ssr', () => { ... })
   ```
   Because vitest is stubbing client responses, no SQL requests or policies are actually evaluated against the database, meaning these security bugs and data leakage vulnerabilities were not caught during automated test runs.

## 2. Logic Chain
1. The omission of `tenant_id = public.jwt_tenant_id()` in `user_profiles_select_policy` means that for any administrator, the RLS rule evaluates to `true` for all rows in the table. Consequently, an admin from Tenant B can select and read user profiles (including email, full name, phone number, role) belonging to users of Tenant A, breaking multi-tenant data isolation.
2. The migration attempted to secure 30 security definer functions by running `REVOKE EXECUTE ... FROM public;`.
3. However, because Postgres default privileges or prior explicit grants remained in place for `anon` and `authenticated` roles, they were not revoked.
4. Because `set_user_admin_role` and `adjust_stock` are still executable by anonymous and authenticated users, and these functions do not check the caller's role internally, a malicious authenticated user (e.g. a customer) can directly invoke `set_user_admin_role` to make themselves a `superadmin`, or call `adjust_stock` to modify any product's stock levels.
5. Therefore, the implementation contains critical security regressions and gaps that must be corrected.

## 3. Caveats
- We assume the remote database structure aligns with standard Supabase behaviors where functions in the `public` schema are granted to `anon` and `authenticated` by default. This is confirmed by checking `has_function_privilege` directly.
- We did not check every single one of the 30 functions for internal role checks, but the primary administrative functions (`set_user_admin_role` and `adjust_stock`) are confirmed to have no checks.

## 4. Conclusion
The verdict is **REQUEST_CHANGES**. The security hardening implementation has a critical multi-tenant data leak vulnerability and fails to restrict execution privileges on sensitive admin functions.

**Required Actions**:
1. Re-add the tenant filter in the `user_profiles` select policy:
   ```sql
   CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT
     USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );
   ```
2. Update the `REVOKE` statements for all sensitive functions in `20260602070000_security_hardening.sql` to explicitly revoke from `anon` and `authenticated` roles:
   ```sql
   REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) FROM anon, authenticated, public;
   REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) FROM anon, authenticated, public;
   REVOKE EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) FROM anon, authenticated, public;
   ```
3. Add internal role verification checks inside `set_user_admin_role` and other sensitive admin-only security definer functions to prevent direct execution by non-admins, even if execute permission is granted.

## 5. Verification Method
- Execute the type-checker: `pnpm run type-check` (Must pass).
- Execute the linter: `pnpm run lint` (Must pass).
- Run the E2E tests: `pnpm run test:e2e` (Must pass 89/89).
- Run the following SQL checks on the database:
  - Policy query:
    ```sql
    SELECT qual FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_select_policy';
    ```
    Must return `((tenant_id = jwt_tenant_id()) AND ((id = auth.uid()) OR is_admin_user()))`.
  - Function privilege query:
    ```sql
    SELECT proname, has_function_privilege('anon', p.oid, 'execute') AS anon_ok, has_function_privilege('authenticated', p.oid, 'execute') AS auth_ok FROM pg_proc p WHERE proname IN ('set_user_admin_role', 'adjust_stock');
    ```
    Must return `false` for both `anon_ok` and `auth_ok`.
