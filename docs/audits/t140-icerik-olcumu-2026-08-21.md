# T140-VH — Ürün İçerik Kalitesi Ölçümü (2026-08-21)

> Şerit: **ÜRÜN · T140-VH** · Durum: **ÖLÇÜM BİTTİ — iş emri Recep kararı bekliyor.**
> Bu belge cetvel değil, T140 iş emrinin girdisidir. Yöntem: dört Sonnet alt-ajanı
> (salt-okuma) + **ÜRÜN doğrulaması** — kritik sayılar tek bir bağımsız SQL ile yeniden ölçüldü.
>
> **KAYNAK/CETVEL:** `docs/standards/product-schema-standard.md` (spec alanları, §11.5 model
> katmanı) · `docs/standards/catalog-ingestion-standard.md` (içerik üretim hattı).
> Kaynak hiyerarşisi: **üretici teknik dokümanı > üretici web sayfası > satıcı sitesi.**

## Hazır satır

374 ürünün **187'si (%50,0)** birebir aynı doldurucu cümleyi taşıyor:
*"Avensair 2026 fiyat listesinden aktarılan temel ürün (Tier C)."* Bu 187 ürün tam **12 aileye**
ait ve aynı metin o 12 **ailenin kendi açıklamasında da** duruyor. Yani içerik üretim hattı bu
12 seri için hiç işletilmemiş; sorun ürün başına değil, **aile başına** çözülür.

**ÜRÜN doğrulaması (bağımsız SQL, 2026-08-21):**
`toplam_urun=374 · tierc_urun=187 · tierc_aile=12 · toplam_aile=32 · tierc_aile_satiri=12 · spec_bos_urun=45`
— ajan çıktılarıyla birebir örtüştü (45 = Danfoss 34 + AVenS 11).

## 1. Açıklama kalitesi (374 ürün / 32 aile)

| Ölçüm | Değer |
|---|---|
| TR açıklaması dolu | 374/374 · EN dolu 374/374 → **i18n parite açığı YOK** |
| Benzersiz TR metni | 128/374 → **benzersizlik %34,2** |
| Başka bir ürünle birebir aynı açıklama | 286/374 (%76,5) |
| TR uzunluk: medyan / p90 / max | 74,5 / 214 / 272 karakter |
| <200 karakter ("ince içerik") | 320/374 (%85,6) |
| Yer tutucu izi (lorem/TODO/boş HTML) | 0/374 |
| `is_description_manual = true` | **0/32 aile** |

Doldurucu metin çıkarılınca kalan 187 ürünün medyanı 156 karaktere çıkıyor: **yazım kalıbı
çalışıyor, sadece 12 seri için hiç uygulanmamış.**

### "Tier C" doldurucusunun dağılımı (187 ürün / 12 aile)

| Marka | Ürün |
|---|---|
| SEAT | 81 |
| AVenS | 37 |
| Nicotra Gebhardt | 35 |
| Danfoss | 34 |

