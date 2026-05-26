---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: 0f81e1692b39b882
generated_at: 2026-05-26T11:42:56Z
---

## Genel Bakış
`useCheckoutPayment` modülü, VentHub HVAC uygulamasının ödeme adımını yöneten tek bir React hook'udur. Sepet içeriği, kullanıcı bilgileri ve sunucu tarafı fiyatlandırma gibi dış bağımlılıkları alarak, toplam tutarı hesaplar, fiyatları günceller ve ödeme tamamlandığında sepeti temizler. Böylece ödeme sürecinin bütünlüğü ve tutarlılığı tek bir noktadan kontrol edilir.  

## Fonksiyon Grupları
### Ödeme Akışı Orkestratörü  
Bu grup, ödeme sürecinin tüm adımlarını bir araya getirir; gelen verileri doğrular, tutarı hesaplar, fiyatları günceller ve işlem sonunda sepeti temizler.  
- useCheckoutPayment  

### Yardımcı Veri ve İşlem Sağlayıcıları  
Ödeme orkestratörünün ihtiyaç duyduğu dış bağımlılıkları içerir; sepet öğeleri, kullanıcı bilgileri ve fiyatlandırma/temizleme fonksiyonları bu grup altında toplanır.  
- items, user, getCartTotal, applyServerPricing, clearCart

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `items` parametresi sağlanmazsa, ödeme işlemi başlatılamaz ve hook hata verir.  
**Aksiyom 2**: Eğer `getCartTotal` fonksiyonu tanımlı değilse, sepet tutarı hesaplanamaz, bu yüzden ödeme tutarı belirlenemez ve hook çalışmaz.  
**Aksiyom 3**: Eğer `user` nesnesi eksik ya da geçersizse, kimlik doğrulama ve faturalama bilgileri alınamaz; bu durumda ödeme süreci durur.  
**Aksiyom 4**: Eğer `clearCart` fonksiyonu sağlanmazsa, ödeme tamamlandıktan sonra sepet temizlenemez ve kullanıcı aynı sepeti tekrar görür.  
**Aksiyom 5**: Eğer `applyServerPricing` fonksiyonu mevcut değilse, sunucu tarafı fiyatlandırma güncellemeleri uygulanamaz; bu da fiyat tutarsızlıklarına yol açar.  
**Aksiyom 6**: Eğer `UseCheckoutPaymentProps` tipindeki bir nesne (`or` anahtarıyla) sağlanmazsa, hook’un beklediği tüm bağımlılıkların (items, getCartTotal, user, clearCart, applyServerPricing) ayrı ayrı geçirilmesi gerekir; aksi takdirde tip uyumsuzluğu hatası oluşur.  

*Domain‑specific bir eşik değeri, kabul kriteri veya başka bir özel kural mevcut değildir; tüm gereksinimler fonksiyon imzasındaki parametrelerin varlığı ve doğru tipte olmasıyla sınırlıdır.*

---

## FONKSIYON DETAYLARI

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
- **params**: `({ items, getCartTotal, user, clearCart, applyServerPricing, orchestrator, couponCode, t }: UseCheckoutPaymentProps)`
- **ic_degiskenler**:
  - `router` — `useRouter()` ile oluşturulan Next.js yönlendirici, sayfa yönlendirmeleri için kullanılır.
  - `loading` — ödeme işlemi sırasında gösterilen yükleme durumu (`useState(false)`).
  - `setLoading` — `loading` değerini güncelleyen setter.
  - `iyzToken` — İyzico’dan alınan ödeme token’ı (`useState('')`).
  - `setIyzToken` — `iyzToken` değerini güncelleyen setter.
  - `paymentUrl` — İyzico ödeme sayfasının URL’i (`useState('')`).
  - `setPaymentUrl` — `paymentUrl` değerini güncelleyen setter.
  - `orderId` — oluşturulan siparişin kimliği (`useState('')`).
  - `setOrderId` — `orderId` değerini güncelleyen setter.
  - `convId` — İyzico konuşma kimliği (`useState('')`).
  - `setConvId` — `convId` değerini güncelleyen setter.
  - `iyzScriptLoaded` — dış script’in yüklendiği durum (sabit `false`).
  - `formReady` — ödeme formunun hazır olup olmadığını gösteren flag (`useState(false)`).
  - `setFormReady` — `formReady` değerini güncelleyen setter.
  - `progressPct` — ödeme sürecindeki ilerleme yüzdesi (`useState(20)`).
  - `setProgressPct` — `progressPct` değerini güncelleyen setter.
  - `paymentFrameContent` — iframe içeriği (sabit boş string).
  - `isTest` — test ortamı kontrolü (`'vi' in globalThis`).
- **Dönüş**: Hook’un döndürdüğü nesne  
  `{ loading, iyzToken, paymentUrl, orderId, convId, iyzScriptLoaded, formReady, progressPct, paymentFrameContent, setFormReady, setProgressPct, initiatePayment }`  
  (yan etkileri: state güncellemeleri, router yönlendirmesi, dış script yüklenmesi).

---

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::initiatePayment
- **params**: `()` (hiç parametre almaz)
- **ic_degiskenler**:
  - `authoritativeTotal` — `getCartTotal()` sonucu, gerekirse sunucu doğrulaması sonrası güncellenen tutar.
  - `validation` — `validateServerCart({ userId: user?.id })` çağrısının sonucu, sunucu‑tarafı sepet doğrulaması.
  - `localHash` — `getPriceHashLocal(items)` ile hesaplanan yerel fiyat hash’i.
  - `serverHash` — `getPriceHashServer(validation?.items, items)` ile hesaplanan sunucu fiyat hash’i.
  - `requestData` — `buildPaymentRequest({...})` ile oluşturulan ödeme isteği nesnesi.
  - `data` — `supabase.functions.invoke('iyzico-payment', { body: requestData })` yanıtının `data` kısmı.
  - `error` — aynı çağrının olası hatası.
  - `d` — `data.data` içindeki ödeme yanıtı nesnesi.
- **Dönüş**: `boolean`  
  - `true` → ödeme başarılı bir şekilde başlatıldı (token alındı veya doğrudan ödeme sayfasına yönlendirme yapıldı).  
  - `false` → bir hata oluştu; hata mesajı toast ile gösterilir.

---

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useEffect (order‑status polling)
- **params**: `()` (useEffect callback, parametresiz)
- **ic_degiskenler**:
  - `timer` — `setInterval` ile oluşturulan periyodik kontrol kimliği.
  - `data` — `supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle()` sorgusunun yanıtı.
- **Dönüş**: `void` (useEffect, yan etkileri: interval başlatma, sipariş durumu “paid” olduğunda intervali temizleme, sepeti temizleme ve `router.push` ile başarı sayfasına yönlendirme).

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutPayment