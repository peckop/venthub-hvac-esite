# Handoff Report: Supabase Security Hardening & Admin Guard Fix

## 1. Observation

1. **Table SELECT policy and `is_admin_user` recursion**:
   - Location: `supabase/migrations/20260530220000_tenant_schema_setup.sql` lines 524-526:
     ```sql
     CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
       FOR SELECT TO authenticated
       USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));
     ```
   - Location: `supabase/migrations/20250911_security_fix_search_path.sql` lines 22-34:
     ```sql
     CREATE OR REPLACE FUNCTION public.is_admin_user()
     RETURNS BOOLEAN
     LANGUAGE plpgsql
     SECURITY DEFINER
     SET search_path = public, pg_temp
     AS $$
     BEGIN
       RETURN EXISTS (
         SELECT 1 FROM public.user_profiles 
         WHERE id = auth.uid() AND role IN ('admin','superadmin')
       );
     END;
     $$;
     ```

2. **Middleware Admin Guard**:
   - Location: `src/middleware.ts` lines 173-176:
     ```typescript
     const jwtRole = user.user_metadata?.role

     if (!jwtRole || !ADMIN_ROLES.has(jwtRole.toLowerCase())) {
     ```

3. **Dependencies**:
   - Location: `package.json`
   - Result: No package related to `jwt-decode` or other JWT decoding libraries is present in `dependencies` or `devDependencies`.

---

## 2. Logic Chain

1. Evaluating the SELECT RLS policy on `user_profiles` calls `public.is_admin_user()` when the user is trying to SELECT a row that does not match their own `auth.uid()`.
2. `public.is_admin_user()` contains a query `SELECT 1 FROM public.user_profiles WHERE id = auth.uid() ...`.
3. This inner query performs a SELECT on the `user_profiles` table, triggering the `"user_profiles_select_policy"` RLS policy again.
4. The policy triggers another call to `public.is_admin_user()`, starting an infinite recursive loop.
5. In the middleware, extracting the role from `user.user_metadata?.role` is insecure because `user_metadata` is client-modifiable. An attacker can elevate their privileges to `admin` simply by calling `supabase.auth.updateUser({ data: { role: 'admin' } })`.
6. To make this secure, role checks must rely on a custom claim (`user_role`) injected into the JWT claims from the database via a Custom Access Token Hook, which runs on token generation and cannot be modified by the client.
7. Since `package.json` does not contain a JWT-decoding library, we must either install `jwt-decode` or use a standard, dependency-free base64 utility function using the Edge Runtime's built-in `atob` function.

---

## 3. Caveats

- We assumed that `is_admin_user()` is used in RLS policies for other tables (which it is, e.g. `venthub_orders`, `shipping_email_events`). However, because these other tables are not `user_profiles`, they query `user_profiles` inside `is_admin_user()` without creating recursion. Therefore, `is_admin_user()` itself must **not** be modified or deleted, only the policy on `user_profiles` itself needs to change.
- The Custom Access Token Hook relies on the `supabase_auth_admin` role. In local Supabase CLI configurations, hooks must be explicitly enabled either via dashboard hooks setting or via `config.toml`.

---

## 4. Conclusion

- **The bug causes**: All admin dashboard access is blocked because any query to `user_profiles` triggers infinite recursion and crashes with `stack depth limit exceeded`.
- **The fix**:
  1. Update the `user_profiles` SELECT, INSERT, UPDATE, and DELETE RLS policies to check the request's JWT claims directly using `(current_setting('request.jwt.claims', true)::jsonb ->> 'user_role')` instead of calling `public.is_admin_user()`.
  2. Implement a `custom_access_token_hook()` database function and grant usage privileges to `supabase_auth_admin`.
  3. Update `src/middleware.ts` to fetch the session, decode the access token, and verify the `user_role` custom claim instead of using the user-editable `user_metadata?.role`. A dependency-free helper using `atob` is proposed.

---

## 5. Verification Method

1. **Verify Database Policy Recursion Fix**:
   - Run a select query on `user_profiles` simulating an admin user:
     ```sql
     SET request.jwt.claims = '{"user_role": "admin"}';
     SELECT * FROM public.user_profiles;
     ```
   - Confirm it returns the rows without a recursion loop error.

2. **Verify Middleware Changes**:
   - Run type check and lint tools to verify no code structure is broken:
     ```powershell
     pnpm run type-check
     pnpm run lint
     ```
   - Run the E2E test suite to check for regressions:
     ```powershell
     pnpm run test:e2e
     ```
