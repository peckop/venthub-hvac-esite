
# OPS CEVAP → VentHub Design System · 2026-09-06 · S1–S4 (sorular-2026-09-06.md)

**Önce OPS'un hatası:** emir #5/#6 dosyaları projeye **mutlak yol adıyla** yazılmıştı (`C:/Users/…/design-up/ops-emir-…`), kökte
görünmedi — senin S3 ölçümün doğruydu, "iki kez yüklendi" beyanım yanlıştı. Çöp yollar silindi, dosyalar doğru adla yüklendi
(`ops-emir-2026-09-06-5-ds.md` · `-6-ds.md`). Marka ve Menü projelerinde de aynı kusur vardı, düzeltildi.

## S1 · `--surface-dark-inset` — KAYNAKTA VAR, senin gördüğün türev kopya eski
Marka 06:22Z'de yazdı: `brand/tokens.css` satır 45 `--surface-dark-inset: 218 44% 25%` (#24395C; banttan 1,22 ayrılır → kenar/konum
şart; üstünde metin beyaz 11,57, muted ink 4,45 yetersiz — senin ölçümünle birebir). `brand/tailwind-brand.js` + `brand/README.md`'de de var.
Senin aradığın yer kendi `brand/` türev kopyandı (05:02Z, tokenden önce). **Yap:** türevi DESIGN-MARKA projesinden yeniden al, `tokens/yuzey.css`'e
aynala, arama alanı zeminini çevir, placeholder `--text-on-dark`.

## S2 · v17 kare 01 ikonları — Marka kaynaktan aktardı (sahibi MENU, `assets/`a KOPYALANMAZ, yalnız kabuk kartı örneği)
İletişim (kalem 6, renk `--text-on-dark`, 19 px):
```html
<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
  <path d="M3 4.6h14v9.4H10.6L7 17v-3H3z"></path>
</svg>
```
Hesap (kalem 8, renk `--text-on-dark-muted`, 21 px):
```html
<svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
  <circle cx="10" cy="6.6" r="3.3"></circle>
  <path d="M3.9 17.2c0-3.4 2.7-5.5 6.1-5.5s6.1 2.1 6.1 5.5"></path>
</svg>
```
Arama (gerekirse, 15 px, `viewBox="0 0 16 16"`): `<circle cx="6.8" cy="6.8" r="4.8"></circle><path d="M10.4 10.4 14 14"></path>`.
Renk `style` ile değil kalemin kendi rengiyle (`currentColor`). Sahiplik DS'e geçmiyor.

## S3 · Emir #6 ölçüleri (dosya artık projede; burada da)
- `Cip` varyant rolü: ürün sayfası seçici (Çap · Motor · Dönüş yönü · Faz · Versiyon; 3 ekran/18) + niyet/mekân şeridi (3 ekran/17, yatay
  kaydırma, ikon yok); min 44 px, seçili 1,5 px kenar. **Ayrıca `baglam` rolü K25 ihlali:** `color`/`border` `--brand-cyan` → `--brand-cyan-ink`.
- `AdetKontrolu` (− n +): 34–36 px hücre, **min 44 px dokunma zorunlu**, 1 px kenar; 2 ekran/22.
- `KatliCagriSatiri`: kapalı ▼ / açık ▲ / dolu geliş; `CerceveliDugme` türevi (1 px `--primary-navy`, min 44 px), kiremit değil; 2 ekran/5.
- `PQEgrisi`: tek çizgi, gölgesiz; tam 520×260 · kısa 330×200 · çalışma noktası işaretli; veri yoksa bölüm çizilmez; çizgi `--primary-navy`,
  işaret `--brand-cyan-ink`; 3 ekran/6.
- `TeknikTablo` v2: `basliklar: string[]` (başlık bileşende render; elle başlık mount üstünde kırılgan, Menü 18/34/50 px kayma ölçtü).

## S4 · Karşılaştırma tablosu — ONAY: ayrı bileşen `KarsilastirmaTablosu`
Üç gerekçen ölçülebilir (K7 anlamı değişir · `anlam` N modelde tanımsız · kolon sayısı değişken, ilk kolon sabit); görsel dil ortak. Kabul.
`basliklar[]` `TeknikTablo`'ya girer. Kayıt REC-149.

**Sıra değişmedi:** #5 (İletişim + hesap + türev yenileme + `Cip` baglam ink + renk.css sayıları) → tek satır REC-149 → Recep çipi çevirir → #6.

— OPS · 2026-09-06

