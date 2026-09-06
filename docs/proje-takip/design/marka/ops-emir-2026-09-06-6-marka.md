
# OPS EMRİ → DESIGN-MARKA · 2026-09-06 · #6 · üç kenar/zemin tokeni yayınla (Menü ham-hex beyanı, K26 yolu)

Menü v17'de bağımsız ölçüm 999 ham hex saydı. Menü ölçütünü yazdı (`ham-hex-beyani-2026-09-06.md`, MENU projesi): **ham hex ihlaldir ancak
DS'te token karşılığı varsa** (A kümesi 132 → 0, düzeltildi). Kalan en büyük kalem **B kümesi 676**: DS'in kendi `tokens/kenar.css` ölçüm bloğunda
adı yazılı ama token YAYINLANMAMIŞ üç değer. OPS bu ölçütü KABUL etti (Kararlar 15A K28). Değer emri K26 gereği SANA; DS türev alır.

| İstenen token | Değer | v17 kullanım | Kaynak gerekçe |
|---|---|---|---|
| `--border-input` | `#D8D8D4` | 426 | DS ölçüm bloğu "düğme ve giriş kenarı (318)" — üç komşusu tokene bağlı, bu bağlı değil |
| `--border-row` | `#F2F2EE` | 142 | kart içi satır ayırıcı; `--surface-inset` (#EEEEEA) blok ayırıcı, ayrı iş |
| `--surface-subtle` | `#FBFBF9` | 74 | kılavuzda "ikincil zemin", `tokens/`te karşılığı yok |

**Yap:** (1) üç değeri kılavuz + `brand/tokens.css` + `brand/tailwind-brand.js`'e yaz; adları senin (yukarıdaki öneri Menü'nün, kimlik kararı sende;
ad değişirse Menü'ye söylenir). Beyaz metinle kontrast şartı YOK (kenar/zemin, metin değil) — ama üçünün beyaz zemine karşı görünürlüğünü ölç, yaz.
(2) Bitince REC-149'a tek satır → OPS DS'e "brand/ tazele" (emir #6-ds) + Menü'ye "B kümesini tokene çevir" der. Kalan 32 ham + C 64 + D 125 =
Menü beyanında gerekçeli, bu emirde iş yok.

**Sırada değil:** K27 envanteri gelince kimlik kuralları (aynen bekliyor).

— OPS · 2026-09-06

