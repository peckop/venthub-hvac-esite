# Detailed Security Analysis Report — M1

This report presents the findings from the security investigation of VentHub's Supabase database schema, focused on GraphQL schema exposure, storage bucket listing policies, and excessive anonymous SELECT privileges.

## Executive Summary

1. **GraphQL Schema Exposure**: All tables in the `public` schema that have `SELECT` privileges granted to database roles (e.g., `anon`, `authenticated`) are exposed by default in the GraphQL schema by `pg_graphql`. A total of **32 sensitive or internal tables** are exposed. Restricting GraphQL exposure requires setting the `@graphql({"disabled": true})` table comment, while carefully preserving existing comments on tables like `user_profiles` and `wizard_selections`.
2. **Storage Bucket Listing Policies**: The `product-images` bucket currently has a permissive `SELECT` policy (`product_images_read_public`) that allows public anonymous users to list files. Additionally, the tenant-aware storage policy (`product_images_select_tenant`) contains a critical **name resolution shadowing bug** where `split_part(name, '/', 1)::uuid` compiles as `split_part(t.name, ...)` referencing `tenants.name` instead of `storage.objects.name`. This results in cast failures at runtime when evaluated.
3. **Excessive `anon` SELECT Privileges**: Anonymous users currently have `SELECT` privileges granted on **41 tables and views**, including sensitive resources like `admin_audit_log`, `client_errors`, `payment_transactions`, and `shopping_carts`. Anonymous SELECT privileges should be restricted only to public e-commerce catalog resources (`products`, `categories`, `product_prices`, `product_images`, `price_lists`, and `tenants`), and revoked for all other 35 tables.

---

## 1. GraphQL Schema Exposure

### Mechanism
The `pg_graphql` extension automatically exposes any PostgreSQL table in the `public` schema to the GraphQL endpoint if the query role (e.g., `anon` or `authenticated`) has `SELECT` privileges on that table. While Row Level Security (RLS) protects the row data itself, exposing the schema of internal or administrative tables leaks the entire database structure, table/column names, and relationships.

To hide a table from the GraphQL schema, we must set a comment on the table with the directive `@graphql({"disabled": true})`.

### Existing Table Comments to Preserve
A query on the database metadata revealed that 5 tables in the `public` schema have existing comments. These comments must be preserved by appending the GraphQL directive:

| Table Name | Existing Comment | Proposed Comment (with GraphQL Disabled) |
|---|---|---|
| `user_profiles` | `Kullanıcı profilleri ve rolleri` | `Kullanıcı profilleri ve rolleri \| @graphql({"disabled": true})` |
| `wizard_selections` | `Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı` | `Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı \| @graphql({"disabled": true})` |
| `venthub_orders` | `Payment system fixed on 2025-09-03 - all required columns added` | `Payment system fixed on 2025-09-03 - all required columns added \| @graphql({"disabled": true})` |
| `venthub_order_items` | `Order items schema fixed on 2025-09-03 - optional fields made nullable` | `Order items schema fixed on 2025-09-03 - optional fields made nullable \| @graphql({"disabled": true})` |
| `admin_users` | `Admin ve moderatör kullanıcıları listesi` | `Admin ve moderatör kullanıcıları listesi \| @graphql({"disabled": true})` |

### Proposed Remediation SQL for GraphQL
To disable GraphQL exposure for the 32 sensitive/internal tables, apply the following comments:

```sql
-- 1. Tables with existing comments (Preserve and Append)
COMMENT ON TABLE public.user_profiles IS 'Kullanıcı profilleri ve rolleri | @graphql({"disabled": true})';
COMMENT ON TABLE public.wizard_selections IS 'Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı | @graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_orders IS 'Payment system fixed on 2025-09-03 - all required columns added | @graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_order_items IS 'Order items schema fixed on 2025-09-03 - optional fields made nullable | @graphql({"disabled": true})';
COMMENT ON TABLE public.admin_users IS 'Admin ve moderatör kullanıcıları listesi | @graphql({"disabled": true})';

-- 2. Tables without existing comments (Directly Disable)
COMMENT ON TABLE public.admin_audit_log IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.cart_items IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.category_mapping_rules IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.client_errors IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.contact_messages IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.coupons IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.error_groups IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.inventory_movements IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.inventory_settings IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_attachments IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_email_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_notes IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.order_refund_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.organizations IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.payment_transactions IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.product_authorities IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.project_items IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.rate_limits IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.returns_webhook_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_email_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_idempotency IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shipping_webhook_events IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.shopping_carts IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.site_settings IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_addresses IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_invoice_profiles IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.user_projects IS '@graphql({"disabled": true})';
COMMENT ON TABLE public.venthub_returns IS '@graphql({"disabled": true})';
```

---

## 2. Storage Bucket Listing Policies for `product-images`

