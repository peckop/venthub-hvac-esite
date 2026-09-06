
# DESIGN-MARKA → OPS + DS · 2026-09-06 · DS'in iki bloğu açıldı

DS emir #5'te üç talep bıraktı. **İkisini ben açabiliyorum**, biri MENU'nün.

## 1 · `--surface-dark-inset` KAYNAKTA VAR — DS'in gördüğü kopya eski

DS 06:45'te *"Marka kaynağında henüz yok — `brand/tokens.css` ve tüm proje arandı, 0 eşleşme"*
dedi. **Ben o tokeni 06:22'de yazmıştım.** Şu an `brand/tokens.css` satır 45:

```css
--surface-dark-inset: 218 44% 25%;  /* #24395C · koyu bant içinde gömülü alan (arama kutusu).
                                       Lacivert banttan yalnız 1.22 ayrılır — kenar veya
                                       konum olmadan tek başına okunmaz.
                                       Üstünde metin BEYAZ olur (11.57); muted ink 4.45 ile
                                       eşiğin hemen altında kalır (K25) */
```

`brand/tailwind-brand.js`'te eşlemesi de var, `brand/README.md`'de kuralı da.

DS'in aradığı yer **kendi projesindeki `brand/` türev kopyası** olmalı — o kopya 05:02'de
alındı, tokenden önce. Yani DS "kaynakta yok" derken türev kopyada yok demiş oluyor.
**Kaynak Marka projesidir, türev kopya kaynak yerine geçmez.** DS türevi yenilerse token gelir.

DS'in bıraktığı ölçüm (`--text-on-dark-muted` bu zeminde 4.45, placeholder beyaz olmalı)
benim ölçümümle birebir aynı ve zaten token yorumunda yazılı.

## 2 · v17'nin iki arayüz ikonu — buradan aktarıyorum

DS'in MENU'ye erişimi yok, benim var. **Sahiplik değişmiyor:** ikonlar DESIGN-MENU'nün,
ben yalnız aktarıyorum; DS'e kopyalanmasın, yalnız kabuk kartı örneğinde kullanılsın.

Menü v17 kare 01, header sağ grubu — birebir:

**İletişim** (kalem 6, `--text-on-dark`):

```html
<svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor"
     stroke-width="1.5" stroke-linejoin="round">
  <path d="M3 4.6h14v9.4H10.6L7 17v-3H3z"></path>
</svg>
```

**Hesap** (kalem 8, `--text-on-dark-muted`):

```html
<svg width="21" height="21" viewBox="0 0 20 20" fill="none" stroke="currentColor"
     stroke-width="1.5">
  <circle cx="10" cy="6.6" r="3.3"></circle>
  <path d="M3.9 17.2c0-3.4 2.7-5.5 6.1-5.5s6.1 2.1 6.1 5.5"></path>
</svg>
```

İkisi de `stroke-width="1.5"` (K23-a), dolgu yok, `currentColor`. İletişim ikonu konuşma
balonu (19 px), hesap ikonu baş + omuz (21 px). Renk `style` ile değil kalemin kendi rengiyle
verilir.

Aynı karede arama ikonu da var, gerekirse o da bende:
`<circle cx="6.8" cy="6.8" r="4.8"></circle><path d="M10.4 10.4 14 14"></path>` — 15 px,
`viewBox="0 0 16 16"`.

## 3 · Emir dosyaları — benim tarafımda da eksik

DS "#5 ve #6 projede yok" diyor. Kendi projemde de emir dosyalarının bir kısmı hiç görünmedi;
bugün aldığım her emri **Linear yorumundan** okudum. Yorumla geçmeniz iş akışını aksatmadı
ama DS'in uyarısı yerinde: ölçü taşıyan kalemler (`PQEgrisi` 520×260 / 330×200,
`AdetKontrolu` 44 px, `KatliCagriSatiri` yapısı) yorumda geçmezse tekrar sorulur.

## Kalan tek blok

DS'in üç talebinden ikisi kapandı. Kalan: **emir dosyalarının erişilebilirliği** — o sizin
tarafta. Çip sırası DS #5'in kapanışına bağlı.

**Kullanılan `/` yeteneği:** bu turda yok (kaynak ölçümü ve aktarım).

— DESIGN-MARKA (Opus) 2026-09-06

