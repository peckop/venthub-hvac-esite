begin;

-- Create public bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read access for product-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_read_public'
  ) THEN
    CREATE POLICY product_images_read_public ON storage.objects
      FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Admin/moderator write access (insert/update/delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_insert_admin'
  ) THEN
    CREATE POLICY product_images_insert_admin ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'product-images'
        AND (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_update_admin'
  ) THEN
    CREATE POLICY product_images_update_admin ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'product-images'
        AND (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator')
      )
      WITH CHECK (
        bucket_id = 'product-images'
        AND (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_delete_admin'
  ) THEN
    CREATE POLICY product_images_delete_admin ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'product-images'
        AND (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator')
      );
  END IF;
END $$;

commit;

