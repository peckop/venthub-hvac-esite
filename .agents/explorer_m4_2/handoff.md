# Handoff Report — 2026-05-30T19:24:00Z

This report summarizes findings and provides next steps for securing Supabase storage buckets under multi-tenancy in VentHub.

---

## 1. Observation
We analyzed the codebase and database migrations to identify existing buckets, storage policies, and reference mappings:
- **Bucket Seeding**: Under `supabase/migrations/20250908_storage_product_images.sql`, the only database-seeded bucket is `'product-images'`:
  ```sql
  -- Line 4
  insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  ```
- **Active RLS Write Restriction**: Under `supabase/migrations/20250909_fix_product_images_rls.sql`, write operations on `'product-images'` restrict edits to admin/moderator profiles:
  ```sql
  -- Lines 74-77
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );
  ```
- **Security Vulnerability**: Under `supabase/migrations/20250909_storage_objects_insert_auth.sql`, a permissive upload policy exists:
  ```sql
  -- Line 10-12
  CREATE POLICY product_images_insert_authenticated ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
  ```
- **Frontend Mismatch**: In `src/components/admin/categories/CategoryFormModal.tsx`, the frontend targets a `'products'` bucket instead of the seeded `'product-images'` bucket:
  ```typescript
  // Line 145-147
  const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, compressedFile)
  ```
- **Tenant Context Function**: Under `supabase/migrations/20260530220000_tenant_schema_setup.sql`, the multi-tenant foundation introduces `public.jwt_tenant_id()` returning `uuid` and sets `tenant_id` on the `user_profiles` table.

---

## 2. Logic Chain
- **Step 1**: The current storage policies check if the user has `role IN ('admin', 'moderator')` on the `user_profiles` table, but they do *not* check if the user's `tenant_id` matches the tenant of the resource.
- **Step 2**: An administrator scoped to Tenant A can upload, modify, or delete files belonging to Tenant B since the policies only check for user role and lack tenant context.
- **Step 3**: The permissive policy `product_images_insert_authenticated` completely bypasses the administrator role restriction, allowing *any* authenticated user (including regular customers) to upload files.
- **Step 4**: To enforce multi-tenancy securely without modifying system table structures, we must implement **Path-Based Tenant Isolation** where every file is prefixed with `{tenant_id}/`.
- **Step 5**: To prevent database cast failures (which occur if we cast a non-UUID folder path to UUID in Postgres), we must validate the path format using a regex check (`name ~ '^[0-9a-fA-F]{8}-...'`) before applying the tenant matching logic `split_part(name, '/', 1)::uuid = public.jwt_tenant_id()`.

---

## 3. Caveats
- We assumed the `'products'` bucket referenced in `CategoryFormModal.tsx` is either a code mismatch that needs to be updated to `'product-images'` or will be defined in a future migration. We did not write code changes to correct the frontend mismatch, as we are in a read-only investigation role.
- Path-based isolation assumes that the client applications will properly format the file paths as `{tenant_id}/{path}` on upload/request. RLS will reject any uploads that fail to prefix files with the user's active tenant UUID.

---

## 4. Conclusion
The existing storage policies are vulnerable to BOLA (Broken Object Level Authorization) across tenants, and they allow regular authenticated users to bypass admin restrictions during upload. 

We recommend:
1. **Drop old storage policies** on `storage.objects` and enforce path-based tenant isolation.
2. **Apply the tenant-aware migration** `20260530221000_tenant_aware_storage_policies.sql` containing our provided safe RLS code (detailed in `analysis.md`).
3. **Align frontend code** in `CategoryFormModal.tsx` to target the `'product-images'` bucket and prepend paths with the user's active `tenant_id`.

---

## 5. Verification Method
- **Inspect Files**: Confirm findings in:
  - `analysis.md` (fully developed RLS policies)
  - `supabase/migrations/20250908_storage_product_images.sql` (original bucket)
  - `supabase/migrations/20260530220000_tenant_schema_setup.sql` (multi-tenant foundation)
- **Local Testing command**: Once migrations are applied:
  - Try uploading a file with path `d3b07384-d113-495f-a558-8c38634e0000/test.png` using a session set to tenant `d3b07384-d113-495f-a558-8c38634e0000` (should **succeed**).
  - Try uploading a file with path `d3b07384-d113-495f-a558-8c38634e9999/test.png` using the same session (should **fail** with RLS violation).
