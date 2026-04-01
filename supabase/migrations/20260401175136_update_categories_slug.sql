-- ============================================================
-- KATEGORI SLUG INGILIZCE GUNCELLEMESI (P04-016)
-- ============================================================
-- Bu migration tablodaki mevcut Turkce sluglari uluslararası
-- standardlara gecirmek icin cevirir. products tablosu UUID ile
-- category_id referansi kullandigindan Foreign Key'ler bozulmaz. 
-- ============================================================

BEGIN;

UPDATE categories SET slug = 'fans', name = 'Fans' WHERE slug = 'fanlar';
UPDATE categories SET slug = 'air-curtains', name = 'Air Curtains' WHERE slug = 'hava-perdeleri';
UPDATE categories SET slug = 'heat-recovery-units', name = 'Heat Recovery Units' WHERE slug = 'isi-geri-kazanim-cihazlari';
UPDATE categories SET slug = 'air-purifiers', name = 'Air Purifiers' WHERE slug = 'hava-temizleyiciler-anti-viral-urunler';
UPDATE categories SET slug = 'speed-controllers', name = 'Speed Controllers' WHERE slug = 'hiz-kontrolu-cihazlari';
UPDATE categories SET slug = 'accessories', name = 'Accessories' WHERE slug = 'aksesuarlar';
UPDATE categories SET slug = 'flexible-air-ducts', name = 'Flexible Air Ducts' WHERE slug = 'flexible-hava-kanallari';
UPDATE categories SET slug = 'dehumidifiers', name = 'Dehumidifiers' WHERE slug = 'nem-alma-cihazlari';

-- Zaten onceki migrationlarda olan veya taslak olan alt kategoriler icin (opsiyonel guvenlik guncellemeleri):
UPDATE categories SET slug = 'industrial-ventilation', name = 'Industrial Ventilation' WHERE slug = 'endustriyel-havalandirma';
UPDATE categories SET slug = 'commercial-ventilation', name = 'Commercial Ventilation' WHERE slug = 'ticari-havalandirma';
UPDATE categories SET slug = 'residential-ventilation', name = 'Residential Ventilation' WHERE slug = 'konut-tipi-havalandirma';
UPDATE categories SET slug = 'smoke-exhaust-fans', name = 'Smoke Exhaust Fans' WHERE slug = 'duman-egzoz-fanlari';
UPDATE categories SET slug = 'jet-fans', name = 'Jet Fans' WHERE slug = 'otopark-jet-fanlari';

COMMIT;
