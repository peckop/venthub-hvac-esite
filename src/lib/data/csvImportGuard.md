---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\csvImportGuard.ts
skeleton_hash: a4e005618add51d3
entity_hashes:
  func:splitByExistingSku: d2107b0423a7baf1
  overview: d58c9002ee424267
generated_at: 2026-08-25T08:46:25Z
---

## Genel Bakış
Bu modül, CSV ithalatı sırasında veri koruma ve filtreleme işlemini gerçekleştirir. Temel amacı, ithal edilecek verileri mevcut SKU (Stok Kodu) envanterine göre sınıflandırmaktır. Modül, generic bir yapı kullanarak farklı veri tipleriyle uyumlu çalışabilir şekilde tasarlanmıştır.

## Fonksiyon Grupları

### Veri Ayrıştırma ve Filtreleme
İthal edilecek payload listesini, verilen mevcut SKU kümesiyle karşılaştırarak iki gruba ayırır. Bu sayede hangi kayıtların yeni oluşturulacağı ve hangilerinin mevcut kayıtlarla eşleştiği belirlenir.
- splitByExistingSku

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, gövdeden türetilen özel aksiyom tanımlanmamıştır.

İmzadan okunabilen yapısal bilgiler (aksiyom değil, bilgi amaçlı):

- Fonksiyon, `payloads` dizisini `existingSkus` kümesiyle karşılaştırarak `ImportSplit<T>` tipinde bir sonuç döndürür.
- Her iki parametre de readonly olarak işaretlidir; fonksiyon bu verileri değiştirmez.
- Generic `T` tipi kullanıldığından, payload elemanlarının hangi alanının SKU ile eşleştirildiği fonksiyon gövdesinde tanımlıdır — imzadan belirlenemez.

---

## FONKSİYON DETAYLARI

### splitByExistingSku
**Ne yapar**: Verilen payload dizisini, veritabanında zaten mevcut olan SKU kümesine göre ikiye böler. SKU'su veritabanında bulunan satırları `known` dizisine, bulunmayan veya SKU bilgisi boş/eksik olan satırları ise `unknown` dizisine yerleştirir. Ayrıca unknown tarafına düşen satırların tekrarsız SKU listesini de ayrı bir dizi olarak döndürür.

**Nasıl yapar**: Her satır için `sku` alanı string türünde ise `trim()` ile boşlukları temizler; string değilse boş string olarak değerlendirir. Eğer SKU doluysa ve `existingSkus` kümesinde mevcutsa satır `known` dizisine eklenir ve bir sonraki satıra geçilir. Diğer tüm durumlar — yani SKU boş/eksik olan satırlar ile SKU'su dolu ancak veritabanında bulunmayan satırlar — `unknown` dizisine eklenir. Unknown'a eklenen satırların SKU değerleri, `seen` adlı bir `Set` aracılığıyla mükerrer kontrolü yapılarak `unknownSkus` dizisine toplanır. Bu sayede unknown tarafına düşen benzersiz SKU'lar tek bir listede derlenir. Docstring'te özellikle vurgulandığı üzere, SKU'su boş veya eksik olan satırlar bilinmeyen (unknown) olarak sınıflandırılır; çünkü böyle bir satır bilinen bir ürüne eşlenemez ve yazılırsa yeni kayıt üretir. Bu satırları sessizce known tarafına koymak, kaçınılmak istenen hataya yol açardı.

**Parametreler**:
- payloads: `readonly T[]` — İşlenecek satırların salt okunur dizisi. `T`, `SkuBearing` arayüzünü/genişlemesini sağlayan generic bir tiptir; bu da her elemanın bir `sku` alanına sahip olduğunu garanti eder.
- existingSkus: `ReadonlySet<string>` — Veritabanında mevcut olan SKU'ların salt okunur kümesi. Her bir SKU string olarak temsil edilir.

**Dönüş**: `ImportSplit<T>` — Üç alandan oluşan bir nesne döndürür: `known` (veritabanında eşleşen SKU'ya sahip satırların dizisi), `unknown` (SKU'su bulunamayan veya eksik olan satırların dizisi) ve `unknownSkus` (unknown tarafına düşen satırların tekrarsız SKU değerlerinin string dizisi).

---

## TYPE ALIASES

### SkuBearing
CSV içe aktarımı — bilinmeyen SKU ayrımı (saf). NİÇİN VAR (T148-VH çürütme turu, 2026-08-22): Admin CSV içe aktarımı `upsert(..., { onConflict: 'sku' })` kullanıyor. `upsert` eşleşme bulamazsa satırı **sessizce INSERT eder**. Yani bir kimlik düzeltmesinden ÖNCE alınmış dışa aktarım dosyası sonradan 
```typescript
type SkuBearing = { sku?: string | null }
```

### ImportSplit
```typescript
type ImportSplit = <T extends SkuBearing>
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: csvImportGuard.ts::splitByExistingSku
- **params**:
  - `payloads` — `readonly T[]` tipinde, `SkuBearing` arayüzünü uygulayan salt okunur dizi; işlenecek tüm kayıtları taşır
  - `existingSkus` — `ReadonlySet<string>` tipinde, sistemde zaten mevcut olan SKU değerlerini içeren salt okunur küme
- **ic_degiskenler**:
  - `known` — `T[]` tipinde, `existingSkus` kümesinde bulunan SKU'ya sahip kayıtları biriktiren dizi
  - `unknown` — `T[]` tipinde, `existingSkus` kümesinde bulunmayan veya SKU'su boş/geçersiz olan kayıtları biriktiren dizi
  - `seen` — `Set<string>` tipinde, döngü sırasında daha önce işlenmiş bilinmeyen SKU'ları takip ederek `unknownSkus` dizisinde tekrarı önler
  - `unknownSkus` — `string[]` tipinde, `unknown` dizisine düşen kayıtların benzersiz SKU değerlerini sıralı biçimde biriktirir
  - `row` — for-of döngüsünde `payloads` dizisinin her bir öğesini temsil eder
  - `sku` — `row.sku` alanının işlenmiş hali; `row.sku` string ise `trim()` uygulanmış değeri, değilse boş string atanır
- **Dönüş**: `ImportSplit<T>` — `{ known, unknown, unknownSkus }` alanlarını içeren nesne; mevcut SKU'lara göre ayrılmış iki dizi ve bilinmeyen benzersiz SKU listesi döndürür

---

## NODE ID STANDARD

  file: src\lib\data\csvImportGuard.ts
  function: src\lib\data\csvImportGuard.ts::splitByExistingSku

---

## DISA AKTARILANLAR (EXPORTS)
  export: ImportSplit
  export: SkuBearing
  export: splitByExistingSku