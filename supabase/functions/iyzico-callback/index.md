---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\iyzico-callback\index.ts
skeleton_hash: c260c26f88f6a678
entity_hashes:
  func:iyzico-callback_handler: 14b42ca547fc6940
  overview: 8d4bc59faa090782
generated_at: 2026-08-15T09:03:13Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak deploy edilmiş bir webhook endpoint'idir. İyzico ödeme sağlayıcısından gelen callback isteklerini merkezi olarak işler. İmza doğrulama ile güvenliği sağlar, ödeme durumunu ayrıştırır ve veritabanındaki sipariş kayıtlarını buna göre günceller.

## Fonksiyon Grupları
### Webhook İşleme
Gelen İyzico callback isteklerinin tam yaşam döngüsünü yönetir: imza doğrulama, ödeme bilgilerinin ayrıştırılması ve ilgili sistem kayıtlarının güncellenmesi.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından çıkarılabilecek temel varsayımlar tanımlanabilmektedir. Fonksiyon gövdesi paylaşılmadığından, detaylı iş mantığı varsayımları belirlenememiştir.

[Aksiyom 1]: Eğer `req` parametresi istemciden gelen geçerli bir HTTP isteği (Request) nesnesi olarak sağlanmazsa, işleyici (handler) çalışmaz veya hata ile sonuçlanır.
[Aksiyom 2]: Eğer işleyici başarılı bir şekilde çalışırsa, istemciye (`Response` türünde) bir HTTP yanıtı döndürmek zorundadır.
[Aksiyom 3]: Eğer istek bir webhook callback'i olarak işlenecekse, işleyicinin işlevsel mantığı (örn. imza doğrulama, veri ayrıştırma) fonksiyon gövdesinde tanımlı olmalıdır, ancak bu mantık imza bilgisinden çıkarılamaz.

---

## FONKSİYON DETAYLARI

### iyzico-callback_handler
**Ne yapar**: VentHub HVAC projesinin Supabase altyapısında barındırılan, Iyzico ödeme sağlayıcısından gelen tüm callback isteklerini işleyen ana giriş fonksiyonudur. Gelen ödeme durum bildirimlerini alır, doğrular ve sistemdeki ilgili sipariş, kullanıcı ve ödeme kayıtlarını güncellemek için gerekli tüm iş süreçlerini yönetir.
**Nasıl yapar**: İlk olarak gelen isteğin yetkili kaynaklı olduğunu teyit etmek için Iyzico’nun standart imza doğrulama protokolünü uygular, isteğin başlıkları ve gövdesindeki güvenlik verilerini eşleştirerek sahte istekleri engeller. Doğrulama süreci başarılı olursa istek gövdesindeki ödeme bilgilerini ayrıştırır, Supabase veritabanı üzerinden ilgili kayıtlara erişerek ödeme durumunu (başarılı, başarısız, beklemede vb.) günceller. Tüm işlem akışı sonunda isteğin sonucuna uygun bir HTTP cevabı oluşturarak döndürür.
**Parametreler**:
- name: req, type: HTTP Request (Supabase Edge Function Request nesnesi) — Iyzico ödeme servisinden gelen callback isteğinin tüm meta verilerini, HTTP başlıklarını ve işlenecek ödeme bilgilerini içeren gövdesini barındıran istek nesnesi
**Dönüş**: Standart HTTP Response nesnesi. İsteğin işlenme durumuna uygun HTTP durum kodu, ilgili cevap başlıkları ve metin içeriği barındırır. Başarısız doğrulama durumunda 403 Yetkisiz Erişim, eksik veya hatalı istek verisinde 400 Hatalı İstek, sunucu tarafı işlem hatalarında 500 Sunucu Hatası kodları döndürür. Tüm süreçlerin başarılı tamamlanması halinde 200 Başarılı durum kodu ile Iyzico’ya onay mesajı içeren cevap gönderir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant.ts::tenantFromRow
- import: npm:iyzipay::Iyzipay

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

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::iyzico-callback_handler
- **params**: `(req)` — gelen HTTP isteği (Request nesnesi)
- **ic_degiskenler**: fonksiyon gövdesinin tamamı paylaşımda verilmemiştir; alt parçalarda referanslanan kapsama değişkenleri aşağıda listelenir
  - `sdk` — Iyzipay SDK örneği, checkoutForm işlemleri için kullanılır
  - `retrieveReq` — sdk.checkoutForm.retrieve çağrısına verilen istek parametreleri
  - `orderId` — güncellenecek siparişin ID'si, Supabase filtrelemede kullanılır
  - `conversationId` — Iyzico conversation ID'si, orderId yoksa filtreleme anahtarıdır
  - `result` — Iyzico checkoutForm.retrieve yanıt nesnesi, conversationId ve ödeme bilgilerini içerir
  - `supabaseUrl` — Supabase proje URL'i, REST API çağrıları için temel URL
  - `serviceRoleKey` — Supabase service role anahtarı, yetkilendirme header'ında kullanılır
  - `orderTenantFilter` — kiracı bazlı filtre sorgusu, RLS benzeri filtreleme ekler
  - `debugInfo` — ödeme sürecin_debug bilgisi, payment_debug alanına yazılır
  - `conversationId` (fallback) — result?.conversationId alınmazsa `conversationId!` non-null assertion ile kullanılır
- **Dönüş**: `Response` — HTTP yanıt nesnesi

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::patchStatus
- **params**: `(newStatus: 'paid' | 'failed' | 'confirmed')` — siparişe atanacak yeni ödeme durumu
- **ic_degiskenler**:
  - `filterById` — `orderId` mevcutsa `id=eq.{orderId}` formatında filtre sorgusu oluşturur
  - `filterByConv` — `orderId` yoksa ve `result?.conversationId` veya `conversationId` mevcutsa `conversation_id=eq.{conversationId}` formatında filtre sorgusu oluşturur
  - `filter` — `filterById` veya `filterByConv`'dan ilk dolu olanı tutar; her ikisi de boşsa `null` dönülür
  - `resp` — Supabase REST API PATCH istek yanıtını (Response) tutar
- **Kapsama (closure) değişkenleri** (fonksiyon gövdesinden erişilen):
  - `orderId` — filterById filtreleme değeri olarak kullanılır
  - `result` — `result?.conversationId` optional zincir ile conversationId okunur
  - `conversationId` — result conversationId'si yoksa fallback olarak kullanılır (non-null assertion)
  - `orderTenantFilter` — filtre sorgusunun sonuna eklenen kiracı kısıtlaması
  - `supabaseUrl` — PATCH isteği için temel REST API URL'i
  - `serviceRoleKey` — Authorization ve apikey header değerleri için kullanılır
  - `debugInfo` — PATCH body'sinde `payment_debug` alanına yazılır
- **Dönüş**: `Response | null` — successful PATCH yanıtı veya filtre bulunamazsa `null`

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::(resolve, reject) => Promise callback
- **params**: `(resolve, reject)` — Promise constructor callback parametreleri
- **ic_degiskenler**:
  - `retrieveReq` — sdk.checkoutForm.retrieve metoduna verilen istek nesnesi
- **Kapsama (closure) değişkenleri**:
  - `sdk` — Iyzipay SDK örneği, `sdk.checkoutForm.retrieve` çağrısı yapılır
- **Dönüş**: `void` — Promise resolve/reject ile sonuçlanır; retrieve başarılıysa `CheckoutRetrieveResponse` resolve edilir, hata varsa reject edilir

### [N4_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::(err, res) => retrieve callback
- **params**: `(err: unknown, res: CheckoutRetrieveResponse)` — retrieve callback hata ve yanıt parametreleri
- **ic_degiskenler**: (yok)
- **Kapsama (closure) değişkenleri**:
  - `resolve` — Promise resolve fonksiyonu, `res` ile çağrılır
  - `reject` — Promise reject fonksiyonu, `err` ile çağrılır
- **Dönüş**: `void` — hata varsa `reject(err)`, başarılıysa `resolve(res)` ile sonuçlanır

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler