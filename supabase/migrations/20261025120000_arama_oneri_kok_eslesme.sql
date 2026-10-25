-- URN-139 — Arama öneri kutusu: kategori ve seri (ürün ailesi) önerisi kök eşleşmeyle.
--
-- KUSURLAR (canlı ölçüm 2026-10-25, anon anahtarla `get_search_suggestions` RPC'si):
--   (1) Kategori dalı `arama_normalize(c.name) like '%' || replace(v_norm,' ','%') || '%'` idi:
--       sıralı alt-dize (cetvel K6.3 ihlali) ve Türkçe ek körlüğü. `hava perdesi` →
--       "Hava Perdeleri" eşleşmiyordu (perdesi ≠ perdeleri), `çatı fanı` → "Çatı Tipi Fanlar" ve
--       `kanal fanı` → "Kanal Tipi Fanlar" da yok: sorgudaki ek ve araya giren "Tipi" aynı sıralı
--       kalıba sığmıyor. Üç sorguda da öneri kutusunda YALNIZ ürün çıkıyordu.
--   (2) Kategorinin İngilizce adı DB'de yok (K3.1d) ama `categories.metadata->'slug'->>'en'`
--       (air-curtains, roof-fans, duct-fans, heat-recovery-vmc…) var ve eşleşmeye girmiyordu:
--       `air curtain`, `roof fan`, `duct fan`, `heat recovery` sorgularının hiçbirinde kategori yoktu.
--   (3) Seri (product_families: name + name_i18n) için öneri dalı HİÇ yoktu: `jet fan` →
--       "JET Serisi", `sessiz fan` → "Vortice Lineo Quiet Sessiz Kanal Fanları" önerilmiyordu.
--   (4) Ürün dalı ilk 4 satırı alıyor, istemci ise limit 6 ile çağırıp ürünleri atıyor
--       (SearchOverlay): dal sırası ürün önde olduğu için kategori/marka satırı limit sınırında
--       kesilebiliyordu.
--
-- ONARIM (imza AYNI: `get_search_suggestions(text, integer)` — K12.3, drop yok, GRANT'ler korunur):
--   · Kök eşleşme (K6.1): sorgu normalize edilip kelimelere bölünür; her kelimenin KÖKÜ
--     (uzunluk ≥ 6 → son 2 harf kırpılır, 4-5 → son 1, ≤ 3 → aynen) metnin bir kelimesinin
--     BAŞINDA geçmelidir; TÜM kelimeler eşleşmelidir, sıra önemsizdir (`hava perdesi` ile
--     `perde hava` aynı kümeyi verir).
--   · Kategori metni = normalize ad + TR slug + EN slug + kanonik slug (tire → boşluk): EN terimler
--     slug üzerinden yakalanır (K3.1d sınırı DB tarafında bu kadarıyla kapanır).
--   · Yeni 'family' dalı: normalize `f.name` + `name_i18n` TR/EN; silinmemiş ve en az bir aktif
--     ürünü olan aile; en çok 2; url `/products/<f.slug>`; metadata'da `slug` ve `name_i18n`.
--     Sıra: aile ADINDA eşleşen kök sayısı ↓ · metin kısalığı ↑ · ad ↑ (`jet fan` → "JET Serisi",
--     "SEAT Serisi"nden önce: SEAT'in yalnız çeviri metninde "Jet" geçiyor).
--   · Marka dalı AYNEN (davranış değişmedi).
--   · Dal sırası: kategori (≤2) → seri (≤2) → marka (≤2) → ürün (≤4); sonra `limit v_limit`.
--     Sıra açık sütunla kurulur (UNION ALL satır sırası garanti değildir).
--
-- YENİ FONKSİYON YOK → yeni EXECUTE/GRANT ve `supabase:gen` tip borcu YOK (K13.4 m.2, m.4):
--   kök mantığı gövdede satır içi; yardımcı eklenmedi.
--
-- ZAMAN AŞIMI (K13.4 m.1): `create or replace function` + DO bloğu. Canlı RPC uçtan uca
--   ölçüm 2026-10-25: 154-265 ms (ağ dahil, ilk soğuk çağrı 1,3 sn). Guard ~10 RPC çağrısı =
--   <5 sn; lock_timeout 5 sn (fonksiyon tanımı kilidi anlık), statement_timeout 60 sn pay ile.
--
-- GUARD (K13.2/9/10): ziyaretçi (anon) rolüyle ÇAĞIRIR; sabit satır sayısı yok (K8.3); boş
--   veritabanında NOTICE ile atlar; veri-bağımlı vakalar ilgili kategori/aile yoksa NOTICE ile
--   atlanır (katalog silerse kapı kırmızıya dönmesin, sessizce de geçmesin: atlanan NOTICE'ta yazar).

set lock_timeout = '5s';
set statement_timeout = '60s';

begin;

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
  v_kokler text[];
  v_kok    int;
begin
  v_limit := least(greatest(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  if v_raw = '' then return; end if;
  v_norm  := public.arama_normalize(v_raw);

  -- Sorgu kökleri (K6.1): kelime başına Türkçe ek payı kırpılır, kısa kelimeler aynen kalır.
  v_kokler := array(
    select case when length(t) >= 6 then left(t, length(t) - 2)
                when length(t) >= 4 then left(t, length(t) - 1)
                else t end
      from unnest(regexp_split_to_array(v_norm, '[^a-z0-9]+')) as t
     where t <> ''
  );
  v_kok := coalesce(array_length(v_kokler, 1), 0);

  return query
  select s.o_tip, s.o_etiket, s.o_url, s.o_meta
    from (
      -- 1) Kategoriler (en çok 2): ad + TR slug + EN slug + kanonik slug, kök eşleşme.
      select kt.o_tip, kt.o_etiket, kt.o_url, kt.o_meta, 1 as o_dal, kt.o_sira
        from (
          select 'category'::text as o_tip,
                 c.name::text as o_etiket,
                 ('/category/' || c.slug)::text as o_url,
                 jsonb_build_object('level', c.level, 'slug', c.metadata->'slug') as o_meta,
                 (row_number() over (order by c.level, c.name))::int as o_sira
            from public.categories c
           cross join lateral (
                 select regexp_split_to_array(
                          public.arama_normalize(concat_ws(' ',
                            c.name,
                            replace(c.metadata->'slug'->>'tr', '-', ' '),
                            replace(c.metadata->'slug'->>'en', '-', ' '),
                            replace(c.slug, '-', ' '))),
                          '[^a-z0-9]+') as w
               ) m
           where c.is_active = true
             and v_kok > 0
             and not exists (
                   select 1 from unnest(v_kokler) as k
                    where not exists (select 1 from unnest(m.w) as x where starts_with(x, k)))
        ) kt
       where kt.o_sira <= 2

      union all

      -- 2) Seriler / ürün aileleri (en çok 2): ad + TR/EN çeviri, aktif ürünü olan, silinmemiş.
      select fm.o_tip, fm.o_etiket, fm.o_url, fm.o_meta, 2 as o_dal, fm.o_sira
        from (
          select 'family'::text as o_tip,
                 f.name::text as o_etiket,
                 ('/products/' || f.slug)::text as o_url,
                 jsonb_build_object('slug', f.slug, 'name_i18n', f.name_i18n) as o_meta,
                 (row_number() over (order by a.ad_isabet desc, length(m.metin), f.name))::int as o_sira
            from public.product_families f
           cross join lateral (
                 select public.arama_normalize(concat_ws(' ',
                          f.name, f.name_i18n->>'tr', f.name_i18n->>'en')) as metin
               ) m
           cross join lateral (
                 select regexp_split_to_array(m.metin, '[^a-z0-9]+') as w
               ) mw
           cross join lateral (
                 -- Aile ADINDA (çeviri değil) kaç kök eşleşiyor: "JET Serisi", "SEAT Serisi"nden önce.
                 select count(*) as ad_isabet
                   from unnest(v_kokler) as k
                  where exists (
                          select 1
                            from unnest(regexp_split_to_array(public.arama_normalize(f.name), '[^a-z0-9]+')) as x
                           where starts_with(x, k))
               ) a
           where f.deleted_at is null
             and f.slug is not null
             and v_kok > 0
             and exists (select 1 from public.products p
                          where p.family_id = f.id and p.status = 'active' and p.deleted_at is null)
             and not exists (
                   select 1 from unnest(v_kokler) as k
                    where not exists (select 1 from unnest(mw.w) as x where starts_with(x, k)))
        ) fm
       where fm.o_sira <= 2

      union all

      -- 3) Markalar (en çok 2) — AYNEN (davranış değişmedi).
      select br.o_tip, br.o_etiket, br.o_url, br.o_meta, 3 as o_dal, br.o_sira
        from (
          select 'brand'::text as o_tip,
                 b.brand::text as o_etiket,
                 ('/products?brand=' || b.brand)::text as o_url,
                 jsonb_build_object() as o_meta,
                 (row_number() over (order by b.brand))::int as o_sira
            from (
              select distinct p.brand
                from public.products p
               where p.status = 'active' and p.deleted_at is null and p.brand is not null
                 and public.arama_normalize(p.brand) like '%' || replace(v_norm, ' ', '%') || '%'
            ) b
        ) br
       where br.o_sira <= 2

      union all

      -- 4) Ürünler (en çok 4) — TEK gövdeden, fts_search_products ile AYNI sıra (K3.1e).
      select pr.o_tip, pr.o_etiket, pr.o_url, pr.o_meta, 4 as o_dal, pr.o_sira
        from (
          select 'product'::text as o_tip,
                 p.name::text as o_etiket,
                 (case
                    when f.slug is not null and p.sku is not null then '/products/' || f.slug || '?sku=' || p.sku
                    when f.slug is not null then '/products/' || f.slug
                    when p.slug is not null then '/products/' || p.slug
                    else '/products/' || p.id::text
                  end)::text as o_url,
                 jsonb_build_object(
                   'sku', p.sku,
                   'brand', coalesce(p.brand, ''),
                   'model_code', coalesce(p.model_code, ''),
                   'family_slug', f.slug) as o_meta,
                 (row_number() over (
                    order by e.basamak,
                             public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), v_raw) desc,
                             ts_rank(psi.search_document, plainto_tsquery('turkish', v_raw)) desc,
                             p.name))::int as o_sira
            from public.arama_eslesen_urunler(v_raw) e
            join public.products p on p.id = e.product_id
            join public.product_search_index psi on psi.product_id = p.id
            left join public.product_families f on f.id = p.family_id and f.deleted_at is null
           where p.status = 'active' and p.deleted_at is null
        ) pr
       where pr.o_sira <= least(v_limit, 4)
    ) s
   order by s.o_dal, s.o_sira
   limit v_limit;
