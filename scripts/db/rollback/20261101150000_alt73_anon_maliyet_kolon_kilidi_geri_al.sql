-- ALT-73 AŞAMA A GERİ ALMA — anon'a products tablo düzeyi SELECT geri verilir, dört fonksiyon
-- eski `display_price(p)` (tüm-satır) çağrısına döner, display_price(uuid) düşer.
-- OTOMATİK UYGULANMAZ (supabase/migrations dışında). Elle, Recep sözüyle koşulur.
--
-- Ne zaman: kilitten sonra vitrinde products okuyan bir istek 42501 (permission denied) veriyorsa
-- (ör. yeni kolon anon'a grant edilmeden vitrine eklendi) ve hızlı onarım `grant select (<kolon>)` ile
-- yapılamıyorsa. Bu betik maliyet kolonlarını anon'a YENİDEN AÇAR (ALT-73 zararı geri gelir) — geçici olmalı.
-- Dört fonksiyon gövdesi geri alınan sürümde, kilit öncesi canlı tanımla aynıdır (yalnız display_price çağrısı).

begin;

set lock_timeout = '5s';
set statement_timeout = '30s';

create or replace function public.get_display_prices(p_product_ids uuid[])
returns table(product_id uuid, display_price numeric, tax_included boolean)
language sql
stable
set search_path to 'public', 'pg_catalog'
as $function$
  select p.id,
         public.display_price(p),
         public.jwt_price_segment() = 'individual'
    from public.products p
   where p.id = any(coalesce(p_product_ids, array[]::uuid[]))
$function$;

create or replace function public.fts_search_products(p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb)
returns table(id uuid, name text, sku text, brand text, price numeric, rank real, family_slug text, cover_image_path text)
language plpgsql
stable
set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit int;
  v_tsq   tsquery;
begin
  -- Tavan 500: kapı betiği geniş vakalarda GERÇEK sayıyı okuyabilsin diye (istemci 20 yollar).
  v_limit := least(greatest(p_limit, 1), 500);
  v_tsq   := plainto_tsquery('turkish', coalesce(p_q,''));

  return query
  select s.id, s.name, s.sku, s.brand, s.price,
         (s.metin_rank - (s.basamak::real / 100.0::real))::real as rank,   -- anlamı eskisiyle aynı
         s.family_slug, s.cover_image_path
    from (
      select p.id, p.name, p.sku, p.brand,
             public.display_price(p) as price, -- INV-PRICE-1: ham p.price DEĞİL
             e.basamak,
             public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), p_q) as ad_isabet,
             ts_rank(psi.search_document, v_tsq) as metin_rank,
             f.slug as family_slug,
             img.path as cover_image_path
        from public.arama_eslesen_urunler(p_q) e
        join public.products p on p.id = e.product_id
        join public.product_search_index psi on psi.product_id = p.id
        left join public.product_families f
          on f.id = p.family_id and f.deleted_at is null
        left join lateral (
          select pi.path from public.product_images pi
           where pi.product_id = p.id
           order by pi.sort_order
           limit 1
        ) img on true
       where (
           (not (p_filters ? 'category_id'))
           or p.category_id = (p_filters->>'category_id')::uuid
           or p.subcategory_id = (p_filters->>'category_id')::uuid
         )
         and p.status = 'active'
         and p.deleted_at is null
    ) s
   -- K3.1e: sıra açık sütunlarla. Öneri kutusu AYNI dört anahtarı kullanır.
   order by s.basamak asc, s.ad_isabet desc, s.metin_rank desc, s.name asc
   limit v_limit;
end;
$function$;

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

create or replace function public.get_product_families_enriched(p_category_ids uuid[] default null::uuid[], p_limit integer default 24, p_offset integer default 0, p_search_query text default null::text, p_brand text default null::text)
returns table(id uuid, name text, slug text, series_code text, description jsonb, brand_name text, category_id uuid, subcategory_id uuid, cover_image_path text, variant_count bigint, min_price numeric, total_count bigint)
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


-- Tablo düzeyi SELECT geri (kolon düzeyi yetkiler zararsız kalır).
grant select on public.products to anon;

-- Eski çağıranlar artık uuid aşırı yüklemesini kullanmıyor; düşürmek güvenli.
drop function if exists public.display_price(uuid);

notify pgrst, 'reload schema';

commit;
