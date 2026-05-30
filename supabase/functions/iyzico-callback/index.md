---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-callback\index.ts
skeleton_hash: 5a9d607e9b6cdc1b
entity_hashes:
  func:iyzico-callback_handler: 14b42ca547fc6940
  overview: 9f60711f4ba6c146
generated_at: 2026-05-30T21:16:10Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak deploy edilmiş bir webhook handler'dır. İyzico ödeme sağlayıcısından gelen callback isteklerini merkezi olarak işler, imza doğrulama ile güvenliği sağlar ve ödeme durumuna göre veritabanı kayıtlarını günceller.

## Fonksiyon Grupları
### İyzico Callback İşleme
Gelen webhook isteklerinin imza doğrulaması, ödeme bilgilerinin ayrıştırılması ve ilgili sipariş/kayıt güncellemelerinin yapılması dahil tüm iş akışını yönetir.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından çıkarılabilecek temel varsayımlar tanımlanabilmektedir. Fonksiyon gövdesi paylaşılmadığından, detaylı akış ve iş mantığına ilişkin aksiyomlar belirlenememiştir.

---

**[Aksiyom 1]**: `iyzico-callback_handler` fonksiyonu, bir `req` parametresi ile çağrılmalıdır.
**Eğer** `req` parametresi sağlanmadan fonksiyon çağrılırsa, **sonuç** olarak fonksiyon çalışma zamanı hatası (TypeError) verir ve callback işlenemez.

**[Aksiyom 2]**: `req` parametresi, HTTP istek nesnesi (Supabase Edge Function standardında `Request` tipinde) olmalıdır.
**Eğer** `req` geçerli bir HTTP istek nesnesi değilse (örneğin `null`, `undefined` veya yanlış tipte bir değer ise), **sonuç** olarak fonksiyon isteği işleyemez ve hata fırlatır.

---

> **Not**: Fonksiyon gövdesi, modül sabitleri ve varsayılan değerler paylaşılmadığı için; imza doğrulama eşiği, beklenen header alanları, veritabanı tablo/bičim tanımları, callback URL yapısı ve ödeme durumu eşik değerleri gibi detaylı domain-specific aksiyomlar **bilinmiyor** durumdadır. Bu aksiyomların belirlenebilmesi için fonksiyon gövdesinin (implementation) incelenmesi gerekmektedir.

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

### [N1_NASIL] AST Pointer: iyzico-callback/index.ts::iyzico-callback_handler
- **params**: `(req)` — gelen HTTP istek nesnesi
- **ic_degiskenler**:
  - `resolve` — Promise'ın başarılı tamamlanmasını sağlayan callback fonksiyonu
  - `reject` — Promise'ın hatalı tamamlanmasını sağlayan callback fonksiyonu
  - `retrieveReq` — checkout form retrieve isteği için kullanılan istek nesnesi (callback içinde kullanılır)
  - `err` — sdk.checkoutForm.retrieve callback'inde dönen hata nesnesi, bilinmeyen tipte
  - `res` — CheckoutRetrieveResponse tipinde, retrieve işleminin başarılı sonucu
- **Dönüş**: `Response` — HTTP yanıt nesnesi

### [N2_NASIL] AST Pointer: iyzico-callback/index.ts::patchStatus
- **params**: `(newStatus: 'paid' | 'failed' | 'confirmed')` — siparişe atanacak yeni durum değeri
- **ic_degiskenler**:
  - `orderId` — üst kapsamdan gelen sipariş ID'si, filtrelme amaçlı kullanılır (tanımlanmamış ama erişim var)
  - `result` — retrieve işleminden dönen sonuç nesnesi, conversationId alanı için kullanılır
  - `conversationId` — üst kapsamdan gelen konuşma ID'si, fallback olarak kullanılır
  - `tenantId` — üst kapsamdan gelen kiracı/belirteç ID'si, filtre parametresi olarak kullanılır
  - `supabaseUrl` — üst kapsamdan gelen Supabase API taban URL'i
  - `serviceRoleKey` — üst kapsamdan gelen Supabase servis rolü anahtarı, yetkilendirme header'larında kullanılır
  - `debugInfo` — üst kapsamdan gelen hata ayıklama bilgisi, payment_debug alanına yazılır
  - `filterById` — `orderId` mevcutsa `id=eq.{orderId}` formatında filtre stringi
  - `filterByConv` — `orderId` yoksa `conversation_id=eq.{value}` formatında filtre stringi
  - `filter` — `filterById` veya `filterByConv` değerinden biri, geçerli filtre stringi
  - `resp` — Supabase REST API PATCH isteğinin dönen Response nesnesi
- **Dönüş**: `Response | null` — PATCH yanıt nesnesi veya filtre yoksa `null`

### [N3_NASIL] AST Pointer: iyzico-callback/index.ts::retrieve_callback
- **params**: `(resolve, reject)` — Promise constructor callback parametreleri
- **ic_degiskenler**:
  - `retrieveReq` — sdk.checkoutForm.retrieve metoduna geçirilen istek konfigürasyonu nesnesi
  - `sdk` — Iyzipay SDK örneği, checkout form retrieve işlemi için kullanılır
  - `err` — retrieve callback'inde dönen hata nesnesi, bilinmeyen (`unknown`) tipte
  - `res` — `CheckoutRetrieveResponse` tipinde, Iyzico checkout form sonucu
- **Dönüş**: yok — Promise içinde resolve/reject çağrısı ile sonuç döner

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler