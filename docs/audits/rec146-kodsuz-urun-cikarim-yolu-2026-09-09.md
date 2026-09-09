# REC-146 · Şart 3 — kodsuz ürünlerin çıkarım yolu (ölçüm + karar)

**Damga:** 2026-09-09 · **Şerit:** URUN-KATALOG · **Kaynak:** `kaynak-dizini/sayfalar.jsonl`
(`avens_fiyat_listesi_2026_HQ.pdf`, 74 sayfa) · **Araç:** `scripts/kaynak_dizini/csv_kaynak_kapisi.py`

**CETVEL:** `catalog-ingestion-standard.md` §6.3/§6.4 · `product-schema-standard.md`
**Prod DB yazımı YOK.** Bu belge ölçüm ve karar üretir.

---

## 0. ⛔Planın "27 kodsuz ürün: s.18/42/43" ifadesi YANLIŞTI

Plan v2 §5 üçüncü şartı *"s.18/42/43 çıkarım yolu (27 ürün)"* diye yazıyordu.
Ölçtüm — **s.18'deki ürünler kodsuz DEĞİL.** Sayının 27 çıkması rastlantı:

| sayfa | gerçek durum | ürün |
|---|---|---|
| **s.18** | ⛔**KOD sütunu VAR, kod da VAR** — hücre BÖLÜNMÜŞ | 2 |
| s.26 | KOD sütunu var, **hücreler BOŞ** | 5 |
| s.42 (STORM) | **KOD sütunu HİÇ YOK** | 13 |
| s.43 (JET) | **KOD sütunu HİÇ YOK** | 14 |

s.18 ham başlık satırı: `['', 'K', 'OD', 'MODEL', …]` — "KOD" kelimesi **iki hücreye bölünmüş.**
Değer de öyle: `['', '11', '936', 'MICRO 100', …]` → kod **11936**, MEDIO → **11944**.

Yani **gerçekten kodsuz ürün 32 değil, s.26+s.42+s.43 = 32'dir ve s.18 buna dâhil değildir.**
Tesadüfen aynı sayı; sebep farklı. *(Bu, "ölçüt keskin ama evren yanlış" sınıfının bir başka örneği:
sayı tuttuğu için doğru sanılıyordu.)*

## 1. ⭐s.18'den çıkan İKİNCİ bulgu — kod ÇAKIŞMASI

Kapı bir ad uyuşmazlığı bildirmişti: `11936` → CSV `micro 100`, kaynak `at 12/12` (s.53).
Şimdi açıklandı: **`11936` kodu kaynakta İKİ farklı ürüne ait** — s.18 MICRO 100, s.53 AT 12/12.
CSV s.18'i (MICRO 100) almış, benim çıkarımım bölünmüş hücre yüzünden s.18'i **görmemişti**.

⛔**Bu tek başına bir katalog kusurudur ve yükleme öncesi karara bağlanmalıdır:** aynı kod iki
ürüne verilemez. Kaynakta mı çakışma var, yoksa s.53 okuması mı hatalı — **kararı veren Recep'tir**
(müşteriye giden kimlik). Bu belge yalnız bulguyu kayda geçirir.

## 2. Kodsuz ürünlerde KİMLİK neyle kurulur — ölçülmüş cevap

s.42 ham tablosu (`FİYAT` sütunu dâhil altı sütun):

```
['MODEL',            'AĞIRLIK', 'MOTOR', 'kW',   'RPM',  'FİYAT (Euro)']
['STORM 10',         '2.70',    '220 V', '0,06', '1400', '628']
['STORM 10',         '4.43',    '220 V', '0,09', '2800', '655']
['STORM 10',         '3.50',    '380 V', '0,06', '1400', '628']
['STORM 10',         '5.33',    '380 V', '0,09', '2800', '640']
```

⭐**Model adı TEK BAŞINA ürünü tanımlamıyor:** "STORM 10" dört ayrı ürün, dört ayrı fiyat.
Ayırt eden alanlar **MOTOR (gerilim) · kW · RPM**. s.43 (JET) aynı şemada.

