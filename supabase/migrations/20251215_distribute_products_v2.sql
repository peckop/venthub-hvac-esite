-- 20251215_distribute_products_v2.sql
-- Smart product distribution to subcategories based on product name keywords
-- This runs as a DB migration, bypassing RLS

DO $$
DECLARE
  subcat_rec RECORD;
  updated_count INT;
BEGIN
  -- ============ FANLAR SUBCATEGORIES ============
  
  -- Sessiz Kanal Tipi Fanlar (matches "Quiet", "Lineo...Quiet")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'sessiz-kanal-tipi-fanlar';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Quiet%' OR name ILIKE '%Sessiz%' OR name ILIKE '%Silent%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Sessiz Kanal Tipi Fanlar: % updated', updated_count;
  END IF;

  -- Kanal Tipi Fanlar (matches "Lineo", "CA-IL", "Kanal Tipi" but NOT "Quiet")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'kanal-tipi-fanlar';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Lineo%' OR name ILIKE '%CA-IL%' OR name ILIKE '%Kanal Tipi%')
      AND name NOT ILIKE '%Quiet%'
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Kanal Tipi Fanlar: % updated', updated_count;
  END IF;

  -- Otopark Jet Fanları (matches "Jet Fan", "TJF", "JPF")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'otopark-jet-fanlari';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Jet Fan%' OR name ILIKE '%TJF%' OR name ILIKE '%JPF%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Otopark Jet Fanları: % updated', updated_count;
  END IF;

  -- Çatı Tipi Fanlar (matches "Çatı", "Roof", "TRM", "TRT", "TORRETTE")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'cati-tipi-fanlar';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Çatı%' OR name ILIKE '%Roof%' OR name ILIKE '%TRM%' OR name ILIKE '%TRT%' OR name ILIKE '%TORRETTE%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Çatı Tipi Fanlar: % updated', updated_count;
  END IF;

  -- Duman Egzoz Fanları (matches "Duman", "THGT", "F400", "F300", "Smoke")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'duman-egzoz-fanlari';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Duman%' OR name ILIKE '%THGT%' OR name ILIKE '%F400%' OR name ILIKE '%F300%' OR name ILIKE '%Smoke%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Duman Egzoz Fanları: % updated', updated_count;
  END IF;

  -- Sığınak Havalandırma Fanları (matches "Sığınak", "BVU", "Shelter")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'siginak-havalandirma-fanlari';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Sığınak%' OR name ILIKE '%BVU%' OR name ILIKE '%Shelter%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Sığınak Havalandırma Fanları: % updated', updated_count;
  END IF;

  -- Nicotra Gebhardt Fanlar (matches "NICOTRA", "GEBHARDT", "DD ", "ADH")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'nicotra-gebhardt-fanlar';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%NICOTRA%' OR name ILIKE '%GEBHARDT%' OR name ILIKE 'DD %' OR name ILIKE '% DD %' OR name ILIKE '%ADH%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Nicotra Gebhardt Fanlar: % updated', updated_count;
  END IF;

  -- Duvar Tipi Kompakt Aksiyal Fanlar (matches "Vario", "Punto", "Duvar")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'duvar-tipi-kompakt-aksiyal-fanlar';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Vario%' OR name ILIKE '%Punto%' OR name ILIKE '%Duvar%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Duvar Tipi Kompakt Aksiyal Fanlar: % updated', updated_count;
  END IF;

  -- ============ HAVA PERDELERİ SUBCATEGORIES ============
  
  -- Elektrikli Isıtıcılı (matches "AD-H", "AD-E", "Elektrikli", "Isıtıcılı")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'elektrikli-isitici';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%AD-H%' OR name ILIKE '%AD-E%' OR name ILIKE '%Elektrikli%' OR name ILIKE '%Isıtıcılı%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Elektrikli Isıtıcılı: % updated', updated_count;
  END IF;

  -- Ortam Havalı (matches "AD-" without "AD-H", "AD-E" or "Isıtıcısız")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'ortam-havali';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%Isıtıcısız%' OR name ILIKE '%Ambient%' OR name ILIKE '%Ortam Havalı%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Ortam Havalı: % updated', updated_count;
  END IF;

  -- ============ ISI GERİ KAZANIM SUBCATEGORIES ============

  -- Konut Tipi (matches "HRS", "Konut", "Alüminyum Eşanjör")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'konut-tipi-isi-geri-kazanim';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%HRS%' OR name ILIKE '%Konut%' OR name ILIKE '%Alüminyum Eşanjör%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Konut Tipi IGK: % updated', updated_count;
  END IF;

  -- ============ HIZ KONTROLÜ SUBCATEGORIES ============

  -- DANFOSS (matches "DANFOSS", "VLT", "FC ")
  SELECT id INTO subcat_rec FROM categories WHERE slug = 'danfoss';
  IF subcat_rec.id IS NOT NULL THEN
    UPDATE products SET category_id = subcat_rec.id
    WHERE (name ILIKE '%DANFOSS%' OR name ILIKE '%VLT%')
      AND category_id != subcat_rec.id;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'DANFOSS: % updated', updated_count;
  END IF;

END $$;
