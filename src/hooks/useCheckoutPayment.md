---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: 68bcfa4f5c8e469e
entity_hashes:
  func:useCheckoutPayment: a8bb41b15d097162
  overview: e0e6f5e6a2896df3
generated_at: 2026-05-29T18:49:02Z
---

## Genel Bakış
`useCheckoutPayment` modülü, VentHub HVAC uygulamasının ödeme sürecin yöneten tek bir React hook'udur. Sepet içeriği, kullanıcı bilgileri ve sunucu tarafı fiyatlandırma gibi dış bağımlılıkları alarak, toplam tutarı hesaplar, fiyatları günceller ve ödeme tamamlandığında sepeti temizler. Böylece ödeme sürecinin bütünlüğü ve tutarlılığı tek bir noktadan kontrol edilir.

## Fonksiyon Grupları
### Ödeme Akışı Orkestratörü  
Bu grup, ödeme sürecinin tüm adımlarını bir araya getirir; gelen verileri doğrular, tutarı hesaplar, fiyatları günceller ve işlem sonunda sepeti temizler.  
- useCheckoutPayment

### Yardımcı Veri ve İşlem Sağlayıcıları  
Ödeme orkestratörünün ihtiyaç duyduğu dış bağımlılıkları içerir; sepet öğeleri, kullanıcı bilgileri ve fiyatlandırma/temizleme fonksiyonları bu grup altında toplanır.  
- items, user, getCartTotal, applyServerPricing, clearCart

---

## AXIOMS – Mimari Varsayımlar

Bu hook, ödeme sürecinin yönetimini üstlenir ve dışarıdan sağlanan bağımlılıklar üzerinde çalışır. Doğru işleyiş için aşağıdaki koşulların karşılanması gerekmektedir.

[Aksiyom 1]: Eğer `items` parametresi geçerli bir dizi (array) verisi değilse (null, undefined veya başka bir tipte ise), sepet öğeleri işlenemez ve ödeme süreci başlatılamaz.

[Aksiyom 2]: Eğer `getCartTotal` parametresi çağrılabilir bir fonksiyon değilse, sepet toplam tutarı hesaplanamaz ve sipariş özeti oluşturulamaz.

[Aksiyom 3]: Eğer `clearCart` parametresi çağrılabilir bir fonksiyon değilse, başarılı ödeme işleminden sonra sepetteki ürünler temizlenemez; bu durum sepetteki ürünlerin kullanıcının bir sonraki alışveriş seansına kadar korunmasına yol açar.

[Aksiyom 4]: Eğer `applyServerPricing` parametresi çağrılabilir bir fonksiyon değilse, sunucu tarafı fiyatlandırma doğrulaması yapılamaz; bu durum yerel veya eski fiyatların kullanılmasına neden olabilir.

[Aksiyom 5]: Eğer `user` parametresi null veya undefined ise, ödeme süreci başlatılamaz; çünkü siparişin kullanıcıya bağlanması ve ödeme işleminin yürütülmesi için kullanıcı kimliği zorunludur.

[Aksiyom 6]: Eğer `items` dizisi boş ise (toplam öğe sayısı 0), sepet toplamı hesaplanamaz ve ödeme butonu devre dışı kalır.

---

## FONKSİYON DETAYLARI

### useCheckoutPayment
**Ne yapar**: Checkout sürecinde ödeme akışını yönetir; sepet doğrulamasını yapar, sunucu tarafı fiyatlandırmasını uygular, Iyzico ödeme geçidiyle entegrasyon kurar ve ödeme sonucunu izler.  

**Nasıl yapar**: Gelen `props` nesnesindeki sepet öğelerini ve toplam tutarı kontrol eder, gerekirse sunucu tarafı fiyatlandırma fonksiyonunu çalıştırır, Iyzico formunu başlatır ve ödeme tamamlandığında sepeti temizler. İşlem sırasında bir loading durumu, ödeme token’ı ve yönlendirme URL’si gibi bilgiler içeren bir durum nesnesi döndürülür.  

