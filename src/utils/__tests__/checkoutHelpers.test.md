---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts
skeleton_hash: 41dc231c161734eb
generated_at: 2026-05-23T22:33:46Z
---

## Genel Bakış
VentHub HVAC projesinin ödeme işlemleri yardımcı fonksiyonlarını test etmek için geliştirilen bu test modülü, test senaryolarında ihtiyaç duyulan yapay test verileri üretme sorumluluğunu taşır. Sadece testlerde kullanılan yardımcı bir fonksiyon barındıran modül, sepet içeriklerine ilişkin testlerin tutarlı bir şekilde çalışmasını destekler.

## Fonksiyon Grupları
### Mock Test Verisi Üreticileri
Testlerde kullanılmak üzere gerçek sepet öğesi formatına uygun yapay (mock) sepet ürünleri oluşturur, tüm test senaryolarında standart ve tutarlı test verisi sağlar.
- createMockItem

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin checkout (sipariş tamamlama) süreçleri birim testlerinde kullanılan sentetik mock sipariş öğesi verisi üretmek üzere tasarlanmış, yalnızca test ortamında kullanılması öngörülen test yardımcı fonksiyonu barındırmaktadır.

[Aksiyom 1]: Eğer createMockItem fonksiyonuna iletilen id parametresi boş olmayan geçerli bir string değilse, üretilen mock sipariş öğesi testler içinde benzersiz olarak tanımlanamaz, test çakışmalarına veya yanlış test sonuçlarına yol açar.
[Aksiyom 2]: Eğer createMockItem fonksiyonuna iletilen quantity parametresi sıfırdan büyük geçerli bir sayı değilse, üretilen mock öğenin miktar değeri gerçek sipariş kurallarına uymaz, miktar bazlı toplam hesaplama testlerinde hatalı sonuçlar üretir.
[Aksiyom 3]: Eğer createMockItem fonksiyonuna iletilen productPrice parametresi sıfırdan büyük geçerli bir sayı değilse, mock öğenin tüm fiyatlandırma hesaplamaları geçersiz kalır, sepet veya ödeme toplamı testlerinin başarısız olmasına neden olur.
[Aksiyom 4]: Eğer opsiyonel olarak iletilen unitPrice parametresi fonksiyona gönderildiğinde, sıfırdan büyük geçerli bir sayı değilse, birim fiyat bazlı özel testlerde kullanılan mock öğe değeri gerçek senaryolara uymaz, fiyat karşılaştırma testlerinin yanlış sonuçlanmasına yol açar.
[Aksiyom 5]: Eğer bu modül içindeki fonksiyon, öngörülen test ortamı dışında üretim kodunda kullanılırsa, sentetik test verisi üretme amacı dışında işlevsiz kalır, gerçek sipariş öğelerinin kullanılması gereken yerlerde hatalı veri girişine neden olur.

---

## FONKSIYON DETAYLARI

### createMockItem
**Ne yapar**: VentHub HVAC projesinin ödeme süreci testlerinde kullanılmak üzere simüle edilmiş geçerli bir alışveriş sepeti öğesi oluşturan yardımcı test fonksiyonudur. Testlerde tekrarlı sepet öğesi tanımlamalarından kaçınmak ve tüm test senaryolarında tutarlı sepet verisi sağlamak için tasarlanmıştır. Sadece test ortamlarında kullanılan bu fonksiyon, production kodunda yer almaz.
**Nasıl yapar**: Aldığı tüm giriş parametrelerini birleştirerek CartItem tipinin gerektirdiği tüm alanları içeren eksiksiz bir nesne oluşturur. Opsiyonel olarak gönderilen unitPrice parametresi eksik kaldığında, productPrice değerini varsayılan birim fiyat olarak atayarak testlerde fiyat tutarsızlıkları veya eksik alan hataları oluşmasını engeller. Tüm zorunlu alanları tam olarak doldurduğu için testlerde tip uyumsuzluğu riskini ortadan kaldırır.
**Parametreler**:
- name: id, type: string — Simüle edilen sepet öğesine ait benzersiz ürün kimliği, testlerde ürün takibi ve doğrulamaları için referans değer olarak kullanılır
- name: quantity, type: number — Sepete eklenen ilgili üründen alınan adet sayısı, stok doğrulamaları ve toplam fiyat hesaplama testlerinde kullanılır
- name: productPrice, type: number — Ürünün standart temel satış fiyatıdır, unitPrice parametresi gönderilmediğinde varsayılan birim fiyat olarak devreye girer
- name: unitPrice, type: number | undefined (opsiyonel) — İndirim, kur farkı veya ekstra masraflar sonrası oluşan gerçek birim satış fiyatıdır, özel fiyatlandırma senaryoları testlerinde isteğe bağlı olarak gönderilir
**Dönüş**: CartItem tipi, tüm gerekli alanları tam olarak doldurulmuş, testlerde doğrudan kullanılmaya hazır alışveriş sepeti öğesi nesnesidir. Bu nesne, sepet hesaplamaları, toplam fiyat çıkarımları ve tüm ödeme akışı testlerinde sorunsuz olarak kullanılabilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::createMockItem
- **params**: id: string, quantity: number, productPrice: number, unitPrice?: number
- **ic_degiskenler**:
  - `id` — Girdi olarak alınan ürün kimliği, oluşturulan CartItem nesnesinin id alanına atanır
  - `quantity` — Girdi olarak alınan ürün adedi, oluşturulan CartItem nesnesinin quantity alanına atanır
  - `productPrice` — Girdi olarak alınan ana ürün fiyatı, CartItem içindeki product.price alanına atanır
  - `unitPrice` — Opsiyonel girdi olarak alınan birim fiyat, oluşturulan CartItem nesnesinin unitPrice alanına atanır
- **Dönüş**: CartItem tipinde mock sepet öğesi nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::describe<main_test_suite>
- **params**: (yok)
- **ic_degiskenler**:
  - `it` — Vitest test tanımlama fonksiyonu, 5 adet test senaryosu oluşturmak için kullanılır
  - `expect` — Vitest doğrulama (assertion) fonksiyonu, tüm testlerde sonuçları kontrol etmek için kullanılır
  - `getPriceHashLocal` — Test edilen checkoutHelpers modülündeki ana fonksiyon, tüm test senaryolarında çağrılır
  - `createMockItem` — Testlerde kullanılan geçerli CartItem nesneleri üreten yerleşik yardımcı fonksiyon
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::it<empty_list_test>
- **params**: (yok)
- **ic_degiskenler**:
  - `expect` — Boş dizi girişi için dönen sonucun doğruluğunu kontrol eden Vitest assertion fonksiyonu
  - `getPriceHashLocal` — Test edilen fonksiyon, boş dizi parametresi ile çağrılır
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::it<unit_price_fallback_test>
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — İki adet mock sepet öğesinden oluşan test dizisi; birinde unitPrice belirtilmiş, diğerinde belirtilmemiş
  - `result` — getPriceHashLocal(items) çağrısından dönen string formatlı sonuç değeri
  - `parsed` — JSON.parse(result) ile nesneye dönüştürülen sonuç, doğrulama sürecinde kullanılır
  - `createMockItem` — Test için mock sepet öğeleri üreten yardımcı fonksiyon
  - `getPriceHashLocal` — Test edilen fonksiyon, test dizisi parametresi ile çağrılır
  - `expect` — unitPrice önceliği ve varsayılan kullanımının doğru çalıştığını doğrulayan assertion fonksiyonu
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::it<decimal_rounding_test>
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — Ondalıklı fiyatlara sahip iki adet mock sepet öğesinden oluşan test dizisi
  - `result` — getPriceHashLocal(items) çağrısından dönen string formatlı sonuç
  - `parsed` — JSON.parse ile nesneye dönüştürülen sonuç, yuvarlama doğrulamasında kullanılır
  - `createMockItem` — Mock sepet öğeleri üreten yardımcı fonksiyon
  - `getPriceHashLocal` — Test edilen fonksiyon, test dizisi parametresi ile çağrılır
  - `expect` — Ondalıklı fiyatların doğru yuvarlandığını doğrulayan assertion fonksiyonu
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::it<id_sort_test>
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — ID'leri ters sırada eklenen üç adet mock sepet öğesinden oluşan test dizisi
  - `result` — getPriceHashLocal(items) çağrısından dönen string formatlı sonuç
  - `parsed` — JSON.parse ile nesneye dönüştürülen sonuç, sıralama doğrulamasında kullanılır
  - `createMockItem` — Mock sepet öğeleri üreten yardımcı fonksiyon
  - `getPriceHashLocal` — Test edilen fonksiyon, test dizisi parametresi ile çağrılır
  - `expect` — Öğelerin ID'ye göre alfabetik sıralandığını doğrulayan assertion fonksiyonu
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\__tests__\checkoutHelpers.test.ts::it<duplicate_id_test>
- **params**: (yok)
- **ic_degiskenler**:
  - `items` — Aynı ID'ye sahip iki adet mock sepet öğesinden oluşan test dizisi
  - `result` — getPriceHashLocal(items) çağrısından dönen string formatlı sonuç
  - `parsed` — JSON.parse ile nesneye dönüştürülen sonuç, tüm doğrulamalarda kullanılır
  - `parsed[0].id` — Sonuç listesindeki ilk öğenin ID değeri, tekrarlanan ID'nin korunduğunu doğrulamak için okunur
  - `parsed[1].id` — Sonuç listesindeki ikinci öğenin ID değeri, tekrarlanan ID'nin korunduğunu doğrulamak için okunur
  - `units` — Tüm sonuç öğelerinin unit fiyatlarından oluşan dizi, fiyatların doğru aktarıldığını kontrol etmek için kullanılır
  - `createMockItem` — Mock sepet öğeleri üreten yardımcı fonksiyon
  - `getPriceHashLocal` — Test edilen fonksiyon, test dizisi parametresi ile çağrılır
  - `expect` — Aynı ID'li öğelerin kaybolmadan doğru işlendiğini doğrulayan assertion fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\utils\__tests__\checkoutHelpers.test.ts
  function: src\utils\__tests__\checkoutHelpers.test.ts::createMockItem

---

## DISA AKTARILANLAR (EXPORTS)
  export: createMockItem