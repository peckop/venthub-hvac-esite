# Database Security & RLS Policy Hardening Analysis Report

**Date**: 2026-06-02  
**Agent**: Explorer 2  
**Mission**: Security Audit of Database Functions, RLS Policies, Webhooks, and Debug Helpers  

---

## Executive Summary
This report presents the findings of a comprehensive read-only investigation of the VentHub database. By executing automated physical scans directly against the live database and analyzing workspace migrations, we identified key security vulnerabilities and discrepancies between migration source files and the database state:
1. **Excessive execution privileges** are granted on **20 out of 30 `SECURITY DEFINER` functions** to `public`, `anon`, and `authenticated` roles. This allows direct RPC execution bypasses unless restricted.
2. **Obsolete/duplicate RLS policies** from the `ORIGINAL_REQUEST.md` (R4) list are **not currently present** in the database because the multi-tenant migration `20260530220000_tenant_schema_setup.sql` has not been applied (latest applied migration is `20260430204538`). Once applied, these non-merged policies will be recreated alongside the active `merged_*` policies, introducing permissive `OR` overlaps.
3. The `handle_supabase_webhook()` trigger function lacks a secure `search_path`, making it vulnerable to search path hijacking.
4. The webhook signature secret is hardcoded in the trigger SQL setup script. It can be secured using the database's native `vault` schema.
5. The debug helpers `debug_context` and `debug_policies_product_images` are **absent** from the database because their migration has not been applied.

---

## 1. SECURITY DEFINER Functions Audit & Privilege Hardening

### 1.1 Privilege Analysis
PostgreSQL grants execution rights to `public` (everyone) by default when a function is created. For `SECURITY DEFINER` functions (which run with the privileges of the owner/superuser), this is extremely dangerous. 

Through a database scan, we found **30 `SECURITY DEFINER` functions** in schema `public`. They fall into three execution privilege categories:

#### Category A: Must be Accessible to Public (`anon` and `authenticated`) for RLS
These functions are evaluated inside RLS policy expressions when public users make queries. They must retain `EXECUTE` privileges.
1. `is_admin()`
2. `is_admin_user()`
3. `is_staff_user()`
4. `is_user_admin(user_id uuid)`
5. `jwt_tenant_id()`
6. `get_products_enriched(...)` (an RPC used by customers/guests to browse items)

#### Category B: Internal Database Triggers (Block Direct API Access)
These functions run automatically via database triggers. They do not need to be executed directly via PostgREST RPC. Execution rights must be revoked from `anon` and `authenticated`.
1. `enforce_role_change()` (trigger on user_profiles)
2. `handle_new_user_metadata()` (trigger on auth.users)
3. `handle_new_user_profile()` (trigger on auth.users)
4. `handle_supabase_webhook()` (trigger on products, categories, inventory)
5. `user_invoice_profiles_ensure_single_default()` (trigger on user_invoice_profiles)

#### Category C: Administrative and Service Operations (Restricted)
These functions perform sensitive updates or data retrieval. Execution rights must be revoked from `public`, `anon`, and `authenticated` (unless explicitly gated internally).
1. `adjust_stock(p_product_id, p_delta, p_reason, p_batch_id)` (Admin panel inventory CSV upload)
2. `adjust_stock(p_product_id, p_delta, p_reason)` (Legacy)
3. `adjust_stock_v2(p_product_id, p_delta)` (Legacy)
4. `admin_list_all_users()` (Exposes user emails and phone numbers)
5. `admin_list_users()` (Exposes user list)
6. `fn_admin_get_orders(p_id, p_conv, p_status, p_limit)` (Fetches orders)
7. `fn_admin_update_order_status(p_id, p_status, p_conv)` (Modifies order status)
8. `get_admin_users()` (Lists admin users)
9. `get_user_role(user_id)` (Fetches user role)
10. `increment_coupon_usage(p_code)` (Used by callbacks)
11. `process_order_stock_reduction(p_order_id)` (Idempotent stock reduction RPC)
12. `reverse_inventory_batch(p_batch_id, p_max_minutes)` (Reverses batch stock edits)
13. `reverse_inventory_batch(p_batch_id)` (Overload)
14. `set_stock(p_product_id, p_new_qty, p_reason, p_batch_id)` (Sets stock)
15. `set_stock(p_product_id, p_new_qty, p_reason)` (Overload)
16. `set_user_admin_role(user_id, new_role)` (Modifies user roles)
17. `set_user_role(user_id, new_role)` (Modifies user roles)
18. `update_inventory_settings(p_default_low_stock_threshold)` (Saves inventory settings)
19. `update_inventory_thresholds(p_default, p_reset_overrides)` (Saves inventory settings)