### Current State & Vulnerabilities
1. **Permissive Public Read Policy**: The policy `product_images_read_public` on `storage.objects` allows anyone (role `public`) to SELECT files where `bucket_id = 'product-images'`. This enables anonymous users to query `storage.objects` and list all files in the bucket.
2. **Name Resolution Shadowing Bug**: In `product_images_select_tenant` SELECT policy:
   ```sql
   CREATE POLICY product_images_select_tenant ON storage.objects
     FOR SELECT TO public
     USING (
       bucket_id = 'product-images'
       AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
       AND EXISTS (
         SELECT 1 FROM public.tenants t
         WHERE t.id = split_part(name, '/', 1)::uuid
         AND t.is_active = true
       )
     );
   ```
   Postgres resolves the unqualified `name` inside `split_part(name, ...)` to the nearest scope, which is the inner table `public.tenants t`. Since `tenants` has a `name` column (the text name of the tenant), it tries to evaluate `split_part(t.name, ...)` and cast the tenant name to UUID. This will cause runtime cast exceptions whenever evaluated.

### Analysis of Frontend Impact
The frontend displays product images using the direct public URL endpoint (`getPublicUrl()`).
* In Supabase, if a bucket's `public` status is `true` (as it is for `product-images`), files are served directly without evaluating `storage.objects` database SELECT RLS policies.
* The frontend does NOT use `list()` to fetch catalog images; they are requested individually by their paths stored in the `product_images` table.
* Therefore, **completely revoking public/anonymous SELECT access** on `storage.objects` for `product-images` will prevent listing attacks, while causing **zero disruption** to public image display.

### Proposed Remediation SQL for Storage
We should drop the permissive public read policy and restrict the SELECT policies on `storage.objects` to authenticated roles (admins, moderators, and tenant users) while fixing the name shadowing bug.

```sql
-- 1. Drop the permissive public SELECT policy that allows listing
DROP POLICY IF EXISTS product_images_read_public ON storage.objects;
DROP POLICY IF EXISTS product_images_select_tenant ON storage.objects;

-- 2. Recreate the SELECT policy with TO authenticated and fixed column qualification
CREATE POLICY product_images_select_tenant ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
    )
  );
```

---

## 3. Excessive `anon` SELECT Privileges

### Current Status
Currently, the `anon` role has `SELECT` privileges on **41 tables and views** in the `public` schema.

### Classification & Revocation Strategy
To implement the Principle of Least Privilege, we classify tables and views into two groups:
1. **Public Catalog (Maintain SELECT for `anon`)**: Tables that the client must query anonymously to render pages or resolve domains.
2. **Sensitive/Internal (Revoke SELECT for `anon`)**: Tables that should never be read by anonymous users.

| Category | Table / View Name | Keep `anon` SELECT? | Rationale |
|---|---|---|---|
| **Public Catalog** | `products` | **Yes** | Visitors must search/view products. |
| **Public Catalog** | `categories` | **Yes** | Visitors must browse product categories. |
| **Public Catalog** | `product_images` | **Yes** | Detail pages query images by product ID. |
| **Public Catalog** | `product_prices` | **Yes** | Show catalog pricing before login. |
| **Public Catalog** | `price_lists` | **Yes** | Resolve default pricing list. |
| **Public Catalog** | `tenants` | **Yes** | Required for domain/tenant context resolution. |
| **Sensitive/Internal** | `admin_audit_log` | **No** | Admin audits; internal only. |
| **Sensitive/Internal** | `admin_users` | **No** | Admin/moderator registry; internal only. |
| **Sensitive/Internal** | `cart_items` | **No** | DB sync for authenticated users; guests use localStorage. |
| **Sensitive/Internal** | `category_mapping_rules` | **No** | Internal admin utility mapping rule definitions. |
| **Sensitive/Internal** | `client_errors` | **No** | Logging target; needs INSERT only, never SELECT. |
| **Sensitive/Internal** | `contact_messages` | **No** | Contact form; needs INSERT only, never SELECT. |
| **Sensitive/Internal** | `coupons` | **No** | Applied via Edge function `/apply-coupon`, not database SELECT. |
| **Sensitive/Internal** | `error_groups` | **No** | Admin logs; internal only. |
| **Sensitive/Internal** | `inventory_movements` | **No** | Internal stock audits; internal only. |
| **Sensitive/Internal** | `inventory_settings` | **No** | Internal config; internal only. |
| **Sensitive/Internal** | `inventory_summary` (View) | **No** | View of movements/stock; internal only. |
| **Sensitive/Internal** | `inventory_velocity` (View) | **No** | Stock velocity analytics; internal only. |
| **Sensitive/Internal** | `order_attachments` | **No** | Order invoice/receipt files; authenticated only. |
| **Sensitive/Internal** | `order_email_events` | **No** | Mail logs; internal only. |
| **Sensitive/Internal** | `order_notes` | **No** | Internal admin/sales notes on orders. |
| **Sensitive/Internal** | `order_refund_events` | **No** | Refund transactions; internal/authenticated only. |
| **Sensitive/Internal** | `organizations` | **No** | Tenant organizations; internal/authenticated only. |
| **Sensitive/Internal** | `payment_transactions` | **No** | Sensitive payment records; internal/authenticated only. |
| **Sensitive/Internal** | `product_authorities` | **No** | Permission matrix; internal only. |
| **Sensitive/Internal** | `project_items` | **No** | User project selections; authenticated only. |
| **Sensitive/Internal** | `rate_limits` | **No** | WAF/API counters; internal only. |
| **Sensitive/Internal** | `returns_webhook_events` | **No** | Webhook payloads; internal only. |
| **Sensitive/Internal** | `shipping_email_events` | **No** | Log emails; internal only. |
| **Sensitive/Internal** | `shipping_idempotency` | **No** | API idempotency logs; internal only. |
| **Sensitive/Internal** | `shipping_webhook_events` | **No** | Logistics events; internal only. |
| **Sensitive/Internal** | `shopping_carts` | **No** | Cart structures; authenticated only. |
| **Sensitive/Internal** | `site_settings` | **No** | Internal admin options. |
| **Sensitive/Internal** | `user_addresses` | **No** | User delivery addresses; authenticated only. |
| **Sensitive/Internal** | `user_invoice_profiles` | **No** | Invoicing preferences; authenticated only. |
| **Sensitive/Internal** | `user_profiles` | **No** | Auth Hook profile reads; internal/authenticated only. |
| **Sensitive/Internal** | `user_projects` | **No** | User project folders; authenticated only. |
| **Sensitive/Internal** | `venthub_order_items` | **No** | Purchased order lines; authenticated only. |
| **Sensitive/Internal** | `venthub_orders` | **No** | Purchases; authenticated only. |
| **Sensitive/Internal** | `venthub_returns` | **No** | Return claims; authenticated only. |
| **Sensitive/Internal** | `view_admin_orders` (View) | **No** | View of orders; admin only. |
| **Sensitive/Internal** | `wizard_selections` | **No** | Needs INSERT only (anon/auth), never SELECT. |

