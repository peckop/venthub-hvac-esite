-- W0 backfill — 348 EUR-alışlı ürüne ilk kur snapshot'ı + donmuş TL maliyet (T001-VH)
-- ⚠️ PROD VERİ YAZIMI: mode-independent hard gate — yalnız Recep onayıyla, önce DRY-RUN raporu.
-- Bu dosya migration DEĞİLDİR (otomatik uygulanmaz); onay sonrası elle/MCP ile koşulur.
-- Ön koşul: 20260813_pricing_w0_cost_parity uygulanmış + currency_rates'te en az bir tcmb satırı
-- (tcmb-rates-sync bir kez koşmuş) olmalı.
-- Not: gerçek alım tarihleri bilinmediğinden snapshot = koşum günü TCMB Efektif Satış;
-- gerçek alım-anı kuru ileride T010 Satınalma modülüyle yazılır (plan §W0 notu).

-- === DRY-RUN (rapor; hiçbir şey yazmaz) ===
with latest_rate as (
  select distinct on (quote_ccy) quote_ccy, rate, effective_date
  from public.currency_rates
  where tenant_id = 'd3b07384-d113-495f-a558-8c38634e0000'
    and source = 'tcmb' and effective_date <= current_date
  order by quote_ccy, effective_date desc, fetched_at desc
)
select p.purchase_currency,
       r.rate            as uygulanacak_kur,
       r.effective_date  as kur_tarihi,
       count(*)          as urun_sayisi,
       min(p.purchase_price) as min_alis,
       max(p.purchase_price) as max_alis,
       round(sum(p.purchase_price * coalesce(r.rate, 1)), 2) as toplam_tl_maliyet
from public.products p
left join latest_rate r on r.quote_ccy = p.purchase_currency
where p.purchase_price > 0 and p.cost_in_base is null
group by 1, 2, 3
order by 1;

-- === APPLY (GATED — Recep onayından sonra) ===
-- begin;
-- with latest_rate as (
--   select distinct on (quote_ccy) quote_ccy, rate
--   from public.currency_rates
--   where tenant_id = 'd3b07384-d113-495f-a558-8c38634e0000'
--     and source = 'tcmb' and effective_date <= current_date
--   order by quote_ccy, effective_date desc, fetched_at desc
-- )
-- update public.products p
-- set purchase_rate_to_base = case when p.purchase_currency = 'TRY' then 1 else r.rate end,
--     cost_in_base = round(p.purchase_price * case when p.purchase_currency = 'TRY' then 1 else r.rate end, 4)
-- from latest_rate r
-- where (p.purchase_currency = r.quote_ccy or p.purchase_currency = 'TRY')
--   and p.purchase_price > 0
--   and p.cost_in_base is null;
-- commit;