**Sonuç — kodsuz ürün için kimlik anahtarı:**
```
KIMLIK = model_name + gerilim + guc_kw + rpm
```
s.26 (CA IL) farklı: orada ayırt eden **DEBİ** (`715 / 1610 / 3190 / 5070 / 7030 m³/h`) — yani
ayırt edici alan **tablodan tabloya değişir**, sabit bir liste yazılamaz.

**Kural (sabit liste yerine):** kodsuz tabloda kimlik = `model_name` + **MODEL ile FİYAT arasındaki
TÜM sütunların** değerleri. Bu sütunlar tablonun kendi başlığından okunur, varsayılmaz.

### ⛔2a. KENDİ İDDİAMI ÖLÇTÜM VE ÇÜRÜTTÜM — yükleyici sessizce birleştirmiyor

Bu belgenin ilk hâlinde *"yükleyici onları mükerrer sanıp birleştirir ve bir ürün sessizce
kaybolur"* yazmıştım. **Ölçmeden yazmıştım. Yanlış.** `scripts/kademe2-load/load.mjs` okundu:

| satır | davranış |
|---|---|
| `kimlik-kurali.mjs:84` | kod yoksa **SKU addan türetilir** → dört "STORM 10" → **aynı SKU** |
| `load.mjs:187` | `skuSeen.has(sku)` → **hata yazılır ve satır atlanır** (sessiz değil) |
| `load.mjs:274` | `if (errors.length) APPLY iptal` → **yükleme TAMAMEN durur** |

**Doğrusu:** yükleyici **fail-closed**. Birleştirme yok, sessiz kayıp yok — ama sonuç daha ağır:
**27 kodsuz ürün yüzünden AVenS yüklemesinin TAMAMI reddedilir.** Tek bir ürün bile inmez.

⭐Yani `ayirt_edici` sütunu bir "iyileştirme" değil, **yüklemenin ön koşulu**. O olmadan
CSV ne kadar doğru olursa olsun `kademe2-load` hiçbir satırı yazmaz.
*(Ders: kapının ne yaptığını okumadan onun adına konuşma —* [[fail-open-kapi-kapi-degildir]]
*tersi de geçerli: fail-CLOSED bir kapıyı fail-open sanmak da yanlış hüküm üretir.)*

## 3. Yapılacak — çıkarım yolu

| # | iş | ölçütü |
|---|---|---|
| 1 | Bölünmüş başlık/değer hücrelerini birleştir (s.18 `'K'+'OD'`, `'11'+'936'`) | s.18'den **2 kodlu** ürün gelir, kodsuz sayılmaz |
| 2 | Kodsuz tabloda kimlik = model + ara sütunların hepsi | s.42'de "STORM 10" **4 ayrı satır** kalır, birleşmez |
| 3 | `model_code` = `null`, `confidence = missing` — **kod ÜRETİLMEZ** | uydurma ardışık numara **0** |
| 4 | Ayırt edici alanlar CSV'ye **spec sütunu** olarak taşınır | kodsuz satırda ayırt edici alan **boş DEĞİL** |
| 5 | `11936` çakışması Recep kapısına yazılır | karar alınmadan yükleme YOK |

### ⛔3a. CSV şeması — v2'de yazılana EK
Plan v2 `confidence` ve `kod_kaynakta_yok` sütunlarını ekliyordu. Buna **`ayirt_edici`**
eklenir (kodsuz satırda kimliği kuran alanların `alan=değer` listesi). Aksi hâlde kodsuz
ürünler CSV'de **birbirinden ayırt edilemez** → `kademe2-load` SKU çakışması görür ve
**yüklemenin tamamını reddeder** (§2a, ölçüldü). Tek ürün değil, tüm parti iner ya da hiçbiri inmez.

## 3b. ⭐SKU türetme kuralı — üç aday ölçüldü, biri seçildi

