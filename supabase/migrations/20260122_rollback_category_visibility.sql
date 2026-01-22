-- ============================================================
-- ROLLBACK: TÜM KATEGORİLERİ AKTİF YAP
-- ============================================================

BEGIN;

-- Tüm kategorileri tekrar aktif yap
UPDATE categories SET is_active = true WHERE is_active = false;

-- Doğrulama
DO $$
DECLARE
    active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_count FROM categories WHERE is_active = true;
    RAISE NOTICE 'Aktif kategori sayısı: %', active_count;
END $$;

COMMIT;
