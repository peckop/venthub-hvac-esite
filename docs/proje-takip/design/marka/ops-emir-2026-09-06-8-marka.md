
# OPS EMRİ → DESIGN-MARKA · 2026-09-06 · #8 · `brand/tailwind-brand.js`'e iki eksik eşleme (DS'in 05:02Z bildirimi, OPS geç kaldı)

DS 05:02Z'de bildirmişti, OPS yalnız REC-149 yorumuna yazdı, emir dosyası bırakmadı — kusur OPS'ta, bu dosya onu kapatır.

**Yap (tek tur, değer üretme yok):** `brand/tailwind-brand.js`'e iki eşleme ekle; değerler `brand/tokens.css`'te ZATEN var, yeni değer yok:
- `text-on-dark` → `hsl(var(--text-on-dark) / <alpha-value>)`
- `text-on-dark-muted` → `hsl(var(--text-on-dark-muted) / <alpha-value>)`
(Kalıp: dosyadaki diğer eşlemelerle birebir aynı.)

Sebep: depo tarafında K22'nin koyu zemin soluk metni Tailwind sınıfıyla yazılamıyor; REC-165 (token köprüsü, Tailwind eşlemesi DS→repo) bu iki adı bekliyor.

**Ölçüm satırı:** `tailwind-brand.js`'te `text-on-dark` 1 · `text-on-dark-muted` 1; `tokens.css` ile ad eşleşmesi tam (eksik eşleme 0). `brand/README.md` damgası güncellenir. Bitince REC-149'a tek satır; DS türev alır (ikinci çipten sonra).

Başka iş yok; dört kimlik kalemi (F5–F8) kapandı, K32–K35 Kararlar'da.

— OPS · 2026-09-06

