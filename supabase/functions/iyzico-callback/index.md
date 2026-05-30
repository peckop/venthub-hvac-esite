---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-callback\index.ts
skeleton_hash: 808310d169bd9ad2
entity_hashes:
  func:iyzico-callback_handler: 14b42ca547fc6940
  overview: a4ecb35c6d2ec3a1
generated_at: 2026-05-29T11:43:13Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak deployed edilmiş bir webhook handler'dır. İyzico ödeme sağlayıcısından gelen callback isteklerini merkezi olarak işler, imza doğrulama ile güvenliği sağlar ve ödeme durumuna göre veritabanı kayıtlarını günceller.

## Fonksiyon Grupları
### İyzico Callback İşleme
Gelen webhook isteklerinin imza doğrulaması, ödeme bilgilerinin ayrıştırılması ve ilgili sipariş/kayıt güncellemelerinin yapılması dahil tüm iş akışını yönetir.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, İyzico ödeme sağlayıcısından gelen webhook callback isteklerini işleyen bir Supabase Edge fonksiyonudur. Fonksiyonun doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon istek verilerine erişemez ve callback işleme gerçekleştirilemez.

---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::(resolve, reject) callback
- **params**: `(resolve, reject)` — Promise'ın resolve ve reject fonksiyonları
- **ic_degiskenler**:
  - `retrieveReq` — Iyzipay checkout form retrieve istek parametreleri (dışarıdan geliyor)
  - `sdk` — Iyzipay SDK nesnesi (dışarıdan geliyor, `sdk.checkoutForm.retrieve` çağrılıyor)
- **Dönüş**: Yok (Promise executor callback'i; `resolve(res)` veya `reject(err)` ile sonuç üretir)

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::(err, res) callback
- **params**: `(err: unknown, res: CheckoutRetrieveResponse)` — Iyzipay retrieve sonucu; hata veya yanıt
- **ic_degiskenler**:
  - Fonksiyon gövdesinde ek değişken tanımlanmamıştır. Sadece parametreler kullanılır: `err` hata durumunda `reject(err)` ile reddeder, `res` başarı durumunda `resolve(res)` ile çözümlenir.
- **Dönüş**: Yok (callback; bir üst scope'taki `resolve`/`reject` üzerinden sonuç üretir)

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::patchStatus
- **params**: `(newStatus: 'paid' | 'failed' | 'confirmed')` — Siparişe atanacak yeni durum değeri
- **ic_degiskenler**:
  - `filterById` — `orderId` mevcutsa `id=eq.{orderId}` formatında Supabase filtre sorgusu oluşturur; değilse boş string
  - `filterByConv` — `orderId` yoksa ve `result.conversationId` veya `conversationId` mevcutsa `conversation_id=eq.{id}` formatında filtre sorgusu oluşturur; değilse boş string
  - `filter` — `filterById` veya `filterByConv`'dan ilk dolu olanı alır; her ikisi de boşsa `null` döner (fonksiyon erken çıkar)
  - `resp` — Supabase REST API'ye PATCH isteği sonucu dönen `Response` nesnesi
  - `orderId` — Dış scope'tan gelen sipariş ID'si (null olabilir)
  - `result` — Iyzipay retrieve sonucu (`.conversationId` erişimi yapılır)
  - `conversationId` — Dış scope'tan gelen conversation ID'si (fallback olarak kullanılır)
  - `supabaseUrl` — Supabase proje URL'i, REST API endpoint'i için kullanılır
  - `serviceRoleKey` — Supabase service role anahtarı, Authorization ve apikey header'larında kullanılır
  - `debugInfo` — Ödeme debug bilgisi, `payment_debug` alanına JSON olarak kaydedilir
- **Dönüş**: `Response | null` — Supabase PATCH yanıtını döner; filtre oluşturulamazsa `null` döner

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler