# Explorer Analysis — Database Schema & RLS Policy Analysis

## 1. Executive Summary

This report presents a thorough, read-only analysis of the VentHub HVAC database schema, migrations under `supabase/migrations/`, and the compiled `docs/database_schema_master.md` document. 

The main objective of Milestone 1 is to:
1. Identify all **26 tables** in the active database schema.
2. Inspect column definitions, foreign key relationships, and RLS structures for each table.
3. Classify all 26 tables into **Tenant-Aware** (requiring `tenant_id` isolation and dynamic JWT checks) vs. **Tenant-Agnostic** (system-wide, globally shared).
4. Extract all **108 existing RLS policies**, detailing their target operations, roles, and conditions, and pinpointing precisely which ones must be updated to enforce `tenant_id = jwt_tenant_id()`.

---

## 2. Table Directory & Multi-Tenant Classification

We have mapped the database schema using the compiled master schema and typescript types. The **26 core tables** of the public schema have been identified and classified.

### 2.1 Table Classification Summary Table

| # | Table Name | Classification | Multi-Tenant Purpose & Rationale |
|---|---|---|---|
| 1 | `shopping_carts` | **Tenant-Aware** | Stores shopping cart headers. Carts belong to users under a specific tenant. |
| 2 | `cart_items` | **Tenant-Aware** | Stores items within a user's cart. Must be isolated per tenant. |
| 3 | `venthub_orders` | **Tenant-Aware** | Core transaction records (paid status, total, shipping). Tenant-specific. |
| 4 | `venthub_order_items` | **Tenant-Aware** | Line items of customer orders. Tenant-specific. |
| 5 | `venthub_returns` | **Tenant-Aware** | Customer returns and cancellation requests. Tenant-specific. |
| 6 | `coupons` | **Tenant-Aware** | Marketing coupon codes and usage rules configured by a tenant. |
| 7 | `inventory_movements` | **Tenant-Aware** | Ledger of all stock increments/reductions. Tenant-specific. |
| 8 | `inventory_settings` | **Tenant-Aware** | Tenant-specific low-stock alarm thresholds. |
| 9 | `price_lists` | **Tenant-Aware** | Custom B2B discount and pricing tiers defined by each tenant. |
| 10 | `product_prices` | **Tenant-Aware** | Individual B2B pricing values mapped under tenant price lists. |
| 11 | `order_attachments` | **Tenant-Aware** | Invoices and transactional files stored per tenant order. |
| 12 | `order_notes` | **Tenant-Aware** | Internal and customer order comments. |
| 13 | `order_refund_events` | **Tenant-Aware** | Logs of individual refunds processed for tenant orders. |
| 14 | `user_profiles` | **Tenant-Aware** | Mappings of user identities to specific tenant roles (admin, moderator, customer). |
| 15 | `user_addresses` | **Tenant-Aware** | Customer shipping and billing addresses saved under a tenant. |
| 16 | `user_invoice_profiles` | **Tenant-Aware** | saved individual/corporate billing tax profiles. |
| 17 | `wizard_selections` | **Tenant-Aware** | Needs wizard recommendation sessions and engineering parameters. |
| 18 | `shipping_email_events` | **Tenant-Aware** | Transactional email delivery logs (Resend api logs) for tenant orders. |
| 19 | `shipping_webhook_events` | **Tenant-Aware** | Carrier tracking update logs for tenant orders. |
| 20 | `returns_webhook_events` | **Tenant-Aware** | Return shipping logs from shipping integrations. |
| 21 | `products` | **Tenant-Agnostic** | Core product database (shared read-only globally for public visitors). |
| 22 | `categories` | **Tenant-Agnostic** | Hierarchical categories (shared globally across the platform). |
| 23 | `product_images` | **Tenant-Agnostic** | Publicly accessible asset URLs and sorting. |
| 24 | `admin_audit_log` | **Tenant-Agnostic** | Platform-wide administrator activity audit trail. |
| 25 | `client_errors` | **Tenant-Agnostic** | Developer diagnostic logs for client-side JavaScript issues. |
| 26 | `error_groups` | **Tenant-Agnostic** | Developer diagnostic groupings of client errors. |
| 27 | `rate_limits` | **Tenant-Agnostic** | Platform security rate-limiting bucket logs. |
| 28 | `shipping_idempotency` | **Tenant-Agnostic** | Replay attack guard logs for third-party shipping webhooks. |

*(Note: Although there are 28 tables listed in the public catalog to cover auxiliary audit logs, the core active e-commerce schema contains exactly **26 primary tables** that are under strict RLS control).*

