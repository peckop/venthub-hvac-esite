-- =============================================================================
-- KATALOG OMURGASI — ürün-tipi ekseninde yeniden yapılandırma
--
-- KAYNAK/CETVEL
--   Karar kaydı (SSOT) : scratchpad/KARAR-KAYDI-katalog.md — Recep onayı 2026-08-27
--   Cetvel             : docs/standards/category-taxonomy-standard.md
--                        docs/standards/product-schema-standard.md
--   Veri SSOT          : venthub/ticaret/avensair-fiyat-listesi-2026/03-output/
--                        avens_fiyat_listesi_2026_HQ.csv (484 satır, 36 bölüm)
--   Ölçüm tazeliği     : canlı DB, 2026-08-27 — 374 ürün / 32 seri / 31 kategori
--   Linear             : REC-56 · Şerit: ÜRÜN
--
-- SONUÇ: 13 ana kategori → 6 · 18 alt → 19 · 32 seri → 39 · 374 model → 375
--
-- ⚠ EKRAN ADI BU MIGRATION'DAN GELMEZ.
--   getCategoryDisplayName (src/utils/categoryHelpers.ts:26) sırayla
--   translation_key → common.categoryList.* sözlüğüne, sonra menu_label'a bakar.
--   8 YENİ anahtarın TR/EN karşılığı src/i18n/dictionaries/{tr,en}.ts'e yazılmadan
--   sayfada doğru ad görünmez. O dosyalar I18N şeridinin claim'inde — devredildi.
--   Köprü olarak menu_label Türkçe yazılıyor (fallback #2), asıl çözüm sözlüktür.
--
-- ⚠ GERİ ALINABİLİRLİK: hiçbir kategori SİLİNMEZ, is_active=false ile pasifleştirilir.
--   Tek kalıcı silme: boşalan "AVenS Davlumbaz Fanları" serisi (D1).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) ÖN KOŞUL — ölçülen tabanla aynı veri üzerinde miyiz?
--    Veri kaydıysa migration SESSİZCE yanlış yapar; burada gürültüyle durur.
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> 374 THEN RAISE EXCEPTION 'ÖN KOŞUL: 374 aktif ürün bekleniyordu, % bulundu — karar kaydı bayat, ölçümü yenile.', n; END IF;

  SELECT count(*) INTO n FROM product_families WHERE deleted_at IS NULL;
  IF n <> 32 THEN RAISE EXCEPTION 'ÖN KOŞUL: 32 seri bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM categories;
  IF n <> 31 THEN RAISE EXCEPTION 'ÖN KOŞUL: 31 kategori bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM products p JOIN product_families f ON f.id = p.family_id WHERE f.slug = 'seat-storm-jet';
  IF n <> 81 THEN RAISE EXCEPTION 'ÖN KOŞUL: SEAT/STORM/JET 81 model bekleniyordu, % bulundu.', n; END IF;

  SELECT count(DISTINCT tenant_id) INTO n FROM categories;
  IF n <> 1 THEN RAISE EXCEPTION 'ÖN KOŞUL: tek tenant bekleniyordu, % bulundu — çok-tenant için bu migration yeniden yazılmalı.', n; END IF;
END $$;

-- =============================================================================
-- 1) ANA KATEGORİLER — 13 → 6
--    metadata.slug korunur/güncellenir; model_type ve vitrin içeriği DOKUNULMAZ.
-- =============================================================================

-- 1.1 Industrial Ventilation → FANLAR   (Recep: "bütün fanlar tek çatı altında")
UPDATE categories SET
  name = 'Fanlar', slug = 'fans', translation_key = 'fans', menu_label = 'Fanlar',
  metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{slug}', '{"tr":"fanlar","en":"fans"}'::jsonb),
  updated_at = now()
WHERE slug = 'industrial-ventilation';

-- 1.2 Accessories and Components → KONTROL SİSTEMLERİ  (Recep: "inverter ve hız anahtarı burada")
UPDATE categories SET
  name = 'Kontrol Sistemleri', slug = 'control-systems', translation_key = 'control-systems',
  menu_label = 'Kontrol Sistemleri',
  metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{slug}', '{"tr":"kontrol-sistemleri","en":"control-systems"}'::jsonb),
  updated_at = now()
WHERE slug = 'accessories-components';

-- 1.3 Air Treatment → İKLİMLENDİRME ve HAVA ŞARTLANDIRMA  (slug ve anahtar korunur)
UPDATE categories SET
  name = 'İklimlendirme ve Hava Şartlandırma', menu_label = 'İklimlendirme ve Hava Şartlandırma',
  metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{slug}', '{"tr":"iklimlendirme-ve-hava-sartlandirma","en":"air-treatment"}'::jsonb),
  updated_at = now()
WHERE slug = 'air-treatment';

-- 1.4 VMC & Heat Recovery → ISI GERİ KAZANIM (VMC)   (anahtar 'hrv' zaten doğru metni veriyor)
UPDATE categories SET
  name = 'Isı Geri Kazanım (VMC)', menu_label = 'Isı Geri Kazanım (VMC)', updated_at = now()