`kimlik-kurali.mjs` (B) hâli kodsuz üründe SKU'yu **addan** türetiyor. 27 ürün aynı adı
paylaştığı için bu çakışıyor. Üç aday kural gerçek veriyle koşuldu (34 kodsuz ürün):

| aday | çakışma | SKU uzunluğu ort. | örnek |
|---|---|---|---|
| A · **tüm** ara sütunlar | 0 | 32.9 | `VRT-STORM-10-2-70-220-V-0-06-1400` |
| B · **en küçük** ayırt edici küme | 0 | — | `VRT-STORM-10-2-70` |
| C · **ad çakışırsa** mühendislik alanları | **0** | **23.8** | `VRT-STORM-10-220-V-0-06-1400` |

### ⛔"En küçük küme" ölçütü YANLIŞ CEVAP VERİYOR
Aday B'nin bulduğu minimal ayırt edici **`AĞIRLIK`** — s.42 ve s.43'te ağırlık tek başına
13/13 ve 14/14 tekil. Matematiksel olarak doğru, **mühendislik olarak saçma**: ağırlık bir
ölçüm değeridir, kimlik değil. Kataloğun bir sonraki baskısında `2.70` → `2.75` olursa
SKU değişir ve **ürün kimliğini kaybeder.**
⭐Ders: *"tekilliği sağlayan en küçük küme"* bir kimlik ölçütü değildir; tekillik gereklidir
ama yeterli değildir. Alanın **anlamı** da ölçüte girer.

### Seçilen: Aday C
```
kodsuz üründe SKU:
  ad, kodsuz küme içinde TEKİL ise      → <ÖNEK>-<ad>
  ad ÇAKIŞIYORSA                        → <ÖNEK>-<ad>-<mühendislik alanları>
  mühendislik alanı = MOTOR · kW · RPM · DEBİ · HAVA DEBİSİ · HIZ ANAHTARI
  ⛔AĞIRLIK ayırt edici DEĞİLDİR (spec olarak taşınır, kimliğe girmez)
```
**Ölçüm:** 34 kodsuz ürün → **34 tekil SKU, çakışma 0**, ayırt edici yalnız **24 üründe**
eklendi. `VRT-CA-IL-4020-ES-RECT` temiz kaldı — modülün kendi 2026-09-07 ölçümünün
önerdiği biçimin aynısı.

**Ayırt ediciliğin sınırı ölçüldü:** s.43'te `MOTOR+RPM` **yetmiyor** (14 üründen 12 tekil);
`MOTOR+kW` ve `MOTOR+kW+RPM` yetiyor. Yani üçlü keyfi seçilmedi, en dar güvenli küme.

## 4. Bitti ölçütü (plan v2 §3'e ek dördüncü kontrol)

```
EKSEN 4 · AYIRT EDİCİLİK : kodsuz satırların (model_name + ayirt_edici) demeti TEKİL
                           → mükerrer demet 0 · beklenen kodsuz satır 32
```
Sabotaj kolu: iki kodsuz satırın ayırt edici alanı eşitlenirse Eksen 4 **kırmızı** vermeli.
*(Kapının üç ekseni için bu kanıt `scripts/kaynak_dizini/testler/kapi_sabotaj_sinavi.py`'de
zaten var — dördüncüsü eklenirken aynı biçimde sınanır.)*

## 5. Riskler / açık uçlar

- **`11936` çakışması Recep kararı** — bu belge onu çözmez, kayda geçirir.
- Ayırt edici alanların **ürün şemasındaki karşılığı** (`voltage`, `power_kw`, `rpm`, `airflow`)
  `product-schema-standard.md` ile eşlenmeli; eşleme yapılmadan yükleme YOK.
- s.42/43 tabloları `AĞIRLIK` da taşıyor; ağırlık **ayırt edici olarak kullanılmamalı**
  (ölçüm değeri, kimlik değil) ama spec olarak taşınmalı.
