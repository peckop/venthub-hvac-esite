-- URN-85 · REC-300 — KATEGORİ ADRESİ DİL BAŞINA TEKİL: iki ifade indeksi (TR ve EN, kiracı kapsamlı)
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec300-model-adres-kategori-tr-adlari-2026-10-10.md; slug planı:
-- docs/plans/slug-localization-2026-08-10.md; cetvel: docs/standards/migration-safety-standard.md)
-- ═════════════════════════════════════════════════════════════════════════════
-- Bir kategorinin görünen adresi dile göre `metadata.slug.tr` / `metadata.slug.en` alanından gelir; alan boşsa
-- kanonik `slug` (EN) kullanılır (`getLocalizedCategorySlug`: `metadata.slug?.[lang] || slug`). Bugün veritabanı yalnız
-- kanonik `slug`'ı tekil tutuyor (`categories_slug_key`, KÜRESEL). TR ve EN görünen adres için hiçbir kısıt yok: iki kategoriye
-- aynı TR slug yazılırsa çözücü (`kategoriSatiriSec`) yalnız bir uyarı basıp id sırasıyla birini seçer ve öbür kategori
-- adresinden ulaşılamaz olur; hiçbir kapı görmez. Adres şeması açılırken (alt kategori adresi tek seviyeye iniyor, kök ile
-- alt aynı ad alanında) bu kusur sessiz ve geri dönüşsüz bir "iki kategori tek adres" üretir. Bu migration kuralı
-- veritabanına taşır: AYNI DİLDE aynı kiracıda ikinci aynı görünen slug eklenemez (23505).
--
-- NE YAPAR: iki tekil ifade indeksi ekler. Veri yazmaz, kolon/tip/politika/fonksiyon değiştirmez.
--   categories_tr_slug_tenant_uq : (tenant_id, lower(coalesce(nullif(metadata->'slug'->>'tr',''), slug)))
--   categories_en_slug_tenant_uq : (tenant_id, lower(coalesce(nullif(metadata->'slug'->>'en',''), slug)))
-- İfade çözücünün kuralının aynısıdır (boş TR/EN → kanonik slug) ve `url_takma_adlari` tetiğinin kullandığı `lower()` ile
-- aynı biçimdedir. Kök ve alt kategori aynı indekste olduğu için kök ile alt aynı slug'ı alamaz (tek seviyeli adres).
-- Pasif kategoriler de kapsamdadır (çözücü pasif satırı bulup aktif üste yönlendirir; adresi hâlâ "iddia eder").
-- Kısmi (`where`) indeks DEĞİL: kural bütün satırlara uygulanır.
--
-- ⚠ BU İNDEKS DİLLER ARASI ÇAKIŞMAYI ENGELLEMEZ (bilinçli, kapsam: dil başına). Çözücü slug'ı kanonik, TR ve EN
-- alanlarında DİLDEN BAĞIMSIZ arar (öncelik kanonik > tr > en). Bir kategorinin TR slug'ı başka bir kategorinin kanonik ya da
-- EN slug'ıyla aynıysa iki dil yolu birbirini gölgeler. Bugün sayı 0 (ölçüldü, aşağıda); indeksle zorlanamaz (bir ifade tek
-- satırın tek değerini görür), tetik ya da çözücü/kapı işidir. Ayrı karar olarak raporda.
--
-- ═════════════════════════════════════════════════════════════════════════════
-- ÖLÇÜM (canlı SELECT, salt okuma, 2026-10-11): categories 35 satır (28 aktif, 7 pasif; 9 kök, 26 alt), 1 kiracı, tablo
-- 288 kB.
--   · TR görünen slug: 35 ayrık değer / 35 satır → tekrar 0.   · EN görünen slug: 35 ayrık değer / 35 satır → tekrar 0.
--   · kanonik slug: 35 ayrık (categories_slug_key).            · kök ile alt aynı slug (TR ve EN): 0.
--   · `metadata.slug.tr` / `metadata.slug.en` boş ya da NULL: 0 / 0 (35/35 dolu); `metadata.slug.en` kanonik slug'a
--     eşit: 35/35; `metadata.slug.tr` kanonik slug'a eşit: 0.
--   · biçim dışı slug (küçük harf, rakam, tire dışı; baş/son boşluk): 0.
--   · diller arası: TR slug başka satırın kanonik/EN slug'ına eşit: 0.
--   · çakışan indeks yok (pkey, slug_key, tenant_id_idx, menu_label_idx, parent_id_idx); mevcut CHECK
--     `categories_slug_adres_ayirici_yok` ('-p-' yasağı) indekslerle çakışmaz.
--   · yazan tetikler: arama_kategori_kuyrukla, categories_set_level (BEFORE), denetim_izi_categories, on_categories_change,
--     url_takma_ad_kategori(+_ekle). Hiçbiri slug/metadata değerini değiştirmez; indeks denetimi satır yazılırken BEFORE
--     tetiklerinden sonra, AFTER tetiklerinden önce yapılır.
--
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR (kural 13). Yalnız Recep onayıyla birleşir.
-- Görünür davranış: aynı kiracıda ikinci aynı TR ya da EN görünen slug 23505 ile reddedilir. Yazma yolları: admin kategori
-- formu (CategoryFormModal / CategoryBuilderView yalnız KANONİK `slug` yazar, `metadata.slug`'a dokunmaz; yeni kategorinin
-- görünen TR/EN slug'ı kanonik slug'ına düşer) ve ileride dil başına slug migration'ları (URN-86).
--
-- TİP DOSYASI: indeks `src/types/database.types.ts`'e yansımaz; dokunulmaz.
-- ŞEMA TABANI: INV-TABAN-TAZE-1 gereği birleşme sonrası AYNI GÜN `sema-tabani-uret.yml` koşturulur (pg_dump indeksleri taşır).
--
-- ⭐ÜÇ ADIMLI YAPI (INV-MIGRATION-3: squawk `require-concurrent-index-creation` düz CREATE UNIQUE INDEX'e KIRMIZI verir).
-- Emsal: 20260930061500_pricing_rule_urun_tek_sabit_uq.sql.
--   A) işlem: zaman aşımları + ön doğrulama (ihlal varsa hiçbir şey yapmadan düşer)
--   B) işlem DIŞI: geçersiz kalmış eski indeks varsa düşür, sonra CREATE UNIQUE INDEX CONCURRENTLY (iki indeks)
--   C) işlem: açıklama + son doğrulama (iki indeks var, geçerli, tekil, kısmi değil, doğru dilin ifadesi)
-- CONCURRENTLY yarıda kalırsa GEÇERSİZ indeks bırakır ve `if not exists` onu "var" sayıp atlar; bu yüzden B'nin başında
-- geçersiz olan düşürülür, C ayrıca `indisvalid` ölçer. Tablo 35 satır: kurulum milisaniyelerdir. Aynı işlemde kilit kazancı
-- yoktur (A ve C ayrı işlemdir); kazanç, B'nin yazmayı bloklamamasıdır.
--
-- GERİ ALMA (veri kaybı yok): scripts/db/geri-alma/20261011100000_kategori_slug_dil_basina_tekil.geri-al.sql
--   drop index if exists public.categories_tr_slug_tenant_uq;
--   drop index if exists public.categories_en_slug_tenant_uq;
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- A) Ön-guard: mevcut veri kuralı ihlal ediyor mu? Ediyorsa indeks canlıda patlar; anlaşılır hatayla hiç başlamaz.
do $$
declare
  v_bos integer;
  v_cakisan integer;
  v_ornek text;
begin
  select count(*) into v_bos from public.categories where btrim(slug) = '';
  if v_bos <> 0 then
    raise exception 'kategori slug indeksi iptal: % satirda bos kanonik slug var; once duzelt', v_bos;
  end if;

  -- TR görünen slug, kiracı içinde.
  select count(*), string_agg(k, '; ') into v_cakisan, v_ornek
    from (
      select tenant_id::text || '/' || lower(coalesce(nullif(metadata -> 'slug' ->> 'tr', ''), slug)) as k
        from public.categories
       group by tenant_id, lower(coalesce(nullif(metadata -> 'slug' ->> 'tr', ''), slug))
      having count(*) > 1
    ) t;
  if v_cakisan <> 0 then
    raise exception 'kategori slug indeksi iptal: TR gorunen slug % grupta tekrar ediyor (%); once duzelt', v_cakisan, v_ornek;
  end if;

  -- EN görünen slug, kiracı içinde.
  select count(*), string_agg(k, '; ') into v_cakisan, v_ornek
    from (
      select tenant_id::text || '/' || lower(coalesce(nullif(metadata -> 'slug' ->> 'en', ''), slug)) as k
        from public.categories
       group by tenant_id, lower(coalesce(nullif(metadata -> 'slug' ->> 'en', ''), slug))
      having count(*) > 1
    ) t;
  if v_cakisan <> 0 then
    raise exception 'kategori slug indeksi iptal: EN gorunen slug % grupta tekrar ediyor (%); once duzelt', v_cakisan, v_ornek;
  end if;

  -- Bilgi (engel DEĞİL): diller arası gölgeleme. İndeks bunu zorlayamaz; sayı apply günlüğüne düşer.
  select count(*) into v_cakisan
    from public.categories a
    join public.categories b
      on b.tenant_id = a.tenant_id and b.id <> a.id
     and lower(coalesce(nullif(a.metadata -> 'slug' ->> 'tr', ''), a.slug))
       in (lower(b.slug), lower(coalesce(nullif(b.metadata -> 'slug' ->> 'en', ''), b.slug)));
  raise notice 'kategori slug indeksi: diller arasi golgeleme (TR slug baska satirin kanonik/EN slug''i) = %', v_cakisan;
