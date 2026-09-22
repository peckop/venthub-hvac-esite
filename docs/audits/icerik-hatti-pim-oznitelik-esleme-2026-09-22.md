# PIM öznitelik eşlemesi — paket `teknik-ozellikler.csv` ↔ UnoPim (2026-09-22)

**Şerit:** URUN-KATALOG · **İş:** REC-357 (PIM pilotu, ALTYAPI) × REC-212 (paket, KATALOG) · **OPS emri:** 2026-09-22.
**Kapı:** INV-PIM-UNOPIM-1 — ölçülü öznitelik CSV'de `<kod>` + `<kod>(unit)`.
**Karar değil:** karar 36 ("kataloğu PIM hattıyla mı yürütelim") pilot §3.4 sonrası OPS'tan Recep'e gider; bu belge
yalnız eşlemenin ölçümüdür.

## Kaynaklar (ölçüm, tahmin yok)

| taraf | kaynak |
|---|---|
| UnoPim | `scripts/pim/unopim.cjs` → `OZNITELIKLER` (22) + `TURETILMIS` (`max_delivery_ls`); aile `vortice_lineo_quiet` |
| paket | canlı dışa aktarım 2026-09-22 → `katalog-paket-uret.mjs` → `teknik-ozellikler.csv` (442 ürün · 5168 satır · 77 alan) |
| `birim` | `scripts/icerik-hatti/alan-etiket-sozlugu.json` (kaynak tablo başlıklarından sayılmış) |
| `baslik_tr` | `src/i18n/dictionaries/tr.ts` → `pdp.specs` (müşterinin ürün sayfasında gördüğü ad) |

## 1 · Pilot ailenin 22 özniteliği — birebir eşleme

Pilot ailenin 12 ürünü paketteki 22 alanın **22'sini** taşıyor; ailede olup PIM'de olmayan alan **0**.

| paket `alan` | UnoPim tipi | UnoPim `(unit)` | paket `birim` | `baslik_tr` | katalogda satır |
|---|---|---|---|---|---|
| `absorbed_current_a` | measurement | AMPERE | A | Çekilen Akım | 172 |
| `diameter_mm` | measurement | MILLIMETER | mm | Çap | 259 |
| `erp_compliant` | boolean | — | — | ErP Uyumlu | 187 |
| `frequency_hz` | measurement | HERTZ | Hz | Frekans | 193 |
| `has_humidistat` | boolean | — | — | Higrostat | 39 |
| `has_timer` | boolean | — | — | Zamanlayıcı | 39 |
| `insulation_class` | text | — | — | Yalıtım Sınıfı | 182 |
| `ip_rating` | text | — | — | Koruma Sınıfı (IP) | 275 |
| `max_absorbed_power_w` | measurement | WATT | W | Maksimum Çekilen Güç | 288 |
| `max_delivery_m3h` | measurement | CUBIC_METER_PER_HOUR | m³/h | Maksimum Debi (m³/h) | 243 |
| `max_static_pressure_pa` | measurement | PASCAL | Pa | Maksimum Statik Basınç | 160 |
| `motor_poles` | text (sayı) | — | — | Motor Kutup Sayısı | 123 |
| `motor_type` | text | — | — | Motor Tipi | 180 |
| `noise_level_db_a` | measurement | DECIBEL | dB(A) | Ses Seviyesi | 148 |
| `phase` | text (sayı) | — | — | Faz | 307 |
| `pq_curve` | textarea | — | — | Basınç-Debi Eğrisi | 145 |
| `rpm_max` | text (sayı) | — | **rpm** | Maksimum Devir Hızı | 229 |
| `size_a_mm` | measurement | MILLIMETER | mm | Genişlik (A) | 132 |
| `size_b_mm` | measurement | MILLIMETER | mm | Derinlik (B) | 132 |
| `size_c_mm` | measurement | MILLIMETER | mm | Yükseklik (C) | 123 |
| `voltage_v` | measurement | VOLT | V | Voltaj | 274 |
| `weight_kg` | measurement | KILOGRAM | kg | Ağırlık | 303 |
| `max_delivery_ls` | **türetilir** `round(m3h/3.6, 2)` | — | — | Maksimum Debi (l/s) | 180 |

**Birim eşlemesi:** 12 ölçülü özniteliğin **12'sinde** paket birimi UnoPim birimine bire bir karşılık geliyor
(A↔AMPERE · mm↔MILLIMETER · Hz↔HERTZ · W↔WATT · m³/h↔CUBIC_METER_PER_HOUR · Pa↔PASCAL · V↔VOLT · kg↔KILOGRAM ·
dB(A)↔DECIBEL). **Türkçe başlık:** 23/23 dolu.

**İki fark (kayıp değil, ama yazılmalı):**
1. `rpm_max` — pakette birim `rpm`, UnoPim'de birimsiz metin (sayı doğrulamalı). Dönüşümde birim düşer;
   geri dönüşte sözlükten yeniden eklenir. UnoPim'de devir ölçü ailesi yok (ölçülmedi — ALTYAPI'ya soru).
2. `noise_level_db_a` — UnoPim `DECIBEL` A-ağırlığını taşımıyor; "dB(A)" bilgisi öznitelik ADINDA (`_db_a`)
   yaşıyor. `noise_lpa_3m_db` (ses BASINCI, 3 m, birim `dB`) FARKLI büyüklüktür; ikisi aynı özniteliğe
   eşlenmemeli.

## 2 · Kataloğun tamamı — PIM kapsamı

| ölçüm | değer |
|---|---|
| paketteki tekil teknik alan | **77** |
| PIM pilotunda tanımlı (22 + 1 türetilen) | **23** |
| bu 23 alanın satırı | **4313 / 5168 (%83)** |
| PIM'de tanımı OLMAYAN alan | **54** alan · **855** satır |

Pilot tek aile olduğu için 54 alanın PIM'de olmaması **beklenen**; bütün katalog göçü karar 36'nın konusudur.
Göç kararı verilirse bu 54 alan tanımlanmak zorunda. Satır sayısına göre ilk on:

| alan | satır | paket `birim` | `baslik_tr` |
|---|---|---|---|
| `nominal_delivery_m3h` | 89 | m³/h | Nominal Debi |
| `nominal_static_pressure_pa` | 78 | Pa | Nominal Statik Basınç |
| `noise_lpa_3m_db` | 66 | dB | Ses Basıncı (3 m) |
| `rated_power_w` | 44 | W | Anma Gücü |
| `max_voltage_v` | 35 | V | Maksimum Voltaj |
| `min_voltage_v` | 35 | V | Minimum Voltaj |
| `rated_output_current_a` | 35 | A | Anma Çıkış Akımı |
| `drive_code` | 33 | — | Sürücü Kodu |
| `enclosure_class` | 33 | — | Muhafaza Tipi |
| `enclosure_size` | 33 | — | Muhafaza Boyutu |

Tam liste koşumla yeniden üretilir (§4).

**Birim boşluğu (göçü etkiler):** 54 alanın çoğunda sözlükte birim YOK — adında birim taşıyanlar dahil
(`max_ambient_temp_c`, `heating_capacity_kw`, `blade_diameter_mm`, `airflow_speed_max_ms`…). UnoPim'de ölçülü
öznitelik birim ister; bu alanlar göçten önce sözlüğe birimle girmeli (bilinen iş: sözlükte 41 alan tanımsız,
sözleşme v1 teslim 2). **Birim alan adından TÜRETİLMEZ** — kaynak tablo başlığından sayılır.

## 3 · Yan bulgu (URUN'a iletildi) — üç alanın sitede Türkçe başlığı YOK

`permissible_motor_power_w` (22 satır) · `atex_zone` (19) · `max_total_pressure_pa` (8) canlı DB'de var, `tr.ts`
`pdp.specs`'te yok → ürün sayfasında başlık yedek kurala düşüyor. `spec-keys.manifest.json` 2026-08-22 tarihli
(73 anahtar); bugün 77. INV-SPEC-LABEL-1 kapısı bayat listeye baktığı için bu üçünü göremez.

## 4 · Yeniden üretim

```
node scripts/icerik-hatti/katalog-disa-aktar.mjs --hedef=<paket>
node scripts/icerik-hatti/katalog-paket-uret.mjs --hedef=<paket> --gorsel-atla
```
Ardından `teknik-ozellikler.csv`'deki alanlar `scripts/pim/unopim.cjs`'in `OZNITELIKLER` + `TURETILMIS` listesiyle
kesiştirilir; birim `paket-sozlesme.mjs → birimler()`, başlık `turkceBasliklar()`.