### 1.2 Proposed Remediation Migration
To secure these, we propose executing the following SQL migration. It revokes default execution privileges and adds internal admin-gate guards to functions callable by authenticated admins:

```sql
-- Revoke execution from public, anon, and authenticated on trigger and sensitive RPC functions
REVOKE EXECUTE ON FUNCTION public.enforce_role_change() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_metadata() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_supabase_webhook() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_invoice_profiles_ensure_single_default() FROM public, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_v2(uuid, integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_list_all_users() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_admin_get_orders(text, text, text, integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_admin_update_order_status(text, text, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_order_stock_reduction(text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_stock(uuid, integer, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_inventory_settings(integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_inventory_thresholds(integer, boolean) FROM public, anon, authenticated;

-- Explicitly allow execution of RPCs by authenticated roles, but protect internally:
GRANT EXECUTE ON FUNCTION public.adjust_stock(uuid, integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_get_orders(text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_admin_update_order_status(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_inventory_batch(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_stock(uuid, integer, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_inventory_settings(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_inventory_thresholds(integer, boolean) TO authenticated;

-- Ensure service_role has access to callbacks and business processes
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_order_stock_reduction(text) TO service_role;
```

*Note: For the functions granted to `authenticated`, make sure their code bodies enforce `is_admin_user()` or `is_user_admin(auth.uid())` checks to block standard logged-in customers.*

---

## 2. Obsolete/Duplicate RLS Policies Analysis (R4)

### 2.1 State in Database vs Migrations
A comparison of the 27 obsolete policies listed in R4 of `ORIGINAL_REQUEST.md` against the active database state shows the following findings:
- **Database State**: All 27 policies (e.g. `user_addresses_select`, `orders_insert_policy`, etc.) are **currently absent** in the active database. The database is currently running version `20260430204538`.
- **Migration State**: These policies are recreated in `supabase/migrations/20260530220000_tenant_schema_setup.sql` which has not yet been applied to the database.

### 2.2 The Permissive Overlap Conflict
In the database, the dynamical RLS consolidation of Phase 2 (`20250910_rls_phase2_merge_policies.sql`) generated consolidated `merged_*` policies (e.g., `merged_user_addresses_authenticated_select`).
If `20260530220000_tenant_schema_setup.sql` is executed, it will run `CREATE POLICY` statements to create policies like `user_addresses_select` alongside the existing `merged_user_addresses_authenticated_select`. 

Since PostgreSQL evaluates multiple `PERMISSIVE` policies on the same table and action using `OR` logic, this creates a major risk:
1. **Redundancy & Performance**: PostgreSQL must evaluate both the `merged_*` policy and the newly recreated non-merged policy.
2. **Security Risk**: If any check diverges between the `merged_*` version and the newly recreated policy, the weaker policy will prevail and expose data.

### 2.3 Proposed Remediation
To prevent duplication conflict:
- Either modify `20260530220000_tenant_schema_setup.sql` to avoid creating these non-merged policies, OR
- Run a cleanup script immediately after the tenant migration is applied to drop the duplicate non-merged policies:

```sql
DROP POLICY IF EXISTS "coupons_public_select" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
DROP POLICY IF EXISTS "inventory_movements_select_admin" ON public.inventory_movements;
DROP POLICY IF EXISTS "inventory_settings_select_all" ON public.inventory_settings;
DROP POLICY IF EXISTS "inventory_settings_update_admin" ON public.inventory_settings;
DROP POLICY IF EXISTS "order_attachments_admin_all" ON public.order_attachments;
DROP POLICY IF EXISTS "order_attachments_view_policy" ON public.order_attachments;
DROP POLICY IF EXISTS "order_notes_admin_all" ON public.order_notes;
DROP POLICY IF EXISTS "order_notes_view_policy" ON public.order_notes;
DROP POLICY IF EXISTS "order_refund_events_admin_select" ON public.order_refund_events;
DROP POLICY IF EXISTS "price_lists_admin_all" ON public.price_lists;
DROP POLICY IF EXISTS "price_lists_select" ON public.price_lists;
DROP POLICY IF EXISTS "product_prices_admin_all" ON public.product_prices;
DROP POLICY IF EXISTS "product_prices_select" ON public.product_prices;
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "user_addresses_delete" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_select" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_update" ON public.user_addresses;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "orders_delete_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.venthub_orders;
DROP POLICY IF EXISTS "returns_update_policy" ON public.venthub_returns;
```

