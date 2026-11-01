---
paths:
  - "src/data/bilgiMerkezi/**"
  - "scripts/rehber/**"
  - "docs/standards/rehber-yazisi-standard.md"
---

# BLOG: rehber yazısı ders listesi (yol kapsamlı; bu dosyalara dokununca yüklenir)

Bu dosya işaretçidir. Tam metin ve kanıt: `docs/standards/rehber-yazisi-standard.md` R10.5 (ders listesi) ve R10.6 (yayın öncesi kontrol listesi). Yeni yazıya başlarken işbaşı notuna "R10.5 okundu" yaz; B8 PR gövdesine R10.6 tablosunu kanıtlı doldur (kanıtsız madde AÇIK, yayın çıkmaz).

## R10.5 dersleri (başlıklar)

- Sayfa yalnız durum koduyla değil içeriğiyle ölçülür; yazıdaki sayılar canlı sayfayla karşılaştırılır.
- Ölçüm dosyası scratchpad'e yazılır (Git Bash `/tmp` ile Node `/tmp` aynı klasör değil).
- Birleşmeden sonra `verify_completion` ana dizindeki dosyaya bakar; ana dizin master'ı almadan kırmızı verir.
- Yeni yazı ana sayfa kartını artırırsa axe kontrast tavanı PR'dan önce ölçülür.
- Test fikstürleri yeni yazıyla değişir (sahte katalog, site haritası altın dosyası, rota-dili).
- Ana sayfa Bilgi bloğu en yeni 3 rehberi basar; dördüncü yazıyla en eski çıkar.
- Rehber kartı yazının meta açıklamasını kopyalamaz (`kartOzeti`, `data-nosnippet`).
- Katalog sayısı ile canlı sayfa sayısı karşılaştırılırken ailenin bölünüp bölünmediğine bakılır.
- `hide_price` kategoride fiyat cümlesi yazılmaz; gömülü RSC verisinde fiyat olabilir.
- Üretici/DOE belgesi künyesi sayfada yazılı numaradan ölçülür (basılı numara ile PDF indeksi farklı).
- Tuzaklı kopya yanında temiz kopya zorunludur.

## R10.6 sekiz madde (B8 PR gövdesinde tablo)

1. Kart meta kopyası yok, yazıyı gösterecek sayfalar listeli. 2. Her sayı katalog ve canlı sayfayla aynı. 3. Fiyat ya da fiyat ima eden cümle yok. 4. R10.5 beş madde (axe, fikstür, ölçüm dosyası konumu). 5. R11 başlık kuralı (`baslikDenetle`). 6. Site haritası, canonical, hreflang, noindex yok. 7. İç bağlantılar çözülüyor, 404 sıfır. 8. Marka, sertifika, performans iddiası resmî kaynakta birebir var.
