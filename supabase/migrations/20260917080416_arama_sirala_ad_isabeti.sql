-- REC-340 — Arama sıralaması + büyük "İ" normalizasyonu (#1235'ten kalan iki kusur).
--
-- KUSUR 1 — SIRA (canlı ölçüm 2026-09-17, #1238 tarayıcı ölçümünde bulundu):
--   `jet fan` 61 ürün buluyor (40 SEAT + 21 JET, hepsi basamak 1). İlk 20'nin 20'si SEAT: JET ürünü
--   0,30, SEAT ürünü 0,51 puan alıyor. ts_rank AND sorgusunda kelime puanlarını birleştiriyor:
--   JET'te `jet` adda (A) ama `fan` yalnız teknik metinde (D); SEAT'te iki kelime de aile adında
--   (C, "SEAT Storm Jet … Fanlar"). Cetvel K3.1a "adında geçen ürün önce gelir" diyor; canlı tersini
--   yapıyordu. Arayüz tek listeye geçince (#1238) JET ürünleri ilk 20'den tamamen düşüyordu.
--   KURAL (K3.1e): sıra = basamak ↑ · ad isabeti ↓ · ts_rank ↓ · ad ↑ — iki yüzeyde de AYNI.
--   Ad isabeti = normalize edilmiş sorgu köklerinden kaçı normalize edilmiş ürün adı (ad + TR/EN
--   çeviri, K3.1'in A alanları) köklerinde var. İki taraf da arama_normalize'dan geçer; aksi hâlde
--   doğru yazılmış Türkçe sorgu (`ısı` → kök `ıs`) büyük harfli addaki `ISI` (→ `is`) ile eşleşmez
--   (bağımsız çürütücü ölçtü: normalize etmeden `ısı geri kazanım` ad isabeti 1, `isi…` 3).
--
-- KUSUR 2 — BÜYÜK "İ" (canlı ölçüm): `lower('İ')` Postgres'te `i` + birleşik nokta (U+0307) üretir;
--   translate bunu yakalamaz. `arama_normalize('GERİ')` 5 karakter. Sonuç: `ISI GERİ KAZANIM` 3 ürün
--   (küçük harfle 20), `İNLİNE` 0 ürün (`inline` 24). Aynı ifade tetikte de var: 28 satırın
--   arama_ek/arama_kelime metninde birleşik nokta duruyor.
--   ONARIM: "İ" lower'dan ÖNCE `i` yapılır, artakalan U+0307 silinir; tetik aynı ifadeyi kullanır;
--   yalnız farklı çıkan satırlar yeniden yazılır (search_body değişmez → başka tetik tetiklenmez;
--   pgroonga indeksleri satır güncellemesiyle kendiliğinden tazelenir). arama_normalize hiçbir
--   indeks ifadesinde kullanılmıyor (pg_index ölçüldü) → yeniden indeksleme gerekmez.
--
-- YETKİ (K13.4 m.2 + m.9): yeni yardımcı `arama_ad_isabeti` → PUBLIC'ten geri alınır, dış uçlar
--   SECURITY INVOKER olduğu için anon + authenticated'a AÇIKÇA verilir. Guard ZİYARETÇİ rolüyle
--   çağırır. `rank` sütununun anlamı DEĞİŞMEZ (ts_rank - basamak/100); sıra açık sütunlarla kurulur.

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- ── KUSUR 2: normalizasyon ──────────────────────────────────────────────────
create or replace function public.arama_normalize(p_t text)
returns text language sql immutable
set search_path to 'pg_catalog','public'
as $$
  select replace(
           translate(lower(translate(coalesce(p_t,''), 'İ', 'i')),
                     'ıİşŞğĞüÜöÖçÇâîû', 'iisSgGuUoOcCaiu'),
           chr(775), '')
$$;

create or replace function public.tg_arama_metin_doldur()
returns trigger language plpgsql
set search_path to 'pg_catalog','public'
as $$
begin
  -- arama_normalize ile BİREBİR aynı ifade (tetik yardımcıya EXECUTE bağımlılığı taşımasın diye gömülü).
  new.arama_ek     := replace(translate(lower(translate(coalesce(new.search_body,''), 'İ', 'i')),
                                        'ıİşŞğĞüÜöÖçÇâîû', 'iisSgGuUoOcCaiu'), chr(775), '');
  new.arama_kelime := new.arama_ek;
  return new;
end;
$$;

update public.product_search_index
   set arama_ek     = public.arama_normalize(search_body),
       arama_kelime = public.arama_normalize(search_body)
 where arama_ek     is distinct from public.arama_normalize(search_body)
    or arama_kelime is distinct from public.arama_normalize(search_body);

-- ── KUSUR 1: ad isabeti ─────────────────────────────────────────────────────
create or replace function public.arama_ad_isabeti(p_ad_metni text, p_q text)
returns int language sql immutable
set search_path to 'pg_catalog','public'
as $$
  select count(*)::int
    from unnest(tsvector_to_array(to_tsvector('turkish', public.arama_normalize(p_q)))) k
   where k = any (tsvector_to_array(to_tsvector('turkish', public.arama_normalize(p_ad_metni))))
$$;

revoke execute on function public.arama_ad_isabeti(text, text) from public;
grant  execute on function public.arama_ad_isabeti(text, text) to anon, authenticated;

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
             public.display_price(p) as price,          -- INV-PRICE-1: ham p.price DEĞİL
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

-- ── GUARD — ZİYARETÇİ rolüyle (anon). Sabit sayı yok (K8.3): davranış ölçülür. ──
do $$
declare
  v_urun        int;
  v_ids         uuid[];
  v_ilk_ad      text;
  v_ilk_oneri   text;
  v_ilk_isabet  int;
  v_max_isabet  int;
  v_vortis      int;
  v_sku         int;
  v_i_buyuk     int;
  v_i_kucuk     int;
  v_nokta       int;
begin
  -- Yetki ve normalizasyon ölçümü veriye bağlı değil: boş veritabanında da koşar.
  if not (has_function_privilege('anon', 'public.fts_search_products(text,integer,jsonb)', 'EXECUTE')
      and has_function_privilege('anon', 'public.get_search_suggestions(text,integer)', 'EXECUTE')
      and has_function_privilege('anon', 'public.arama_ad_isabeti(text,text)', 'EXECUTE')
      and has_function_privilege('authenticated', 'public.arama_ad_isabeti(text,text)', 'EXECUTE')) then
    raise exception 'ARAMA SIRA GUARD: anon/authenticated arama uçlarına EXECUTE yetkisi eksik';
  end if;
  if public.arama_normalize('ISI GERİ KAZANIM İNLİNE') <> 'isi geri kazanim inline' then
    raise exception 'ARAMA SIRA GUARD: arama_normalize büyük İ''yi indiremedi: %',
      public.arama_normalize('ISI GERİ KAZANIM İNLİNE');
  end if;

  -- Davranış ölçümü veri ister (K13.4 m.6): boş veritabanında NOTICE ile atlar.
  select count(*) into v_urun from public.product_search_index;
  if v_urun = 0 then
    raise notice 'ARAMA SIRA GUARD ATLANDI — product_search_index BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  select count(*) into v_nokta from public.product_search_index
   where arama_ek like '%' || chr(775) || '%' or arama_kelime like '%' || chr(775) || '%';
  if v_nokta > 0 then
    raise exception 'ARAMA SIRA GUARD: % satırda birleşik nokta (U+0307) kaldı', v_nokta;
  end if;

  set local role anon;
  select array_agg(r.id order by r.ord) into v_ids
    from public.fts_search_products('jet fan', 500) with ordinality
         as r(id, name, sku, brand, price, rank, family_slug, cover_image_path, ord);
  select r.name into v_ilk_ad from public.fts_search_products('jet fan', 20) r limit 1;
  select s.label into v_ilk_oneri from public.get_search_suggestions('jet fan', 6) s
   where s.type = 'product' limit 1;
  select count(*) into v_vortis  from public.fts_search_products('vortis', 500);
  select count(*) into v_sku     from public.fts_search_products('VRT-17160', 500);
  select count(*) into v_i_buyuk from public.fts_search_products('ISI GERİ KAZANIM', 500);
  select count(*) into v_i_kucuk from public.fts_search_products('ısı geri kazanım', 500);
  reset role;

  if coalesce(array_length(v_ids, 1), 0) = 0 or v_vortis = 0 or v_sku <> 1 then
    raise exception 'ARAMA SIRA GUARD: jet fan=% vortis=% VRT-17160=% (küme bozuldu)',
      coalesce(array_length(v_ids, 1), 0), v_vortis, v_sku;
  end if;

  -- Davranış: ilk satırın ad isabeti, kümedeki en yüksek ad isabetine eşit olmalı.
  select max(public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), 'jet fan'))
    into v_max_isabet from public.products p where p.id = any (v_ids);
  select public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), 'jet fan')
    into v_ilk_isabet from public.products p where p.id = v_ids[1];
  if v_ilk_isabet < v_max_isabet then
    raise exception 'ARAMA SIRA GUARD: jet fan ilk satır ad isabeti=% ama kümede % var (ilk=%)',
      v_ilk_isabet, v_max_isabet, v_ilk_ad;
  end if;

  -- İki yüzey aynı sıra kuralını kullanır: ilk ürün aynı olmalı.
  if v_ilk_ad is distinct from v_ilk_oneri then
    raise exception 'ARAMA SIRA GUARD: liste ilk=% öneri ilk=% (iki yüzey farklı sıralıyor)',
      v_ilk_ad, v_ilk_oneri;
  end if;

  -- Büyük harf körlüğü yok (K5.2): büyük ve küçük yazım aynı sayıyı verir.
  if v_i_buyuk <> v_i_kucuk then
    raise exception 'ARAMA SIRA GUARD: ISI GERİ KAZANIM=% ama ısı geri kazanım=% (büyük İ körlüğü)',
      v_i_buyuk, v_i_kucuk;
  end if;

  raise notice 'ARAMA SIRA GUARD GEÇTİ (anon rolüyle): jet fan=% ilk=% (isabet %/%) öneri=% · İ büyük/küçük=%/%',
    array_length(v_ids, 1), v_ilk_ad, v_ilk_isabet, v_max_isabet, v_ilk_oneri, v_i_buyuk, v_i_kucuk;
end;
$$;

commit;
