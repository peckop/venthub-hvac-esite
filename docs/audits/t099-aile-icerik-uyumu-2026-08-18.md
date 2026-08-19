# T099 — Aile↔içerik uyumu ve satın-alınan kimliğin görünürlüğü (ÖLÇÜM)

> **Tarih:** 2026-08-18 · **Şerit:** PRICING-STOK · **Tetikleyen:** Recep
> ("sepete eklerken görünen ürün ile ödeme aşamasındaki ürün açıklamaları birbirini tutmuyor")
> **Yöneten cetvel:** `docs/standards/catalog-ingestion-standard.md` (veri tarafı) — ürün **adının
> yüzeylerde gösterimi** için cetvel **YOK**; bu ölçüm o boşluğu da kayda geçirir (CLAUDE.md kural 1).
> **Bu dosya ölçümdür, karar değildir.** Veri düzeltmeleri prod yazımıdır → **Recep kapısı**.

## 0. Taban sayılar (prod, 2026-08-18)

| Ölçüm | Değer |
|---|---|
| Ürün | **374** |
| Aile | **32** |
| Ailesiz ürün | **0** |
| Adı kendi ailesinin adına EŞİT olan ürün | **0 / 374** |

Son satır bu işin özeti: **hiçbir üründe** detay sayfasının başlığı ile sepete/siparişe/e-postaya
giden metin aynı değil. Yani Recep'in gördüğü tutarsızlık tek bir ailenin kusuru değil, **374 üründe
birden** yaşayan bir yüzey kuralı boşluğudur.

## 1. Yüzey ölçümü — ne gösteriliyor, ne gösterilmiyor

`src/app/_components/ProductDetailPageView.tsx` (LEGAL-SEO claim'i):

| Yüzey | Gösterilen | Kaynak |
|---|---|---|
| `<h1>` başlık | **aile adı** | `family.name` |
| SEO `title` + breadcrumb | **aile adı** | `family.name` |
| "Seçili model" satırı | `model_code` ya da `sku` | `variantLabel` — **yalnız `hasMultipleVariants` iken** |
| Küçük SKU etiketi | `sku` (opacity-50, uppercase) | `selectedVariant.sku` |
| Yapışkan satın-alma çubuğu | **aile adı** | `family.name` |
| Sepet / sipariş / e-posta | **ürün adı** | `product.name` |

**Düzeltme (kendi önceki iddiama):** "detay sayfası varyantın kimliğini hiç göstermiyor" demiştim;
bu **eksik** bir tarifti. Sayfa bir kimlik gösteriyor — ama **model kodunu/SKU'yu**, hiçbir yerde
**adı** değil. Kusur "kimlik yok" değil, **iki yüzeyin iki farklı sözlük kullanması**: müşteri
sayfada aile adını okuyor, sepette ürün adını görüyor ve bunları eşleştiremiyor.

İki ek kusur:

1. **Varyant satırı koşullu.** `hasMultipleVariants` yanlışsa (tek üyeli aile) sayfada varyanta ait
   HİÇBİR kimlik kalmaz — geriye yalnız aile adı kalır. Bugün bu durumdaki tek aile
   **"Vortice Endüstriyel Çatı Fanları"**dır ve tek üyesi bir **baca fanıdır** (aşağıda B3).
   Yani koşul, tam da yanlış olduğu ailede kimliği gizliyor.
2. **Yapışkan satın-alma çubuğu aile adını yazıyor.** Bu, "Sepete Ekle" düğmesinin yanındaki
   metindir; satın-alma anında ekranda duran ad, sepete düşecek addan farklı.

### Ayırt edicilik ölçümü (hangi alan kimliği gerçekten ayırıyor?)

| Alan | Aile içinde çakışan grup | Etkilenen satır |
|---|---|---|
| `model_code` ya da `sku` | **0** | **0** |
| `name` | **21** | **74** |

Yani **ad tek başına 74 üründe ayırt edici değildir**; `model_code`/`sku` %100 ayırt edicidir.
Sonuç: doğru çözüm "adı SKU ile değiştirmek" değil, **ikisini birlikte göstermek** — ad, müşterinin
sepette göreceği metni tanımasını sağlar; kod/SKU, iki aynı adlı kalemi ayırır.

## 2. Veri bulguları — Recep karar paketi (prod yazımı YOK)

Aşağıdakiler **ölçülmüş** gözlemlerdir. Her biri için karar (düzelt / birleştir / böl / olduğu gibi
bırak) Recep'indir; ben yalnız listeyi hazır tutuyorum.

### A. Aile adı içeriğe UYMUYOR

| # | Aile | Üye | Bulgu |
|---|---|---|---|
| A1 | **AVenS Davlumbaz Fanları** | 3 | Üç üyenin **üçü de aksesuar**: `AVE-60006` ve `AVE-01801` hız anahtarı, `AVE-80141` frekans konvertörü. **Ailede tek bir davlumbaz fanı yok**; katalogda da yok. `?sku=` verilmeden girilen müşteri "davlumbaz fanı" başlığı altında bir **hız anahtarını** sepete atar. |
| A2 | **AVenS Elektrikli Kanal Isıtıcıları** | 14 | İki üye **SULU** batarya (`AVE-13050`, `AVE-13051`) — elektrikli değil, sulu ısıtıcı. Ayrıca `AvenS 1500/2000/3000/4000/5000` kalemleri (6 satır) ısıtıcı serisi değil; aile adı bunları kapsamıyor. |
| A3 | **Danfoss VLT HVAC Basic Drive FC 101** | 17 | `DAN-80101` ürünü **FC-51**'dir (VLT Micro Drive) — FC 101 serisi değil. Ayrıca `DAN-80103` adında yazım hatası: "Frenkans". |
| B3 | **Vortice Endüstriyel Çatı Fanları** | 1 | Tek üyesi `VRT-15000` **TIRACAMINO şömine ve baca fanı** — endüstriyel çatı fanı değil. Tek üyeli olduğu için sayfada varyant kimliği de görünmüyor (§1.1). |

### B. Sınıflandırma / adlandırma tutarsızlığı (daha düşük şiddet)

| # | Aile | Bulgu |
|---|---|---|
| B1 | **AVenS Plug Fanlar** | 14 üyenin tamamı **KENTALFAN** markalı; aile adı "AVenS" diyor. |
| B2 | **Vortice VORT Commercial In-Line Yuvarlak Kanal Fanları** | 7 üye **Lineo** serisi; ayrıca bağımsız bir "Vortice Lineo Quiet Kanal Fanları" ailesi var. Seri sınırı iki aileye bölünmüş. |
| B4 | **SEAT Storm Jet Asit Dayanımlı Fanlar** | Tek ailede **üç ayrı seri** (SEAT / STORM / JET) + 81 üye. §1'deki 74 çakışan-ad satırının **72'si** bu ailede. |

### C. Çift kayıt / kod çakışması

| # | Bulgu |
|---|---|
| C1 | **`AvenS 5000` iki kez**: `AVE-42500` ve `AVE-47300` — aynı ad, iki SKU, aynı aile. Ya iki farklı üründür (adlar ayrışmalı) ya da mükerrer kayıttır. |
| C2 | **FC-51 iki ailede**: `AVE-80141` (230V 0,37kW, AVenS Davlumbaz ailesinde) ve `DAN-80101` (220V 0,37kW, Danfoss FC 101 ailesinde). Aynı cihazın iki markalı kaydı olması muhtemel. |

### D. Ad çakışması tam listesi (21 grup / 74 satır)

`SEAT Storm Jet` ailesi: `JET 20` (6), `SEAT 20` (6), `SEAT 25` (6), `JET 25` (5), `SEAT 15` (5),
`SEAT 35` (5), `STORM 10` (4), `STORM 12` (4), `JET 20 ATEX` (3), `JET 25 ATEX` (3), `JET 30` (3),
`SEAT 20 ATEX` (3), `SEAT 25 ATEX` (3), `SEAT 30` (3), `SEAT 35 ATEX` (3), `SEAT 15 ATEX` (2),
`SEAT 50` (2), `STORM 10 ATEX` (2), `STORM 12 ATEX` (2), `STORM 14` (2).
`AVenS Elektrikli Kanal Isıtıcıları` ailesi: `AvenS 5000` (2).

## 3. İki katman — ne düzeltilirse ne biter

| Katman | Kusur | Düzeltirse ne biter | Sahip |
|---|---|---|---|
| **Veri** | A1–A3, B, C | O ailelerdeki yanlış eşleşme | **Recep** (prod yazımı) |
| **Yüzey** | §1 | 374 üründe birden sözlük tutarsızlığı | PDP = LEGAL claim'i (dar diff, koordinasyon bende) |
| **Kapı** | sınıfın geri gelmesi | Yeni ithalatta aynı kusurun tekrarı | PRICING (bu iş) |

Veriyi tek başına düzeltmek **yetmez**: yüzey kuralı yazılmazsa bir sonraki ithalatta aynı müşteri
deneyimi geri gelir. Yüzeyi tek başına düzeltmek de yetmez: A1'de müşteri doğru adı görür ama yine
**yanlış ailenin** altındadır.

## 4. Kapı tasarımı — ne CI'da ölçülebilir, ne ölçülemez

Dürüst ayrım (mekanizma ilanı kuralı, OPS-AUDIT 2026-08-18):

- **Ölçülemez:** "aile adı içeriğine semantik olarak uyuyor mu" — bu bir yargıdır, statik tarama
  ya da SQL bunu karara bağlayamaz. Kapı diye yazılırsa **sahte yeşil** üretir.
- **Ölçülebilir (SQL, kesin):**
  1. aile içinde **çakışan ürün adı** (bugün 21 grup / 74 satır);
  2. **ailesiz ürün** (bugün 0);
  3. aile üyelerinin **marka birliği** (B1'i yakalar);
  4. `model_code`/`sku` ayırt ediciliği (bugün %100 — **koruma altına alınmalı**, çünkü yüzey buna dayanıyor).
- **Ölçülebilir (statik, repo):** satın-alma yüzeyinin ürün **adını** render ettiği — §5'teki kural.

Bugünkü ihlaller (74 satır) veri düzeltmesi Recep'e bağlı olduğu için kapı **cırcır (ratchet)**
olarak kurulur: bilinen ihlaller adıyla ve gerekçesiyle bir taban dosyasına yazılır, kapı **tabanın
dışındaki her yeni ihlalde kırmızı** olur, taban yalnız **küçülebilir**. Böylece sınıf bugünden
itibaren geri gelemez; mevcut borç ise gizlenmez, sayılır. (Uyar-geç YOK — bkz. memory
`no-grace-mode-for-new-gates`.)

**Açık nokta (ölçülmedi):** SQL kapısının koşacağı yer. `.github/workflows/db-advisor.yml` her
push'ta prod DB'ye bağlanıyor ve uygun bir ev gibi duruyor, ama `.github/workflows/**` **EDGE
şeridinin claim'i**. Dosya sahipliği EDGE ile konuşulmadan bu kapı yazılmaz.

## 5. Önerilen yüzey kuralı (cetvel maddesi taslağı)

> **Satın-alınan kimlik kuralı.** Bir ürünün sepete eklenebildiği her yüzeyde, sepete/siparişe/
> e-postaya gidecek **ürün adı** (`product.name`) görünür olmalıdır; ayrıca aile içinde **ayırt edici**
> bir kod (`model_code` ya da `sku`) gösterilir. Aile adı bağlam olarak kalabilir ama **kimliğin
> yerine geçemez**. Varyant kimliğinin gösterimi **koşullu olamaz** (tek üyeli ailede de görünür).

Bu kural I18N'in T098'i (ad-gösterim SSOT) ile aynı yöne bakar: T098 adı **tek kaynaktan** üretir,
bu kural onun **nerede görünmek zorunda olduğunu** söyler.

## 6. İlişki

`docs/standards/catalog-ingestion-standard.md` (§6 kapılar) · `category-taxonomy-standard.md` ·
T098 (I18N — ad-gösterim SSOT) · memory `catalog-ingestion-system`, `documents-are-the-decision`.

---

## EK — 2026-08-19: KÖK SEBEP KAYNAKTAN OKUNDU, KAPSAM BÜYÜDÜ

> Bu ek, Recep'in "bu aile adları uydurma mı, CSV'de mi var" sorusu üzerine yapılan
> **kaynak-belge ölçümünün** sonucudur. Aşağıdaki her satır ya AVenS 2026 fiyat kataloğunun
> sayfa görüntüsünden ya da prod DB'den okunmuştur; çıkarım olan yerler ayrıca işaretlidir.

**Kaynak:** `venthub-pdf-ingestor/venthub/ticaret/avensair-fiyat-listesi-2026/`
· PDF: `01-input/avens_fiyat_listesi_2026_HQ.pdf` · Sayfa görüntüleri: `02-work/pages/page_1..74.png`
· Çıkarılan veri: `03-output/avensair-fiyat.csv` (`model_code;model_name;price_eur;avensair_section;page_num`)

### 1. Aile adı UYDURMA DEĞİL — kataloğun BÖLÜM başlığından miras

Aile adı `avensair_section` kolonundan geliyor; o kolon kataloğun bölüm başlığı.
**Kusur:** kataloğun İKİ katmanı var, biz üst katmanı aile sanmışız.

```
36  Davlumbaz Fanlar          ← BÖLÜM  = kategori
    - VORT QBK SAL KC EVO     ← ALT SATIR = ürün hattı = AİLE
46  Plug Fanlar
    - ENKELFAN · KENTALFAN    ← İKİ ayrı hat
41  Santrifüj Fanlar
    - SEAT · STORM · JET · SEAT ATEX · STORM ATEX · JET ATEX · NIMUS · NIMAX  ← SEKİZ hat
```

**Ayırt edici:** bölümde **tek** hat varsa aile KAZARA doğru çıkmış (Nicotra ADH/RDH/AT,
Vortice QBK). Hata yalnız bölüm **çok hatlıyken** görünüyor. Bu yüzden bugüne kadar fark edilmedi.

### 2. Marka alanı üreticiyi değil DAĞITICIYI gösteriyor

Sayfa 50: başlık `KENTALFAN - IEC MOTORLU PLUG FAN`, açıklama "**OEM fan**", sayfada **Casals**
logosu. Yani üretici Casals, AVenS TR distribütörü. DB'de `brand = AVenS`.
→ **B1 maddesi DÜZELTİLDİ:** "14 üyenin tamamı Kentalfan markalı" ifadesi YANLIŞTI; marka alanı
hem CSV'de hem DB'de `AVenS`. Doğru bulgu: **ürün ADI bir markayı, marka ALANI başkasını söylüyor.**

### 3. "AVenS Davlumbaz Fanları" HAYALET AİLE

Sayfa 36 = `DAVLUMBAZ FANLAR`: üstte fanlar (`VORT QBK SAL KC EVO`, Vortice), altta **paylaşılan
aksesuar tablosu** (hız anahtarları + frekans konvertörleri). Hat doğru şekilde
`Vortice VORT QBK SAL KC Evo` ailesine gitmiş (**21 ürün, DB'de duruyor**); aksesuarlar AVenS
altında kalıp bölüm adını aile adı yapmış.
Aynı hız anahtarları (`60006`, `01801`) **sayfa 27'de de** var → **ortak aksesuar**, hiçbir
ailenin üyesi değil.

### 4. ASIL BULGU — katalogun dörtte biri İÇE AKTARILMAMIŞ

| | Adet |
|---|---|
| Çıkarılan CSV'deki benzersiz kod | **484** |
| prod DB'deki benzersiz kod | **374** |
| **Katalogda var, DB'de YOK** | **136** |
| DB'de var, fiyat listesinde yok | 26 — **hata DEĞİL**, Vortice üretici kataloglarından (5/5 örnek doğrulandı) |

En ağır bölümler: Nordik HVLS 21 · Mini Aksiyel (Ghost/Notus) 16 · Yatay Atışlı Çatı 11 ·
Nicotra RDH 10 · Mini Aksiyel 10 · Nicotra ADH 8 · Gold 8 · Dikey Atışlı Çatı 7 · Çift Yönlü Aksiyel 7.

### 5. ⚠ 484 GERÇEK DEĞİL, TABAN — çıkarma KUSURLU

Recep'in gönderdiği sayfa görüntüsüyle sınandı: `SULU BATARYALAR` tablosunda sayfada **8 satır**
(13050–13057), CSV'de yalnız **2** (13050, 13051). **6 satır kayıp.**
→ Gerçek katalog ≥484; **136 eksik bir ALT SINIRDIR.**
→ İş emri "eksikleri aktar" ile sınırlı olamaz; **çıkarmanın yeniden doğrulanması** şart.

### 6. Sonuç

T099 "dokuz ailede ad uyuşmuyor" diye açılmıştı. Ölçülen gerçek: **taksonomi yanlış + kataloğun
≥%28'i hiç içe aktarılmamış + çıkarma kusurlu.** Aile adlarını düzeltmek vitrini doğru gösterir
ama satılacak ürünün dörtte biri sitede yoktur.

**Önerilen sıra** (§9 tablosuyla güncellendi — dört katman): (1) çıkarmayı doğrula/yenile → (2) eksik kodları içe aktar (en yüksek ticari
etki) → (3) aileleri kataloğun ALT satırlarına göre böl, ortak aksesuarları aileden çıkar →
(4) kuralı cetvele yaz: *aile = katalog alt satırı; kategori = bölüm başlığı; aile adı bölüm
başlığından TÜRETİLEMEZ.*
### 7. ÜÇÜNCÜ SINIF — ZORUNLU TAMAMLAYICI ("ürün eşleşmesi") MODELLENMEMİŞ

Recep'in gönderdiği sayfalarla ölçüldü. Bazı ürünler **tek başına kullanılamaz**; katalog bu
ilişkiyi açıkça kodluyor ama veri modelimizde böyle bir kavram YOK.

| Ana ürün | Katalogda ne diyor | Zorunlu tamamlayıcı | CSV | DB |
|---|---|---|---|---|
| `VORT QUADRO EVO` (QE, 24 kod `11521–11547`) | **"Lütfen kasa seçiniz…"** · *"İki modül olarak satılır"* | kasa `11560–11569` | **1/10** | **0/10** |
| `VARIO` / `VARIO I` | *"Çift yönlü çalışma CR5N Hız Anahtarı ile sağlanmaktadır"* | `12941` CR5N | var | **yok** |
| `VORT QUADRO` / `QUADRO I` | HIZ ANAHTARI kolonu `C 1,5` | `12966` | var | **yok** |
| `PUNTO` | *"Fan ile birlikte kullanılır"* | cam kiti `22131–22133` | var | **yok** |
| `AVenS BVU` | *"BVU üniteleri ile birlikte kullanılır"* | `30110/30111` BVU-LS | var | var ✔ |

**Ticari sonuç:** QE ailesinin 24 ürünü sitede satılabilir görünüyor ama **kasasız çalışmaz** ve
kasa katalogda hiç yok. Müşteri eksik ürün alır.

**Ayrıca ikinci bir çıkarma kaybı kanıtı:** kasa satırlarının 9'u CSV'ye HİÇ girmemiş
(`11560–11568`), yalnız `11569` var. §5'teki SULU BATARYA kaybıyla aynı sınıf → çıkarma
doğrulaması T119'un ilk adımı olmalı.

**Model önerisi (T119 kapsamına):** ürünler arası `zorunlu-tamamlayıcı` ve `uyumlu-aksesuar`
ilişkisi. Katalog kaynağı hazır: "HIZ ANAHTARI" kolonu, "UYGUN MODEL" kolonu, "Lütfen kasa
seçiniz" blokları. Bu ilişki kurulmadan aile düzeltmesi tek başına müşteriyi doğru ürüne
götürmez.
### 8. DOĞRULAMA ARAÇLARI ve OTORİTE SIRASI

Recep bildirdi (2026-08-19): **NotebookLM defteri `Vortice | 07 - TR Distribütör (Avensair)` —
tüm kataloglar yüklü**, katalog/ürün sorularında sorgulanabilir.

**T119'da otorite sırası (çelişkide üstteki kazanır):**

| # | Kaynak | Not |
|---|---|---|
| 1 | **Sayfa görüntüsü** `…/avensair-fiyat-listesi-2026/02-work/pages/page_1..74.png` | 74 sayfanın **tamamı yerelde**; elle gönderilmesine gerek yok |
| 2 | **prod DB** | gerçek durum |
| 3 | **NLM defteri** (yukarıdaki) | hızlı çapraz-kontrol, hipotez üretimi |
| — | `03-output/avensair-fiyat.csv` | **OTORİTE DEĞİL** — kusurlu olduğu §5'te iki bağımsız örnekle ölçüldü |

Defter bir snapshot'tır ve drift edebilir; **çelişkide kaynak belge ve DB kazanır.**

### 9. T119 KAPSAMI — DÖRT KATMAN, AYRI AYRI FİYATLANDIRILIR

OPS-AUDIT 2026-08-19 13:05Z kararıyla üçüncü sınıf (§7) kabul edildi ve T119 kapsamı dört
katmana çıktı. §6'daki "önerilen sıra" §7'den ÖNCE yazılmıştı, dolayısıyla eksikti; bağlayıcı
kapsam aşağıdaki tablodur.

| # | Katman | Girdi (otorite) | Çıktı | Prod yazımı? | Kapı |
|---|---|---|---|---|---|
| **K1** | Çıkarma doğrulama | 74 sayfa görüntüsü (§8 sıra 1) | doğrulanmış kod listesi + kayıp raporu | **hayır** — salt okuma | ölçüm raporu; iki bilinen kayıp (§5, §7) yeniden üretilebilmeli |
| **K2** | Eksik kod aktarımı | K1 çıktısı | ≥136 ürün prod'a | **EVET** | **Recep kapısı** — karar paketi + geri alma planı |
| **K3** | Aile/bölüm düzeltmesi | katalog alt satırları | aile bölünmesi + ortak aksesuarların aileden çıkarılması + yüzey kuralı cetvele | **EVET** | **Recep kapısı**; cetvel maddesi (§132) + INV testi |
| **K4** | Zorunlu tamamlayıcı ilişkisi | §7 tablosu, "HIZ ANAHTARI"/"UYGUN MODEL" kolonları | ürün-ürün ilişki modeli + sepet/PDP davranışı | **EVET**, şema dahil | **Recep kapısı** — migration çıkarsa merge de onda |

**Bağımlılık zinciri:** K1 → K2 → K3; **K4 K3'e paralel yürüyebilir** ama K2'nin eksik kodları
(kasalar `11560–11568`) gelmeden K4 doğrulanamaz — tamamlayıcının kendisi veritabanında yok.

**Neden ayrı fiyatlandırma:** K1 ölçüm işidir ve tek başına değer üretir (kayıp tablosu Recep'in
kararına girdi). K2 en yüksek ticari etkiye sahip ama en riskli (toplu prod yazımı). K3 yüzeyi
düzeltir, satılabilirliği değiştirmez. K4 şemaya dokunur, en uzun kuyruk. Tek iş emri gibi
fiyatlanırsa en riskli katman en hızlı katmanın arkasına saklanır.

**K4 için not:** ilişki modeli `product_families` şemasına dokunabilir; migration doğarsa
`CLAUDE.md` madde 13 gereği PR'ı yalnız Recep merge eder.

### 10. K1 İLK ÖLÇÜM — çıkarma kaybı SİSTEMİK DEĞİL, YEREL (2026-08-19, prod yazımı YOK)

Dondurma penceresinde K1'in ölçüm kısmı koşuldu. **Sonuç §5'i daraltıyor ve K1'i ucuzlatıyor.**

**(a) Kaynak dosya sayısı üç, kod kümesi TEK.** `avensair-fiyat.csv` (484),
`avens_fiyat_listesi_2026_HQ.csv` (484, ek spec kolonları), `avensair_ekstra_urunler_2026.csv`
(204). Kesişim ölçüldü: **HQ − fiyat = 0**, **ekstra − fiyat = 0** (ekstra bir alt kümedir).
→ *İçe aktarılmayı bekleyen gizli bir çıkarma yok.* Bu hipotez KAPANDI.

**(b) Sayfa 20 tam doğrulandı: kayıp SIFIR.** Görüntüdeki 23 satır ↔ CSV'deki 23 satır, kod kod
birebir. → **Çıkarma her yerde kusurlu değil.** §5'in "çıkarma kusurlu" hükmü doğru ama
*genellenemez*; kayıp belirli tablolarda.

**(c) Kod-aralığı boşluk tahmini GEÇERSİZ — kendi aracımı çürüttüm.** "Ardışık kodlar arasındaki
delikler kayıptır" varsayımıyla önce 507, sıkı ölçütle 50 aday çıktı. Sayfa 20 görüntüsü bunu
çürüttü: QE tablosunda `11529/11530/11539/11540` **hiç yok** — kodlar yoğun sayaç değil,
**varyant ızgarasına** göre atanıyor. En yüksek skorlu adaylar yanlış pozitif çıktı.
→ Bu sayı **kullanılmayacak**; iş emrine yazılsaydı K2'yi olmayan 50 ürünü aramaya gönderirdi.

**(d) İşleyen dedektör: sayfa başına satır sayısı.** Bilinen kayıpları pozitif üretiyor —
**sayfa 21 (QE kasa tablosu) CSV'de yalnız 1 satır** (`11569`), yani §7'deki 9 kayıp satır tam
buradan. Ayrıca **22 sayfada hiç CSV satırı yok** (1–7 kapak/içindekiler beklenen; **37, 39, 46,
47, 48, 57, 60, 61, 63, 65, 70–74** incelenmeli) ve 4 sayfa 1–3 satırla şüpheli (15, 21, 29, 49).
→ **K1'in gerçek işi bu ~19 sayfayı görüntüden doğrulamak**, 74 sayfayı yeniden çıkarmak değil.

**(e) YENİ SINIF — bozuk satır: ad kaybolmuş, fiyat saçma.** 5 satır: `13850`, `16100`, `18600`
(ad `**`, fiyat 2,77 € / 53 €, PLUG FANLAR s.49), `21197` (ad `WP`, s.62), `60079` (ad `II`,
fiyat 2,00 €, s.38). Prod'da **hiçbiri yok** (sorgulandı, 0 satır) → tehlike **canlı değil,
gizil**. Ama K2 "eksik 136 kodu aktar" diye toplu koşarsa bu 5 satır **2,77 €'luk ürün** olarak
vitrine düşer.
→ **K2 için bağlayıcı kısıt:** aktarım öncesi doğrulama kapısı (ad boş/yıldız olamaz, fiyat alt
sınırı, kod biçimi) — kapı olmadan aktarım YOK.

**K1'in yeniden fiyatlandırması:** "çıkarmayı baştan doğrula" (74 sayfa) → **"19 şüpheli sayfayı
görüntüden doğrula + bozuk satır kapısını yaz"**. §9 K1 satırı bu kapsamla okunmalıdır.

### 11. K1 SAYFA DOĞRULAMASI — YENİ VE EN BÜYÜK SINIF: ALFANÜMERİK KOD AİLESİ TAMAMEN DÜŞMÜŞ

§10(d)'deki 15 sıfır-satırlı sayfanın **tamamı** görüntüden açıldı (2026-08-19). Sonuç ikiye ayrıldı.

**Beklenen boşluk (12 sayfa) — tablo yok, kayıp yok:** 1–7 kapak/içindekiler · 37 (VORT QUADRO
EVO tanıtım) · 46 (LINEO QUIET tanıtım) · 57 (AVenS aksiyel/jet fanlar — fiyat yok, *"projelendirme
için iletişime geçiniz"*) · 60, 61 (bölüm ayracı) · 63, 65 (NORDIK / Casals tanıtım) · 70, 73
(tanıtım) · 71, 72 (NOTLAR) · 74 (arka kapak).

**GERÇEK KAYIP (3 sayfa, 39 ürün) — tam fiyat tablosu, CSV'de HİÇBİRİ YOK:**

| Sayfa | Bölüm / hat | Satır | Kod biçimi | Fiyat aralığı |
|---|---|---|---|---|
| 39 | EXPROOF FANLAR — **CMS ATEX SANTRİFÜJ** | 11 | `253080106XN` … | 764 – 5.874 € |
| 47 | SANTRİFÜJ FANLAR — **NIMUS** (Casals) | 14 | `NS311280` … | 1.740 – 12.681 € |
| 48 | SANTRİFÜJ FANLAR — **NIMAX** (Casals) | 14 | `NX313290` … | 1.786 – 14.173 € |

**Ortak imza — ve kök sebep bu:** üç tablonun da kodu **harf içeriyor.** Ölçüldü:

- `avensair-fiyat.csv`'deki **484 kodun 484'ü tamamen sayısal**; harf içeren tek kod yok.
- prod `products` tablosunda **harf içeren `model_code` sayısı 0** (374 üründe).
- `NIMUS` / `NIMAX` / `CMS ATEX` adlı ürün prod'da **0**.

→ Kayıp rastgele değil: **çıkarma yalnızca sayısal kodları kabul etmiş**, alfanümerik kodlu her
satırı sessizce atmış. Bu, §5 ve §7'deki satır-kayıplarından **farklı ve daha büyük bir sınıf**:
orada tablonun kuyruğu düşmüştü, burada **tablonun tamamı** düşüyor.

**Ticari ağırlık:** bu 39 ürün kataloğun **en pahalı kalemleri** (14.173 €'ya kadar) ve tamamı
endüstriyel/ATEX hattı — yani bayi satışının merkezi. Şu an sitede satılamıyorlar ve
"eksik 136 kod" listesinde de **görünmüyorlar**, çünkü o liste CSV↔DB farkından çıkarılmıştı ve
bu 39 kod **CSV'ye hiç girmemiş**.

> **484 + 39 = 523'ten büyük.** Gerçek katalog boyutu hâlâ bilinmiyor; §5'in "≥484" alt sınırı
> yükseldi ama kapanmadı.

**K1'e eklenen zorunlu adım:** çıkarma betiğinin kod biçimi filtresi bulunacak ve alfanümerik
kodlar kabul edilecek; ardından **yalnız 3 sayfa değil, tüm katalog** yeniden çıkarılacak —
çünkü filtre satır bazlı çalıştığından karışık tablolarda da satır düşürmüş olabilir.
