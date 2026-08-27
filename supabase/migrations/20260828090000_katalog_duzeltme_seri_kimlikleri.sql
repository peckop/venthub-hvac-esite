-- =============================================================================
-- KATALOG DÜZELTMESİ — seri kimlikleri (REC-56 devamı)
--
-- KAYNAK/CETVEL
--   Cetvel        : docs/standards/category-taxonomy-standard.md
--                   docs/standards/product-schema-standard.md
--   Ölçüm tazeliği: canlı prod DB, 2026-08-28 (20260827120000 uygulandıktan SONRA)
--   Linear        : REC-56 · Şerit: ÜRÜN
--   Tetikleyen    : Recep'in canlı vitrin incelemesi — üç ayrı bulgu, üçü de doğrulandı.
--
-- NİÇİN VAR — bir önceki migration'ın ÜÇ hatasını onarır. Hepsi BENİM kararımdı:
--
--   1) JET serisini "Otopark Jet Fanları" alt kategorisine koydum. Ölçüm gösterdi ki
--      o kategoride BAŞKA HİÇBİR ŞEY YOK ve 21 JET modelinin tamamı asit dayanımlı
--      AVenS hattından (SKU öneki SEA-712…, 7'si ATEX). Yani asit dayanımlı üçlü
--      (SEAT 40 · STORM 20 · JET 21) vitrin ağacında ikiye bölünmüş oldu ve JET'in
--      asit dayanımı görünmez hâle geldi. "Otopark" bir kullanım alanıdır, kategori
--      değil — kategori ekseni ÜRÜN TİPİ (onaylanan omurga kararı).
--
--   2) Vortice Lineo'nun İKİ ayrı ticari hattını (düz + Quiet) tek seride birleştirdim
--      ve adından "Quiet" kimliğini düşürdüm. Ölçüm: 19 üründen 12'si Quiet (6 Quiet +
--      6 Quiet ES), 6'sı düz. Sessiz seri ayrı bir satış argümanıdır; birleştirme onu
--      yok etti ve CategoryLandingView'daki sessiz-fan anlatısının bağlanacağı yer
--      kalmadı (REC-85).
--
--   3) SEAT serisi bölündü ama SLUG'I bölünme öncesinden kaldı: adı "SEAT Serisi",
--      adresi `seat-storm-jet`. Ad ile adres birbirini yalanlıyor.
--
-- ⚠ SLUG SEÇİMİ BİLİNÇLİ: `vortice-lineo-quiet` slug'ı QUIET serisinde KALIR.
--   Ölçüldü — o slug ana sayfa vitrin karuselinde kullanılıyor
--   (src/components/home/HomeSinevizyon.tsx, 10 atıf). Slug'ı düz hatta verseydik
--   karusel sessiz seri yerine düz seriyi gösterirdi. Yeni slug DÜZ hatta verilir.
--
-- ⚠ GERİ ALINABİLİRLİK: hiçbir ürün ve hiçbir kategori SİLİNMEZ. `parking-jet-fan`
--   yalnız `is_active=false` olur; kararı geri almak tek UPDATE'tir.
--
-- ⚠ VRT-17143 "Vortice Lineo 100 Q" — ÜRETİCİ KATALOĞUNDAN DOĞRULANDI, DÜZ HAT.
--   Şüphe: adında "Quiet" geçmiyor ama "Q" var; düz hattın 100'ü ayrı bir SKU (VRT-17144).
--   SKU'larımız Vortice ürün kodlarıyla birebir aynı (17160 = LINEO 100 QUIET,
--   17170 = LINEO 100 QUIET ES), bu yüzden 17143 doğrudan üreticide sorgulandı:
--     · vortice.com/en/mixed-flow-fans/in-line/17143 → "LINEO 100 Q", endüksiyon motor,
--       gövdede ses yutucu kaplama YOK. Quiet hattının tanımlayıcı özelliği tam da o
--       kaplamadır ("casing integrating a sound-absorbing coating").
--     · Distribütör kataloğu da hattı ayırıyor: .../lineo-range/lineo/lineo-100-q/
--       (düz Lineo) — Quiet modelleri .../lineo-range/lineo-quiet/ altında.
--   SONUÇ: "Q" burada "Quiet" demek DEĞİL. Mekanik kural (ad "Quiet" içermiyor → düz hat)
--   üreticinin sınıflandırmasıyla ÖRTÜŞÜYOR; §3.4 kapalı kalır.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) ÖN KOŞUL — ölçtüğüm tabanla aynı veri üzerinde miyiz?
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE f.slug = 'jet-serisi' AND p.deleted_at IS NULL;
  IF n <> 21 THEN RAISE EXCEPTION 'ÖN KOŞUL: jet-serisi 21 model bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE f.slug = 'vortice-lineo-quiet' AND p.deleted_at IS NULL;
  IF n <> 19 THEN RAISE EXCEPTION 'ÖN KOŞUL: Lineo hattı 19 model bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE f.slug = 'vortice-lineo-quiet' AND p.deleted_at IS NULL AND p.name ILIKE '%Quiet%';
  IF n <> 12 THEN RAISE EXCEPTION 'ÖN KOŞUL: 12 Quiet model bekleniyordu, % bulundu — ad kalıbı değişmiş.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE slug = 'acid-resistant-fans' AND COALESCE(is_active, true);
  IF n <> 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: acid-resistant-fans aktif kategorisi yok.'; END IF;

  SELECT count(*) INTO n FROM product_families WHERE slug = 'seat-storm-jet';
  IF n <> 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: seat-storm-jet serisi bulunamadı — slug zaten değişmiş olabilir.'; END IF;

  SELECT count(DISTINCT tenant_id) INTO n FROM categories;
  IF n <> 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: tek tenant bekleniyordu, % bulundu.', n; END IF;
