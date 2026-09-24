-- REC-140 Faz 2-DB — maliyet/tedarikçi OKUYAN veritabanı nesneleri product_costs'a geçer
--
-- Plan: docs/plans/rec140-maliyet-kolonlari-kilidi-2026-09-24.md (v3, §4 Faz 2-DB). Faz 1 canlıda (765235da3).
-- Karar 95: maliyet yalnız admin/super_admin. Karar 99: liste fiyatı da gizli.
--
-- NE YAPAR (üç nesne, imza/kolon listesi DEĞİŞMEZ → istemci kodu aynen çalışır; görünüm yetkileri §2b'de
-- canlıdakiyle birebir yeniden kurulur, fonksiyon GRANT'ı create or replace ile korunur):
--   1. inventory_summary.capital_tied_up = product_costs.purchase_price × stok
--      (security_invoker → admin değeri görür; admin olmayan NULL görür — 0 DEĞİL: 0 yanlış bilgi olurdu).
--   2. inventory_velocity.supplier_name ← product_costs.supplier_name (admin olmayan NULL).
--      warehouse_location BU MİGRATION'DA DEĞİŞMEZ (iç-operasyon sınıfı, plan §1.2 "ayrı karar").
--   3. admin_search_products.purchase_price ← product_costs (INVOKER → admin olmayan NULL).
--      anon EXECUTE Faz 1'de kaldırıldı.
--
-- NİÇİN ŞİMDİ: bu üç nesne products.purchase_price / supplier_name'e BAĞIMLI; Faz 3'teki DROP
-- COLUMN'u bloklarlar (gölge provası G15). Ayrıca iki görünüm giriş yapmış HER müşteriye açık —
-- bu migration o sızıntıyı Faz 3'ü beklemeden kapatır.
--
-- GERİ ALMA: üç nesnenin önceki tanımları 2026-09-23 tabanında (inventory_summary, inventory_velocity,
-- admin_search_products) — aynı imzayla `create or replace` ile geri yazılır; veri değişmez.
-- SIRA: Faz 1 (product_costs) geri alınacaksa ÖNCE bu migration geri alınır. Bu migration'dan sonra iki
-- görünüm product_costs'a bağımlıdır; `drop table public.product_costs` görünüm bağımlılığı yüzünden
-- DURUR. CASCADE YASAK (görünümleri sessizce düşürür, istemci ekranları kırılır; rls-yetki-karari §5).

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 1 ── inventory_summary ─────────────────────────────────────────────────────────────────────
create or replace view public.inventory_summary
with (security_invoker = true) as
with movement_stats as (
  select inventory_movements.product_id,
         coalesce(sum(abs(inventory_movements.delta)), 0::bigint) as total_out_30d
  from public.inventory_movements
  where inventory_movements.delta < 0
    and (inventory_movements.reason = 'sale'::text or inventory_movements.reason = 'manual_out'::text)
    and inventory_movements.created_at >= (now() - '30 days'::interval)
  group by inventory_movements.product_id
)
select p.id as product_id,
       p.stock_qty,
       coalesce(m.total_out_30d, 0::bigint) as total_out_30d,
       round(coalesce(m.total_out_30d, 0::bigint)::numeric / 30.0, 2) as daily_velocity,
       case
         when coalesce(m.total_out_30d, 0::bigint) = 0 then 9999::numeric
         else round(p.stock_qty::numeric / (coalesce(m.total_out_30d, 0::bigint)::numeric / 30.0))
       end as days_until_empty,
       -- Önce: COALESCE(p.purchase_price, 0) * stok. Şimdi product_costs'tan; RLS admin olmayana satır
       -- vermez → NULL (bilinmiyor). COALESCE BİLEREK YOK: "0 TL sermaye" yanlış bilgidir.
       (c.purchase_price * p.stock_qty::numeric)::numeric as capital_tied_up,
       case
         when coalesce(m.total_out_30d, 0::bigint) >= 10 then 'A'::text
         when coalesce(m.total_out_30d, 0::bigint) >= 3 then 'B'::text
         else 'C'::text
       end as abc_class
from public.products p
left join movement_stats m on p.id = m.product_id
left join public.product_costs c on c.product_id = p.id;

-- 2 ── inventory_velocity ────────────────────────────────────────────────────────────────────
create or replace view public.inventory_velocity
with (security_invoker = true) as
with reserved as (
  select voi.product_id,
         sum(voi.quantity)::integer as reserved_qty
  from public.venthub_order_items voi
  join public.venthub_orders o on o.id = voi.order_id
  where (o.status = any (array['confirmed'::text, 'paid'::text, 'processing'::text]))
    and o.shipped_at is null
  group by voi.product_id
)
select p.id as product_id,
       p.name,
       coalesce(p.stock_qty, 0) as physical_stock,
       coalesce(r.reserved_qty, 0) as reserved_stock,
       coalesce(p.stock_qty, 0) - coalesce(r.reserved_qty, 0) as available_stock,
       p.warehouse_location,
       c.supplier_name
from public.products p
left join reserved r on r.product_id = p.id
left join public.product_costs c on c.product_id = p.id;

-- 2b ── görünüm yetkileri (INV-VIEW-GRANT-1) ─────────────────────────────────────────────────
-- public şemasında varsayılan ayrıcalık anon/authenticated/service_role'e sekiz yetki verir; tek düzeltici
-- REVOKE'tur. Canlı ölçüm 2026-09-24 (aclexplode): iki görünümde de authenticated=SELECT, service_role=SELECT,
-- anon YOK. Aşağıdaki blok o durumu BİREBİR yeniden kurar — net yetki değişikliği sıfır.
revoke all on public.inventory_summary from public;
revoke all on public.inventory_summary from anon;
revoke all on public.inventory_summary from authenticated;
revoke all on public.inventory_summary from service_role;
grant select on public.inventory_summary to authenticated, service_role;

revoke all on public.inventory_velocity from public;
revoke all on public.inventory_velocity from anon;
revoke all on public.inventory_velocity from authenticated;
revoke all on public.inventory_velocity from service_role;
grant select on public.inventory_velocity to authenticated, service_role;

-- 3 ── admin_search_products (imza + dönüş tipi AYNI → GRANT korunur) ──────────────────────────
create or replace function public.admin_search_products(p_q text, p_limit integer default 50,
  p_offset integer default 0, p_category_id uuid default null::uuid)
returns table(id uuid, name text, sku text, model_code text, brand text, status text, category_id uuid,
  price numeric, purchase_price numeric, stock_qty integer, low_stock_threshold integer,
  is_featured boolean, slug text, rank real, total_count bigint)
language plpgsql
stable
set search_path to 'pg_catalog', 'public'
as $function$
declare
  v_limit int;
  v_offset int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
begin
  v_limit  := least(greatest(p_limit, 1), 200);
  v_offset := greatest(p_offset, 0);
  v_raw    := coalesce(trim(p_q), '');
  v_raw_wildcard := replace(v_raw, ' ', '%');

  -- Empty query → return empty (caller should use normal Supabase query)
  if v_raw = '' then
    return;
  end if;

  v_tsq := plainto_tsquery('turkish', v_raw);

  return query
  with matched as (
    select
      p.id, p.name, p.sku, p.model_code, p.brand,
      p.status, p.category_id, p.price,
      -- REC-140 Faz 2-DB: products.purchase_price DEĞİL, product_costs (RLS: yalnız admin; diğeri NULL).
      c.purchase_price,
      p.stock_qty, p.low_stock_threshold, p.is_featured, p.slug,
      ts_rank(
        to_tsvector('turkish',
          coalesce(p.name,'') || ' ' ||
          coalesce(p.model_code,'') || ' ' ||
          coalesce(p.sku,'') || ' ' ||
          coalesce(p.brand,'') || ' ' ||
          coalesce(p.description_i18n->>'tr','') || ' ' ||
          coalesce(p.technical_specs::text,'')
        ),
        v_tsq
      ) as rank
    from public.products p
    left join public.product_costs c on c.product_id = p.id
    where (
      p.name ilike '%' || v_raw_wildcard || '%'
      or p.model_code ilike '%' || v_raw_wildcard || '%'
      or p.sku ilike '%' || v_raw_wildcard || '%'
      or p.brand ilike '%' || v_raw_wildcard || '%'
      or p.slug ilike '%' || v_raw_wildcard || '%'
      or p.technical_specs::text ilike '%' || v_raw || '%'
      or to_tsvector('turkish',
           coalesce(p.name,'') || ' ' ||
           coalesce(p.model_code,'') || ' ' ||
           coalesce(p.sku,'') || ' ' ||
           coalesce(p.brand,'') || ' ' ||
           coalesce(p.description_i18n->>'tr','') || ' ' ||
           coalesce(p.technical_specs::text,'')
         ) @@ v_tsq
    )
    and (p_category_id is null or p.category_id = p_category_id)
  )
  select
    m.id, m.name, m.sku, m.model_code, m.brand,
    m.status, m.category_id, m.price, m.purchase_price,
    m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug,
    m.rank,
    count(*) over() as total_count
  from matched m
  order by m.rank desc nulls last, m.name asc
  limit v_limit
  offset v_offset;
end;
$function$;

-- 4 ── öz-kontrol + Guard E ────────────────────────────────────────────────────────────────────
do $$
declare
  v_bagimli int;
  v_satir int;
begin
  -- (a) İki görünüm products'ın maliyet/tedarikçi kolonlarına ARTIK bağımlı değil (Faz 3 DROP'u bloklamaz).
  select count(*) into v_bagimli
  from pg_depend d
  join pg_rewrite rw on rw.oid = d.objid
  join pg_attribute a on a.attrelid = d.refobjid and a.attnum = d.refobjsubid
  where d.refobjid = 'public.products'::regclass
    and rw.ev_class in ('public.inventory_summary'::regclass, 'public.inventory_velocity'::regclass)
    and a.attname in ('purchase_price','purchase_currency','purchase_rate_to_base','cost_in_base',
                      'last_purchase_cost','last_purchase_currency','last_purchased_at','supplier_name');
  if v_bagimli <> 0 then
    raise exception 'REC-140 Faz 2-DB: görünümler products maliyet kolonuna hâlâ bağımlı (% bağ)', v_bagimli;
  end if;

  -- (b) plpgsql bağımlılığı izlenmez → gövde metni: products'tan purchase_price okumuyor.
  if pg_get_functiondef('public.admin_search_products(text,integer,integer,uuid)'::regprocedure)
     ~* '\mp\.purchase_price\M' then
    raise exception 'REC-140 Faz 2-DB: admin_search_products hâlâ p.purchase_price okuyor';
  end if;

  -- (c) Guard E: nesneler gerçekten çalışıyor (hata yok).
  select count(*) into v_satir from public.inventory_summary;
  select count(*) into v_satir from public.inventory_velocity;
  perform * from public.admin_search_products('a', 1, 0, null);

  -- (d) yetkiler korundu (create or replace aynı imza).
  if has_function_privilege('anon', 'public.admin_search_products(text,integer,integer,uuid)', 'execute') then
    raise exception 'REC-140 Faz 2-DB: anon admin_search_products yetkisi geri geldi';
  end if;
  if not has_function_privilege('authenticated', 'public.admin_search_products(text,integer,integer,uuid)', 'execute') then
    raise exception 'REC-140 Faz 2-DB: authenticated admin_search_products yetkisini kaybetti (admin ekranı kırılır)';
  end if;
  if has_table_privilege('anon', 'public.inventory_summary', 'select')
     or has_table_privilege('anon', 'public.inventory_velocity', 'select') then
    raise exception 'REC-140 Faz 2-DB: anon envanter görünümlerini okuyabiliyor';
  end if;
  if not has_table_privilege('authenticated', 'public.inventory_summary', 'select')
     or not has_table_privilege('authenticated', 'public.inventory_velocity', 'select') then
    raise exception 'REC-140 Faz 2-DB: authenticated envanter görünümlerini okuyamıyor (admin stok ekranı kırılır)';
  end if;
  if has_table_privilege('authenticated', 'public.inventory_summary', 'insert,update,delete,truncate')
     or has_table_privilege('authenticated', 'public.inventory_velocity', 'insert,update,delete,truncate') then
    raise exception 'REC-140 Faz 2-DB: authenticated envanter görünümlerinde yazma yetkisi taşıyor';
  end if;
  raise notice 'REC-140 Faz 2-DB öz-kontrol GEÇTİ';
end $$;

commit;
