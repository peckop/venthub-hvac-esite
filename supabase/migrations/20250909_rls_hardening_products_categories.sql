begin;

-- RLS hardening for products, categories and cleanup of broad policies

-- Ensure helper exists (jwt_role) – already created in previous migrations
-- Enable RLS defensively
alter table if exists public.products enable row level security;
alter table if exists public.categories enable row level security;

-- 1) PRODUCTS
-- Drop overly broad authenticated update policy if present
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='products' and policyname='products_update_stock_authenticated'
  ) then
    drop policy "products_update_stock_authenticated" on public.products;
  end if;
end $$;

-- Public/anon can SELECT products (catalog)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='products' and policyname='products_public_read'
  ) then
    create policy products_public_read on public.products
      for select to anon, authenticated
      using (true);
  end if;
end $$;

-- Admin/moderator can INSERT/UPDATE/DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_insert_admin'
  ) THEN
    CREATE POLICY products_insert_admin ON public.products
      FOR INSERT TO authenticated
      WITH CHECK ( public.jwt_role() IN ('admin','moderator') );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_update_admin_only'
  ) THEN
    CREATE POLICY products_update_admin_only ON public.products
      FOR UPDATE TO authenticated
      USING ( public.jwt_role() IN ('admin','moderator') )
      WITH CHECK ( public.jwt_role() IN ('admin','moderator') );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='products' AND policyname='products_delete_admin'
  ) THEN
    CREATE POLICY products_delete_admin ON public.products
      FOR DELETE TO authenticated
      USING ( public.jwt_role() IN ('admin','moderator') );
  END IF;
END $$;

-- 2) CATEGORIES
-- Public read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_public_read'
  ) THEN
    CREATE POLICY categories_public_read ON public.categories
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Admin/moderator write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_insert_admin'
  ) THEN
    CREATE POLICY categories_insert_admin ON public.categories
      FOR INSERT TO authenticated
      WITH CHECK ( public.jwt_role() IN ('admin','moderator') );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_update_admin'
  ) THEN
    CREATE POLICY categories_update_admin ON public.categories
      FOR UPDATE TO authenticated
      USING ( public.jwt_role() IN ('admin','moderator') )
      WITH CHECK ( public.jwt_role() IN ('admin','moderator') );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='categories_delete_admin'
  ) THEN
    CREATE POLICY categories_delete_admin ON public.categories
      FOR DELETE TO authenticated
      USING ( public.jwt_role() IN ('admin','moderator') );
  END IF;
END $$;

commit;

