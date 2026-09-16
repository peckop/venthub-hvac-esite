# AVenS fiyat CSV'si — tam çıkarım planı (REC-146) · **v2, red-team sonrası**

**Hedef (Recep, kendi sözü):** *"csv eksiksiz olması lazım bizim taşınabilir katalog mimarimiz
için… katalog veri girişi full kapsam ajans gibi"*

**YÖNTEM:** plan → plan-challenger → koşum. Çıkarım: görsel çoklu-ajan skill'i
(`.agent/skills/venthub-catalog-importer/`).
**CETVEL:** `catalog-ingestion-standard.md` §6.3/§6.4 · `category-taxonomy-standard.md` §9.
**Prod DB yazımı YOK** — bu iş CSV üretir; DB'ye yükleme ayrı ve Recep kapısında.

> ⛔**v1 BLOK aldı.** Bağımsız red-team (`docs/audits/rec146-red-team-csv-plani-2026-09-09.md`)
> beş iddiadan **dördünü çürüttü**. Bu sürüm o dördünü kapatır. Çürüyenler aşağıda **adıyla**
> duruyor — silinmedi, çünkü planın niçin değiştiğini ancak yanlışı görünce anlarsınız.

---

## 0. v1'de NE YANLIŞTI

| # | v1 iddiası | gerçek | nasıl yanıldım |
|---|---|---|---|
| 1 | "69 başlıksız tablo düzen tablosu, **ürün taşımıyor**" | **12'si ürün taşıyor, 103 satır** | **4 tanesine baktım, 69'a genelledim** — örnekleme |
| 2 | 16076–16080 uydurma | ✅**ayakta ve güçlendi** | — |
| 3 | bitti ölçütü "kod kümesi farkı 0" | **kör ve çelişkili** | kodsuz ürünü ölçmüyor; SKILL'le çelişiyor |
| 4 | "ayrı dosyaya yaz, ölçüt geçince taşı" | **mekanizma YOK** | niyeti kapı sandım |
| 5 | "kabul ölçütü kod kümesi eşitliği" | **fiyat/ad'a kör** | tek eksende ölçüt |

⭐**1 numaralı hata, bu haftanın tekrar eden sınıfının plana yazılmış hâliydi:** *ölçüt keskin,
evren dar.* Üstelik uyarı zaten elimdeydi — kendi ölçüm belgeme *"tarama tabloların yarısını
görmüyor"* diye yazmıştım, sonra plana *"sorun değil"* yazdım.

## 1. Düzeltilmiş kaynak tablosu

Başlık araması **satır 0 yerine ilk 4 satırda** yapılınca:

| ölçüt | v1 | **v2 (doğru)** |
|---|---|---|
| kaynak tekil kod | 442 | **498** |
| alfanümerik kod | 35 | **50** |
| CSV tekil kod | 484 | 484 |
| CSV'de alfanümerik | 0 | **0** *(değişmedi — asıl bulgu ayakta)* |

**KOD sütunu HİÇ OLMAYAN ürün tabloları:** s.18, **s.42 (STORM, 13 ürün)**, **s.43 (JET, 14 ürün)**.
Bunlar "başlık kaymış" değil, **kodsuz yayınlanmış ürün aileleri** — s.26 (CA IL, 5 ürün) ile aynı sınıf.

### ✅Ayakta kalan tek iddia, üstelik güçlenerek: beş uydurma kod
Red-team benim yapmadığım testi yaptı: **CSV'de 18 adet `16xxx` kodu var, 13'ü kaynakta mevcut,
yalnız bu 5'i yok.** Bu, *"belki tüm blok başka bir kaynaktan"* alternatifini eler.
İki yönde 1:1 kilit: kaynakta hiç geçmeyen CSV kodu **tam 5**; kaynakta kodu hiç olmayan s.26 ürünü
**tam 5**. → Bu kalem Recep kapısında, **BLOK hükmü onu geciktirmez** (OPS hükmü uygulanıyor).

**Kök neden düzeltmesi:** 29 kod CSV'ye yalnız sayfa **metninden** girmiş — yani araç metne
bakabiliyor. s.26'da **bakmadan üretti**. Sorun "metni okuyamıyor" değil, **boşluğu doldurma
eğilimi**.

## 2. Yapılacak

| # | iş | ölçütü |
|---|---|---|
| 1 | Çıkarımı skill ile yeniden koş — **74 sayfanın hepsi**, kodsuz tablolar dâhil | her sayfa için satır listesi |
| 2 | Kod biçimine varsayım YOK (alfanümerik/boşluklu/uzun birebir) | alfanümerik kod **≥ 50** |
| 3 | ⛔**Kodsuz ürün: kod ÜRETİLMEZ** — `model_code` null **+ `confidence != ok`** | uydurma ardışık numara **0** |
| 4 | s.18/42/43 (27 ürün) ve s.26 (5 ürün) **adıyla** çıkarıma girer | bu 4 sayfadan gelen satır **> 0** |
| 5 | Metinde olup tabloda olmayan satırlar yakalanır | fark listesi boşalır |