**Parametreler**:
- `items`: any — Checkout sırasında işlenen mevcut sepet öğeleri.
- `getCartTotal`: function — Sepet toplam tutarını döndüren, çağrılabilir bir fonksiyon.
- `user`: any — Kimliği doğrulanmış Supabase kullanıcı nesnesi (varsa).
- `clearCart`: function — Başarılı ödeme sonrasında sepeti boşaltmak için kullanılan fonksiyon.
- `applyServerPricing`: function — Sunucu tarafı fiyat doğrulaması ve güncellemesi yapan fonksiyon.
- `or`: UseCheckoutPaymentProps — Tüm parametreleri kapsayan tip tanımı (props nesnesi).

**Dönüş**: object — `{ loading: boolean, token: string, url: string, initiatePayment: function, ... }` şeklinde, ödeme durumunu (yükleme, token, yönlendirme URL’si) ve ödeme başlatma işlevini içeren bir nesne.

---

## INTERFACES

### UseCheckoutPaymentProps
- `items: CartItem[]`
- `getCartTotal: () => number`
- `user: User | null`
- `clearCart: (options?: { silent: boolean }) => void`
- `applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void`
- `orchestrator: {`
- `couponCode: string | null`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useCheckoutPayment
- **params**: (`items`, `getCartTotal`, `user`, `clearCart`, `applyServerPricing`, `orchestrator`, `couponCode`, `t`)
- **ic_degiskenler**:
  - `router` — useRouter hookundan dönen yönlendirme nesnesi, sayfa geçişleri için kullanılır
  - `loading` — useState ile tanımlanan boolean, ödeme sürecinin yüklenme durumunu tutar
  - `iyzToken` — useState ile tanımlanan string, iyzico ödeme token'ını tutar
  - `paymentUrl` — useState ile tanımlanan string, iyzico ödeme sayfası URL'ini tutar
  - `orderId` — useState ile tanımlanan string, sipariş numarasını tutar
  - `convId` — useState ile tanımlanan string, iyzico konuşma ID'sini tutar
  - `iyzScriptLoaded` — useState ile tanımlanan boolean, iyzico scriptinin yüklenip yüklenmediğini tutar (hiç set edilmez)
  - `formReady` — useState ile tanımlanan boolean, formun hazır olup olmadığını tutar
  - `progressPct` — useState ile tanımlanan number, ilerleme yüzdesini tutar (başlangıç: 20)
  - `paymentFrameContent` — useState ile tanımlanan string, ödeme frame içeriğini tutar (hiç set edilmez)
  - `isTest` — globalThis'de 'vi' olup olmadığını kontrol eden boolean, test ortamı tespiti yapar
  - `initiatePayment` — async fonksiyon, ödeme sürecini başlatır
- **Dönüş**: `{ loading, iyzToken, paymentUrl, orderId, convId, iyzScriptLoaded, formReady, progressPct, paymentFrameContent, setFormReady, setProgressPct, initiatePayment }` (object)

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::initiatePayment
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `authoritativeTotal` — getCartTotal() ile alınan sepet toplamı, sunucu doğrulamasından sonra güncellenebilir
  - `validation` — validateServerCart() ile sunucu tarafı sepet doğrulama sonucu
  - `localHash` — getPriceHashLocal(items) ile yerel sepet için fiyat hash'i
  - `serverHash` — getPriceHashServer(validation?.items, items) ile sunucu tarafı fiyat hash'i
  - `buildPaymentRequest` — Dinamik import ile yüklenen ödeme isteği oluşturma fonksiyonu
  - `requestData` — buildPaymentRequest() ile oluşturulan iyzico ödeme isteği verisi
  - `data` — supabase.functions.invoke() yanıtındaki veri nesnesi
  - `error` — supabase.functions.invoke() yanıtındaki hata nesnesi
  - `d` — data.data objesi, iyzico yanıtının içeriği
  - `msg` — yakalanan hatanın mesajı
- **Dönüş**: `true` (başarılı) veya `false` (hatalı) boolean

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` — setInterval ile oluşturulan zamanlayıcı ID'si, periyodik sipariş durumu kontrolü için kullanılır
- **Dönüş**: Cleanup fonksiyonu `() => clearInterval(timer)` veya `undefined` (orderId yoksa)

### [N4_NASIL] AST Pointer: src/hooks/useCheckpointPayment.ts::setIntervalCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — supabase.from('venthub_orders').select('status') sorgusundan dönen sipariş durumu verisi
- **Dönüş**: `undefined` (yan etkiler: clearCart() çağırır, router.push() ile yönlendirme yapar)

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutPayment