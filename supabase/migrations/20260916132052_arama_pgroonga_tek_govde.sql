-- REC-340 — ARAMA: pgroonga + TEK EŞLEŞTİRME GÖVDESİ
--
-- NİÇİN: Recep canlıda aradı ve bulamadı. İki ayrı kusur vardı.
--   (1) Öneri kutusu (`get_search_suggestions`) arama indeksini HİÇ kullanmıyordu — kendi
--       ILIKE sorgusunu koşturuyordu. "jet fan" öneri kutusunda 0, "detaylı ara"da 20 sonuç
--       veriyordu. Recep: *"ben bu şekilde 2 aramalı bir arama motoru bilmiyorum"*. Haklıydı.
--   (2) Yazım hatası toleransı yoktu. trigram denendi ve ÖLÇÜMLE ÇÜRÜDÜ: eşik bazı hatayı
--       affediyor bazısını affetmiyordu, eşiksiz sıralama "zzzqqq" için bile sonuç veriyordu.
--       Doğru ölçüt harf mesafesi, trigram DEĞİL.
--
-- ÇÖZÜM: pgroonga (Supabase'de hazır, açık kaynak, ek sunucu yok) + dört basamaklı TEK gövde.
-- Basamaklar vaka bazlı DEĞİL, dil olgusu bazlıdır — "vortis için istisna" gibi bir kol yoktur:
--   1  kesin      : kelimelerin tamamı gövdede geçiyor (ek çekimi toleranslı)
--   21 marka      : kelime katalogdaki bir MARKAYA yakın → markayı ara
--   22 yazım      : genel harf hatası (aday üret + harf mesafesiyle DOĞRULA)
--   23 bitişik    : "jetfan" → "jet fan"
--   3  esnek      : kelimelerin tamamı değil, çoğu tutuyor
--
-- ⛔ÖLÇÜLEN TUZAK — TOKENIZER: pgroonga'nın VARSAYILAN tokenizer'ı Türkçe için yanlış.
-- "fanlar" tek token sayılıyor, bu yüzden "fan" araması onu BULAMIYOR. Türkçe sondan eklemeli
-- olduğu için bu ölümcül. Ölçüm (442 ürün, gölge): varsayılanla "jet fan" → 0, doğru
-- tokenizer'la → 61 (sıralı taramayla birebir).
-- ⛔İKİNCİ TUZAK — AYNI İNDEKS İKİSİNİ BİRDEN YAPAMIYOR: ek toleransı (bigram-split) açıkken
-- `fuzzy_search()` anlamsızlaşıyor (bigram'lar üzerinde çalışıyor: "vortis" d2 → 442/442).
-- Bu yüzden İKİ sütun + İKİ indeks var; aynı metin, iki farklı tokenizer.
-- ⛔ÜÇÜNCÜ TUZAK — LIKE'I DA ELE GEÇİRİYOR: pgroonga indeksi kurulan sütunda mevcut `LIKE`
-- sorguları da indeksten cevaplanır. Yanlış tokenizer ile YANLIŞ sonuç verir (ölçüldü:
-- sıralı tarama 61, indeksli 0). Doğru tokenizer'la ikisi birebir aynı oldu.
--
-- CETVEL: docs/standards/arama-standard.md (K3.1a ağırlık · K5.1 TR körlüğü · K5.3a opclass
-- şema-nitelikli · K6.1 kelime sırası · K6.4 yazım hatası · K8.5 kesinlik regresyonu · K12.1b
-- yetki daraltma). Ölçüm: docs/audits/rec340-pgroonga-olcum-2026-09-16.md

-- Kilit süresi: bu dosya product_search_index'e GENERATED sütun ekliyor → tablo yeniden yazımı
-- + ACCESS EXCLUSIVE kilit. Gölgede 442 satırla ölçüldü (aşağıdaki guard süreyi de basar).
-- 5 sn, ölçülen süreye karşı geniş bir pay bırakır; emsalden kopyalanmadı.
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) EKLENTİLER — Supabase resmî yolu: `with schema extensions`
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists pgroonga      with schema extensions;
create extension if not exists fuzzystrmatch with schema extensions;  -- levenshtein()

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) ARAMA SÜTUNLARI — ikisi de AYNI ifade, farkı indeks yapılandırması
--    Üretilmiş (generated) sütun seçildi ki tetik değişikliği GEREKMESİN: gövde değişince
--    bu iki sütun kendiliğinden tazelenir. translate() ve lower() IMMUTABLE olduğu için
--    üretilmiş sütunda kullanılabilirler.
--    ⚠unaccent eklentisi GEREKMİYOR — translate() hem aksan körlüğünü hem TR küçültmeyi
--    çözüyor (ölçüldü). Bir migration kalemi ve bir onay bu ölçümle düştü.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.product_search_index
  add column if not exists arama_ek text
    generated always as (translate(lower(search_body),'ıİşŞğĞüÜöÖçÇâîû','iisSgGuUoOcCaiu')) stored,
  add column if not exists arama_kelime text
    generated always as (translate(lower(search_body),'ıİşŞğĞüÜöÖçÇâîû','iisSgGuUoOcCaiu')) stored;

