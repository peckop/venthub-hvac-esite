---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\pricing-money-append-only.test.ts
skeleton_hash: a18c5c3d18465b53
entity_hashes:
  func:ddlSlices: ffade296d932a949
  overview: 4515c40df31cd9e7
generated_at: 2026-08-13T18:58:45Z
---

## Genel Bakış
Bu modül, fiyatlandırma ve para birimi verilerinin append-only (yalnızca ekleme) doğasını doğrulayan konformite testlerini içerir. Modüldeki tek yardımcı fonksiyon, SQL şema tanımlarını analiz ederek tabloların yapısını testler için hazırlar.

## Fonksiyon Grupları
### Test Yardımcı Fonksiyonları
Veritabanı şema tanımlarını (DDL) işleyerek test senaryolarında kullanılmak üzere tablo yapılarını çıkarır.
- ddlSlices

---

## AXIOMS – Mimari Varsayımlar
Bu modül, verilen bir kaynak (`source`) ve tablo (`table`) ismi için DDL (Data Definition Language) dilimleri (slices) oluşturma işlevine sahiptir. Doğru çalışması için aşağıdaki temel varsayımlara bağlıdır.

[Aksiyom 1]: Eğer `source` parametresi geçerli bir metin (string) değeri olarak sağlanmazsa (boş string veya tanımsız olabilir), `ddlSlices` fonksiyonu geçerli bir DDL dilim listesi üretmeyebilir veya hata fırlatabilir.

[Aksiyom 2]: Eğer `table` parametresi geçerli bir metin (string) değeri olarak sağlanmazsa, ilgili tabloya ait geçerli bir DDL dilim listesi üretilemeyebilir.

[Aksiyom 3]: Eğer `MIGRATION_SOURCES` sabiti tanımlı değilse veya fonksiyonun çalışma zamanında erişilebilir (call edilebilir) durumda değilse, `ddlSlices` fonksiyonu beklenen kaynak yapılandırmasını veya veri akışını alamaz ve dolayısıyla doğru bir çıktı üretemez.

---

## FONKSİYON DETAYLARI

### ddlSlices
**Ne yapar**: Verilen SQL migration kaynak kodu içinde, belirtilen tabloya ait CREATE TABLE gövdelerini (kolon tanımlarını) ve ALTER TABLE ADD COLUMN ifadelerini ayrıştırarak bir dizi (array) olarak döndürür.

**Nasıl yapar**: Fonksiyon, iki aşamalı bir regex taraması gerçekleştirir. Önce `gi` (global ve case-insensitive) bayraklarıyla oluşturulmuş bir regular expression kullanarak kaynak metin içindeki CREATE TABLE ifadelerini tarar ve verilen tablo adıyla eşleşen her ifadenin parantez içindeki gövde kısmını (`m[1]`) yakalar. Ardından ikinci bir regex ile aynı tabloya yönelik ALTER TABLE ... ADD COLUMN satırlarını tespit edip tam metinlerini (`m[0]`) toplar. Her iki arama sonucu da sıralı olarak aynı diziye eklenir ve bu dizi döndürülür.

**Parametreler**:
- `source: string` — SQL migration dosyasının veya kodunun ham metin içeriği; CREATE TABLE ve ALTER TABLE ifadelerini barındırması beklenen kaynak dizgidir.
- `table: string` — Hedef tablonun adı; regex kalıpları bu isme göre eşleştirme yapar ve yalnızca bu tabloya ait DDL ifadeleri çıkarılır.

**Dönüş**: `string[]` — Toplanan DDL parçalarının dizisi. Dizinin ilk elemanları CREATE TABLE gövdelerinin içeriğidir (parantez içi kolon tanımları), sonraki elemanları ise ALTER TABLE ADD COLUMN ifadelerinin tam metinleridir. Eşleşme bulunamazsa boş bir dizi döner.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **MIGRATION_SOURCES** (call) — `import.meta.glob(
  '/supabase/migrations/**/*.sql',
  { query: '?raw', impor...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/pricing-money-append-only.test.ts::ddlSlices
- **params**: (source: string, table: string)
- **ic_degiskenler**:
  - `slices` — Sonuç olarak döndürülecek DDL parçalarını tutan boş string dizisi
  - `createRe` — `source` parametresi içinde tablonun CREATE TABLE ifadesini yakalamak için oluşturulmuş regex nesnesi, `table` parametresini kullanarak tablo adını dinamik olarak oluşturur
  - `m` — `source.matchAll(createRe)` çağrısından dönen her bir eşleşme nesnesi, `m[1]` ile tablonun sütun tanımları portionu elde edilir
  - `alterRe` — `source` parametresi içinde tablonun ALTER TABLE ADD COLUMN ifadesini yakalamak için oluşturulmuş regex nesnesi, `table` parametresini kullanarak tablo adını dinamik olarak oluşturur
  - `m` — `source.matchAll(alterRe)` çağrısından dönen her bir eşleşme nesnesi, `m[0]` ile tam ALTER TABLE ifadesi elde edilir
- **Dönüş**: string[] — `slices` dizisi, yakalanan CREATE TABLE ve ALTER TABLE ADD COLUMN DDL parçalarını içerir

### [N2_NASIL] AST Pointer: src/__tests__/conformance/pricing-money-append-only.test.ts::test_bulunur
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `entries.length` değerinin 0'dan büyük olduğunu doğrular

### [N3_NASIL] AST Pointer: src/__tests__/conformance/pricing-money-append-only.test.ts::test_float_yok
- **params**: yok
- **ic_degiskenler**:
  - `violations` — Para tablolarında float tipi içeren DDL tespit edildiğinde hata dosya ve tablo bilgisini tutan string dizisi
  - `file` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen migration dosyasının adı
  - `source` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen dosyanın DDL içeriği
  - `table` — `MONEY_TABLES` dizisinden alınan para ile ilgili tablo adı
  - `slice` — `ddlSlices(source, table)` çağrısından dönen her bir DDL parçası (CREATE veya ALTER ifadesi)
- **Dönüş**: yok — `violations` dizisinin boş olduğunu doğrular

### [N4_NASIL] AST Pointer: src/__tests__/conformance/pricing-money-append-only.test.ts::test_policy_yasak
- **params**: yok
- **ic_degiskenler**:
  - `violations` — currency_rates tablosu üzerinde UPDATE/DELETE policy tanımlandığında hata dosyasını tutan string dizisi
  - `file` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen migration dosyasının adı
  - `source` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen dosyanın DDL içeriği
  - `policyRe` — Dosya içeriğinde `currency_rates` tablosu için UPDATE veya DELETE policy'sini yakalamak için oluşturulmuş regex nesnesi
- **Dönüş**: yok — `violations` dizisinin boş olduğunu doğrular

### [N5_NASIL] AST Pointer: src/__tests__/conformance/pricing-money-append-only.test.ts::test_crud_yasak
- **params**: yok
- **ic_degiskenler**:
  - `violations` — currency_rates tablosu üzerinde UPDATE veya DELETE sorgusu tespit edildiğinde hata dosya ve sorgu tipini tutan string dizisi
  - `file` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen migration dosyasının adı
  - `source` — `Object.entries(MIGRATION_SOURCES)` iterasyonundan gelen dosyanın DDL içeriği
- **Dönüş**: yok — `violations` dizisinin boş olduğunu doğrular

---

## NODE ID STANDARD

  file: src\__tests__\conformance\pricing-money-append-only.test.ts
  function: src\__tests__\conformance\pricing-money-append-only.test.ts::ddlSlices

---

## DISA AKTARILANLAR (EXPORTS)
  export: ddlSlices