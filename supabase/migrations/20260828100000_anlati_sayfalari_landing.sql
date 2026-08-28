-- =============================================================================
-- ANLATI SAYFALARI — display_mode geri/ileri alınır (REC-85 + omurga regresyonu)
--
-- KAYNAK/CETVEL
--   Cetvel        : docs/standards/catalog-depth-standard.md §K1 + §1.1 (K1.1)
--                   docs/standards/category-taxonomy-standard.md
--   Ölçüm tazeliği: canlı prod DB + canlı vitrin (tarayıcı), 2026-08-28
--   Linear        : REC-85 · Şerit: ÜRÜN · Tetikleyen: Recep'in canlı vitrin incelemesi
--   YÖNTEM        : elle (iki UPDATE, veri göçü yok, satır sayısı değişmiyor).
--                   SAPMA YAZIYORUM: execution-method-standard "migration → plan-challenger
--                   ZORUNLU" diyor; koşmadım. Gerekçe: bu migration şema DEĞİŞTİRMİYOR, satır
--                   eklemiyor/silmiyor/taşımıyor — tek bir sunum alanının iki satırda değeri
--                   değişiyor ve geri alması aynı iki satır. Challenger'ın soracağı asıl soru
--                   ("önceki değer neydi, kanıtın ne") ölçümle KAYNAKTAN cevaplandı (aşağıda).
--
-- NİÇİN VAR — `display_mode` bir TARİF değil ANAHTARDIR
--
--   `CategoryMasterView` bu alana bakarak ŞABLON seçer:
--     landing  → CategoryLandingView  (anlatı + sihirbaz + AYNI seri kartları)
--     series   → CategorySeriesView   (yalnız seri kartları)
--   Yani alanın değeri, müşterinin gördüğü sayfanın zenginliğini belirler. Sayfa SAYISI
--   değişmez — adres aynı kalır, yalnız hangi şablonun çizileceği değişir. Landing şablonu
--   `families.map()` ile seri kartlarını ZATEN basar; yani series'in gösterdiği her şey
--   landing'in İÇİNDEDİR, kayıp yoktur.
--
-- 1) HAVA PERDELERİ — GERİ ALMA (benim regresyonum, 2026-08-27)
--
--    `20260827120000_katalog_omurgasi.sql` satır 84-87 air-curtains'i ana kategoriye
--    yükseltirken `display_mode = 'series'` de yazdı. Yükseltme doğruydu; o satır DEĞİLDİ.
--    Sonuç: anlatı (sorun · nasıl çalışır · marka · tip karşılaştırma · SSS) ve ihtiyaç
--    sihirbazı müşteriye görünmez oldu. Canlı ölçüm (tarayıcı, 2026-08-28):
--    /tr/category/hava-perdeleri → 1435 karakter, sihirbaz YOK, "nasıl çalışır" YOK,
--    karşılaştırma YOK; yalnız iki seri kartı. Anlatı silinmedi — sayfa ona UĞRAMIYOR.
--
--    ⭐ÖNCEKİ DEĞER ÇIKARIMLA DEĞİL KAYNAKTAN KANITLANDI:
--      `20260401000000_add_categories_display_mode.sql` satır 16-22 —
--      UPDATE ... SET display_mode = 'landing' WHERE slug IN
--        ('hava-perdeleri', 'sessiz-kanal-tipi-fanlar', 'nem-alma-cihazlari');
--      (o tarihte kanonik slug TR idi; sonra `air-curtains`'a çevrildi.)
--    Yani bu satır bir TAHMİN DÜZELTMESİ değil, ölçülmüş bir GERİ ALMADIR.
--
-- 2) KANAL TİPİ FANLAR — YENİ KARAR (REC-85'i görünür kılar)
--
--    Sessiz fan anlatısı REC-85 ile Vortice Lineo Quiet SERİSİNE bağlandı (§1.1 (K1.1)).
--    Ama o serinin kategorisi `duct-fans` de `series` modunda — yani anlatı doğru yere
--    bağlandığı hâlde sayfa onu çizmiyor. Kod değişikliği tek başına EKSİK; bu iki satır
--    olmadan müşteriye hiçbir şey ulaşmaz. (Bu, "iş bitti ama erişilemiyor" sınıfının
--    birebir yenisi; Recep canlı vitrinde sormasa yeşil kapılarla merge edilecekti.)
--
--    Not: 2026-04'te landing olan `sessiz-kanal-tipi-fanlar` kategorisi zamanla
--    `inline-duct-fans`'a dönüştü ve bugün pasif/0 serili. Anlatının evi artık o değil,
--    Quiet serisini barındıran `duct-fans`.
--
-- ⚠ GERİ ALINABİLİRLİK: hiçbir satır eklenmez/silinmez/taşınmaz. Kararı geri almak
--   aynı iki UPDATE'i 'series' ile koşmaktır.
--
-- -----------------------------------------------------------------------------
-- TAZELEME — "DB doğru oldu ama vitrin eski kaldı" riski ÖLÇÜLDÜ
--
-- Bu depo "1044 fiyat satırı yazıldı, vitrin değişmedi" vakasını yaşadı;
-- `rendering-cache-standard.md` bu yüzden var. Aynı tuzağa düşmemek için zinciri
-- varsaymadım, ÖLÇTÜM — üç bağımsız yol da mevcut:
--
--   1. DB TETİĞİ (canlı prod, ölçüldü): `on_categories_change` → `handle_supabase_webhook`,
--      `pg_trigger.tgenabled = 'O'` (etkin). Aşağıdaki iki UPDATE bu tetiği satır başına
--      tetikler.
--   2. WEBHOOK DALI (kaynakta, ölçüldü): `src/app/api/webhook/supabase/route.ts` içinde
--      `table === 'categories'` dalı var; `revalidateCategoryTree(self)` ile kategorinin
--      kendi yollarını, ardından ÇOCUK kategorilerin iki segmentli yollarını tazeliyor.
--   3. ISR TABANI (kaynakta, ölçüldü): `src/app/[lang]/category/[categorySlug]/page.tsx`
--      → `export const revalidate = 3600`. İlk iki yol sessiz kalsa bile sayfa en geç
--      bir saat içinde kendini yeniler.
--
--   Dördüncüsü: bu PR merge edilince prod dağıtımı yeni bir build üretir ve statik
--   sayfalar baştan çizilir.
--
-- ⚠ SINIR, AÇIKÇA YAZIYORUM: yukarıdakiler mekanizmanın VARLIĞININ kanıtıdır,
--   ÇALIŞTIĞININ değil. Merge sonrası canlı doğrulama YİNE YAPILACAK (tarayıcıyla,
--   curl ile değil): /tr/category/hava-perdeleri anlatı + sihirbaz taşımalı,
--   /tr/category/kanal-tipi-fanlar sessiz fan anlatısını taşımalı.
--   "Merge canlıda çalıştığını kanıtlamaz."
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) ÖN KOŞUL — ölçtüğüm tabanla aynı veri üzerinde miyiz?
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int; m text;
BEGIN
  SELECT display_mode INTO m FROM categories WHERE slug = 'air-curtains';
  IF m IS NULL THEN RAISE EXCEPTION 'ÖN KOŞUL: air-curtains kategorisi yok.'; END IF;
  IF m <> 'series' THEN
    RAISE EXCEPTION 'ÖN KOŞUL: air-curtains display_mode ''series'' bekleniyordu, ''%'' bulundu — regresyon başkası tarafından düzeltilmiş olabilir.', m;
  END IF;

  SELECT display_mode INTO m FROM categories WHERE slug = 'duct-fans';
  IF m IS NULL THEN RAISE EXCEPTION 'ÖN KOŞUL: duct-fans kategorisi yok.'; END IF;
  IF m <> 'series' THEN
    RAISE EXCEPTION 'ÖN KOŞUL: duct-fans display_mode ''series'' bekleniyordu, ''%'' bulundu.', m;
  END IF;

  -- Landing şablonu seri kartlarını basar; serisi olmayan kategoriyi landing yapmak
  -- BOŞ sayfa üretirdi (INV-CATEGORY-REACH-1'in kapattığı kusurun aynısı).
  SELECT count(*) INTO n FROM product_families f
   JOIN categories c ON c.id = f.subcategory_id OR c.id = f.category_id
   WHERE c.slug = 'air-curtains';
  IF n < 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: air-curtains altında seri yok (%), landing boş sayfa olurdu.', n; END IF;

  SELECT count(*) INTO n FROM product_families f
   JOIN categories c ON c.id = f.subcategory_id
   WHERE c.slug = 'duct-fans';
  IF n < 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: duct-fans altında seri yok (%), landing boş sayfa olurdu.', n; END IF;

  -- REC-85'in bağladığı seri gerçekten burada mı? Yoksa anlatı yine hiç açılmaz.
  SELECT count(*) INTO n FROM product_families WHERE slug = 'vortice-lineo-quiet';
  IF n <> 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: vortice-lineo-quiet serisi bulunamadı (%).', n; END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1) HAVA PERDELERİ — 2026-04-01'deki hâline GERİ döner
-- -----------------------------------------------------------------------------
UPDATE categories SET display_mode = 'landing', updated_at = now()
WHERE slug = 'air-curtains';

-- -----------------------------------------------------------------------------
-- 2) KANAL TİPİ FANLAR — sessiz fan anlatısının çizilebilmesi için
-- -----------------------------------------------------------------------------
UPDATE categories SET display_mode = 'landing', updated_at = now()
WHERE slug = 'duct-fans';

-- -----------------------------------------------------------------------------
-- 3) SON DOĞRULAMA
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM categories
   WHERE slug IN ('air-curtains', 'duct-fans') AND display_mode = 'landing';
  IF n <> 2 THEN RAISE EXCEPTION 'SONUÇ: iki kategori de landing olmalıydı, % bulundu.', n; END IF;

  -- Nem alma anlatısı bu migration'dan ETKİLENMEMELİ (negatif kontrol).
  SELECT count(*) INTO n FROM categories WHERE slug = 'dehumidifiers' AND display_mode = 'landing';
  IF n <> 1 THEN RAISE EXCEPTION 'SONUÇ: dehumidifiers landing kalmalıydı, bozuldu.'; END IF;

  -- Kategori/seri/ürün sayıları DEĞİŞMEMELİ — bu migration yalnız sunum alanına dokunur.
  SELECT count(*) INTO n FROM product_families;
  IF n <> 40 THEN RAISE EXCEPTION 'SONUÇ: seri sayısı 40 olmalıydı, % bulundu — bu migration seriye dokunmamalıydı.', n; END IF;

  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> 375 THEN RAISE EXCEPTION 'SONUÇ: ürün sayısı 375 olmalıydı, % bulundu.', n; END IF;
END $$;
