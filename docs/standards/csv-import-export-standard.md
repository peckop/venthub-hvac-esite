# VentHub Kanonik CSV İçe/Dışa-Alım Format Standardı (Cetvel) — v1.1

> **SSOT (Single Source of Truth).** Bu belge, VentHub'a içe-alınan / VentHub'dan dışa-alınan ürün
> CSV'sinin **TEK format kontratıdır**: kolonlar, kodlama, slug kuralı, kalite kapısı. Admin panel toplu
> yükleyici **ve** katalog ithalat hattı (Kademe 1 → Kademe 2) **her ikisi de** bunu izler.
>
> **Kapsam ayrımı (mükerrerlik önleme):**
> - *Nasıl çıkarılır* — kaynak (Vortice/Avensair), NotebookLM hakem, 27-bölüm kategori haritası, 2-kademe →
>   **`catalog-ingestion-standard.md`** (YÖNTEM cetveli).
> - *Satış fiyatı nasıl hesaplanır* — € alış → çok-para-birimi/KDV/kâr → **`pricing-standard.md`**.
> - *Kategori iskeleti / slug dili* — **`category-taxonomy-standard.md`**.
> - **Bu dosya yalnız CSV'nin BİÇİMİ.** Yöntem/fiyat/taksonomi kuralı buraya kopyalanmaz; ilgili cetvele link verilir.
>
> v1.1 · 2026-06-20 — venthub-hvac/docs/standards'a **SSOT** olarak taşındı (önce ingestor'da v1.0 idi);
> DB-JSONB ↔ flat-CSV ilişkisi (§0) + slug kuralı (§3) netleştirildi.

---

## 0. Çekirdek ilke — flat CSV (insan denetimi) ↔ JSONB (depolama)

Kafa karışıklığını kökten kesmek için: **iki ayrı katman vardır, ikisi de doğru.**

- **Veritabanı (Supabase):** teknik özellikler **`technical_specs` JSONB** kolonunda tek JSON olarak durur. **DEĞİŞMEZ.**
- **CSV (bu standart):** aynı özellikler **düzleştirilmiş `spec_` kolonları** halinde yazılır — insan Excel'de
  açıp **okuyup denetlesin** diye (ne var / ne eksik / slug doğru mu bir bakışta görünür).
- **Köprü = loader (Kademe 2):** CSV'yi okurken `spec_*` kolonlarını **JSON'a katlar** ve `technical_specs`'e
  yazar. Dışa-alımda tersi: JSON'u flat kolonlara açar.

```
LLM çıkarır → flat CSV  →  [ İNSAN DENETİMİ ]  →  loader flat→JSON katlar → Supabase technical_specs (JSONB)
```

