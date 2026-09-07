# Birim ve ölçek kusurları — ölçüm ve düzeltici (REC-190)

**Damga:** 2026-09-07 · **Şerit:** URUN-KATALOG · **Kayıt:** REC-190
**Yöntem:** elle · **Cetvel:** `docs/standards/product-schema-standard.md` (K9–K11)

## Kural

Alan adı bir birim taahhüt ediyorsa (`max_delivery_m3h`, `voltage_v`, `max_absorbed_power_w`)
değeri **sayı** olmalı ve **o birimde** olmalı. Ad bir birime söz veriyorsa o söz tutulur.

## Ölçüm (375 ürün, kesin sayı ile doğrulandı)

**32 hücre** kuralı çiğniyor — ama hepsi aynı kusur değil. Dört sınıf çıktı:

| Sınıf | Adet | Örnek | Karar |
|---|---|---|---|
| Sayı + birim metni | 27 | `max_delivery_m3h = "1550 m³/h"` | **onarılır** → 1550 |
| Sade birim | 2 | `voltage_v = "380 V"` | **onarılır** → 380 |
| **Aralık** | 3 | `operating_temperature_c = "5 - 32"` | **DOKUNULMAZ** |
| **Ölçek hatası** | 2 | `max_absorbed_power_w = 0.18` | **onarılır** → 180 |

Toplam onarım: **31 hücre / 29 ürün**. Dokunulmayan: **3 hücre**.

## Niçin aralığa dokunulmuyor

`operating_temperature_c` tek sayıya söz veriyor ama veri bir aralık (5–32 °C). Birimi silip
"5" yazmak 32'yi yok eder; "532" yazmak felakettir. Doğru onarım **şema kararıdır**
(`operating_temperature_min_c` / `_max_c`) ve bu betiğin işi değildir. Betik burada durur ve
sebebini adıyla yazar. → ÜRÜN/OPS cetvel kararı.

## Dördüncü sınıf en tehlikelisi — hiçbir kapı görmez

`SEA-51201003`, `max_absorbed_power_w = 0.18`. Değer **sayı**, **pozitif**, **geçerli**. Tip
kapısı, şema kapısı, konformans testi — hiçbiri kırmızı vermez. Yanlış olan tek şey **fizik**:
0,18 W'lık sanayi fanı yoktur. 0,18 **kW** yazılmış.

Vitrinde sonucu: fan gücü **bin kat** küçük görünür ve müşteri yanlış ürün seçer.

**Uydurmadan onarım:** yalnız ürün adının kendisi "0,18 kW" diyorsa ve alan değeri tam o sayıysa
×1000 yapılır. Ad kanıtı yoksa dokunulmaz.

Bu ayrım ölçüldü, varsayılmadı: W alanında 10'dan küçük **12** değer var; **10'u doğru**
(Vortice ev tipi fanlar gerçekten 4–9 W çeker), yalnız **2'si** ad kanıtıyla hatalı.
Körlemesine "10'dan küçükse ×1000" deseydik **10 doğru ürünü bozardık**.

## Betik

`scripts/icerik-hatti/birim-gomulu-duzelt.mjs` — varsayılan **kuru koşum**; canlıya yazım
`--yaz` + `CANLI_YAZIM_ONAYI` (Recep'in kendi sözü) ile. İkinci koşum 0 onarım göstermeli.

## Durum

Yazım **Recep kapısında**. Bu commit yalnız ölçüm + hazır betiktir.

---

## CANLIYA YAZILDI — 2026-09-07

**Recep'in sözü, lafzıyla:** "birim ölçek yaz"

- Yazım: **29 ürün / 31 hücre** güncellendi
- **İdempotentlik:** ikinci koşum → onarılır **0 hücre / 0 ürün** ✓
- Dokunulmayan **3 hücre** (aralık) olduğu gibi duruyor — şema kararı bekliyor

### Canlı doğrulama (yazım sonrası okundu)

| SKU | Alan | Önce | Sonra |
|---|---|---|---|
| SEA-51201003 | `max_absorbed_power_w` | `0.18` | **180** |
| SEA-51201003 | `voltage_v` | `"380 V"` | **380** |
| SEA-61103110 | `max_absorbed_power_w` | `0.06` | **60** |
| SEA-61103110 | `voltage_v` | `"220 V"` | **220** |
| NIC-11901 | `max_delivery_m3h` | `"1550 m³/h"` | **1550** |
| NIC-11935 | `max_delivery_m3h` | `"10500 m³/h"` | **10500** |

SEAT 20 ATEX'in gücü artık 0,18 W değil **180 W** — bin kat hata canlıda kapandı.

### Kalan iş

3 aralık hücresi (`operating_temperature_c = "5 - 32"`, üç Vortice nem alma cihazı).
Şema kararı: `operating_temperature_min_c` / `_max_c`. Karar ÜRÜN/OPS'ta, veri yazımı Recep kapısında.
