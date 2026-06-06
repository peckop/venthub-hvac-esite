---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts
skeleton_hash: 6c3b64045b137716
entity_hashes:
  func:createMockItem: 80170451f6e8a295
  overview: f0343d3cad55c313
generated_at: 2026-06-06T21:56:19Z
---

## Genel Bakış
VentHub HVAC projesinin ödeme (checkout) süreçleri için kullanılan test yardımcı modülüdür. Modül, birim testlerde tutarlı ve tekrarlanabilir test senaryoları oluşturmak amacıyla yapay sepet öğesi (CartItem) verileri üretmekle sorumludur.

## Fonksiyon Grupları
### Mock Veri Üreticileri
Test ortamında kullanılacak yapay sepet öğesi nesnelerini, tanımlı parametrelerle (id, miktar, fiyat) birebir üretmekten sorumludur.
- createMockItem

---

## AXIOMS – Mimari Varsayımlar

Bu modül test ortamına yönelik yapay test nesneleri üreten bir yardımcı fonksiyon modülüdür.

[Aksiyom 1]: Eğer `id` parametresi olarak boş bir string (`""`) geçilirse, fonksiyon hata fırlatmaz ve `id` alanı boş string olarak ayarlanmış bir mock nesne döndürür.

[Aksiyom 2]: Eğer `quantity` parametresi olarak negatif bir sayı geçilirse, fonksiyon bunu doğrudan mock nesnesine yazar; negatif değer kontrolü veya doğrulaması yapılmaz.

[Aksiyom 3]: Eğer `productPrice` parametresi olarak negatif bir sayı geçilirse, fonksiyon bunu doğrudan mock nesnesine yazar; fiyat doğrulaması yapılmaz.

[Aksiyom 4]: Eğer `unitPrice` parametresi geçirilmezse, oluşturulan mock nesnenin `unitPrice` alanı `undefined` olarak ayarlanır.

[Aksiyom 5]: Fonksiyon her çağrısında, verilen parametrelerle tutarlı ve deterministik (rastgelelik içermeyen, zaman bağımsız) bir `CartItem` yapısı döndürür.

[Aksiyom 6]: Fonksiyonun döndürdüğü nesne, `id`, `quantity`, `productPrice` ve opsiyonel `unitPrice` alanlarını içerir; bu alanlardan farklı bir alan barındırmaz veya eksik alan bırakmaz (opsiyonel `unitPrice` hariç).

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
- **params**: `(id: string, quantity: number, productPrice: number, unitPrice?: number)`
- **ic_degiskenler**:
  - (yerel değişken yok — parametreler direkt nesne oluşturmak için kullanılır)
- **Dönüş**: `CartItem` — Verilen parametrelerden oluşan mock bir CartItem nesnesi döner; `product.price` alanını `productPrice`'dan, `unitPrice`'ı opsiyonel parametreden alır

---

### [N2_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::describe_callback_(anonim)
- **params**: yok
- **ic_degiskenler**:
  - (bu callback içinde doğrudan değişken tanımlanmaz — sadece `it()` çağrılır)
- **Dönüş**: yok — `getPriceHashLocal` fonksiyonunu test eden 5 adet test senaryosunu çalıştırır

---

### [N3_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::it_callback_"should return an empty array string for an empty list"
- **params**: yok
- **ic_degiskenler**:
  - (hiçbir değişken tanımlanmaz — doğrudan expect çağrılır)
- **Dönüş**: yok — `getPriceHashLocal([])` çağrısının `'[]'` döndüğünü doğrular

---

### [N4_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::it_callback_"should use unitPrice if provided, otherwise fallback to product.price"
- **params**: yok
- **ic_degiskenler**:
  - `items` — `createMockItem` ile oluşturulmuş iki elemanlı mock CartItem dizisi; birinde `unitPrice` 90 olarak verilmiş, diğerinde verilmemiş (fallback davranışı test edilir)
  - `result` — `getPriceHashLocal(items)` çağrısının döndüğü JSON string; hash karşılaştırması yapılır
  - `parsed` — `JSON.parse(result)` ile elde edilmiş parsed nesne dizisi; `{ id, qty, unit }` formatında beklenen değerlerle `toEqual` ile karşılaştırılır
- **Dönüş**: yok — unitPrice mevcutsa onu, yoksa product.price'ı kullanma davranışını doğrular

---

### [N5_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::it_callback_"should handle decimal prices and apply rounding correctly"
- **params**: yok
- **ic_degiskenler**:
  - `items` — `createMockItem` ile oluşturulmuş iki elemanlı mock CartItem dizisi; birinde ondalık fiyat 10.121 (aşağı yuvarlama beklenir), diğerinde hem productPrice 20.999 hem unitPrice 15.559 (yukarı yuvarlama beklenir)
  - `result` — `getPriceHashLocal(items)` çağrısının döndüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilmiş parsed nesne dizisi; yuvarlanmış fiyatlarla (`10.12`, `15.56`) `toEqual` karşılaştırması yapılır
- **Dönüş**: yok — ondalıklı fiyatların doğru yuvarlanıp yuvarlanmadığını doğrular

---

### [N6_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::it_callback_"should sort items by id"
- **params**: yok
- **ic_degiskenler**:
  - `items` — `createMockItem` ile oluşturulmuş üç elemanlı mock CartItem dizisi; id'ler sırasıyla `z-item`, `a-item`, `m-item` (sıralanma davranışı test edilir)
  - `result` — `getPriceHashLocal(items)` çağrısının döndüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilmiş parsed nesne dizisi; alfabetik sırayla (`a-item`, `m-item`, `z-item`) `toEqual` karşılaştırması yapılır
- **Dönüş**: yok — sonuçların id'ye göre alfabetik sıralı olup olmadığını doğrular

---

### [N7_NASIL] AST Pointer: src/utils/__tests__/checkoutHelpers.test.ts::it_callback_"should handle two items with the same ID"
- **params**: yok
- **ic_degiskenler**:
  - `items` — `createMockItem` ile oluşturulmuş iki elemanlı mock CartItem dizisi; her ikisi de aynı id'ye (`dup-item`) sahip ama farklı unitPrice'lara (100 ve 90) sahip
  - `result` — `getPriceHashLocal(items)` çağrısının döndüğü JSON string
  - `parsed` — `JSON.parse(result)` ile elde edilmiş parsed nesne dizisi; uzunluk ve id eşitliği kontrolleri yapılır
  - `parsed[0]` — sıralanmış dizideki ilk eleman; `.id` alanı `dup-item` olmalı
  - `parsed[1]` — sıralanmış dizideki ikinci eleman; `.id` alanı `dup-item` olmalı
  - `units` — `parsed.map((p: { unit: number }) => p.unit)` ile elde edilmiş birim fiyat dizisi; 100 ve 90 değerlerini içermeli
- **Dönüş**: yok — aynı id'ye sahip iki ürünün dizide korunup korunmadığını ve her iki unitPrice'ın da sonuçta yer alıp almadığını doğrular

---

## NODE ID STANDARD

  file: src\utils\__tests__\checkoutHelpers.test.ts
  function: src\utils\__tests__\checkoutHelpers.test.ts::createMockItem

---

## DISA AKTARILANLAR (EXPORTS)
  export: createMockItem