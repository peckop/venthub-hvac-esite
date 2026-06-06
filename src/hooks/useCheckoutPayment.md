---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: cfc0d60be298c685
entity_hashes:
  func:useCheckoutPayment: a8bb41b15d097162
  overview: 7e174a305fdaf5de
generated_at: 2026-06-06T21:55:31Z
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

Bu modül, ödeme sürecini orkestra eden bir React hook'u olup, dış bağımlılıklar aracılığıyla çalışır. Aşağıdaki varsayımlar fonksiyon imzasından çıkarılmıştır.

**[Aksiyom 1 – Boş Sepet Koruması]:** Eğer `items` boş bir dizi veya `undefined`/`null` ise, `getCartTotal` çağrılmamalıdır. Boş sepet ile ödeme akışı başlatılamaz, aksi takdirde tutarsız bir toplam değeri veya hata oluşur.

**[Aksiyom 2 – Zorunlu Fonksiyon Bağımlılığı]:** Eğer `getCartTotal` sağlanmamışsa, ödeme toplamı hesaplanamaz ve akış devam ettirilemez. Bu fonksiyon ödeme sürecinin temel taşıdır.

**[Aksiyom 3 – Sepet Temizleme Garantisi]:** Eğer `clearCart` sağlanmamışsa, ödeme başarılı tamamlansa bile sepet temizlenemez; bu durumda kullanıcı tekrar aynı ürünlerle karşılaşır veya tutarsız bir durum oluşur.

**[Aksiyom 4 – Sunucu Fiyatlandırma Zorunluluğu]:** Eğer `applyServerPricing` sağlanmamışsa, fiyatlar yalnızca istemci tarafında hesaplanır; bu durumda indirim, vergi veya sunucu tarafından belirlenen fiyatlar dikkate alınmaz ve tutarsız fiyat oluşabilir.

**[Aksiyom 5 – Kullanıcı Bağlamı]:** Eğer `user` objesi `undefined` veya `null` ise, kullanıcıya bağlı işlemler (örn: sipariş kaydı, fatura oluşturma) gerçekleştirilemez; bu durumda ilgili adımlar atlanmalı veya hata fırlatılmalıdır.

---

> **Not:** Bu aksiyomlar yalnızca fonksiyon imzasındaki parametrelerden türetilmiştir. Fonksiyon gövdesi erişilebilir olmadığından, iç akış detayları (örn: fiyat hesaplama formülü, ödeme ağ geçidi entegrasyonu) hakkında varsayımda bulunulmamıştır.

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
- **params**:
  - `items` — Sepetteki ürün listesi, CartItem[] tipinde, fiyat hash hesaplaması ve ödeme isteği oluşturulmasında kullanılır
  - `getCartTotal` — Sepet toplamını döndüren fonksiyon, o anki yerel toplamı almak için çağrılır
  - `user` — Giriş yapmış kullanıcı nesnesi (Supabase User), user?.id ile sunucu tarafı doğrulama ve ödeme isteğinde kullanılır
  - `clearCart` — Sepeti temizleyen fonksiyon, ödeme başarılı olduktan sonra çağrılır
  - `applyServerPricing` — Sunucu tarafı fiyat güncellemelerini yerel sepete uygular, fiyat hash uyuşmazlığında çağrılır
  - `orchestrator` — Checkout sürecini yöneten nesne, customerInfo/shippingAddress/billingAddress/sameAsShipping/invoiceType/invoiceInfo/legalConsents/shippingMethod alanlarını barındırır
  - `couponCode` — Kupon kodu stringi, ödeme isteği oluştururken gönderilir
  - `t` — Çeviri fonksiyonu (i18n), hata mesajlarında kullanılır
- **ic_degiskenler**:
  - `router` — useRouter() hook'undan dönen Next.js router nesnesi, ödeme sonrası router.push ile yönlendirme yapar
  - `loading` / `setLoading` — useState boolean, ödeme sürecinin yükleme durumunu tutar
  - `iyzToken` / `setIyzToken` — useState string, iyzico ödeme sayfası token'ını tutar
  - `paymentUrl` / `setPaymentUrl` — useState string, iyzico ödeme sayfası URL'ini tutar
  - `orderId` / `setOrderId` — useState string, oluşturulan sipariş ID'sini tutar
  - `convId` / `setConvId` — useState string, iyzico conversation ID'sini tutar
  - `iyzScriptLoaded` — useState boolean (sadece okunur), iyzico script'inin yüklenip yüklenmediğini belirtir
  - `formReady` / `setFormReady` — useState boolean, ödeme formunun hazır olma durumunu tutar
  - `progressPct` / `setProgressPct` — useState number (başlangıç 20), ilerleme yüzdesini tutar
  - `paymentFrameContent` — useState string (sadece okunur), ödeme frame içeriğini tutar
  - `isTest` — boolean, globalThis içinde 'vi' olup olmadığını kontrol eder, Vitest test ortamında olduğunu belirtir