-- EK TOLERANSLI indeks: "fan" → "fanlar"ı bulur. Türkçe için ZORUNLU ayar.
create index if not exists product_search_index_arama_ek_pgroonga
  on public.product_search_index using pgroonga (arama_ek)
  with (tokenizer = 'TokenBigramSplitSymbolAlphaDigit', normalizer = 'NormalizerAuto');

-- KELİME BAZLI indeks: yalnız fuzzy_search() için. Varsayılan tokenizer ŞART.
create index if not exists product_search_index_arama_kelime_pgroonga
  on public.product_search_index using pgroonga (arama_kelime);

revoke all on public.product_search_index from anon, authenticated;
grant select on public.product_search_index to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) YARDIMCI FONKSİYONLAR — hiçbiri dışarıya açık değil (aşağıda REVOKE var)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.arama_normalize(p_t text)
returns text language sql immutable
set search_path to 'pg_catalog','public'
as $$ select translate(lower(coalesce(p_t,'')),'ıİşŞğĞüÜöÖçÇâîû','iisSgGuUoOcCaiu') $$;

-- Sorgu kelimelerine bölünür; boş ve tek harfli parçalar düşer.
create or replace function public.arama_kelimeler(p_q text)
returns text[] language sql immutable
set search_path to 'pg_catalog','public'
as $$
  select coalesce(array_agg(k), '{}'::text[])
  from unnest(string_to_array(public.arama_normalize(p_q), ' ')) k
  where k <> ''
$$;

-- Katalogdaki marka kelimeleri. SABİT LİSTE DEĞİL — brands tablosundan türetilir ki
-- yeni marka eklendiğinde yazım hatası düzeltmesi kendiliğinden onu da kapsasın.
create or replace function public.arama_marka_kelimeleri()
returns text[] language sql stable
set search_path to 'pg_catalog','public'
as $$
  select coalesce(array_agg(distinct k), '{}'::text[])
  from public.brands b,
       unnest(string_to_array(public.arama_normalize(b.name), ' ')) k
  where k <> '' and length(k) >= 3
$$;

-- Bir kelimenin hangi markaya karşılık geldiği. Eşik uzunlukla ölçeklenir.
create or replace function public.arama_marka_es(p_k text)
returns text language sql stable
set search_path to 'pg_catalog','public','extensions'
as $$
  select m from unnest(public.arama_marka_kelimeleri()) m
  where extensions.levenshtein(m, p_k) <= (case when length(p_k) <= 4 then 1 else 2 end)
  order by extensions.levenshtein(m, p_k)
  limit 1
$$;

