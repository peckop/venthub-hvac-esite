# AVenS fiyat CSV'si — tam çıkarım planı (REC-146, 2026-09-09)

**Hedef (Recep, kendi sözü):** *"csv eksiksiz olması lazım bizim taşınabilir katalog mimarimiz
için… katalog veri girişi full kapsam ajans gibi"*

**YÖNTEM:** plan → plan-challenger → koşum. Çıkarımın kendisi görsel çoklu-ajan skill'i
(`.agent/skills/venthub-catalog-importer/`, T119'da 25 alt-ajan).
**CETVEL:** `catalog-ingestion-standard.md` §6.3/§6.4 · `category-taxonomy-standard.md` §9.
**Prod DB yazımı YOK** — bu iş CSV üretir; DB'ye yükleme ayrı ve Recep kapısında.

---

## 1. Bugün ölçülen gerçek durum

Kaynak: `kaynak-dizini/sayfalar.jsonl` → `avens_fiyat_listesi_2026_HQ.pdf`, **74 sayfa, 148 tablo**.

| bulgu | sayı | ne demek |
|---|---|---|
| CSV kodu kaynağın **tablosunda** var | 450 / 484 | sağlam kısım |
| tabloda yok ama **metinde** var | **29** | tablo çıkarımı kaçırmış, ürün gerçek |
| ⛔kaynakta **hiç yok** | **5** | aşağıda, ayrı başlık |
| CSV'de **alfanümerik kod** | **0** | oysa kaynakta en az 35 var |

### ⛔1a. Beş uydurma kod — `16076`–`16080`
CSV bu beş satırı `CA IL 4020/5035/6040/7050/8060 ES RECT` adlarıyla taşıyor ve DB'de
`VRT-16076…16080` olarak **müşteriye görünüyor**.

**Ürünler gerçek:** sayfa 26'da adları, debileri (`715 m³/h`…), hız anahtarları ve fiyatları var.
**Kodları gerçek DEĞİL:** o tabloda başlık `KOD | MODEL | DEBİ | HIZ ANAHTARI | FİYAT` diyor ama
**satırlarda kod sütunu BOŞTUR** — AVenS bu ürünlere katalogda kod basmamış.
`16076`–`16080` **58 belgelik kaynak dizininin hiçbir yerinde geçmiyor** (ölçüldü) ve **ardışık** —
yani çıkarım aracı boş sütunu görüp **numara üretmiş**.

> Bu, 2026-09-08'de Recep'in *"ben de bilmiyorum bu ürünlerin kaynağı belli değil mi?"* sorusunun
> ölçülmüş cevabıdır. O gün "Vortice ise kalsın" denip dokunulmamıştı; **kod tarafı ölçülmemişti.**

### 1b. Kaynağın "görülmeyen yarısı" — çözüldü, sorun değil
Başlığında `KOD` olmayan 69 tablo incelendi: **GİRİŞ, İÇİNDEKİLER** gibi düzen tabloları.
Ürün taşımıyorlar. Asıl kaçak başka yerde: **başlık hücreleri kaymış** ürün tabloları
(ör. s.13 `['11201','','M 100/4" PUNTO','','90 m3/h']`) — bunlar ürün tablosudur ama benim
"başlıkta KOD ara" ölçütüm elemişti. **Ölçütün kendisi dardı, kaynak eksik değil.**

---

## 2. Yapılacak

| # | iş | ölçütü |
|---|---|---|
| 1 | Çıkarımı **skill ile** yeniden koş (74 sayfa, sayfa başına ajan) | her sayfa için kod+ad+fiyat listesi |
| 2 | **Kod biçimine varsayım koyma** — alfanümerik/boşluklu/uzun kodlar birebir | alfanümerik kod sayısı > 0 |
| 3 | **Kodsuz ürün KOD UYDURMAZ** — `model_code` boş kalır, `kod_kaynakta_yok: true` işaretlenir | uydurma ardışık numara **0** |
| 4 | Metinde olup tabloda olmayan 29 ürün yakalanır | fark listesi boşalır |
| 5 | Mevcut 5 sahte kodun kaderi → **§3** | — |

### Bitti ölçütü (sayı, "taradık" değil)
```
CSV kod kümesi  ==  kaynak kod kümesi      → fark 0 (iki yönde)
alfanümerik kod  >  0
kaynakta bulunmayan kod  ==  0
```
Ayrıca **sabotaj kolu:** kaynağa elle sahte bir kod eklenirse kapı **kırmızı** vermeli; vermiyorsa
kapı ölçmüyordur.

---

## 3. Sahte kodların kaderi — karar gerektiren tek kalem

Beş ürün **canlıda ve müşteriye görünüyor** (`VRT-16076…16080`). Üç yol:

| yol | sonuç | risk |
|---|---|---|
| **A. Kodu boşalt, ürünü tut** | ürün kalır, kodu görünmez | müşteri kodla arayamaz — ama zaten var olmayan kodla arıyordu |
| **B. AVenS'e sor, gerçek kodu al** | doğru çözüm | dış bağımlılık, süre belirsiz |
| **C. Olduğu gibi bırak** | değişiklik yok | ⛔**müşteriye var olmayan kod veriliyor** |

**Önerim: A + B birlikte** — kod alanı boşaltılır (uydurma yayınlanmaz), AVenS'e sorulur, cevap
gelince gerçek kod yazılır. Ürün hiçbir aşamada vitrinden düşmez.
⛔**Bu bir müşteriye-görünen-veri kararıdır → Recep'in.** Ölçüm ve öneri burada durur.

---

## 4. Riskler

- **Çıkarım deterministik değil** (görsel çoklu-ajan). "Çıktı değişmedi" kanıt sayılmaz;
  reçete bunu zaten `determinist: false` diye işaretliyor. Kabul ölçütü **byte-eşitlik değil,
  kod kümesi eşitliği**.
- **Yeni CSV, eskisini ezer.** Bugün aynı sınıf bir kayıp yaşandı (dizin 2127→74). Bu yüzden:
  yeni çıktı **ayrı dosyaya** yazılır, karşılaştırma yapılır, **ancak ölçütler geçtikten sonra**
  yerine konur. Eski dosya commit'te durur.
- **CSV → DB yükleme bu planın DIŞINDA.** Prod yazımı Recep kapısı; bu iş yalnız dosyayı üretir.

## 5. Bu plandan çıkacak cetvel maddesi

`catalog-ingestion-standard.md`'ye: **"kaynakta kod yoksa kod ÜRETİLMEZ."**
Boş bırakılır ve işaretlenir. Bugünkü beş vaka bu maddenin gerekçesidir — çıkarım aracı sessizce
ardışık numara üretti, hiçbir kapı görmedi, kod **müşteriye kadar gitti**.