---

## 3. Webhook Trigger Search Path Hijacking Vulnerability

### 3.1 Vulnerability Details
In `scripts/webhook_setup.sql`, the trigger function is declared as:
```sql
CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
RETURNS TRIGGER AS $$
...
BEGIN
  ...
  SELECT net.http_post(...) INTO req_id;
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Because it is a `SECURITY DEFINER` function without a defined `search_path`, it evaluates schema object references (like the `to_jsonb` cast, table names, or operators) using the search path of the calling user. A malicious user with table insert privileges could craft custom versions of system functions or operators in a public/tenant schema they control, and trigger this webhook. When the webhook trigger fires, it executes the malicious functions with superuser privileges, hijacking the database.

### 3.2 Mitigation
Secure the function by explicitly declaring `SET search_path = pg_catalog, public, net`. The `net` schema is required since it makes a call to `net.http_post`.

Proposed definition:
```sql
CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
  webhook_secret text;
  req_id bigint;
BEGIN
  -- Construct the payload matching Route Handler expectations
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  -- Retrieve secret securely from Vault (see Section 4)
  SELECT decrypted_secret INTO webhook_secret 
  FROM vault.decrypted_secrets 
  WHERE name = 'supabase_webhook_secret';

  IF webhook_secret IS NULL THEN
    RAISE EXCEPTION 'Webhook secret not found in Vault';
  END IF;

  -- Perform asynchronous HTTP POST request using pg_net
  SELECT net.http_post(
    url := webhook_url,
    body := payload::text,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 5000
  ) INTO req_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, net;
```

---

## 4. Hardcoded Webhook Secret Mitigation via Supabase Vault

### 4.1 Vulnerability Details
The signature secret (`whsec_venthub_a61f54b2bcff63f221259b315256d006`) is currently written as clear text in `scripts/webhook_setup.sql`. While `setup_webhooks.js` generates this dynamically in `.env`, the script eventually deploys it into the database function definition, making the secret visible in plain text to any user query or DB export.

### 4.2 Secure Vault Integration
Since the database contains a `vault` schema with standard tables `secrets` and `decrypted_secrets`, we can store the secret in the database vault and retrieve it dynamically in the trigger function.

#### Step 1: Store secret in Vault
Run this in the database:
```sql
INSERT INTO vault.secrets (secret, name, description)
VALUES ('whsec_venthub_a61f54b2bcff63f221259b315256d006', 'supabase_webhook_secret', 'Webhook secret for VentHub notifications')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

#### Step 2: Retrieve secret dynamically inside function
Modify `handle_supabase_webhook()` function's body to retrieve the secret from `vault.decrypted_secrets`:
```sql
SELECT decrypted_secret INTO webhook_secret 
FROM vault.decrypted_secrets 
WHERE name = 'supabase_webhook_secret';
```
*(This is already integrated into the proposed function definition in Section 3.2).*

---

## 5. Debug Functions Inspection

### 5.1 Verification
- **File Definition**: The debug helpers are defined in `supabase/migrations/20250909_debug_rls_product_images.sql`.
  - `debug_context()` returns a JSONB containing `current_user`, `auth.uid()`, and JWT claims.
  - `debug_policies_product_images()` returns a table structure listing active policies on `product_images`.
- **Database Presence**: Neither function is currently present in the database.
- **Applied Status**: The migration `20250909_debug_rls_product_images` is not registered in `supabase_migrations.schema_migrations`.
- **Security Recommendation**: Both functions grant `EXECUTE` rights to `anon` and `authenticated` roles in the migration file. This represents an information disclosure risk. The migration file `20250909_debug_rls_product_images.sql` should be deleted, and if these functions are ever created, they should be dropped using:
  ```sql
  DROP FUNCTION IF EXISTS public.debug_context();
  DROP FUNCTION IF EXISTS public.debug_policies_product_images();
  ```
