-- =============================================================================
-- KATEGORİ GÖRSELLERİ — 19 aktif kategoriye kendi ürününden kapak görseli
--
-- ⚠ VERİ GÖÇÜ · KURAL 13: master'a merge = prod DB'ye OTOMATİK apply.
--   Yalnız Recep'in açık onayıyla merge edilir.
--
-- KAYNAK/CETVEL
--   docs/standards/migration-safety-standard.md   (atomiklik, ön koşul, geri alma)
--   docs/standards/rendering-cache-standard.md    (veri değişince hangi yüzey tazelenir)
--   docs/standards/product-schema-standard.md · category-taxonomy-standard.md
--   Kod ayağı  : src/lib/images/categoryImage.ts — PR #913 (İNDİ, master'da)
--   Onay       : Recep 2026-08-30 "kategorilere resim girişini yapsak mı? boş
--                durmasından iyidir" + "onay veriyorum"
--   Ölçüm      : canlı DB + canlı Storage + canlı simülasyon, 2026-08-31
--   Linear     : REC-89 · Şerit: ÜRÜN · YÖNTEM: şerit içi elle + plan-challenger
--
-- ⭐BU SÜRÜM v2 — v1 BAĞIMSIZ RED-TEAM TARAFINDAN BLOKLANDI. Üç ölümcül kusur vardı:
--   (B1) Değeri 'product-images/<yol>' diye yazacaktı ve resolver'ın bu öneki
--        tanıyacağını VARSAYIYORDU. Resolver'ı okudum: tanımıyor — `category-images/`
--        dışındaki her değeri yol parçası sayıp kendi deposunu önüne ekliyor
--        (categoryImage.ts, 3. dal). Sonuç `.../category-images/product-images/...`
--        yani 19 görselin HEPSİ 404. Varsayım koda karşı ÖLÇÜLMEMİŞTİ.
--   (B2) Son denetimi "20 görselli kategori" bekliyordu; v1'in seçim kuralıyla
--        ulaşılabilir en yüksek değer 16'ydı. Migration KESİN patlayacaktı ve
--        atomik sarma yüzünden migration hattı KALICI kırmızıya dönüp başka
--        şeritlerin migration'larını da bloklayacaktı.
--   (B3) "3 kategori doldurulamaz" iddiası yanlıştı: gerçek 7'ydi ve doldurulamayanlar
--        tam olarak MENÜDEKİ 4 ANA KATEGORİ'ydi (Fanlar, Kontrol Sistemleri, Isı Geri
--        Kazanım, İklimlendirme) — yani işin asıl hedefi. Sebep: ana kategorilere
--        DOĞRUDAN bağlı ürün yok (hepsi alt kategorilerde), v1 yalnız doğrudan bağlı
--        ürüne bakıyordu. v1'in 2. adımı tamamen ölü koddu.
--
-- v2'DE NE DEĞİŞTİ
--   1. DEĞER BİÇİMİ = TAM ADRES (https://...). Resolver'ın `^https?://` dalı bunu
--      olduğu gibi geçirir — yani bu migration hiçbir kod değişikliğine BAĞLI DEĞİL,
--      tek başına inebilir. Ayrıca image_url'i resolver'sız HAM okuyan yüzeyler
--      (CategoryShowcaseView hero, OpenGraph görseli, ana sayfa kategori kartları,
--      3D karusel) de tam adresle DOĞRU çalışır. Bedeli: Supabase konağı veriye
--      gömülür. Kabul edildi — konak değişimi proje ömründe bir kez olur ve o gün
--      tek bir UPDATE ... replace() yeter; buna karşılık 5 ayrı yüzeyi düzeltme
--      zorunluluğu ve sıra bağımlılığı ortadan kalkıyor.
--   2. ANA KATEGORİ SEÇİMİ GENİŞLETİLDİ: doğrudan bağlı ürün şartı kaldırıldı;
--      ana kategori kendi ağacındaki (category_id) ürünlerden görsel alır, alt
--      kategorilerin ALDIKLARI hariç tutularak. Böylece menüdeki 4 ana kategori dolar.
--   3. ÖN KOŞULLAR KENDİ ETKİSİNİ ÖLÇER. v1 "375 ürün / 37 kategori" gibi MUTLAK
--      sabitler tutuyordu; onlar "ben dokunmadım"ı değil "kimse dokunmadı"yı ölçer —
--      admin panelinden tek ürün eklemek migration'ı alakasız sebeple bloklardı.
--      v2 önce/sonra farkını ölçüyor (ayırt eden değişmez bu).
--   4. TENANT SÜZGECİ eklendi (bugün bedava, çok-tenantlı gelecekte data bleeding'i
--      önler — CLAUDE.md kural 12).
--
-- SİMÜLASYONLA ÖLÇÜLEN BEKLENEN SONUÇ (tahmin değil, aynı SELECT canlıda koşuldu):
--   alt kategori 15 + ana kategori 4 = 19 atama · 19 BENZERSİZ görsel yolu
--   doldurulamayan 3: Aksesuarlar (2 ürün), Elektrikli Kanal Isıtıcıları (6),
--   Endüstriyel Tavan Vantilatörleri (7) — bu 15 ürünün HİÇ fotoğrafı yok.
--   Hava Perdeleri'ne DOKUNULMAZ (zaten görselli).
--
-- ⭐BİLİNEN AÇIK, GİZLENMİYOR: admin kategori tablosu (src/views/admin/
--   CategoriesTableBody.tsx:433) depo adresini ELLE kuruyor ve tam adresi de
--   sarmalayacağı için orada görsel KIRIK görünecek. O dosya ADMIN şeridinin
--   claim'inde; ayrı bulgu olarak bildirildi. Vitrin (müşteri yüzü) etkilenmez.
-- =============================================================================

-- Ön/son karşılaştırması için geçici taban (işlem sonunda kendiliğinden düşer).
CREATE TEMP TABLE _kg_taban ON COMMIT DROP AS
SELECT
  (SELECT count(*) FROM products WHERE deleted_at IS NULL)                    AS urun_once,
  (SELECT count(*) FROM categories)                                           AS kategori_once,
  (SELECT count(*) FROM categories WHERE is_active AND image_url IS NOT NULL) AS gorselli_once;

-- -----------------------------------------------------------------------------
-- 0) ÖN KOŞUL — yalnızca İŞLE İLGİLİ olanlar
-- -----------------------------------------------------------------------------
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM product_images;
  IF n = 0 THEN RAISE EXCEPTION 'ÖN KOŞUL: product_images BOŞ — atanacak görsel yok.'; END IF;

  -- Görselsiz aktif kategori kalmadıysa bu migration'ın işi yok; sessizce no-op
  -- olup "koştu" görünmesin.
  SELECT count(*) INTO n FROM categories WHERE is_active AND image_url IS NULL;
  IF n = 0 THEN RAISE EXCEPTION 'ÖN KOŞUL: görselsiz aktif kategori YOK — migration gereksiz, taban değişmiş.'; END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 1) ALT KATEGORİLER — kendi ürününden ilk kapak (tam adres)
-- -----------------------------------------------------------------------------
WITH secim AS (
  SELECT DISTINCT ON (c.id) c.id AS kat_id, pi.path
  FROM categories c
  JOIN products p ON p.subcategory_id = c.id AND p.deleted_at IS NULL
  JOIN product_images pi ON pi.product_id = p.id AND pi.tenant_id = c.tenant_id
  WHERE c.is_active AND c.parent_id IS NOT NULL AND c.image_url IS NULL
  ORDER BY c.id, pi.sort_order NULLS LAST, p.name, pi.id
)
UPDATE categories c
SET image_url = 'https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/' || s.path,
    updated_at = now()
FROM secim s
WHERE c.id = s.kat_id;

-- -----------------------------------------------------------------------------
-- 2) ANA KATEGORİLER — kendi AĞACINDAKİ üründen, altların aldıkları hariç
--    (Ayrı ifade olduğu için 1. adımın yazdıklarını GÖRÜR — snapshot sorunu yok.
--     Aynı ifade içindeki iki ana kategorinin çakışması ise veride imkânsız:
--     product_images.path mükerrer değil ve bir ürün tek category_id'ye bağlı.
--     Yine de son denetim mükerreri AYRICA ölçer — sayıya güvenmiyoruz.)
-- -----------------------------------------------------------------------------
WITH secim AS (
  SELECT DISTINCT ON (c.id) c.id AS kat_id, pi.path
  FROM categories c
  JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
  JOIN product_images pi ON pi.product_id = p.id AND pi.tenant_id = c.tenant_id
  WHERE c.is_active AND c.parent_id IS NULL AND c.image_url IS NULL
    -- EŞİTLİK, LIKE DEĞİL: `pi.path` LIKE deseninin içine girseydi bir gün yolda
    -- geçen `_` veya `%` joker gibi davranıp yanlış eşleşirdi. Bugün 1042 yolun
    -- hiçbirinde joker yok (ölçüldü) ama kural veriye değil, biçime dayanmalı.
    AND NOT EXISTS (
      SELECT 1 FROM categories k
      WHERE k.image_url = 'https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/' || pi.path
    )
  ORDER BY c.id, pi.sort_order NULLS LAST, p.name, pi.id
)
UPDATE categories c
SET image_url = 'https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/' || s.path,
    updated_at = now()
