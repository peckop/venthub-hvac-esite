---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts
skeleton_hash: 19823e25118c8b83
entity_hashes:
  func:createMockItem: 80170451f6e8a295
  overview: da25bc9b82a8bb83
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
VentHub HVAC projesinde, birim testlerde ödeme (checkout) ile ilgili test senaryolarını desteklemek için kullanılan bir test yardımcı modülüdür. Modül, test ortamında tutarlı ve tekrarlanabilir test verileri oluşturmak amacıyla yapay sepet öğesi (CartItem) verileri üretmekle sorumludur.

## Fonksiyon Grupları
### Mock Veri Üreticileri
Test süreçlerinde kullanılacak yapay sepet öğesi nesnelerini, tanımlı parametrelerle (örneğin kimlik, miktar ve birim fiyat) birebir üretmekten sorumludur. Bu sayede testlerin tekrarlanabilirliği ve izolasyonu sağlanır.
- createMockItem

---

## AXIOMS – Mimari Varsayımlar

Bu modül, test ortamında kullanılacak yapay sepet öğesi (CartItem) nesneleri üreten yardımcı bir test fonksiyonudur.

[Aksiyom 1]: Eğer `id` parametresi (`string`, zorunlu) olarak `null` veya `undefined` geçilirse, fonksiyon beklenmeyen davranışı sergiler veya hata fırlatır.

[Aksiyom 2]: Eğer `quantity` parametresi (`number`, zorunlu) olarak `null` veya `undefined` geçilirse, fonksiyon beklenmeyen davranışı sergiler veya hata fırlatır.

[Aksiyom 3]: Eğer `productPrice` parametresi (`number`, zorunlu) olarak `null` veya `undefined` geçilirse, fonksiyon beklenmeyen davranışı sergiler veya hata fırlatır.

[Aksiyom 4]: Eğer `unitPrice` parametresi (`number?`, isteğeli) geçilmezse, fonksiyon yine de çalışır ve geçerli bir mock nesne üretir.

[Aksiyom 5]: Fonksiyon yalnızca birim test ortamlarında (`__tests__` kapsamında) kullanım için tasarlanmıştır; üretim (production) kodunda çağrılmamalıdır.

---

## FONKSİYON DETAYLARI

### createMockItem

**Ne yapar**: Test senaryolarında kullanılmak üzere sahte (mock) bir CartItem nesnesi oluşturur. Checkout ve fiyat hesaplama testlerinde tutarlı test verileri sağlamak için tasarlanmış bir test yardımcı fonksiyonudur.

**Nasıl yapar**: Fonksiyon, verilen parametreleri kullanarak bir CartItem nesnesi döndürür. Opsiyonel olan `unitPrice` parametresi sağlandığında bu değeri, sağlanmadığında ise `productPrice` değerini birim fiyat olarak kullanır. Bu davranış, test örneklerinde açıkça görülmektedir: `createMockItem('item-1', 2, 100, 90)` çağrısında birim fiyat 90 olarak atanırken, `createMockItem('item-2', 1, 50)` çağrısında birim fiyat 50 (productPrice) olarak atanmaktadır.

**Parametreler**:
- `id`: string — Oluşturulacak mock öğenin benzersiz tanımlayıcısıdır. Testlerde öğeleri birbirinden ayırt etmek için kullanılır (örn: 'item-1', 'item-2').
- `quantity`: number — Sepet öğesinin miktarını belirtir. Fiyat hesaplamalarında birim fiyat ile çarpılarak toplam tutarın hesaplanmasında kullanılır (örn: 2, 1).
- `productPrice`: number — Ürünün standart birim fiyatını temsil eder. `unitPrice` parametresi sağlanmadığında varsayılan birim fiyat olarak kullanılır (örn: 100, 50).
- `unitPrice` (opsiyonel): number — Ürünün indirimli veya özel birim fiyatını belirtir. Sağlandığında `productPrice` yerine bu değer birim fiyat olarak tercih edilir (örn: 90).

