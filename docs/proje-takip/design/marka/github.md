
repo: peckop/venthub-hvac-esite
branch: master

## Last sync
date: 2026-09-03T08:08:11Z

### Updated in this project
- Depo tasarım sistemi okundu: HSL üçlü custom property + Tailwind `hsl(var(--x) / <alpha-value>)` düzeni.
- Marka ile depo arasındaki beş çakışma kapatıldı: palet, tema yönü, yazı tipi, kiremit tokeni, ikon biçimi.
- 16 ikonun SVG üretimi tamamlandı — `brand/icons/` içinde 64 dosya, depoya elle eklenecek.
- `brand/tokens.css` ve `README.md` henüz yazılmadı.

## Screen map
| Bu projedeki dosya | Depodaki kaynak |
|---|---|
| Venthub Marka Kilavuzu.dc.html | (marka tarafı; depodan türetilmedi) |
| brand/icons/*.svg | (marka tarafı; depoya `public/icons/` altına eklenecek) |
| brand/tokens.css (planlandı) | src/index.css · src/design-system/tokens.js · tailwind.config.js |
| brand/README.md (planlandı) | docs/design_system_config.md |

