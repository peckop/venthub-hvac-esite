-- 20251215: Distribute Products to Subcategories (Data Fix)
-- Moves products from Root categories to Subcategories based on Name keywords

DO $$
DECLARE
  cat_id uuid;
BEGIN
  -- 1. Aksiyal Fanlar
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Aksiyal Fan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Aksiyal Fanlar (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Aksiyal%' AND category_id != cat_id;
  END IF;

  -- 2. Radyal Fanlar
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Radyal Fan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Radyal Fanlar (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Radyal%' AND category_id != cat_id;
  END IF;

  -- 3. Kanal Tipi Fanlar
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Kanal Tipi%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
     RAISE NOTICE 'Updating Kanal Tipi Fanlar (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Kanal Tipi%' AND category_id != cat_id;
  END IF;
  
  -- 4. Çatı Tipi Fanlar
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Çatı Tipi%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Çatı Tipi Fanlar (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Çatı Tipi%' AND category_id != cat_id;
  END IF;

  -- 5. Jet Fanlar
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Jet Fan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Jet Fanlar (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Jet Fan%' AND category_id != cat_id;
  END IF;

  -- 6. Duman Egzoz Fanları
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Duman%' AND name ILIKE '%Fan%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Duman Egzoz Fanları (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id 
    WHERE (name ILIKE '%Duman%' OR name ILIKE '%Egzoz%') 
    AND category_id != cat_id 
    AND name NOT ILIKE '%Jet%'; -- Exclude Jet Fans if matched
  END IF;

  -- 7. Hava Perdeleri (Isıtıcılı)
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Isıtıcılı%' AND name ILIKE '%Perde%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Isıtıcılı Hava Perdeleri (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Isıtıcılı%' AND category_id != cat_id;
  END IF;

   -- 8. Hava Perdeleri (Isıtıcısız)
  SELECT id INTO cat_id FROM categories WHERE name ILIKE '%Isıtıcısız%' AND name ILIKE '%Perde%' LIMIT 1;
  IF cat_id IS NOT NULL THEN
    RAISE NOTICE 'Updating Isıtıcısız Hava Perdeleri (Category ID: %)', cat_id;
    UPDATE products SET category_id = cat_id WHERE name ILIKE '%Isıtıcısız%' AND category_id != cat_id;
  END IF;

END $$;
