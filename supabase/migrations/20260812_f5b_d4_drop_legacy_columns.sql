-- 20260812 — F5-B W4.1 (D4): Legacy kolon DROP + emekli RPC temizliği
-- GERİ ALINAMAZ. Ön-koşullar (D3'te tamamlandı, PR #479):
--   * Kod tarafında bu kolonların TÜM okuyucuları description_i18n /
--     technical_specs / product_images resolver'ına geçirildi.
--   * get_products_enriched'in kalan 2 çağıranı (PDP ilgili-ürünler, marka
--     sayfası) bu PR'da aile RPC'sine geçti.
-- Veri-kaybı analizi (2026-08-12, prod): 374 satırın TAMAMINDA image_url /
-- airflow_capacity / noise_level / pressure_rating / meta_title /
-- meta_description NULL; is_category_manual hep false/null; description
-- %100 description_i18n->>'tr' kopyası. Aşağıdaki guard'lar bunu APPLY ANINDA
-- yeniden doğrular — veri belirmişse migration kırmızı durur, DROP çalışmaz.
-- KALIR (bilinçli borç): price (Fiyat Motoru'na dek) · slug (308 penceresi) ·
-- brand text (PS-030).

begin;

-- 0) Guard: DROP edilecek kolonlarda gerçekten veri yok
do $$
declare
  v_bad int;
begin
  select count(*) into v_bad
    from public.products
   where image_url is not null
      or airflow_capacity is not null
      or noise_level is not null
      or pressure_rating is not null
      or meta_title is not null
      or meta_description is not null
      or (is_category_manual is not null and is_category_manual <> false)
      or (description is not null and description <> ''
          and description is distinct from (description_i18n->>'tr')
          and description is distinct from (description_i18n->>'en'));
  if v_bad <> 0 then
    raise exception 'DROP iptal: % satirda korunmasi gereken legacy veri var', v_bad;
  end if;
end $$;

-- 1) Emekli RPC: get_products_enriched (gövdesi DROP edilecek kolonlari secer;
--    kolonlardan once kaldirilmali). Kod tarafinda 0 cagiran kaldi.
drop function if exists public.get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric);

-- 2) Kolon DROP'lari
alter table public.products
  drop column if exists description,
  drop column if exists image_url,
  drop column if exists airflow_capacity,
  drop column if exists noise_level,
  drop column if exists pressure_rating,
  drop column if exists meta_title,
  drop column if exists meta_description,
  drop column if exists is_category_manual;

-- 3) Doğrulama guard'ları
do $$
declare
  v_cols int;
  v_rpc int;
  v_active int;
  v_family int;
begin
  select count(*) into v_cols
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products'
     and column_name in ('description','image_url','airflow_capacity','noise_level',
                         'pressure_rating','meta_title','meta_description','is_category_manual');
  if v_cols <> 0 then
    raise exception 'Kolon DROP eksik: % kolon hala duruyor', v_cols;
  end if;

  select count(*) into v_rpc
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_products_enriched';
  if v_rpc <> 0 then
    raise exception 'get_products_enriched hala duruyor (% overload)', v_rpc;
  end if;

  select count(*) into v_active from public.products
   where status = 'active' and deleted_at is null;
  if v_active < 374 then
    raise exception 'Aktif urun sayisi dustu: % (beklenen >= 374)', v_active;
  end if;

  -- Aile RPC'si kolon DROP'undan etkilenmemis olmali
  select count(*) into v_family
    from public.get_product_families_enriched(null, 96, 0, null, null);
  if v_family < 30 then
    raise exception 'Aile RPC bozuldu: % aile dondu (beklenen >= 30)', v_family;
  end if;
end $$;

commit;