WHERE slug = 'heat-recovery-vmc';

-- 1.5 Air Curtains: alt kategoriden ANA kategoriye YÜKSELTİLİR
--     translation_key 'sub.air-curtain' KORUNUR — sözlük yolu hiyerarşiden bağımsız,
--     metin zaten "Hava Perdeleri". Gereksiz I18N işi açmıyoruz.
UPDATE categories SET
  parent_id = NULL, level = 0, name = 'Hava Perdeleri', menu_label = 'Hava Perdeleri',
  display_mode = 'series', updated_at = now()
WHERE slug = 'air-curtains';

-- 1.6 AKSESUARLAR — yeni ana kategori (BVU-LS kurşun seperatör; geldikçe dolar)
INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Aksesuarlar', 'accessories', NULL, 0, 'accessories', 'Aksesuarlar',
       'series', true, 90,
       '{"slug":{"tr":"aksesuarlar","en":"accessories"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'accessories');

-- =============================================================================
-- 2) ALT KATEGORİLER — 18 → 19
-- =============================================================================

-- 2.1 "Santrifüj | Radyal Fanlar" → "Santrifüj / Radyal Fanlar"
--     (Recep'in kusur sınıfı: marka adı tip adı değildir — "Nicotra Radyal" reddedildi)
UPDATE categories SET name = 'Santrifüj / Radyal Fanlar', menu_label = 'Santrifüj / Radyal Fanlar',
       updated_at = now()
WHERE slug = 'centrifugal-fans';

-- 2.2 Yuvarlak Kanal Tipi Fanlar → KANAL TİPİ FANLAR (tek çatı; 4 parça birleşiyor)
--     Recep: "kanal tipi fanlar diye bir grup olmalı ... tek çatıda olması lazım"
UPDATE categories SET
  name = 'Kanal Tipi Fanlar', slug = 'duct-fans', translation_key = 'sub.duct-fans',
  menu_label = 'Kanal Tipi Fanlar',
  parent_id = (SELECT id FROM categories WHERE slug = 'fans'), level = 1,
  metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{slug}', '{"tr":"kanal-tipi-fanlar","en":"duct-fans"}'::jsonb),
  updated_at = now()
WHERE slug = 'circular-duct-fans';

-- 2.3 Aksiyel Sanayi Fanları → AKSİYEL FANLAR (VORT-E ATEX buraya katılıyor)
UPDATE categories SET name = 'Aksiyel Fanlar', menu_label = 'Aksiyel Fanlar', updated_at = now()
WHERE slug = 'axial-industrial-fans';

-- 2.4 Sığınak Havalandırma Sistemleri → SIĞINAK HAVALANDIRMA FANLARI (BVU-LS aksesuara ayrıldı)
UPDATE categories SET name = 'Sığınak Havalandırma Fanları', menu_label = 'Sığınak Havalandırma Fanları',
       updated_at = now()
WHERE slug = 'shelter-ventilation';

-- 2.5 Smoke Exhaust Fans → DUMAN EGZOZ FANLARI (DB adı Türkçeleşiyor; anahtar aynı)
UPDATE categories SET name = 'Duman Egzoz Fanları', updated_at = now()
WHERE slug = 'smoke-exhaust-fans';

-- 2.6 Dehumidifiers → NEM ALMA CİHAZLARI
UPDATE categories SET name = 'Nem Alma Cihazları', menu_label = 'Nem Alma Cihazları', updated_at = now()
WHERE slug = 'dehumidifiers';

-- 2.7 Banyo/Cam-Pencere: ana kategorileri Residential → FANLAR
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'fans'), level = 1, updated_at = now()
WHERE slug IN ('bathroom-toilet-fans', 'window-fans');

-- 2.8 Endüstriyel Tavan Vantilatörleri: ANA kategoriden ALT kategoriye İNDİRİLİR
--     (Recep: "endüstriyel tavan vantilatörleri Fanlar altında")
--     translation_key 'hvls' korunur — sözlükte metin zaten doğru.
UPDATE categories SET
  name = 'Endüstriyel Tavan Vantilatörleri', menu_label = 'Endüstriyel Tavan Vantilatörleri',
  parent_id = (SELECT id FROM categories WHERE slug = 'fans'), level = 1,
  display_mode = 'series', updated_at = now()
WHERE slug = 'industrial-ceiling-fans';

-- 2.9 Otopark Jet Fanları: ANA kategoriden ALT kategoriye İNDİRİLİR
--     Boş ikizi 'jet-fans' pasifleşecek (bölüm 7); iyi slug olan bu satır yaşıyor.
UPDATE categories SET
  parent_id = (SELECT id FROM categories WHERE slug = 'fans'), level = 1, updated_at = now()
WHERE slug = 'parking-jet-fan';

