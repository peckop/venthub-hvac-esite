---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: f8d5db6ffdf7b4b1
entity_hashes:
  func:useCheckoutPayment: a8bb41b15d097162
  overview: 62578f63e914fc17
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış
`useCheckoutPayment`, ödeme sürecinin tüm akışını yöneten merkezi bir React hook'udur. Sepet verileri, kullanıcı bilgileri ve dış fonksiyonları bir araya getirerek tutarlı bir ödeme deneyimi sunar.

## Fonksiyon Grupları
### Ödeme Süreci Orkestratörü
Ödeme akışının tüm aşamalarını koordine eder; verileri toplar, hesaplamaları yapar ve işlemleri tetikler.
- `useCheckoutPayment`

### Dış Bağımlılıklar (Parametreler)
Hook'un doğru çalışması için gereken girdiler ve geri çağırma fonksiyonları; sepet içeriği, kullanıcı bilgisi, fiyatlandırma ve temizleme mekanizmaları bu gruba dahildir.
- `items`, `user`, `getCartTotal`, `applyServerPricing`, `clearCart`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ödeme sürecini yöneten bir React hook'u olup, çalışması için several zorunlu girdilere ve dış fonksiyonlara bağımlıdır.

[Aksiyom 1]: Eğer `items` (sepet ürünleri) sağlanmazsa, ödeme süreci başlatılamaz ve sepet içeriği boş muamelesi görür.

[Aksiyom 2]: Eğer `getCartTotal` fonksiyonu sağlanmazsa, sepet toplamı hesaplanamaz ve sipariş özeti oluşturulamaz.

[Aksiyom 3]: Eğer `user` (kullanıcı bilgisi) sağlanmazsa, ödeme işlemi kullanıcı doğrulaması olmadan yürütülemez.

[Aksiyom 4]: Eğer `clearCart` fonksiyonu sağlanmazsa, başarılı ödeme sonrasında sepet temizlenemez ve eski sepet öğeleri korunur.

[Aksiyom 5]: Eğer `applyServerPricing` fonksiyonu sağlanmazsa, sunucu taraflı fiyatlandırma doğrulaması yapılamaz ve yalnızca istemci tarafı fiyatlar kullanılabilir.

[Aksiyom 6]: Eğer `UseCheckoutPaymentProps` yapısı geçerli bir formatta sağlanmazsa, hook'un prop'ları parse edilemez ve çalışma zamanı hatası oluşur.

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
- **params**: (`items` — sepet ürünleri dizisi, `getCartTotal` — sepet toplamını hesaplayan fonksiyon, `user` — Supabase User nesnesi, `clearCart` — sepeti temizleyen fonksiyon, `applyServerPricing` — sunucu fiyatlarını uygulayan fonksiyon, `orchestrator` — checkout orchestrator nesnesi, `couponCode` — kupon kodu stringi, `t` — çeviri fonksiyonu)
- **ic_degiskenler**:
  - `router` — useRouter() hook'undan dönen Next.js router nesnesi, sayfa yönlendirmeleri (router.push) için kullanılır
  - `loading` — useState(false), ödeme işlemi devam ederken true olur, UI'da yüklenme göstergesi kontrol eder
  - `iyzToken` — useState(''), iyzico ödeme sayfası token'ını tutar
  - `paymentUrl` — useState(''), iyzico ödeme sayfası URL'ini tutar
  - `orderId` — useState(''), oluşturulan sipariş ID'sini tutar, polling ve dönüş verisinde kullanılır
  - `convId` — useState(''), iyzico conversation ID'sini tutar
  - `iyzScriptLoaded` — useState(false), iyzico script'inin yüklenip yüklenmediğini takip eder
  - `formReady` — useState(false), ödeme formunun hazır olup olmadığını kontrol eder
  - `progressPct` — useState(20), checkout ilerleme yüzdesini tutar
  - `paymentFrameContent` — useState(''), ödeme frame içeriğini tutar
  - `isTest` — `'vi' in globalThis` ifadesinden türeyen boolean, Vitest test ortamında olunduğunu belirler, initiatePayment ve useEffect'te erken çıkış kontrolü yapar
- **Dönüş**: `{ loading, iyzToken, paymentUrl, orderId, convId, iyzScriptLoaded, formReady, progressPct, paymentFrameContent, setFormReady, setProgressPct, initiatePayment }` — hook'un döndürdüğü obje, tüm state'ler, setter'lar ve initiatePayment fonksiyonu

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::initiatePayment
- **params**: (yok) — parametre almaz, closure içindeki useCheckoutPayment değişkenlerine erişir
- **ic_degiskenler**:
  - `authoritativeTotal` — `getCartTotal()` ile elde edilen sepetteki toplam tutar; server-side fiyat doğrulaması sonucunda `validation?.totals?.subtotal` ile güncellenebilir
  - `validation` — `await validateServerCart({ userId: user?.id })` sonucu dönen nesne, server tarafında sepetin doğrulanmış ürünlerini ve toplamlarını içerir
  - `localHash` — `getPriceHashLocal(items)` çağrısından dönen hash, istemci tarafındaki fiyat verisinin özetidir
  - `serverHash` — `getPriceHashServer(validation?.items, items)` çağrısından dönen hash, sunucu tarafındaki fiyat verisinin özetidir; localHash ile karşılaştırılarak fiyat farkı tespit edilir
  - `e` — validateServerCart çağrısı başarısız olduğunda yakalanan hata nesnesi, console.warn ile loglanır
  - `buildPaymentRequest` — `await import('../views/checkout/buildPaymentRequest')` ile dinamik import edilen fonksiyon, ödeme istek objesini oluşturur
  - `requestData` — `buildPaymentRequest(...)` çağrısıyla oluşturulan ödeme istek verisi, Supabase edge function'a body olarak gönderilir
  - `data` — `supabase.functions.invoke('iyzico-payment')` sonucu dönen yanıt verisi
  - `error` — `supabase.functions.invoke` sonucu dönen hata nesnesi; truthy ise throw edilir
  - `d` — `data.data` erişimiyle elde edilen iç nesne; `d.paymentPageUrl`, `d.token`, `d.orderId`, `d.conversationId` alanları erişilir
  - `err` — try-catch içinde yakalanan hata nesnesi, Error instance olabilir veya string'e çevrilebilir
  - `msg` — `err` nesnesinin `message` özelliği veya `String(err)` karşılığı, toast hata mesajı olarak kullanılır
- **Dönüş**: `boolean` — `true` ise ödeme başarıyla başlatıldı (token alındı), `false` ise hata oluştu; `undefined` döndüğü durumlar: test ortamında `return true`, `d.paymentPageUrl` varsa `window.location.href` yönlendirmesi sonrası return yok

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useEffect (order status polling)
- **params**: (yok) — useEffect callback
- **ic_degiskenler**:
  - `timer` — `setInterval` ile oluşturulan timer ID, her 3000ms'de bir sipariş durumunu sorgular
  - `data` — `supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle()` sonucu dönen satır; `data?.status` erişimi ile sipariş durumu kontrol edilir
- **Dönüş**: cleanup fonksiyonu — `clearInterval(timer)` döndürür, component unmount veya dependency değiştiğinde timer'ı temizler

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::setInterval callback (inner order status check)
- **params**: (yok) — setInterval callback'i, async anonim fonksiyon
- **ic_degiskenler**:
  - `data` — `supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle()` sonucu dönen satır; `data?.status === 'paid'` kontrolü ile siparişin ödenip ödenmediği doğrulanır
- **Dönüş**: yok — side effect olarak `clearTimer()` ile interval'ı durdurur, `clearCart()` ile sepeti temizler, `router.push(...)` ile `/payment-success` sayfasına yönlendirir

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutPayment