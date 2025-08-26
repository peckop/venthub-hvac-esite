-- user_invoice_profiles table for saved invoice profiles per user
-- Creates table, RLS policies, updated_at trigger and single-default enforcement per (user_id,type)

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.user_invoice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('individual','corporate')),
  title text,
  -- individual
  tckn text,
  -- corporate
  company_name text,
  vkn text,
  tax_office text,
  e_invoice boolean default false,
  is_default boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_user_invoice_profiles_user on public.user_invoice_profiles(user_id);
create index if not exists idx_user_invoice_profiles_type on public.user_invoice_profiles(type);
create unique index if not exists uniq_user_invoice_profiles_default_per_type
  on public.user_invoice_profiles(user_id, type)
  where is_default is true;

alter table public.user_invoice_profiles enable row level security;

-- RLS: owner-only access
create policy if not exists user_invoice_profiles_select on public.user_invoice_profiles
  for select using (auth.uid() = user_id);

create policy if not exists user_invoice_profiles_insert on public.user_invoice_profiles
  for insert with check (auth.uid() = user_id);

create policy if not exists user_invoice_profiles_update on public.user_invoice_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists user_invoice_profiles_delete on public.user_invoice_profiles
  for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_invoice_profiles_updated_at
  before update on public.user_invoice_profiles
  for each row execute function public.set_updated_at();

-- Ensure only one default per user and type
create or replace function public.user_invoice_profiles_ensure_single_default()
returns trigger as $$
begin
  if (new.is_default is true) then
    update public.user_invoice_profiles
      set is_default = false
      where user_id = new.user_id
        and type = new.type
        and id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_user_invoice_profiles_single_default
  before insert or update on public.user_invoice_profiles
  for each row execute function public.user_invoice_profiles_ensure_single_default();

-- EOF