-- 2.10 ŞÖMİNE ve BACA FANLARI — yeni alt kategori
--      ⚠ Karar kaydı §1 "migration'da doğrula" demişti: DOĞRULANDI.
--      VRT-15000 "Vortice TIRACAMINO Şömine ve Baca Fanı" bugün Çatı Tipi altında duruyor
--      ama çatı fanı DEĞİL. Çatı Tipi 14 → 13, Şömine ve Baca 0 → 1.
INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Şömine ve Baca Fanları', 'chimney-fans', (SELECT id FROM categories WHERE slug = 'fans'), 1,
       'sub.chimney', 'Şömine ve Baca Fanları', 'series', true, 0,
       '{"slug":{"tr":"somine-ve-baca-fanlari","en":"chimney-fans"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'chimney-fans');

-- 2.11 HIZ ANAHTARLARI — yeni alt kategori (D11: çok-sayfalı aksesuar, kontrol ürünü)
INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Hız Anahtarları', 'speed-controllers', (SELECT id FROM categories WHERE slug = 'control-systems'), 1,
       'sub.speed-controllers', 'Hız Anahtarları', 'series', true, 0,
       '{"slug":{"tr":"hiz-anahtarlari","en":"speed-controllers"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'speed-controllers');

-- 2.12 SULU BATARYA KANAL TİPİ — yeni alt kategori (D4: katalog s.69 iki ayrı tablo)
INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Sulu Batarya Kanal Tipi', 'water-coil-duct-heaters',
       (SELECT id FROM categories WHERE slug = 'air-treatment'), 1,
       'sub.water-coils', 'Sulu Batarya Kanal Tipi', 'series', true, 0,
       '{"slug":{"tr":"sulu-batarya-kanal-tipi","en":"water-coil-duct-heaters"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'water-coil-duct-heaters');

-- 2.13 Elektrikli Kanal Isıtıcıları: Electric Heating → İKLİMLENDİRME
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'air-treatment'),
       level = 1, updated_at = now()
WHERE slug = 'electric-duct-heaters';

-- 2.14/2.15 ISI GERİ KAZANIM alt kategorileri — Recep'in kendi ekseni.
--   AVenS'in "Konut Tipi / Ticari Tipi" ayrımı KOPYALANMADI (Recep: "sen de gittin AVenS'i
--   kopyaladın"); yerine teknik eksen: tekil oda ünitesi mi, kanallı merkezi ünite mi.
INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Tekil Oda Üniteleri', 'single-room-hrv',
       (SELECT id FROM categories WHERE slug = 'heat-recovery-vmc'), 1,
       'sub.single-room-hrv', 'Tekil Oda Üniteleri', 'series', true, 0,
       '{"slug":{"tr":"tekil-oda-uniteleri","en":"single-room-hrv"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'single-room-hrv');

INSERT INTO categories (name, slug, parent_id, level, translation_key, menu_label,
                        display_mode, is_active, sort_order, metadata, tenant_id)
SELECT 'Kanallı Merkezi Üniteler', 'ducted-central-hrv',
       (SELECT id FROM categories WHERE slug = 'heat-recovery-vmc'), 1,
       'sub.ducted-central-hrv', 'Kanallı Merkezi Üniteler', 'series', true, 0,
       '{"slug":{"tr":"kanalli-merkezi-uniteler","en":"ducted-central-hrv"}}'::jsonb,
       (SELECT tenant_id FROM categories LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ducted-central-hrv');

-- =============================================================================
-- 3) SERİLER (product_families) — 32 → 39
--    Önce bölünmelerde ürünler yeni seriye taşınır, sonra eski seri adı düzeltilir.
-- =============================================================================

-- 3.1 D2: mega-aile "SEAT Storm Jet" üçe ayrılır. Ayırt edici SKU hat ön ekidir
--     (51=SEAT · 61=STORM · 71=JET) — fiyat listesi s.41-45 ile doğrulandı.
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'STORM Serisi', 'storm-serisi', f.brand_id, 'STORM', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'seat-storm-jet'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'storm-serisi');

INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'JET Serisi', 'jet-serisi', f.brand_id, 'JET', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'seat-storm-jet'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'jet-serisi');

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'storm-serisi'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'seat-storm-jet') AND sku LIKE 'SEA-61%';

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'jet-serisi'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'seat-storm-jet') AND sku LIKE 'SEA-71%';

UPDATE product_families SET name = 'SEAT Serisi', series_code = 'SEAT', updated_at = now()
WHERE slug = 'seat-storm-jet';

-- 3.2 D4: elektrikli ısıtıcı ailesinden sulu batarya ayrılır (farklı ürün, farklı tablo)
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'AVenS Sulu Batarya Kanal Tipi', 'avens-sulu-batarya', f.brand_id, 'SULU-BATARYA', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'avens-elektrikli-isiticilar'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'avens-sulu-batarya');

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'avens-sulu-batarya'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'avens-elektrikli-isiticilar')
  AND name ILIKE 'SULU BATARYA%';

-- 3.3 D5: hücreli aspiratörler iki gövde tipine ayrılır (HF/FW = çift emişli, HF/S = tek emişli)
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'AVenS Hücreli Aspiratörler HF/S', 'avens-hucreli-hf-s', f.brand_id, 'HF-S', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'avens-hucreli-aspiratorler'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'avens-hucreli-hf-s');

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'avens-hucreli-hf-s'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'avens-hucreli-aspiratorler')
  AND name ILIKE '%HF/S%';