> **Neden flat, JSON-blob değil?** İçe-alım formatı **insan denetimi** içindir; tek hücreye tıkışmış JSON
> okunmaz/denetlenemez (sıralanamaz, eksik değer görünmez). Sektör deseni de budur — Shopify / WooCommerce
> ürün içe-alım CSV'leri tümüyle flat kolondur. JSON yalnız **DB'nin iç temsilidir**, kullanıcının gördüğü
> katman değil. *(Eski "CSV'de tek `specs_json` kolonu" önerisi bu yüzden **emekli** — DB'deki JSON değil,
> CSV'deki blob-kolon fikri emekli.)*

---

## 1. Dosya Biçimi Standartları
* **Encoding (Kodlama):** UTF-8 with BOM (`utf-8-sig`) olmak zorundadır. Bu kodlama, MS Excel'in dosyayı doğrudan açtığında Türkçe karakterleri (ş, ı, ç, ğ, ö, ü) bozmadan gösterebilmesini sağlar.
* **Ayraç (Delimiter):** Noktalı virgül (`;`) karakteridir. Türkçe Windows/Excel yerel ayarlarında ondalık ayırıcı olarak virgül (`,`) kullanıldığından, Excel'in dosyayı doğrudan çift tıklatarak sütunlar halinde açabilmesi için bu ayraç standartlaştırılmıştır.
* **Metin Kaçışları (Escaping):** İçerisinde noktalı virgül veya çift tırnak barındıran metin alanları çift tırnak (`"`) içine alınmalıdır. Metin içindeki çift tırnaklar iki adet çift tırnakla (`""`) kaçırılmalıdır.
* **Satır = ürün:** Tek satır = tek ürün (renk/varyant ayrı satır). Başlık satırı zorunlu.

### 1.1 Formül enjeksiyonu nötrleme (VULN-006, 2026-09-29) — YÖNETİCİ DIŞA AKTARIMLARI

Tablolama yazılımı (Excel, Sheets, LibreOffice) `= + - @ TAB CR` ile başlayan hücreyi **formül** sayar. Müşterinin kayıtta yazdığı ad, istemciden gelen hata mesajı, dış sistemin olay tipi gibi **saldırganın kontrol edebildiği** her alan, yönetici CSV'yi açtığında çalışabilir (veri sızdırma, yönlendirme). Bu bölüm dışa aktarımın kuralıdır; içe alım (§2+) değişmez.

* **Tek kapı:** yönetici CSV/XLS üreten HER yer belgeyi `src/lib/csv/belge.ts` (`csvBelgesi`, `xlsBelgesi`, `tabloIndir`) ile üretir; hücre kararı `src/lib/csv/hucre.ts`'tedir (`csvHucre` / `notrMetin`; ADM-6'da `src/utils/csvHucre.ts`'ten taşındı). Yerel `escape()`, satır içi `.replace(/"/g, '""')`, elle `new Blob(..., { type: 'text/csv' | 'application/vnd.ms-excel' })` ve şablonda ham `<td>${…}` yasaktır (kapı: `INV-ADMIN-CSV-1`, taban sıfır).
* **XLS (HTML tablo):** hücre önce formül nötrlemesinden, sonra HTML kaçışından (`& < > "`) geçer; başlık da aynı kapıdan geçer. Excel HTML'i yorumlar: kaçışsız müşteri adı (`<img src=…>`) dosyayı açan makinede dış istek atar.
* **Nötrleme:** hücre metninin NFKC normalize edilmiş **ilk karakteri** `= + - @ TAB CR` ise metnin başına tek tırnak (`'`) konur. Tam genişlikli `＝ ＋ － ＠` da yakalanır. Normalize edilmiş hâl çıktıya YAZILMAZ; yalnız karar içindir.
* **Sayı/tarih DEĞİŞMEZ:** `number` tipi olduğu gibi yazılır; yalnız işaret+rakam+ayraçtan oluşan metin (`-12,50`, `+905551112233`) formül olamayacağı için önek almaz. Bedel (kabul edilen): sayı gibi görünmeyen metin ilk karakter formül karakteriyse Excel'de görünür `'` önekiyle açılır.
* **Çıkışta yapılır, girişte bozulmaz:** veritabanındaki ham değer değiştirilmez; nötrleme yalnız CSV çıktısındadır.
* **Her hücre çift tırnaklıdır** (mevcut dışa aktarımlarla bayt uyumu); ayraç (`,` / `;`) çağıranın seçimidir.

### 1.2 Yönetici İÇE AKTARMA güvenliği (ADM-6, 2026-11-03)

Yönetici panelindeki CSV içe aktarıcıları (ürün, stok) dosyayı **tek kapıdan** okur: `src/lib/csv/dosyaKapisi.ts` → `csvDosyasiOku(file)`. Kapı: `INV-ADMIN-CSV-1` kural D (`accept=".csv"` taşıyan yüzey `csvDosyasiOku` çağırmak zorunda; eski satır-bölme ifadesi yasak). Ölçüm ve gerekçe: `docs/audits/adm6-csv-yuzey-2026-11.md`.

* **Dosya, okunmadan önce:** uzantı `.csv` (büyük/küçük harf farketmez); tarayıcının bildirdiği tür boş, `text/csv`, `text/plain`, `text/x-csv`, `application/csv` ya da `application/vnd.ms-excel` olmalı; boyut 0 < bayt ≤ **5 MB** (`CSV_MAKS_BAYT`). `accept` özniteliği yalnız ipucudur, denetim sayılmaz.
* **Ayrıştırma:** `csvAyristir` (RFC 4180 temel kuralları: tırnak içi ayraç/satır sonu, `""` kaçışı, BOM, CRLF). Veri satırı üst sınırı **5.000** (`CSV_MAKS_SATIR`); aşan dosyanın TAMAMI reddedilir (kısmi okuma yok). Kapanmamış tırnak ve tekrarlı başlık reddedilir. Başlıklar kırpılır, küçük harfe indirilir.
  * **Tırnak yalnız hücre başında açılır** (ADM-7): tırnaksız hücrenin ortasındaki `"` metindir (`Fan 5" çap`); eskiden tırnak modunu açıp sonraki satırları tek kayda birleştiriyordu.
  * **Boş başlık** (Excel'in sona eklediği `sku,name,,`) tekrar denetimine girmez ve o sütun okunmaz (ADM-7). Dolu başlığın tekrarı yine reddedilir.
  * **Dışa → içe döngüsü kayıpsızdır** (ADM-7): her veri hücresi `notrlemeyiGeriAl`'dan (`hucre.ts`) geçer; §1.1'in koyduğu `'` öneki yalnız nötrlemenin koyacağı yerde düşer (`'- Fan` → `- Fan`; elle yazılmış `'abc` korunur). Her metin için `notrlemeyiGeriAl(notrMetin(x)) === x`. Bunun için `notrMetin` ardı formül olan baştaki `'`'a da önek koyar (`'=x` → `''=x`); bu yalnız önek ekler, formül kararını gevşetmez. Koruma çıkıştadır: veritabanına ham değer yazılır, yeniden dışa aktarımda önek yine konur.
* **Şema (zod, `src/lib/csv/semalar.ts`):** SKU `^[A-Z0-9-]+$` (DB kısıtı `products_sku_format_check` ile aynı), en çok 64; `name` 1-300; `status` ∈ {active, draft, archived}; adet alanları 0 ≤ tam sayı ≤ 1.000.000, desen `^\d+$` (ürün ve stok içe aktarımı aynı deseni kullanır; `0x10`, `1e3`, `5.0` reddedilir — ADM-7). Boş hücre "verilmemiş" sayılır. Ürün içe aktarımında geçersiz satır varsa **hiçbir satır yazılmaz** (kategori reddiyle aynı ilke); stok içe aktarımında geçersiz satır önizlemeye girmez ve satır numarasıyla bildirilir — sessiz kırpma (negatif → 0, ondalık → tam sayı) yasaktır. Stok dosyasında aynı SKU birden çok satırda geçerse **hiçbiri uygulanmaz**, her satır `duplicateSku` hatasıyla bildirilir (ADM-7; eskiden fark iki kez uygulanıyordu).
* **Tenant kapsamı (CLAUDE.md kural 12):** `category_id` yalnız çağıranın kendi tenant'ından okunmuş kategori listesindeyse yazılır. Ön ölçümde kendi tenant'ında bulunan SKU'lar `upsert`, bulunmayanlar `insert` ile yazılır (çakışma başka tenant'ın satırını güncellemez, hata olur). SKU listesiyle okuma 200'lük parçalarla yapılır.
* **Yetki:** istemci kapısı güvenlik sınırı DEĞİLDİR; yazma kararı veritabanındadır (RLS yazım politikaları, `adjust_stock` rol denetimi). Bu kurallar kaza ve hatalı dosyaya karşıdır.
* **Hata metni** sözlükten gelir: `admin.dataTable.csvImport.*` (dosya kapısı), `admin.products.import.invalidRows*`, `admin.inventory.import.errors.*`.

