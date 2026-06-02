# Analysis Report: Supabase Security Hardening & Admin Guard Fix

This report details the investigation of RLS policy recursion on the `user_profiles` table, the security vulnerabilities in the middleware admin guard, and the proposed implementation of a Custom Access Token Hook to inject user roles securely into JWT claims.

---

## 1. `user_profiles` Table Definition & SELECT RLS Policy Recursion

### Exact Table Definition
Based on the database migrations (`20250903_role_based_admin_system.sql`, `20260303_modul_v_rbac_profile.sql`, and `20260530220000_tenant_schema_setup.sql`), the `public.user_profiles` table is defined as follows:

- **Columns**:
  - `id` `UUID` (Primary Key, references `auth.users(id)` ON DELETE CASCADE)
  - `role` `VARCHAR(20)` (NOT NULL, DEFAULT `'user'`)
  - `full_name` `TEXT` (Nullable)
  - `phone` `TEXT` (Nullable)
  - `created_at` `TIMESTAMPTZ` (NOT NULL, DEFAULT `now()`)
  - `updated_at` `TIMESTAMPTZ` (NOT NULL, DEFAULT `now()`)
  - `tenant_id` `UUID` (NOT NULL, DEFAULT `'d3b07384-d113-495f-a558-8c38634e0000'`, references `public.tenants(id)` ON DELETE CASCADE)

- **Constraints**:
  - Primary key constraint on `id`.
  - Foreign key constraint on `id` referencing `auth.users(id)`.
  - Foreign key constraint on `tenant_id` referencing `public.tenants(id)`.
  - Check constraint `user_profiles_role_check` on the `role` column ensuring it is one of: `('super_admin', 'admin', 'warehouse', 'sales', 'viewer', 'user')`.

- **Indexes**:
  - `idx_user_profiles_role` on `role`
  - `idx_user_profiles_created_at` on `created_at`
  - `idx_user_profiles_tenant_id` on `tenant_id`

### Current SELECT RLS Policy
In the migration `20260530220000_tenant_schema_setup.sql` (lines 524-526), the SELECT policy is defined as:
```sql
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.jwt_tenant_id() AND (id = (SELECT auth.uid()) OR public.is_admin_user()));
```

### Why the Recursion Occurs
The recursion loop is triggered because of the `public.is_admin_user()` helper function in the policy:
1. A SELECT query is executed on `public.user_profiles` for a user profile (where `id = auth.uid()` is false, or as part of a list query).
2. The Postgres engine evaluates `"user_profiles_select_policy"`.
3. To evaluate the `USING` condition, Postgres calls `public.is_admin_user()`.
4. `public.is_admin_user()` is defined as:
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin_user()
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 FROM public.user_profiles 
       WHERE id = auth.uid() AND role IN ('admin','superadmin')
     );
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```
5. Inside `is_admin_user()`, a SELECT query is run on `public.user_profiles` (`SELECT 1 FROM public.user_profiles ...`).
6. Because RLS is active on `user_profiles`, this inner SELECT query triggers the `"user_profiles_select_policy"` evaluation again.
7. The policy evaluation invokes `public.is_admin_user()` again, which triggers another SELECT query, leading to an **infinite recursion** (`stack depth limit exceeded` error) and failing all admin logins/queries.

### How to Fix the Recursion
To resolve the recursion, we must remove the call to `public.is_admin_user()` from the `user_profiles_select_policy` (and any other policies on the `user_profiles` table). Instead of reading the table, we should extract the user's role directly from the request JWT claims (via `current_setting('request.jwt.claims', true)`). 

For example, using the custom JWT claim `user_role` injected by the hook (described in Section 3):
```sql
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.jwt_tenant_id() AND (
      id = (SELECT auth.uid())
      OR (SELECT auth.role()) = 'service_role'
      OR (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'user_role') IN ('super_admin', 'admin')
    )
  );
