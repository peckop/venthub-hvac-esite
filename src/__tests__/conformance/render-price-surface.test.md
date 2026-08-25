---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\__tests__\conformance\render-price-surface.test.ts
skeleton_hash: 451dc0cf1a01084f
entity_hashes:
  func:isForbidden: db65f648feccfd64
  func:normalize: b6698a8944680c7d
  overview: d4039c9c30c7b0eb
generated_at: 2026-08-25T07:32:53Z
---

## Genel Bakış

Bu modül, fiyat yüzeyi (price surface) oluşturma işleminin uygunluk testlerini barındıran bir test dosyasıdır. Dosya kapsamında tanımlanan iki yardımcı fonksiyon, test senaryolarında yol (path) değerlerini düzenlemek ve denetlemek için kullanılır.

## Fonksiyon Grupları

### Yol Düzenleme ve Denetim Yardımcıları

Test senaryolarında kullanılan yol işleme yardımcılarıdır. Birincisi verilen yolu standart bir biçime getirir, ikincisi verilen yolun yasaklı olup olmadığını belirler.

- normalize, isForbidden

### Notlar

- Bu fonksiyonlar arasındaki çağrı ilişkisi kaynakta belirtilmemiştir; birbirlerini çağırıp çağırmadıkları bilinmiyor.
- Modülün dış bağımlılıkları (hangi modüllerden import ettiği) verilen kaynakta yer almamaktadır.
- Her iki fonksiyon da test dosyası kapsamında yerel (local) yardımcılar olarak tanımlıdır; dışarıya ihraç edilip edilmedikleri bilinmiyor.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `normalize` ve `isForbidden` fonksiyonlarını ve ilgili sabit listeleri test eden bir sınama dosyasıdır. Modülün doğru çalışabilmesi için sınanan fonksiyonların ve sabitlerin var olması gerekir.

[Aksiyom 1]: Eğer `normalize` fonksiyonu yoksa, bu fonksiyonun davranışını doğrulayan testler çalışamaz.
[Aksiyom 2]: Eğer `isForbidden` fonksiyonu yoksa, bu fonksiyonun davranışını doğrulayan testler çalışamaz.
[Aksiyom 3]: Eğer `SRC_SOURCES` ve `ALL_PATHS` çağrıları yoksa, testlerde kullanılacak kaynak ve yol verileri üretilemez.
[Aksiyom 4]: Eğer `FORBIDDEN_FILES`, `ALLOWLIST_FILES` ve `ALLOWLIST_PREFIXES` dizileri yoksa, `isForbidden` fonksiyonunun sınanması için gerekli referans verileri eksik kalır.

---

## FONKSİYON DETAYLARI

