# VentHub marka paketi · Karar 405 (21 Ekim 2026)

Kaynak: Marka Kılavuzu projesi (DESIGN-MARKA), `1 Venthub Marka Kilavuzu.dc.html` (bölüm A–I).
Karar SSOT'u Linear "Kararlar — Vitrin 15A"dır; bu paket onun dışa aktarımıdır. Eski hâl:
`ARSIV brand 2026-10-21 oncesi/`.

## İçindekiler

| Dosya | Ne |
|---|---|
| `tokens.css` | **Tek değer dosyası:** renk, yüzey, kenar, metin, köşe, gölge, hareket, yazı, boşluk (HSL üçlüsü custom property) |
| `tailwind-brand.js` | `tailwind.config.js` `theme.extend` eşleme parçası |
| `logo/` | 30 SVG (değişmedi) |
| `icons/` | 144 SVG: 16 ikon × 64/48/24 px × tamrenk / lacivert / koyu (değişmedi) |

## Renk

Arayüzde **tek petrol**. Lacivert/turkuaz ayrımı kalktı. Üç eski ad, depo okuduğu için korunur ve değeri aynıdır.

| Token | Hex | Rol |
|---|---|---|
| `--primary-navy` · `--brand-cyan` · `--brand-cyan-ink` | `#0B4F6C` | Yapı, bağlantı, seçili hâl, sayaç ve rozet zemini. Beyazda 8.94, sayfada 8.28 |
| `--action-terracotta` | `#D95D0E` | Logo üst dilimi, P-Q çalışma noktası. Metin zemini değil (3.80) |
| `--action-terracotta-deep` | `#BF5309` | Sayfanın tek dolu ana eylem düğmesi. Beyaz etiketle 4.71 |
| `--accent-air-green` | `#3D7A1E` | Yalnız Hava Arıtma sayfaları |
| `--warn-amber` | `#F59E0B` | Yalnız uyarı kutusunun kenarı |

Logodaki lacivert #1A2B4A ve turkuaz #0088B0 **yalnız logo ve ikon dosyalarının içinde** durur, arayüze taşınmaz.

| Yüzey / metin / kenar | Hex | Not |
|---|---|---|
| `--surface-page` | `#F2F7F9` | sayfa zemini |
| `--surface-card` | `#FFFFFF` | kart, header |
| `--surface-subtle` | `#F7FAFB` | kart içi ikincil bölge, fotoğraf kutusu |
| `--surface-inset` | `#EAF1F4` | gömülü alan, soluk rozet |
| `--p2-tint` | `#DDEBF1` | çip ve rozet zemini |
| `--surface-dark` | `#10242E` | koyu bant, **yalnız alt bilgi** |
| `--surface-dark-inset` | `#155F7F` | koyu bant içi gömülü alan |
| `--text-strong` | `#10242E` | beyazda 15.98 |
| `--text-body` | `#2F4652` | beyazda 9.91, sayfada 9.18 |
| `--text-muted` | `#526772` | beyazda 5.93, sayfada 5.49 |
| `--text-on-dark-muted` | `#BFE0EC` | koyu bantta 11.48 |
| `--border-control` | `#B8CDD6` | düğme ve giriş kenarı (1.65) |
| `--border-hairline` | `#D6E3E9` | kart kenarı (1.31) |
| `--border-row` | `#E3EDF1` | satır ayırıcı (1.19) |

Metin her zaman tam opaktır. Soluk hâl ayrı token ile yazılır. Dördüncü arayüz rengi üretilmez.

## Yazı

- **Schibsted Grotesk:** başlık. h1 ve h2 800 ağırlık, harf aralığı −0.02 … −0.03em.
- **Onest:** arayüz, uzun metin ve teknik değer. Teknik değer `tabular-nums` ile yazılır, ayrı mono aile yok.
- **Archivo 700:** yalnız logo kilitlerinin `<text>`'i. Yüklü kalmazsa logo yanlış çizilir.
- **Boylar:** overline 12.5 (600 · 0.08em, büyük harf, `lang="tr"`) · caption 14 · body-small 15 · body 16 · editorial 17.
- Inter, Archivo (arayüzde), Source Serif 4 ve IBM Plex Mono kullanılmaz.

## Köşe

`--radius-dugme` 999px (düğme, çip, rozet, arama) · `--radius-kart` 16px · `--radius-kart-buyuk` 24px (panel, yan panel, sahne) · `--radius-kucuk` 12px (giriş, fotoğraf kutusu) · `--radius-panel` 8px 8px 0 0 (mobil alt panel).

## Gölge (yalnız bu dört yerde)

`--shadow-ince` (seçili düğme ve çip) · `--shadow-kart-hover` (kart üstüne gelince) · `--shadow-overlay` (açılır katman, yan panel, menü) · `--shadow-urun-gorsel` (`filter`, yalnız ürün fotoğrafı).

Gradyan ve bulanıklık arayüz yüzeyinde kullanılmaz. Yalnız ana sayfa sahnesinde ve örtü perdesinde izinlidir. Opaklık durum anlatmak için kullanılmaz; yalnız belirme/kaybolma geçişinde ve görsel katmanda izinlidir.

## Hareket

- **Arayüz tepkisi:** `--hareket-hizli` 120ms · `--hareket-normal` 200ms · `--hareket-acilis` 280ms · eğri `cubic-bezier(0.2, 0, 0, 1)`.
- **Geçiş:** `--hareket-gecis` 600ms (aralık 500–800) · eğri `cubic-bezier(0.2, 0.9, 0.25, 1)`. Sayfa geçişi, ana sayfa sahnesi ve teklif uçuşunda kullanılır.
- `prefers-reduced-motion: reduce` açıksa bütün süreler 0 olur.
- Kendi kendine tekrarlayan hareket yalnız ana sayfa sahnesinde kullanılır.
- Kartta yakınlaştırma (ölçek) yapılmaz. Fotoğraf değişimi ve 2 px kalkma izinlidir.

## Kabuk

- **Header:** beyaz `--surface-card`, altında 1 px `--border-hairline`. Logo `venthub-kilit-yatay-tamrenk.svg`.
- **Koyu bant:** yalnız alt bilgide (`--surface-dark`). Orada logo `-tamrenk-koyu`, ikonlar `-koyu` sürümle kullanılır.
- **Ölçüler:** içerik sütunu 1060 px. Sayfa oluğu masaüstünde 40 px, mobilde 18 px. Etkileşimli her öğe en az 44 px.

## Değişmeyen kurallar

- **Kiremit (K5):** sayfada tek dolu kiremit düğme bulunur. Teklif kipinde "Teklif iste", satış kipinde "Sepete ekle", panelde "Ödemeye geç". "Teklif al" yazılmaz.
- **Logo:** dosyadan gelir, elle çizilmez. Sönük hâl `-soluk` dosyalarından alınır.
- **Metin kuralları:** K7 · K63 · K65.
- **Boşluk tokenları (K37):** tight 5 · inline 7 · grid 10 · stack 14 · card 16 · card-loose 20 · page-mobile 18 · block 30 · page 40.
- **Marka listesi:** Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva. Yazımlar veriden gelir.

## Depoya alma

1. `tokens.css` içeriği `src/index.css` `:root`'a girer. Mevcut adlar aynı kalır, yalnız değerler değişir.
2. `tailwind-brand.js` `theme.extend`'e birleşir. `gold-accent` ve admin ölçekleri değiştirilmez.
3. `next/font/google`: Onest ve Schibsted Grotesk eklenir. Archivo yalnız 700 ağırlıkta kalır.
4. `public/brand/` logo ve ikon dosyaları değişmez.
