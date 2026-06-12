-- ============================================================================
-- R0 — Dealer-layer baseline: out-of-band tabloları versiyon kontrolüne al
-- Tarih: 2026-06-12
--
-- Bu 5 tablo (organizations, price_lists, product_prices, user_projects,
-- project_items) Supabase panelinden ELLE kuruldu; hiçbir migration'da CREATE
-- TABLE'ları yoktu. Bu migration onları git'e kaydeder.
--
-- GÜVENLİK: Tamamen IDEMPOTENT ve mevcut production'da NO-OP'tur
-- (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS / ENABLE RLS zaten açık).
-- Kolonlar/constraint'ler/index'ler canlı şemadan BİREBİR alındı
-- (information_schema.columns + pg_constraint + pg_indexes, 2026-06-12).
--
-- KAPSAM NOTU:
--  * RLS POLİTİKALARI ve GRANT'lar bu migration'a DAHİL DEĞİL — onlar production'da
--    değişebilir/yeniden yazılır (organizations/user_projects/project_items → R4;
--    price_lists/product_prices segment daraltması → R5). Buraya koymak no-op
--    olmaz (DROP/CREATE POLICY canlıyı değiştirir), o yüzden bilinçli dışarıda.
--    Mevcut canlı politikalar docs/audits/dealer-data-ground-truth-2026-06-11.md'de kayıtlı.
--  * organizations/user_projects/project_items'a tenant_id EKLENMESİ → R4.
--  * Tam DB-geneli felaket-kurtarma baseline'ı (pg_dump snapshot) ALINDI:
--    supabase/baselines/2026-06-12_public_schema.sql (38 tablo, 101 RLS politikası, 237 GRANT).
--    Bu migration o snapshot'ın yalnızca "replay zincirini onaran" idempotent alt-kümesidir.
-- ============================================================================

begin;

-- ---------- organizations ----------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        varchar not null,
  tier_level  integer default 1,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- price_lists ----------
create table if not exists public.price_lists (
  id              uuid primary key default gen_random_uuid(),
  name            varchar not null,
  description     text,
  user_type       varchar default 'individual',
  is_active       boolean default true,
  effective_from  timestamptz default now(),
  effective_to    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  tenant_id       uuid not null default 'd3b07384-d113-495f-a558-8c38634e0000'::uuid
                    references public.tenants(id) on delete cascade
);
create index if not exists idx_price_lists_tenant_id on public.price_lists using btree (tenant_id);

-- ---------- product_prices ----------
create table if not exists public.product_prices (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id) on delete cascade,
  price_list_id       uuid not null references public.price_lists(id) on delete cascade,
  base_price          numeric not null,
  sale_price          numeric,
  discount_percentage numeric default 0,
  is_active           boolean default true,
  valid_from          timestamptz default now(),
  valid_until         timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  tenant_id           uuid not null default 'd3b07384-d113-495f-a558-8c38634e0000'::uuid
                        references public.tenants(id) on delete cascade,
  constraint product_prices_unique unique (product_id, price_list_id, valid_from)
);
create index if not exists idx_product_prices_price_list_id on public.product_prices using btree (price_list_id);
create index if not exists idx_product_prices_tenant_id     on public.product_prices using btree (tenant_id);

-- ---------- user_projects ----------
create table if not exists public.user_projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_user_projects_user_id on public.user_projects using btree (user_id);

-- ---------- project_items ----------
create table if not exists public.project_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.user_projects(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    integer not null default 1,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint project_items_quantity_check check (quantity > 0),
  constraint project_items_project_id_product_id_key unique (project_id, product_id)
);
create index if not exists idx_project_items_product_id on public.project_items using btree (product_id);

-- ---------- RLS açık (production'da zaten açık; fresh DB için garanti) ----------
alter table public.organizations  enable row level security;
alter table public.price_lists    enable row level security;
alter table public.product_prices enable row level security;
alter table public.user_projects  enable row level security;
alter table public.project_items  enable row level security;

-- ---------- Drift reconcile: price_list_id_snapshot TEXT -> UUID ----------
-- 20250829_order_item_snapshots.sql bu kolonu TEXT tanımladı; production UUID.
-- Guard'lı: production'da NO-OP (zaten uuid), yalnız hâlâ text olan ortamda düzeltir.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='venthub_order_items'
      and column_name='price_list_id_snapshot' and data_type='text'
  ) then
    alter table public.venthub_order_items
      alter column price_list_id_snapshot type uuid using nullif(price_list_id_snapshot,'')::uuid;
  end if;
end $$;

commit;
