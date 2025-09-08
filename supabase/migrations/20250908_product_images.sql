begin;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  alt text null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_sort on public.product_images(product_id, sort_order);

alter table public.product_images enable row level security;

-- Public select policy (anyone can read)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='product_images' and policyname='product_images_select_all'
  ) then
    create policy product_images_select_all on public.product_images
      for select using (true);
  end if;
end $$;

-- Admin/moderator insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_insert_admin'
  ) THEN
    CREATE POLICY product_images_insert_admin ON public.product_images
      FOR INSERT
      WITH CHECK ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator') );
  END IF;
END $$;

-- Admin/moderator update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_update_admin'
  ) THEN
    CREATE POLICY product_images_update_admin ON public.product_images
      FOR UPDATE
      USING ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator') )
      WITH CHECK ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator') );
  END IF;
END $$;

-- Admin/moderator delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_images' AND policyname='product_images_delete_admin'
  ) THEN
    CREATE POLICY product_images_delete_admin ON public.product_images
      FOR DELETE
      USING ( (SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role') IN ('admin','moderator') );
  END IF;
END $$;

commit;