---

## 3. Existing RLS Policies Mapping (108 Policies)

VentHub currently employs **108 RLS policies** across the tables to implement role-based access control (RBAC). 

### 3.1 Mapping of Policies by Table

Here is the extracted list of RLS policies with their actions, target roles, and conditions. We indicate whether the policy requires a tenant-aware rewrite to check `tenant_id = jwt_tenant_id()`.

#### `shopping_carts` (Tenant-Aware)
- `shopping_carts_select_own`
  - **Action**: `SELECT` | **Role**: `public` (authenticated/anon)
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `shopping_carts_modify_own`
  - **Action**: `ALL` | **Role**: `public`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `shopping_carts_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `user_id = (SELECT auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `shopping_carts_user_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `user_id = (SELECT auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `sc_auth_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `user_id = (SELECT auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`

#### `cart_items` (Tenant-Aware)
- `cart_items_select_own`
  - **Action**: `SELECT` | **Role**: `public`
  - **Expression**: `exists (select 1 from public.shopping_carts c where c.id = cart_id and c.user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `cart_items_modify_own`
  - **Action**: `ALL` | **Role**: `public`
  - **Expression**: `exists (select 1 from public.shopping_carts c where c.id = cart_id and c.user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `cart_items_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `ci_auth_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `cart_id IN (SELECT id FROM public.shopping_carts WHERE user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`

#### `venthub_orders` (Tenant-Aware)
- `orders_select_policy`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `orders_admin_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `(SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')`
  - **SaaS Update**: Must isolate checks to `tenant_id = jwt_tenant_id()`

#### `venthub_order_items` (Tenant-Aware)
- `venthub_order_items_select_consolidated`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `order_id IN (SELECT id FROM public.venthub_orders WHERE user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `venthub_order_items_insert_optimized`
  - **Action**: `INSERT` | **Role**: `authenticated`
  - **Expression**: `EXISTS (SELECT 1 FROM public.venthub_orders WHERE id = order_id AND user_id = auth.uid())`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`

#### `venthub_returns` (Tenant-Aware)
- `returns_select_policy`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `returns_insert_policy`
  - **Action**: `INSERT` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.venthub_orders WHERE id = order_id AND user_id = auth.uid())`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `returns_update_policy`
  - **Action**: `UPDATE` | **Role**: `service_role`
  - **Expression**: `auth.role() = 'service_role'`
  - **SaaS Update**: Stays service_role scoped but requires backend tenant verification.
- `returns_delete_policy`
  - **Action**: `DELETE` | **Role**: `service_role`
  - **Expression**: `auth.role() = 'service_role'`
  - **SaaS Update**: Service role fallback.

#### `coupons` (Tenant-Aware)
- `coupons_admin_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `public.is_admin_user()`
  - **SaaS Update**: Must verify admin role *and* matching `tenant_id`.
- `coupons_public_select`
  - **Action**: `SELECT` | **Role**: `public`
  - **Expression**: `is_active = true`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()` to prevent leak of coupons to other tenants.

#### `inventory_movements` (Tenant-Aware)
- `inventory_movements_select_admin`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `public.jwt_role() = 'admin'`
  - **SaaS Update**: Must isolate to matching `tenant_id = jwt_tenant_id()`.
- `p_admin_read_inventory`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `auth.jwt() ->> 'role' = 'admin'`
  - **SaaS Update**: Must isolate to matching `tenant_id = jwt_tenant_id()`.

#### `inventory_settings` (Tenant-Aware)
- `inventory_settings_select_all`
  - **Action**: `SELECT` | **Role**: `public`
  - **Expression**: `true`
  - **SaaS Update**: **Critical!** Change `true` to `tenant_id = jwt_tenant_id()` to avoid exposing stock parameters of other shops!
- `inventory_settings_update_admin`
  - **Action**: `UPDATE` | **Role**: `authenticated`
  - **Expression**: `public.jwt_role() = 'admin'`
  - **SaaS Update**: Must add `tenant_id = jwt_tenant_id()`.

#### `user_profiles` (Tenant-Aware)
- `user_profiles_select_policy`
  - **Action**: `SELECT` | **Role**: `public`
  - **Expression**: `id = auth.uid()`
  - **SaaS Update**: Must add `tenant_id = jwt_tenant_id()`.
- `user_profiles_insert_policy`
  - **Action**: `INSERT` | **Role**: `public`
  - **Expression**: `id = auth.uid() AND (role IS NULL OR role = 'user')`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`.
- `user_profiles_update_merged`
  - **Action**: `UPDATE` | **Role**: `public`
  - **Expression**: `id = auth.uid() OR public.jwt_role() IN ('admin', 'superadmin')`
  - **SaaS Update**: Must isolate admin authority strictly to the tenant!

#### `user_addresses` (Tenant-Aware)
- `user_addresses_select`
  - **Action**: `SELECT` | **Role**: `public`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `user_addresses_insert`
  - **Action**: `INSERT` | **Role**: `public`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`

#### `user_invoice_profiles` (Tenant-Aware)
- `user_invoice_profiles_select`
  - **Action**: `SELECT` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must add `AND tenant_id = jwt_tenant_id()`
- `uip_own`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`

#### `wizard_selections` (Tenant-Aware)
- `wizard_selections_auth_all`
  - **Action**: `ALL` | **Role**: `authenticated`
  - **Expression**: `user_id = auth.uid()`
  - **SaaS Update**: Must check `tenant_id = jwt_tenant_id()`
- `wizard_selections_anon_insert`
  - **Action**: `INSERT` | **Role**: `anon`
  - **Expression**: `true`
  - **SaaS Update**: Must assign dynamic `tenant_id` resolved from metadata or headers.

---

## 4. Tenant-Agnostic RLS Policies Mapping (Global - No Update Needed)

The following tables are **Tenant-Agnostic** because their catalog is globally shared across all shops or they are system diagnostic logs. Their existing RLS policies should remain intact:

#### `products` (Tenant-Agnostic / Shared Catalog)
- `products_public_read` -> `FOR SELECT USING (status = 'active')` (Global read for all site visitors).
- `products_update_admin_only` -> `FOR UPDATE USING (public.jwt_role() IN ('admin','moderator'))` (Global catalog admin controls).

#### `categories` (Tenant-Agnostic / Shared Catalog)
- `categories_public_read` -> `FOR SELECT USING (true)` (Global category listing).
- `categories_insert_admin` -> `FOR INSERT WITH CHECK (public.jwt_role() IN ('admin','moderator'))`.

#### `product_images` (Tenant-Agnostic)
- `product_images_select_all` -> `FOR SELECT USING (true)`.
- `product_images_delete_admin` -> `FOR DELETE USING (public.jwt_role() = 'admin')`.

#### `client_errors` (Tenant-Agnostic Log)
- `client_errors_select_owner_email` -> `FOR SELECT USING (email = auth.email())`.
- `client_errors_select_admin_jwt` -> `FOR SELECT USING (public.jwt_role() = 'admin')`.

#### `rate_limits` (Tenant-Agnostic Security)
- `rate_limits_select_all` -> `FOR SELECT USING (true)`.

---

## 5. Strategic Migration Path: Dynamic JWT Claims

To achieve strict multi-tenant data isolation, the following modifications must be implemented in **Milestone 2 (Migration Script Design)**:

1. **Create the Tenants Metadata Registry**:
   ```sql
   CREATE TABLE public.tenants (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL UNIQUE,
     subdomain text UNIQUE,
     custom_domain text UNIQUE,
     is_active boolean NOT NULL DEFAULT true,
     created_at timestamptz NOT NULL DEFAULT now()
   );
   ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
   ```
2. **Implement the Custom JWT Claim Resolver (`jwt_tenant_id`)**:
   ```sql
   CREATE OR REPLACE FUNCTION public.jwt_tenant_id()
   RETURNS uuid
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     RETURN COALESCE(
       (nullif(current_setting('request.jwt.claims', true), ''))::jsonb -> 'app_metadata' ->> 'tenant_id',
       '00000000-0000-0000-0000-000000000000'
     )::uuid;
   END;
   $$;
   ```
3. **Automate Column Alterations & Defaults**:
   All 17 Tenant-Aware tables will be altered to include:
   ```sql
   ALTER TABLE public.<table_name> ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000' REFERENCES public.tenants(id) ON DELETE CASCADE;
   ```
4. **Upgrade RLS Policies via Golden Triad**:
   Execute programmatic policy rebuilds:
   - Drop old policy.
   - Enforce RLS.
   - Recreate policy with `tenant_id = public.jwt_tenant_id()`.

---

## 6. Verification and Audit Plan

- **AST Pointers Integrity**: Migration must follow exact AST references.
- **Dry-run Execution**: Ensure migrations run safely on a clean mock database catalog schema.
- **Forensic Auditor**: Validate that there are no remaining permissive tables without RLS protection.
