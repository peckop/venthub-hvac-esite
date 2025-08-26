begin;

-- Address book for users (create if table missing)
create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid()
);

-- Ensure required columns exist (safe for partially created tables)
alter table public.user_addresses
  add column if not exists user_id uuid,
  add column if not exists label text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists full_address text,
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists district text,
  add column if not exists postal_code text,
  add column if not exists country text default 'TR',
  add column if not exists is_default_shipping boolean default false,
  add column if not exists is_default_billing boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- If street_address exists and is NOT NULL, drop NOT NULL to allow compatibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_addresses' AND column_name='street_address' AND is_nullable='NO'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_addresses ALTER COLUMN street_address DROP NOT NULL';
  END IF;
END $$;

-- Backfill street_address from full_address when null
update public.user_addresses set street_address = full_address where street_address is null and full_address is not null;

-- Ensure FK constraint on user_id
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'user_addresses'
      and constraint_name = 'user_addresses_user_id_fkey'
  ) then
    alter table public.user_addresses
      add constraint user_addresses_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- Helpful indexes
create index if not exists idx_user_addresses_user_id on public.user_addresses(user_id);
create unique index if not exists user_addresses_one_default_shipping
  on public.user_addresses(user_id) where is_default_shipping;
create unique index if not exists user_addresses_one_default_billing
  on public.user_addresses(user_id) where is_default_billing;

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- Create trigger only if missing
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'user_addresses_set_timestamp'
  ) then
    create trigger user_addresses_set_timestamp
    before update on public.user_addresses
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- RLS
alter table public.user_addresses enable row level security;

-- Grants: allow authenticated role to use and operate on the table (RLS still applies)
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.user_addresses to authenticated;

-- Only the owner can select/insert/update/delete (create if missing)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_addresses' and policyname = 'user_addresses_select'
  ) then
    create policy user_addresses_select
      on public.user_addresses for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_addresses' and policyname = 'user_addresses_insert'
  ) then
    create policy user_addresses_insert
      on public.user_addresses for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_addresses' and policyname = 'user_addresses_update'
  ) then
    create policy user_addresses_update
      on public.user_addresses for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_addresses' and policyname = 'user_addresses_delete'
  ) then
    create policy user_addresses_delete
      on public.user_addresses for delete
      using (auth.uid() = user_id);
  end if;
end $$;

commit;