END $$;

-- =============================================================================
-- 1) JET SERİSİ — asit dayanımlı üçlü yeniden bir araya
-- =============================================================================
UPDATE product_families f SET
  subcategory_id = (SELECT id FROM categories WHERE slug = 'acid-resistant-fans'),
  category_id    = (SELECT id FROM categories WHERE slug = 'fans'),
  updated_at     = now()
WHERE f.slug = 'jet-serisi';

-- =============================================================================
-- 2) "Otopark Jet Fanları" — içi boşaldı, PASİFE alınır (silinmez)
--    Not: kullanım alanı olarak geri açılabilir; o gün is_active=true yeter.
-- =============================================================================
UPDATE categories SET is_active = false, updated_at = now()
WHERE slug = 'parking-jet-fan'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE subcategory_id = categories.id);

-- =============================================================================
-- 3) VORTICE LINEO — tek seri İKİ seriye ayrılır
-- =============================================================================

-- 3.1 Mevcut seri QUIET serisi olur (slug korunur — karusel bağı).
UPDATE product_families SET
  name = 'Vortice Lineo Quiet Sessiz Kanal Fanları', updated_at = now()
WHERE slug = 'vortice-lineo-quiet';

-- 3.2 DÜZ hat için yeni seri (marka ve tenant mevcut seriden alınır).
INSERT INTO product_families (name, slug, brand_id, model_code, metadata, tenant_id)
SELECT 'Vortice Lineo Kanal Fanları', 'vortice-lineo', f.brand_id, 'LINEO', '{}'::jsonb, f.tenant_id
FROM product_families f
WHERE f.slug = 'vortice-lineo-quiet'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'vortice-lineo');

-- 3.3 Adında "Quiet" GEÇMEYEN modeller düz hatta taşınır.
--     VRT-17143 ("Lineo 100 Q") bu kuralla DÜZ hatta gider — bkz. başlıktaki karar notu.
UPDATE products p SET
  family_id = (SELECT id FROM product_families WHERE slug = 'vortice-lineo'),
  updated_at = now()
FROM product_families f
WHERE f.id = p.family_id
  AND f.slug = 'vortice-lineo-quiet'
  AND p.deleted_at IS NULL
  AND p.name NOT ILIKE '%Quiet%';

