---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\pricing-order-snapshot-contract.test.ts
skeleton_hash: dc7ea67aa0ff6ed4
entity_hashes:
  func:findsOrderItemInsert: 21d32368a51f67af
  func:isTestFile: 8420235077a0a167
  overview: 08581fb1b22f8466
generated_at: 2026-08-16T11:19:01Z
---

## Genel Bakış
Bu modül, pricing ve sipariş anlık görüntü (order snapshot) sözleşmelerinin uygunluğunu doğrulayan conformance testleri için yardımcı fonksiyonlar içerir. Test dosyalarının tanımlanması ve kaynak kodda belirli sözleşme ihlallerinin tespit edilmesi amacıyla kullanılır.

## Fonksiyon Grupları
### Test Dosyası Tanımlama Yardımcıları
Test dosyalarının doğru şekilde tanımlanmasını ve konumlandırılmasını sağlayan yardımcı fonksiyonları barındırır.
- `isTestFile` - Verilen dosya yolunun geçerli bir test dosyası olup olmadığını doğrular

### Sözleşme İhlali Tespiti
Kaynak kodda pricing veya sipariş işlemleriyle ilgili potansiyel sözleşme ihlallerini tespit etmeye yönelik analiz fonksiyonlarını içerir.
- `findsOrderItemInsert` - Kaynak kodda OrderItem ekleme işlemi yapılıp yapılmadığını kontrol ederek sözleşmeye uygunluğu test eder

---

## AXIOMS – Mimari Varsayımlar

Bu modül, pricing-order snapshot kontrat testlerini doğrulayan bir test yardımcısıdır.

---

**[Aksiyom 1]**: Eğer `isTestFile` fonksiyonuna geçerli bir dosya yolu (`path`) verilmezse (boş string veya geçersiz format), fonksiyon `false` döner.

**[Aksiyom 2]**: Eğer `findsOrderItemInsert` fonksiyonuna kaynak kod (`src`) verilmezse veya boş string verilse, fonksiyon `false` döner — "order item insert" kalıbı hiçbir yerde bulunamaz.

**[Aksiyom 3]**: Eğer `SNAPSHOT_FIELDS` ifadesi tanımlı değilse, snapshot alan doğrulamaları çalışamaz; testler geçersiz sonuç üretebilir.

**[Aksiyom 4]**: Eğer `NOT_NULL_FIELDS` çağrısı başarısız olursa veya boş liste dönerse, alanların zorunluluğu doğrulanamaz — null alanlar hata üretmeden geçebilir.

**[Aksiyom 5]**: Eğer `edgeSources`, `appSources` veya `productionSources` kaynak listeleri tutarsız veya eksik tanımlanmışsa, hangi kaynak dosyalarda snapshot写的 doğrulanacağı bilinmez; kontrat testi eksik kalır.

**[Aksiyom 6]**: Eğer `migrationSql` ifadesi tanımlı değilse, migration'ların alan eklemeleri/doğrulamaları doğrulanamaz.

**[Aksiyom 7]**: Eğer `writePaths` çağrısı başarısız olursa veya boş liste dönerse, yazma izni olan yollar belirlenemez — testler yanlış negatif veya yanlış pozitif sonuç üretebilir.

---

## FONKSİYON DETAYLARI

### isTestFile
**Ne yapar**: Verilen dosya yolunun test veya mock dosyası olup olmadığını kontrol eder. Test dosyalarının gerçek yazma yolu olmadığını belirtmek için kullanılır.
**Nasıl yapar**: Belirli bir regex deseni (`/__tests__|\.test\.|\.spec\.|\/tests?\//`) kullanarak dosya yolunu tarar. Eşleşme bulunursa true, aksi halde false değerini döndürür.
**Parametreler**:
- path: string — Kontrol edilecek dosya yolu
**Dönüş**: boolean — Dosya yolu test/mock deseni içeriyorsa true, aksi halde false

### findsOrderItemInsert
**Ne yapar**: Verilen kaynak kod içeriğinde `venthub_order_items` tablosuna satır ekleyen (insert yapan) dosyaları tespit eder.
**Nasıl yapar**: İki farklı desen kontrolü yapar:
1. Ham PostgREST çağrıları: `/rest/v1/venthub_order_items` URL pattern'ini arar ve 700 karakterlik pencerede `method: 'POST'` kontrolü yapar.
2. Supabase JavaScript client çağrıları: `.from('venthub_order_items')` desenini arar ve 700 karakterlik pencerede `.insert(` veya `.upsert(` metodu olup olmadığını kontrol eder.
İki desenden herhangi biri eşleşirse true, aksi halde false döner.
**Parametreler**:
- src: string — Analiz edilecek kaynak kod içeriği
**Dönüş**: boolean — `venthub_order_items` tablosuna insert işlemi yapılıyorsa true, aksi halde false

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SNAPSHOT_FIELDS** (as_expression) — `[
  'unit_price_snapshot',
  'price_list_id_snapshot',
  'product_name_sna...`
