-- Rename 'Danfoss' category to 'Frekans Konvertörleri'
-- This ensures the category tree uses Product Type naming instead of Brand naming.

UPDATE categories
SET 
  name = 'Frekans Konvertörleri',
  slug = 'frekans-konvertorler',
  description = 'Enerji verimliliği sağlayan hız kontrol ve frekans konvertör çözümleri'
WHERE slug = 'danfoss';
