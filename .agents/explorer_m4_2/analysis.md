# Multi-Tenant Supabase Storage RLS Policy Analysis

## Executive Summary
This report analyzes existing Supabase Storage configurations in VentHub, identifies a critical Broken Object Level Authorization (BOLA) vulnerability where any authenticated user can upload files without tenant verification, and provides a production-grade, path-based tenant-isolation policy using `public.jwt_tenant_id()` and regex-validated UUID path parsing.

---

## 1. Existing Storage Buckets & Reference Mappings
Through static codebase analysis and migration file inspection, we identified the following bucket definitions and usages:

### 1.1 Storage Buckets Summary

| Bucket ID | Access Type | Primary Usage in Code base | Defined in Migrations? | Security Configuration |
|---|---|---|---|---|
| `product-images` | Public (Read-Only) | Main bucket for product catalog images. Referenced by `ImageGallery.tsx`, `CategoryShowcase.tsx`, `VentImage.tsx`, and `AdminProductsPage.tsx`. | **Yes** (`20250908_storage_product_images.sql`) | Active RLS with public read access and restricted write access. |
| `products` | Public (Read-Only) | Category images upload target. Referenced in `CategoryFormModal.tsx` line 146 & 152. | **No** (Likely a code mismatch or manually created) | No migration definitions found. |
| `category-images` | Public (Read-Only) | Image prefix reference. Referenced in `HeroCarousel.tsx` line 126 and `CategoryHero.tsx` line 61. | **No** (Referenced directly in public URL path resolutions) | No migration definitions found. |

> **⚠️ Mismatch Warning**: In `CategoryFormModal.tsx`, the frontend attempts to upload category images to the `'products'` bucket:
> ```typescript
> // src/components/admin/categories/CategoryFormModal.tsx (Lines 145-147)
> const { error: uploadError } = await supabase.storage
>     .from('products')
>     .upload(filePath, compressedFile)
> ```
> However, database migrations only seed the `'product-images'` bucket. This requires the development team to either align the frontend code to use `'product-images'` or add a migration defining the `'products'` bucket.

---

## 2. Storage Policies Definition Under `supabase/migrations/`
All database migrations defining storage and permissions are co-located under `supabase/migrations/`. 

The chronological evolution of these policies is as follows:

### 2.1 Chronological Analysis of Storage Migration Files

1. **`supabase/migrations/20250908_storage_product_images.sql`**
   - **Action**: Seeds the `product-images` bucket into `storage.buckets` (`public = true`).
   - **Vulnerabilities**: Initially defined write policies (`INSERT`/`UPDATE`/`DELETE`) relying on direct JWT claims inspection (`(request.jwt.claims ->> 'role') IN ('admin','moderator')`). JWT claims are unsafe for RLS and user-editable.

2. **`supabase/migrations/20250909_fix_product_images_rls.sql`**
   - **Action**: Corrects the JWT claim vulnerability by dropping old policies and implementing database-level role verification querying `public.user_profiles`.
   - **Current Policy Definitions**:
     - `product_images_insert_admin` (`INSERT`): Restricts uploads to authenticated users whose `public.user_profiles.role` is `'admin'` or `'moderator'`.
     - `product_images_update_admin` (`UPDATE`): Restricts updates to `'admin'` or `'moderator'`.
     - `product_images_delete_admin` (`DELETE`): Restricts deletions to `'admin'` or `'moderator'`.

3. **`supabase/migrations/20250909_storage_auth_grants.sql`**
   - **Action**: Grants `usage` on schema `storage` and standard CRUD permissions (`SELECT, INSERT, UPDATE, DELETE`) on `storage.objects` to the `authenticated` Postgres role. This is required under the Golden Triad rule to prevent Postgres level permission errors.

4. **`supabase/migrations/20250909_storage_objects_insert_auth.sql`**
   - **Action**: Introduces a permissive policy `product_images_insert_authenticated` allowing any authenticated user to upload.
   - **Vulnerability**: This policy allows *any* authenticated user to insert files into `'product-images'` bucket regardless of their role or tenant, presenting a critical security gap.

---

## 3. Active RLS Policies on `storage.objects`
The current effective RLS policies governing the `storage.objects` table are:

```sql
-- SELECT (Public Read)
CREATE POLICY product_images_read_public ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- INSERT (Permissive Authenticated - VULNERABLE!)
CREATE POLICY product_images_insert_authenticated ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- INSERT (Admin/Moderator Role-Based)
CREATE POLICY product_images_insert_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- UPDATE (Admin/Moderator Role-Based)
CREATE POLICY product_images_update_admin ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  )
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- DELETE (Admin/Moderator Role-Based)
CREATE POLICY product_images_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );
```

### 3.1 Security Review & Vulnerability Log
1. **Critical Tenant Leakage**: RLS policies do not inspect the active tenant ID (`public.jwt_tenant_id()`). An authenticated administrator in Tenant A can view, update, overwrite, or delete objects belonging to Tenant B simply by specifying the target path.
2. **Broken Role Enforcement**: The `product_images_insert_authenticated` policy allows *any* authenticated standard user (`role = 'user'`) to upload files directly into the `'product-images'` bucket, completely bypassing the admin/moderator write restrictions defined in `product_images_insert_admin`.

---

## 4. Proposed Solution: Tenant-Aware Storage Policies
In migration `20260530220000_tenant_schema_setup.sql`, the multi-tenant SaaS foundation was successfully introduced:
- `public.jwt_tenant_id()` extracts the tenant context from JWT claims safely.
- `public.user_profiles.tenant_id` scopes each user to a tenant.

### 4.1 Path-Based Tenant Isolation Strategy
Because `storage.objects` is a system table, adding custom columns (like `tenant_id`) directly to it is hazardous and unsupported by default Supabase tools. The industry-standard approach is **Path-Based Tenant Isolation**, where file paths are prefixed with the tenant's UUID:
`{tenant_id}/{path/to/file.png}`

For example:
`d3b07384-d113-495f-a558-8c38634e0000/category-images/industrial-fan.png`

Using standard Postgres regex matching and string parsing:
- `split_part(name, '/', 1)` extracts the tenant ID prefix.
- `name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'` ensures that the prefix is a valid UUID before casting, preventing casting exceptions and blocking uploads directly to the bucket root.

### 4.2 Proposed Migration Code (`20260530221000_tenant_aware_storage_policies.sql`)

Below is the complete, idempotent, production-ready SQL migration code to implement safe tenant-isolated policies:

```sql
-- Migration: Tenant-Aware Storage Policies
-- Target: storage.objects (product-images bucket)
-- Sequence: Golden Triad (Drop old -> Enable RLS -> Recreate safe policies)

BEGIN;

-- 1. DROP ALL OLD INSECURE AND NON-TENANT-AWARE POLICIES
DROP POLICY IF EXISTS product_images_read_public ON storage.objects;
DROP POLICY IF EXISTS product_images_insert_admin ON storage.objects;
DROP POLICY IF EXISTS product_images_update_admin ON storage.objects;
DROP POLICY IF EXISTS product_images_delete_admin ON storage.objects;
DROP POLICY IF EXISTS product_images_insert_authenticated ON storage.objects;

-- Ensure RLS is active on storage.objects (Safety Check)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. CREATE TENANT-AWARE AND ROLE-VERIFIED POLICIES

-- SELECT: Public reading of files only if they belong to an active tenant
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

-- INSERT: Restrict uploads to tenant folder matching jwt_tenant_id() + user must be admin/moderator in that tenant
CREATE POLICY product_images_insert_tenant ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    -- A: Enforce file path begins with a valid UUID matching the user's active tenant claim
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    -- B: Verify user is registered, belongs to the active tenant, and has write permissions
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
      AND up.role IN ('admin', 'moderator')
    )
  );

-- UPDATE: Restrict file replacements to owners matching active tenant + admin/moderator roles
CREATE POLICY product_images_update_tenant ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
      AND up.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
      AND up.role IN ('admin', 'moderator')
    )
  );

-- DELETE: Restrict deletions to owners matching active tenant + admin/moderator roles
CREATE POLICY product_images_delete_tenant ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/')
    AND split_part(name, '/', 1)::uuid = public.jwt_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.tenant_id = public.jwt_tenant_id()
      AND up.role IN ('admin', 'moderator')
    )
  );

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
```

---

## 5. Next Steps for Implementation Team
1. **Align Storage Client Pathing**: Update frontend components (`CategoryFormModal.tsx` and image uploader helpers) to format target paths as:
   ```typescript
   // Get active tenant ID from session / user profile
   const tenantId = userProfile.tenant_id;
   const filePath = `${tenantId}/category-images/${fileName}`;
   
   // Target bucket should match defined 'product-images' bucket
   const { error } = await supabase.storage
       .from('product-images')
       .upload(filePath, compressedFile);
   ```
2. **Apply Migration**: Create a new migration SQL file via CLI (`supabase migration new tenant_aware_storage_policies`) and deploy this code to local and staging environments.
3. **Verify RLS**: Test upload scenarios under different tenant user sessions using mock JWTs to verify cross-tenant write operations are correctly blocked.