- **NOT_NULL_FIELDS** (call) — `SNAPSHOT_FIELDS.filter((f) => f !== 'price_list_id_snapshot')`
- **edgeSources** (as_expression) — `import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
 ...`
- **appSources** (as_expression) — `import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'defaul...`
- **migrationSql** (as_expression) — `import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import:...`
- **productionSources** (call) — `Object.fromEntries(
  [...Object.entries(edgeSources), ...Object.entries(app...`
- **writePaths** (call) — `Object.entries(productionSources)
  .filter(([, src]) => findsOrderItemInser...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::isTestFile
- **params**: (path: string)
- **ic_degiskenler**:
  - `path` — test edilecek dosya yolu, regex eşleşmesi için kullanılır
- **Dönüş**: boolean — dosya yolu __tests__, .test., .spec. veya /tests/ kalıplarından birini içeriyorsa true

### [N2_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::findsOrderItemInsert
- **params**: (src: string)
- **ic_degiskenler**:
  - `PROXIMITY` — sabit, 700, insert method'u ile URL arasındaki maks karakter sayısı
  - `rawUrl` — /\/rest\/v1\/venthub_order_items(['"`])/g regex'i, Supabase REST URL'sini yakalar
  - `m` — rawUrl regex matchAll iterator'undan gelen eşleşme nesnesi
  - `window` — m.index'den itibaren 700 karakterlik substring, POST method kontrolü için
  - `jsFrom` — /\.from\(\s*['"`]venthub_order_items['"`]\s*\)/g regex'i, Supabase-js from() çağrısını yakalar
- **Dönüş**: boolean — venthub_order_items'a insert yapan bir kod yolu bulunursa true

### [N3_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: ()
- **ic_degiskenler**:
  - `writePaths` — dosya üst kısmında tanımlı sabit, bilinen yazma yollarını içerir
  - `ANCHOR_WRITE_PATH` — beklenen sabit yazma yolu (dosya üst kısmında tanımlı, burada kullanılmış)
- **Dönüş**: yok (test callback, assertyon yapıyor)

### [N4_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: ()
- **ic_degiskenler**:
  - `violations` — eksik alanları tutan dizi
  - `writePaths` — döngüde kullanılan yazma yolları dizisi
  - `path` — döngüdeki mevcut yazma yolu
  - `src` — productionSources[path] ile elde edilen kaynak kodu
  - `missing` — SNAPSHOT_FIELDS dizisinden, src içinde nesne anahtarı olarak geçmeyen alanlar
  - `SNAPSHOT_FIELDS` — snapshot alanları listesi (dosya üst kısmında tanımlı)
- **Dönüş**: yok (assertyon yapıyor)

### [N5_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: ()
- **ic_degiskenler**:
  - `migrationSql` — dosya üst kısmında tanımlı sabit, migration SQL'lerini içerir
  - `MIGRATION_PATH` — beklenen migration dosya yolu (dosya üst kısmında tanımlı)
  - `sql` — migrationSql[MIGRATION_PATH] ile elde edilen SQL metni
  - `normalized` — sql'in küçük harfli hali
  - `missingAdds` — eklenmesi gereken sütunlardan migration'da bulunamayanlar
  - `missingNotNull` — NOT NULL yapılması gereken sütunlardan yapılmayanlar
  - `NOT_NULL_FIELDS` — NOT NULL olması gereken alanlar listesi (dosya üst kısmında tanımlı)
- **Dönüş**: yok (assertyon yapıyor)

### [N6_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: ()
- **ic_degiskenler**:
  - `MIGRATION_PATH` — beklenen migration dosya yolu (dosya üst kısmında tanımlı)
  - `base` — MIGRATION_PATH'in son bileşeni, dosya adı
- **Dönüş**: yok (assertyon yapıyor)

### [N7_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: (col: string)
- **ic_degiskenler**:
  - `col` — kontrol edilecek sütun adı
- **Dönüş**: boolean — sütun adı SQL kalıplarına uymuyorsa true

### [N8_NASIL] AST Pointer: src/__tests__/conformance/pricing-order-snapshot-contract.test.ts::(anonymous)
- **params**: ()
- **ic_degiskenler**:
  - `writePaths` — dosya üst kısmında tanımlı sabit, bilinen yazma yollarını içerir
  - `ANCHOR_WRITE_PATH` — beklenen sabit yazma yolu (dosya üst kısmında tanımlı)
- **Dönüş**: yok (assertyon yapıyor)

---

## NODE ID STANDARD

  file: src\__tests__\conformance\pricing-order-snapshot-contract.test.ts
  function: src\__tests__\conformance\pricing-order-snapshot-contract.test.ts::isTestFile
  function: src\__tests__\conformance\pricing-order-snapshot-contract.test.ts::findsOrderItemInsert

---

## DISA AKTARILANLAR (EXPORTS)
  export: findsOrderItemInsert
  export: isTestFile