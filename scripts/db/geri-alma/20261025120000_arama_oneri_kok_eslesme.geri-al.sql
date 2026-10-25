-- URN-139 geri alma — 20261025120000_arama_oneri_kok_eslesme.sql
-- `get_search_suggestions` gövdesini ÖNCEKİ hâline (supabase/migrations/20260917080416_arama_sirala_ad_isabeti.sql,
-- satır 127-195) birebir geri kurar. İmza aynı olduğu için GRANT'ler korunur; veri, tablo ve başka fonksiyon
-- bu migration'da DEĞİŞMEDİ (yeni fonksiyon eklenmedi), yani geri alınacak başka bir şey yok.
-- Geri aldıktan sonra öneri kutusunda kategori ve seri önerisi yeniden kaybolur (URN-139 öncesi davranış):
-- önce OPS'a haber ver. İstemci tarafı `family` türünü tanır ama RPC o türü dönmeyince hiç çizmez (zararsız).
-- ELLE, tek işlem.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create or replace function public.get_search_suggestions(p_q text, p_limit integer default 6)
 returns table(type text, label text, url text, metadata jsonb)
 language plpgsql
 stable
 set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit int;
  v_raw   text;
  v_norm  text;
begin
  v_limit := least(greatest(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  if v_raw = '' then return; end if;
  v_norm  := public.arama_normalize(v_raw);

  return query
  (
    -- Ürünler (en çok 4) — TEK gövdeden, fts_search_products ile AYNI sıra (K3.1e).
    -- Eski ek anahtarlar (ad-önek eşleşmesi, is_featured) kaldırıldı: iki yüzey farklı ilk ürünü
    -- gösteriyordu (gölgede `kanal tipi fan`: liste Vortice, öneri AVENS ile başlıyordu).
    select 'product'::text,
           p.name::text,
           (case
              when f.slug is not null and p.sku is not null then '/products/' || f.slug || '?sku=' || p.sku
              when f.slug is not null then '/products/' || f.slug
              when p.slug is not null then '/products/' || p.slug
              else '/products/' || p.id::text
            end)::text,
           jsonb_build_object(
             'sku', p.sku,
             'brand', coalesce(p.brand, ''),
             'model_code', coalesce(p.model_code, ''),
             'family_slug', f.slug)
      from public.arama_eslesen_urunler(v_raw) e
      join public.products p on p.id = e.product_id
      join public.product_search_index psi on psi.product_id = p.id
      left join public.product_families f on f.id = p.family_id and f.deleted_at is null
     where p.status = 'active' and p.deleted_at is null
     order by e.basamak,
              public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), v_raw) desc,
              ts_rank(psi.search_document, plainto_tsquery('turkish', v_raw)) desc,
              p.name
     limit least(v_limit, 4)
  )
  union all
  (
    -- Kategoriler (en çok 2) — aksan/TR körlüğü burada da uygulanır
    select 'category'::text, c.name::text, ('/category/' || c.slug)::text,
           jsonb_build_object('level', c.level, 'slug', c.metadata->'slug')
      from public.categories c
     where c.is_active = true
       and public.arama_normalize(c.name) like '%' || replace(v_norm,' ','%') || '%'
     order by c.level, c.name
     limit 2
  )
  union all
  (
    select distinct on (p.brand)
           'brand'::text, p.brand::text, ('/products?brand=' || p.brand)::text, jsonb_build_object()
      from public.products p
     where p.status = 'active' and p.deleted_at is null and p.brand is not null
       and public.arama_normalize(p.brand) like '%' || replace(v_norm,' ','%') || '%'
     order by p.brand
     limit 2
  )
  limit v_limit;
end;
$function$;

-- Davranış doğrulaması (ziyaretçi rolüyle): eski gövde geri geldi mi.
do $$
begin
  if not has_function_privilege('anon', 'public.get_search_suggestions(text,integer)', 'EXECUTE') then
    raise exception 'GERİ ALMA GUARD: anon get_search_suggestions''ı çağıramıyor';
  end if;
  set local role anon;
  perform 1 from public.get_search_suggestions('fan', 6);
  reset role;
end;
$$;

commit;
