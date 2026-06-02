# Handoff Report — Explorer M1.3 Security Audit

## 1. Observation
We performed direct database metadata queries and source code analysis on the remote Supabase database and local repository:
1. **Existing Table Comments**:
   A query of `pg_catalog.obj_description` for the tables in schema `public` returned the following exact comments:
   * `venthub_orders`: `"Payment system fixed on 2025-09-03 - all required columns added"`
   * `venthub_order_items`: `"Order items schema fixed on 2025-09-03 - optional fields made nullable"`
   * `user_profiles`: `"Kullanıcı profilleri ve rolleri"`
   * `wizard_selections`: `"Hava perdesi seçim wizard kaydları - hukuki koruma amaçlı"`
   * `admin_users`: `"Admin ve moderatör kullanıcıları listesi"`
   * All other public tables: `null` (no comments exist).

2. **Database Role Privileges (`anon` SELECT)**:
   A query of table privileges on the remote database confirmed that the `anon` role has `SELECT` privileges granted on **41 tables and views** in the `public` schema.
   
3. **Storage Policies**:
   A query on `pg_policies` for `storage.objects` showed the following active SELECT policies for the `product-images` bucket:
   * Policy `product_images_read_public`:
     - Command: `SELECT`
     - Roles: `{public}`
     - Qualification: `(bucket_id = 'product-images'::text)`
   * Policy `product_images_select_tenant`:
     - Command: `SELECT`
     - Roles: `{public}`
     - Qualification: `((bucket_id = 'product-images'::text) AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'::text) AND (EXISTS ( SELECT 1 FROM tenants t WHERE ((t.id = (split_part(t.name, '/'::text, 1))::uuid) AND (t.is_active = true)))))`

4. **Source Code References**:
   * `src/components/category/EnhancedNeedsWizard.tsx` (Line 99): Queries only the `products` table: `supabase.from('products').select(...)`. It does not perform SELECT or INSERT on `wizard_selections`.
   * `src/hooks/useCheckoutCoupon.ts` (Line 31): Calls the edge function `fetch('${base}/functions/v1/apply-coupon', ...)` to validate coupons. It does not select from the `coupons` table directly.
   * `src/app/_components/ProductDetailPageView.tsx` (Line 133) and `src/views/ProductDetailPage.tsx` (Line 111): Query `product_images` table: `supabase.from('product_images').select(...)`.

---

## 2. Logic Chain
1. **GraphQL Exposure**: `pg_graphql` introspects and exposes any table in the `public` schema that is queryable (has `SELECT` granted) by API roles like `anon` or `authenticated`. Since 41 tables currently have SELECT granted to `anon` and no disabling table comments are present, they are all exposed in the GraphQL schema.
2. **Comment Preservation**: To disable a table in pg_graphql, a table comment containing the directive `@graphql({"disabled": true})` must be set. To prevent overwriting the existing documentation comments on `user_profiles`, `wizard_selections`, `venthub_orders`, `venthub_order_items`, and `admin_users`, the new comment must concatenate the original text with the disabling directive.
3. **Storage Listing Vulnerability**: The `product_images_read_public` policy allows any public user to select any object metadata from the `product-images` bucket. This makes listing files (`list()`) possible. Because the `product-images` bucket is marked `public` (`public = true` in `storage.buckets`), the HTTP GET requests to download images bypass database RLS checks entirely. The client does not use `list()` in frontend image rendering. Therefore, dropping `product_images_read_public` is safe for UI display and prevents listing attacks.
4. **Shadowing Bug**: In `product_images_select_tenant`, the unqualified reference `name` inside `split_part(name, '/', 1)` is evaluated inside a subquery referencing `public.tenants t`. Since `tenants` contains a `name` column, Postgres resolves the reference to `t.name` (the tenant's text name). Attempting to cast the tenant's name to UUID (`::uuid`) throws a cast error. To fix this, the reference must be explicitly qualified as `storage.objects.name`.
5. **Anonymous SELECT Privilege**: Revoking `anon` SELECT privilege on tables that are not part of the public catalog (e.g., e-commerce products, categories, images, prices, tenants) restricts public read access and automatically removes them from pg_graphql's anonymous schema. Tables like `wizard_selections`, `client_errors`, and `contact_messages` only need `INSERT` privilege for anonymous visitors.

---

## 3. Caveats
- **Local migrations**: Migrations `20260530220000` to `20260530224000` are locally written but not marked as applied under the `supabase_migrations.schema_migrations` table on the remote database. However, the database schema (such as `tenants` and `tenant_id` columns) is already physically present in the database.
- **Other roles**: Revoking `anon` SELECT will protect anonymous access, but authenticated users (`authenticated` role) might still expose tables through the GraphQL schema unless they are also commented out with `@graphql({"disabled": true})`.

---

## 4. Conclusion
To secure the database, we must:
1. **Disable GraphQL Exposure**: Disable GraphQL for 32 sensitive tables while appending to existing comments.
2. **Restrict Storage Listing**: Drop the permissive policy `product_images_read_public`, limit SELECT to authenticated roles, and fix the name resolution shadowing bug in `product_images_select_tenant` by qualifying `storage.objects.name`.
3. **Revoke excessive privileges**: Revoke `anon` SELECT on 35 non-catalog tables, retaining them only on `products`, `categories`, `product_prices`, `product_images`, `price_lists`, and `tenants`.

---

## 5. Verification Method
1. **Database query verification**: Run the following queries to ensure comments and grants are correctly applied:
   * Comments check: `SELECT c.relname, pg_catalog.obj_description(c.oid, 'pg_class') FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public';`
   * Privilege check: `SELECT table_name, grantee, privilege_type FROM information_schema.table_privileges WHERE table_schema = 'public' AND grantee = 'anon' AND privilege_type = 'SELECT';`
2. **GraphQL Introspection Test**: Execute an anonymous GraphQL schema introspection query to verify that the disabled tables are hidden.
3. **Storage Listing Test**: Verify that calling `supabase.storage.from('product-images').list()` anonymously returns an access denied error, while `<img src="getPublicUrl()" />` loads successfully.