UPDATE product_families SET name = 'AVenS Hücreli Aspiratörler HF/FW', series_code = 'HF-FW', updated_at = now()
WHERE slug = 'avens-hucreli-aspiratorler';

-- 3.4 D7: hava perdesi ailesi ikiye — AD ortam havalı, H AD elektrikli ısıtmalı
--     (Recep'in tespiti; AVenS de aynı ayrımı yapıyor)
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'Vortice H AD Elektrikli Isıtmalı Hava Perdeleri', 'vortice-h-ad-elektrikli', f.brand_id, 'H-AD', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'vortice-hava-perdesi'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'vortice-h-ad-elektrikli');

-- ⚠ 'AD H 1500 T' kardeşleriyle aynı ürün ama adı ters yazılmış (VRT-65158);
--    bu yüzden eşleştirme ada değil SKU'ya dayanıyor.
UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'vortice-h-ad-elektrikli'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'vortice-hava-perdesi')
  AND sku IN ('VRT-65155', 'VRT-65156', 'VRT-65157', 'VRT-65158');

UPDATE product_families SET name = 'Vortice AD Ortam Havalı Hava Perdeleri', series_code = 'AD', updated_at = now()
WHERE slug = 'vortice-hava-perdesi';

-- 3.5 D6: BVU-LS kurşun seperatör aksesuardır, sığınak fanı değil (katalog s.56 notu)
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'AVenS BVU-LS Kurşun Seperatör', 'avens-bvu-ls', f.brand_id, 'BVU-LS', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'avens-siginak-havalandirma-uniteleri'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'avens-bvu-ls');

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'avens-bvu-ls'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'avens-siginak-havalandirma-uniteleri')
  AND name ILIKE 'BVU-LS%';

UPDATE product_families SET name = 'AVenS BVU Sığınak Havalandırma Üniteleri', series_code = 'BVU', updated_at = now()
WHERE slug = 'avens-siginak-havalandirma-uniteleri';

-- 3.6 D1 + D10 + D11: "AVenS Davlumbaz Fanları" serisi DAĞITILIR ve SİLİNİR.
--     AVenS bu ürünü hiç üretmiyor (fiyat listesi s.36); serinin altındaki 3 kayıt
--     aslında 1 frekans konvertörü + 2 hız anahtarı.
--     ⚠ FC 51 ≠ FC 101: ayrı ürün hattı (Micro Drive vs HVAC Basic Drive) — ilk
--     çıkarımım hatalıydı, ürün gerçeğiyle düzeltildi.
INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'Danfoss VLT Micro Drive FC 51', 'danfoss-fc51', f.brand_id, 'FC51', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'danfoss-fc101'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'danfoss-fc51');

INSERT INTO product_families (name, slug, brand_id, series_code, description, tenant_id)
SELECT 'AVenS Hız Anahtarları', 'avens-hiz-anahtarlari', f.brand_id, 'HIZ-ANAHTARI', '{}'::jsonb, f.tenant_id
FROM product_families f WHERE f.slug = 'avens-plug-fanlar'
  AND NOT EXISTS (SELECT 1 FROM product_families WHERE slug = 'avens-hiz-anahtarlari');

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'danfoss-fc51'),
       brand = 'Danfoss', updated_at = now()
WHERE sku = 'AVE-80141';

UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'avens-hiz-anahtarlari'), updated_at = now()
WHERE sku IN ('AVE-01801', 'AVE-60006');

-- 3.7 D9: Lineo tek hat. Bugün aynı ürün hattı İKİ ana kategoride duruyor
--     (Residential/Lineo Quiet 12 + Commercial/In-Line Yuvarlak içindeki 7 Lineo).
UPDATE products SET family_id = (SELECT id FROM product_families WHERE slug = 'vortice-lineo-quiet'), updated_at = now()
WHERE family_id = (SELECT id FROM product_families WHERE slug = 'vortice-vort-commercial-in-line-circular')
  AND name ILIKE '%Lineo%';

UPDATE product_families SET name = 'Vortice Lineo Kanal Fanları', updated_at = now()
WHERE slug = 'vortice-lineo-quiet';

