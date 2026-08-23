# Spec Ekseni Cetveli — `products.technical_specs`

> **Sürüm:** 1.0 · **Tarih:** 2026-08-23 · **Şerit:** URUN · **Görev:** T158-VH
> **Kapsam:** `products.technical_specs` içindeki her alanın **ne taşıdığı** ve
> **hangi koşulda ölçüldüğü**. Veri taşıma / şema değişikliği bu cetvelin konusu DEĞİLDİR
> (ikisi de Recep kapısı); burada yalnız kural ve ölçülmüş durum yazılır.

## 0. Niçin var — iki yanılgı, aynı gün

Bu cetvel bir denetimden değil, **iki kez yanılmaktan** doğdu.

**Birinci yanılgı (sabah).** "Aynı fiziksel büyüklük markaya göre farklı anahtar adıyla
yazılıyor" diye ölçtüm: güç Danfoss'ta `rated_power_w`, diğerlerinde `max_absorbed_power_w`;
ses Vortice'te `noise_level_db_a`, SEAT'te `noise_lpa_3m_db`. Çözüm olarak "kavram → kanonik
anahtar eşlemesi" önerdim — yani alanları **birleştirmeyi**.

**Bu öneri zararlıydı.** Daha derin ölçüm gösterdi ki:

- `noise_lpa_3m_db` **3 metrede** ölçülmüş ses basıncıdır (SEAT, 45–77 dB).
  `noise_level_db_a` mesafe beyan etmez (Vortice, 25–79,5 dB). Birleştirilirse **ölçüm
  mesafesi bilgisi yok olur** ve geri getirilemez.
- `rated_power_w` **frekans konvertörünün** anma gücüdür (Danfoss, 34 ürün,
  `frequency-converters` kategorisi). Fan değil, sürücü. Fanın çektiği güçle aynı sütuna
  konamaz.
- `nominal_delivery_m3h` ile `max_delivery_m3h` farklı **çalışma noktasıdır**; SEAT ikisini
  de kullanır (66 ürün nominal, 21 ürün max).

**İkinci yanılgı (öğleden sonra).** Birinci yanılgıyı, aynı gün yazdığım seçim sihirbazının
okuma katmanına da gömmüştüm (`wizard.service.ts` içinde `sesDbA: ['noise_level_db_a',
'noise_lpa_3m_db']`). Sessiz fan kategorisinde tek marka olduğu için zarar görünmüyordu; başka
bir kategoriye bağlandığı gün **yanlış "en sessiz" önerisi** üretecekti. Düzeltildi (T150 4/4).

**Çıkan ders:** alanlar farklı adlarda çünkü **gerçekten farklı şeyler**. Kusur onların
varlığı değil; bir yüzeyin bunları **aynı eksendeymiş gibi** kullanabilmesi.

## 1. Üç kural

### K1 — Alan adı BİRİMİ taahhüt eder; değer yalnız SAYI taşır

Adı `_w`, `_mm`, `_m3h`, `_pa`, `_a`, `_v`, `_kg`, `_c`, `_l`, `_hz` ile biten bir alanın
değeri **çıplak sayı** olmalıdır. Birim ada yazılıdır, değerde tekrarlanmaz.

Bunun ihlali "boş alan"dan tehlikelidir: alan **dolu ve makul görünür**, ama sayısal her işlem
(karşılaştırma, sıralama, filtre, hesap) o satırı sessizce **veri yok** sayar.

İlgili: `field-name-commits-to-a-unit` — aynı ailenin birim tarafı (aynı alanda marka başına
farklı birim: kW ↔ W).

### K2 — Alan adı EKSENİ taahhüt eder

Eksen = **hangi büyüklük** + **hangi koşulda**. Koşul, adın içinde yaşamalıdır:

| koşul türü | örnek | ne söyler |
|---|---|---|
| ölçüm mesafesi | `noise_lpa_3m_db` | 3 metrede ses basıncı |
| çalışma noktası | `max_delivery_m3h` · `nominal_delivery_m3h` · `min_delivery_m3h` | serbest üfleme / anma / alt sınır |
| ürün rolü | `rated_power_w` (sürücü) ↔ `max_absorbed_power_w` (fan) | hangi cihazın gücü |

Koşulu belirsiz bir ad (`noise_level_db_a` — mesafe yok) **kıyas için zayıftır**; yeni alan
açılırken koşul ada yazılır.

### K3 — Kıyas yalnız AYNI eksende yapılır

Bir filtre, sıralama, "en iyi/en sessiz" seçimi ya da hesap motoru, yalnız **aynı ekseni**
taşıyan değerleri yan yana koyabilir. Farklı eksen söz konusuysa üç seçenek vardır ve
**dördüncüsü yoktur**:

1. **Dönüştür** — dönüşüm fiziksel olarak tanımlıysa (m³/h ↔ L/s gibi) ve dönüşüm yazılıysa.
2. **Ayrı taşı** — iki ekseni iki alan olarak tut, kullanıcıya hangisi olduğunu söyle.
3. **Bilmiyorum de** — değeri `null` bırak; o ürün o boyutta öne çıkmaz ama **elenmez**.

