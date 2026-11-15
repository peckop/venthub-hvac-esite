-- URN-166 — Arama tolerans/sıralama ayarı: katalog sözlüğü düzeltmesi + birim sözcüğü
--
-- KARAR BELGESİ: docs/plans/arama-karar-belgesi-2026-11-15.md (Yol A, ikinci adım). Kart: URN-166.
-- KÖK SEBEPLER (canlı ölçüm 2026-11-15, product_search_index 442 satır, 1896 ayrık sözcük):
--
-- KUSUR 1 — "kanal tipi fann" (4 harfli sözcükte yazım hatası):
--   Basamak 22 (genel yazım hatası) 4 harf ve kısa sözcüklerde TAM eşleşme ister
--   (`fan`→`fen` çöpe dönmesin diye, K6.4). "fann" katalogda yok → basamak 22 boş → "kanal tipi" ikilisi
--   basamak 3'e düşüyor ve ilk altı sonuç SULU BATARYA "KANAL TİPİ" oluyor; "kanal tipi fan" ise 66 fan.
--   ÇÖZÜM: basamak 24 — KATALOG SÖZLÜĞÜ düzeltmesi. Sözcük katalog sözlüğünde yoksa (4-6 harf, rakamsız)
--   aynı ilk harfli, mesafesi 1 olan KATALOG sözcüklerinden biri sayılır (hepsi OR); tüm sözcükler
--   çözülürse kesin ifade yeniden koşar. Bütün sözcük dizgesi sözlükten geldiği için "fan→fen" tehlikesi yok
--   ("fen" katalogda yoksa aday olamaz). Sorgu uzun (≥7) sözcük içeriyorsa basamak 22 zaten kırpmayla
--   çalışır; uzun sözcüğe burada mesafe VERİLMEZ ("ventilator"→"ventilation" gibi sahte düzeltme olmasın).
--
-- KUSUR 2 — "125 mm fan" (birim sözcüğü zorunlu sayılıyor):
--   `mm` metinde ayrı geçmediği için adında 125 olan ürünler (Lineo 125, CA-RM 125) ELENİYOR; arama,
--   ATEX açıklamasındaki "T3/125°C" sıcaklık sınıfı olan 15 ürünü veriyor ve ilk sıra onların.
--   ÇÖZÜM: sorguda rakam sözcüğü VARKEN `mm`/`cm` birim sözcüğü zorunlu koşul olmaz (dolgu). `125 fan` 37 ürün,
--   ilk sıra Lineo 125 (ad isabeti). Rakamsız sorguda `mm` aynen kalır. Sayısal anlam (Ø125 çap süzgeci)
--   bu migration'ın kapsamı DEĞİL: Design D8 şartnamesi, ayrı iş.
--
-- NE DEĞİŞMİYOR: basamak 1 / 21 / 22 / 23 / 3 mantığı, ürün sıralaması (K3.1e), dönüş şekilleri, SECURITY INVOKER.
-- Cetvel: docs/standards/arama-standard.md (K5.3, K6.4, K13.4) · rendering-cache: etkilemez (RPC, statik sayfa değil).

set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- ── KUSUR 2: birim sözcüğü ────────────────────────────────────────────────────
create or replace function public.arama_kelimeler(p_q text)
returns text[] language sql immutable
set search_path to 'pg_catalog','public'
as $$
  with t as (
    select k, o
      from unnest(string_to_array(public.arama_normalize(p_q), ' ')) with ordinality u(k, o)
     where k <> ''
  )
  select coalesce(array_agg(t.k order by t.o), '{}'::text[])
    from t
   where not (t.k = any (array['mm','cm'])
              and exists (select 1 from t t2 where t2.k ~ '^[0-9]+([.,][0-9]+)?$'))
$$;

-- ── KUSUR 1: katalog sözlüğü düzeltme ifadesi ────────────────────────────────
-- Dönüş: Groonga script ifadesi ya da NULL (hiç sözcük düzeltilmedi, ya da biri çözülemedi).
create or replace function public.arama_sozluk_ifade(p_q text)
returns text language sql stable
set search_path to 'pg_catalog','public','extensions'
as $$
  with vocab as (
    select regexp_replace(w, '[^a-z0-9]', '', 'g') as w
      from public.product_search_index psi,
           unnest(string_to_array(psi.arama_kelime, ' ')) w
     group by 1
    having length(regexp_replace(w, '[^a-z0-9]', '', 'g')) >= 3
  ),
  q as (
    select k, o from unnest(public.arama_kelimeler(p_q)) with ordinality u(k, o)
  ),
  c as (
    select q.o, q.k,
           exists (select 1 from vocab v where v.w = q.k) as tam,
           case
             when exists (select 1 from vocab v where v.w = q.k) then array[q.k]
             else (select array_agg(v.w order by v.w)
                     from vocab v
                    where length(q.k) between 4 and 6
                      and q.k !~ '[0-9]'
                      and left(v.w, 1) = left(q.k, 1)
                      and extensions.levenshtein(v.w, q.k) <= 1)
           end as arr
      from q
  )
  select case
           when bool_and(c.arr is not null) and bool_or(not c.tam)
           then string_agg(
                  '(' || (select string_agg('arama_ek @ ' || extensions.pgroonga_escape(x), ' || ')
                            from unnest(c.arr) x) || ')',
                  ' && ' order by c.o)
         end
    from c
$$;

revoke execute on function public.arama_sozluk_ifade(text) from public;
grant  execute on function public.arama_sozluk_ifade(text) to anon, authenticated;

-- ── Tek eşleştirme gövdesi: basamak 24 eklendi (22 ve 23'ten SONRA, 3'ten ÖNCE) ──
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
  v_sozluk   text;
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

  -- BASAMAK 24 — katalog sözlüğü düzeltmesi ("kanal tipi fann" → "kanal tipi fan"); URN-166
  v_sozluk := public.arama_sozluk_ifade(p_q);
  if v_sozluk is not null then
    return query
      select psi.product_id, 24
        from public.product_search_index psi
       where psi.arama_ek &` v_sozluk;
    if found then return; end if;
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

-- GUARD (K13.2 + K13.4/9): ZİYARETÇİ rolüyle ÇAĞIRIR; boş veritabanında NOTICE ile atlar; içerik ölçer.
do $$
declare
  v_tam int; v_duz int; v_dolu int; v_fan_sozluk text;
begin
  if has_function_privilege('anon', 'public.arama_sozluk_ifade(text)', 'execute') is not true
     or has_function_privilege('anon', 'public.arama_kelimeler(text)', 'execute') is not true
     or has_function_privilege('anon', 'public.arama_eslesen_urunler(text)', 'execute') is not true then
    raise exception 'ARAMA TOLERANS GUARD: ziyaretçi (anon) yeni/yenilenen arama fonksiyonunu ÇAĞIRAMIYOR.';
  end if;

  -- Saf davranış (veriden bağımsız).
  if public.arama_kelimeler('125 mm fan') is distinct from array['125','fan']::text[]
     or public.arama_kelimeler('Mm Fan') is distinct from array['mm','fan']::text[]
     or public.arama_kelimeler('  Jet   Fan ') is distinct from array['jet','fan']::text[] then
    raise exception 'ARAMA TOLERANS GUARD: arama_kelimeler birim sözcüğü kuralı beklenen çıktıyı vermedi.';
  end if;

  select count(*) into v_dolu from public.product_search_index;
  if v_dolu = 0 then
    raise notice 'ARAMA TOLERANS GUARD ATLANDI (veri kolu) — product_search_index BOŞ (kurulum/gölge koşumu).';
    return;
  end if;

  set local role anon;
  select count(*) into v_tam from public.arama_eslesen_urunler('kanal tipi fan');
  select count(*) into v_duz from public.arama_eslesen_urunler('kanal tipi fann') where basamak = 24;
  v_fan_sozluk := public.arama_sozluk_ifade('fleksiva');
  reset role;

  if v_tam > 0 and v_duz = 0 then
    raise exception 'ARAMA TOLERANS GUARD: "kanal tipi fan" % ürün veriyor ama "kanal tipi fann" basamak 24 ile bulamadı.', v_tam;
  end if;
  if v_fan_sozluk is not null then
    raise exception 'ARAMA TOLERANS GUARD: uzun anlamsız sözcük ("fleksiva") sözlükle yanlış düzeltildi: %', v_fan_sozluk;
  end if;
end;
$$;

commit;
