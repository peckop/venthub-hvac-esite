-- Arama sonucundan ürüne gidilemiyor — fts_search_products aile slug'ı döndürmüyor
--
-- BULGU (W4b-2, 2026-08-14): `SearchOverlay` arama sonucunda `Routes.product(r.slug!)`
-- çağırıyor, ama `fts_search_products` yalnız (id, name, sku, brand, price, rank) döndürüyor.
-- `slug` alanı hiç gelmediği için kullanıcı `/products/undefined` adresine yönlendiriliyor —
-- hem tıklama hem Enter yolu. Canlıda doğrulandı.
--
-- Hata TS tarafında görünmüyordu çünkü `FtsProductResult extends DomainProduct` diyordu:
-- tip 30 alan vaat ediyor, RPC 6 alan veriyordu. W4b'de domain tipi dürüstleştirilince
-- derleyici bunu ortaya çıkardı.
--
-- ÇÖZÜM: PDP bir AİLE slug'ı bekler (varyant `?sku=` ile seçilir), o yüzden RPC ürünün
-- ailesinin slug'ını döndürür. Kapak görseli de eklenir (sonuç listesi zaten göstermeye
-- çalışıyor, veri gelmediği için hep yer tutucu çiziyordu).

begin;

-- DİKKAT: `create or replace` dönüş tipini DEĞİŞTİREMEZ ("cannot change return type of
-- existing function" — OUT parametreleri değişti: +family_slug, +cover_image_path).
-- Bu yüzden önce düşürülür. Fonksiyon PostgREST üzerinden çağrıldığından yetkiler
-- create sonrası AÇIKÇA geri verilir: drop, mevcut grant'leri de götürür.
drop function if exists public.fts_search_products(text, integer, jsonb);

create or replace function public.fts_search_products(
  p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb
)
returns table(
  id uuid, name text, sku text, brand text, price numeric, rank real,
  family_slug text, cover_image_path text
)
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
  SELECT p.id, p.name, p.sku, p.brand,
         public.display_price(p) AS price,  -- W4b: ham p.price DEĞİL (INV-PRICE-1)
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
         ) AS rank,
         f.slug AS family_slug,
         img.path AS cover_image_path
  FROM public.products p
  LEFT JOIN public.product_families f
    ON f.id = p.family_id AND f.deleted_at IS NULL
  LEFT JOIN LATERAL (
    SELECT pi.path FROM public.product_images pi
     WHERE pi.product_id = p.id
     ORDER BY pi.sort_order
     LIMIT 1
  ) img ON true
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

grant execute on function public.fts_search_products(text, integer, jsonb) to anon, authenticated;

-- === Guard ===
do $$
declare src text;
begin
  -- Drop sonrası yetkiler geri verilmezse arama anon kullanıcıda sessizce ölür.
  if not has_function_privilege('anon', 'public.fts_search_products(text, integer, jsonb)', 'execute') then
    raise exception 'guard: anon fts_search_products''ı çağıramıyor — grant kaybolmuş';
  end if;

  select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'fts_search_products';
  if src not like '%family_slug%' then
    raise exception 'guard: fts_search_products family_slug döndürmüyor — arama sonucu ürüne gidemez';
  end if;
  if src not like '%display_price(p)%' then
    raise exception 'guard: fts_search_products ham p.price''a geri dönmüş (INV-PRICE-1)';
  end if;
end $$;

commit;
