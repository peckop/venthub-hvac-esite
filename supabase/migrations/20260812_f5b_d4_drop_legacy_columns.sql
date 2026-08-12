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

-- 1b) Arama RPC'leri: govdeleri p.description referansliyor. plpgsql govdesi
--     Postgres'te kolon-bagimliligi olarak izlenmez -> DROP sessiz gecer, ilk
--     cagri "column p.description does not exist" ile patlar (ultrareview #480
--     bug_003). DROP'tan once description_i18n->>'tr' esdegerine gecirilir
--     (description %100 tr kopyasiydi -> davranis birebir ayni).
create or replace function public.admin_search_products(p_q text, p_limit integer default 50, p_offset integer default 0, p_category_id uuid default null::uuid)
 returns table(id uuid, name text, sku text, model_code text, brand text, status text, category_id uuid, price numeric, purchase_price numeric, stock_qty integer, low_stock_threshold integer, is_featured boolean, slug text, rank real, total_count bigint)
 language plpgsql
 stable
 set search_path to 'pg_catalog', 'public'
as $function$
DECLARE
  v_limit int;
  v_offset int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit  := LEAST(GREATEST(p_limit, 1), 200);
  v_offset := GREATEST(p_offset, 0);
  v_raw    := coalesce(trim(p_q), '');
  v_raw_wildcard := replace(v_raw, ' ', '%');

  -- Empty query → return empty (caller should use normal Supabase query)
  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  WITH matched AS (
    SELECT
      p.id, p.name, p.sku, p.model_code, p.brand,
      p.status, p.category_id, p.price, p.purchase_price,
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
      ) AS rank
    FROM public.products p
    WHERE (
      p.name ILIKE '%' || v_raw_wildcard || '%'
      OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
      OR p.sku ILIKE '%' || v_raw_wildcard || '%'
      OR p.brand ILIKE '%' || v_raw_wildcard || '%'
      OR p.slug ILIKE '%' || v_raw_wildcard || '%'
      OR p.technical_specs::text ILIKE '%' || v_raw || '%'
      OR to_tsvector('turkish',
           coalesce(p.name,'') || ' ' ||
           coalesce(p.model_code,'') || ' ' ||
           coalesce(p.sku,'') || ' ' ||
           coalesce(p.brand,'') || ' ' ||
           coalesce(p.description_i18n->>'tr','') || ' ' ||
           coalesce(p.technical_specs::text,'')
         ) @@ v_tsq
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  )
  SELECT
    m.id, m.name, m.sku, m.model_code, m.brand,
    m.status, m.category_id, m.price, m.purchase_price,
    m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug,
    m.rank,
    count(*) OVER() AS total_count
  FROM matched m
  ORDER BY m.rank DESC NULLS LAST, m.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$function$;

create or replace function public.fts_search_products(p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb)
 returns table(id uuid, name text, sku text, brand text, price numeric, rank real)
 language plpgsql
 stable
 set search_path to 'pg_catalog', 'public'
as $function$
DECLARE
  v_limit int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 100);
  v_raw := coalesce(p_q, '');
  v_raw_wildcard := replace(v_raw, ' ', '%');
  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  SELECT p.id, p.name, p.sku, p.brand, p.price,
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
         ) AS rank
  FROM public.products p
  WHERE (
    p.name ILIKE '%' || v_raw_wildcard || '%'
    OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
    OR p.sku ILIKE '%' || v_raw_wildcard || '%'
    OR p.brand ILIKE '%' || v_raw_wildcard || '%'
    OR (p.description_i18n->>'tr') ILIKE '%' || v_raw_wildcard || '%'
    OR p.technical_specs::text ILIKE '%' || v_raw || '%'
    OR to_tsvector('turkish',
         coalesce(p.name,'') || ' ' ||
         coalesce(p.model_code,'') || ' ' ||
         coalesce(p.sku,'') || ' ' ||
         coalesce(p.brand,'') || ' ' ||
         coalesce(p.description_i18n->>'tr','') || ' ' ||
         coalesce(p.technical_specs::text,'')
       ) @@ v_tsq
  )
  AND (
    (NOT (p_filters ? 'category_id')) OR (p.category_id = (p_filters->>'category_id')::uuid)
  )
  AND p.status = 'active'
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT v_limit;
END;
$function$;

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
  v_admin_search int;
  v_fts_search int;
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

  -- Arama RPC'leri DROP sonrasi GERCEKTEN cagrilarak dogrulanir: plpgsql govdesi
  -- kolonlari cagri aninda cozer, yalniz varlik kontrolu sessiz kirigi yakalamaz.
  select count(*) into v_admin_search
    from public.admin_search_products('fan', 5, 0, null);
  if v_admin_search < 1 then
    raise exception 'admin_search_products bozuk: "fan" icin % sonuc', v_admin_search;
  end if;

  select count(*) into v_fts_search
    from public.fts_search_products('fan', 5, '{}'::jsonb);
  if v_fts_search < 1 then
    raise exception 'fts_search_products bozuk: "fan" icin % sonuc', v_fts_search;
  end if;
end $$;

commit;
