-- Migration: Kategori-Ürün Veri Tutarlılığı Düzeltmesi
-- Tarih: 2026-02-03
-- Açıklama: 
--   1. Boş alt kategorileri sil
--   2. Ürünleri doğru alt kategorilere taşı

BEGIN;

-- ============================================
-- AŞAMA 1: Ürünleri Doğru Alt Kategorilere Taşı
-- ============================================

-- Plastik Kelepçe ürünlerini "Plastik Kelepçeler" alt kategorisine taşı
UPDATE products 
SET category_id = '8195387b-2bf5-4576-935a-0293ea0b0f34'  -- Plastik Kelepçeler
WHERE name ILIKE 'Plastik Kelepçe%'
  AND category_id != '8195387b-2bf5-4576-935a-0293ea0b0f34';

-- Alüminyum Folyo Bant ürünlerini "Alüminyum Folyo Bantlar" alt kategorisine taşı  
UPDATE products 
SET category_id = '591c0ea4-5e24-4214-b9fb-ed32d741cdd7'  -- Alüminyum Folyo Bantlar
WHERE name ILIKE 'Alüminyum Folyo Bant%'
  AND category_id != '591c0ea4-5e24-4214-b9fb-ed32d741cdd7';

-- Hız Anahtarı ürünlerini "Hız Anahtarı" alt kategorisine taşı
UPDATE products 
SET category_id = '882982be-e355-4ccb-aea9-b5480b0fadf3'  -- Hız Anahtarı
WHERE name ILIKE 'Hız Anahtarı%'
  AND category_id != '882982be-e355-4ccb-aea9-b5480b0fadf3';

-- ============================================
-- AŞAMA 2: Boş Alt Kategorileri Sil
-- ============================================

-- Hava Temizleyiciler altındaki 4 boş alt kategori
DELETE FROM categories WHERE id = 'ca83b3d1-9958-461b-acbb-4196cdeda9b0';  -- Depuro Pro
DELETE FROM categories WHERE id = '79e6a033-cfc2-4417-b5a6-20224e64b6fe';  -- S&G Dispenser
DELETE FROM categories WHERE id = '515c15b9-e7a4-4a1c-b704-e2c3928c1be5';  -- Uv Logika
DELETE FROM categories WHERE id = '626113e0-927f-4d25-9678-5f259fc3f49c';  -- Vort Super Dry

-- Diğer boş alt kategoriler (ürün eklenmeyecekler)
DELETE FROM categories WHERE id = 'bce93862-5402-4850-96ae-1f4fdd5656e3';  -- Bağlantı Konnektörü
DELETE FROM categories WHERE id = 'f1023011-4390-42d3-bcc4-53510a43c93f';  -- Basınçlandırma Fanları
DELETE FROM categories WHERE id = '4a801860-24f3-4d02-8a1b-7e547f2be73e';  -- Ex-Proof Fanlar
DELETE FROM categories WHERE id = '44f69169-0075-4c29-ac05-d76f55f935a8';  -- Gemici Anemostadı
DELETE FROM categories WHERE id = 'f3a75c19-256a-44bb-a816-9379881f1346';  -- Konut Tipi Fanlar
DELETE FROM categories WHERE id = 'ff1bcb1f-9df2-443a-afe6-e8d261098d88';  -- Plug Fanlar
DELETE FROM categories WHERE id = '29af592c-b745-440a-80a1-1badec6ca91b';  -- Santrifüj Fanlar
DELETE FROM categories WHERE id = '0dd451bd-a4b7-4bab-9de6-338d7085e86b';  -- Ticari Tip

COMMIT;

-- ============================================
-- DOĞRULAMA SORGULARI
-- ============================================

-- Kalan kategorileri kontrol et
-- SELECT id, name, level, parent_id FROM categories ORDER BY level, name;

-- Boş alt kategorilerin kalmadığını doğrula
-- SELECT c.id, c.name, COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON p.category_id = c.id
-- WHERE c.level > 0
-- GROUP BY c.id, c.name
-- HAVING COUNT(p.id) = 0;
