---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\hooks\useCheckoutPayment.ts
skeleton_hash: 7c9f7f0e9a6b4107
entity_hashes:
  func:ServerValidationUnavailableError:constructor: ac305f0c901ddac7
  func:useCheckoutPayment: a8bb41b15d097162
  overview: 9288bb99d7e80dbc
generated_at: 2026-08-27T08:35:38Z
---

## Genel Bakış
`useCheckoutPayment`, ödeme sürecinin tüm akışını yöneten merkezi bir React hook'udur. Sepet verileri, kullanıcı bilgileri ve dış fonksiyonları bir araya getirerek tutarlı bir ödeme deneyimi sunar. Sunucu taraflı fiyatlandırma doğrulaması sırasında oluşabilecek hataları yakalamak için özel bir hata sınıfı içerir.

## Fonksiyon Grupları
### Ödeme Süreci Orkestratörü
Ödeme akışının tüm aşamalarını koordine eder; sepet içeriğini, kullanıcı bilgisini ve fiyatlandırma fonksiyonlarını birleştirerek ödeme işlemini yürütür.
- useCheckoutPayment

### Hata Yönetimi
Sunucu doğrulama hizmetine erişilemediğinde fırlatılacak özel hata sınıfını tanımlar.
- ServerValidationUnavailableError

### Dış Bağımlılıklar (Parametreler)
Hook'un doğru çalışması için gereken girdiler ve geri çağırma fonksiyonları; sepet içeriği, kullanıcı bilgisi, fiyatlandırma ve temizleme mekanizmaları bu gruba dahildir.
- items, user, getCartTotal, applyServerPricing, clearCart

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ödeme sürecini orkestre etmek için dış bağımlılıklara dayanır.

[Aksiyom 1]: Eğer `items` parametresi yoksa, sepet içeriği bilinmiyor durumda olur ve ödeme akışı başlatılamaz.

[Aksiyom 2]: Eğer `getCartTotal` fonksiyonu yoksa, sepet toplamı hesaplanamaz ve fiyat doğrulaması yapılamaz.

[Aksiyom 3]: Eğer `user` parametresi yoksa, kullanıcı bilgileri bilinmiyor durumda olur ve ödeme süreci kullanıcı bağlamından yoksun çalışır.

[Aksiyom 4]: Eğer `clearCart` fonksiyonu yoksa, ödeme başarıyla tamamlansa bile sepet temizlenemez.

