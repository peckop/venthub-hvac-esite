# KTL-71 — Air Door H AD: canlı ≠ katalog (voltaj ve ısıtıcı gücü), 2 Kasım 2026

Yöneten cetvel: `docs/standards/catalog-ingestion-standard.md` §6.3 (önce kaynak dizini), `product-schema-standard.md`. Kaynak: OPS-199 notu. Canlıya yazılmadı.

## Kaynaklar ve baskı tazeliği (KATALOG-kurallar 1)

| Belge (kaynak dizini) | Baskı | Envanter durumu | Sayfa |
|---|---|---|---|
| `Doc_Pubblicita_Air_Door_Range_189461.pdf` | Mayıs 2025 (Nisan 2025 değişiklik) | güncel | s.6 teknik veri |
| `Air_Conditioning_Air_Door_2.pdf` (kod 5.170.084.666) | Temmuz 2015 | eski | s.7 teknik veri |

Güncel baskı esas alınır. Eski baskı (2015) 23 Eylül'deki ısıtma gücü düzeltmesinin (`scripts/icerik-hatti/duzeltmeler/vortice-had-guc-ayrimi-2026-09-23.json`) tek kaynağıydı.

## Canlı değerler (31 Ekim–2 Kasım ölçümü, TR sayfa `vortice-h-ad-elektrikli-isiticili-hava-perdeleri`)

| SKU | Model | voltage_v | phase | max_absorbed_power_w (fan) | heating_power_w | absorbed_current_a |
|---|---|---|---|---|---|---|
| VRT-65155 | H AD 900 M | 230 | 1 | 160 | 6000 | 28 |
| VRT-65156 | H AD 900 T | **400** | 3 | 160 | 6000 | 10 |
| VRT-65157 | H AD 1200 T | **400** | 3 | 200 | 8000 | 13 |
| VRT-65158 | H AD 1500 T | **400** | 3 | 230 | 10000 | 18 |

## Fark tablosu

| Alan | Ürün | Canlı | Güncel föy (2025, s.6) | Eski föy (2015, s.7) | Durum |
|---|---|---|---|---|---|
| Voltaj | 65156, 65157, 65158 (T, üç faz) | 400 V | 380 V | 380 V | KESİN: iki baskı da 380 V; canlı 400 yanlış |
| Voltaj | 65155 (M, tek faz) | 230 V | 230 V | 230 V | tutuyor |
| Isıtıcı gücü | 65155 (900 M) | 6000 W | MAX W total 9200, 28 A | 2/4/6 kW (max 6) | ÇELİŞKİLİ (aşağıda) |
| Isıtıcı gücü | 65156 (900 T) | 6000 W | MAX W total 6150, 10 A | 2/4/6 kW | tutuyor (6 kW ısıtıcı, toplam 6150 W ile uyumlu) |
| Isıtıcı gücü | 65157 (1200 T) | 8000 W | 8050 (13 A) | 4/6/8 kW | tutuyor |
| Isıtıcı gücü | 65158 (1500 T) | 10000 W | 10650 (18 A) | 6/8/10 kW | tutuyor (fan 230 W + 10 kW = 10230; föy 10650) |

### 900 M ısıtıcı gücü: neden çelişkili, yazılmadı

- Güncel föy 900 M için toplam 9200 W ve 28 A yazıyor. Eski föy 2/4/6 kW yazıyor ve canlı bu değeri taşıyor (6000 W).
- 28 A, 230 V tek fazda yaklaşık 6,4 kVA eder; 9200 W ise 40 A gerektirirdi (9200 / 230). Yani güncel föyün kendi akım değeri 6 kW ısıtıcıyla (6160 W / 230 V ≈ 26,8 A) uyumlu, 9200 W ile değil.
- Buradan "9200 baskı hatasıdır" sonucu çıkarılmadı, bu bir çıkarım. Üretici teyidi gerekir (900 M tek fazlı 9 kW'lık ayrı bir ısıtıcı olabilir). Canlı değer değişmez.
- Canlıdaki akım (28 A) güncel föyden gelmiş, ısıtma gücü (6000) eski föyden: iki farklı baskının karışımı. Bu belge 23 Eylül düzeltmesinin tek kaynağının eski baskı olduğunu kayda geçirir.

## Yazım paketi (yalnız kesin satırlar)

`scripts/db/product-data/ktl71-h-ad-voltaj-duzelt.sql`: VRT-65156, 65157, 65158 `technical_specs.voltage_v` 400→380 (`||` birleştirme, sayaç 3, tamamen geri alınır). Okuyucu taraması (kural 2): `voltage_v` anahtarını `src/` içinde yalnız genel okuyucular okuyor (`productHelpers`, uyumluluk testleri, sözlükler); bu üç SKU kodda sabit yazılı değil. Metin taraması (kural 3): canlı sayfa HTML'inde `400` yalnız `technical_specs` içinde geçiyor, açıklama metninde yok. `description_i18n` için paketin 2. bloğu veritabanında ölçer.

Ölçülmedi: ürün tablosundaki `description_i18n`, 65156-58 için `absorbed_current_a` değerlerinin kaynağı (güncel föy 10/13/18 A ile tutuyor), EN sayfa.
