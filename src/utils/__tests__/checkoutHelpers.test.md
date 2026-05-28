---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts
skeleton_hash: 41dc231c161734eb
entity_hashes:
  func:createMockItem: 80170451f6e8a295
  overview: df2e6b4fcfd906bb
generated_at: 2026-05-28T22:38:50Z
---

## Genel Bakış
VentHub HVAC projesinin ödeme (checkout) süreçlerine ait birim testlerinde kullanılmak üzere, testlerin tutarlı ve tekrarlanabilir çalışmasını sağlamak için gerekli olan yapay test verilerini (mock sepet öğeleri) oluşturma sorumluluğuna sahiptir. Modül, yalnızca test ortamına yönelik, test senaryolarını besleyen standart veri üretici bir yardımcı fonksiyon barındırır.

## Fonksiyon Grupları
### Mock Test Verisi Üreticileri
Test senaryolarında gereken, gerçek sepet verisi yapısına (CartItem) birebir uygun, kontrol edilebilir yapay test nesneleri üretmekten sorumludur. Bu sayede testler, dış bağımlılık olmaksızın ve beklenen formatta verilerle çalışabilir.
- createMockItem

---

## AXIOMS – Mimari Varsayımlar
Bu modül, test senaryolarında kullanılacak mock sepet öğesi verisi üretmek için tasarlanmış bir test yardımcı modülüdür.

[Aksiyom 1]: Eğer `id` parametresi sağlanmazsa, fonksiyon çağrısı hata verir veya geçersiz mock veri üretilir.

[Aksiyom 2]: Eğer `quantity` parametresi sağlanmazsa, fonksiyon çağrısı hata verir veya geçersiz mock veri üretilir.

[Aksiyom 3]: Eğer `productPrice` parametresi sağlanmazsa, fonksiyon çağrısı hata verir veya geçersiz mock veri üretilir.

[Aksiyom 4]: Eğer `unitPrice` parametresi sağlanmazsa, üretilen mock öğede birim fiyatı için bilinmeyen bir varsayılan değer kullanılır.

[Aksiyom 5]: Fonksiyon sadece test ortamında kullanılmalıdır; üretim (production) kodunda doğrudan çağrılmamalıdır.

[Aksiyom 6]: Fonksiyonun döndürdüğü mock öğe nesnesinin yapısı, gerçek sepet öğesi formatıyla uyumlu olmalıdır (testlerin geçerliliği için).

[Aksiyom 7]: Eğer `quantity` negatif bir değer olarak sağlanırsa, davranış bilinmiyor (fonksiyon imzasında doğrulama belirtilmemiştir).

[Aksiyom 8]: Eğer `productPrice` negatif veya sıfır değer olarak sağlanırsa, davranış bilinmiyor (fonksiyon imzasında doğrulama belirtilmemiştir).

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

### [N1_NASIL] AST Pointer: `checkoutHelpers.test.ts::createMockItem`
- **params**:
  - `id: string` — mock ürünün kimliği
  - `quantity: number` — ürün miktarı
  - `productPrice: number` — ürün fiyatı (unitPrice yoksa fallback olarak kullanılır)
  - `unitPrice?: number` — birim fiyat (opsiyonel, sağlanmazsa product.price kullanılır)
- **ic_degiskenler**: yok
- **Dönüş**: `CartItem` — id, quantity, product: { price: productPrice }, unitPrice alanlarını içeren mock nesne

---

### [N2_NASIL] AST Pointer: `checkoutHelpers.test.ts::describe callback`
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — testleri gruplandıran describe bloğu, yan etkisi olarak 5 adet test case'i Vitest runner'a kaydeder

---

### [N3_NASIL] AST Pointer: `checkoutHelpers.test.ts::it callback (empty array)`
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — getPriceHashLocal([]) çağrısının '[]' döndüğünü doğrular

---

### [N4_NASIL] AST Pointer: `checkoutHelpers.test.ts::it callback (unitPrice fallback)`
- **params**: yok
- **ic_degiskenler**:
  - `items` — createMockItem ile oluşturulmuş iki elemanlı mock CartItem dizisi; biri unitPrice ile (90), diğeri sadece productPrice ile (50)
  - `result` — getPriceHashLocal(items) çağrısının döndürdüğü JSON string sonucu
  - `parsed` — result'ın JSON.parse ile çözümlenmiş hali; [{id, qty, unit}] yapısında dizi
- **Dönüş**: yok — parsed sonucununtoEqual ile beklenen [{id:'item-1',qty:2,unit:90},{id:'item-2',qty:1,unit:50}] dizisine eşitliğini doğrular

---

### [N5_NASIL] AST Pointer: `checkoutHelpers.test.ts::it callback (decimal rounding)`
- **params**: yok
- **ic_degiskenler**:
  - `items` — createMockItem ile oluşturulmuş iki elemanlı mock CartItem dizisi; ondalık fiyatlarla (10.121 ve 15.559)
  - `result` — getPriceHashLocal(items) çağrısının döndürdüğü JSON string sonucu
  - `parsed` — result'ın JSON.parse ile çözümlenmiş hali; yuvarlanmış unit değerleri içerir
- **Dönüş**: yok — parsed sonucunun ondalık fiyatların doğru yuvarlandığını doğrular (10.12 ve 15.56)

---

### [N6_NASIL] AST Pointer: `checkoutHelpers.test.ts::it callback (sort by id)`
- **params**: yok
- **ic_degiskenler**:
  - `items` — createMockItem ile oluşturulmuş üç elemanlı mock CartItem dizisi; ids'leri sırasız (z-item, a-item, m-item)
  - `result` — getPriceHashLocal(items) çağrısının döndürdüğü JSON string sonucu
  - `parsed` — result'ın JSON.parse ile çözümlenmiş hali; id'ye göre alfabetik sıralanmış dizi
- **Dönüş**: yok — parsed sonucunun id'ye göre alfabetik sıralı (a-item, m-item, z-item) olduğunu doğrular

---

### [N7_NASIL] AST Pointer: `checkoutHelpers.test.ts::it callback (duplicate ids)`
- **params**: yok
- **ic_degiskenler**:
  - `items` — createMockItem ile oluşturulmuş iki elemanlı mock CartItem dizisi; her ikisi de 'dup-item' idsine sahip (farklı unitPrice değerleri: 100 ve 90)
  - `result` — getPriceHashLocal(items) çağrısının döndürdüğü JSON string sonucu
  - `parsed` — result'ın JSON.parse ile çözümlenmiş hali; iki elemanlı dizi, her ikisinin de id'si 'dup-item'
  - `units` — parsed dizisi üzerinde `.map((p) => p.unit)` ile oluşturulmuş, sadece unit değerlerinden oluşan dizi [100, 90]
- **Dönüş**: yok — parsed[0].id ve parsed[1].id'nin 'dup-item' olduğunu, units dizisinin 100 ve 90 değerlerini içerdiğini doğrular

---

## NODE ID STANDARD

  file: src\utils\__tests__\checkoutHelpers.test.ts
  function: src\utils\__tests__\checkoutHelpers.test.ts::createMockItem

---

## DISA AKTARILANLAR (EXPORTS)
  export: createMockItem