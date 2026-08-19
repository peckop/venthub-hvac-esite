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
