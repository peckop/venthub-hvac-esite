# Matris sütun doluluk ölçümü — 2026-09-05

> **Üretilmiş belge.** Kaynak: `scripts/katalog/matris-sutun-doluluk.mjs`.
> Elle düzenlenmez; sayı değişecekse betik yeniden koşulur.

## Niçin ölçüldü

Liste sayfaları matris (tablo) görünümü alacak (karar K13). Teknik alanlar aileye göre
değiştiği için, bir grupta dolu olan sütun başka grupta tamamen boş olabilir. Yarısı boş
tablo çizilmez — bu yüzden Design liste şablonunu çizmeden önce doluluk **canlı veriden**
ölçülür.

## Ölçüt (K13)

| Kova | Aralık | Anlamı |
|---|---|---|
| **matris** | doluluk ≥ %60 | Grubun matrisine sütun olarak girer |
| **ikincil** | %30 ≤ doluluk < %60 | Gizlenebilir ikincil sütun |
| **ürün sayfası** | doluluk < %30 | Matrise girmez, yalnız ürün sayfasında |

**Grup** = ürünün dalı (`subcategory_id`), dalı yoksa üst kategorisi (`category_id`).
**Dolu** = anahtar var **ve** değeri null değil **ve** boşluk kırpılınca boş dize değil.
Silinmiş ürün (`deleted_at`) sayılmaz.

## Özet

- Grup sayısı: **19**
- Ölçülen ürün: **375**
- Matrise giren sütun taşıyan grup: **18**
- Hiç matris sütunu OLMAYAN grup: **1**

## Grup grup doluluk

### Santrifüj / Radyal Fanlar — 83 ürün

`centrifugal-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `max_delivery_m3h` | 71/83 | %85.5 |

**İkincil (gizlenebilir):** `max_absorbed_power_w` %56.6 · `diameter_mm` %50.6 · `absorbed_current_a` %42.2 · `erp_compliant` %42.2 · `frequency_hz` %42.2 · `insulation_class` %42.2 · `ip_rating` %42.2 · `max_delivery_ls` %42.2 · `max_static_pressure_pa` %42.2 · `motor_poles` %42.2 · `motor_type` %42.2 · `phase` %42.2 · `pq_curve` %42.2 · `rpm_max` %42.2 · `voltage_v` %42.2 · `weight_kg` %42.2

**Yalnız ürün sayfasında:** 6 alan (%30 altı).

### Asit Dayanımlı Fanlar — 81 ürün

`acid-resistant-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `max_absorbed_power_w` | 81/81 | %100 |
| `rpm_max` | 81/81 | %100 |
| `voltage_v` | 81/81 | %100 |
| `weight_kg` | 81/81 | %100 |
| `diameter_mm` | 78/81 | %96.3 |
| `phase` | 78/81 | %96.3 |
| `noise_lpa_3m_db` | 66/81 | %81.5 |
| `nominal_delivery_m3h` | 66/81 | %81.5 |
| `nominal_static_pressure_pa` | 66/81 | %81.5 |

**Yalnız ürün sayfasında:** 6 alan (%30 altı).

### Kanal Tipi Fanlar — 36 ürün

`duct-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 36/36 | %100 |
| `erp_compliant` | 36/36 | %100 |
| `frequency_hz` | 36/36 | %100 |
| `insulation_class` | 36/36 | %100 |
| `ip_rating` | 36/36 | %100 |
| `max_absorbed_power_w` | 36/36 | %100 |
| `max_delivery_ls` | 36/36 | %100 |
| `max_delivery_m3h` | 36/36 | %100 |
| `max_static_pressure_pa` | 36/36 | %100 |
| `motor_type` | 36/36 | %100 |
| `noise_level_db_a` | 36/36 | %100 |
| `phase` | 36/36 | %100 |
| `pq_curve` | 36/36 | %100 |
| `rpm_max` | 36/36 | %100 |
| `size_a_mm` | 36/36 | %100 |
| `size_b_mm` | 36/36 | %100 |
| `voltage_v` | 36/36 | %100 |
| `weight_kg` | 36/36 | %100 |
| `diameter_mm` | 31/36 | %86.1 |
| `motor_poles` | 31/36 | %86.1 |
| `size_c_mm` | 31/36 | %86.1 |

**İkincil (gizlenebilir):** `has_humidistat` %33.3 · `has_timer` %33.3

### Frekans Konvertörleri — 35 ürün

`frequency-converters` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `drive_code` | 33/35 | %94.3 |
| `enclosure_class` | 33/35 | %94.3 |
| `enclosure_size` | 33/35 | %94.3 |
| `ip_rating` | 33/35 | %94.3 |
| `max_voltage_v` | 33/35 | %94.3 |
| `min_voltage_v` | 33/35 | %94.3 |
| `phase` | 33/35 | %94.3 |
| `rated_output_current_a` | 33/35 | %94.3 |
| `rated_power_w` | 33/35 | %94.3 |
| `weight_kg` | 33/35 | %94.3 |

### Banyo ve Tuvalet Fanları — 31 ürün

`bathroom-toilet-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `erp_compliant` | 31/31 | %100 |
| `frequency_hz` | 31/31 | %100 |
| `ip_rating` | 31/31 | %100 |
| `voltage_v` | 31/31 | %100 |
| `absorbed_current_a` | 27/31 | %87.1 |
| `diameter_mm` | 27/31 | %87.1 |
| `has_humidistat` | 27/31 | %87.1 |
| `has_timer` | 27/31 | %87.1 |
| `insulation_class` | 27/31 | %87.1 |
| `max_absorbed_power_w` | 27/31 | %87.1 |
| `max_delivery_ls` | 27/31 | %87.1 |
| `max_delivery_m3h` | 27/31 | %87.1 |
| `max_static_pressure_pa` | 27/31 | %87.1 |
| `motor_type` | 27/31 | %87.1 |
| `noise_level_db_a` | 27/31 | %87.1 |
| `phase` | 27/31 | %87.1 |
| `pq_curve` | 27/31 | %87.1 |

**Yalnız ürün sayfasında:** 12 alan (%30 altı).

### Aksiyel Fanlar — 30 ürün

`axial-industrial-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 30/30 | %100 |
| `diameter_mm` | 30/30 | %100 |
| `erp_compliant` | 30/30 | %100 |
| `frequency_hz` | 30/30 | %100 |
| `insulation_class` | 30/30 | %100 |
| `ip_rating` | 30/30 | %100 |
| `max_absorbed_power_w` | 30/30 | %100 |
| `max_delivery_ls` | 30/30 | %100 |
| `max_delivery_m3h` | 30/30 | %100 |
| `max_static_pressure_pa` | 30/30 | %100 |
| `motor_poles` | 30/30 | %100 |
| `motor_type` | 30/30 | %100 |
| `noise_level_db_a` | 30/30 | %100 |
| `phase` | 30/30 | %100 |
| `pq_curve` | 30/30 | %100 |
| `rpm_max` | 30/30 | %100 |
| `size_a_mm` | 30/30 | %100 |
| `size_b_mm` | 30/30 | %100 |
| `size_c_mm` | 30/30 | %100 |
| `voltage_v` | 30/30 | %100 |
| `weight_kg` | 30/30 | %100 |

**İkincil (gizlenebilir):** `atex_marking` %46.7

### Çatı Tipi Fanlar — 13 ürün

`roof-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `diameter_mm` | 13/13 | %100 |
| `discharge_type` | 13/13 | %100 |
| `erp_compliant` | 13/13 | %100 |
| `frequency_hz` | 13/13 | %100 |
| `insulation_class` | 13/13 | %100 |
| `ip_rating` | 13/13 | %100 |
| `max_absorbed_power_w` | 13/13 | %100 |
| `max_delivery_ls` | 13/13 | %100 |
| `max_delivery_m3h` | 13/13 | %100 |
| `motor_type` | 13/13 | %100 |
| `phase` | 13/13 | %100 |
| `size_a_mm` | 13/13 | %100 |
| `size_b_mm` | 13/13 | %100 |
| `size_c_mm` | 13/13 | %100 |
| `voltage_v` | 13/13 | %100 |
| `weight_kg` | 13/13 | %100 |
| `max_ambient_temp_c` | 10/13 | %76.9 |

