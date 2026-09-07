# FAZ 4 hazırlığı — etiket düzeltme + yükleyici kuru koşumu (Katalog)

**Damga (ölçüldü, `date -u`):** 2026-09-07T08:0xZ · **Şerit:** URUN-KATALOG (sid 3a7976a1)
**Emir:** OPS — *"FAZ 4 GO: yükleme hazırlığına başlayabilirsin (alan adları + etiket düzeltme +
yükleme betiği kuru koşum); canlıya YAZMA adımı yine ayrı GO ile."*
**YÖNTEM:** elle + betik — düzeltme ve yükleme deterministik olduğu için ajan dalgası koşulmadı;
sapma yok. **Canlıya yazım: 0** (kuru koşum; yazım kolu iki ayrı anahtara bağlı, §5).
**Cetvel:** `docs/standards/product-schema-standard.md`, `catalog-ingestion-standard.md`.
**Girdi:** `rec172-faz2-sonuc-2026-09-06.md` (OPS) + ingestor `staging/teknik-*-2026-09-06.csv` (8 dosya, 764 satır).

## 0. Hüküm

Hazırlık **bitti**: 764 satırın **694'ü yüklenebilir**, **23'ü karar bekliyor**, 47'si çıkarıldı
ya da tekilleştirildi. Kuru koşum **308 hücre / 100 ürün** diyor. Ama reçetenin kendisinde
**üç ölçülmüş kusur** var (§1) ve **üç yeni karar kalemi** doğdu (§4) — ikisi vitrine yanlış
değer yazdırabilecek cinsten.

## 1. ⚠Reçetenin üç kusuru (ölçüldü — körü körüne uygulanamazdı)

| # | Kusur | Ölçüm | Sonuç |
|---|---|---|---|
| 1 | **Satır numaraları iki farklı kuralla verilmiş** | ADH'de "8 güç satırı" denen `3,9,…,45` gerçekte `max_static_pressure_pa`; güç satırları `4,10,…,46`. AT'de de +1 kayma. RDH'de ise numaralar **dosya satırı** ve doğru | Körü körüne uygulansa **doğru satırlar silinir, yanlışlar kalırdı** |
| 2 | STORM "sil: satır 51 (dayanaksız IP20)" — **tek** satır | Ölçümde **iki** IP20 satırı: `SEA-61102010` (s.4) ve `SEA-61103010` (s.4), ikisi de GÜÇLÜ, ikisi de aynı motor-tipi tablosundan | Aynı sınıftan iki satırın birini silip diğerini bırakmak tutarsız → **ikisi de karar bekliyor** |
| 3 | STORM "**16** mükerrer anahtar" | Ölçüm: **10** mükerrer `(sku,alan)` çifti — 8'i aynı değer (tekilleştirildi), 2'si çelişen değer (karar bekliyor) | Sayı 16 değil 10; fazla satır 8 |

**Bu yüzden seçim satır numarasıyla değil `(sku, alan)` ikilisiyle yapılıyor.** Bağımsız
doğrulama: alan bazlı seçim reçetenin kendi saydığı **22** (K9) ve **8** (K10) rakamını birebir
üretiyor — yani kusur numaralarda, kümede değil.

## 2. Recep kararlarının uygulanışı (K9/K10/K11)

| Karar | Uygulama | Satır |
|---|---|---|
| **K9** — kayış tahrikli gövdede izinli motor gücü **ayrı alan** | `max_absorbed_power_w` → `permissible_motor_power_w` (ADH 8 + AT 8 + RDH 6) | **22** |
| **K10** — Nicotra eğrisi **toplam basınç**, statiğe çevrilmez | `max_static_pressure_pa` → `max_total_pressure_pa` (ADH) | **8** |
| **K11** — ATEX kodu teknik tabloda + cümle açıklamada | ⚠**uygulanamadı**, bkz. §4.1 | 7 |

**Migration gerekmiyor** (ölçüldü): `products.technical_specs` **JSONB**, düz anahtar→değer.
Yeni alan adı DB şeması değiştirmeden yaşar. Gereken tek şey **cetvel satırı**
(`product-schema-standard.md` — o dosya benim claim'imde değil, cetvel sahibine gider).

## 3. Sayılar

```
girdi   764 satır (8 dosya)
 -15    SEAT 50: 3 dayanaksız wiring + 12 min_/max_ semantik ihlali
 - 8    STORM mükerrer (aynı değer, iki kaynak) tekilleştirildi
 -12    STORM min_voltage_v atıldı (24 satır -> 12 voltage_v=400 + çift-gerilim notu)
 -23    KARAR BEKLİYOR (yüklemeye girmez, silinmez de)
=  694  yüklenebilir  ->  kuru koşum: 308 hücre / 100 ürün değişecek
                          (694'ün 386'sı canlıda zaten aynı değer = idempotent)
```

## 4. ⚠Üç yeni karar kalemi (ölçümle doğdu, reçetede yoktu)

### 4.1 ATEX — K11 biçim sorusunu çözüyor ama JET'in değeri **kod değil**
Canlıda `atex_marking` = **14 Vortice ürününde ekipman-grubu işaretlemesi**
(`II 2G/D h T3/125°C X Gb/Db`). JET'in 7 satırı ise **kurulum bölgesi beyanı**
(`Zone II, Category 3G (Directive 94/9/CE)`). İkisi de "II" ile başlıyor; biri **grup**,
diğeri **bölge**. Aynı alana konursa alan iki anlam taşır ve üzerindeki her karşılaştırma
sessizce anlamsızlaşır — reçetenin §5-8'de işaret ettiği kusurun ta kendisi.
**Karar gerekli:** ayrı anahtar (`atex_zone`) mı, yoksa yalnız açıklama cümlesi mi.

### 4.2 AT ailesi ağırlıkları — sürüm belirsiz
DB adı "AT 7/7" sürüm harfi taşımıyor, sipariş kodu PDF'in tamamında **0 kez** geçiyor;
belirsizlik iki sürüme indi (S / SC) ve aralarında ağırlık **%20-26 sapıyor**.
%26 sapan bir ağırlık vitrine yazılamaz → **8 satır tutuldu**.

### 4.3 STORM çelişen güç değerleri
`SEA-61122000` ve `SEA-61122010` için aynı anahtara iki değer (180 W / 250 W — 2018 PDF vs
2026 web). **4 satır tutuldu**; hangisinin geçerli olduğu birincil teyit ister.

**Ayrıca — bu işin dışında ama ölçüldü:** canlıda **38 hücre** sayısal anahtarda birim-gömülü
metin taşıyor (`max_delivery_m3h = "6530 m³/h"`, `voltage_v = "220 V"`). Canlının teamülü
sayı (int 2990 · float 639 hücre); bu 38 hücre **mevcut bir bozukluk**, bu yüklemenin getirdiği
değil. Yükleme, kapsadığı hücrelerde bunu düzeltiyor; kalanı ayrı kalem.

## 5. Yükleyici kapıları (`faz4-teknik-yukle.py`)

1. **EVREN** — `duzeltilmis/` altında 8 dosya yoksa KIRMIZI (dar dizin sessizce eksik yükler).
2. **VERİ** — canlı okuma `_veri.tumunu_cek`: kesin sayı + sıralı sayfalama + karşılaştırma
   (PostgREST 1000 satırda sessizce keser).
3. **EŞLEŞME** — CSV'deki her `sku` canlıda bulunmalı; bulunmayan varsa **yazım yapılmaz**.
4. **IDEMPOTENT** — aynı değer zaten yazılıysa hücre değişmez; ikinci koşum 0 değişiklik.
5. **YAZIM KOLU İKİ ANAHTARLI** — `--yaz` **ve** `CANLI_YAZIM_ONAYI` ortam değişkeni.
   Varsayılan kuru koşum. Recep'in kendi sözü olmadan yazılmaz; akran aktarımı onay değildir.

## 6. Sınır

Değerlerin doğruluğunu bu iş **yeniden ölçmedi** — Faz 2 doğrulaması + kendi ikinci göz
incelemem (`icerik-hatti-faz2-inceleme-2026-09-07.md`, DD 12/12) dayanak. Bu iş yalnız
**etiket/kutu** işidir: hangi değer hangi alana, hangisi hiç girmez.
