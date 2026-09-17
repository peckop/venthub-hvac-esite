-- REC-340 — Arama sıralaması: ürün ADINDA geçen kelime, yalnız aile/kategoride geçenden önce gelir.
--
-- NİÇİN (canlı ölçüm 2026-09-17, #1235 sonrası):
--   `jet fan` 61 ürün buluyor (40 SEAT + 21 JET, hepsi basamak 1). Ama ilk 20'nin 20'si SEAT:
--   JET ürünü 0,30 puan, SEAT 0,51 puan alıyor. Sebep ts_rank'in AND sorgusundaki birleşimi:
--   JET ürününde `jet` adda (A) ama `fan` yalnız teknik metinde (D); SEAT ürününde iki kelime de
--   aile adında (C, "SEAT Storm Jet … Fanlar"). Cetvel K3.1a "adında geçen ürün önce gelir" diyor;
--   canlı bunun tersini yapıyordu. Arayüz tek listeye geçince (#1238) JET ürünleri ilk 20'den
--   tamamen düşüyordu — eski öneri kutusu onları yalnız alfabetik şansla (J < S) gösteriyordu.
--
-- KURAL (cetvel K3.1e): sıra = basamak ↑ · ad isabeti ↓ · ts_rank ↓ · ad ↑.
--   ad isabeti = sorgu kelimelerinden (turkish kökü) kaçı ürünün A ağırlıklı (ad) sözcüklerinde var.
--   Eski ifade `ts_rank - basamak/100` basamağı da kesin ayırmıyordu (0,02'lik basamak farkını
--   0,02'den büyük bir ts_rank farkı ters çevirebiliyordu); sıra artık açık sütunlarla kurulur.
--
-- Gölge ölçümü (arama_golge, canlıyla aynı 442 ürün, 12 vaka): değişen yalnız `jet fan` / `fan jet`
--   (ilk 20'de adda geçen 0 → 20) ve `ısı geri kazanım` (ilk 3 Vortice → AVenS, adda geçen 3/3 ilk
--   20'de her iki sürümde de var). Kalan 9 vakanın ilk 3'ü birebir aynı; sonuç KÜMELERİ değişmez.
--
-- YETKİ: yeni yardımcı fonksiyon YOK (ifade iki fonksiyona gömülü) → yeni GRANT gerekmez.
--   Öneri kutusunun ürün kısmı AYNI dört anahtarla sıralanır (eski ad-önek + is_featured anahtarları
--   kaldırıldı; iki yüzey farklı ilk ürünü gösteriyordu). Guard iki yüzeyin ilk ürününün EŞİT
--   olduğunu ölçer.
--   İki dış uç imzası ve SECURITY INVOKER hâli AYNEN korunur; mevcut EXECUTE yetkileri
--   `create or replace` ile düşmez. Guard ZİYARETÇİ rolüyle (anon) koşar (cetvel K13.4 m.9).

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

create or replace function public.fts_search_products(p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb)
 returns table(id uuid, name text, sku text, brand text, price numeric, rank real, family_slug text, cover_image_path text)
 language plpgsql
 stable
 set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit   int;
  v_tsq     tsquery;
  v_kelime  text[];
begin
  -- Tavan 500: kapı betiği geniş vakalarda GERÇEK sayıyı okuyabilsin diye (istemci 20 yollar).
  v_limit  := least(greatest(p_limit, 1), 500);
  v_tsq    := plainto_tsquery('turkish', coalesce(p_q,''));
  v_kelime := tsvector_to_array(to_tsvector('turkish', coalesce(p_q,'')));

  return query
  select s.id, s.name, s.sku, s.brand, s.price,
         -- Bilgi amaçlı tek sayı; sıralamanın kendisi aşağıdaki açık sütunlardır.
         (10000 - s.basamak * 100 + s.ad_isabet + s.metin_rank)::real as rank,
         s.family_slug, s.cover_image_path
    from (
      select p.id, p.name, p.sku, p.brand,
             public.display_price(p) as price,          -- INV-PRICE-1: ham p.price DEĞİL
             e.basamak,
             (select count(*)::int
                from unnest(tsvector_to_array(ts_filter(psi.search_document, '{a}'))) l
               where l = any (v_kelime)) as ad_isabet,
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
   order by s.basamak asc, s.ad_isabet desc, s.metin_rank desc, s.name asc
   limit v_limit;
end;
$function$;

create or replace function public.get_search_suggestions(p_q text, p_limit integer default 6)
 returns table(type text, label text, url text, metadata jsonb)
 language plpgsql
 stable
 set search_path to 'pg_catalog', 'public', 'extensions'
as $function$
declare
  v_limit  int;
  v_raw    text;
  v_norm   text;
  v_kelime text[];
begin
  v_limit := least(greatest(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  if v_raw = '' then return; end if;
  v_norm   := public.arama_normalize(v_raw);
  v_kelime := tsvector_to_array(to_tsvector('turkish', v_raw));

  return query
  (
    -- Ürünler (en çok 4) — TEK gövdeden, fts_search_products ile AYNI sıra kuralı (K3.1e)
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
     -- Eski ek kurallar (ad-önek eşleşmesi, is_featured) KALDIRILDI: iki yüzey farklı sıra
     -- gösteriyordu (gölgede `kanal tipi fan`: liste Vortice, öneri AVENS ile başlıyordu).
     order by e.basamak,
              (select count(*)
                 from unnest(tsvector_to_array(ts_filter(psi.search_document, '{a}'))) l
                where l = any (v_kelime)) desc,
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

-- GUARD — ZİYARETÇİ rolüyle (anon). Sabit sayı yok (K8.3): davranış ölçülür.
do $$
declare
  v_ilk_ad      text;
  v_ilk_oneri   text;
  v_jet_sayi    int;
  v_vortis      int;
  v_sku         int;
  v_anon_exec   boolean;
  v_urun        int;
begin
  -- Yetki ölçümü veriye bağlı değil: boş veritabanında da koşar.
  v_anon_exec := has_function_privilege('anon', 'public.fts_search_products(text,integer,jsonb)', 'EXECUTE')
             and has_function_privilege('anon', 'public.get_search_suggestions(text,integer)', 'EXECUTE');
  if not v_anon_exec then
    raise exception 'ARAMA SIRA GUARD: anon iki dış uca EXECUTE yetkisini kaybetti';
  end if;

  -- Davranış ölçümü veri ister (cetvel K13.4 m.6): boş veritabanında NOTICE ile atlar.
  select count(*) into v_urun from public.product_search_index;
  if v_urun = 0 then
    raise notice 'ARAMA SIRA GUARD ATLANDI — product_search_index BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  set local role anon;
  select count(*) into v_jet_sayi from public.fts_search_products('jet fan', 500);
  select r.name into v_ilk_ad from public.fts_search_products('jet fan', 20) r limit 1;
  select s.label into v_ilk_oneri from public.get_search_suggestions('jet fan', 6) s
   where s.type = 'product' limit 1;
  select count(*) into v_vortis from public.fts_search_products('vortis', 500);
  select count(*) into v_sku from public.fts_search_products('VRT-17160', 500);
  reset role;

  -- Adında JET geçen aktif ürün varsa, `jet fan` aramasının ilk satırı onlardan biri olmalı.
  if exists (select 1 from public.products p
              where p.status = 'active' and p.deleted_at is null
                and p.name ilike 'jet %')
     and (v_ilk_ad is null or v_ilk_ad not ilike 'jet %'
          or v_ilk_oneri is null or v_ilk_oneri not ilike 'jet %') then
    raise exception 'ARAMA SIRA GUARD: jet fan ilk sonuç=% ilk öneri=% (adında JET geçen ürün başta değil)',
      v_ilk_ad, v_ilk_oneri;
  end if;

  -- İki yüzey aynı sıra kuralını kullanır: ilk ürün aynı olmalı.
  if v_ilk_ad is distinct from v_ilk_oneri then
    raise exception 'ARAMA SIRA GUARD: liste ilk=% öneri ilk=% (iki yüzey farklı sıralıyor)',
      v_ilk_ad, v_ilk_oneri;
  end if;

  if v_jet_sayi = 0 or v_vortis = 0 or v_sku <> 1 then
    raise exception 'ARAMA SIRA GUARD: jet fan=% vortis=% VRT-17160=% (küme bozuldu)',
      v_jet_sayi, v_vortis, v_sku;
  end if;

  raise notice 'ARAMA SIRA GUARD GEÇTİ (anon rolüyle): jet fan=% ilk=% öneri=%',
    v_jet_sayi, v_ilk_ad, v_ilk_oneri;
end;
$$;

commit;