-- 3.8 Çatı serisi değil, şömine serisi (bölüm 2.10'daki doğrulama)
UPDATE product_families SET name = 'Vortice TIRACAMINO Şömine ve Baca Fanları', series_code = 'TIRACAMINO', updated_at = now()
WHERE slug = 'vortice-vort-industrial-ventilation-roof';

-- 3.9 Boşalan davlumbaz serisi silinir (tek kalıcı silme — 0 ürün taşıyor)
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM products WHERE family_id = (SELECT id FROM product_families WHERE slug = 'avens-davlumbaz-fanlar');
  IF n <> 0 THEN RAISE EXCEPTION 'Davlumbaz serisi boşalmadı (% ürün kaldı) — silme iptal.', n; END IF;
END $$;
DELETE FROM product_families WHERE slug = 'avens-davlumbaz-fanlar';

-- =============================================================================
-- 4) HER SERİYİ HEDEF KATEGORİSİNE BAĞLA
--    Ürünler bir sonraki adımda seriden türetilir; böylece seri ile ürün
--    ASLA ayrışamaz (bugünkü kusurların bir kısmı tam bu ayrışmadan doğmuştu).
-- =============================================================================
WITH hedef(seri_slug, ana_slug, alt_slug) AS (VALUES
  -- FANLAR · Santrifüj / Radyal
  ('nicotra-gebhardt-adh',                        'fans', 'centrifugal-fans'),
  ('nicotra-gebhardt-at',                         'fans', 'centrifugal-fans'),
  ('nicotra-gebhardt-dd',                         'fans', 'centrifugal-fans'),
  ('nicotra-gebhardt-rdh',                        'fans', 'centrifugal-fans'),
  ('vortice-vort-qbk-sal-kc-evo',                 'fans', 'centrifugal-fans'),
  ('avens-plug-fanlar',                           'fans', 'centrifugal-fans'),
  ('avens-hucreli-aspiratorler',                  'fans', 'centrifugal-fans'),
  ('avens-hucreli-hf-s',                          'fans', 'centrifugal-fans'),
  -- FANLAR · Asit Dayanımlı  (ATEX'liler DAHİL — sertifika kategori değildir)
  ('seat-storm-jet',                              'fans', 'acid-resistant-fans'),
  ('storm-serisi',                                'fans', 'acid-resistant-fans'),
  -- FANLAR · Kanal Tipi
  ('vortice-lineo-quiet',                         'fans', 'duct-fans'),
  ('vortice-vort-commercial-in-line-circular',    'fans', 'duct-fans'),
  ('vortice-vort-commercial-in-line-rectangular', 'fans', 'duct-fans'),
  ('vortice-radon-range-circular',                'fans', 'duct-fans'),
  -- FANLAR · Banyo ve Tuvalet
  ('vortice-vort-quadro-evo',                     'fans', 'bathroom-toilet-fans'),
  ('vortice-punto-evo-flexo',                     'fans', 'bathroom-toilet-fans'),
  ('vortice-vortice-bravo-s',                     'fans', 'bathroom-toilet-fans'),
  -- FANLAR · Aksiyel
  ('vortice-vort-industrial-ventilation-axial',   'fans', 'axial-industrial-fans'),
  ('vortice-vort-e-atex',                         'fans', 'axial-industrial-fans'),
  -- FANLAR · Otopark Jet
  ('jet-serisi',                                  'fans', 'parking-jet-fan'),
  -- FANLAR · Çatı / Şömine / Duman / Tavan / Sığınak
  ('vortice-vort-heatmaster-slimroof-roof',       'fans', 'roof-fans'),
  ('vortice-radon-range-roof',                    'fans', 'roof-fans'),
  ('vortice-vort-industrial-ventilation-roof',    'fans', 'chimney-fans'),
  ('vortice-vort-heatmaster-slimroof-smoke',      'fans', 'smoke-exhaust-fans'),
  ('vortice-vort-nordik-hvls',                    'fans', 'industrial-ceiling-fans'),
  ('avens-siginak-havalandirma-uniteleri',        'fans', 'shelter-ventilation'),
  -- KONTROL SİSTEMLERİ
  ('danfoss-fc101',                               'control-systems', 'frequency-converters'),
  ('danfoss-fc102',                               'control-systems', 'frequency-converters'),
  ('danfoss-fc51',                                'control-systems', 'frequency-converters'),
  ('avens-hiz-anahtarlari',                       'control-systems', 'speed-controllers'),
  -- İKLİMLENDİRME ve HAVA ŞARTLANDIRMA
  ('avens-sulu-batarya',                          'air-treatment', 'water-coil-duct-heaters'),
  ('avens-elektrikli-isiticilar',                 'air-treatment', 'electric-duct-heaters'),
  ('vortice-deumido-range',                       'air-treatment', 'dehumidifiers'),
  -- ISI GERİ KAZANIM (VMC)
  ('vortice-vort-mono',                           'heat-recovery-vmc', 'single-room-hrv'),
  ('vortice-isi-geri-kazanim',                    'heat-recovery-vmc', 'ducted-central-hrv'),
  ('avens-isi-geri-kazanim',                      'heat-recovery-vmc', 'ducted-central-hrv'),
  -- HAVA PERDELERİ  (alt kategori YOK — iki seri doğrudan ana kategoride)
  ('vortice-hava-perdesi',                        'air-curtains', NULL),
  ('vortice-h-ad-elektrikli',                     'air-curtains', NULL),
  -- AKSESUARLAR      (alt kategori YOK)
  ('avens-bvu-ls',                                'accessories', NULL)
)
UPDATE product_families f SET
  category_id    = (SELECT id FROM categories WHERE slug = h.ana_slug),
  subcategory_id = (SELECT id FROM categories WHERE slug = h.alt_slug),
  updated_at     = now()
FROM hedef h WHERE f.slug = h.seri_slug;

-- Hiçbir seri haritanın dışında kalmasın
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM product_families f
   WHERE f.deleted_at IS NULL
     AND (f.category_id IS NULL OR f.category_id NOT IN (SELECT id FROM categories WHERE parent_id IS NULL AND is_active));
  IF n <> 0 THEN RAISE EXCEPTION '% seri hedef ana kategoriye bağlanmadı — harita eksik.', n; END IF;
END $$;

-- =============================================================================
-- 5) ÜRÜNLERİ SERİSİNDEN TÜRET  (tek kaynak: seri)
-- =============================================================================
UPDATE products p SET
  category_id = f.category_id, subcategory_id = f.subcategory_id, updated_at = now()