**Yalnız ürün sayfasında:** 6 alan (%30 altı).

### Duman Egzoz Fanları — 10 ürün

`smoke-exhaust-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `diameter_mm` | 10/10 | %100 |
| `discharge_type` | 10/10 | %100 |
| `erp_compliant` | 10/10 | %100 |
| `fire_rating` | 10/10 | %100 |
| `frequency_hz` | 10/10 | %100 |
| `insulation_class` | 10/10 | %100 |
| `ip_rating` | 10/10 | %100 |
| `max_absorbed_power_w` | 10/10 | %100 |
| `max_ambient_temp_c` | 10/10 | %100 |
| `max_delivery_ls` | 10/10 | %100 |
| `max_delivery_m3h` | 10/10 | %100 |
| `motor_poles` | 10/10 | %100 |
| `motor_type` | 10/10 | %100 |
| `phase` | 10/10 | %100 |
| `size_a_mm` | 10/10 | %100 |
| `size_b_mm` | 10/10 | %100 |
| `size_c_mm` | 10/10 | %100 |
| `voltage_v` | 10/10 | %100 |
| `weight_kg` | 10/10 | %100 |

### Hava Perdeleri — 8 ürün

`air-curtains` · seviye 0

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 8/8 | %100 |
| `airflow_speed_max_ms` | 8/8 | %100 |
| `airflow_speed_min_ms` | 8/8 | %100 |
| `discharge_velocity_curve` | 8/8 | %100 |
| `erp_compliant` | 8/8 | %100 |
| `frequency_hz` | 8/8 | %100 |
| `insulation_class` | 8/8 | %100 |
| `max_absorbed_power_w` | 8/8 | %100 |
| `max_delivery_ls` | 8/8 | %100 |
| `max_delivery_m3h` | 8/8 | %100 |
| `motor_type` | 8/8 | %100 |
| `noise_level_db_a` | 8/8 | %100 |
| `number_of_speeds` | 8/8 | %100 |
| `phase` | 8/8 | %100 |
| `size_a_mm` | 8/8 | %100 |
| `size_b_mm` | 8/8 | %100 |
| `size_c_mm` | 8/8 | %100 |
| `voltage_v` | 8/8 | %100 |
| `weight_kg` | 8/8 | %100 |

**İkincil (gizlenebilir):** `heating_capacity_kw` %50

### Kanallı Merkezi Üniteler — 8 ürün

`ducted-central-hrv` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 5/8 | %62.5 |
| `diameter_mm` | 5/8 | %62.5 |
| `erp_compliant` | 5/8 | %62.5 |
| `filter_classes` | 5/8 | %62.5 |
| `frequency_hz` | 5/8 | %62.5 |
| `has_bypass` | 5/8 | %62.5 |
| `insulation_class` | 5/8 | %62.5 |
| `ip_rating` | 5/8 | %62.5 |
| `max_absorbed_power_w` | 5/8 | %62.5 |
| `max_delivery_ls` | 5/8 | %62.5 |
| `max_delivery_m3h` | 5/8 | %62.5 |
| `max_static_pressure_pa` | 5/8 | %62.5 |
| `motor_type` | 5/8 | %62.5 |
| `noise_level_db_a` | 5/8 | %62.5 |
| `phase` | 5/8 | %62.5 |
| `pq_curve` | 5/8 | %62.5 |
| `thermal_efficiency_curve` | 5/8 | %62.5 |
| `thermal_efficiency_pct` | 5/8 | %62.5 |
| `voltage_v` | 5/8 | %62.5 |
| `weight_kg` | 5/8 | %62.5 |

**İkincil (gizlenebilir):** `connection_height_mm` %37.5 · `connection_width_mm` %37.5 · `height_mm` %37.5 · `length_mm` %37.5 · `nominal_delivery_m3h` %37.5 · `optional_heater_power_w` %37.5 · `width_mm` %37.5

**Yalnız ürün sayfasında:** 1 alan (%30 altı).

### Sulu Batarya Kanal Tipi — 8 ürün

`water-coil-duct-heaters` · seviye 1

⚠**Matrise girecek sütun YOK.** Bu grupta hiçbir alan %60 eşiğini geçmiyor;
tablo görünümü bu grupta ya boş kalır ya da tek tük hücreyle çizilir.

**Yalnız ürün sayfasında:** 3 alan (%30 altı).

### Tekil Oda Üniteleri — 8 ürün

`single-room-hrv` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 8/8 | %100 |
| `diameter_mm` | 8/8 | %100 |
| `erp_compliant` | 8/8 | %100 |
| `filter_classes` | 8/8 | %100 |
| `frequency_hz` | 8/8 | %100 |
| `has_bypass` | 8/8 | %100 |
| `insulation_class` | 8/8 | %100 |
| `ip_rating` | 8/8 | %100 |
| `max_absorbed_power_w` | 8/8 | %100 |
| `max_delivery_ls` | 8/8 | %100 |
| `max_delivery_m3h` | 8/8 | %100 |
| `max_static_pressure_pa` | 8/8 | %100 |
| `motor_type` | 8/8 | %100 |
| `noise_level_db_a` | 8/8 | %100 |
| `phase` | 8/8 | %100 |
| `pq_curve` | 8/8 | %100 |
| `thermal_efficiency_curve` | 8/8 | %100 |
| `thermal_efficiency_pct` | 8/8 | %100 |
| `voltage_v` | 8/8 | %100 |
| `weight_kg` | 8/8 | %100 |

### Endüstriyel Tavan Vantilatörleri — 7 ürün

`industrial-ceiling-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 7/7 | %100 |
| `blade_diameter_mm` | 7/7 | %100 |
| `erp_compliant` | 7/7 | %100 |
| `frequency_hz` | 7/7 | %100 |
| `ip_rating` | 7/7 | %100 |
| `max_absorbed_power_w` | 7/7 | %100 |
| `max_delivery_ls` | 7/7 | %100 |
| `max_delivery_m3h` | 7/7 | %100 |
| `motor_type` | 7/7 | %100 |
| `number_of_blades` | 7/7 | %100 |
| `phase` | 7/7 | %100 |
| `reversible` | 7/7 | %100 |
| `rpm_max` | 7/7 | %100 |
| `voltage_v` | 7/7 | %100 |
| `weight_kg` | 7/7 | %100 |

