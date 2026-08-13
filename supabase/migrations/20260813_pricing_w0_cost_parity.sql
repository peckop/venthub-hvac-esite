-- W0 — Fiyat motoru: maliyet + parite temeli (T001-VH)
-- Plan: docs/plans/fiyat-motoru-plan-2026-08-13.md §W0 · Cetvel: docs/standards/pricing-standard.md §10
-- İçerik: products maliyet kolonları + currency_rates (append-only, INV-PRICE-4) + günlük TCMB cron'u.
-- Backfill (348 ürüne kur+maliyet yazımı) bu migration'da DEĞİL — ayrı onaylı prod-yazım adımı.

begin;

-- === 1. products: maliyet türetme kolonları (additive) ===
alter table public.products
  add column if not exists purchase_rate_to_base numeric(18,6),
  add column if not exists cost_in_base numeric(14,4);

comment on column public.products.purchase_rate_to_base is
  'Alış anı TCMB kuru (snapshot). İlk backfill = backfill günü Efektif Satış; gerçek alım-anı kuru T010 Satınalma ile gelecek.';
comment on column public.products.cost_in_base is
  'Donmuş TL maliyet = purchase_price × purchase_rate_to_base (purchase_currency=TRY ise kur 1).';

-- === 2. currency_rates — append-only parite defteri ===
-- Elle ezme = yeni satır (source='manual'); UPDATE/DELETE policy bilinçli YOK (INV-PRICE-4).
create table if not exists public.currency_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.jwt_tenant_id() references public.tenants(id) on delete restrict,
  base_ccy char(3) not null default 'TRY',
  quote_ccy char(3) not null,
  rate numeric(18,6) not null check (rate > 0),
  spread_pct numeric not null default 0,
  source text not null check (source in ('tcmb', 'manual')),
  effective_date date not null,
  fetched_at timestamptz not null default now()
);

comment on table public.currency_rates is
  'Append-only kur defteri (pricing-standard §10). rate = TCMB Efektif Satış; en güncel kur = max(effective_date) ≤ bugün, sonra max(fetched_at).';

-- TCMB bülteni günde tek satır; manuel satır sınırsız (aynı güne ezme = yeni manual satır)
create unique index if not exists currency_rates_tcmb_daily_uq
  on public.currency_rates (tenant_id, quote_ccy, effective_date)
  where source = 'tcmb';
create index if not exists currency_rates_latest_idx
  on public.currency_rates (tenant_id, quote_ccy, effective_date desc, fetched_at desc);

alter table public.currency_rates enable row level security;

-- Okuma: tenant-scoped (gösterim kuru storefront'ta da gerekir → anon dahil select)
create policy currency_rates_tenant_read on public.currency_rates
  for select using (tenant_id = (select public.jwt_tenant_id()));
-- Yazma: yalnız service_role (tcmb-rates-sync job + admin elle-ezme sunucu yolu), INSERT-only
create policy currency_rates_service_insert on public.currency_rates
  for insert to service_role with check (true);

-- === 3. Günlük TCMB senkronu: pg_cron + pg_net → Edge Function tcmb-rates-sync ===
-- 12:45 UTC = 15:45 TSİ (TCMB gösterge bülteni ~15:30'da yayınlanır).
-- Hafta sonu/tatil çağrısı fonksiyonda no-op (bülten-tarihi idempotency'si) — cron her gün koşabilir.
create extension if not exists pg_cron;
select cron.schedule(
  'tcmb-rates-sync-daily',
  '45 12 * * *',
  $cron$ select net.http_post(
    url := 'https://tnofewwkwlyjsqgwjjga.supabase.co/functions/v1/tcmb-rates-sync',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) $cron$
);

-- === Guard ===
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name in ('purchase_rate_to_base', 'cost_in_base');
  if n <> 2 then
    raise exception 'W0 guard: products maliyet kolonları eksik (%/2)', n;
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'currency_rates') then
    raise exception 'W0 guard: currency_rates tablosu yok';
  end if;
  if exists (select 1 from pg_policies
             where schemaname = 'public' and tablename = 'currency_rates'
               and cmd in ('UPDATE', 'DELETE')) then
    raise exception 'W0 guard: currency_rates üzerinde UPDATE/DELETE policy olmamalı (append-only, INV-PRICE-4)';
  end if;
  if not exists (select 1 from cron.job where jobname = 'tcmb-rates-sync-daily') then
    raise exception 'W0 guard: tcmb-rates-sync-daily cron kaydı yok';
  end if;
end $$;

commit;