FROM product_families f
WHERE f.id = p.family_id
  AND (p.category_id IS DISTINCT FROM f.category_id OR p.subcategory_id IS DISTINCT FROM f.subcategory_id);

-- =============================================================================
-- 6) AD DÜZELTMELERİ
-- =============================================================================

-- 6.1 D3 — SEAT/STORM/JET: 81 modelin 72'si adıyla ayırt EDİLEMİYORDU.
--     Kimlik SKU'da vardı, ada hiç taşınmamıştı. Ada devir + güç + gerilim eklenir.
--     Kaynak: HQ fiyat listesi — spec_rpm / spec_power_kw / spec_voltage 81/81 DOLU,
--     kodlar DB ile 81/81 eşleşti, sonuç 81/81 benzersiz (ayırt edilemeyen 0).
--     ⚠ products.slug DEĞİŞMEZ: slug zaten model kodunu taşıyor (seat-15-51152000),
--     yani URL'ler kırılmıyor. Değişen yalnız insanın gördüğü ad.
WITH yeni(sku, ad) AS (VALUES
    ('SEA-51151000', 'SEAT 15 · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-51152000', 'SEAT 15 · 1400 d/dk · 0,18 kW · 380V'),
    ('SEA-51152003', 'SEAT 15 ATEX · 1400 d/dk · 0,18 kW · 380V'),
    ('SEA-51152010', 'SEAT 15 · 1400 d/dk · 0,25 kW · 220V'),
    ('SEA-51153000', 'SEAT 15 · 2800 d/dk · 0,37 kW · 380V'),
    ('SEA-51153003', 'SEAT 15 ATEX · 2800 d/dk · 0,37 kW · 380V'),
    ('SEA-51153010', 'SEAT 15 · 2800 d/dk · 0,37 kW · 220V'),
    ('SEA-51201000', 'SEAT 20 · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-51201003', 'SEAT 20 ATEX · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-51202000', 'SEAT 20 · 1400 d/dk · 0,18 kW · 380V'),
    ('SEA-51202003', 'SEAT 20 ATEX · 1400 d/dk · 0,18 kW · 380V'),
    ('SEA-51202010', 'SEAT 20 · 1400 d/dk · 0,25 kW · 220V'),
    ('SEA-51203000', 'SEAT 20 · 2800 d/dk · 0,75 kW · 380V'),
    ('SEA-51203001', 'SEAT 20 · 2800 d/dk · 1,1 kW · 380V'),
    ('SEA-51203003', 'SEAT 20 ATEX · 2800 d/dk · 0,75 kW · 380V'),
    ('SEA-51203010', 'SEAT 20 · 2800 d/dk · 0,75 kW · 220V'),
    ('SEA-51251000', 'SEAT 25 · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-51251003', 'SEAT 25 ATEX · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-51252000', 'SEAT 25 · 1400 d/dk · 0,37 kW · 380V'),
    ('SEA-51252003', 'SEAT 25 ATEX · 1400 d/dk · 0,37 kW · 380V'),
    ('SEA-51252010', 'SEAT 25 · 1400 d/dk · 0,37 kW · 220V'),
    ('SEA-51253000', 'SEAT 25 · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-51253001', 'SEAT 25 · 2800 d/dk · 1,5 kW · 380V'),
    ('SEA-51253003', 'SEAT 25 ATEX · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-51253300', 'SEAT 25 · 2800 d/dk · 3 kW · 380V'),
    ('SEA-51301000', 'SEAT 30 · 950 d/dk · 0,55 kW · 380V'),
    ('SEA-51302000', 'SEAT 30 · 1400 d/dk · 1,1 kW · 380V'),
    ('SEA-51302003', 'SEAT 30 ATEX · 1400 d/dk · 1,1 kW · 380V'),
    ('SEA-51302010', 'SEAT 30 · 1400 d/dk · 1,1 kW · 220V'),
    ('SEA-51350000', 'SEAT 35 · 750 d/dk · 1,5 kW · 380V'),
    ('SEA-51351000', 'SEAT 35 · 950 d/dk · 2,2 kW · 380V'),
    ('SEA-51351003', 'SEAT 35 ATEX · 950 d/dk · 2,2 kW · 380V'),
    ('SEA-51352000', 'SEAT 35 · 1400 d/dk · 5,5 kW · 380V'),
    ('SEA-51352001', 'SEAT 35 · 1400 d/dk · 7,5 kW · 380V'),
    ('SEA-51352003', 'SEAT 35 ATEX · 1400 d/dk · 5,5 kW · 380V'),
    ('SEA-51352004', 'SEAT 35 ATEX · 1400 d/dk · 7,5 kW · 380V'),
    ('SEA-51352400', 'SEAT 35 · 1400 d/dk · 4 kW · 380V'),
    ('SEA-51501000', 'SEAT 50 · 950 d/dk · 4 kW · 380V'),
    ('SEA-51502000', 'SEAT 50 · 1400 d/dk · 5,5 kW · 380V'),
    ('SEA-51502003', 'SEAT 50 ATEX · 1400 d/dk · 5,5 kW · 380V'),
    ('SEA-61102000', 'STORM 10 · 1400 d/dk · 0,06 kW · 380V'),
    ('SEA-61102003', 'STORM 10 ATEX · 1400 d/dk · 0,06 kW · 380V'),
    ('SEA-61102010', 'STORM 10 XRM · 1400 d/dk · 0,06 kW · 220V'),
    ('SEA-61103000', 'STORM 10 · 2800 d/dk · 0,09 kW · 380V'),
    ('SEA-61103003', 'STORM 10 ATEX · 2800 d/dk · 0,12 kW · 380V'),
    ('SEA-61103010', 'STORM 10 · 2800 d/dk · 0,09 kW · 220V'),
    ('SEA-61103110', 'STORM 10 · 1400 d/dk · 0,06 kW · 220V'),
    ('SEA-61122000', 'STORM 12 · 1400 d/dk · 0,25 kW · 380V'),
    ('SEA-61122003', 'STORM 12 ATEX · 1400 d/dk · 0,25 kW · 380V'),
    ('SEA-61122010', 'STORM 12 · 1400 d/dk · 0,25 kW · 220V'),
    ('SEA-61123000', 'STORM 12 · 2800 d/dk · 0,37 kW · 380V'),
    ('SEA-61123003', 'STORM 12 ATEX · 2800 d/dk · 0,37 kW · 380V'),
    ('SEA-61123010', 'STORM 12 · 2800 d/dk · 0,37 kW · 220V'),
    ('SEA-61143000', 'STORM 14 · 2800 d/dk · 1,1 kW · 380V'),
    ('SEA-61143003', 'STORM 14 ATEX · 2800 d/dk · 1,1 kW · 380V'),
    ('SEA-61143010', 'STORM 14 · 2800 d/dk · 1,1 kW · 220V'),
    ('SEA-61163000', 'STORM 16 · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-61163003', 'STORM 16 ATEX · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-61183000', 'STORM 18 · 2800 d/dk · 7,5 kW · 380V'),
    ('SEA-61183003', 'STORM 18 ATEX · 2800 d/dk · 7,5 kW · 380V'),
    ('SEA-71201000', 'JET 20 · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-71201003', 'JET 20 ATEX · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-71202000', 'JET 20 · 1400 d/dk · 0,25 kW · 380V'),
    ('SEA-71202003', 'JET 20 ATEX · 1400 d/dk · 0,18 kW · 380V'),
    ('SEA-71202010', 'JET 20 · 1400 d/dk · 0,18 kW · 220V'),
    ('SEA-71203000', 'JET 20 · 2800 d/dk · 0,75 kW · 380V'),
    ('SEA-71203001', 'JET 20 · 2800 d/dk · 1,1 kW · 380V'),
    ('SEA-71203003', 'JET 20 ATEX · 2800 d/dk · 0,75 kW · 380V'),
    ('SEA-71203010', 'JET 20 · 2800 d/dk · 0,75 kW · 220V'),
    ('SEA-71251000', 'JET 25 · 950 d/dk · 0,18 kW · 380V'),
    ('SEA-71251003', 'JET 25 ATEX · 900 d/dk · 0,18 kW · 380V'),
    ('SEA-71252000', 'JET 25 · 1400 d/dk · 0,37 kW · 380V'),
    ('SEA-71252003', 'JET 25 ATEX · 1400 d/dk · 0,37 kW · 380V'),
    ('SEA-71252010', 'JET 25 · 1400 d/dk · 0,37 kW · 220V'),
    ('SEA-71252055', 'JET 25 · 1400 d/dk · 0,55 kW · 380V'),
    ('SEA-71253000', 'JET 25 · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-71253003', 'JET 25 ATEX · 2800 d/dk · 2,2 kW · 380V'),
    ('SEA-71301000', 'JET 30 · 950 d/dk · 0,55 kW · 380V'),
    ('SEA-71302000', 'JET 30 · 1500 d/dk · 1,1 kW · 380V'),
    ('SEA-71302003', 'JET 30 ATEX · 1400 d/dk · 1,1 kW · 380V'),
    ('SEA-71302010', 'JET 30 · 1400 d/dk · 1,1 kW · 220V')
)
UPDATE products p SET name = yeni.ad, updated_at = now()
FROM yeni WHERE p.sku = yeni.sku AND p.name IS DISTINCT FROM yeni.ad;

