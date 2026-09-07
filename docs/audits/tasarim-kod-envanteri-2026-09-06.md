# Tasarım → Kod Envanteri — 2026-09-06 (ölçüm, komutlarıyla)

**Niçin:** Claude Design'daki VentHub Design System (10 bileşen) ile repo arasındaki boşluğu tek seferde ölçmek; `Tasarım → Kod Planı` (Linear, Vitrin 15A) ve REC-165 bu sayılara dayanır. Her sayı kendisini üreten komutla gelir (§6.1: sayı emirden emre kopyalanmaz). Yeniden ölçüm ancak PR sonrası bu komutlarla yapılır, elden değil.
**Ölçen:** OPS Explore alt ajanı (salt okuma), master `261124b4` civarı, 2026-09-06 ~15:20Z. Yeniden koşum: `bash docs/audits/tasarim-kod-envanteri-2026-09-06.md` içindeki komutlar (kök dizinden).

## 1 · DS bileşenlerinin repo karşılığı

| DS bileşeni | Repo karşılığı | Ölçüm |
|---|---|---|
| KabukBandi | `src/components/StickyHeader.tsx` (351) · `Footer.tsx` (196) · `navigation/HeaderTeklifPaneli.tsx` (106) · `navigation/MobilAltSekmeCubugu.tsx` (356) · `layout/MainLayout.tsx` | var, **bayrakla kapalı** |
| CerceveliDugme · AnaEylemDugmesi | ortak `Button` primitifi **0**; özel: `navigation/NavActionButton.tsx` (83), `quotes/QuoteRequestButton.tsx` (77), `BackToTopButton.tsx`, `home/ClientLeadButton.tsx` | yok |
| Kart | ortak `Card` **0**; özel: `ProductCard.tsx` (217), `products/FamilyCard.tsx` (158), `calculators/ResultCard.tsx` (177), `admin/dashboard/StatCard.tsx` (149), `TiltCard.tsx` | yok |
| Cip | `*Chip*` dosyası **0**; rozet: `admin/products/ProductHealthBadge.tsx`; faset: `admin/data-table/FacetedFilter.tsx` (100), vitrin `category/CategoryFilters.tsx` (118) | yok |
| TeknikTablo · KarsilastirmaTablosu | `admin/data-table/DataTableKit.tsx` (349, admin'e kilitli); vitrin spec tablosu `src/app/_components/ProductDetailPageView.tsx` 971–1000 **inline**, `<table>` yok, "anlam" sütunu yok; karşılaştırma `category/sections/TypeComparison.tsx` (217) grid kart | yok |
| AdetKontrolu | dosya **0**; tek uygulama `src/views/CartPage.tsx:127-142` inline | yok |
| KatliCagriSatiri | bileşen **0**; ad-hoc `aria-expanded` **14 dosya** | yok |
| PQEgrisi | vitrin SVG grafiği **0**; `recharts ^2.14.1` yalnız admin (`SalesChart.tsx` 138, `AbcPieChart.tsx` 111) | yok |

```
ls src/components/ui/                                   # 4 dosya: Pagination ScrollObserver Skeleton VentImage
find src/components -name "*.tsx" | wc -l               # 221
find src/components -name "*.md"  | wc -l               # 217 (sidecar)
grep -rlc "aria-expanded" src --include=*.tsx | wc -l   # 14
grep -rl "<table" src --include=*.tsx | wc -l           # 18 (14'ü admin)
```

## 2 · Kabuk bayrağı

```
grep -n "^export const" src/config/features.ts          # 2: UC_BOYUT_MUSTERI_YUZEYINDE=false (30) · YENI_KABUK_GEZINMESI=false (58)
grep -rn "YENI_KABUK_GEZINMESI" src | wc -l             # 11 (StickyHeader 4 · MobilAltSekmeCubugu 2 · HeaderTeklifPaneli 2 · MainLayout 3)
```
`NEXT_PUBLIC_*` bayrağı yok; sabit seçimi dosyada gerekçeli. Kilit testleri: `header-teklif-paneli.test.ts` · `mobil-alt-sekme.test.ts` · `uc-boyut-musteri-yuzeyi.test.ts` (bayrağın `false` kaldığını kilitler).

## 3 · Token kaynağı

```
wc -c src/index.css                                     # 24221
grep -c "^\s*--[a-z0-9-]*:" src/index.css               # 101 tanım (57 benzersiz ad; :root 283, ikinci :root 528, admin tema 407/434)
grep -n "marka-" tailwind.config.js | wc -l             # 0  ← 4 marka tokeni Tailwind'e bağlı DEĞİL
grep -rn "var(--marka" src | wc -l                      # 0  ← kodda kullanım YOK
grep -rn "brand-cyan-ink\|action-terracotta-deep" src/index.css | wc -l   # 0 (PR #1043 ile geliyor)
```
`:root`: `--marka-lacivert` #1A2B4A · `--marka-turkuaz` #0088B0 · `--marka-kiremit` #D95D0E · `--marka-amber` #F59E0B · 6 `--surface-*` · `--brand-cyan` · `--primary-navy` · `--secondary-blue` · … ; `--border-*` 0, `--text-*` yalnız `--text-primary`.
`tailwind.config.js`: 16 vitrin + 23 admin = 39 HSL eşlemesi + 4 sabit HEX (`success-green`, `warning-orange`, `gold-accent`, `silver-accent`).
`src/design-system/tokens.js` (315 satır): 14 export (zIndex, maxWidth, borderRadius, fontSize, boxShadow, height, minHeight, maxHeight, width, minWidth, transitionDuration, transitionTimingFunction, blur, transitionProperty) — **renk yok** (kural 8: renk index.css'te). Yarıçap ölçeği 6–48 px; **0 px girdisi yok**.

## 4 · Kural borcu (yarıçap 0 · gölge yok · kiremit tek ana eylem)

```
grep -ro "bg-primary-navy" src --include=*.tsx --include=*.ts | wc -l   # 153 (73 dosya; en yoğun ProductDetailPageView 9)
grep -ro "rounded-[a-z0-9]*" src --include=*.tsx | wc -l                 # 1527 (246 dosya; rounded-admin 383 · full 357 · lg 270 · xl 183 · 2xl 165 · hvac* 72 · md 37 · 3xl 29 · none 1)
grep -ro "shadow-[a-z0-9]*" src --include=*.tsx | wc -l                  # 555 (164 dosya; sm 177 · admin 89 · 2xl 44 · lg 39 · md 34 · xl 33 · hvac 23 · glow 10 · elevation-* 8)
```
Not: admin sayıları dahildir (admin kendi tasarım cetvelinde, `admin-design-standard.md`); vitrin payı Faz 5 mandalında ayrı sayılır.

## 5 · Katalog / kapı

```
ls .storybook .ladle 2>/dev/null; grep -c "storybook\|ladle" package.json   # yok / 0
ls docs/standards | wc -l                                                   # 66 (tasarımla ilgili 5: storefront-design, admin-design, marka-token-eslemesi, tasarim-yetenek, erp-workspace-design)
ls src/__tests__/conformance | wc -l                                        # 186 (tasarım/token: tailwind-token-sinif-gecerliligi · marka-palet-tokenlari INV-PALET-1)
```

## Özet boşluk (sayıyla)
10 DS bileşeninin **0**'ı repoda; en yakın 6 desen 221 bileşene dağılmış inline Tailwind. Kabuk bandı yazılmış, `YENI_KABUK_GEZINMESI=false`. Marka paleti tanımlı ama Tailwind'e bağlı değil, 0 kullanım. Yarıçap-0 hedefine karşı 1.527, gölgesizliğe karşı 555, kiremit-tek-eylem hedefine karşı 153 aykırı kullanım. Bileşen kataloğu yok.

**Sonraki ölçüm:** REC-165 Faz 2 PR'ından sonra aynı komutlar; sayılar bu dosyaya yeni tarihli bölüm olarak eklenir (elden yeniden sayım yok).
