---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-callback\index.ts
skeleton_hash: 828e661b626678aa
entity_hashes:
  func:iyzico-callback_handler: 14b42ca547fc6940
  overview: bae576fb73387a70
generated_at: 2026-05-28T22:44:12Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin Supabase altyapısında barındırılan bir edge fonksiyonudur. Tek bir merkezi işleyici aracılığıyla İyzico ödeme sağlayıcısından gelen webhook callback isteklerini alır, doğrular ve sistemdeki ilgili kayıtları günceller.

## Fonksiyon Grupları
### İyzico Callback İşleme
Bu grup, modülün tüm sorumluluğunu kapsar: Gelen İyzico webhook isteklerinin güvenli bir şekilde doğrulanması, ödeme durumuna göre veritabanı güncellemelerinin yapılması ve uygun HTTP yanıtlarının üretilmesini yönetir.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel aksiyomlar aşağıdadır:

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa veya geçerli bir HTTP istek nesnesi (Request

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

### [N1_NASIL] AST Pointer: iyzico-callback/index.ts::Promise_executor
- **params**: `resolve` — Promise resolve callback, `reject` — Promise reject callback
- **ic_degiskenler**:
  - `sdk` — closure'dan gelen Iyzipay SDK nesnesi, `checkoutForm.retrieve` metodu çağrılır
  - `retrieveReq` — closure'dan gelen checkout form retrieve istek parametreleri
  - `err` — retrieve callback'inden gelen hata nesnesi (unknown), varsa `reject(err)` ile fırlatılır
  - `res` — `CheckoutRetrieveResponse` tipinde başarılı yanıt, `resolve(res)` ile çözümlenir
- **Dönüş**: Promise resolve/reject ile `CheckoutRetrieveResponse` veya hata

### [N2_NASIL] AST Pointer: iyzico-callback/index.ts::retrieve_callback
- **params**: `err` — unknown tipinde hata nesnesi, `res` — `CheckoutRetrieveResponse` tipinde yanıt
- **ic_degiskenler**:
  - `reject` — closure'dan gelen Promise reject fonksiyonu, hata durumunda çağrılır
  - `resolve` — closure'dan gelen Promise resolve fonksiyonu, başarı durumunda çağrılır
- **Dönüş**: Yok (yan etki: `resolve(res)` veya `reject(err)` çağrılır)

### [N3_NASIL] AST Pointer: iyzico-callback/index.ts::patchStatus
- **params**: `newStatus` — `'paid' | 'failed' | 'confirmed'` tipinde, siparişin güncellenecek durumu
- **ic_degiskenler**:
  - `orderId` — closure'dan gelen sipariş ID'si, varsa `id=eq.${orderId}` filtresi oluşturulur
  - `result` — closure'dan gelenretrieve sonucu nesnesi, `result?.conversationId` erişimi yapılır
  - `conversationId` — closure'dan gelen conversation ID'si, `orderId` yoksa alternatif filtre olarak kullanılır
  - `filterById` — string, `orderId` varsa `id=eq.${orderId}` query string'i; boş string olabilir
  - `filterByConv` — string, `orderId` yoksa ve conversation ID mevcutsa `conversation_id=eq.${...}` query string'i; boş string olabilir
  - `filter` — string, `filterById || filterByConv` birleşimi; aktif filtre query parametresi
  - `supabaseUrl` — closure'dan gelen Supabase proje URL'i, REST API endpoint地址i oluşturmak için kullanılır
  - `serviceRoleKey` — closure'dan gelen Supabase service role anahtarı, `Authorization` ve `apikey` header'larında kullanılır
  - `debugInfo` — closure'dan gelen hata/ayıklama bilgisi, PATCH body'sinde `payment_debug` alanına yazılır
  - `resp` — `fetch` çağrısının döndürdüğü `Response` nesnesi, fonksiyon tarafından return edilir
- **Dönüş**: `Response | null` — fetch yanıtı veya filtre oluşturulamazsa `null`

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler