# VentHub marka paketi — Karar 405 (taslak, 21 Ekim 2026)

> Bu dosya marka projesindeki (`670f9f75`) `brand/README.md` yerine geçecek taslaktır. DESIGN-MARKA oraya kopyalar; ardından DS `brand/` yeniden birebir kopyalanır.

Kimlik kaynağı: `1 Venthub Marka Kilavuzu.dc.html` (A–I). Değer kaynağı: `tokens.css` (tek değer dosyası). Eski hâl: `ARSIV brand 2026-10-21 oncesi/`.

## İçindekiler

| Dosya | Ne |
|---|---|
| `tokens.css` | Renk, yüzey, kenar, metin, köşe, gölge, hareket, yazı, boşluk — HSL üçlüsü custom property |
| `tailwind-brand.js` | `tailwind.config.js` `theme.extend` eşlemesi |
| `logo/` | 30 SVG (işaret, kilit, favicon, avatar, paylaşım) — değişmedi |
| `icons/` | 144 SVG: 16 ikon × 64/48/24 px × tamrenk/lacivert/koyu — değişmedi |

## Renk

| Token | Hex | Rol |
|---|---|---|
| `--primary-navy` = `--brand-cyan` = `--brand-cyan-ink` | `#0B4F6C` | Tek arayüz rengi: yapı, bağlantı, seçili hâl, sayaç ve rozet zemini (beyazda 8.94) |
| `--action-terracotta` | `#D95D0E` | Logo üst dilimi, P-Q çalışma noktası. Metin zemini değil (3.80) |
| `--action-terracotta-deep` | `#BF5309` | Sayfanın tek dolu ana eylem düğmesi (beyaz etiket 4.71) |
| `--accent-air-green` | `#3D7A1E` | Yalnız Hava Arıtma sayfaları |
| `--warn-amber` | `#F59E0B` | Yalnız uyarı kuralı, metin değil |

Logodaki lacivert `#1A2B4A` ve turkuaz `#0088B0` yalnız logo ve ikon dosyalarının içinde kalır.

Yüzey: page `#F2F7F9` · card `#FFFFFF` · subtle `#F7FAFB` · inset `#EAF1F4` · p2-tint `#DDEBF1` · dark `#10242E` (yalnız alt bilgi) · dark-inset `#155F7F`.
Kenar: control `#B8CDD6` › hairline `#D6E3E9` › row `#E3EDF1`.
Metin (tam opak): strong `#10242E` · body `#2F4652` · muted `#526772` (sayfada 5.49) · on-dark beyaz · on-dark-muted `#BFE0EC`.

## Yazı

| Aile | Kullanım |
|---|---|
| **Schibsted Grotesk** | Başlık. h1/h2 `--weight-h1` 800; h3 ve kart başlıkları `--weight-baslik` 600 |
| **Onest** | Arayüz, uzun metin, teknik değer (`tabular-nums`) |
| **Archivo 700** | Yalnız logo kilidinin `<text>`'i |

Source Serif 4 ve IBM Plex Mono kalktı. `--font-serif` ve `--font-mono` eski adlar, değer Onest.

> **Düzeltme gerekiyor:** `tokens.css` `--weight-baslik` şu an 800. Karar 21 Ekim: **600**; `--weight-h1: 800` eklenir (S5 `veri/token.css` ile aynı).

## Biçim

- Köşe: düğme, çip, rozet, arama oval `999px` · kart `16px` · büyük blok/panel/sahne `24px` · giriş/fotoğraf kutusu `12px` · mobil alt panel üst `8px`.
- Gölge yalnız dört yerde: `--shadow-ince` (seçili) · `--shadow-kart-hover` · `--shadow-overlay` (açılır katman) · `--shadow-urun-gorsel` (filter, ürün fotoğrafı).
- Gradyan ve bulanıklık yalnız ana sayfa sahnesinde. Opaklık durum anlatmaz.

## Hareket

Arayüz tepkisi 120 / 200 / 280 ms, `cubic-bezier(0.2, 0, 0, 1)`. Geçiş 600 ms (500–800), `cubic-bezier(0.2, 0.9, 0.25, 1)`. Hareketi azalt → 0.

## Desen kuralları (21 Ekim kararları dahil)

- Tek dolu kiremit düğme: "Teklif iste" / "Sepete ekle" / "Ödemeye geç". "Teklif al" yazılmaz.
- Çerçeveli düğme üstüne gelince dolu petrol + beyaz etiket.
- Çip: seçili dolu petrol + ✓. Rozet: nesnel (p2-tint + body) · hüküm (petrol + beyaz) · soluk (inset + muted). Kiremit rozette yok.
- Hüküm kutusu: **4 px** sol kural + etiket (yeter petrol · sınırda amber · yetmez kiremit-deep).
- Ürün kartı: fotoğraf kutusu 12 px, subtle zemin; fotoğraf yoksa 2 px petrol üst kural. Fotoğrafa rozet bindirilmez — **tek istisna:** seri kartında (FamilyCard) model sayısı rozeti.
- SSS / katlı satır: çerçevesiz, 1 px row ayırıcı, kart içinde.
- P-Q: ana eğri petrol, ızgara row, eksen control, çalışma noktası kiremit.

## Boşluk (K37)

tight 5 · inline 7 · grid 10 · stack 14 · card 16 · page-mobile 18 · card-loose 20 · block 30 · page 40. 44 px dokunma hedefi (`--hedef-min`), 1060 px içerik sütunu.

## Logo ve ikon

Değişmedi; ayrıntı `logo/README.md`. Açık header `venthub-kilit-yatay-tamrenk`, koyu alt bilgi `-tamrenk-koyu`, alt bilgide ikonlar `-koyu`. Logo elle çizilmez; sönük hâl `-soluk` dosyasından.

## Marka listesi

Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva — veriden gelen yazımla.

## Açık

- Ana sayfa sahnesinin dört petrol tonu (#2F7F9F · #7FB0C6 · #08384D · #C5D6DE): DESIGN-MENU S5'te ad verecek.
