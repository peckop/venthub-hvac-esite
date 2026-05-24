---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-callback\index.ts
skeleton_hash: 828e661b626678aa
generated_at: 2026-05-24T10:46:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi için tasarlanmış Supabase Edge Fonksiyonudur ve İyzico ödeme sağlayıcısından gelen webhook geri çağrı isteklerini işler. Tek bir ana işleyici aracılığıyla gelen istekleri doğrular, ödeme durumuna göre gerekli güncellemeler yapar ve uygun HTTP yanıtlarını döndürür.

## Fonksiyon Grupları
### İyzico Callback İşleme
Bu grup, modülün tek sorumluluğunu kapsar: Gelen İyzico webhook isteklerini alır, gönderilen verileri doğrular, ödeme durumunu kontrol eder, ilgili veritabanı kayıtlarını günceller ve işlem sonucuna göre uygun HTTP yanıtını döndürür.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmıştır.

[Aksiyom 1]: Eğer `iyzico-callback_handler` fonksiyonuna `req` parametresi sağlanmazsa, fonksiyon iyzico callback verilerini işleyemez ve beklenen yanıt üretilemez.

---

## FONKSIYON DETAYLARI

### iyzico-callback_handler
**Ne yapar**: VentHub HVAC projesinin Supabase altyapısında barındırılan, Iyzico ödeme sağlayıcısından gelen tüm callback isteklerini işleyen ana giriş fonksiyonudur. Gelen ödeme durum bildirimlerini alır, doğrular ve sistemdeki ilgili sipariş, kullanıcı ve ödeme kayıtlarını güncellemek için gerekli tüm iş süreçlerini yönetir.
**Nasıl yapar**: İlk olarak gelen isteğin yetkili kaynaklı olduğunu teyit etmek için Iyzico’nun standart imza doğrulama protokolünü uygular, isteğin başlıkları ve gövdesindeki güvenlik verilerini eşleştirerek sahte istekleri engeller. Doğrulama süreci başarılı olursa istek gövdesindeki ödeme bilgilerini ayrıştırır, Supabase veritabanı üzerinden ilgili kayıtlara erişerek ödeme durumunu (başarılı, başarısız, beklemede vb.) günceller. Tüm işlem akışı sonunda isteğin sonucuna uygun bir HTTP cevabı oluşturarak döndürür.
**Parametreler**:
- name: req, type: HTTP Request (Supabase Edge Function Request nesnesi) — Iyzico ödeme servisinden gelen callback isteğinin tüm meta verilerini, HTTP başlıklarını ve işlenecek ödeme bilgilerini içeren gövdesini barındıran istek nesnesi
**Dönüş**: Standart HTTP Response nesnesi. İsteğin işlenme durumuna uygun HTTP durum kodu, ilgili cevap başlıkları ve metin içeriği barındırır. Başarısız doğrulama durumunda 403 Yetkisiz Erişim, eksik veya hatalı istek verisinde 400 Hatalı İstek, sunucu tarafı işlem hatalarında 500 Sunucu Hatası kodları döndürür. Tüm süreçlerin başarılı tamamlanması halinde 200 Başarılı durum kodu ile Iyzico’ya onay mesajı içeren cevap gönderir.

---

## TYPE ALIASES

### CheckoutRetrieveResponse
```typescript
type CheckoutRetrieveResponse = {
  paymentStatus?: string;
  conversationId?: string;
  errorMessage?: string;
  paymentId?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  [k: string]: unk
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: iyzico-callback/index.ts::<anonymous>
- **params**: resolve, reject
- **ic_degiskenler**: 
  - `retrieveReq` — the request payload sent to Iyzipay checkoutForm.retrieve to retrieve payment details.
  - `sdk` — the initialized Iyzipay SDK instance used to call checkoutForm.retrieve.
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: iyzico-callback/index.ts::<anonymous>
- **params**: err, res
- **ic_degiskenler**: 
  - `reject` — function to reject the outer Promise when Iyzipay retrieval fails.
  - `resolve` — function to resolve the outer Promise with the retrieval result.
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: iyzico-callback/index.ts::patchStatus
- **params**: newStatus
- **ic_degiskenler**: 
  - `orderId` — the unique identifier of the order whose payment status is being updated.
  - `result` — the Iyzipay payment response object that may contain a conversationId.
  - `conversationId` — fallback conversation ID used when orderId is not available.
  - `supabaseUrl` — base URL of the Supabase project's REST API.
  - `serviceRoleKey` — Supabase service role key used for authenticating API requests.
  - `debugInfo` — additional debugging information to store in the payment_debug column.
  - `filterById` — Supabase filter string for matching by order ID; empty if orderId is falsy.
  - `filterByConv` — Supabase filter string for matching by conversation ID; empty if conditions not satisfied.
  - `filter` — combined filter string (filterById || filterByConv) used to construct the request URL; if empty, the function returns null.
  - `resp` — the Response object returned by the fetch call that patches the order status.
- **Dönüş**: Response | null

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler