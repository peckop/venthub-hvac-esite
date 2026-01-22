-- ============================================================
-- DANFOSS → Frekans Konvertörler (Doğru İsimlendirme)
-- ============================================================

BEGIN;

-- DANFOSS ismini Frekans Konvertörler olarak değiştir
UPDATE categories 
SET name = 'Frekans Konvertörler', 
    slug = 'frekans-konvertorler',
    description = 'VFD/Invertör tipi elektronik hız kontrol cihazları'
WHERE slug = 'danfoss';

COMMIT;
