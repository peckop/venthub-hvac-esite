-- W4b · Vitrin fiyatı: motor cache'i tek kaynak (T001-VH)
-- Cetvel: docs/standards/pricing-standard.md §1 (fiyat TÜRETİLİR), §8 (cache), §14 INV-PRICE-1
--
-- SORUN: müşteri yüzeyi bugün `products.price` okuyor (11 yüzey + 3 RPC). O alan Kademe-2'de
-- emekli edildi (374 üründe de NULL) → her şey "Teklif Alın". Motor fiyatı `product_prices`
-- cache'inde üretiyor ama vitrin oraya BAKMIYOR.
--
-- ÇÖZÜM: PostgREST **computed column** — tek SQL tanımı hem RPC'lere hem doğrudan
-- `select=...,display_price` sorgularına hizmet eder. İki ayrı hesap yolu (SQL + TS) olsaydı
-- kaçınılmaz olarak sapardı; para hesabında bu kabul edilemez.
--
-- SEGMENT: fonksiyonlar SECURITY INVOKER'dır → `product_prices` RLS'i çağıranın segmentine
-- göre zaten süzüyor (anon → yalnız bireysel liste). Fonksiyon yalnız "hangi satır kazanır"
-- ve "net mi brüt mü" kararını verir:
--   · bireysel/anon → BRÜT (KDV dahil; Türk perakende konvansiyonu, cetvel §5)
--   · bayi/kurumsal → NET (KDV hariç; ticari fatura konvansiyonu)

begin;

-- 1) Vitrin fiyatı (computed column)
create or replace function public.display_price(p public.products)
returns numeric
language sql
stable
set search_path = public, pg_catalog
as $$
  select case
           when pl.user_type = 'individual' then pp.gross_price
           else pp.net_price
         end
    from public.product_prices pp
    join public.price_lists pl on pl.id = pp.price_list_id
   where pp.product_id = p.id
     and pp.is_active = true
     and pp.currency = 'TRY'
   order by (pl.user_type = public.jwt_price_segment()) desc,  -- önce kendi segmentin
            (pl.user_type = 'individual') desc,                -- sonra herkese açık liste
            pp.valid_from desc
   limit 1
$$;

comment on function public.display_price(public.products) is
  'Vitrin fiyatı (PostgREST computed column): motor cache''inden çağıranın segmentine uygun satır. '
  'Bireysel/anon → brüt (KDV dahil), bayi/kurumsal → net. Fiyat yoksa NULL → "Teklif Alın".';

-- 2) Gösterilen fiyatın KDV semantiği — etiket ("KDV Dahil" / "+KDV") buna göre çizilir.
create or replace function public.display_price_tax_included(p public.products)
returns boolean
language sql
stable
set search_path = public, pg_catalog
as $$
  select public.jwt_price_segment() = 'individual'
$$;

comment on function public.display_price_tax_included(public.products) is
  'display_price KDV dahil mi? (bireysel/anon = true). Satır parametresi PostgREST computed '
  'column sözleşmesi gereği; değer segmentten türer.';

grant execute on function public.display_price(public.products) to anon, authenticated;
grant execute on function public.display_price_tax_included(public.products) to anon, authenticated;

-- 2b) Toplu okuma RPC'si (TS tarafı için)
--     NEDEN: computed column PostgREST'te çalışır ama `supabase gen types` onu ÜRETMEZ →
--     tipli `.select('...,display_price')` derlenmez. RPC'ler ise tip üreticisine girer.
--     Böylece TS tarafı da AYNI SQL tanımını kullanır; ikinci bir hesap yolu doğmaz.
create or replace function public.get_display_prices(p_product_ids uuid[])
returns table(product_id uuid, display_price numeric, tax_included boolean)
language sql
stable
set search_path = public, pg_catalog
as $$
  select p.id,
         public.display_price(p),
         public.jwt_price_segment() = 'individual'
    from public.products p
   where p.id = any(coalesce(p_product_ids, array[]::uuid[]))
$$;

comment on function public.get_display_prices(uuid[]) is
  'Ürün kimliklerine göre vitrin fiyatı + KDV semantiği (tipli toplu okuma). '
  'display_price(products) ile AYNI kaynağı kullanır — TS tarafında ikinci hesap yolu yoktur.';

grant execute on function public.get_display_prices(uuid[]) to anon, authenticated;

-- 3) RPC'ler ham products.price yerine türetilmiş fiyatı döndürür ------------------

