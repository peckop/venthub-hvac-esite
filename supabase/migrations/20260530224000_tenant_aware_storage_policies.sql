-- Migration: Tenant-Aware Path-Based Storage Isolation Policies
-- Location: supabase/migrations/20260530224000_tenant_aware_storage_policies.sql

BEGIN;

-- 1. DROP ALL OLD INSECURE AND NON-TENANT-AWARE POLICIES
DROP POLICY IF EXISTS product_images_read_public ON storage.objects;
DROP POLICY IF EXISTS product_images_insert_authenticated ON storage.objects;
DROP POLICY IF EXISTS product_images_insert_admin ON storage.objects;
DROP POLICY IF EXISTS product_images_update_admin ON storage.objects;
DROP POLICY IF EXISTS product_images_delete_admin ON storage.objects;

-- Ensure RLS is active on storage.objects (storage.objects has RLS active by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
