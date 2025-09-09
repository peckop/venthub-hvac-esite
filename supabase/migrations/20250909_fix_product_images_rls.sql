begin;

-- Fix product_images table RLS: allow admin/moderator by user_profiles role (not JWT claim)

alter table if exists public.product_images enable row level security;

-- Drop old claim-based policies if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_insert_admin') THEN
    DROP POLICY product_images_insert_admin ON public.product_images;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_update_admin') THEN
    DROP POLICY product_images_update_admin ON public.product_images;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_delete_admin') THEN
    DROP POLICY product_images_delete_admin ON public.product_images;
  END IF;
END $$;

-- Recreate policies using user_profiles role check
CREATE POLICY IF NOT EXISTS product_images_insert_admin ON public.product_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

CREATE POLICY IF NOT EXISTS product_images_update_admin ON public.product_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

CREATE POLICY IF NOT EXISTS product_images_delete_admin ON public.product_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

-- Also fix storage.objects (product-images bucket) policies to use user_profiles role
-- Drop claim-based policies if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_insert_admin') THEN
    DROP POLICY product_images_insert_admin ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_update_admin') THEN
    DROP POLICY product_images_update_admin ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_delete_admin') THEN
    DROP POLICY product_images_delete_admin ON storage.objects;
  END IF;
END $$;

-- Recreate storage policies
CREATE POLICY product_images_insert_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

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

CREATE POLICY product_images_delete_admin ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

commit;