```
*Note:* Other tables that use `is_admin_user()` in their RLS policies do NOT cause recursion because they are different tables, and `is_admin_user()` is `SECURITY DEFINER` (running as owner/postgres, which bypasses RLS on `user_profiles`).

---

## 2. Middleware Admin Guard Check in `src/middleware.ts`

The current middleware handles the admin guard check in lines 134-183:

### How and Where it Handles the Check
1. **Path matching**: It checks if the route path first segment is `admin`:
   ```typescript
   if (effectiveSegments[0] === 'admin') {
   ```
2. **Local bypass**: In development, it bypasses the admin guard entirely if host is localhost:
   ```typescript
   const host = request.headers.get('host') || ''
   const isDev = process.env.NODE_ENV === 'development'
   const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1')

   if (isDev && isLocalhost) {
     return setTenantCookie(response)
   }
   ```
3. **Session user check**: It initializes the `@supabase/ssr` server client and fetches the user object:
   ```typescript
   const { data: { user }, error } = await supabase.auth.getUser()
   ```
4. **Vulnerability (User Metadata Role Extraction)**: It extracts the user's role from `user_metadata`:
   ```typescript
   const jwtRole = user.user_metadata?.role

   if (!jwtRole || !ADMIN_ROLES.has(jwtRole.toLowerCase())) {
     // Redirects unauthorized to /
   }
   ```

### Security Vulnerability
`user.user_metadata` represents the `raw_user_meta_data` column in the database. 
- In Supabase, `raw_user_meta_data` is directly writable/editable by the user via the client-side API:
  `await supabase.auth.updateUser({ data: { role: 'admin' } })`
- If a malicious authenticated user calls this, their `user_metadata?.role` becomes `'admin'`, which allows them to bypass the middleware check and gain access to the `/admin/*` routes.
- **Therefore, authorization guards must NEVER rely on `user_metadata`.**

---

## 3. Implementing the Custom Access Token Hook in Supabase

To fix the security vulnerability, we must inject the user's actual database role into the JWT using a database function that runs on token generation.

### SQL Implementation
We create the custom token hook function in the `public` schema. It queries `public.user_profiles` to find the user's role and sets it as the `user_role` claim in the JWT payload.

```sql
-- 1. Create the hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Retrieve the user's role from the database user_profiles table
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Inject the role into JWT claims as user_role
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
  END IF;

  -- Put the modified claims back in the event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- 2. Configure permissions for the Auth Hook
-- supabase_auth_admin needs to execute the hook and read the public schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON TABLE public.user_profiles TO supabase_auth_admin;

-- Revoke default execution permission from public roles
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
```

### Hook Activation in Supabase
Once the SQL migration is applied, the hook must be configured:
- In the Supabase Dashboard: Navigate to **Authentication** -> **Hooks (Beta)** -> **Customize Access Token (JWT) Claims** -> select `public.custom_access_token_hook` and save.
- In local development (`config.toml`): Add/configure the hook under the auth hooks section:
  ```toml
  [auth.hooks]
  custom_access_token = "public.custom_access_token_hook"
  ```

### Secure Middleware Integration
Instead of calling `supabase.auth.getUser()`, the middleware should read the secure session and decode the custom claim from the JWT access token. 

#### Method A: Dependency-Free & Edge-Safe (Recommended)
Since Next.js Edge Middleware has access to the global `atob` function, we can decode the token payload directly without adding npm dependencies:

```typescript
// Helper to decode JWT payload safely in Next.js Edge Runtime
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

// In src/middleware.ts:
const { data: { session }, error } = await supabase.auth.getSession()

if (error || !session) {
  // redirect to login...
}

const payload = decodeJwt(session.access_token)
const userRole = payload?.user_role

if (!userRole || !ADMIN_ROLES.has(userRole.toLowerCase())) {
  // redirect to unauthorized...
}
```

#### Method B: Using `jwt-decode`
If the package `jwt-decode` is added, the code is:
```typescript
import { jwtDecode } from 'jwt-decode'

// In src/middleware.ts:
const payload = jwtDecode<{ user_role?: string }>(session.access_token)
const userRole = payload.user_role
```

---

## 4. Dependencies for JWT Decoding in `package.json`

A review of `package.json` indicates that:
- **No external JWT decoding library** (like `jwt-decode`, `jsonwebtoken`, `jose`, etc.) is currently declared in `dependencies` or `devDependencies`.
- Therefore, to implement JWT decoding:
  1. We must either add `jwt-decode` to `package.json` (as suggested by the developer notes), or
  2. Implement the dependency-free `decodeJwt` helper function inside `src/middleware.ts` or a utility file. Since it is Edge runtime and has strict requirements, the custom inline base64/atob helper is the most lightweight, robust, and zero-dependency solution.