-- 3a) Aile listesi: min_price artık motorun fiyatından
create or replace function public.get_product_families_enriched(
  p_category_ids uuid[] default null::uuid[],
  p_limit integer default 24,
  p_offset integer default 0,
  p_search_query text default null::text,
  p_brand text default null::text
)
returns table(
  id uuid, name text, slug text, series_code text, description jsonb,
  brand_name text, category_id uuid, subcategory_id uuid, cover_image_path text,
  variant_count bigint, min_price numeric, total_count bigint
)
language sql
stable
set search_path to 'public'
as $function$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description,
           b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order,
           count(p.id) as variant_count,
           -- W4b: ham p.price DEĞİL, motor cache'inden türetilmiş vitrin fiyatı (INV-PRICE-1)
           min(public.display_price(p)) as min_price
      from product_families f
      join brands b on b.id = f.brand_id
      -- inner join: aktif varyantı olmayan aile listeye hiç girmez
      join products p on p.family_id = f.id
       and p.status = 'active' and p.deleted_at is null
     where f.deleted_at is null
       and (p_category_ids is null
            or f.category_id = any(p_category_ids)
            or f.subcategory_id = any(p_category_ids))
       and (p_brand is null or b.name ilike p_brand)
       and (p_search_query is null
            or f.name ilike '%' || p_search_query || '%'
            or f.series_code ilike '%' || p_search_query || '%'
            or p.sku ilike '%' || p_search_query || '%'
            or p.name ilike '%' || p_search_query || '%'
            or p.model_code ilike '%' || p_search_query || '%')
     group by f.id, f.name, f.slug, f.series_code, f.description,
              b.name, f.category_id, f.subcategory_id, f.sort_order
  )
  select fam.id, fam.name, fam.slug, fam.series_code, fam.description,
         fam.brand_name, fam.category_id, fam.subcategory_id,
         cov.path as cover_image_path,
         fam.variant_count, fam.min_price,
         count(*) over () as total_count
    from fam
    left join lateral (
      -- deterministik kapak: sku sırasına göre ilk aktif varyantın ilk görseli
      select pi.path
        from product_images pi
        join products pv on pv.id = pi.product_id
       where pv.family_id = fam.id
         and pv.status = 'active' and pv.deleted_at is null
       order by pv.sku, pi.sort_order
       limit 1
    ) cov on true
   order by fam.sort_order, fam.name
   limit least(greatest(coalesce(p_limit, 24), 1), 96)
  offset greatest(coalesce(p_offset, 0), 0)
$function$;

-- 3b) Aile detayı: varyant fiyatı + KDV semantiği bayrağı
create or replace function public.get_family_detail(p_slug text, p_lang text default 'tr'::text)
returns jsonb
language sql
stable
set search_path to 'public'
as $function$
  with lang as (
    select case when p_lang in ('tr', 'en') then p_lang else 'tr' end as v
  )
  select jsonb_build_object(
    'family', jsonb_build_object(
      'id', f.id,
      'name', f.name,
      'slug', f.slug,
      'series_code', f.series_code,
      'description', f.description,
      'brand_name', b.name,
      'category_id', f.category_id,
      'subcategory_id', f.subcategory_id,
      'meta_title', f.meta_title,
      'meta_description', f.meta_description
    ),
    -- W4b: gösterilen fiyatların KDV semantiği (bireysel/anon = KDV dahil)
    'price_tax_included', (public.jwt_price_segment() = 'individual'),
    'variants', (
      select coalesce(jsonb_agg(v.item order by v.sku), '[]'::jsonb)
        from (
          select p.sku,
                 jsonb_build_object(
                   'id', p.id,
                   'sku', p.sku,
                   'name', p.name,
                   'slug', p.slug,
                   'model_code', p.model_code,
                   -- W4b: ham p.price DEĞİL, motor fiyatı (INV-PRICE-1)
                   'price', public.display_price(p),
                   'stock_qty', p.stock_qty,
                   'technical_specs', p.technical_specs,
                   -- Genel açıklama: varyantın kendi dili yoksa aile açıklamasına düşer
                   'description', coalesce(
                     p.description_i18n ->> (select v from lang),
                     f.description ->> (select v from lang)
                   ),
                   'images', (
                     select coalesce(
                       jsonb_agg(jsonb_build_object(
                         'path', pi.path, 'alt', pi.alt, 'sort_order', pi.sort_order
                       ) order by pi.sort_order),
                       '[]'::jsonb
                     )
                     from product_images pi
                     where pi.product_id = p.id
                   )
                 ) as item
            from products p
           where p.family_id = f.id
             and p.status = 'active' and p.deleted_at is null
        ) v
    )
  )
    from product_families f
    join brands b on b.id = f.brand_id
   where f.slug = p_slug and f.deleted_at is null
   limit 1  -- UNIQUE (tenant_id, slug) — global tekil değil (B15)
$function$;

-- 3c) Arama: dönen `price` kolonu da motor fiyatı
create or replace function public.fts_search_products(
  p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb
)
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

-- === Guard ===
do $$
declare src text;
begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'public' and p.proname = 'display_price') then
    raise exception 'W4b guard: display_price(products) yok';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'public' and p.proname = 'get_display_prices') then
    raise exception 'W4b guard: get_display_prices(uuid[]) yok (TS tarafı tipli okuma bunu kullanır)';
  end if;

  -- RPC'ler ham products.price okumaya DÖNMEMELİ (INV-PRICE-1'in SQL tarafı)
  select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_family_detail';
  if src like '%''price'', p.price%' then
    raise exception 'W4b guard: get_family_detail hâlâ ham p.price döndürüyor';
  end if;

  select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'get_product_families_enriched';
  if src like '%min(p.price)%' then
    raise exception 'W4b guard: get_product_families_enriched hâlâ min(p.price) kullanıyor';
  end if;
end $$;

commit;
