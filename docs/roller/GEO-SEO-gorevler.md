# DÜZENLİ GÖREVLER: GEO-SEO

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/GEO-SEO.md`.

## Amaç
Müşterinin bizi arama motorlarında ve yapay zekâ cevaplarında bulabilmesini ölçer ve korur; yayından sonra görünürlük bozulursa (kırık adres, dizinden düşen sayfa, yanlış başlık) aynı gün sahibine yazar.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Dağıtım sonrası canlı kapı: yayındaki siteyi tek geçişte ölç (adres, başlık, açıklama, hreflang, yetim sayfa, llms.txt) (`scripts/seo/canli-kapi.mjs`) | her dağıtım + günde bir | Actions: .github/workflows altında workflow_run (başarılı production dağıtımı) + günlük schedule; karar 260 ve 261, iskelet ARC-26 (iş akışı sahibi ARAÇ), kontrol içeriği SEO-15 | hayır (kuracak: ARAC) | Her yeni KIRMIZI için ilgili Kanban kartı (bilinen kırmızılar --bilinen ile kart numarasıyla taşınır) | Yeni KIRMIZI 0 (cetvel Y3) |
| Haftalık veri incelemesi: Search Console ve Bing verisini kendi verimizden oku (aynı aramada yarışan sayfalar, dizinlenme oranı, düşen ve ilk 10'a giren sayfalar, son 60 günde değişene dokunma kuralı) | haftalık | istem satırı tazelik: istem satırında "SEO haftalık: N gün" (7 gün eşik); satırı ARAÇ kuruyor, ARC-28; incelemenin kendisi SEO-17 | hayır (kuracak: ARAC) | Tek rapor (docs/audits/seo-haftalik-<tarih>.md) ve en önemli 5 iş; her iş için kart önerisi OPS'a | TASLAK: geçti/kaldı ölçütünü GEO-SEO belirler (SEO-17); kural: son 60 günde değişen sayfa için iş önerilmez. |
| Aylık resmi belge incelemesi: Google Search Central ve Bing Webmaster belgelerinde değişen hüküm var mı, cetvellerimiz hâlâ uyuyor mu | aylık | Actions: .github/workflows altında aylık schedule (karar 260); iş akışı ARAÇ'ta ARC-27, resmi kaynak listesi SEO-16 (GEO-SEO) | hayır (kuracak: ARAC) | Değişen hüküm başına Kanban kartı ve cetvel güncellemesi (cetvel sahibi GEO-SEO) | TASLAK: hangi belgelerin kapsandığını GEO-SEO teyit eder. |
| Yayın öncesi liste: adres ağacı, şablon ya da site haritası değiştiren işte taban ölçümü ve ön izleme koşusu (cetvel Y2 taban ve ön izleme satırları) (`scripts/seo/adres-yayin-denetim.mjs`) | olay | kart kapısı: scripts/belge/kart-plan-kapisi.cjs: arama görünürlüğüne dokunan kartta Y2 koşu notunu istemek (henüz yok) | hayır (kuracak: HARITA) | Kusur listesi sahibine (cetvel Y4); taban dosyasının yolu Kanban kartına | Cetvel Y3 kabul: zincir 0, kırık bağlantı 0, yetim sayfa 0, canlı kapı KIRMIZI 0, SEO ortalaması tabandan düşmez |

4 görev, tetiğe bağlı 0. Tetiğin kurulmasını bekleyen: ARAC 3 · HARITA 1.
