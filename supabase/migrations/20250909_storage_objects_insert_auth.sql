begin;

-- Allow any authenticated user to INSERT into storage.objects for 'product-images' bucket (upload)
-- UPDATE/DELETE remain restricted to admin/moderator via existing policies.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images_insert_authenticated'
  ) THEN
    CREATE POLICY product_images_insert_authenticated ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

commit;

