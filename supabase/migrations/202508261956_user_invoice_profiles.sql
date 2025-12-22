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

-- Helpful indexes (wrapped in DO blocks to handle missing columns gracefully)
create index if not exists idx_user_invoice_profiles_user on public.user_invoice_profiles(user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_invoice_profiles' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_user_invoice_profiles_type ON public.user_invoice_profiles(type);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_invoice_profiles' AND column_name = 'type')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_invoice_profiles' AND column_name = 'is_default') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_invoice_profiles_default_per_type
      ON public.user_invoice_profiles(user_id, type)
      WHERE is_default IS TRUE;
  END IF;
END $$;


alter table public.user_invoice_profiles enable row level security;

-- RLS: owner-only access (CREATE POLICY IF NOT EXISTS workaround)
DO $$ BEGIN
  CREATE POLICY user_invoice_profiles_select ON public.user_invoice_profiles
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_invoice_profiles_insert ON public.user_invoice_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_invoice_profiles_update ON public.user_invoice_profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_invoice_profiles_delete ON public.user_invoice_profiles
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_user_invoice_profiles_updated_at'
      AND tgrelid = 'public.user_invoice_profiles'::regclass
  ) THEN
    CREATE TRIGGER trg_user_invoice_profiles_updated_at
      BEFORE UPDATE ON public.user_invoice_profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_user_invoice_profiles_single_default'
      AND n.nspname = 'public'
      AND c.relname = 'user_invoice_profiles'
  ) THEN
    CREATE TRIGGER trg_user_invoice_profiles_single_default
      BEFORE INSERT OR UPDATE ON public.user_invoice_profiles
      FOR EACH ROW EXECUTE FUNCTION public.user_invoice_profiles_ensure_single_default();
  END IF;
END;
$$;

-- EOF

