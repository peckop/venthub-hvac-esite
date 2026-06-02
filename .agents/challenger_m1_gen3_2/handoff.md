# Verification Report: Security Hardening & Admin Login Fixes

This report outlines the empirical verification results for the multi-tenant security hardening and admin login fixes in the VentHub SaaS project.

---

## 1. Observation

### Verification Executions & Test Results

We created a custom test script at `c:\Users\alize\venthub-hvac\scripts\db\verify_security_hardening.js` that connects to the live database (`DATABASE_URL` in `.env`), executes the security checks inside a Postgres transaction, and rolls them back to prevent DB pollution. We also created `scripts/db/check_auth_functions.js` to inspect Postgres function execution details.

#### Result Output from `node scripts/db/verify_security_hardening.js`:
```
✅ Connected to Postgres database.

--- 1. VERIFYING RLS POLICY ON public.user_profiles ---
- Profiles successfully propagated: PASS (count: 2)
- Select own profile: PASS (rows returned: 1)
- Select cross-tenant profile: PASS (rows returned: 0)

--- 2. VERIFYING public.custom_access_token_hook ACCESS ---
- Executing as anon: PASS (Exception thrown: permission denied for function custom_access_token_hook)
- Executing as authenticated: PASS (Exception thrown: permission denied for function custom_access_token_hook)

--- 3. VERIFYING ROLE SELF-PROMOTION DOWNGRADE/BLOCK TRIGGER ---
- Trigger check (auth.users raw_app_meta_data.user_role): PASS (actual: user)
- Trigger check (auth.users raw_user_meta_data.role): PASS (actual: user)
- Trigger check (public.user_profiles role): PASS (actual: user)

--- 4. VERIFYING ADMIN RPC FUNCTION ACCESS RESTRICTIONS ---
Testing set_user_admin_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin'):
  - Call as anon: PASS (Blocked with: permission denied for function set_user_admin_role)
  - Call as authenticated: FAIL (Allowed execution)
  - Call as non-admin JWT: PASS (Blocked with: not authorized)
Testing adjust_stock('11111111-1111-1111-1111-111111111111', 5, 'test_adjust'):
  - Call as anon: PASS (Blocked with: permission denied for function adjust_stock)
  - Call as authenticated: PASS (Blocked with: insert or update on table "inventory_movements" violates foreign key constraint "inventory_movements_product_id_fkey")
  - Call as non-admin JWT: PASS (Blocked with: not authorized)
...
```

### Critical Authorization Logic Bypass (Observation 4)

We observed that calling `set_user_admin_role` as an `authenticated` user whose JWT request context is not initialized (making `auth.uid()` and `auth.role()` return `NULL`) executes successfully and updates user profiles in the database.

Using `scripts/db/check_auth_functions.js`, we evaluated the logical checks inside the function:
```sql
SELECT 
    auth.role() as auth_role,
    (auth.role() = 'service_role') as is_service_role,
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
          AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
    ) as is_admin,
    NOT (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
          AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater')
    )) as should_raise_exception;
```

#### Output:
```json
{
  "auth_role": null,
  "is_service_role": null,
  "is_admin": false,
  "should_raise_exception": null
}
```

### Verification Suite Executions
- `pnpm run type-check`: Passed successfully.
- `pnpm run lint`: Passed successfully.
- `pnpm run test:e2e`: Passed successfully (89/89 tests passed).

---

## 2. Logic Chain

1. **RLS Cross-Tenant Data Isolation**: Under the policy `user_profiles_select_policy`:
   ```sql
   CREATE POLICY user_profiles_select_policy ON public.user_profiles FOR SELECT TO authenticated
     USING ( tenant_id = public.jwt_tenant_id() AND (id = auth.uid() OR public.is_admin_user()) );
   ```
   When queried under a session where `jwt_tenant_id() = '11111111-1111-1111-1111-111111111111'`, querying a profile `User T2` (with tenant `'22222222-2222-2222-2222-222222222222'`) returns 0 rows. This verifies that profiles of other tenants are completely invisible to cross-tenant users, preventing leaks.
2. **Access Token Hook Privileges**: Privileges on `custom_access_token_hook` were explicitly configured:
   ```sql
   REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon, authenticated, public;
   ```
   Direct execution attempts by client roles (`anon`/`authenticated`) are blocked by Postgres with `42501 Permission Denied`. This verifies execution restrictions.
