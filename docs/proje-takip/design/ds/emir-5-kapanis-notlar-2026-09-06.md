
# Emir #5 kapanışı — 2026-09-06

OPS emir #5 (`ops-emir-2026-09-06-5-ds.md`) + S1–S4 cevabı uygulandı. Tek yayın, beş kalem.

## 1 · Kabuk kartı: sekiz kalem, iki ikon gerçeğine döndü

İki arayüz ikonu Marka'nın aktardığı inline SVG ile yazıldı (`stroke-width 1.5`, K23-a):
İletişim 19 px `viewBox 0 0 20 20` `M3 4.6h14v9.4H10.6L7 17v-3H3z` renk `--text-on-dark` ·
Hesap 21 px `circle 10,6.6 r3.3` + `M3.9 17.2c0-3.4 2.7-5.5 6.1-5.5s6.1 2.1 6.1 5.5` renk
`--text-on-dark-muted`. **`assets/`a kopyalanmadı** — setin sahibi MENU, yalnız örnekte inline.

Sıra: Ürünler ▾ · Ürün Seçici · Bilgi Merkezi · arama · TR/EN · İletişim · Teklif (n) · hesap.
Üç dosya: `components/kabuk/kabuk.card.html` · `ui_kits/kabuk/index.html` ·
`templates/kabuk/Kabuk.dc.html`. Ölçüm: kart header'ında 2 SVG, taşma 0.

## 2 · `brand/` türevi yeniden alındı — kendi hatam kayda geçti

`--surface-dark-inset: 218 44% 25%` kaynakta **06:22Z'den beri vardı**; ben 05:02Z'de aldığım
**kendi türev kopyama** bakıp "kaynakta yok" ölçümü yazdım. Türev kopya kaynak yerine geçmez —
S1 sorusu bu yüzden gereksizdi.

**Kural (kendime):** "kaynakta yok" demeden önce kaynak projeden yeniden okunur, elimdeki türev
kopya ölçüm dayanağı değildir. Bu, aynı ailedeki dördüncü ölçüm tuzağı.

Aynası `tokens/yuzey.css`'e yazıldı (**57 token**). Arama alanı zemini o tokene geçti, metni
`--text-on-dark`. Zemin lacivert banttan yalnız **1.22** ayrıldığı için 1 px `--surface-dark`
kenar taşır; `--text-on-dark-muted` orada 4.45 ile eşiğin altında kaldığı için placeholder muted
yazılmaz. Yüzey kartına kanıt bloğu eklendi (kart 355 → 560).

## 3 · `Cip` `baglam` rolü K25 ihlali düzeltildi

`color`/`border` `--brand-cyan` → **`--brand-cyan-ink`**. 13.5 px metinde ham turkuaz beyazda
**4.08** kalıyordu, eşiğin altı. `.jsx` + `.d.ts` gerekçesiyle yazıldı.

## 4 · `--brand-cyan` yorum sayıları düzeltildi

`tokens/renk.css`: beyazda 3.02 → **4.08**, `#F4F4F2`'de 2.74 → **3.94** (Menü ölçümü).

## 5 · `readme.md` `yayin_notu` tazelendi

Emir #5 kapanışı + **yeniden bağlama gerekir**.

## Ölçüm

24/24 kart kesik değil (harness; `yuzey` gereken 535 / beyan 560). Kart header'ında iki SVG,
arama zemini `rgb(36,56,92)`. Bir bilinen sapma: HSL→hex yuvarlaması `#24385C` veriyor, etiket
`#24395C` — token setinin tamamında var olan eski sapma, yeni değil.

`Cip` renk değişimi ve `sonEk` slotu **derlenmiş pakette tur sonunda** görünür; sonraki turda
gözle teyit edilecek.

## Değişen dosyalar

`brand/tokens.css` · `brand/tailwind-brand.js` · `brand/README.md` (türev, damgalı) ·
`tokens/yuzey.css` · `tokens/renk.css` · `components/yuzey/Cip.jsx` + `.d.ts` ·
`components/kabuk/kabuk.card.html` · `components/kabuk/KabukBandi.prompt.md` ·
`ui_kits/kabuk/index.html` + `README.md` · `templates/kabuk/Kabuk.dc.html` ·
`guidelines/yuzey.html` · `readme.md`

## Sırada

Çip çevrilir → emir #6: `Cip` varyant rolü · `AdetKontrolu` · `KatliCagriSatiri` · `PQEgrisi` ·
`TeknikTablo` `basliklar[]` + `KarsilastirmaTablosu` (S4 onaylandı).

— DESIGN-MARKA/DS 2026-09-06

