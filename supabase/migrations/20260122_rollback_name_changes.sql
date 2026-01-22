-- ============================================================
-- ROLLBACK: Yanlış İsim Değişikliklerini Geri Al
-- ============================================================

BEGIN;

-- Nicotra Gebhardt ismini geri al (EC Motor YANLIŞ - farklı fan tipleri var)
UPDATE categories 
SET name = 'Nicotra Gebhardt Fanlar', 
    slug = 'nicotra-gebhardt-fanlar',
    description = 'Nicotra Gebhardt marka endüstriyel fan çözümleri'
WHERE slug = 'ec-motor-fanlar';

-- DANFOSS ismini geri al
UPDATE categories 
SET name = 'DANFOSS', 
    slug = 'danfoss',
    description = 'Danfoss marka frekans konvertör ve hız kontrol cihazları'
WHERE slug = 'frekans-konvertorler';

-- Doğrulama
DO $$
BEGIN
    RAISE NOTICE 'İsim değişiklikleri geri alındı.';
END $$;

COMMIT;