end $$;

commit;

-- B) İNDEKSLER — CONCURRENTLY, işlem DIŞINDA.
do $$
declare
  v_ad text;
begin
  for v_ad in select unnest(array['categories_tr_slug_tenant_uq', 'categories_en_slug_tenant_uq']) loop
    if exists (select 1 from pg_index x join pg_class c on c.oid = x.indexrelid
                join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relname = v_ad and not x.indisvalid) then
      execute format('drop index public.%I', v_ad);
      raise notice 'GEÇERSİZ indeks düşürüldü, yeniden kurulacak: %', v_ad;
    end if;
  end loop;
end $$;

create unique index concurrently if not exists categories_tr_slug_tenant_uq
  on public.categories (tenant_id, (lower(coalesce(nullif(metadata -> 'slug' ->> 'tr', ''), slug))));

create unique index concurrently if not exists categories_en_slug_tenant_uq
  on public.categories (tenant_id, (lower(coalesce(nullif(metadata -> 'slug' ->> 'en', ''), slug))));

-- C) Açıklama + son-guard.
begin;

comment on index public.categories_tr_slug_tenant_uq is
  'URN-85: kiracı içinde TR gorunen kategori slug''i tekil (metadata.slug.tr, bossa kanonik slug; kucuk harf). Ihlal = 23505. Diller arasi golgeleme ENGELLENMEZ.';
comment on index public.categories_en_slug_tenant_uq is
  'URN-85: kiracı içinde EN gorunen kategori slug''i tekil (metadata.slug.en, bossa kanonik slug; kucuk harf). Ihlal = 23505. Diller arasi golgeleme ENGELLENMEZ.';

do $$
declare
  v_adet integer;
begin
  select count(*) into v_adet
    from pg_index x
    join pg_class c on c.oid = x.indexrelid
    join pg_class t on t.oid = x.indrelid
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and t.relname = 'categories'
     and x.indisvalid and x.indisunique and x.indpred is null and x.indnkeyatts = 2
     and ((c.relname = 'categories_tr_slug_tenant_uq' and pg_get_indexdef(x.indexrelid) like '%->> ''tr''::text%')
       or (c.relname = 'categories_en_slug_tenant_uq' and pg_get_indexdef(x.indexrelid) like '%->> ''en''::text%'));
  if v_adet <> 2 then
    raise exception 'kategori slug indeksleri olusmadi ya da gecersiz/tekil/kismi degil/yanlis dil (gecerli: % / 2)', v_adet;
  end if;
end $$;

commit;
