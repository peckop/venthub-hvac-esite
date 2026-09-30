-- REC-412 — ÜRÜN BAŞINA TEK SABİT FİYAT KURALI: kısmi tekil indeks
--
-- ═════════════════════════════════════════════════════════════════════════════
-- NİÇİN (plan: docs/plans/rec412-tek-urun-fiyat-girisi-2026-09-29.md §9; cetvel: docs/standards/migration-safety-standard.md)
-- ═════════════════════════════════════════════════════════════════════════════
-- Tek ürün fiyat girişi (`setProductFixedPrice`) "önce oku, yoksa ekle" yapar. İki yönetici aynı ürüne aynı anda İLK fiyatı
-- girerse ikisi de "yok" görüp ikisi de ekler → ürüne iki sabit kural; servis bundan sonra "N sabit kural var" hatası verir ve
-- ürün panelden fiyat girişine kilitlenir. Tekillik yalnız uygulama katmanındaydı; bu indeks onu veritabanına taşır.
--
-- KOŞUL = servisin `isProductFixedRule` tanımı: scope 1 (ürün), method 'fixed', price_book_id NULL (tüm kitaplar), min_quantity 1,
-- currency NULL (tüm para birimleri), valid_from / valid_to NULL (süresiz). Para birimli ya da dönemli (kampanya) sabit kural
-- "ürünün fiyatı" DEĞİLDİR: çözücü onları ayrı aday sayar (pricing-standard §11) ve priority ile ayırır; bu indeks onları ENGELLEMEZ.
--
-- BU MIGRATION PROD'A OTOMATİK UYGULANIR (kural 13). Yalnız Recep onayıyla birleşir.
-- VERİ YAZMAZ; tip dosyasını ETKİLEMEZ (yalnız indeks). Görünür davranış: aynı ürüne ikinci süresiz, para birimi kısıtsız
-- sabit kural eklenemez (23505).
--
-- ÖLÇÜLDÜ (canlı, salt okuma, 2026-09-29 ~17:45 TR): pricing_rule toplam 1 satır; koşula uyup tekrar eden grup 0;
-- ürünsüz sabit kural 0; çakışan indeks yok (pkey, tenant_scope, product, brand, category).
--
-- ⭐ÜÇ ADIMLI YAPI (INV-MIGRATION-3: squawk `require-concurrent-index-creation` düz CREATE UNIQUE INDEX'e KIRMIZI verir;
-- ölçüldü, sabit squawk 2.65.0 + depodaki .squawk.toml). Emsal: 20260916132052_arama_pgroonga_tek_govde.sql.
--   A) işlem: zaman aşımları + ön doğrulama (ihlal varsa hiçbir şey yapmadan düşer)
--   B) işlem DIŞI: geçersiz kalmış eski indeks varsa düşür, sonra CREATE UNIQUE INDEX CONCURRENTLY
--   C) işlem: son doğrulama (indeks var, tekil, kısmi ve GEÇERLİ)
-- CONCURRENTLY yarıda kalırsa GEÇERSİZ indeks bırakır ve `if not exists` onu "var" sayıp atlar; bu yüzden B'nin başında
-- geçersiz olan düşürülür, C ayrıca `indisvalid` ölçer. Tablo 1 satır: kurulum milisaniyelerdir.
--
-- GERİ ALMA (tek satır, veri kaybı yok):
--   drop index if exists public.pricing_rule_urun_tek_sabit_uq;
set lock_timeout = '5s';
set statement_timeout = '30s';

begin;

-- A) Ön-guard: mevcut veri kısıtı ihlal ediyor mu? Ediyorsa indeks canlıda patlar; anlaşılır hatayla hiç başlamaz.
do $$
declare v_bad int;
begin
  select count(*) into v_bad from (
    select tenant_id, product_id
      from public.pricing_rule
     where scope = 1 and method = 'fixed' and price_book_id is null and min_quantity = 1
       and currency is null and valid_from is null and valid_to is null
     group by tenant_id, product_id
    having count(*) > 1
  ) t;
  if v_bad <> 0 then
    raise exception 'pricing_rule_urun_tek_sabit_uq iptal: % urunde birden fazla sabit kural var; once kural sayfasindan temizle', v_bad;
  end if;
end $$;

commit;

-- B) İNDEKS — CONCURRENTLY, işlem DIŞINDA.
do $$
begin
  if exists (select 1 from pg_index x join pg_class c on c.oid = x.indexrelid
              join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relname = 'pricing_rule_urun_tek_sabit_uq' and not x.indisvalid) then
    drop index public.pricing_rule_urun_tek_sabit_uq;
    raise notice 'GEÇERSİZ indeks düşürüldü, yeniden kurulacak: pricing_rule_urun_tek_sabit_uq';
  end if;
end $$;

create unique index concurrently if not exists pricing_rule_urun_tek_sabit_uq
  on public.pricing_rule (tenant_id, product_id)
  where scope = 1 and method = 'fixed' and price_book_id is null and min_quantity = 1
    and currency is null and valid_from is null and valid_to is null;

-- C) Son-guard + açıklama.
begin;

comment on index public.pricing_rule_urun_tek_sabit_uq is
  'REC-412: urun basina TEK sabit fiyat kurali (scope 1, fixed, tum kitaplar, adet 1, para birimi ve gecerlilik penceresi bos). Ihlal = 23505; setProductFixedPrice ekleme dalinda yakalayip gunceller.';

do $$
begin
  if not exists (
    select 1
      from pg_index x
      join pg_class c on c.oid = x.indexrelid
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relname = 'pricing_rule_urun_tek_sabit_uq'
       and x.indisvalid and x.indisunique and x.indpred is not null
  ) then
    raise exception 'pricing_rule_urun_tek_sabit_uq olusmadi ya da gecersiz/tekil/kismi degil';
  end if;
end $$;

commit;
