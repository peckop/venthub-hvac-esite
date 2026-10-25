---
paths:
  - "scripts/icerik-hatti/**"
  - "scripts/db/product-data/**"
---

# KATALOG: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/KATALOG-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Baskı tazeliği. Canlı değer doğrulanmadan ya da yazılmadan önce kaynağın üreticideki SON baskısı `kaynak-dizini/katalog-envanteri.json`'dan okunur.
2. Alan değişmeden önce okuyanlar taranır. Bir `technical_specs` anahtarının değeri değişmeden, kaldırılmadan ya da başka alana taşınmadan önce `src/` ve başka departmanların veri dosyalarında.
3. Aynı sayı metinde de olabilir. Bir sayısal özellik düzeltilince aynı sayının `description_i18n`.
4. Sütun ya da koşul belirsizse tahminle yazılmaz. Kaynak aynı ölçüt için birden çok sütun veriyorsa.
5. Canlı yazım betiği kalıbı. Kuru koşum varsayılan; bayatlık kapısı.
6. Önceki çalışma araması içerik anahtarıyla yapılır.
7. Kanıt mekaniği. Ölçüm dosyaları proje kökü dışında tutulursa doğrulayıcı okuyamaz: karta manuel kanıt.
8. Düzeltme planında editör notu taşınmaz.
