-- =============================================================================
-- KATEGORİ KALINTI TEMİZLİĞİ — boş/ikiz kayıtlar pasifleştirilir
--
-- KAYNAK/CETVEL
--   Cetvel       : docs/standards/category-taxonomy-standard.md
--   Önceki adım  : supabase/migrations/20260827120000_katalog_omurgasi.sql
--   Karar        : Recep, 2026-08-30 — "jet fan gereksiz oldu yani, cam pencere de"
--   Ölçüm tazeliği: canlı DB, 2026-08-30 — 37 kategori / 6 aktif ana / 18 aktif alt
--   Linear       : REC-89 · Şerit: ÜRÜN
--
-- NİÇİN VAR: 08-27 omurga migration'ı §2.7'de 'bathroom-toilet-fans' ve
-- 'window-fans' kayıtlarını ÇİFT olarak Residential'dan Fanlar'a taşıdı. Banyo'nun
-- 31 ürünü vardı, Cam-Pencere'nin SIFIR. Aynı migration'ın §8'i boş kategorileri
-- pasifleştiriyordu ama bu kayıt "çift"in parçası olduğu için o listeye hiç
-- bakılmadı. §9 son denetimi de yalnız SAYIYI (19 alt kategori) doğruladığı için
-- 19'dan birinin boş olduğunu göremedi — sayı tutuyordu.
--
-- KALDIRMANIN GÜVENLİ OLDUĞU ÜÇ AYRI KAYNAKTAN ÖLÇÜLDÜ (2026-08-30):
--   1) Canlı DB      : window-fans → 0 ürün, 0 seri, 0 alt kategori
--   2) Kaynak CSV'ler: 28 dosya / 374 satır → 'cam|pencere|window' geçen 0 satır
--   3) Avensair 2026 : fiyat listesinin 31 bölümünde böyle bir bölüm YOK
--   Yani bu kategoriye ait ürün hiç var olmadı; sahipsiz kalacak kayıt yok.
--
-- GERİ ALINABİLİRLİK: hiçbir kayıt SİLİNMEZ. is_active=false yeterlidir —
-- ürün girildiği gün tek satırla geri açılır.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) ÖN KOŞUL — pasifleştireceğimiz kayıtlar GERÇEKTEN boş mu?
--    Veri arada değiştiyse burada gürültüyle durur; sessizce ürün gömmez.
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n
  FROM products p JOIN categories c ON c.id IN (p.category_id, p.subcategory_id)
  WHERE c.slug IN ('window-fans', 'jet-fans') AND p.deleted_at IS NULL;
  IF n <> 0 THEN RAISE EXCEPTION 'ÖN KOŞUL: bu kategorilerde 0 ürün bekleniyordu, % bulundu — DUR, ölçümü yenile.', n; END IF;

  SELECT count(*) INTO n
  FROM product_families f JOIN categories c ON c.id IN (f.category_id, f.subcategory_id)
  WHERE c.slug IN ('window-fans', 'jet-fans') AND f.deleted_at IS NULL;
  IF n <> 0 THEN RAISE EXCEPTION 'ÖN KOŞUL: bu kategorilerde 0 seri bekleniyordu, % bulundu — DUR.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE parent_id IN (SELECT id FROM categories WHERE slug IN ('window-fans','jet-fans'));
  IF n <> 0 THEN RAISE EXCEPTION 'ÖN KOŞUL: alt kategori bekleniyordu 0, % bulundu — DUR.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE is_active AND parent_id IS NOT NULL;
  IF n <> 18 THEN RAISE EXCEPTION 'ÖN KOŞUL: 18 aktif alt kategori bekleniyordu, % bulundu — taban bayat.', n; END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1) window-fans — "Cam ve Pencere Tipi Fanlar" pasifleşir
--    Mart 2026 tohumundan kalma, hiç dolmadı. Menüde ve sitemap'te ZATEN yoktu
--    (2026-08-30 canlı ölçüm: ana sayfada 0 link, sitemap 192 adreste 0 kayıt);
--    yalnız doğrudan adresi yazan biri boş sayfa görüyordu. Bu satır o boş
--    sayfayı da kapatır.
-- -----------------------------------------------------------------------------
UPDATE categories SET is_active = false, updated_at = now()
WHERE slug = 'window-fans';

-- -----------------------------------------------------------------------------
-- 2) jet-fans — ikiz kayıt; ADI kendi adı olur
--    Kayıt zaten pasif. Sorun şu: adı 'Jet Fans' ama menu_label'ı DİĞER kaydın
--    adını ('Otopark Jet Fanları') taşıyor. Bugün görünmüyor, ama biri ileride
--    yanlışlıkla aktifleştirirse menüde YANLIŞ ad çıkar. Etiket kendi adına
--    çekilir; kayıt silinmez (geri alınabilirlik ilkesi).
--    Otopark jet fanının SAHİBİ kayıt 'parking-jet-fan' — bu değil.
-- -----------------------------------------------------------------------------
UPDATE categories SET menu_label = name, updated_at = now()
WHERE slug = 'jet-fans' AND menu_label IS DISTINCT FROM name;

-- -----------------------------------------------------------------------------
-- 3) parking-jet-fan — DOKUNULMUYOR, bilerek
--    Recep 2026-08-30 teyidi: doğru kayıt bu; katalogda açıklaması var ama SKU'lu
--    ürünü yok. 27-08 akşamı (20:26) zaten pasifleştirilmiş. Ürün girildiği gün
--    is_active=true yapılacak kayıt BUDUR — o yüzden yaşıyor.
--    (Bu blok kasten boş; "unutuldu mu" sorusunu ortadan kaldırmak için yazıldı.)
-- -----------------------------------------------------------------------------

-- =============================================================================
-- 4) SON DENETİM — beklenen sonuç tutmuyorsa migration BAŞARISIZ olur
-- =============================================================================
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM categories WHERE is_active AND parent_id IS NOT NULL;
  IF n <> 17 THEN RAISE EXCEPTION 'SONUÇ: 17 aktif alt kategori bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE is_active AND parent_id IS NULL;
  IF n <> 6 THEN RAISE EXCEPTION 'SONUÇ: 6 aktif ana kategori bekleniyordu, % bulundu.', n; END IF;

  -- ⭐ SAYI TEK BAŞINA KANIT DEĞİL (08-27 dersi): aktif kategorilerin İÇİ de dolu mu?
  SELECT count(*) INTO n
  FROM categories c
  WHERE c.is_active AND c.parent_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM product_families f WHERE f.subcategory_id = c.id AND f.deleted_at IS NULL)
    AND NOT EXISTS (SELECT 1 FROM products p WHERE p.subcategory_id = c.id AND p.deleted_at IS NULL);
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: aktif ama BOŞ alt kategori kalmamalıydı, % kaldı.', n; END IF;

  -- Kimse kaybolmadı: toplam kayıt sayısı sabit (silme yok)
  SELECT count(*) INTO n FROM categories;
  IF n <> 37 THEN RAISE EXCEPTION 'SONUÇ: 37 kategori kaydı bekleniyordu, % bulundu — SİLME olmuş.', n; END IF;

  -- Ürün sayısı değişmedi
  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> 375 THEN RAISE EXCEPTION 'SONUÇ: 375 ürün bekleniyordu, % bulundu.', n; END IF;
END $$;
