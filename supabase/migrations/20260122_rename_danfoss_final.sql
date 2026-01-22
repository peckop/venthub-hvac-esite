-- Rename 'Danfoss' (and 'Frekans Konvertörleri' if mistakenly applied) to 'Frekans Konvertörü'
-- Correct casing (Title Case) and singular form as requested.

UPDATE categories
SET 
  name = 'Frekans Konvertörü',
  slug = 'frekans-konvertoru',
  description = 'Yüksek verimli hız kontrolü ve motor sürücü teknolojileri'
WHERE slug IN ('danfoss', 'frekans-konvertorler', 'frekans-konvertorleri', 'vlt');