- **Dönüş**: `{ loading, iyzToken, paymentUrl, orderId, convId, iyzScriptLoaded, formReady, progressPct, paymentFrameContent, setFormReady, setProgressPct, initiatePayment }` — tüm durum değerleri, setter'lar ve initiatePayment fonksiyonunu içeren nesne

---

### [N2_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useCheckoutPayment.initiatePayment
- **params**: yok (closure ile dış hook scope'unu kapatır)
- **ic_degiskenler**:
  - `authoritativeTotal` — number, başlangıçta getCartTotal() ile alınan sepet toplamı, sunucu doğrulaması sonrası validation?.totals?.subtotal ile güncellenebilir
  - `validation` — await validateServerCart({ userId: user?.id }) sonucu dönen nesne, sunucu tarafı sepet doğrulamasının sonucu; .items ve .totals?.subtotal alanları kullanılır
  - `localHash` — getPriceHashLocal(items) ile hesaplanan yerel fiyat hash'i, sunucu hash'i ile karşılaştırılır
  - `serverHash` — getPriceHashServer(validation?.items, items) ile hesaplanan sunucu tarafı fiyat hash'i, localHash ile karşılaştırılarak fiyat güncellemesi gerekip gerekmediği kontrol edilir
  - `buildPaymentRequest` — dinamik import ile '../views/checkout/buildPaymentRequest' modülünden alınan fonksiyon, ödeme istek nesnesini oluşturur
  - `requestData` — buildPaymentRequest çağırılarak oluşturulan nesne; amount, items, customer (orchestrator.customerInfo), shipping (orchestrator.shippingAddress), billing (orchestrator.billingAddress), sameAsShipping (orchestrator.sameAsShipping), userId (user?.id), invoiceType (orchestrator.invoiceType), invoiceInfo (orchestrator.invoiceInfo), legalConsents (orchestrator.legalConsents), shippingMethod (orchestrator.shippingMethod), couponCode alanlarını içerir
  - `data` — supabase.functions.invoke('iyzico-payment') yanıtındaki data alanı, .data.data.altında ödeme bilgileri (token, paymentPageUrl, orderId, conversationId) bulunur
  - `error` — supabase.functions.invoke sonucundaki hata nesnesi, varsa fırlatılır
  - `d` — data.data, iyzico yanıtının içeriği; d.token, d.paymentPageUrl, d.orderId, d.conversationId alanları okunur
  - `err` — try-catch bloğu içinde yakalanan hata, Error instance olup olmadığı kontrol edilir; msg oluşturulur
  - `msg` — err instanceof Error ? err.message : String(err) ile elde edilen hata mesajı, toast.error'a gönderilir
- **Dönüş**: boolean veya undefined — başarılıysa `true` döner, hata olursa `false` döner, data?.data.token varsa `true`, data?.data.paymentPageUrl varsa return ile undefined döner (sayfa yönlendirme yapılır)

---

### [N3_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useCheckoutPayment.[useEffect_callback]
- **params**: yok (React useEffect callback)
- **ic_degiskenler**:
  - `timer` — setInterval ID'si, her 3 saniyede bir sipariş durumunu sorgulayan interval'ı temsil eder, temizlik için clearInterval ile kaldırılır
- **Dönüş**: cleanup fonksiyonu — `() => clearInterval(timer)` döndürülerek interval temizlenir

---

### [N4_NASIL] AST Pointer: src/hooks/useCheckoutPayment.ts::useCheckoutPayment.[setInterval_callback]
- **params**: yok (setInterval callback)
- **ic_degiskenler**:
  - `data` — await supabase.from('venthub_orders').select('status').eq('id', orderId).maybeSingle() sonucu dönen satır; data?.status === 'paid' kontrolü ile siparişin ödeme durumu kontrol edilir
- **Dönüş**: yok — yan etki olarak sipariş durumu 'paid' ise clearCart() çağrılır ve router.push(`/payment-success?orderId=${orderId}&status=success`) ile yönlendirme yapılır

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutPayment