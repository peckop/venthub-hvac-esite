---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: f51625cf58c944a0
entity_hashes:
  func:ServerValidationUnavailableError:constructor: ac305f0c901ddac7
  func:useCheckoutPayment: a8bb41b15d097162
  overview: 9288bb99d7e80dbc
generated_at: 2026-08-26T07:14:12Z
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
**Ne yapar**: `ServerValidationUnavailableError` sınıfının yapıcı metodudur. Sunucu doğrulamasının kullanılamadığı durumlarda fırlatılmak üzere özel bir hata nesnesi oluşturur. Hata mesajını, verilen `cause` değerinden türeterek standart bir önek ile birlikte yapılandırır.

**Nasıl yapar**: Üst sınıfın (`super`) yapıcı metodunu çağırarak hata mesajını oluşturur. Mesaj, `SERVER_VALIDATION_UNAVAILABLE:` sabit metni ile `cause` parametresinin bir `Error` örneği olup olmadığına göre farklı biçimde birleştirilir: `cause` bir `Error` örneği ise `cause.message` özelliği kullanılır, aksi takdirde `String(cause)` ile metne dönüştürülür. Ardından `this.name` özelliği `'ServerValidationUnavailableError'` sabit değerine atanarak hata nesnesinin adı belirlenir.

**Parametreler**:
- cause: unknown — Hatanın kaynağını temsil eden değer. Bir `Error` örneği olabileceği gibi herhangi bir başka türde değer de olabilir; mesaj oluşturulurken türüne göre işleme tabi tutulur.

**Dönüş**: Kaynakta dönüş tipi belirtilmemiştir.

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

### [N1_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::ServerValidationUnavailableError.constructor
- **params**: `cause: unknown`
- **ic_degiskenler**: yok
- **Dönüş**: yok (constructor — `super()` çağrısı yapar, `this.name` atar)

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useCheckoutPayment
- **params**: `items`, `getCartTotal`, `user`, `clearCart`, `applyServerPricing`, `orchestrator`, `couponCode`, `t`
- **ic_degiskenler**:
  - `router` — `useRouter()` ile alınan Next.js router nesnesi; ödeme başarılı olduğunda `/payment-success` sayfasına yönlendirme yapmak için kullanılır
  - `loading` / `setLoading` — ödeme işleminin devam edip etmediğini gösteren boolean state; `initiatePayment` başında `true`, `finally` bloğunda `false` yapılır
  - `iyzToken` / `setIyzToken` — iyzico PSP'nin döndürdüğü token string'i; gömülü form senaryosunda `d.token` değerinden atanır
  - `paymentUrl` / `setPaymentUrl` — PSP'nin döndürdüğü ödeme sayfası URL'i; `d.paymentPageUrl` değerinden atanır
  - `orderId` / `setOrderId` — oluşturulan sipariş kimliği; `d.orderId` değerinden atanır, `useEffect` yoklamasında sipariş durumu sorgulamak için kullanılır
  - `convId` / `setConvId` — iyzico conversation ID; `d.conversationId` değerinden atanır
  - `formReady` / `setFormReady` — ödeme formunun gerçekten yüklendiğini gösteren boolean state; `markFormReady` tarafından `true` yapılır
  - `progressPct` / `setProgressPct` — yükleme ilerleme yüzdesi (0-100); başlangıçta `20`, form yüklenirken `60`, hazır olduğunda `100`
  - `paymentFrameContent` / `setPaymentFrameContent` — PSP'nin döndürdüğü form HTML içeriği; `d.checkoutFormContent` değerinden atanır
  - `phase` / `setPhase` — ödeme aşaması (`PaymentPhase` tipinde); `'idle'` → `'starting'` → `'formLoading'` → `'ready'` veya `'error'`
  - `errorMessage` / `setErrorMessage` — kullanıcıya gösterilecek hata mesajı string'i; hata durumlarında `t()` ile çevrilmiş mesaj atanır
  - `markFormReady` — `useCallback` ile sarılı fonksiyon; form yüklendiğinde çağrılır, `formReady`'i `true`, `phase`'i `'ready'`, `progressPct`'yi `100` yapar
  - `markFormFailed` — `useCallback` ile sarılı fonksiyon; form yüklenemediğinde çağrılır, `phase`'i `'error'` yapar, `reportError` ile hata raporlar
  - `initiatePayment` — async fonksiyon; sunucu fiyat doğrulaması yapar, `buildPaymentRequest` ile istek oluşturur, `supabase.functions.invoke('iyzico-payment')` çağrısı yapar, başarılı olursa sipariş bilgilerini state'e ve `localStorage`'a yazar
  - useEffect (sipariş durumu yoklaması) — `orderId` değiştiğinde tetiklenir, 3 saniyelik interval ile `venthub_orders` tablosundan `payment_status` sorgular, `'paid'` olduğunda `clearCart()` çağırır ve `/payment-success` sayfasına yönlendirir
- **Dönüş**: nesne — `{ loading, iyzToken, paymentUrl, orderId, convId, formReady, progressPct, paymentFrameContent, phase, errorMessage, markFormReady, markFormFailed, setFormReady, setProgressPct, initiatePayment }`

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::markFormReady
- **params**: yok
- **ic_degiskenler**: yok (sadece setter çağrıları var)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::markFormFailed
- **params**: `reason: string`
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::initiatePayment
- **params**: yok
- **ic_degiskenler**:
  - `authoritativeTotal` — `getCartTotal()` ile alınan sepet toplamı; sunucu fiyat doğrulaması sonrası `validation.totals?.subtotal` ile güncellenebilir
  - `validation` — `validateServerCart(supabase, { userId: user?.id })` sonucu; sunucu tarafı sepet doğrulaması verisi
  - `localHash` — `getPriceHashLocal(items)` ile hesaplanan istemci tarafı fiyat hash'i
  - `serverHash` — `getPriceHashServer(validation.items, items)` ile hesaplanan sunucu tarafı fiyat hash'i; `localHash` ile eşleşmezse fiyat güncellenir
  - `buildPaymentRequest` — `await import('../views/checkout/buildPaymentRequest')` ile dinamik olarak yüklenen fonksiyon
  - `requestData` — `buildPaymentRequest()` çağrısının döndürdüğü ödeme istek verisi; `amount`, `items`, `customer`, `shipping`, `billing`, `sameAsShipping`, `userId`, `invoiceType`, `invoiceInfo`, `legalConsents`, `shippingMethod`, `couponCode` alanlarını içerir
  - `data` — `supabase.functions.invoke('iyzico-payment', { body: requestData })` sonucunun `data` alanı
  - `error` — `supabase.functions.invoke` sonucunun `error` alanı; varsa throw edilir
  - `d` — `data.data` alt nesnesi; PSP yanıtını içerir
  - `d.orderId` — PSP'nin döndürdüğü sipariş kimliği; `localStorage`'a `PENDING_ORDER_KEY` ile yazılır
  - `d.conversationId` — PSP'nin döndürdüğü conversation ID; `localStorage`'a yazılır
  - `d.paymentPageUrl` — PSP'nin döndürdüğü ödeme sayfası URL'i; token yoksa `window.location.href` ile yönlendirme yapılır
  - `d.token` — PSP'nin döndürdüğü token; `setIyzToken` ile state'e atanır
  - `d.checkoutFormContent` — PSP'nin döndürdüğü form HTML içeriği; `setPaymentFrameContent` ile state'e atanır
  - `err` — `catch` bloğundaki hata nesnesi; `i18nKey` özelliği varsa çevrilmiş mesaj gösterilir
  - `i18nKey` — `err` nesnesinden çıkarılan i18n anahtarı; `err.i18nKey` varsa `String()` ile dönüştürülür, yoksa `null`
  - `msg` — `err instanceof Error` ise `err.message`, değilse `String(err)`
  - `shown` — kullanıcıya gösterilecek mesaj; `i18nKey` varsa `t(i18nKey)`, yoksa `msg || t('checkout.errors.paymentInit')`
- **Dönüş**: `boolean` — başarılıysa `true`, hata durumunda `false`

### [N6_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useEffect (sipariş durumu yoklaması)
- **params**: yok (dışarıdan `orderId`, `clearCart`, `router` kullanır)
- **ic_degiskenler**:
  - `timer` — `setInterval` ile oluşturulan zamanlayıcı ID'si; `clearInterval` ile temizlenir
  - `data` — `supabase.from('venthub_orders').select('payment_status').eq('id', orderId).maybeSingle()` sorgu sonucu
  - `data?.payment_status` — siparişin ödeme durumu; `'paid'` olduğunda zamanlayıcı durdurulur, `localStorage` temizlenir, sepet boşaltılır ve ödeme başarı sayfasına yönlendirilir
- **Dönüş**: cleanup fonksiyonu — `return () => clearInterval(timer)`

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