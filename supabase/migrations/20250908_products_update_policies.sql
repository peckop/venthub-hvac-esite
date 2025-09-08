begin;

-- Ensure RLS update policy for products limited to admin/moderator only
-- Assumes RLS is already enabled on public.products and a public SELECT policy exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='products' AND policyname='products_update_admin_only'
  ) THEN
    CREATE POLICY products_update_admin_only ON public.products
      FOR UPDATE TO authenticated
      USING ( public.jwt_role() IN ('admin','moderator') )
      WITH CHECK ( public.jwt_role() IN ('admin','moderator') );
  END IF;
END$$;

commit;