FROM secim s
WHERE c.id = s.kat_id;

-- =============================================================================
-- 3) SON DENETİM — tutmuyorsa migration BAŞARISIZ olur (atomik: tam geri alınır)
-- =============================================================================
DO $$
DECLARE n int; t record;
BEGIN
  SELECT * INTO t FROM _kg_taban;

  -- (a) BU MIGRATION'IN ETKİSİ: tam 19 yeni görsel. Simülasyonla ölçüldü.
  SELECT count(*) INTO n FROM categories WHERE is_active AND image_url IS NOT NULL;
  IF n - t.gorselli_once <> 19 THEN
    RAISE EXCEPTION 'SONUÇ: 19 yeni görsel bekleniyordu, % oldu (önce %, sonra %).',
      n - t.gorselli_once, t.gorselli_once, n;
  END IF;

  -- (b) ⭐SAYI TEK BAŞINA KANIT DEĞİL: aynı fotoğraf iki kategoriye düşmüş olabilir.
  SELECT count(*) INTO n FROM (
    SELECT image_url FROM categories
    WHERE image_url LIKE '%/product-images/%'
    GROUP BY image_url HAVING count(*) > 1
  ) x;
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: % görsel birden fazla kategoriye atanmış — mükerrer kapak.', n; END IF;

  -- (c) Yazılan her adres GERÇEK bir product_images kaydına karşılık gelmeli.
  SELECT count(*) INTO n FROM categories c
  WHERE c.image_url LIKE '%/product-images/%'
    AND NOT EXISTS (
      SELECT 1 FROM product_images pi
      WHERE c.image_url = 'https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/' || pi.path
    );
  IF n <> 0 THEN RAISE EXCEPTION 'SONUÇ: % kategoride kaynağı olmayan görsel adresi var.', n; END IF;

  -- (d) BEN DOKUNMADIM (mutlak sabit değil, önce/sonra farkı)
  SELECT count(*) INTO n FROM products WHERE deleted_at IS NULL;
  IF n <> t.urun_once THEN RAISE EXCEPTION 'SONUÇ: ürün sayısı değişti (% -> %) — bu migration ürüne dokunmamalıydı.', t.urun_once, n; END IF;

  SELECT count(*) INTO n FROM categories;
  IF n <> t.kategori_once THEN RAISE EXCEPTION 'SONUÇ: kategori sayısı değişti (% -> %) — SİLME/EKLEME olmuş.', t.kategori_once, n; END IF;
END $$;

-- =============================================================================
-- GERİ ALMA (elle koşulur, bu dosyanın parçası DEĞİL):
--   UPDATE categories SET image_url = NULL, updated_at = now()
--   WHERE is_active AND image_url LIKE '%/storage/v1/object/public/product-images/%';
-- Ölçüldü (2026-08-31): bu desene uyan MEVCUT kayıt YOK, yani geri alma yalnız bu
-- migration'ın yazdıklarını siler. Pasif kategorideki tek görselli kayıt
-- (inline-duct-fans, '/images/products/vortice_lineo_360.png') ve Hava Perdeleri
-- desene UYMAZ — ikisi de korunur.
-- =============================================================================