-- Groonga SCRIPT sözdizimi. ⚠`&\`` operatörü YALNIZ indeks taramasında çalışır; bu ifadeler
-- CASE/boolean bağlamında kullanılamaz (ölçüldü: "script syntax search is available only in
-- index scan"). Bu yüzden esnek basamak UNION ALL ile kurulur, toplama ile değil.
create or replace function public.arama_kesin_ifade(p_q text)
returns text language sql immutable
set search_path to 'pg_catalog','public','extensions'
as $$
  select string_agg('arama_ek @ ' || extensions.pgroonga_escape(k), ' && ')
  from unnest(public.arama_kelimeler(p_q)) k
$$;

-- Yazım hatası dalı. Kısa kelimeler ve ürün kodları TAM eşleşir — üç harflik bir kelimede
-- iki harf hata payı "fan"ı "fen"e açar ve sonucu çöpe çevirir (ölçüldü: 442/442).
create or replace function public.arama_bulanik_ifade(p_q text)
returns text language sql immutable
set search_path to 'pg_catalog','public','extensions'
as $$
  select string_agg(
    case when length(k) <= 4 or k ~ '[0-9]'
      then 'arama_kelime @ ' || extensions.pgroonga_escape(k)
      else 'fuzzy_search(arama_kelime, ' || extensions.pgroonga_escape(k)
           || ', {"with_transposition": true, "max_distance": '
           || (case when length(k) = 5 then 1 else 2 end) || '})'
    end, ' && ')
  from unnest(public.arama_kelimeler(p_q)) k
$$;

-- ADAY ÜRET + DOĞRULA. pgroonga hızlı aday verir ama gevşektir; harf mesafesi kesin süzer.
-- İlk üç harf şartı ayırt edicidir: "vortis"→"vortice" ilk üç harfi tutar (meşru),
-- "kasals"→"kanal" tutmaz (224 alakasız sonuç, ölçüldü).
-- Gövde kelimesi sorgu uzunluğuna KIRPILIR — yoksa Türkçe eki mesafeyi şişirir
-- ("aspiratr" ↔ "aspiratorler" mesafe 4, kırpınca 1).
create or replace function public.arama_dogrula(p_govde text, p_q text)
returns boolean language sql immutable
set search_path to 'pg_catalog','public','extensions'
as $$
  select coalesce(bool_and(
    exists (
      select 1 from unnest(string_to_array(p_govde, ' ')) w
      where w <> '' and length(w) >= 3 and length(k) >= 3
        and left(w,3) = left(k,3)
        and extensions.levenshtein(left(w, length(k)), k)
            <= (case when length(k) <= 4 then 0 when length(k) <= 6 then 1 else 2 end)
    )), false)
  from unnest(public.arama_kelimeler(p_q)) k
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) ⭐TEK EŞLEŞTİRME GÖVDESİ — iki uç da BUNU çağırır
--    Recep'in itirazının kaynağı iki ayrı koddu; bundan sonra tek kod var.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.arama_eslesen_urunler(p_q text)
returns table(product_id uuid, basamak int)
language plpgsql stable
set search_path to 'pg_catalog','public','extensions'
as $$
declare
  v_k        text[] := public.arama_kelimeler(p_q);
  v_n        int    := coalesce(array_length(v_k,1), 0);
  v_duzeltme text[];
  v_yeni     text;
  v_var      boolean;
  k          text;
  m          text;
  i          int;
  v_parca    text := '';
  v_sql      text;
  v_esik     int;