---

## 2. CSV Kolon Yapısı (Düzleştirilmiş Mimari)

Veritabanında JSONB tutulan teknik özellikler, CSV düzeyinde okunabilirliği artırmak amacıyla **düzleştirilmiş (flat) kolonlar** halinde yazılır. Kolonlar iki ana gruba ayrılır:

### A. Genel Ticari ve Tanımlayıcı Kolonlar
* **`model_code`** (text, **zorunlu**): Üretici model kodu (Örn: `11313`) = Vortice cod. = Avensair KOD. **Köprü alanı.** Boş bırakılamaz.
* **`name`** (text): Ürünün Türkçe arayüz adı (Örn: `Vortice Punto Evo Flexo MEX 100/4" LL 1S Duvar Eksenli Fan`).
* **`brand`** (text): Marka (Örn: `Vortice`, `Danfoss`, `Nicotra Gebhardt`, `AVenS`).
* **`avensair_kod`** (text): Avensair bayi ürün satış kodu.
* **`avensair_section`** (text): Avensair fiyat listesindeki bölüm no+adı (Örn: `08 Mini Aksiyel`). *(Loader'ın stabil kategori anahtarı — bkz §3.)*
* **`category_slug`** (text): Üst kategori URL slug'ı (Örn: `residential-ventilation`). **Canlı DB slug'ı — bkz §3.**
* **`subcategory_slug`** (text): Alt kategori URL slug'ı (Örn: `banyo-ve-tuvalet-fanlari`). **Canlı DB slug'ı — bkz §3.**
* **`purchase_price_eur`** (numeric): Euro cinsinden net **alış** fiyatı (KDV hariç). **TL gömme YOK** — satış fiyatını `pricing-standard.md` motoru hesaplar.
* **`currency`** (text): Para birimi. Daima `EUR`.
* **`description_tr`** (text): Türkçe açıklama metni.
* **`description_en`** (text): İngilizce açıklama metni (deyimsel).
* **`image_url`** (text): Ürün resmi dosya yolu (Örn: `markalar/vortice/konut-fanlari/03-output/images/11313.png`).
* **`src_vortice`** (text): Atıfta bulunulan Vortice katalog sayfası.
* **`src_avensair`** (text): Atıfta bulunulan Avensair fiyat listesi sayfası.
* **`confidence`** (enum): Veri güvenirlik derecesi (`ok`, `conflict`, `missing`). `ok` dışı = **insana işaretli.**

### B. Teknik Özellik Kolonları (`spec_` Önekiyle)
Her teknik özellik kolonu, içe-alım mekanizması tarafından otomatik tanınabilmesi için **`spec_`** önekiyle adlandırılır. Loader, `spec_` ön-ekli tüm kolonları toplayıp `technical_specs` JSONB'ına katlar. Önemli kolonlar:
* **`spec_voltage_v`** (integer): Çalışma voltajı (V).
* **`spec_frequency_hz`** (integer): Frekans (Hz). Varsayılan `50`.
* **`spec_max_absorbed_power_w`** (numeric): Maksimum çekilen güç (W).
* **`spec_absorbed_current_a`** (numeric): Maksimum çekilen akım (A).
* **`spec_max_delivery_m3h`** (numeric): Maksimum debi (m³/h).
* **`spec_max_delivery_ls`** (numeric): Maksimum debi (L/s).
* **`spec_max_static_pressure_pa`** (numeric): Maksimum statik basınç (Pa).
* **`spec_noise_level_db_a`** (numeric): Ses seviyesi dB(A).
* **`spec_rpm_max`** (numeric): Maksimum motor devri.
* **`spec_diameter_mm`** (numeric): Bağlantı çapı (mm).
* **`spec_has_timer`** (boolean): Zaman rölesi var mı? (`TRUE` / `FALSE`).
* **`spec_has_humidistat`** (boolean): Nem sensörü var mı? (`TRUE` / `FALSE`).

> **Kolon kümesi kategoriye göre değişir.** Bir katalog-CSV'si (ör. `vortice-konut.csv`) yalnız o kategorinin
> spec'lerini taşır. Birleşik master (`_birlesik/`) tüm kategorilerin **birleşimini** taşır → bazı hücreler
> boş/NULL olur, bu **normaldir** (seyrek matris). Yeni spec gerektiğinde yeni `spec_` kolonu eklenir; şema kapalı değil.

---

## 3. Slug Kuralı (ithalat eşleşmesi ↔ taksonomi temizliği AYRI)

- **CSV slug = canlı DB slug'ı, BİREBİR.** `category_slug` / `subcategory_slug`, loader'ın `categories`
  tablosunda **eşleştireceği gerçek slug'lardır.** **İcat etme, dil değiştirme, tahmin etme** — DB'de ne ise
  o. (Bugünkü gerçek: üst kategoriler İngilizce; bazı alt kategoriler Türkçe seed edilmiş — ör. `banyo-ve-tuvalet-fanlari`.)
- **Eşleşmenin stabil anahtarı `avensair_section`'dır.** Loader, `avensair_section` → DB slug eşlemesini
  **canlı DB'ye karşı** uygular (kazınan slug'a değil); böylece Avens-sitesi ile VentHub arasındaki dil/ad
  farkları tek yerde (loader) çözülür. Eşleme tablosunun SSOT'u = canlı DB + `catalog-ingestion-standard.md §4`.
