# DÜZENLİ GÖREVLER: GEO-SEO

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/GEO-SEO.md`.

## Amaç
Müşterinin bizi arama motorlarında ve yapay zekâ cevaplarında bulabilmesini ölçer ve korur; yayından sonra görünürlük bozulursa (kırık adres, dizinden düşen sayfa, yanlış başlık) aynı gün sahibine yazar.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Dağıtım sonrası canlı kapı: yayındaki siteyi tek geçişte ölç (adres, başlık, açıklama, hreflang, yetim sayfa, llms.txt) (`scripts/seo/canli-kapi.mjs`) | her dağıtım | Actions: .github/workflows altında workflow_run + schedule (cetvel yayin-gorunurluk Y2 son satır: ALTYAPI ekleyecek, REC-502) | hayır (kuracak: ALTYAPI) | Her yeni KIRMIZI için ilgili Kanban kartı (bilinen kırmızılar --bilinen ile kart numarasıyla taşınır) | Yeni KIRMIZI 0 (cetvel Y3) |
| Haftalık veri incelemesi: Search Console taraması ve Googlebot gözüyle örnek sayfalar (son tarama, dizin durumu, site haritası hataları) (`scripts/seo/gsc-url-denetim.mjs`) | haftalık | istem satırı tazelik: son inceleme kaydı 8 günü aşınca uyarır (henüz yazılmadı) | hayır (kuracak: HARITA) | Kanban kartına tek tablo notu; tabana (REC-300 taban tablosu) kıyas | TASLAK: GEO-SEO belirler. Cetvelde haftalık eşik yok; Y3 yalnız +7 ve +28 gün kıyasını ister. |
| Aylık resmi belge incelemesi: Google Search Central ve Bing Webmaster belgelerinde değişen hüküm var mı, cetvellerimiz hâlâ uyuyor mu | aylık | istem satırı tazelik: son inceleme kaydı 35 günü aşınca uyarır (henüz yazılmadı) | hayır (kuracak: HARITA) | Değişen hüküm başına Kanban kartı ve cetvel güncellemesi (cetvel sahibi GEO-SEO) | TASLAK: hangi belgelerin kapsandığını GEO-SEO teyit eder. |
| Yayın öncesi liste: adres ağacı, şablon ya da site haritası değiştiren işte taban ölçümü ve ön izleme koşusu (cetvel Y2 taban ve ön izleme satırları) (`scripts/seo/adres-yayin-denetim.mjs`) | olay | kart kapısı: scripts/belge/kart-plan-kapisi.cjs: arama görünürlüğüne dokunan kartta Y2 koşu notunu istemek (henüz yok) | hayır (kuracak: HARITA) | Kusur listesi sahibine (cetvel Y4); taban dosyasının yolu Kanban kartına | Cetvel Y3 kabul: zincir 0, kırık bağlantı 0, yetim sayfa 0, canlı kapı KIRMIZI 0, SEO ortalaması tabandan düşmez |

4 görev, tetiğe bağlı 0. Tetiğin kurulmasını bekleyen: ALTYAPI 1 · HARITA 3.
