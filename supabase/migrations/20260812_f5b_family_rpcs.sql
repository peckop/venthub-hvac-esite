-- 20260812 — F5-B W0.2: Aile-bazlı vitrin RPC'leri
-- get_product_families_enriched: aile-sayfalama (varyant satırı listeye girmez, PS-041)
--   kapak = product_images.path (URL çevirimi istemci resolver'ında — PS-022),
--   boş aile (aktif varyantı olmayan) gizli, total_count window ile sayfalama toplamı.
-- get_family_detail: PDP'nin tek çağrısı — aile + aktif varyantlar (specs dahil) + görseller.
-- İkisi de SECURITY INVOKER (RLS aynen uygulanır) ve tenant_id sızdırmaz.
-- Eski get_products_enriched KALIR; W4.1 kapanış migration'ında (kullanıcı onayı) DROP edilir.

begin;

create or replace function public.get_product_families_enriched(
  p_category_ids uuid[] default null,
  p_limit integer default 24,
  p_offset integer default 0,
  p_search_query text default null,
  p_brand text default null
)
returns table (
  id uuid,
  name text,
  slug text,
  series_code text,
  description jsonb,
  brand_name text,
  category_id uuid,
  subcategory_id uuid,
  cover_image_path text,
  variant_count bigint,
  min_price numeric,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description,
           b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order,
           count(p.id) as variant_count,
           min(p.price) as min_price
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
$$;

create or replace function public.get_family_detail(
  p_slug text,
  p_lang text default 'tr'
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
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
                   'price', p.price,
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
$$;

grant execute on function public.get_product_families_enriched(uuid[], integer, integer, text, text) to anon, authenticated;
grant execute on function public.get_family_detail(text, text) to anon, authenticated;

-- Doğrulama guard'ları
do $$
declare
  v_rpc_count int;
  v_expected int;
  v_total bigint;
  v_slug text;
  v_detail jsonb;
begin
  -- 1) Liste RPC boş-aile gizleyerek tüm aileleri dönmeli
  select count(*) into v_rpc_count
    from public.get_product_families_enriched(null, 96, 0, null, null);

  select count(distinct f.id) into v_expected
    from public.product_families f
    join public.products p on p.family_id = f.id
     and p.status = 'active' and p.deleted_at is null
   where f.deleted_at is null;

  if v_rpc_count <> v_expected or v_rpc_count < 30 then
    raise exception 'Aile RPC sayimi tutarsiz: rpc=% beklenen=% (min 30)', v_rpc_count, v_expected;
  end if;

  -- 2) total_count window sayfalamada sabit kalmali
  select total_count into v_total
    from public.get_product_families_enriched(null, 5, 0, null, null) limit 1;
  if v_total <> v_expected then
    raise exception 'total_count yanlis: %, beklenen %', v_total, v_expected;
  end if;

  -- 3) Detay RPC: ornek aile varyant + tenant_id sizdirmama kontrolu
  select slug into v_slug from public.get_product_families_enriched(null, 1, 0, null, null);
  v_detail := public.get_family_detail(v_slug, 'tr');
  if v_detail is null or jsonb_array_length(v_detail -> 'variants') < 1 then
    raise exception 'get_family_detail(%) varyant dondurmedi', v_slug;
  end if;
  if v_detail::text like '%tenant_id%' then
    raise exception 'get_family_detail tenant_id sizdiriyor';
  end if;
end $$;

commit;