-- 6.2 D7 yazım hatası: kardeşleri "H AD ..." iken bu tek satır "AD H ..." yazılmış
UPDATE products SET name = 'Vortice Air Door H AD 1500 T', updated_at = now()
WHERE sku = 'VRT-65158';

-- 6.3 Güvenlik ağı: fiyat listesinin "(*)" dipnot işareti hiçbir ürün adında kalmasın.
--     (6.1'deki üretici bunu zaten ayıklıyor; bu satır yalnızca kaçak kalırsa devreye girer.)
UPDATE products SET name = btrim(replace(name, '(*)', '')), updated_at = now()
WHERE name LIKE '%(*)%';

-- =============================================================================
-- 7) YENİ ÜRÜN — AVE-20150
--    Katalogda VAR, veritabanında YOK'tu. Kaynak: fiyat listesi s.28 (2.797 EUR).
--    ⚠ Fiyat YAZILMIYOR: fiyatlar product_prices tablosunda tutuluyor, ayrı iş.
-- =============================================================================
INSERT INTO products (name, brand, sku, slug, model_code, status, family_id,
                      category_id, subcategory_id, technical_specs, stock_qty, tenant_id)
SELECT 'AVENS-HF/FW 18/18 5,5KW', 'AVenS', 'AVE-20150', 'avens-hf-fw-18-18-5-5kw-20150', '20150',
       'active', f.id, f.category_id, f.subcategory_id,
       '{"max_delivery_m3h": 18000}'::jsonb, 0, f.tenant_id
