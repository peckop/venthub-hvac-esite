begin;

-- Address book for users
create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text,
  phone text,
  full_address text not null,
  city text not null,
  district text not null,
  postal_code text,
  country text default 'TR',
  is_default_shipping boolean default false,
  is_default_billing boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_user_addresses_user_id on public.user_addresses(user_id);
create unique index if not exists user_addresses_one_default_shipping
  on public.user_addresses(user_id) where is_default_shipping;
create unique index if not exists user_addresses_one_default_billing
  on public.user_addresses(user_id) where is_default_billing;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger set_timestamp
before update on public.user_addresses
for each row execute function public.set_updated_at();

-- RLS
alter table public.user_addresses enable row level security;

-- Only the owner can select/insert/update/delete
create policy if not exists user_addresses_select
  on public.user_addresses for select
  using (auth.uid() = user_id);

create policy if not exists user_addresses_insert
  on public.user_addresses for insert
  with check (auth.uid() = user_id);

create policy if not exists user_addresses_update
  on public.user_addresses for update
  using (auth.uid() = user_id);

create policy if not exists user_addresses_delete
  on public.user_addresses for delete
  using (auth.uid() = user_id);

commit;

