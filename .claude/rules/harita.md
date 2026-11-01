---
paths:
  - "scripts/belge/**"
  - "docs/roller/**"
---

# HARITA: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/HARITA-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Ortak satır 17 kartı birden büyütür; kart baytı ve açılış özeti önce ölçülür.
2. Satır kısaltmadan önce o ifadeyi bağlayan test aranır.
3. Yeni cetvel başlığı Sahibi ve Son doğrulama taşır; README satırı, sahiplik kaydı ve araç envanteri satırı aynı PR'da gelir.
4. JSON ya da cetvel okuyan her test koşulur, yalnız yazdığın değil.
5. Üretici `--yaz` CRLF checkout'ta fazladan dosya değiştirir; yalnız gerçek değişenler tutulur.
6. Ağır test dosyaları paralel değil tek tek koşulur.