end;
$function$;

-- ── GUARD — ZİYARETÇİ rolüyle (anon) ÇAĞIRIR. Sabit sayı yok (K8.3): davranış ölçülür. ──
do $$
declare
  v_kat    int;
  v_urun   int;
  v_q      text;
  v_sonuc  jsonb;
  v_tum    jsonb := '{}'::jsonb;
  v_sira   int;
  v_onceki int;
  v_satir  record;
  v_beklenen text;
  v_atlanan  text[] := '{}';
begin
  -- Yetki veriye bağlı değil: boş veritabanında da koşar (K13.3).
  if not (has_function_privilege('anon', 'public.get_search_suggestions(text,integer)', 'EXECUTE')
      and has_function_privilege('authenticated', 'public.get_search_suggestions(text,integer)', 'EXECUTE')) then
    raise exception 'ARAMA ÖNERİ GUARD: anon/authenticated get_search_suggestions EXECUTE yetkisi eksik';
  end if;

  -- Davranış ölçümü veri ister (K13.4 m.6): boş veritabanında NOTICE ile atlar.
  select count(*) into v_kat  from public.categories where is_active;
  select count(*) into v_urun from public.product_search_index;
  if v_kat = 0 or v_urun = 0 then
    raise notice 'ARAMA ÖNERİ GUARD ATLANDI — categories/product_search_index BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  -- Sorguları ZİYARETÇİ rolüyle çağır (K13.4 m.9): doğru sayı, yanlış kişi olmasın.
  set local role anon;
  foreach v_q in array array['hava perdesi', 'perde hava', 'çatı fanı', 'kanal fanı', 'air curtain',
                             'roof fan', 'duct fan', 'jet fan', 'sessiz fan', 'fan', 'zzzqqq', 'VRT-17160']
  loop
    select coalesce(jsonb_agg(jsonb_build_object('t', r.type, 'l', r.label, 'u', r.url) order by r.ord), '[]'::jsonb)
      into v_sonuc
      from public.get_search_suggestions(v_q, 6) with ordinality as r(type, label, url, metadata, ord);
    v_tum := v_tum || jsonb_build_object(v_q, v_sonuc);
  end loop;
  reset role;

  -- (a) Dal sırası (K13.4 m.10): her sorguda kategori → seri → marka → ürün, geriye dönüş yok.
  for v_q in select jsonb_object_keys(v_tum) loop
    v_onceki := 0;
    for v_satir in select e.v->>'t' as t from jsonb_array_elements(v_tum->v_q) as e(v) loop
      v_sira := case v_satir.t when 'category' then 1 when 'family' then 2 when 'brand' then 3 when 'product' then 4 else 99 end;
      if v_sira < v_onceki or v_sira = 99 then
        raise exception 'ARAMA ÖNERİ GUARD: "%" dal sırası bozuk (% sonra % geldi)', v_q, v_onceki, v_sira;
      end if;
      v_onceki := v_sira;
    end loop;
  end loop;

  -- (b) Anlamsız sorgu hiçbir öneri döndürmez.
  if jsonb_array_length(v_tum->'zzzqqq') <> 0 then
    raise exception 'ARAMA ÖNERİ GUARD: zzzqqq % öneri döndürdü (0 olmalı)', jsonb_array_length(v_tum->'zzzqqq');
  end if;

  -- (c) Tek kelime kategori tavanı: fan → en çok 2 kategori.
  if (select count(*) from jsonb_array_elements(v_tum->'fan') e(v) where e.v->>'t' = 'category') > 2 then
    raise exception 'ARAMA ÖNERİ GUARD: fan 2''den fazla kategori döndürdü';
  end if;

  -- (d) Kategori vakaları (ek, sıra bağımsızlığı, EN slug) — kategori katalogda varsa.
  select c.name into v_beklenen from public.categories c where c.slug = 'air-curtains' and c.is_active limit 1;
  if v_beklenen is null then
    v_atlanan := v_atlanan || 'hava perdesi/perde hava/air curtain (air-curtains kategorisi yok)';
  else
    if v_tum->'hava perdesi'->0->>'t' is distinct from 'category'
       or v_tum->'hava perdesi'->0->>'l' is distinct from v_beklenen then
      raise exception 'ARAMA ÖNERİ GUARD: hava perdesi ilk öneri % (kategori "%" beklenirdi): %',
        v_tum->'hava perdesi'->0, v_beklenen, v_tum->'hava perdesi';
    end if;
    -- K6.1: sıra bağımsız — aynı kategori kümesi.
    if (select coalesce(jsonb_agg(e.v->>'u' order by e.v->>'u'), '[]') from jsonb_array_elements(v_tum->'hava perdesi') e(v) where e.v->>'t' = 'category')
       is distinct from
       (select coalesce(jsonb_agg(e.v->>'u' order by e.v->>'u'), '[]') from jsonb_array_elements(v_tum->'perde hava') e(v) where e.v->>'t' = 'category') then
      raise exception 'ARAMA ÖNERİ GUARD: hava perdesi ile perde hava farklı kategori kümesi verdi (K6.1)';
    end if;
    -- EN slug: air curtain → kategori var.
    if not (v_tum->'air curtain' @> '[{"t":"category","u":"/category/air-curtains"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: air curtain air-curtains kategorisini önermedi: %', v_tum->'air curtain';
    end if;
  end if;

  if exists (select 1 from public.categories c where c.slug = 'roof-fans' and c.is_active) then
    if not (v_tum->'çatı fanı' @> '[{"t":"category","u":"/category/roof-fans"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: çatı fanı roof-fans kategorisini önermedi: %', v_tum->'çatı fanı';
    end if;
    if not (v_tum->'roof fan' @> '[{"t":"category","u":"/category/roof-fans"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: roof fan roof-fans kategorisini önermedi: %', v_tum->'roof fan';
    end if;
  else
    v_atlanan := v_atlanan || 'çatı fanı/roof fan (roof-fans kategorisi yok)';
  end if;

  if exists (select 1 from public.categories c where c.slug = 'duct-fans' and c.is_active) then
    if not (v_tum->'kanal fanı' @> '[{"t":"category","u":"/category/duct-fans"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: kanal fanı duct-fans kategorisini önermedi: %', v_tum->'kanal fanı';
    end if;
    if not (v_tum->'duct fan' @> '[{"t":"category","u":"/category/duct-fans"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: duct fan duct-fans kategorisini önermedi: %', v_tum->'duct fan';
    end if;
  else
    v_atlanan := v_atlanan || 'kanal fanı/duct fan (duct-fans kategorisi yok)';
  end if;

  -- (e) Seri vakaları — aile (aktif ürünlü) katalogda varsa.
  if exists (select 1 from public.product_families f
              where f.slug = 'jet-serisi' and f.deleted_at is null
                and exists (select 1 from public.products p where p.family_id = f.id and p.status = 'active' and p.deleted_at is null)) then
    if not (v_tum->'jet fan' @> '[{"t":"family","u":"/products/jet-serisi"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: jet fan JET Serisi önerisini döndürmedi: %', v_tum->'jet fan';
    end if;
    -- İlk seri JET Serisi (SEAT Serisi'nin çeviri metninde de "Jet" geçer; ad isabeti ilk sıraya koyar).
    if (select e.v->>'u' from jsonb_array_elements(v_tum->'jet fan') e(v) where e.v->>'t' = 'family' limit 1)
       is distinct from '/products/jet-serisi' then
      raise exception 'ARAMA ÖNERİ GUARD: jet fan ilk seri JET Serisi değil: %', v_tum->'jet fan';
    end if;
  else
    v_atlanan := v_atlanan || 'jet fan (jet-serisi ailesi yok ya da aktif ürünü yok)';
  end if;

  if exists (select 1 from public.product_families f
              where f.slug = 'vortice-lineo-quiet-sessiz-kanal-fanlari' and f.deleted_at is null
                and exists (select 1 from public.products p where p.family_id = f.id and p.status = 'active' and p.deleted_at is null)) then
    if not (v_tum->'sessiz fan' @> '[{"t":"family","u":"/products/vortice-lineo-quiet-sessiz-kanal-fanlari"}]'::jsonb) then
      raise exception 'ARAMA ÖNERİ GUARD: sessiz fan Lineo Quiet serisini döndürmedi: %', v_tum->'sessiz fan';
    end if;
  else
    v_atlanan := v_atlanan || 'sessiz fan (Lineo Quiet ailesi yok ya da aktif ürünü yok)';
  end if;

  -- (f) Regresyon (K8.5): tam SKU araması hâlâ ürün öneriyor, kategori/seri karıştırmıyor.
  if exists (select 1 from public.products p where p.sku = 'VRT-17160' and p.status = 'active' and p.deleted_at is null) then
    if not (v_tum->'VRT-17160' @> '[{"t":"product"}]'::jsonb)
       or (v_tum->'VRT-17160') @> '[{"t":"category"}]'::jsonb
       or (v_tum->'VRT-17160') @> '[{"t":"family"}]'::jsonb then
      raise exception 'ARAMA ÖNERİ GUARD: VRT-17160 ürün önerisi bozuldu ya da kategori/seri karıştı: %', v_tum->'VRT-17160';
    end if;
  else
    v_atlanan := v_atlanan || 'VRT-17160 (SKU yok)';
  end if;

  raise notice 'ARAMA ÖNERİ GUARD GEÇTİ (anon rolüyle): hava perdesi=% çatı fanı=% kanal fanı=% air curtain=% jet fan=% sessiz fan=% fan=% zzzqqq=% · atlanan: %',
    jsonb_array_length(v_tum->'hava perdesi'), jsonb_array_length(v_tum->'çatı fanı'),
    jsonb_array_length(v_tum->'kanal fanı'), jsonb_array_length(v_tum->'air curtain'),
    jsonb_array_length(v_tum->'jet fan'), jsonb_array_length(v_tum->'sessiz fan'),
    jsonb_array_length(v_tum->'fan'), jsonb_array_length(v_tum->'zzzqqq'),
    coalesce(nullif(array_to_string(v_atlanan, '; '), ''), 'yok');
end;
$$;

commit;
