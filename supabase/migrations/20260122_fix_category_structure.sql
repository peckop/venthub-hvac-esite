-- ============================================================
-- KATEGORI YAPISINI DÜZELTME - 2026-01-22
-- ============================================================
-- Bu migration şunları yapar:
-- 1. Marka adlı alt kategorileri fonksiyonel isimlere çevirir
-- 2. Boş kategorilere is_active = false ayarlar (gizler)
-- 3. Hava Temizleyiciler alt kategorilerini kaldırır
-- ============================================================

BEGIN;

-- ============================================================
-- 1. MARKA ALT KATEGORİLERİNİ YENİDEN ADLANDIR
-- ============================================================

-- Nicotra Gebhardt → EC Motor Fanlar (daha teknik ve doğru)
UPDATE categories
SET 
    name = 'EC Motor Fanlar',
    slug = 'ec-motor-fanlar',
    description = 'Yüksek verimli EC motor teknolojisine sahip enerji tasarruflu fanlar'
WHERE slug = 'nicotra-gebhardt-fanlar';

-- DANFOSS → Frekans Konvertörler (ürün tipi bazlı)
UPDATE categories
SET 
    name = 'Frekans Konvertörler',
    slug = 'frekans-konvertorler',
    description = 'VFD/Invertör tipi elektronik hız kontrol cihazları'
WHERE slug = 'danfoss';

-- ============================================================
-- 2. BOŞ KATEGORİLERİ GİZLE (is_active = false)
-- ============================================================

-- Önce is_active sütunu var mı kontrol et, yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Boş fan alt kategorilerini gizle
UPDATE categories SET is_active = false WHERE slug IN (
    'basinclandirma-fanlari',
    'konut-tipi-fanlar',
    'plug-fanlar',
    'santrifuj-fanlar'
);

-- Boş hız kontrolü alt kategorisini gizle
UPDATE categories SET is_active = false WHERE slug = 'hiz-anahtari';

-- Boş ısı geri kazanım alt kategorisini gizle
UPDATE categories SET is_active = false WHERE slug = 'ticari-tip-isi-geri-kazanim';

-- Boş aksesuarlar alt kategorilerini gizle
UPDATE categories SET is_active = false WHERE slug IN (
    'aluminyum-folyo-bantlar',
    'baglanti-konnektoru',
    'gemici-anemostadi',
    'plastik-kelepceler'
);

-- ============================================================
-- 3. HAVA TEMİZLEYİCİLER ALT KATEGORİLERİNİ GİZLE
-- ============================================================
-- Seri adları kategoriden kaldırılıyor, ürünler ana kategoriye taşınacak

UPDATE categories SET is_active = false WHERE slug IN (
    'depuro-pro',
    'sg-dispenser',
    'uv-logika',
    'vort-super-dry'
);

-- ============================================================
-- 4. DOĞRULAMA
-- ============================================================

-- Değişiklikleri doğrula
DO $$
DECLARE
    renamed_count INTEGER;
    hidden_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO renamed_count FROM categories 
    WHERE slug IN ('ec-motor-fanlar', 'frekans-konvertorler');
    
    SELECT COUNT(*) INTO hidden_count FROM categories 
    WHERE is_active = false;
    
    RAISE NOTICE 'Yeniden adlandırılan kategori sayısı: %', renamed_count;
    RAISE NOTICE 'Gizlenen kategori sayısı: %', hidden_count;
END $$;

COMMIT;