### normalize
**Ne yapar**: Verilen dosya yolunu normalize ederek platform bağımsız standart bir formata dönüştürür. Windows tarzı ters eğik çizgileri (`\`) düz eğik çizgiye (`/`) çevirir ve yolun başındaki gereksiz eğik çizgileri kaldırır.

**Nasıl yapar**: İlk olarak `replace` metodu ile tüm ters eğik çizgileri (`\`) düz eğik çizgiye (`/`) dönüştürür. Ardından RegExp kalıbı `/^\/+/` kullanarak yolun başındaki bir veya daha fazla eğik çizgiyi boş string ile değiştirir. Bu sayede hem platform farkları ortadan kalkar hem de göreli yollar elde edilir.

**Parametreler**:
- p: string — Normalize edilecek dosya yolu string'i

**Dönüş**: string — Normalize edilmiş, ters eğik çizgilerden arındırılmış ve baştaki eğik çizgileri kaldırılmış dosya yolu

### isForbidden
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SRC_SOURCES** (call) — `import.meta.glob(
  '/src/**/*.{ts,tsx}',
  { query: '?raw', import: 'defau...`
- **ALL_PATHS** (call) — `Object.keys(SRC_SOURCES).map(normalize)`
- **FORBIDDEN_FILES** (array) — `[
  'src/components/products/FamilyCard.tsx',
  'src/views/ProductsDiscover...`
- **ALLOWLIST_FILES** (array) — `[
  'src/app/_components/ProductDetailPageView.tsx',
  'src/components/prod...`
- **ALLOWLIST_PREFIXES** (array) — `[
  'src/views/checkout/',
  // `src/components/cart/**` bu kod tabanında h...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: render-price-surface.test.ts::normalize
- **params**: `p` — normalize edilecek dosya yolu (string)
- **ic_degiskenler**: yok
- **Dönüş**: string — ters eğik çizgileri düz eğik çizgiye dönüştürülmüş ve baştaki eğik çizgileri kaldırılmış dosya yolu

### [N2_NASIL] AST Pointer: render-price-surface.test.ts::isForbidden
- **params**: `p` — kontrol edilecek dosya yolu (string)
- **ic_degiskenler**: yok
- **Dönüş**: boolean — `p` değeri `FORBIDDEN_FILES` dizisinde varsa veya `FORBIDDEN_PREFIXES` dizisindeki herhangi bir önek ile başlıyorsa `true`, aksi halde `false`

### [N3_NASIL] AST Pointer: render-price-surface.test.ts::(anonim — stale-guard testleri)
- **params**: yok
- **ic_degiskenler**:
  - `f` — `FORBIDDEN_FILES` dizisinin her elemanı (döngü değişkeni)
  - `prefix` — `FORBIDDEN_PREFIXES` dizisinin her elemanı (döngü değişkeni)
- **Dönüş**: yok — yan etki olarak `expect` çağrılarıyla yasak liste elemanlarının `ALL_PATHS` içinde varlığını doğrular

### [N4_NASIL] AST Pointer: render-price-surface.test.ts::(anonim — izin listesi stale-guard)
- **params**: yok
- **ic_degiskenler**:
  - `f` — `ALLOWLIST_FILES` dizisinin her elemanı (döngü değişkeni)
  - `prefix` — `ALLOWLIST_PREFIXES` dizisinin her elemanı (döngü değişkeni)
- **Dönüş**: yok — yan etki olarak `expect` çağrılarıyla izin listesi elemanlarının `ALL_PATHS` içinde varlığını doğrular

### [N5_NASIL] AST Pointer: render-price-surface.test.ts::(anonim — formatCurrency kaçak taraması)
- **params**: yok
- **ic_degiskenler**:
  - `offenders` — yasak yüzeylerde `formatCurrency(` çağrısı bulunan dosya yollarını toplayan dizi (string[])
  - `file` — `SRC_SOURCES` nesnesinin anahtarları (döngü değişkeni, dosya yolu)
  - `source` — `SRC_SOURCES` nesnesinin değerleri (döngü değişkeni, dosya içeriği)
  - `p` — `normalize(file)` sonucu, normalize edilmiş dosya yolu
- **Dönüş**: yok — yan etki olarak yasak yüzeylerde `formatCurrency(...)` çağrısı bulunmamasını doğrular

### [N6_NASIL] AST Pointer: render-price-surface.test.ts::(anonim — ProductCard hidePrice kontrolü)
- **params**: yok
- **ic_degiskenler**:
  - `offenders` — `hidePrice` prop'u geçirilmeyen `ProductCard` çağıran dosya yollarını toplayan dizi (string[])
  - `callsiteCount` — bulunan toplam `ProductCard` çağrı yeri sayısı (number)
  - `file` — `SRC_SOURCES` nesnesinin anahtarları (döngü değişkeni, dosya yolu)
  - `source` — `SRC_SOURCES` nesnesinin değerleri (döngü değişkeni, dosya içeriği)
  - `p` — `normalize(file)` sonucu, normalize edilmiş dosya yolu
  - `re` — `<ProductCard` JSX açılış etiketini yakalayan regex deseni
  - `m` — `source.matchAll(re)` sonucu yakalanan eşleşme (döngü değişkeni)
- **Dönüş**: yok — yan etki olarak `PRODUCT_CARD_CALLSITE_EXEMPT` hariç tüm `ProductCard` çağıranların `hidePrice` prop'u geçirdiğini doğrular; ayrıca hiç çağrı yeri bulunamaması durumunda testi başarısız kılar

---

## NODE ID STANDARD

  file: render-price-surface.test.ts
  function: render-price-surface.test.ts::normalize
  function: render-price-surface.test.ts::isForbidden

---

## DISA AKTARILANLAR (EXPORTS)
  export: isForbidden
  export: normalize