[Aksiyom 5]: Eğer `applyServerPricing` fonksiyonu yoksa, sunucu tarafı fiyatlandırma uygulanamaz; `ServerValidationUnavailableError` bu durumda fırlatılabilir (constructor'ı `cause` parametresi alır).

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

### constructor
**Ne yapar**: `ServerValidationUnavailableError` sınıfının yapıcı metodudur. Sunucu doğrulamasının kullanılamadığı durumlarda fırlatılmak üzere özel bir hata nesnesi oluşturur. Hata mesajını `SERVER_VALIDATION_UNAVAILABLE` ön ekiyle birlikte verilen `cause` bilgisinden türetir.

**Nasıl yapar**: Üst sınıfın (`Error`) yapıcı metodunu `super()` ile çağırarak hata mesajını iletir. Mesaj oluşturulurken `cause` parametresinin bir `Error` instance'ı olup olmadığı kontrol edilir; eğer öyleyse `cause.message` kullanılır, değilse `String(cause)` ile metin temsilini alır. Ardından `this.name` özelliğini `'ServerValidationUnavailableError'` olarak ayarlayarak hatanın tür adını belirler.

**Parametreler**:
- cause: unknown — Hatanın kaynağını temsil eden değer. Bir `Error` nesnesi olabileceği gibi herhangi bir tip de olabilir; mesaj oluşturulurken türüne göre farklı biçimlendirme uygulanır.

**Dönüş**: Bilinmiyor. Kaynak kodda dönüş tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../lib/order::validateServerCart
- import: ../utils/checkoutHelpers::getPriceHashLocal
- import: ../utils/checkoutHelpers::getPriceHashServer
- import: @/lib/errorReporter::reportError
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/cart::type { CartItem }
- import: @supabase/supabase-js::type { User }
- import: next/navigation::useRouter
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### UseCheckoutPaymentProps
- `items: CartItem[]`
- `getCartTotal: () => number`
- `user: User | null`
- `clearCart: (options?: { silent: boolean }) => void`
- `applyServerPricing: (items: { product_id: string, unit_price: number | null }[]) => void`
- `orchestrator: {`
- `couponCode: string | null`
- `t: (key: string) => string`

---

## TYPE ALIASES

### PaymentPhase
Ödeme yüzeyinin GÖRÜNÜR durumu — cetvel §4'ün (yüzey sözleşmesi) kod karşılığı. NİÇİN AYRI BİR AŞAMA ALANI (T080-A · 2026-08-18): eskiden görünen şey `loading` ve `formReady` ikilisinden türetiliyordu ve iki ölümcül kusur vardı: 1. `setFormReady` **hiçbir yerde çağrılmıyordu** → `formReady` kalıcı `
```typescript
type PaymentPhase = /** Henüz başlatılmadı. */
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: useCheckoutPayment.ts::ServerValidationUnavailableError.constructor
- **params**: `cause: unknown`
- **ic_degiskenler**:
  - `cause` — super çağrısında `cause.message` (Error ise) veya `String(cause)` ile mesaj oluşturmak için kullanılır
- **Dönüş**: yok (constructor)

### [N2_NASIL] AST Pointer: useCheckoutPayment.ts::useCheckoutPayment
- **params**: `items`, `getCartTotal`, `user`, `clearCart`, `applyServerPricing`, `orchestrator`, `couponCode`, `t` (UseCheckoutPaymentProps tipinden destructure edilmiş)
- **ic_degiskenler**:
  - `router` — `useRouter()` ile alınan Next.js router nesnesi; ödeme başarılı olduğunda `/payment-success` sayfasına yönlendirmek için kullanılır
  - `loading` — `useState(false)` ile tanımlı boolean; ödeme işleminin devam edip etmediğini gösterir
  - `setLoading` — `loading` state'inin setter fonksiyonu
  - `iyzToken` — `useState('')` ile tanımlı string; iyzico PSP token'ını tutar
  - `setIyzToken` — `iyzToken` state'inin setter fonksiyonu
  - `paymentUrl` — `useState('')` ile tanımlı string; PSP ödeme sayfası URL'ini tutar
  - `setPaymentUrl` — `paymentUrl` state'inin setter fonksiyonu
  - `orderId` — `useState('')` ile tanımlı string; sipariş kimliğini tutar
  - `setOrderId` — `orderId` state'inin setter fonksiyonu
  - `convId` — `useState('')` ile tanımlı string; PSP conversation ID'sini tutar
  - `setConvId` — `convId` state'inin setter fonksiyonu
  - `formReady` — `useState(false)` ile tanımlı boolean; ödeme formunun gerçekten çıktığını gösterir
  - `setFormReady` — `formReady` state'inin setter fonksiyonu
  - `progressPct` — `useState(20)` ile tanımlı number; yükleme ilerleme yüzdesini tutar (başlangıç 20)
  - `setProgressPct` — `progressPct` state'inin setter fonksiyonu
  - `paymentFrameContent` — `useState('')` ile tanımlı string; PSP'nin döndürdüğü gömülü form HTML içeriğini tutar
  - `setPaymentFrameContent` — `paymentFrameContent` state'inin setter fonksiyonu
  - `phase` — `useState<PaymentPhase>('idle')` ile tanımlı PaymentPhase tipinde değer; ödeme akışının aşamasını tutar
  - `setPhase` — `phase` state'inin setter fonksiyonu
  - `errorMessage` — `useState('')` ile tanımlı string; kullanıcıya gösterilecek hata mesajını tutar
  - `setErrorMessage` — `errorMessage` state'inin setter fonksiyonu
  - `markFormReady` — `useCallback` ile tanımlı fonksiyon; form gerçekten çıktığında çağrılır, `formReady`'i true yapar, `phase`'i 'ready' yapar, `progressPct`'yi 100 yapar
  - `markFormFailed` — `useCallback` ile tanımlı fonksiyon; yüzey kurulamadığında çağrılır, `phase`'i 'error' yapar, `errorMessage`'i ayarlar, `reportError` ile hata raporlar
  - `initiatePayment` — async fonksiyon; ödeme işlemini başlatır (sunucu fiyat doğrulaması, ödeme isteği oluşturma, PSP çağrısı)
  - useEffect (sipariş durumu yoklaması) — `orderId` değiştiğinde her 3 saniyede bir `venthub_orders` tablosundan `payment_status` sorgusu yapan interval kurar; 'paid' olduğunda temizlik yapar ve başarılı sayfasına yönlendirir
- **Dönüş**: `{ loading, iyzToken, paymentUrl, orderId, convId, formReady, progressPct, paymentFrameContent, phase, errorMessage, markFormReady, markFormFailed, setFormReady, setProgressPct, initiatePayment }` — tüm state'ler ve fonksiyonlar

### [N3_NASIL] AST Pointer: useCheckoutPayment.ts::markFormReady (useCallback)
- **params**: yok
- **ic_degiskenler**: yok (dış scope'daki setter'lar doğrudan çağrılır: `setFormReady`, `setPhase`, `setProgressPct`)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: useCheckoutPayment.ts::markFormFailed (useCallback)
- **params**: `reason: string`
- **ic_degiskenler**: yok (dış scope'daki `setPhase`, `setErrorMessage`, `t`, `reportError` doğrudan çağrılır)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: useCheckoutPayment.ts::initiatePayment
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `authoritativeTotal` — `getCartTotal()` ile alınan başlangıç ödeme tutarı; sunucu fiyat doğrulaması sonrası `validation.totals?.subtotal` ile güncellenebilir
  - `validation` — `validateServerCart(supabase, { userId: user?.id })` ile alınan sunucu doğrulama sonucu; `.items` ve `.totals` alanlarına erişilir
  - `localHash` — `getPriceHashLocal(items)` ile hesaplanan yerel fiyat hash'i; sunucu hash'i ile karşılaştırılır
  - `serverHash` — `getPriceHashServer(validation.items, items)` ile hesaplanan sunucu fiyat hash'i; `localHash` ile eşleşmezse fiyat güncellenir
  - `buildPaymentRequest` — `await import('../views/checkout/buildPaymentRequest')` ile dynamic import edilen ödeme isteği oluşturma fonksiyonu
  - `requestData` — `buildPaymentRequest()` ile oluşturulan ödeme isteği verisi; `amount`, `items`, `customer`, `shipping`, `billing`, `sameAsShipping`, `userId`, `invoiceType`, `invoiceInfo`, `legalConsents`, `shippingMethod`, `couponCode` alanlarını içerir
  - `data` — `supabase.functions.invoke('iyzico-payment', { body: requestData })` yanıtının `data` alanı
  - `error` — `supabase.functions.invoke('iyzico-payment')` yanıtının `error` alanı; varsa throw edilir
  - `d` — `data.data`, PSP yanıtının iç verisi; `.orderId`, `.conversationId`, `.paymentPageUrl`, `.token`, `.checkoutFormContent` alanlarına erişilir
  - `err` — catch bloğunda yakalanan hata; `unknown` tipindedir
  - `i18nKey` — `err` nesnesinden çıkarılan i18n anahtarı (`err.i18nKey`); yoksa `null`
  - `msg` — `err instanceof Error` ise `err.message`, değilse `String(err)` ile elde edilen hata mesajı
  - `shown` — kullanıcıya gösterilecek hata mesajı; `i18nKey` varsa `t(i18nKey)`, yoksa `msg` veya `t('checkout.errors.paymentInit')`
- **Dönüş**: `boolean` (başarılı form yüklemede `true`, hata durumunda `false`) veya `undefined` (paymentPageUrl redirect'inde return edilmeden önce `window.location.href` atanır)

### [N6_NASIL] AST Pointer: useCheckoutPayment.ts::useEffect interval callback (anonim)
- **params**: yok
- **ic_degiskenler**:
  - `timer` — `setInterval(async () => {...}, 3000)` ile oluşturulan zamanlayıcı kimliği; `clearInterval(timer)` ile temizlenir
  - `data` — `supabase.from('venthub_orders').select('payment_status').eq('id', orderId).maybeSingle()` sorgusundan dönen veri; `data?.payment_status` kontrol edilir
- **Dönüş**: cleanup fonksiyonu (`() => clearInterval(timer)`)

### [N7_NASIL] AST Pointer: useCheckoutPayment.ts::setInterval async callback (anonim)
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.from('venthub_orders').select('payment_status').eq('id', orderId).maybeSingle()` sorgusundan dönen veri; `data?.payment_status === 'paid'` olduğunda temizlik yapılır ve yönlendirme gerçekleşir
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment
  class: src\hooks\useCheckoutPayment.ts::ServerValidationUnavailableError

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentPhase
  export: ServerValidationUnavailableError
  export: useCheckoutPayment