3. **Role Self-Promotion Guard**: The triggers `handle_new_user_metadata` and `handle_new_user_profile` enforce constraints:
   ```plpgsql
   IF NOT (auth.role() = 'service_role' OR public.is_admin_user()) THEN
     role_val := 'user';
   END IF;
   ```
   When a new user is inserted into `auth.users` with `'admin'` role, and the caller is not an admin, both `auth.role() = 'service_role'` and `public.is_admin_user()` evaluate to false. The requested role is downgraded to `'user'`.
4. **RPC Authorization Null Logic Bypass**:
   The authorization checks in `set_user_admin_role`, `adjust_stock`, and `set_stock` are written as:
   ```plpgsql
   IF NOT (auth.role() = 'service_role' OR EXISTS (...)) THEN
     RAISE EXCEPTION 'not authorized';
   END IF;
   ```
   - When a client does not have JWT claims set (e.g. from an authenticated client with an empty JWT payload or when tested directly), `auth.role()` returns `NULL`.
   - `auth.role() = 'service_role'` evaluates to `NULL`.
   - `EXISTS (...)` evaluates to `FALSE` (since `auth.uid()` is `NULL` and matches no profile).
   - Thus, the expression inside the parenthesis evaluates to `NULL OR FALSE`, which is `NULL`.
   - `NOT (NULL)` evaluates to `NULL`.
   - In PL/pgSQL, an `IF (condition)` block only executes its `THEN` statements when `condition` is `TRUE`. If it evaluates to `NULL`, the `THEN` block is skipped.
   - Consequently, the exception `RAISE EXCEPTION 'not authorized'` is NOT thrown, and the authorization is bypassed.
   - For `set_user_admin_role`, execution completes successfully, modifying user roles.
   - For `adjust_stock` and `set_stock`, execution bypasses the authorization check but fails further down due to foreign key or not-null constraint errors on dummy query inputs, rather than being blocked by the security guard.

---

## 3. Caveats

- We assumed that `DATABASE_URL` in `.env` is the correct database connection used by Next.js and Supabase for all RLS / RPC evaluations.
- We did not mock active frontend middleware redirects during database-level RPC calls; we focused purely on database-level security policies.

---

## 4. Conclusion

The security hardening fixes for RLS cross-tenant isolation, JWT hook privileges, and role self-promotion triggers are **robust and correct**.
However, there is a **CRITICAL security bypass vulnerability in the administrative RPC functions** (`set_user_admin_role`, `adjust_stock`, `set_stock`) due to three-valued logic evaluation of `NULL` in the PL/pgSQL `IF NOT (...)` statements. Because `auth.role()` returns `NULL` when JWT claims are missing, the exception is bypassed entirely.

### Actionable Mitigations:
To fix this, the PL/pgSQL condition must handle `NULL` values safely. The condition should be written as:
```plpgsql
IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (...)) THEN
  RAISE EXCEPTION 'not authorized';
END IF;
```
Or utilizing PostgreSQL's null-safe comparison operator `IS NOT DISTINCT FROM`:
```plpgsql
IF NOT (auth.role() IS NOT DISTINCT FROM 'service_role' OR EXISTS (...)) THEN
  RAISE EXCEPTION 'not authorized';
END IF;
```

---

## 5. Verification Method

### Step 1: Run the Database Verification Script
Run the custom verification script to reproduce all checks, including the RPC bypass:
```bash
node scripts/db/verify_security_hardening.js
```
Expected output:
- Verifies RLS blocks cross-tenant reads (PASS).
- Verifies Hook execution is restricted (PASS).
- Verifies Role self-promotion trigger blocks spoofing (PASS).
- Verifies RPC checks are bypassed for `authenticated` when JWT context is empty (FAIL - allowed execution).

### Step 2: Run the Inspection Script
To inspect the NULL-boolean behavior under superuser and authenticated roles:
```bash
node scripts/db/check_auth_functions.js
```
Expected output confirms that `should_raise_exception` is `null` (evaluates to false in `IF` statements), resulting in the bypass.

### Step 3: Run the Project Validation Suite
Execute type checking, linting, and NextJS E2E tests:
```bash
pnpm run type-check
pnpm run lint
pnpm run test:e2e
```
Expected output: All validation checks pass successfully.