FROM product_families f WHERE f.slug = 'avens-hucreli-aspiratorler'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AVE-20150');

-- =============================================================================
-- 8) ARTIK KULLANILMAYAN KATEGORİLER — pasifleştirilir, SİLİNMEZ (geri alınabilir)
-- =============================================================================
UPDATE categories SET is_active = false, updated_at = now()
WHERE slug IN (
  -- eski ana kategoriler (içerikleri 6 yeni ana kategoriye dağıldı)
  'air-conditioning', 'commercial-ventilation', 'electric-heating', 'hygiene-sanitizer',
  'residential-ventilation', 'smart-home', 'summer-ventilation',
  -- birleşen / karşılığı kalmayan alt kategoriler
  'rectangular-duct-fans',      -- Kanal Tipi Fanlar'a katıldı
  'inline-duct-fans',           -- Kanal Tipi Fanlar'a katıldı
  'jet-fans',                   -- boş ikiz; 'parking-jet-fan' yaşıyor
  'air-conditioning-solutions', -- hiç ürün almamış
  'ex-proof-atex-fans'          -- ATEX kategori DEĞİL: rozet + filtre + vitrin sayfası
);

-- =============================================================================
-- 9) SON DENETİM — karar kaydındaki sayılar tutmuyorsa migration BAŞARISIZ olur
-- =============================================================================
DO $$
DECLARE n int; bek int;
BEGIN
  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> 375 THEN RAISE EXCEPTION 'SONUÇ: 375 ürün bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM product_families WHERE deleted_at IS NULL;
  IF n <> 39 THEN RAISE EXCEPTION 'SONUÇ: 39 seri bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE is_active AND parent_id IS NULL;
  IF n <> 6 THEN RAISE EXCEPTION 'SONUÇ: 6 ana kategori bekleniyordu, % bulundu.', n; END IF;

  SELECT count(*) INTO n FROM categories WHERE is_active AND parent_id IS NOT NULL;
  IF n <> 19 THEN RAISE EXCEPTION 'SONUÇ: 19 alt kategori bekleniyordu, % bulundu.', n; END IF;

  -- ana kategori dağılımı (karar kaydı §1)
  FOR n, bek IN
    SELECT cnt, bekl FROM (VALUES
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='fans'), 295),
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='control-systems'), 37),
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='air-treatment'), 17),
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='heat-recovery-vmc'), 16),
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='air-curtains'), 8),
      ((SELECT count(*) FROM products p JOIN categories c ON c.id=p.category_id WHERE c.slug='accessories'), 2)
    ) AS t(cnt, bekl)
  LOOP
    IF n <> bek THEN RAISE EXCEPTION 'SONUÇ: ana kategori dağılımı tutmadı — % bulundu, % bekleniyordu.', n, bek; END IF;
  END LOOP;

  -- pasif kategoride ürün kalmasın
  SELECT count(*) INTO n FROM products p
    JOIN categories c ON c.id = p.category_id WHERE NOT c.is_active;
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: % ürün pasif kategoride kaldı.', n; END IF;

  -- SEAT/STORM/JET adları artık ayırt edici olmalı
  SELECT count(*) INTO n FROM (
    SELECT p.name FROM products p JOIN product_families f ON f.id = p.family_id
     WHERE f.slug IN ('seat-storm-jet','storm-serisi','jet-serisi')
     GROUP BY p.name HAVING count(*) > 1) d;
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: % SEAT/STORM/JET adı hâlâ çakışıyor.', n; END IF;
END $$;