begin
  if v_n = 0 then return; end if;

  -- BASAMAK 1 — kesin
  return query
    select psi.product_id, 1
      from public.product_search_index psi
     where psi.arama_ek &` public.arama_kesin_ifade(p_q);
  if found then return; end if;

  -- BASAMAK 21 — marka sözlüğü düzeltmesi
  v_duzeltme := '{}'::text[];
  v_var := false;
  foreach k in array v_k loop
    m := public.arama_marka_es(k);
    if m is not null and m <> k then v_var := true; end if;
    v_duzeltme := v_duzeltme || coalesce(m, k);
  end loop;
  if v_var then
    v_yeni := array_to_string(v_duzeltme, ' ');
    return query
      select psi.product_id, 21
        from public.product_search_index psi
       where psi.arama_ek &` public.arama_kesin_ifade(v_yeni);
    if found then return; end if;
  end if;

  -- BASAMAK 22 — genel yazım hatası (aday + doğrulama)
  return query
    select psi.product_id, 22
      from public.product_search_index psi
     where psi.arama_kelime &` public.arama_bulanik_ifade(p_q)
       and public.arama_dogrula(psi.arama_kelime, p_q);
  if found then return; end if;

  -- BASAMAK 23 — bitişik yazım ("jetfan" → "jet fan")
  if v_n = 1 and length(v_k[1]) >= 6 then
    for i in 3..(length(v_k[1]) - 3) loop
      v_yeni := left(v_k[1], i) || ' ' || substr(v_k[1], i + 1);
      return query
        select psi.product_id, 23
          from public.product_search_index psi
         where psi.arama_ek &` public.arama_kesin_ifade(v_yeni);
      if found then return; end if;
    end loop;
  end if;

  -- BASAMAK 3 — esnek: kelimelerin tamamı değil, çoğu
  -- ⚠UNION ALL + having: `&\`` boolean bağlamda kullanılamadığı için toplama yapılamıyor.
  if v_n >= 2 then
    foreach k in array v_k loop
      v_parca := v_parca || (case when v_parca = '' then '' else ' union all ' end)
        || format('select psi.product_id from public.product_search_index psi where psi.arama_ek &%s %L',
                  '`', 'arama_ek @ ' || extensions.pgroonga_escape(k));
    end loop;
    for v_esik in reverse (v_n - 1) .. greatest(1, (v_n + 1) / 2) loop
      v_sql := format(
        'select t.product_id, 3 from (%s) t group by t.product_id having count(*) >= %s',
        v_parca, v_esik);
      return query execute v_sql;
      if found then return; end if;
    end loop;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) DIŞA AÇIK İKİ UÇ — imzalar KORUNUR (çağıran istemci kodu değişmez)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.fts_search_products(
  p_q text, p_limit integer default 20, p_filters jsonb default '{}'::jsonb)
returns table(id uuid, name text, sku text, brand text, price numeric,
              rank real, family_slug text, cover_image_path text)
language plpgsql stable
set search_path to 'pg_catalog','public','extensions'
as $$
declare
  v_limit int;
  v_tsq   tsquery;
begin
  -- Tavan 500: kapı betiği geniş vakalarda GERÇEK sayıyı okuyabilsin diye (istemci 20 yollar).
  v_limit := least(greatest(p_limit, 1), 500);
  v_tsq   := plainto_tsquery('turkish', coalesce(p_q,''));

  return query
  select p.id, p.name, p.sku, p.brand,
         public.display_price(p) as price,          -- INV-PRICE-1: ham p.price DEĞİL
         -- Sıralama önce BASAMAK, sonra metin alakası. Kesin eşleşen bir ürün, yazım
         -- hatasıyla bulunmuş bir üründen daima önce gelir.
         (ts_rank(psi.search_document, v_tsq) - (e.basamak::real / 100.0::real))::real as rank,
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
   order by rank desc nulls last, p.name asc
   limit v_limit;
end;
$$;

