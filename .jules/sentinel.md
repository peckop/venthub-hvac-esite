## 2025-04-24 - Edge Function Auth Destructuring
**Learning:** `supabase-js` v2 `auth.getUser()` strictly returns an object `{ data: { user: User | null }, error: AuthError | null }` even on failure. The intermediate object access `data?.user` is not needed and violates TS strict configurations if the result is improperly typed as optional.
**Action:** Always strictly destructure using `const { data: { user }, error } = await supabase.auth.getUser()`.

## 2025-04-24 - PostgreSQL Initplan RLS Vulnerability
**Learning:** Calling `auth.uid()` directly inside PostgreSQL RLS policies can bypass initplan caching, causing PostgreSQL to evaluate the function for every single row scanned, leading to massive query degradation.
**Action:** Always wrap RLS authentication functions inside a sub-select, e.g., `(SELECT auth.uid())`, to force caching in the database planner.
