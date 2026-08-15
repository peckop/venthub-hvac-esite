---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts
skeleton_hash: 693a0525a7b86293
entity_hashes:
  func:isForbidden: 2ca9b18affed37b8
  func:normalize: 1e38e13211150a91
  overview: d4039c9c30c7b0eb
generated_at: 2026-08-15T06:32:35Z
---

## Genel Bakış
Bu modül, fiyat yüzeyi (price surface) bileşeninin conformance testlerini destekleyen yardımcı fonksiyonlar içerir. Test senaryolarında kullanılan veri normalizasyonu ve yasaklı içerik kontrolü gibi temel yardımcı işlevleri sağlar.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar (Test Helpers)
Test süreçlerinde kullanılan evrensel yardımcı işlevleri tanımlar. Bu fonksiyonlar, test senaryolarının tutarlı ve güvenli bir şekilde çalışmasını sağlamak için veri doğrulama ve dönüştürme işlemleri yapar.
- normalize, isForbidden

---

## AXIOMS – Mimari Varsayımlar

Bu modül, dosya yollarının normalize edilmesi ve yasak kontrolünden geçirilmesiyle ilgili kuralları tanımlar.

---

[Aksiyom 1 – Normalizasyon Girdisi]: `normalize(p: string)` fonksiyonu yalnızca geçerli bir dosya yolu dizgisi (string) alır.
→ Eğer `p` geçerli bir dosya yolu formatında değilse, beklenmeyen bir sonuç döner.

[Aksiyom 2 – Normalizasyon Çıktısı]: `normalize` fonksiyonunun çıktısı her zaman bir string olmalıdır.
→ Eğer normalize edilmiş yol string'e dönüştürülemezse, hata oluşur.

[Aksiyom 3 – Yasak Kontrol Girdisi]: `isForbidden(p: string)` fonksiyonu yalnızca normalize edilmiş bir dosya yolu ile çağrılmalıdır.
→ Eğer normalize edilmemiş bir yol verilirse, yanlış yasak kararı verilebilir.

[Aksiyom 4 – Yasak Dosya Tanımlı Olmalı]: `FORBIDDEN_FILES` sabiti boş olmamalıdır.
→ Eğer `FORBIDDEN_FILES` boşsa, hiçbir dosya yasaklanamaz ve `isForbidden` her zaman `false` döner.

[Aksiyom 5 – İzin Listesi Tutarlılığı]: `ALLOWLIST_FILES` ve `ALLOWLIST_PREFIXES` ile `FORBIDDEN_FILES` arasında çakışma olmamalıdır.
→ Eğer bir dosya hem allowlist'te hem forbidden listesinde yer alırsa, çelişkili karar üretir.

[Aksiyom 6 – Kaynak Tarafı]: `SRC_SOURCES` fonksiyonu yalnızca geçerli bir kaynak listesi döndürmelidir.
→ Eğer kaynak listesi boşsa, `ALL_PATHS` çağrılamaz ve test verisi üretilmez.

[Aksiyom 7 – Tüm Yolların Üretimi]: `ALL_PATHS` fonksiyonu, `SRC_SOURCES` tarafından sağlanan kaynaklardan yollar üretmelidir.
→ Eğer kaynaklar geçerli formatта değilse, ALL_PATHS boş veya hatalı sonuç döner.

[Aksiyom 8 – Domain Specific – AllowedPrefix Önceliği]: `ALLOWLIST_PREFIXES`, `FORBIDDEN_FILES`'ı override edebilir.
→ Bir yol bir allowed prefix ile başlıyorsa, forbidden listesinde olsa bile izin verilir.

---

## FONKSİYON DETAYLARI

### normalize
**Ne yapar**: Bir dosya yolundaki ters eğik çizgileri (/) ileri eğik çizgilere dönüştürür ve yolun başındaki tüm eğik çizgileri kaldırarak yolu normalize eder.

**Nasıl yapar**: Fonksiyon iki aşamalı bir string dönüşümü gerçekleştirir. Önce `replace` metodu ile tüm ters eğik çizgi (`\`) karakterlerini ileri eğik çizgi (`/`) ile değiştirir, ardından regex `^/+` kalıbı ile yolun başındaki bir veya birden fazla eğik çizgiyi (`/`) boşluk ile değiştirerek kaldırır. Bu sayede Windows ve Unix tabanlı sistemlerde farklılık gösteren yol formatları tek bir standart forma getirilir.

**Parametreler**:
- `p`: `string` — Normalize edilecek dosya yolu dizgesi. Windows tarzı ters eğik çizgiler veya baştaki fazla eğik çizgiler içerebilir.

**Dönüş**: `string` — Normalize edilmiş, ileri eğik çizgiler kullanılan ve baştaki fazla eğik çizgilerden arındırılmış temiz dosya yolu.

### isForbidden
**Ne yapar**: Verilen dosya yolunun yasaklanan dosyalar listesinde veya yasaklanan ön eklerle başlayıp başlamadığını kontrol eder.

**Nasıl yapar**: Fonksiyon iki ayrı kontrol gerçekleştirir. İlk olarak `FORBIDDEN_FILES` adlı dizide (dışarıda tanımlı sabit) yer alan dosya isimleriyle doğrudan eşleşme olup olmadığını `includes` metodu ile kontrol eder. Eşleşme bulunursa hemen `true` döner. Eşleşme bulunmazsa `FORBIDDEN_PREFIXES` adlı dizideki (dışarıda tanımlı sabit) her bir ön eki sırasıyla `startsWith` metodu ile yolun başında olup olmadığını test eder. Herhangi bir ön ek ile başlayan bir eşleşme bulunursa `true`, aksi halde `false` döner. Fonksiyon kısa devre mantığı (short-circuit) ile çalışarak ilk eşleşmede durur.

**Parametreler**:
- `p`: `string` — Kontrol edilecek dosya yolu veya dosya adı dizgesi.

**Dönüş**: `boolean` — Dosya yolu yasaklıysa `true`, yasaklı değilse `false`.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SRC_SOURCES** (call) — `import.meta.glob(
  '/src/**/*.{ts,tsx}',
  { query: '?raw', import: 'default...`
- **ALL_PATHS** (call) — `Object.keys(SRC_SOURCES).map(normalize)`
- **FORBIDDEN_FILES** (array) — `[
  'src/components/products/FamilyCard.tsx',
  'src/views/ProductsDiscoveryV...`
- **ALLOWLIST_FILES** (array) — `[
  'src/app/_components/ProductDetailPageView.tsx',
  'src/components/produc...`
- **ALLOWLIST_PREFIXES** (array) — `[
  'src/views/checkout/',
  // `src/components/cart/**` bu kod tabanında hen...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::normalize
- **params**: (p: string)
- **ic_degiskenler**:
- **Dönüş**: string — Windows backslash'larını forward slash'a çevirip baştaki slash'leri temizler

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::isForbidden
- **params**: (p: string)
- **ic_degiskenler**:
- **Dönüş**: boolean — Verilen yasaklı dosya listesi ve yasaklı prefix listesi ile kontrol eder

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_1
- **params**: () 
- **ic_degiskenler**:
  - `f` — Döngüdeki mevcut yasaklı dosya adı, ALL_PATHS'de olup olmadığı kontrol edilir
  - `prefix` — Döngüdeki mevcut yasaklı prefix, ALL_PATHS'de en az bir dosya başlatıp başlatmadığı kontrol edilir
  - `f` (ALLOWLIST_FILES döngüsü) — Döngüdeki mevcut izinli dosya adı
  - `prefix` (ALLOWLIST_PREFIXES döngüsü) — Döngüdeki mevcut izinli prefix
  - `offenders` — formatCurrency() çağrısı bulunan yasaklı yüzey dosyalarını toplar
  - `file` — Object.entries(SRC_SOURCES) döngüsündeki dosya adı anahtarı
  - `source` — Object.entries(SRC_SOURCES) döngüsündeki dosya içeriği değeri
  - `p` — normalize(file) ile normalize edilmiş dosya yolu
  - `offenders` (Set ile tekrarlar kaldırılmış) — Benzersiz ihlal eden dosya listesi
- **Dönüş**: yok — Test asertifleri ile yasaklı/izinli listelerin güncelliğini ve fiyat gösterim kurallarını doğrular

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_2
- **params**: ()
- **ic_degiskenler**:
  - `f` — Döngüdeki mevcut yasaklı dosya adı
  - `prefix` — Döngüdeki mevcut yasaklı prefix
- **Dönüş**: yok — Sadece FORBIDDEN_FILES ve FORBIDDEN_PREFIXES listelerinin güncelliğini doğrular

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_3
- **params**: ()
- **ic_degiskenler**:
  - `f` — Döngüdeki mevcut izinli dosya adı
  - `prefix` — Döngüdeki mevcut izinli prefix
- **Dönüş**: yok — Sadece ALLOWLIST_FILES ve ALLOWLIST_PREFIXES listelerinin güncelliğini doğrular

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_4
- **params**: ()
- **ic_degiskenler**:
  - `offenders` — formatCurrency() çağrısı bulunan yasaklı yüzey dosyalarını toplar
  - `file` — Object.entries(SRC_SOURCES) döngüsündeki dosya adı anahtarı
  - `source` — Object.entries(SRC_SOURCES) döngüsündeki dosya içeriği değeri
  - `p` — normalize(file) ile normalize edilmiş dosya yolu
  - `offenders` (Set ile tekrarlar kaldırılmış) — Benzersiz ihlal eden dosya listesi
- **Dönüş**: yok — Yasaklı yüzeylerde formatCurrency() kullanımını kontrol eder

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_5
- **params**: ()
- **ic_degiskenler**:
  - `offenders` — hidePrice prop'u geçmeyen ProductCard çağrılarını toplar
  - `callsiteCount` — Bulunan toplam ProductCard çağrı yeri sayısı
  - `file` — Object.entries(SRC_SOURCES) döngüsündeki dosya adı anahtarı
  - `source` — Object.entries(SRC_SOURCES) döngüsündeki dosya içeriği değeri
  - `p` — normalize(file) ile normalize edilmiş dosya yolu
  - `re` — ProductCard etiketlerini eşleştiren regex deseni
  - `m` — source.matchAll(re) ile bulunan her bir regex eşleşmesi
  - `offenders` (Set ile tekrarlar kaldırılmış) — Benzersiz ihlal eden dosya listesi
- **Dönüş**: yok — Tüm ProductCard çağrılarının hidePrice prop'unu geçtiğini doğrular

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\__tests__\conformance\render-price-surface.test.ts::test_callback_6
- **params**: ()
- **ic_degiskenler**:
  - `offenders` — hidePrice prop'u geçmeyen ProductCard çağrılarını toplar
  - `callsiteCount` — Bulunan toplam ProductCard çağrı yeri sayısı
  - `file` — Object.entries(SRC_SOURCES) döngüsündeki dosya adı anahtarı
  - `source` — Object.entries(SRC_SOURCES) döngüsündeki dosya içeriği değeri
  - `p` — normalize(file) ile normalize edilmiş dosya yolu
  - `re` — ProductCard etiketlerini eşleştiren regex deseni
  - `m` — source.matchAll(re) ile bulunan her bir regex eşleşmesi
  - `offenders` (Set ile tekrarlar kaldırılmış) — Benzersiz ihlal eden dosya listesi
- **Dönüş**: yok — Sadece ProductCard çağrılarının hidePrice prop'unu geçtiğini doğrular (aynı test, farklı kapsam)

---

## NODE ID STANDARD

  file: src\__tests__\conformance\render-price-surface.test.ts
  function: src\__tests__\conformance\render-price-surface.test.ts::normalize
  function: src\__tests__\conformance\render-price-surface.test.ts::isForbidden

---

## DISA AKTARILANLAR (EXPORTS)
  export: isForbidden
  export: normalize