### ⛔2a. CSV şeması değişmeli — SKILL ile çelişki kapatılıyor
`SKILL.md:97` aynen: *"`model_code` boş bırakma (köprü); eksik/şüpheli = **null + confidence != ok**"*.
v1 "boş kalır" diyordu — **cetvelle çelişiyordu**. Ama mevcut CSV **5 sütun** ve `confidence`
**yok**. Bu yüzden: çıktı şemasına `confidence` **ve** `kod_kaynakta_yok` sütunları eklenir.
Şema değişikliği `csv-import-export-standard.md`'yi ilgilendirir → yükleyici tarafı ayrıca ölçülecek.

## 3. Bitti ölçütü — v1'in "fark 0"u ÇÜRÜDÜ, yerine ÜÇ EKSEN

v1 tek eksenliydi ve **kodsuz ürünlere kördü**: boş kod kümeye girmez, 5 ürün tamamen düşse bile
ölçüt "fark 0" derdi. Ayrıca iki dosya **kod farkı 0** iken sütun sayısı 5 vs 12 olabiliyor
(gerçek dosyalarla kanıtlandı) — yani fiyat ve ad **kör noktada**.

```
EKSEN 1 · KİMLİK : CSV kod kümesi == kaynak kod kümesi           → iki yönde fark 0
EKSEN 2 · SAYIM  : CSV ürün SATIRI == kaynak ürün satırı          → kodsuzlar DÂHİL
                   (kodsuz ürün sayısı ayrı raporlanır, beklenen ≥ 32: s.18/26/42/43)
EKSEN 3 · İÇERİK : her satırda price_eur ve model_name kaynakla eşleşir → uyuşmazlık 0
```
**Üçü birden geçmeden koşum kabul edilmez.** Sabotaj kolları: (a) kaynağa sahte kod eklenirse
Eksen 1 kırmızı; (b) bir ürün satırı silinirse Eksen 2 kırmızı; (c) bir fiyat değiştirilirse
Eksen 3 kırmızı. Üçü de kırmızı vermiyorsa **ölçüt ölçmüyordur**.

## 4. ⛔Veri kaybı kapısı — v1'de YOKTU, KRİTİK

v1 *"ayrı dosyaya yazılır, ölçüt geçince yerine konur"* diyordu. Red-team ölçtü: **bu bir niyet,
kapı değil.** `cikti_tazelik.py` yalnız **commit tarihi** karşılaştırıyor; içerik ayağı olan sha256
dalı `determinist:false` kalemlerde **satır 129-130'da reddediliyor** → bu CSV'de **içeriği ölçen
tek satır yok**. Yeni CSV commit'lendiği an kapı yeşil.

**Gerekli:** üç eksenin **koşulabilir bir betiği** (`scripts/kaynak_dizini/csv_kaynak_kapisi.py`),
CI'da koşar, kırmızı verirse CSV değişimi inmez. Kapı olmadan yeniden üretim **koşulmaz** —
bugün sabah aynı sınıf bir kayıp yaşandı (dizin 2127→74; kurtaran kapı değil git'ti).

**Ayrıca yan bulgu:** reçetenin girdilerinde `sayfalar.jsonl` **yok** ve `03-output/`'taki üç
CSV'den yalnız biri reçetede. Reçete kapsamı eksik.

## 5. Koşumdan ÖNCE kapatılacak üç kalem (BLOK'un şartı)

1. **SKILL çelişkisi + şema:** `confidence` ve `kod_kaynakta_yok` sütunları.
2. **İçerik kapısı:** üç eksenli betik + CI kolu + sabotaj kanıtı.
3. **s.18/42/43 çıkarım yolu:** KOD sütunu olmayan ürün tabloları nasıl işlenecek (27 ürün).

## 6. Bu plandan çıkacak cetvel maddesi

`catalog-ingestion-standard.md`: **"kaynakta kod yoksa kod ÜRETİLMEZ."**
Boş bırakılır, `confidence != ok` işaretlenir. Beş vaka bunun gerekçesidir — araç boşluğu sessizce
doldurdu, hiçbir kapı görmedi, kod **müşteriye kadar gitti**.

## 7. Riskler
- Çıkarım **deterministik değil** → kabul ölçütü byte-eşitlik olamaz; §3'teki üç eksen bunun yerine geçer.
- **CSV → DB yükleme bu planın DIŞINDA.** Prod yazımı Recep kapısı.
- Şema değişikliği yükleyiciyi (`kademe2-load`) etkileyebilir — koşumdan önce ölçülecek.
