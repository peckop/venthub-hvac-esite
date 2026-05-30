## 2026-05-30T19:16:04Z

### 1. Edge-Safe Tenant Resolver
Create the file `src/lib/tenantResolver.ts`.
It must export:
- `export interface TenantInfo { tenantId: string; slug: string; }`
- `export function resolveTenant(host: string | null | undefined): TenantInfo`
Implement the resolver with the following requirements:
- Use default tenant UUID `'d3b07384-d113-495f-a558-8c38634e0000'` and slug `'default'`.
- In development/localhost (or empty/missing host), return the default tenant UUID and slug `'default'`.
- Clean host from port (e.g. `localhost:3000` -> `localhost`).
- Handle subdomain mapping (e.g. `tenant1.localhost` or `tenant1.venthub.com` should extract the subdomain `'tenant1'`). If the subdomain is `'www'` or `'api'`, return the default tenant. Otherwise, since we only have the default tenant in our database right now, map the tenantId to the default tenant ID `'d3b07384-d113-495f-a558-8c38634e0000'` but return the extracted slug in the return object.

### 2. Middleware Tenant Injection
Modify `src/middleware.ts` to call your resolver and propagate the tenant context:
- Import `resolveTenant` from `./lib/tenantResolver`.
- At the very beginning of the `middleware` function:
  1. Extract the host header: `const host = request.headers.get('host') || ''`
  2. Resolve the tenant info: `const { tenantId, slug } = resolveTenant(host)`
  3. Set request header `x-tenant-id`: `request.headers.set('x-tenant-id', tenantId)`
  4. Preserve all original i18n detection, detectLocale, and admin RBAC guard (do not modify how routing/redirects work).
  5. Ensure that ALL returned responses (including redirects and rewrites) have the cookie `tenant_id` set to `tenantId`.
     Define a helper function:
     ```typescript
     const setTenantCookie = (res: NextResponse) => {
       res.cookies.set('tenant_id', tenantId, {
         path: '/',
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production',
       });
       return res;
     };
     ```
     Wrap every returned response inside `middleware(request)` with `setTenantCookie(...)` before returning it!
     Wait, do NOT make any database queries inside `src/middleware.ts` for tenant resolution.

### 3. Supabase Auth Claims Integration (PostgreSQL Migration)
Create a new migration file: `supabase/migrations/20260530221000_tenant_auth_integration.sql`.
This migration must:
- Add a `BEFORE INSERT ON auth.users` trigger and trigger function `public.handle_new_user_metadata()` that:
  - Extracts `tenant_id` from `new.raw_user_meta_data->>'tenant_id'`.
  - If not found or if the tenant is not active/valid, defaults to `'d3b07384-d113-495f-a558-8c38634e0000'::uuid`.
  - Injects `tenant_id` into `new.raw_app_meta_data` (using `jsonb_set`) so it's included in JWT claims.
  - Also sets it in `new.raw_user_meta_data` (using `jsonb_set`).
- Add an `AFTER INSERT ON auth.users` trigger and trigger function `public.handle_new_user_profile()` that:
  - Extracts the resolved `tenant_id` from `new.raw_app_meta_data->>'tenant_id'`.
  - Inserts a new row into `public.user_profiles` mapping `id = new.id`, `tenant_id = resolved_tenant_id`, `full_name = new.raw_user_meta_data->>'full_name'`, and `role = COALESCE(new.raw_user_meta_data->>'role', 'user')` on conflict update.
Ensure both triggers use `SECURITY DEFINER` and have their search paths set properly (`SET search_path = public, pg_catalog`).

### 4. Client-side Signup Modification
Modify `src/contexts/AuthContext.tsx` to read the `tenant_id` cookie from `document.cookie` when `signUp` is executed, and include it in `options.data`:
- Inside `signUp` function:
  ```typescript
  const tenantId = typeof document !== 'undefined'
    ? document.cookie.split('; ').find(row => row.startsWith('tenant_id='))?.split('=')[1]
    : undefined;
  ```
- Set `tenant_id` in `options.data`:
  ```typescript
  options: { 
    data: { 
      full_name: name,
      tenant_id: tenantId || 'd3b07384-d113-495f-a558-8c38634e0000'
    } 
  }
  ```

### 5. Verification
- Verify that the app compiles successfully by running `pnpm run type-check`.
- Provide a summary of the edits and compiler check results in your `handoff.md` and send a completion message back.