**Dönüş**: `CartItem` — Oluşturulan sahte sepet öğesi nesnesini döndürür. Nesne; `id`, `quantity`, `productPrice` ve opsiyonel olarak `unitPrice` değerlerini içerir. Bu nesne doğrudan `getPriceHashLocal()` gibi fiyat işleme fonksiyonlarına parametre olarak geçirilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::createMockItem
- **params**:
  - `id: string` — Oluşturulacak mockCartItem'un benzersiz tanımlayıcısı
  - `quantity: number` — Oluşturulacak mockCartItem'un adet sayısı
  - `productPrice: number` — Ürünün katalog fiyatı, product.price alanına yazılır
  - `unitPrice?: number` — (isteğe bağlı) Birim fiyat; sağlanırsa doğrudan unitPrice alanına yazılır, sağlanmazsa undefined olarak kalır
- **ic_degiskenler**: (yok — parametreler doğrudan döndürülür)
- **Dönüş**: `CartItem` — `{ id, quantity, product: { price: productPrice }, unitPrice }` nesnesi; test senaryolarında getPriceHashLocal'a beslenecek sahte sepet elemanı üretir

### [N2_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe(getPriceHashLocal) - empty list testi
- **params**: (yok)
- **ic_degiskenler**: (yok — expect çağrısı doğrudan sonuç ile karşılaştırılır)
- **Dönüş**: yok — `getPriceHashLocal([])` çağrısının `'[]'` string döndüğünü doğrular

### [N3_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe(getPriceHashLocal) - unitPrice fallback testi
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — `createMockItem` ile oluşturulmuş iki elemanlı dizi; birinde unitPrice (90), diğerinde sadece product.price (50) sağlanmış
  - `result` — `getPriceHashLocal(items)` çağrısının döndürdüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilen parsed dizi, her elemanı `{ id, qty, unit }` yapısında
- **Dönüş**: yok — parsed dizisinin `[{ id: 'item-1', qty: 2, unit: 90 }, { id: 'item-2', qty: 1, unit: 50 }]` olacağını doğrular

### [N4_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe(getPriceHashLocal) - decimal rounding testi
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — Ondalıklı fiyatlarla oluşturulmuş iki elemanlı dizi; item-1 price=10.121 (yukarı yuvarlanmalı 10.12), item-2 unitPrice=15.559 (yukarı yuvarlanmalı 15.56)
  - `result` — `getPriceHashLocal(items)` çağrısının döndürdüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilen parsed dizi
- **Dönüş**: yok — yuvarlama davranışının doğru olduğunu doğrular (`unit: 10.12` ve `unit: 15.56`)

### [N5_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe(getPriceHashLocal) - sort by id testi
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — Üç elemanlı dizi; id'leri sırasıyla 'z-item', 'a-item', 'm-item' olan mockItem'lar
  - `result` — `getPriceHashLocal(items)` çağrısının döndürdüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilen parsed dizi
- **Dönüş**: yok — sonuç dizisinin alfabetik sırada (`a-item`, `m-item`, `z-item`) olduğunu doğrular

### [N6_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe(getPriceHashLocal) - duplicate id testi
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — Aynı id'ye ('dup-item') sahip iki elemanlı dizi; ilki unitPrice=undefined, ikincisi unitPrice=90
  - `result` — `getPriceHashLocal(items)` çağrısının döndürdüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilen parsed dizi
  - `units` — `parsed.map((p) => p.unit)` ile elde edilen birim fiyat dizisi; 100 ve 90 değerlerini içerip içermediği doğrulanır
- **Dönüş**: yok — aynı id'ye sahip iki elemanın ayrı ayrı korunduğunu ve uzunluğun 2 olduğunu doğrular

---

## NODE ID STANDARD

  file: src\utils\__tests__\checkoutHelpers.test.ts
  function: src\utils\__tests__\checkoutHelpers.test.ts::createMockItem

---

## DISA AKTARILANLAR (EXPORTS)
  export: createMockItem