### Elektrikli Kanal Isıtıcıları — 6 ürün

`electric-duct-heaters` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `compatible_model` | 6/6 | %100 |
| `frequency_hz` | 6/6 | %100 |
| `heating_power_w` | 6/6 | %100 |
| `nominal_delivery_m3h` | 6/6 | %100 |
| `phase` | 6/6 | %100 |
| `voltage_v` | 6/6 | %100 |

### Nem Alma Cihazları — 3 ürün

`dehumidifiers` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 3/3 | %100 |
| `erp_compliant` | 3/3 | %100 |
| `frequency_hz` | 3/3 | %100 |
| `humidity_removed_l_24h` | 3/3 | %100 |
| `max_absorbed_power_w` | 3/3 | %100 |
| `max_delivery_m3h` | 3/3 | %100 |
| `noise_level_db_a` | 3/3 | %100 |
| `operating_temperature_c` | 3/3 | %100 |
| `refrigerant_type` | 3/3 | %100 |
| `size_a_mm` | 3/3 | %100 |
| `size_b_mm` | 3/3 | %100 |
| `size_c_mm` | 3/3 | %100 |
| `size_d_mm` | 3/3 | %100 |
| `tank_capacity_l` | 3/3 | %100 |
| `voltage_v` | 3/3 | %100 |
| `weight_kg` | 3/3 | %100 |

### Sığınak Havalandırma Fanları — 3 ürün

`shelter-ventilation` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `max_absorbed_power_w` | 3/3 | %100 |
| `max_delivery_m3h` | 3/3 | %100 |

### Aksesuarlar — 2 ürün

`accessories` · seviye 0

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `compatible_model` | 2/2 | %100 |

### Hız Anahtarları — 2 ürün

`speed-controllers` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `max_current_a` | 2/2 | %100 |

### Şömine ve Baca Fanları — 1 ürün

`chimney-fans` · seviye 1

