# DÜZENLİ GÖREVLER: GEO-SEO

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/GEO-SEO.md`.

## Amaç
Müşterinin bizi arama motorlarında ve yapay zekâ cevaplarında bulabilmesini ölçer ve korur; yayından sonra görünürlük bozulursa (kırık adres, dizinden düşen sayfa, yanlış başlık) aynı gün sahibine yazar.

## Nasıl
canonical-url-standard.md, geo-olcum-standard.md

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Dağıtım sonrası canlı kapı: yayındaki siteyi tek geçişte ölç (adres, başlık, açıklama, hreflang, yetim sayfa, llms.txt) (`scripts/seo/canli-kapi.mjs`) | her dağıtım + günde bir | Actions: .github/workflows altında workflow_run (başarılı production dağıtımı) + günlük schedule; karar 260 ve 261, iskelet ARC-26 (iş akışı sahibi ARAÇ), kontrol içeriği SEO-15 | hayır (kuracak: ARAC) | Her yeni KIRMIZI için ilgili Kanban kartı (bilinen kırmızılar --bilinen ile kart numarasıyla taşınır) | Yeni KIRMIZI 0 (cetvel Y3) |
| Haftalık veri incelemesi: Search Console ve Bing verisini kendi verimizden oku (aynı aramada yarışan sayfalar, dizinlenme oranı, düşen ve ilk 10'a giren sayfalar, son 60 günde değişene dokunma kuralı); Search Console Geliştirmeler ve Alışveriş raporları (ürün snippet'leri, sayfa dizine ekleme, Core Web Vitals) da okunur, yeni sorunda aynı gün kart ve sahibine yazı | haftalık | istem satırı tazelik: istem satırında "SEO haftalık: N gün" (7 gün eşik); satırı ARAÇ kuruyor, ARC-28; incelemenin kendisi SEO-17 | hayır (kuracak: ARAC) | Tek rapor (docs/audits/seo-haftalik-<tarih>.md) ve en önemli 5 iş; her iş için kart önerisi OPS'a | TASLAK: geçti/kaldı ölçütünü GEO-SEO belirler (SEO-17); kural: son 60 günde değişen sayfa için iş önerilmez. |
| Aylık resmi belge incelemesi: Google Search Central ve Bing Webmaster belgelerinde değişen hüküm var mı, cetvellerimiz hâlâ uyuyor mu | aylık | Actions: .github/workflows altında aylık schedule (karar 260); iş akışı ARAÇ'ta ARC-27, resmi kaynak listesi SEO-16 (GEO-SEO) | hayır (kuracak: ARAC) | Değişen hüküm başına Kanban kartı ve cetvel güncellemesi (cetvel sahibi GEO-SEO) | TASLAK: hangi belgelerin kapsandığını GEO-SEO teyit eder. |
| Yayın öncesi liste: adres ağacı, şablon ya da site haritası değiştiren işte taban ölçümü ve ön izleme koşusu (cetvel Y2 taban ve ön izleme satırları) (`scripts/seo/adres-yayin-denetim.mjs`) | olay | kart kapısı: scripts/belge/kart-plan-kapisi.cjs: arama görünürlüğüne dokunan kartta Y2 koşu notunu istemek (henüz yok) | hayır (kuracak: HARITA) | Kusur listesi sahibine (cetvel Y4); taban dosyasının yolu Kanban kartına | Cetvel Y3 kabul: zincir 0, kırık bağlantı 0, yetim sayfa 0, canlı kapı KIRMIZI 0, SEO ortalaması tabandan düşmez |
| Yayın sonrası dizin isteği: canlıya çıkan her yeni ya da değişen adres doğrulanınca aynı turda IndexNow ve Google kuyruğu (değişen adres bildiricisi); Google günlük sınırı sabit değil ölçülür (bugüne dek 11), sınıra takılan adres sonraki gün ilk iş; GEO-SEO'nundur, onay sorulmaz (`scripts/seo/degisen-adres-bildir.mjs`) | olay | Actions: .github/workflows/dizin-tetigi.yml deployment_status (başarılı üretim dağıtımı) + günlük schedule; iş akışı ALT-91 (#1976), kuyruk komutu --kuyruk-sonraki | evet | Adres başına Search Console isteği ve IndexNow sonucu ilgili Kanban kartına; engel varsa (oturum yok, günlük sınır) OPS'a tek satır | Canlıda 200 görülen her yeni ya da değişen adres için aynı gün istek; Google sınırına takılan ertesi gün ilk iş |
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını rol kartına, kurallara ve Dosyalar satırına karşı okur; müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: istem satırında "öz-değerlendirme: N gün" (7 gün eşik); satırı ARAÇ kuruyor (OPS-168 O6) | hayır (kuracak: ARAC) | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |

6 görev, tetiğe bağlı 1. Tetiğin kurulmasını bekleyen: ARAC 4 · HARITA 1.