-- ⭐ÖNERİ KUTUSU ARTIK AYNI GÖVDEYİ KULLANIYOR. Eskiden kendi ILIKE sorgusunu koşturuyordu;
-- "jet fan" burada 0, "detaylı ara"da 20 sonuç veriyordu. Dönüş şekli AYNEN korundu.
create or replace function public.get_search_suggestions(p_q text, p_limit integer default 6)
returns table(type text, label text, url text, metadata jsonb)
language plpgsql stable
set search_path to 'pg_catalog','public','extensions'
as $$
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
    -- Ürünler (en çok 4) — TEK gövdeden
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
      left join public.product_families f on f.id = p.family_id and f.deleted_at is null
     where p.status = 'active' and p.deleted_at is null
     order by e.basamak,
              case when public.arama_normalize(p.name) like v_norm || '%' then 0 else 1 end,
              p.is_featured desc nulls last,
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
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) YETKİLER — pg_default_acl bu veritabanında her yeni fonksiyona EXECUTE to PUBLIC
--    veriyor. Bu daraltma AÇIKÇA yazılmazsa anon PostgREST /rpc ile yardımcıları çağırır.
--    (2026-09-16'da bu tam olarak kaçırıldı ve güvenlik kusuru doğurdu.)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'public.arama_normalize(text)',
    'public.arama_kelimeler(text)',
    'public.arama_marka_kelimeleri()',
    'public.arama_marka_es(text)',
    'public.arama_kesin_ifade(text)',
    'public.arama_bulanik_ifade(text)',
    'public.arama_dogrula(text,text)',
    'public.arama_eslesen_urunler(text)'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;

-- Dışa açık iki uç: açıkça verilir.
grant execute on function public.fts_search_products(text,integer,jsonb) to anon, authenticated;
grant execute on function public.get_search_suggestions(text,integer)     to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7) GUARD — DAVRANIŞ ÖLÇER. Sabit sayı YOK (K8.3): ölçüt "sıfır değil" ve "birbirine eşit".
--    Boş veritabanında (gölge/kurulum) NOTICE ile atlar, kırmızı vermez.
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_urun  int;
  v_jet   int; v_fanjet int; v_vortis int; v_sku int; v_zzz int; v_oneri int;
  v_bas   timestamptz := clock_timestamp();
begin
  select count(*) into v_urun from public.product_search_index;
  if v_urun = 0 then
    raise notice 'ARAMA GUARD ATLANDI — product_search_index BOŞ (bu bir kurulum/gölge koşumu).';
    return;
  end if;

  select count(*) into v_jet    from public.fts_search_products('jet fan', 500);
  select count(*) into v_fanjet from public.fts_search_products('fan jet', 500);
  select count(*) into v_vortis from public.fts_search_products('vortis', 500);
  select count(*) into v_sku    from public.fts_search_products('VRT-17160', 500);
  select count(*) into v_zzz    from public.fts_search_products('zzzqqq', 500);
  select count(*) into v_oneri  from public.get_search_suggestions('jet fan', 6);

  if v_jet = 0 then
    raise exception 'ARAMA GUARD: "jet fan" 0 sonuç — gövde/tokenizer bozuk.';
  end if;
  if v_jet <> v_fanjet then
    raise exception 'ARAMA GUARD: kelime sırası sonucu değiştirdi (% / %) — K6.1 ihlali.', v_jet, v_fanjet;
  end if;
  if v_vortis = 0 then
    raise exception 'ARAMA GUARD: "vortis" 0 sonuç — yazım hatası toleransı çalışmıyor.';
  end if;
  if v_sku <> 1 then
    raise exception 'ARAMA GUARD: "VRT-17160" % sonuç, 1 bekleniyor — kesinlik REGRESYONU (K8.5).', v_sku;
  end if;
  if v_zzz <> 0 then
    raise exception 'ARAMA GUARD: "zzzqqq" % sonuç — anlamsız sorgu sonuç veriyor, gürültü kapısı açık.', v_zzz;
  end if;
  -- ⭐Recep'in itirazının kapısı: öneri kutusu ile detaylı arama artık AYNI gövdede.
  if v_oneri = 0 then
    raise exception 'ARAMA GUARD: "jet fan" detaylı aramada % sonuç ama öneri kutusunda 0 — iki uç AYRIŞTI.', v_jet;
  end if;

  raise notice 'ARAMA GUARD GEÇTİ — ürün=% · jet fan=% (öneri %) · vortis=% · SKU=% · zzzqqq=% · süre=%',
    v_urun, v_jet, v_oneri, v_vortis, v_sku, v_zzz, (clock_timestamp() - v_bas);
end $$;

commit;
