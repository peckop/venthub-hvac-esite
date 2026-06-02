# Handoff Report — Explorer 2

This report completes the investigation phase for Milestone 1 Security & RLS Policy Hardening audit.

## 1. Observation

1. **SECURITY DEFINER Functions**:
   - Running `scan_functions.js` (which queried `pg_proc` where `prosecdef = true`) returned 30 security definer functions.
   - For 20 of these functions, the default access control `proacl` column is null or grants privileges to `public`, allowing execution by `anon` and `authenticated`.
   - File path of scan output: `c:\Users\alize\venthub-hvac\.agents\explorer_m1_2\functions_scan.json`.

2. **RLS Policies**:
   - Running `scan_policies.js` (which queried `pg_policies` for schema `public`) returned 133 active RLS policies.
   - Running `analyze_policies.js` to search for the 27 obsolete policies listed in R4 of `ORIGINAL_REQUEST.md` (e.g. `user_addresses_select`, `orders_insert_policy`) showed that all 27 of them are **ABSENT** in the current database.
   - Running `check_applied_migrations.js` against `supabase_migrations.schema_migrations` showed that the latest applied migration is `20260430204538`.
   - The multi-tenant migration `supabase/migrations/20260530220000_tenant_schema_setup.sql` contains `CREATE POLICY` statements for these 27 policies (e.g., line 557: `CREATE POLICY "user_addresses_select" ON public.user_addresses`), but is not yet applied to the database.
   - Consolidated `merged_*` policies (e.g. `merged_user_addresses_authenticated_select`) are currently active in the database.

3. **Webhook Trigger Search Path**:
   - `scripts/webhook_setup.sql` lines 5-35:
     ```sql
     CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
     RETURNS TRIGGER AS $$
     ...
     $$ LANGUAGE plpgsql SECURITY DEFINER;
     ```
     No `SET search_path` option is specified.

4. **Hardcoded Webhook Secret**:
   - `scripts/webhook_setup.sql` line 10 contains:
     ```sql
     webhook_secret text := 'whsec_venthub_a61f54b2bcff63f221259b315256d006';
     ```
   - `scripts/setup_webhooks.js` and `scripts/setup_webhooks_cli.js` contain:
     ```js
     webhook_secret text := '${secret}';
     ```
     This interpolates the environment secret into the SQL function definition during execution.

5. **Debug Functions**:
   - `supabase/migrations/20250909_debug_rls_product_images.sql` defines:
     - `public.debug_context()`
     - `public.debug_policies_product_images()`
   - Running `scan_debug_functions.js` (which queried `pg_proc` for these names in public schema) returned 0 functions.
   - Querying `supabase_migrations.schema_migrations` for version `20250909` returned 0 matching applied migrations.

6. **Database Vault Schema**:
   - Running `check_vault.js` confirmed that the schema `vault` exists and contains tables `secrets` and `decrypted_secrets`.

---

## 2. Logic Chain

1. **SECURITY DEFINER Functions**:
   - *Premise*: By default, PostgreSQL functions are executable by `public`.
   - *Observation*: 20 out of 30 `SECURITY DEFINER` functions in the database have `public` execution privileges.
   - *Inference*: Therefore, these functions can be executed directly via PostgREST RPC by `anon` or `authenticated` users unless their privileges are explicitly revoked using `REVOKE EXECUTE`.

2. **RLS Policies**:
   - *Observation*: All 27 R4 policies are absent in the database, but active in `20260530220000_tenant_schema_setup.sql`. The database migration state is currently at `20260430204538`.
   - *Inference*: Once the multi-tenant migration `20260530220000` is applied, it will recreate these duplicate non-merged policies in the database.
   - *Inference*: Having both `merged_*` and duplicate non-merged policies active concurrently will cause permissive `OR` overlaps, rendering tenant isolation checks in `merged_*` policies redundant or bypassed if the non-merged policies are weaker. Therefore, they must be cleaned up in or after `20260530220000` is run.

3. **Webhook Trigger Search Path**:
   - *Observation*: `handle_supabase_webhook()` runs as a `SECURITY DEFINER` function without a defined `search_path`.
   - *Inference*: The function executes using the calling user's search path. A malicious user who can trigger it could hijack execution by defining custom functions or types in their own schema.
   - *Conclusion*: It is vulnerable and must be modified to include `SET search_path = pg_catalog, public, net`.

4. **Hardcoded Webhook Secret**:
   - *Observation*: The secret is in clear text in SQL scripts or interpolated directly into the database function definition.
   - *Observation*: The `vault` schema with table `decrypted_secrets` is active in the database.
   - *Conclusion*: Instead of hardcoding the secret in the function code, we can store it in the Vault and query it dynamically inside the function, removing the secret text from the code repository.

5. **Debug Functions**:
   - *Observation*: The migration defining the debug helpers has not been applied, and the functions do not exist in the database.
   - *Inference*: Since they are not in the database and represent a security leak if applied, deleting `20250909_debug_rls_product_images.sql` from the repository will prevent them from ever being deployed.

---

## 3. Caveats

- **No Caveats**: The database connection was fully established and all queries were run directly on the live database. No assumptions were made about the live database state.

---

## 4. Conclusion

The database requires key security hardening actions:
1. **Revoke default EXECUTE privileges** from `public`, `anon`, and `authenticated` roles on trigger functions and restricted business logic RPCs (Category B and Category C).
2. **Prevent policy duplication conflict** when running the multi-tenant SaaS schema migration `20260530220000` by dropping the recreated non-merged policies.
3. **Add `SET search_path = pg_catalog, public, net`** to `handle_supabase_webhook()`.
4. **Migrate the webhook signature secret to Supabase Vault** and query it dynamically inside `handle_supabase_webhook()`.
5. **Delete `20250909_debug_rls_product_images.sql`** to prevent deployment of unsafe debugging functions.

---

## 5. Verification Method

- To verify function permissions, run `node .agents/explorer_m1_2/scan_functions.js` and inspect `functions_scan.json`. Confirm that the `access_privileges` field is populated with secure privileges (e.g. `{service_role=X/postgres}`) and not null or public for Category B/C.
- To verify policy presence, run `node .agents/explorer_m1_2/scan_policies.js` and confirm that no duplicate permissive policies exist on the tables.
- To verify `handle_supabase_webhook` search path, query the `proconfig` column of `pg_proc` for `handle_supabase_webhook`:
  ```sql
  SELECT proconfig FROM pg_proc WHERE proname = 'handle_supabase_webhook';
  ```
  Verify it returns `{search_path=pg_catalog,public,net}`.
- To verify webhook secret vaulting, verify that no plain-text secret string exists in the function source code:
  ```sql
  SELECT prosrc FROM pg_proc WHERE proname = 'handle_supabase_webhook';
  ```
