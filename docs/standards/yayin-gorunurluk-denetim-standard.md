# Yayın Görünürlük Denetimi Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Arama görünürlüğünü etkileyen bir yayından (adres ağacı değişikliği, şablon değişikliği,
> site haritası değişikliği) **önce, yayın günü ve sonra** hangi ölçümün hangi araçla, hangi evrende
> koşulacağı; kabul ölçütleri; kusurun sahibi.
> **Niçin var:** REC-300 adres ağacı tek yayını 442 model adresi doğuruyor, ürün/aile/kategori/marka
> öneklerini değiştiriyor (`docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` §1–§2). Plan §5 Faz 5
> ön koşulları (Search Console tabanı, linkinator + unlighthouse taraması) ve §7 yayın ölçümü yazılıydı ama
> **hangi komutla, hangi evrende, hangi eşikle** koşulacağı yazılı değildi (OPS emri 2026-09-24: "cetvel
> yoksa yazımı bu işin kapsamında").
> **Sahibi:** BLOG (karar 93: arama görünürlüğü). Betikleri kapıya/zamanlamaya bağlama: ALTYAPI. Sayfa
> kusurunun onarımı: URUN. Yönlendirme ve başlık (robots, `next.config`, middleware haritası): ALTYAPI + URUN
> (adres haritası URUN'un REC-300 işidir).
> **İlgili:** `pazar-olcum-standard.md` P2 (Search Console tabanı), `rehber-yazisi-standard.md` R8 (iç
> bağlantı kapısı), `canonical-url-standard.md`, bot kalitesi karnesi (`scripts/seo/bot-karnesi.mjs`).

## Y1 — Araçlar

| Araç | Ne ölçer | Betik | Not |
|---|---|---|---|
| Search Console tabanı | tık, gösterim, sıra; sayfa×gün | `scripts/rehber/gsc-taban.mjs` | çıktı depoya girmez (pazar-olcum P6) |
| Adres denetimi | eski adres → aynı ya da **tek** 308 → 200; haritada yönlendirme 0; model sayısı; canonical kendini gösterir; hreflang tr/en/x-default | `scripts/seo/adres-yayin-denetim.mjs` | TAM liste, örneklem değil; yönlendirme izlenmez |
| Bağlantı taraması | site haritasındaki sayfalardaki site içi bağlantı + ürün görseli: kırık, yönlendirme | `scripts/seo/link-tara.mjs` (linkinator 8.1.0) | `--sitemap-url` + CSV (8.1.0'da JSON raporu site haritası kipinde boş — ölçüldü) |
| Sayfa kalitesi | Lighthouse SEO / erişilebilirlik / iyi uygulama / performans | `scripts/seo/sayfa-kalite.mjs` (unlighthouse 0.18.1) | örnekleme kapalı; ölçüt SEO; performans bilgi |
| Bot kalitesi karnesi | 5 bot kimliği × adres: aynı HTML, title, canonical, hreflang, JSON-LD | `scripts/seo/bot-karnesi.mjs --taban` | ön izleme sitesinde de koşar |

Araçlar **kurulmaz**: sürüm sabitli `npx` ile koşar, `package.json`'a dokunulmaz (kalıcı kurulum kararı
ALTYAPI'da, `bagimlilik-kararlari.md`). Her betik `--taban` alır: canlı, yerel ön izleme ya da dal önizlemesi.

## Y2 — Ne zaman ne koşulur

| An | Koşu | Evren | Çıktı |
|---|---|---|---|
| **Taban** (yayından önce, canlı) | gsc-taban · adres-yayin-denetim (`--eski` verilmez → bugünkü site haritası `eski-adresler.json` olarak kaydedilir) · link-tara · sayfa-kalite · bot-karnesi | canlı site haritası | Linear kaydına ek |
| **Ön izleme** (Faz 4, yerel üretim paketi) | adres-yayin-denetim `--taban <önizleme> --eski <taban listesi + plan §6 tam envanteri> --harita <eski-adres-haritasi.json> --model-beklenen 442 --sayfa-denetimi` · link-tara · bot-karnesi | ön izleme | kusur listesi → sahibine |
| **Yayın günü** (Faz 3-C deploy sonrası) | gsc-taban (son taban) · adres-yayin-denetim (ön izlemeyle aynı bayraklar, canlıya) · link-tara · sayfa-kalite + `--kiyas` | canlı | aynı gün Linear + OPS |
| **+1, +7, +28 gün** | adres-yayin-denetim · link-tara · gsc-taban (+7 ve +28'de tabanla kıyas) · sayfa-kalite (+7) | canlı | Linear |

EN_YAYIN kapalıyken `--en-harita-disi-bilincli` verilir: EN alternatifinin haritada olmaması kırmızı değil,
ayrı sayılır (ağaç `noindex`, bilinçli). Bayrak EN_YAYIN açılınca kalkar.

## Y3 — Kabul (yayın günü ve sonrası)

- Eski adres: `AYNI` ya da `TEK-308` (dil öneki olmayan eski adreste tek 307 meşru, plan §4); **ZINCIR 0 ·
  GECICI 0 · YOK 0 · HEDEF-YANLIS 0**.
- Site haritası: her adres doğrudan 200; model adresi sayısı = 442 (plan §1).
- Canonical: her sayfada tek ve kendini gösterir. hreflang: tr + en + x-default (EN bilinçli istisnası hariç).
- Bağlantı taraması: kırık 0 · site içi yönlendirme 0 (plan §7 "kırık 0, zincir 0").
- Sayfa kalitesi: SEO ortalaması tabandan **düşmez**; aynı yolda SEO'su düşen sayfa 0.
- Search Console (+7/+28): "bulunamadı" birikimi 0; tık tabana göre kıyaslanır — geçici düşüş beklenir,
  kalıcı düşüş kusurdur (plan §8).

Kırmızı yayını geri almaz; kusur sahibine aynı gün yazılır (Y4). Geri alma kararı planın §11'indedir.

## Y4 — Kusurun sahibi

| Kusur | Sahip |
|---|---|
| sayfa 404/500, eksik canonical/hreflang, kırık görsel, SEO puanı düşen sayfa | URUN |
| eski adres zinciri, yanlış hedef, eksik harita satırı | URUN (adres haritası REC-300) |
| robots, başlık (`X-Robots-Tag`), `next.config` yönlendirmesi, zamanlama/kapı | ALTYAPI |
| ölçümün kendisi (betik hatası, yanlış kırmızı) | BLOG |

## Ölçüm geçmişi

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-24 | Taban — adres denetimi (canlı, `--sayfa-denetimi --en-harita-disi-bilincli`) | A | Haritada 87 adres (yalnız TR; EN_YAYIN kapalı) · 87/87 doğrudan 200 · model adresi 0 (yayın öncesi beklenen) · canonical yanlış 0 · hreflang eksik 1 (`/tr/destek/merkez`: tr/en/x-default hiç yok → URUN) · EN bilinçli 86 |
| 2026-09-24 | Taban — sayfa kalitesi (unlighthouse 0.18.1, telefon benzetimi) | A | **KISMİ: 59/87 sayfa** — tarama 35 dk sonra çıkış 0 verdi ama toplu raporu yazmadı; sayfa raporlarından okundu (sarmalayıcı artık bunu yapar ve EKSIK-TARAMA diye kırmızı verir). SEO 1,00 (59/59) · erişilebilirlik 0,957 · iyi uygulama 0,96 · performans 0,637 (bilgi). Yayın öncesi tam tarama yeniden koşulmalı |
| 2026-09-24 | Taban — bağlantı taraması (linkinator 8.1.0) | A | 87 sayfa, 782 tekil adres · site içi yönlendirme 0 · kırık 3: `og-default.jpg` 404 (11 kategori sayfası), `hvac_heat_recovery_7.png` 404 (ana sayfa), `og-image.png` 500 (destek merkezi) → URUN |
