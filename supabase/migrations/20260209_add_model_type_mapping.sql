-- ============================================================
-- 3D MODEL EŞLEŞTİRMELERİNİ EKLE - 2026-02-09
-- ============================================================
-- Bu migration, categories.metadata içine model_type ekler
-- Böylece 3D model-ürün eşleştirmesi kalıcı hale gelir

BEGIN;

-- ============================================================
-- FANLAR ALT KATEGORİLERİ - MODEL EŞLEŞTİRMELERİ
-- ============================================================

-- Duvar Tipi Kompakt Aksiyal Fanlar → SquarePlateFanModel (Turuncu pervaneli kare plaka)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"SquarePlateFanModel"'
) WHERE slug = 'duvar-tipi-kompakt-aksiyal-fanlar';

-- Basınçlandırma Fanları → AxialFanModel (Siyah silindirik, kırmızı göbek)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"AxialFanModel"'
) WHERE slug = 'basinclandirma-fanlari';

-- Çatı Tipi Fanlar → RoofFanModel (Galvaniz kare kasa, şapkalı)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"RoofFanModel"'
) WHERE slug = 'cati-tipi-fanlar';

-- Duman Egzoz Fanları → SmokeExhaustFanModel (Ağır hizmet, uzun kanatlar)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"SmokeExhaustFanModel"'
) WHERE slug = 'duman-egzoz-fanlari';

-- Endüstriyel Fanlar → SnailFanModel (Salyangoz, ex-proof)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"SnailFanModel"'
) WHERE slug = 'endustriyel-fanlar';

-- Kanal Tipi Fanlar → DuctFanModel (Yuvarlak kanal)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"DuctFanModel"'
) WHERE slug = 'kanal-tipi-fanlar';

-- Konut Tipi Fanlar → DomesticFanModel (Kare beyaz panel, banyo tipi)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"DomesticFanModel"'
) WHERE slug = 'konut-tipi-fanlar';

-- Nicotra Gebhardt / EC Motor Fanlar → NicotraFanModel (Double inlet)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"NicotraFanModel"'
) WHERE slug IN ('nicotra-gebhardt-fanlar', 'ec-motor-fanlar');

-- Otopark Jet Fanları → JetFanModel (Silindirik jet)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"JetFanModel"'
) WHERE slug = 'otopark-jet-fanlari';

-- Plug Fanlar → PlugFanModel (Kasasız, sadece çark)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"PlugFanModel"'
) WHERE slug = 'plug-fanlar';

-- Santrifüj Fanlar → SnailFanModel (Salyangoz tipi)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"SnailFanModel"'
) WHERE slug = 'santrifuj-fanlar';

-- Sessiz Kanal Tipi Fanlar → SilentChannelFanModel (Yeşil/beyaz, sessiz)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"SilentChannelFanModel"'
) WHERE slug = 'sessiz-kanal-tipi-fanlar';

-- Sığınak Havalandırma Fanları → RectangularDuctFanModel (Dikdörtgen kanal)
UPDATE categories SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{model_type}',
    '"RectangularDuctFanModel"'
) WHERE slug = 'siginak-havalandirma-fanlari';

-- ============================================================
-- DOĞRULAMA
-- ============================================================

DO $$
DECLARE
    mapped_count INTEGER;
    fan_parent_id UUID;
BEGIN
    -- Fanlar kategorisinin ID'sini bul
    SELECT id INTO fan_parent_id FROM categories WHERE slug = 'fanlar';
    
    -- Model eşleştirmesi yapılan kategori sayısını say
    SELECT COUNT(*) INTO mapped_count 
    FROM categories 
    WHERE parent_id = fan_parent_id
    AND metadata->>'model_type' IS NOT NULL;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '3D Model Eşleştirme Özeti';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fanlar kategorisi ID: %', fan_parent_id;
    RAISE NOTICE 'Model eşleştirmesi yapılan kategori sayısı: %', mapped_count;
    RAISE NOTICE '========================================';
    
    -- Eşleştirmeleri listele
    RAISE NOTICE 'Eşleştirmeler:';
    FOR rec IN 
        SELECT slug, metadata->>'model_type' as model_type 
        FROM categories 
        WHERE parent_id = fan_parent_id
        AND metadata->>'model_type' IS NOT NULL
        ORDER BY slug
    LOOP
        RAISE NOTICE '  % → %', rec.slug, rec.model_type;
    END LOOP;
END $$;

COMMIT;