**Sessizce birleştirmek yasaktır.** Yanlış sıralamaktansa bilmediğini söylemek doğrudur.

## 2. Ölçülmüş durum (2026-08-23, canlı DB, 374 aktif ürün)

### 2.1 K1 ihlalleri — değerin içinde birim

| alan | marka | ürün | örnek | sonuç |
|---|---|---|---|---|
| `max_delivery_m3h` | Nicotra Gebhardt | **35 / 35** | `"10500 m³/h"` | markanın **tamamı** sayısal debi kıyasına giremez |
| `voltage_v` | SEAT | 3 | `"220 V"` | — |
| `operating_temperature_c` | Vortice | 3 | `"5 - 32"` | aralık; tek sayı değil, ayrı eksen |

**En ağırı Nicotra:** 35 ürünün 35'inde debi alanı **dolu**, sayısal olan **0**. Yani bu marka
bugün hiçbir sayısal debi yüzeyinde görünemez — ve alan dolu olduğu için doluluk raporlarında
"tamam" görünür. Doluluk sayımı bu kusuru **gizler**.

### 2.2 Aynı büyüklüğün farklı eksenleri (ihlal DEĞİL — beyan edilmesi gereken)

| büyüklük | eksenler (ürün sayısı) |
|---|---|
| debi | `max_delivery_m3h` 242 · `nominal_delivery_m3h` 89 · `min_delivery_m3h` 21 · `max_delivery_ls` 180 |
| basınç | `max_static_pressure_pa` 160 · `nominal_static_pressure_pa` 78 · `min_static_pressure_pa` 15 |
| ses | `noise_level_db_a` 142 (Vortice) · `noise_lpa_3m_db` 66 (SEAT) |
| güç | `max_absorbed_power_w` 279 · `rated_power_w` 33 (sürücü) · `heating_power_w` 8 · `optional_heater_power_w` 3 · `heating_capacity_kw` 4 |
| gerilim | `voltage_v` 274 · `min_voltage_v` / `max_voltage_v` 33 · `voltage_alt_v` 7 |
| akım | `absorbed_current_a` 163 · `rated_output_current_a` 33 · `max_current_a` 2 |
| koruma | `ip_rating` 209 · `enclosure_class` 33 |
| gövde ölçüsü | `size_a/b/c/d_mm` (Vortice) · `width/height/length_mm` (AVenS) · `connection_width/height_mm` |

**Dikkat — birim ayrışması:** `heating_power_w` (W) ile `heating_capacity_kw` (kW) aynı
kavramı iki birimde taşır. İkisi bin kat farklıdır; aynı sütuna konursa hata sessizdir.

### 2.3 Eğri alanları (şekil ekseni)

`pq_curve` (145 ürün) `[[Q,P],…]` biçiminde **JSON string**; `thermal_efficiency_curve` (13)
ve `discharge_velocity_curve` (8) ise nesne dizisi (`{"airflow_m3h":…, "efficiency_pct":…}`).
Aynı tabloda **üç farklı şekil**. Okuyan taraf şekli varsaymaz, tanır ve tanıyamadığında
uydurmaz (bkz. `ductFanSelection.parsePQCurve`).

## 3. Yeni marka / yeni kaynak bağlanırken

İlk soru "hangi alanlar geldi" **değildir**. Sırasıyla:

1. Bu kaynağın her alanı **hangi büyüklüğü hangi koşulda** ölçüyor? (katalogda yazılıdır)
2. Bizde aynı eksende bir alan **var mı**? Varsa aynı adı kullan.
3. Yoksa **koşulu ada yazarak** yeni alan aç — mevcut bir alana "yakın olduğu için" yazma.
4. Değerler çıplak sayı mı? Değilse ingestion'da **birimi ayır**, değere gömme (K1).
5. Ürün **rolü** aynı mı? (fan ↔ sürücü ↔ ısıtıcı) Farklıysa alan da farklıdır.

## 4. Kapı

`scripts/db/checks/catalog-integrity.mjs` içindeki **`spec-value-not-numeric`** kuralı K1'i
bekçiler: adı sayısal birim eki taşıyan bir alanda sayısal olmayan değer bulursa sayar.

Taban (`catalog-integrity-baseline.json`) **yalnız kısalır**: bugünkü 41 ihlal gerekçesiyle
af edilmiştir, **yeni ihlal eklenemez**. K2 ve K3 bugün için insan kuralıdır — makine kapısı
ancak alanlar eksen etiketiyle beyan edilirse mümkün olur, o da şema işidir (Recep kapısı).

## 5. İlgili

- `docs/standards/product-schema-standard.md` — alan kümesinin kendisi
- `docs/standards/catalog-ingestion-standard.md` — kaynaktan yazım hattı
- `src/lib/services/wizard.service.ts` — K3'ün kodda uygulanmış hâli (eksen karıştırmaz)
- `src/lib/hvac/ductPressure.ts` — dış kaynağa (fluids) karşı doğrulama deseni
