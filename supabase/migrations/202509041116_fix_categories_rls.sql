-- Fix RLS for public.categories: enable RLS and ensure public read policy exists

alter table if exists public.categories enable row level security;

-- Ensure public read policy exists (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_public_read'
  ) then
    create policy categories_public_read
      on public.categories
      for select
      to anon, authenticated
      using (true);
  end if;
end$$;

