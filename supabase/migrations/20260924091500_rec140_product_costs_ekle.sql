-- REC-140 Faz 1 — ürün maliyet/liste alanları için admin-yalnız `product_costs` tablosu (EKLEYİCİ)
--
-- Plan: docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md (v3, §4 Faz 1) — plan-challenger v1+v2.
-- Karar 95 (Recep 2026-09-24): moderatör maliyeti/alış iskontosunu GÖRMEZ, yalnız admin/super_admin.
--
-- NE YAPAR:
--   1. products'a unique(id, tenant_id) — bileşik FK hedefi (kiracı ayrışamaz, kural 12).
--   2. product_costs: 8 hassas kolonun birebir kopyası (tip/NOT NULL/DEFAULT/CHECK aynı) + RLS
--      (tenant ∧ is_admin_user()). anon/public HİÇ; authenticated Faz 3'e kadar YALNIZ SELECT
--      (yazıcı kuralı veritabanında zorlanır: tüm yazımlar products üzerinden, tetik taşır).
--   3. 442 satırın kopyası + Guard A (satır satır eşitlik; fark ≠ 0 → exception, migration geri döner).
--   4. Senkron tetik products → product_costs (SECURITY DEFINER, NEW.tenant_id, upsert).
--   5. admin_search_products: anon EXECUTE kaldırılır (REST dışı ikinci sızıntı yolu; tek çağıran admin ekranı).
--
-- NE YAPMAZ (bilinçli): products'taki kolonlar YERİNDE kalır → REST sızıntısı bu migration'la
-- KAPANMAZ (kapanış Faz 3). Moderatör politikaları (Faz 1b) ve görünümler (Faz 2-DB) ayrı migration.
-- product_costs denetim tetiği Faz 3'te (senkron aynı değişiklik için ikinci satır doğurmasın).
--
-- GERİ ALMA: drop trigger trg_product_costs_senkron_ins/upd on public.products;
--            drop function public.product_costs_senkron(); drop table public.product_costs;
--            alter table public.products drop constraint products_id_tenant_uk;
--            grant execute on function public.admin_search_products(text,integer,integer,uuid) to anon;
--            (veri kaybı yok: products'taki kolonlara dokunulmadı.)

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 1 ── bileşik FK hedefi ─────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_id_tenant_uk'
                 and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_id_tenant_uk unique (id, tenant_id);
  end if;
end $$;

-- 2 ── tablo ─────────────────────────────────────────────────────────────────────────────────
create table if not exists public.product_costs (
  -- `denetim_izi_yaz()` satır kimliğini `id`'den okur (challenger v2 2.B.6) → row_pk NULL olmasın.
  id                      uuid          not null default gen_random_uuid() unique,
  product_id              uuid          primary key,
  tenant_id               uuid          not null,
  purchase_price          numeric(12,2) not null default 0
                                        constraint product_costs_purchase_price_nonneg check (purchase_price >= 0),
  purchase_currency       varchar(3)    not null default 'TRY',
  purchase_rate_to_base   numeric(18,6),
  cost_in_base            numeric(14,4),
  last_purchase_cost      numeric       constraint product_costs_last_purchase_cost_check check (last_purchase_cost >= 0),
  last_purchase_currency  char(3),
  last_purchased_at       timestamptz,
  supplier_name           text,
  updated_at              timestamptz   not null default now(),
  -- FK kolonları bir unique kısıtla BİREBİR eşleşsin → PostgREST ilişkiyi bire bir sayar (2.B.7).
  constraint product_costs_product_tenant_uk unique (product_id, tenant_id),
  constraint product_costs_product_fk foreign key (product_id, tenant_id)
    references public.products (id, tenant_id) on update cascade on delete cascade
);

comment on table public.product_costs is
  'REC-140: ürün liste/maliyet/tedarikçi alanları — yalnız admin/super_admin (karar 95). '
  'Faz 3''e kadar products''taki kopyadan tetikle beslenir; doğrudan YAZILMAZ.';

alter table public.product_costs enable row level security;

-- 3 ── yetkiler (Supabase public şemada yeni tabloya varsayılan ALL verir → AÇIKÇA geri al) ────────
revoke all on public.product_costs from anon, public;
revoke all on public.product_costs from authenticated;
grant select on public.product_costs to authenticated;   -- Faz 3'e kadar YALNIZ select
grant all on public.product_costs to service_role;

drop policy if exists product_costs_admin_select on public.product_costs;
create policy product_costs_admin_select on public.product_costs
  for select to authenticated
  using (tenant_id = (select public.jwt_tenant_id()) and (select public.is_admin_user()));

-- 4 ── kopya + Guard A ─────────────────────────────────────────────────────────────────────────
insert into public.product_costs (product_id, tenant_id, purchase_price, purchase_currency,
  purchase_rate_to_base, cost_in_base, last_purchase_cost, last_purchase_currency,
  last_purchased_at, supplier_name)
select id, tenant_id, purchase_price, purchase_currency, purchase_rate_to_base, cost_in_base,
       last_purchase_cost, last_purchase_currency, last_purchased_at, supplier_name
from public.products
on conflict (product_id) do nothing;

do $$
declare
  v_urun int; v_maliyet int; v_fark int;
begin
  select count(*) into v_urun from public.products;
  select count(*) into v_maliyet from public.product_costs;
  select count(*) into v_fark
  from public.products p
  left join public.product_costs c on c.product_id = p.id
  where c.product_id is null
     or c.tenant_id              is distinct from p.tenant_id
     or c.purchase_price         is distinct from p.purchase_price
     or c.purchase_currency      is distinct from p.purchase_currency
     or c.purchase_rate_to_base  is distinct from p.purchase_rate_to_base
     or c.cost_in_base           is distinct from p.cost_in_base
     or c.last_purchase_cost     is distinct from p.last_purchase_cost
     or c.last_purchase_currency is distinct from p.last_purchase_currency
     or c.last_purchased_at      is distinct from p.last_purchased_at
     or c.supplier_name          is distinct from p.supplier_name;
  if v_urun <> v_maliyet or v_fark <> 0 then
    raise exception 'REC-140 Guard A: products=% product_costs=% farkli_satir=% — kopya eksik/ayrisik, migration geri donuyor',
      v_urun, v_maliyet, v_fark;
  end if;
  raise notice 'REC-140 Guard A: % satir birebir kopyalandi', v_maliyet;
end $$;

-- 5 ── senkron tetik products → product_costs (Faz 3'e kadar TEK yön) ───────────────────────────
-- SECURITY DEFINER: yazan moderatör/admin product_costs'a yazma yetkisine sahip DEĞİL (yalnız select);
-- tetik sahip (postgres) haklarıyla yazar. tenant_id NEW'den (jwt_tenant_id() DEĞİL — 2.2).
-- pg_trigger_depth koruması YOK: akış tek yönlü (2.B.8).
create or replace function public.product_costs_senkron()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.product_costs as c (product_id, tenant_id, purchase_price, purchase_currency,
    purchase_rate_to_base, cost_in_base, last_purchase_cost, last_purchase_currency,
    last_purchased_at, supplier_name, updated_at)
  values (new.id, new.tenant_id, new.purchase_price, new.purchase_currency,
    new.purchase_rate_to_base, new.cost_in_base, new.last_purchase_cost, new.last_purchase_currency,
    new.last_purchased_at, new.supplier_name, now())
  on conflict (product_id) do update set
    tenant_id              = excluded.tenant_id,
    purchase_price         = excluded.purchase_price,
    purchase_currency      = excluded.purchase_currency,
    purchase_rate_to_base  = excluded.purchase_rate_to_base,
    cost_in_base           = excluded.cost_in_base,
    last_purchase_cost     = excluded.last_purchase_cost,
    last_purchase_currency = excluded.last_purchase_currency,
    last_purchased_at      = excluded.last_purchased_at,
    supplier_name          = excluded.supplier_name,
    updated_at             = now();
  return null;
end $$;

revoke all on function public.product_costs_senkron() from public, anon, authenticated;

drop trigger if exists trg_product_costs_senkron_ins on public.products;
create trigger trg_product_costs_senkron_ins
  after insert on public.products
  for each row execute function public.product_costs_senkron();

-- Yalnız 8 kolondan biri gerçekten değiştiyse (IS DISTINCT FROM) — gereksiz yazım yok.
drop trigger if exists trg_product_costs_senkron_upd on public.products;
create trigger trg_product_costs_senkron_upd
  after update of purchase_price, purchase_currency, purchase_rate_to_base, cost_in_base,
                  last_purchase_cost, last_purchase_currency, last_purchased_at, supplier_name, tenant_id
  on public.products
  for each row
  when (
       old.purchase_price         is distinct from new.purchase_price
    or old.purchase_currency      is distinct from new.purchase_currency
    or old.purchase_rate_to_base  is distinct from new.purchase_rate_to_base
    or old.cost_in_base           is distinct from new.cost_in_base
    or old.last_purchase_cost     is distinct from new.last_purchase_cost
    or old.last_purchase_currency is distinct from new.last_purchase_currency
    or old.last_purchased_at      is distinct from new.last_purchased_at
    or old.supplier_name          is distinct from new.supplier_name
    or old.tenant_id              is distinct from new.tenant_id
  )
  execute function public.product_costs_senkron();

-- 6 ── admin_search_products: anon EXECUTE kaldır (OPS/URUN security-reviewer 2026-09-24) ──────
-- INVOKER; anon'un kolon yetkisiyle purchase_price döndürüyordu. Tek çağıran admin ekranı (authenticated).
revoke execute on function public.admin_search_products(text, integer, integer, uuid) from anon, public;