-- 3.4 ⚠ RECEP KARARINA BAĞLI — "Lineo 100 Q" aslında Quiet ise bu bloğun yorumu kaldırılır.
--     Tek satır, başka hiçbir yeri etkilemez.
-- UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'vortice-lineo-quiet'),
--        updated_at = now()
--  WHERE sku = 'VRT-17143';

-- 3.5 Yeni düz seri, Quiet serisiyle AYNI kategori kademesine bağlanır.
UPDATE product_families d SET
  category_id    = q.category_id,
  subcategory_id = q.subcategory_id,
  updated_at     = now()
FROM product_families q
WHERE d.slug = 'vortice-lineo' AND q.slug = 'vortice-lineo-quiet';

-- =============================================================================
-- 4) SEAT SERİSİ — adı ile adresi uyuşsun
-- =============================================================================
UPDATE product_families SET slug = 'seat-serisi', updated_at = now()
WHERE slug = 'seat-storm-jet';

-- =============================================================================
-- 5) ÜRÜN KATEGORİSİ SERİDEN TÜRETİLİR (tek kaynak kuralı)
-- =============================================================================
UPDATE products p SET
  category_id    = f.category_id,
  subcategory_id = f.subcategory_id,
  updated_at     = now()
FROM product_families f
WHERE f.id = p.family_id
  AND p.deleted_at IS NULL
  AND (p.category_id IS DISTINCT FROM f.category_id
    OR p.subcategory_id IS DISTINCT FROM f.subcategory_id);

-- =============================================================================
-- 6) SON DENETİM — beklenen sonuç gerçekleşti mi? Gerçekleşmediyse GERİ AL.
-- =============================================================================
DO $$
DECLARE n int;
BEGIN
  -- Asit dayanımlı üçlü bir arada ve tamam: 40 + 20 + 21 = 81
  SELECT count(*) INTO n FROM products p
    JOIN product_families f ON f.id = p.family_id
    JOIN categories c ON c.id = f.subcategory_id
   WHERE c.slug = 'acid-resistant-fans' AND p.deleted_at IS NULL;
  IF n <> 81 THEN RAISE EXCEPTION 'SONUÇ: asit dayanımlı altında 81 model bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM product_families WHERE slug IN ('seat-serisi','storm-serisi','jet-serisi')
     AND subcategory_id = (SELECT id FROM categories WHERE slug = 'acid-resistant-fans');
  IF n <> 3 THEN RAISE EXCEPTION 'SONUÇ: üç serinin üçü de asit dayanımlı altında olmalıydı, % bulundu.', n; END IF;

  -- Lineo ikiye ayrıldı ve toplam korundu
  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE f.slug = 'vortice-lineo-quiet' AND p.deleted_at IS NULL;
  IF n <> 12 THEN RAISE EXCEPTION 'SONUÇ: Quiet serisinde 12 model bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE f.slug = 'vortice-lineo' AND p.deleted_at IS NULL;
  IF n <> 7 THEN RAISE EXCEPTION 'SONUÇ: düz Lineo serisinde 7 model bekleniyordu, % bulundu.', n; END IF;

  -- Eski slug gitti, yenisi geldi
  SELECT count(*) INTO n FROM product_families WHERE slug = 'seat-storm-jet';
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: seat-storm-jet slug''ı hâlâ duruyor.'; END IF;

  -- Hiçbir ürün kaybolmadı
  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> 375 THEN RAISE EXCEPTION 'SONUÇ: 375 aktif ürün bekleniyordu, % bulundu — ürün kaybı!', n; END IF;

  -- Ürün kategorisi seriden türetilmiş durumda
  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id
   WHERE p.deleted_at IS NULL
     AND (p.category_id IS DISTINCT FROM f.category_id OR p.subcategory_id IS DISTINCT FROM f.subcategory_id);
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: % üründe kategori seriden türetilmemiş.', n; END IF;
END $$;
