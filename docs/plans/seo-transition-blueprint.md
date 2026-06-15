# SEO Geçiş Blueprint'i — Eski Site → VentHub (Sıralama Koruyarak)

> **Bu dosya nedir?** Mevcut, canlı, Google'da yıllardır iyi sıralanan bir siteden (ör. Avensair)
> VentHub'a geçerken arama otoritesini **KAYBETMEDEN** geçişin operasyonel planı. Tek-seferlik/fazlı
> bir iştir → `docs/plans/`. Cetvel değil, **yürütme haritası**. Otorite: bu dosya.
> İlgili: [analytics-standard](../standards/analytics-standard.md) (Search Console ortak) · `../../VISION.md` (önce Avensair).

## Neden kritik
Hedef müşterinin sitesi **7-8 yıldır aktif**, Google sıralamaları güçlü — bu **parayla satın
alınamayan bir varlık** (domain otoritesi + backlink + sıralanan içerik). Yanlış geçiş = sıralama
düşüşü = organik trafik + iş kaybı. "Yeni site daha güzel" yetmez; **sıralamayı taşımak** şart.
Bu, perfeksiyonizm değil **go-live ön-koşulu**.

## Mevcut zemin (VentHub'da zaten var)
- `next.config.mjs` — **13 kalıcı (301) redirect** (eski TR slug → yeni EN slug). *(Bu, dahili yapı
  geçişi içindi; eski-SİTE geçişi için ayrı + kapsamlı harita gerekir.)*
- `src/app/sitemap.ts` (dinamik sitemap.xml) + `src/app/robots.ts` aktif.
- **hreflang** (tr/en, self-referencing + reciprocal) ve **JSON-LD** (WebSite/Organization) mevcut.
- Next.js/Vercel → hızlı LCP, mobil-uyumlu (teknik SEO temeli sağlam).

**Eksik:** eski sitenin URL envanteri, eski→yeni 301 haritası, içerik paritesi, Search Console takibi.

## Fazlar (her fazın "yeterli mi" ölçütü var)

### S0 — Envanter & baseline (ölçemediğini koruyamazsın)
- Eski sitenin **sıralanan TÜM URL'lerini** çıkar: eski Search Console export + bir crawl. Her URL:
  hedef kelime, aylık tıklama/gösterim, sıra.
- Backlink profili (en değerli geri-bağlantı alan sayfalar).
- **DoD:** "değerli URL" listesi (sıralayan + backlink alan) tabloya döküldü.

### S1 — URL eşleme & 301 haritası
- Her eski URL → yeni VentHub karşılığı (1:1 tercih). Karşılığı yoksa en yakın üst kategori (asla 404).
- **301 (kalıcı) redirect** uygula (`next.config.mjs redirects()` veya domain/edge seviyesi).
- Zincir/loop yok (eski→yeni tek sıçrama).
- **DoD:** her değerli URL'in 301'i var ve hedefi 200 dönüyor.

### S2 — İçerik paritesi
- Sıralayan sayfaların **eşit veya daha iyi** karşılığı yeni sitede olmalı (aynı arama niyeti + daha
  iyi UX). İçerik kaybı = sıralama kaybı.
- title / meta / H1 / canonical tekil ve doğru; structured-data korunur.
- **DoD:** eski sıralayan sayfaların hiçbiri ince (thin) karşılığa düşmüyor.

### S3 — Search Console geçişi & cutover
- Yeni domain'i Search Console'da **doğrula**, sitemap gönder.
- Domain değişiyorsa **Change of Address** aracını kullan.
- **Aşamalı cutover:** mümkünse eski site bir süre erişilebilir kalsın; anahtar çevrilince ilk 2-4
  hafta **yakın izle** (coverage hataları, sıra düşüşü → anında düzelt).
- **DoD:** Search Console coverage temiz, 301'ler indexleniyor, ana kelimelerde kalıcı düşüş yok.

## İzleme
Başarı **Search Console + analytics** ile ölçülür → [analytics-standard](../standards/analytics-standard.md).
Ana metrik: ilk 4-8 haftada toplam organik tıklama + hedef kelime sıralarının **korunması/artması**.

## Açık kararlar (Avensair input'u gerekir)
- [ ] Domain stratejisi: aynı domain mi (Change of Address) yoksa yeni mi?
- [ ] Eski site CMS/hosting + Search Console erişimi (envanter export için).
- [ ] Cutover tarihi + rollback planı.

> **Durum:** İskelet (v1). Eski site erişimi + Search Console export gelince S0 envanteriyle doldurulur.
