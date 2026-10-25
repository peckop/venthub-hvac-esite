---
paths:
  - "src/components/products/*.tsx"
  - "src/views/category/**"
  - "src/lib/services/**"
  - "src/lib/seo/jsonld.ts"
  - "src/lib/pricing/**"
  - "src/app/_components/{aileSayfasi,ProductDetailPageView,kategoriSayfasi,urunlerSayfasi}.tsx"
---

# URUN: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/URUN-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Servis katmanında DI (Mutlak Kural 2).
2. Fiyat görünmüyorsa şemada da yok.
3. `sku` ve model kodu yayınlanmaz kuralı: `INV-SKU-GORUNMEZ-1`.
4. Ses ve performans sayısı koşulsuz yazılmaz. Vitrinde dB(A) gibi bir sayı yalnız tek üreticiden.
5. İstemci demetine ham veri girmez.
6. Vitrin metni sırası: Design → KATALOG kaynak doğrulaması → ÜRÜN uygulaması (O8).
7. Migration'lı PR yalnız bu pencerede Recep onayıyla birleşir (Mutlak Kural 13); adres şeması değişikliği tek başına Recep'e sorulur.
8. Alt ajan görevine dizin ve dal yazılır, rapor "hangi dizinde, hangi dalda" der; müdür push öncesi `git status`/`git log` ile doğrular.