Metin repoda hardcode DEĞİL (kod taraması boş) — ingestion çıktısından geliyor
(`venthub-pdf-ingestor` CSV'leri).

## 2. ⭐"DOLU ≠ DOĞRU" — spec değerleri kaynakla uyuşuyor mu?

Örnekleme: her markadan `sku ASC` sırasıyla 1./5./10./15./20. ürün (25 ürün), kaynakla
alan alan karşılaştırma.

| Marka | Karşılaştırılabilen alan | Uyuşmayan | Oran |
|---|---|---|---|
| Vortice | 77 | 12 | %16 |
| SEAT | 6 | 5 | %83 |
| Nicotra Gebhardt | 2 | 0 | %0 |
| Danfoss | 0 | — | alan hiç dolu değil |
| AVenS | 0 | — | bağımsız kaynak sayfası bulunamadı |
| **Toplam** | **85** | **17** | **≈%20** |

Payda küçük: 25 üründen yalnız 15'i en az bir alanda karşılaştırılabildi. Oran bir tahmin
değil ama **dar bir örneklemin** oranıdır.

### ⭐BİRİM HATASI SİSTEMİK — ÜRÜN tarafından bağımsız doğrulandı

Ajan, SEAT'te `max_absorbed_power_w` alanının Watt yerine **kW** değeri taşıdığını 3 örnekte
gördü. Tüm markalara yayıp ölçtüm (canlı SQL, 2026-08-21):

| Marka | Alanı dolu ürün | min | max | 10'un altında |
|---|---|---|---|---|
| Vortice | 169 | 4 | 10230 | 10 |
| **SEAT** | **81** | **0,06** | **7,5** | **81/81** |
| AVenS | 14 | 250 | 5500 | 0 |

SEAT'in **81/81 ürünü** bu alanda 0,06–7,5 aralığında. Bir fanın 0,06 W çekmesi fiziksel
olarak imkânsız; 0,06 kW = 60 W makuldür. Yani alan adı `_w` diyor, içerik kW.
**Aynı alan, aynı tabloda, markaya göre farklı birim** — karşılaştırma, sıralama, filtreleme
ve hesaplayıcı yüzeylerinin hepsi bu alanda yanlış sonuç verir ve hiçbiri kırmızı vermez.

**Sonuç:** T140'ın ilk kalemi "boş alanı doldurmak" değil, **birim sözleşmesini yazmak ve
bekçilemek** olmalı (alan adı birimi taahhüt eder; ihlali test kırmızısı olsun).

### Diğer doğruluk bulguları (örneklemden)

- **Vortice QE ailesi:** üç farklı üründe `diameter_mm=100` ve `noise_level_db_a=39` **birebir
  aynı** ve üçünde de kaynakla uyuşmuyor (kaynak: 80 mm). Şablon kopyalama izi.
- **Nicotra DD serisi:** 2/3 örnekte DB'deki üretici referans kodu (`6M0678`, `6M06MF`) resmi
  katalogda **hiç bulunamadı** — "yanlış değer"den ağır sınıf: var olmayan SKU olabilir.
- **SEAT devir yuvarlaması:** kaynakta 2870/1450, DB'de 2800/1400.
- **SEAT SKU soneki:** DB `51151000` ↔ kaynak `51151000RD0` — varyant soneki düşmüş.

## 3. Teknik spec boşluğu

| Marka | Ürün | Spec durumu |
|---|---|---|
| SEAT | 81 | 81/81 dolu ama **yalnız 4 anahtar**: `max_absorbed_power_w`, `rpm_max`, `voltage_v`, `weight_kg`. Debi/basınç/ses/çap **hiç yok**. `width/height/depth_mm` kolonları 0/81. |
| Danfoss | 34 | **34/34 tamamen boş** |
| AVenS | 51 | 11/51 boş; dolu olanlar fan şeması (`max_delivery_m3h`, `absorbed_current_a`, `ip_rating`, `motor_type`…) |

## 3. Kaynak adayları (doğrulanmış URL'lerle)

| Küme | Kaynak | Verdikt |
|---|---|---|
| **SEAT 81** | `seat-ventilation.fr` ürün sayfaları — debi (m³/h), toplam basınç (Pa), ses (dB, **rpm'e göre kırılımlı**), emiş çapı (mm), güç (kW), faz/gerilim, devir | **VAR.** 37/81 ürünün sayfası fiilen açılıp doğrulandı (7 sayfa); kalan 44 için URL deseni tutarlı ama **doğrulanmadı**. |
| **Danfoss FC-101 (17)** | `files.danfoss.com/download/Drives/DKDDPB100A302_FC101_SG_LR.pdf` — "Powers and currents" tablosu: kW, sürekli/kesikli akım, kayıp (W), **ağırlık**, **verim %**, frame, IP, gerilim sınıfı | **VAR — tam.** Tek tabloyla 17 ürünün tamamı doldurulabilir. Örnek eşleme `P11K` → 23 A / 7,9 kg / %98,1; AVenS'in kendi sayfasıyla çapraz doğrulandı (23 A, 135×296×241 mm). |
| **Danfoss FC-102 (17)** | `files.danfoss.com/download/Drives/DKDDPFP102A502_FC102_LR.pdf` (Fact Sheet) | **KISMEN.** Genel aralıklar/IP doğrulandı; kW-bazlı akım/ağırlık tablosu FC-101 formatında olması **beklenir ama ÖLÇÜLMEDİ.** |
| **AVenS ısı geri kazanım (6)** | `avensair.com` ürün sayfasındaki model-başına PDF datasheet'ler | **VAR.** 3 PDF açılıp içerik teyit edildi (AVENS 1000/1500/5000: debi, dış statik basınç, motor gücü, ses dBA, ağırlık, eşanjör verimi, boyut). Kalan URL'ler sayfadan çekilen **gerçek href**, uydurma değil. |

### Eşleme tuzakları (ölçülmüş)

- **Danfoss `model_code` kullanışsız:** iç/tedarikçi SKU'su (ör. `80108`), Danfoss sipariş koduna
  eşleşmiyor. Gerçek tip kodu `name` içinde gömülü: `FC101P11K 11` → `P11K`.
- **AVenS 5000 iki SKU'da tekrar ediyor** (`AVE-42500`, `AVE-47300`, aynı ad) — hangisinin hangi
  datasheet'e karşılık geldiği belirsiz. Veri kalitesi kalemi.
- **Isı geri kazanım cihazı fan şemasıyla doldurulamaz:** `fresh_air_flow_m3h`,
  `exchanger_efficiency_pct`, `noise_db` gibi **yeni alan seti** gerekir.

## 4. Kaynağı BULUNAMAYANLAR

- **AVenS FC-51** (`AVE-80141`): avensair.com'da sayfa yok (yalnız FC-101/FC-102 var).
- **BVU-LS 1000/2000/3000** (`AVE-30110`, `AVE-30111`): sitede "BVU 50*35 / 80*40 / 90*45"
  adlı ürünler var, isimlendirme kalıbı tutmuyor — **eşleme yapılamadı.**
- **AVenS 2,5A / 5A hız anahtarları**: sitede bulunanlar **Vortice markalı** (C 2,5, IRT 40) —
  aynı fiziksel ürün mü, AVenS'in kendi kartı mı **belirsiz**.

## 5. ÖLÇEMEDİM

- SEAT'in "fiche technique" PDF'leri **taranmış görsel** — metne çevrilemedi (yerelde
  `pdftoppm` yok). STORM serisinin ses/ağırlık verisi orada olabilir.
- 44/81 SEAT ürününün kaynak sayfası açılmadı (URL deseni tahmini).
- FC-102 akım/ağırlık tablosu resmi barındırmadan teyit edilmedi.
- `is_description_manual=true` kaydı 0 olduğu için "elle yazılan daha mı iyi" **karşılaştırılamaz**.

## 6. Öneri — T138 ile kesişim (ÜRÜN görüşü)

**SEAT zenginleştirme, model sayfaları açılmadan ÖNCE gelmeli.** Gerekçe ölçümde: SEAT'in 81
ürünü tek ailede ve yalnız 4 spec anahtarı var; T138 bu aileyi ~14 model kartına bölerse, her
kart 4 anahtar + aynı doldurucu cümleyle açılır — yani **ince içerikli 14 yeni sayfa** üretiriz.
Vortice Lineo Quiet pilotunun bu riski yok (23 spec anahtarı, 14 ayırt edici alan).

Sıra önerisi: **(1)** 12 ailenin doldurucu açıklamaları → **(2)** SEAT spec zenginleştirme
(kaynak hazır) → **(3)** Danfoss FC-101 (tek tablo, 17 ürün, en yüksek kaldıraç/emek oranı) →
**(4)** AVenS ısı geri kazanım (yeni alan seti gerekir).

**DB içerik yazımı = Recep kapısı; bu turda YAZIM YOK.**
