-- URN-85 · kategori görünen slug'ının DİL BAŞINA tekilliği — SALT-OKUMA ölçümü (tek ifade, yalnız SELECT).
--
-- NE ZAMAN KOŞULUR: (1) supabase/migrations/20261011100000_kategori_slug_dil_basina_tekil.sql birleşmeden ÖNCE
-- (kontrol 01-09 hepsi 0 olmalı; sıfır değilse migration'ın A guard'ı zaten düşer), (2) birleşme sonrası
-- (kontrol 10 = 2 olmalı), (3) yeni kategori ya da dil başına slug (URN-86) yazan her işten sonra.
-- NASIL: Supabase SQL düzenleyicisi, `psql -f` ya da MCP execute_sql. Hiçbir şey yazmaz.
-- KURAL: çözücünün kuralı (`metadata.slug.<dil>` boşsa kanonik `slug`) ve migration'daki indeks ifadesi ile AYNI ifade
-- kullanılır; kiracı kapsamlıdır. Sütunlar: kontrol, adet, beklenen, ayrinti (ilk 5 örnek).
--
-- OKUMA: `adet` ile `beklenen` farklıysa o kontrol İHLALdir. `bilgi` satırları ihlal değil, sayımdır.
-- 09 satırı İNDEKSİN ENGELLEYEMEDİĞİ bir sınıftır (diller arası gölgeleme): sıfır değilse kararı müdüre götür.
with e as (
  select c.id, c.tenant_id, c.parent_id, c.is_active, c.slug,
         c.metadata -> 'slug' ->> 'tr' as tr_ham,
         c.metadata -> 'slug' ->> 'en' as en_ham,
         lower(coalesce(nullif(c.metadata -> 'slug' ->> 'tr', ''), c.slug)) as tr_etkin,
         lower(coalesce(nullif(c.metadata -> 'slug' ->> 'en', ''), c.slug)) as en_etkin
    from public.categories c
),
tr_grup as (
  select tenant_id, tr_etkin as k, count(*) n, string_agg(slug, ', ') s from e group by 1, 2 having count(*) > 1
),
en_grup as (
  select tenant_id, en_etkin as k, count(*) n, string_agg(slug, ', ') s from e group by 1, 2 having count(*) > 1
),
kok_alt_tr as (
  select a.slug as kok_slug, b.slug as alt_slug, a.tr_etkin as k
    from e a join e b on b.tenant_id = a.tenant_id and a.parent_id is null and b.parent_id is not null
     and b.tr_etkin = a.tr_etkin
),
kok_alt_en as (
  select a.slug as kok_slug, b.slug as alt_slug, a.en_etkin as k
    from e a join e b on b.tenant_id = a.tenant_id and a.parent_id is null and b.parent_id is not null
     and b.en_etkin = a.en_etkin
),
golgeleme as (
  -- A'nın TR slug'ı, B'nin kanonik ya da EN slug'ı (A <> B, aynı kiracı): çözücü dilden bağımsız aradığı için
  -- iki dil yolu birbirini gölgeler.
  select a.slug as a_slug, b.slug as b_slug, a.tr_etkin as k
    from e a join e b on b.tenant_id = a.tenant_id and b.id <> a.id
     and a.tr_etkin in (lower(b.slug), b.en_etkin)
),
bicim as (
  select slug, tr_ham, en_ham from e
   where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      or tr_etkin !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      or en_etkin !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      or tr_ham is distinct from btrim(tr_ham)
      or en_ham is distinct from btrim(en_ham)
),
indeks as (
  select c.relname, x.indisvalid, x.indisunique, x.indpred is null as kismi_degil
    from pg_index x
    join pg_class c on c.oid = x.indexrelid
    join pg_class t on t.oid = x.indrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and t.relname = 'categories'
     and c.relname in ('categories_tr_slug_tenant_uq', 'categories_en_slug_tenant_uq')
)
select kontrol, adet, beklenen, ayrinti from (
  select '00 satir (bilgi)' as kontrol, count(*)::int as adet, null::int as beklenen,
         'aktif ' || count(*) filter (where is_active) || ', pasif ' || count(*) filter (where is_active is not true)
         || ', kok ' || count(*) filter (where parent_id is null) || ', alt ' || count(*) filter (where parent_id is not null)
         || ', kiraci ' || count(distinct tenant_id) as ayrinti, 0 as sira from e
  union all
  select '01 TR gorunen slug tekrar eden grup', count(*)::int, 0, left(coalesce(string_agg(k || ' <- ' || s, ' | '), ''), 300), 1 from tr_grup
  union all
  select '02 EN gorunen slug tekrar eden grup', count(*)::int, 0, left(coalesce(string_agg(k || ' <- ' || s, ' | '), ''), 300), 2 from en_grup
  union all
  select '03 kok ile alt ayni TR slug', count(*)::int, 0, left(coalesce(string_agg(kok_slug || ' / ' || alt_slug, ' | '), ''), 300), 3 from kok_alt_tr
  union all
  select '04 kok ile alt ayni EN slug', count(*)::int, 0, left(coalesce(string_agg(kok_slug || ' / ' || alt_slug, ' | '), ''), 300), 4 from kok_alt_en
  union all
  select '05 bos kanonik slug', count(*)::int, 0, left(coalesce(string_agg(id::text, ', '), ''), 300), 5 from e where btrim(slug) = ''
  union all
  select '06 metadata.slug.tr bos/NULL (bilgi: kanonige duser)', count(*)::int, null, left(coalesce(string_agg(slug, ', '), ''), 300), 6
    from e where tr_ham is null or btrim(tr_ham) = ''
  union all
  select '07 metadata.slug.en bos/NULL (bilgi: kanonige duser)', count(*)::int, null, left(coalesce(string_agg(slug, ', '), ''), 300), 7
    from e where en_ham is null or btrim(en_ham) = ''
  union all
  select '08 bicim disi slug (kucuk harf/rakam/tire disi, bas-son bosluk)', count(*)::int, 0, left(coalesce(string_agg(slug, ', '), ''), 300), 8 from bicim
  union all
  select '09 diller arasi golgeleme (INDEKS ENGELLEMEZ)', count(*)::int, 0, left(coalesce(string_agg(a_slug || ' -> ' || b_slug, ' | '), ''), 300), 9 from golgeleme
  union all
  select '10 indeks gecerli+tekil+kismi degil (migration sonrasi 2)', count(*) filter (where indisvalid and indisunique and kismi_degil)::int, 2,
         coalesce(string_agg(relname || case when indisvalid then '' else ' GECERSIZ' end, ', '), 'indeks yok'), 10 from indeks
) s
order by sira;