- **Slug ≠ görünen isim.** Türkçe gösterim `translation_key` / `metadata.tr`'den gelir (Aksiyom 5: çeviri JSONB).
- **Normalize (Türkçe alt-slug → İngilizce) AYRI bir taksonomi işidir** — 301 redirect'li yapılır, URL/SEO
  kırılmaz. Bu **ithalatı bloklamaz** ve bu standardın kapsamı dışıdır → `category-taxonomy-standard.md §4`.

---

## 4. Kalite Kontrol Cetveli (Jidoka Quality Gate)

Üretilen CSV dosyalarının kalitesini doğrulamak için linter kuralları uygulanır. Hata tolerans ve aksiyon matrisi:

| Hata Kodu | Hata Tanımı | Hata Tipi | Sistem Aksiyonu |
|---|---|---|---|
| **`ERR_MISSING_MODEL_CODE`** | `model_code` veya `avensair_kod` alanı boş. | **Fatal** | Satır CSV'ye eklenmez. İşlem durdurulur ve hata raporlanır. |
| **`ERR_MISSING_PRICE`** | Avensair fiyat listesinde eşleşme var ancak fiyat boş/okunamadı. | **Warning** | Alış fiyatı boş bırakılır (`null`), `confidence` alanı `missing` yapılır. |
| **`ERR_PRICE_ZERO`** | Fiyat listesindeki alış fiyatı 0.00 veya negatif. | **Error** | Fiyat yazılır ancak `confidence` alanı `conflict` yapılır. Recep'in onayına sunulur. |
| **`ERR_MISSING_MANDATORY_SPEC`** | Kategoriye özel zorunlu alanlardan biri boş (§5). | **Warning** | Değer `null` kalır, `confidence` alanı `missing` yapılır. |
| **`ERR_INVALID_TYPE`** | Sayısal alana alfabetik veya bozuk formatta veri girilmesi. | **Error** | Değer temizlenmeye çalışılır ("230 V" → 230). Başarısız olunursa satır `conflict` yapılır. |
| **`ERR_SLUG_NOT_IN_DB`** | `category_slug`/`subcategory_slug` canlı DB'de yok (§3). | **Error** | Satır `conflict`; loader eşleştiremez → insana işaretlenir. |