### Proposed Remediation SQL for Revoking Privileges
Execute the following statements to revoke SELECT privilege from `anon` on the 35 sensitive tables and views:

```sql
REVOKE SELECT ON TABLE public.admin_audit_log FROM anon;
REVOKE SELECT ON TABLE public.admin_users FROM anon;
REVOKE SELECT ON TABLE public.cart_items FROM anon;
REVOKE SELECT ON TABLE public.category_mapping_rules FROM anon;
REVOKE SELECT ON TABLE public.client_errors FROM anon;
REVOKE SELECT ON TABLE public.contact_messages FROM anon;
REVOKE SELECT ON TABLE public.coupons FROM anon;
REVOKE SELECT ON TABLE public.error_groups FROM anon;
REVOKE SELECT ON TABLE public.inventory_movements FROM anon;
REVOKE SELECT ON TABLE public.inventory_settings FROM anon;
REVOKE SELECT ON TABLE public.inventory_summary FROM anon;
REVOKE SELECT ON TABLE public.inventory_velocity FROM anon;
REVOKE SELECT ON TABLE public.order_attachments FROM anon;
REVOKE SELECT ON TABLE public.order_email_events FROM anon;
REVOKE SELECT ON TABLE public.order_notes FROM anon;
REVOKE SELECT ON TABLE public.order_refund_events FROM anon;
REVOKE SELECT ON TABLE public.organizations FROM anon;
REVOKE SELECT ON TABLE public.payment_transactions FROM anon;
REVOKE SELECT ON TABLE public.product_authorities FROM anon;
REVOKE SELECT ON TABLE public.project_items FROM anon;
REVOKE SELECT ON TABLE public.rate_limits FROM anon;
REVOKE SELECT ON TABLE public.returns_webhook_events FROM anon;
REVOKE SELECT ON TABLE public.shipping_email_events FROM anon;
REVOKE SELECT ON TABLE public.shipping_idempotency FROM anon;
REVOKE SELECT ON TABLE public.shipping_webhook_events FROM anon;
REVOKE SELECT ON TABLE public.shopping_carts FROM anon;
REVOKE SELECT ON TABLE public.site_settings FROM anon;
REVOKE SELECT ON TABLE public.user_addresses FROM anon;
REVOKE SELECT ON TABLE public.user_invoice_profiles FROM anon;
REVOKE SELECT ON TABLE public.user_profiles FROM anon;
REVOKE SELECT ON TABLE public.user_projects FROM anon;
REVOKE SELECT ON TABLE public.venthub_order_items FROM anon;
REVOKE SELECT ON TABLE public.venthub_orders FROM anon;
REVOKE SELECT ON TABLE public.venthub_returns FROM anon;
REVOKE SELECT ON TABLE public.view_admin_orders FROM anon;
REVOKE SELECT ON TABLE public.wizard_selections FROM anon;
```

*Note: For tables like `client_errors`, `contact_messages`, and `wizard_selections`, anonymous users still require `INSERT` privilege so they can log errors, submit contact forms, and register wizard selection choices. Revoking SELECT does not affect INSERT privileges.*
