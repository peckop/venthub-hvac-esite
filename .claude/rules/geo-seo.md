---
paths:
  - "scripts/seo/**"
  - "src/lib/seo/**"
  - "src/lib/bilgiMerkezi/jsonld.ts"
  - "src/app/{robots,sitemap}.ts"
  - "public/llms.txt"
  - "docs/standards/{geo-olcum,yayin-gorunurluk-denetim,pazar-olcum,dizin-sistemleri}-standard.md"
  - "docs/audits/{geo,seo}-*"
---

# GEO-SEO: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/GEO-SEO-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Arama ve sorgu verisi depoya yazılmaz (P6). Search Console sorguları, tıklama ve gösterim satırları, sayfa bazlı arama verisi depoya, PR'a, kart dışı belgeye girmez; depo dışı arşivde durur.
2. Dizin tetiği bir insanın hatırlamasına bağlı kalmaz.
3. Google günlük dizin isteği sınırı sabit varsayılmaz, ölçülür.
4. Fiyatsız üründe işaretleme (karar 379). Sahte fiyat, `price: 0` ve uydurma yorum/derecelendirme yazılmaz; görünür olmayan değer işaretlenmez.
5. `FAQPage` JSON-LD konmaz (`src/lib/bilgiMerkezi/jsonld.ts:5`: SSS zengin sonucu 2026-05-07'de kalktı); görünür SSS kalır.
6. Ölçmeden "dizinde yok", "bozuk" ya da "boş" denmez.
7. Arama sonucunda eski metin görülürse önce adres ölçülür.
8. Search Console "Geliştirmeler" ve "Alışveriş" raporları haftalık okunur