---

## 5. Kategoriye Özel Zorunlu Teknik Kolonlar

Kategorilere göre aşağıdaki teknik kolonların CSV'de bulunması ve geçerli veri barındırması zorunludur (eksikse `ERR_MISSING_MANDATORY_SPEC`):

* **`residential-ventilation` (Konut Havalandırma):** `spec_voltage_v` · `spec_max_delivery_m3h` · `spec_has_timer`
* **`air-curtains` (Hava Perdeleri):** `spec_voltage_v` · `spec_airflow_speed_max_ms` · `spec_number_of_speeds`
* **`channel-fan` (Kanal Tipi Fanlar):** `spec_voltage_v` · `spec_diameter_mm` · `spec_max_delivery_m3h`
* **`roof-fan` (Çatı Tipi Fanlar):** `spec_voltage_v` · `spec_max_delivery_m3h`

> Yeni kategori eklenince zorunlu-spec listesi burada genişletilir (kategori → zorunlu `spec_` kümesi).

---

## 6. Provenance / İlişki

- **Yöntem cetveli:** `catalog-ingestion-standard.md` (kaynak, hakem, 27-bölüm kategori haritası, 2-kademe, kapılar).
- **Fiyat cetveli:** `pricing-standard.md` (€ alış → çok-para-birimi/KDV/kâr satış motoru).
- **Taksonomi cetveli:** `category-taxonomy-standard.md` (kategori iskeleti, slug dili, normalize kararı).
- **Pilot uyum kanıtı:** `vortice-konut.csv` (4 ürün, Vortice Punto Evo Flexo) bu şemaya **birebir** uyar.
- **memory:** `catalog-ingestion-system` · `pricing-currency-requirements` · `category-taxonomy-state`.

---

> v1.1 · 2026-06-20 · SSOT venthub-hvac. İngestor'daki kopya = türetilmiş (banner'lı), düzenleme burada yapılır.