| Sütun | Dolu | Doluluk |
|---|---:|---:|
| `absorbed_current_a` | 1/1 | %100 |
| `diameter_mm` | 1/1 | %100 |
| `discharge_type` | 1/1 | %100 |
| `erp_compliant` | 1/1 | %100 |
| `frequency_hz` | 1/1 | %100 |
| `insulation_class` | 1/1 | %100 |
| `ip_rating` | 1/1 | %100 |
| `max_absorbed_power_w` | 1/1 | %100 |
| `max_delivery_ls` | 1/1 | %100 |
| `max_delivery_m3h` | 1/1 | %100 |
| `max_static_pressure_pa` | 1/1 | %100 |
| `motor_poles` | 1/1 | %100 |
| `motor_type` | 1/1 | %100 |
| `noise_level_db_a` | 1/1 | %100 |
| `phase` | 1/1 | %100 |
| `pq_curve` | 1/1 | %100 |
| `rpm_max` | 1/1 | %100 |
| `size_a_mm` | 1/1 | %100 |
| `size_b_mm` | 1/1 | %100 |
| `size_c_mm` | 1/1 | %100 |
| `voltage_v` | 1/1 | %100 |
| `weight_kg` | 1/1 | %100 |

## Katalog geneli ortak sütun adayları

Bir sütunun "katalog geneli ortak" sayılabilmesi için **grupların çoğunda** matris kovasında
olması gerekir. Aşağıdaki sayı, o anahtarın kaç grupta matris kovasına düştüğüdür.

| Sütun | Matris kovasında olduğu grup sayısı |
|---|---:|
| `max_absorbed_power_w` | 13 / 19 |
| `max_delivery_m3h` | 13 / 19 |
| `phase` | 13 / 19 |
| `voltage_v` | 13 / 19 |
| `frequency_hz` | 12 / 19 |
| `weight_kg` | 12 / 19 |
| `erp_compliant` | 11 / 19 |
| `ip_rating` | 10 / 19 |
| `max_delivery_ls` | 10 / 19 |
| `motor_type` | 10 / 19 |
| `absorbed_current_a` | 9 / 19 |
| `diameter_mm` | 9 / 19 |
| `insulation_class` | 9 / 19 |
| `noise_level_db_a` | 8 / 19 |
| `size_a_mm` | 7 / 19 |
| `size_b_mm` | 7 / 19 |
| `size_c_mm` | 7 / 19 |
| `max_static_pressure_pa` | 6 / 19 |
| `pq_curve` | 6 / 19 |
| `rpm_max` | 5 / 19 |
| `motor_poles` | 4 / 19 |
| `discharge_type` | 3 / 19 |
| `compatible_model` | 2 / 19 |
| `filter_classes` | 2 / 19 |
| `has_bypass` | 2 / 19 |
| `max_ambient_temp_c` | 2 / 19 |
| `nominal_delivery_m3h` | 2 / 19 |
| `thermal_efficiency_curve` | 2 / 19 |
| `thermal_efficiency_pct` | 2 / 19 |
| `airflow_speed_max_ms` | 1 / 19 |
| `airflow_speed_min_ms` | 1 / 19 |
| `blade_diameter_mm` | 1 / 19 |
| `discharge_velocity_curve` | 1 / 19 |
| `drive_code` | 1 / 19 |
| `enclosure_class` | 1 / 19 |
| `enclosure_size` | 1 / 19 |
| `fire_rating` | 1 / 19 |
| `has_humidistat` | 1 / 19 |
| `has_timer` | 1 / 19 |
| `heating_power_w` | 1 / 19 |
| `humidity_removed_l_24h` | 1 / 19 |
| `max_current_a` | 1 / 19 |
| `max_voltage_v` | 1 / 19 |
| `min_voltage_v` | 1 / 19 |
| `noise_lpa_3m_db` | 1 / 19 |
| `nominal_static_pressure_pa` | 1 / 19 |
| `number_of_blades` | 1 / 19 |
| `number_of_speeds` | 1 / 19 |
| `operating_temperature_c` | 1 / 19 |
| `rated_output_current_a` | 1 / 19 |
| `rated_power_w` | 1 / 19 |
| `refrigerant_type` | 1 / 19 |
| `reversible` | 1 / 19 |
| `size_d_mm` | 1 / 19 |
| `tank_capacity_l` | 1 / 19 |

