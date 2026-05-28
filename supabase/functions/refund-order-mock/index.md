---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\refund-order-mock\index.ts
skeleton_hash: f6440556e54dc688
entity_hashes:
  func:refund-order-mock_handler: 4c50c7cb50c6be68
  overview: d0409d334529cfc2
generated_at: 2026-05-28T22:47:52Z
---

## Genel Bakış
Bu modül, Supabase üzerinde bir HTTP endpoint olarak çalışır ve bir sipariş iade (refund) sürecini simüle eden (mock) bir yanıt üretir. Tek bir asenkron işleyici aracılığıyla dışarıdan gelen isteği kabul eder, basit bir iş mantığı uygular ve önceden tanımlı bir veri yapısıyla HTTP yanıtını oluşturur.

## Fonksiyon Grupları
### İstek İşleme ve Mock Yanıt Üretimi
Bu grup, dışarıdan bir iade talebini alarak simulated (simüle edilmiş) bir iş sonucu döndüren tek sorumluluğu taşır.
- refund-order-mock_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir Supabase Edge Function HTTP handler'ıdır; tek bir `req` parametresi alarak mock iade yanıtı üretir.

[Aksiyom 1]: Eğer `req` argümanı sağlanmazsa, fonksiyon `req` parameteresini işleyemez ve çalışması başarısız olur.

[Aksiyom 2]: Eğer `req` geçerli bir HTTP istek nesnesi (Request) formunda değilse, handler beklenen HTTP özelliklerini (header, body vb.) okuyamaz ve hata oluşur.

[Aksiyom 3]: Eğer handler bir `Response` nesnesi döndürmezse, Supabase Edge Function runtime'ı geçerli bir HTTP yanıtı üretemez ve istemci tarafında bağlantı hatası oluşur.

---

**Not:** Fonksiyon gövdesi (iç实现) paylaşılmadığı için, modül içindeki olası iç doğrulama kuralları, hata yönetimi mantığı veya mock veri yapıları hakkında aksiyom üretilmemiştir.

---

## FONKSİYON DETAYLARI

### refund-order-mock_handler
**Ne yapar**: Bu fonksiyon, bir siparişin geri ödemesi (refund) işlemini isteyen bir HTTP isteğini (request) ele alır. Fonksiyon, verilen bilgilere dayanarak bir geri ödeme işlemini **sahte (mock)** olarak simüle eder ve sonucu bildiren bir HTTP yanıtı (response) üretir. Bu, gerçek bir ödeme ağ geçidine (payment gateway) bağlanmadan test ve geliştirme süreçleri için kullanılan bir simülasyon fonksiyonudur.

**Nasıl yapar**: Fonksiyon, gelen isteğin (req) gövdesini (body) ayrıştırarak `order_id` ve `refund_reason` alanlarını bekler. Bu alanların varlığını ve türlerini doğrular. Doğrulama başarılı olursa, belirli bir geri ödeme işlemi iş mantığını (örneğin, bir veritabanı kaydını güncelleme) simüle eden bir dizi adım çalıştırır. İşlem的成功ızlıkla tamamlanırsa, succeeded: true durumu ile bir yanıt döner; herhangi bir hata (geçersiz parametre, eksik alan) oluşursa, succeeded: false ve bir hata mesajı içeren bir yanıt üretir.

**Parametreler**:
- `req`: Request — Supabase Edge Function tarafından sağlanan ve isteği temsil eden HTTP Request nesnesi. Fonksiyon bu nesnenin `body` özelliğinden JSON verisini okur.

**Dönüş**: Response — Fonksiyon, her durumda bir HTTP Response nesnesi döndürür. Başarılı simülasyon durumunda `200 OK` durum kodu ve `{ succeeded: true, message: string, order_id: string }` yapısında bir JSON gövdesi; hata durumunda `400 Bad Request` veya `500 Internal Server Error` durum kodu ve `{ succeeded: false, error: string }` yapısında bir JSON gövdesi döner.

---

## INTERFACES

### RefundRequest
- `order_id: string`
- `amount?: number`
- `reason?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointers: supabase/functions/refund-order-mock/index.ts::refund-order-mock_handler
- **params**: (req)
- **ic_degiskenler**:
  - `origin` — İstek başlığından alınan origin değeri, CORS için kullanılır
  - `cors` — CORS başlık nesnesi, tüm yanıtlara eklenir
  - `supabaseUrl` — Ortam değişkeninden alınan Supabase URL'si
  - `serviceKey` — Ortam değişkeninden alınan Supabase service role anahtarı
  - `anonKey` — Ortam değişkeninden alınan Supabase anon anahtarı
  - `authHeader` — İstek başlığındaki Authorization değeri
  - `authClient` — Kimlik doğrulama için oluşturulan Supabase istemcisi
  - `authErr` — Kimlik doğrulama hatası
  - `user` — Kimlik doğrulanan kullanıcı nesnesi
  - `actorUserId` — Kimlik doğrulanan kullanıcının ID'si (user.id)
  - `body` — İstek gövdesi JSON olarak ayrıştırılmış
  - `order_id` — Gövdeden alınan sipariş ID'si (boşlukları temizlenmiş)
  - `amount` — Gövdeden alınan iade tutarı (sayı ise)
  - `reason` — Gövdeden alınan iade nedeni (maksimum 140 karakter)
  - `ordResp` — Sipariş detaylarını çeken REST API yanıt nesnesi
  - `arr` — Sipariş yanıtının JSON dizisi
  - `order` — Sipariş nesnesi (dizinin ilk elemanı)
  - `isAdmin` — Kullanıcının admin olup olmadığı
  - `prof` — Kullanıcı profilini çeken REST API yanıt nesnesi
  - `prows` — Profil yanıtının JSON dizisi
  - `prow` — Profil nesnesi (dizinin ilk elemanı)
  - `isOwner` — Kullanıcının sipariş sahibi olup olmadığı
  - `totalAmount` — Siparişin toplam tutarı (Number dönüşümü)
  - `target` — Hedef iade tutarı (amount veya totalAmount)
  - `isFull` — Tam iade olup olmadığı (target >= totalAmount)
  - `newPaymentStatus` — Yeni ödeme durumu ('refunded' veya 'partial_refunded')
  - `newOrderStatus` — Yeni sipariş durumu (koşullu değişiklik)
  - `dbg` — Mevcut ödeme debug nesnesi
  - `newDebug` — Güncellenmiş ödeme debug nesnesi
  - `itemsResp` — Sipariş kalemlerini çeken REST API yanıt nesnesi
  - `items` — Sipariş kalemleri JSON dizisi
  - `it` — Döngü değişkeni, tek bir sipariş kalemi
  - `upd` — Siparişi güncelleyen REST API yanıt nesnesi
  - `txt` — Güncelleme başarısız olduğunda hata metni
  - `payload` — Audit insert için veri yükü
  - `_e` — Dış try-catch bloğunda yakalanan hata
  - `msg` — Hatanın string temsili
- **Dönüş**: Response (200, 400, 401, 403, 404, 405, 500 durum kodlarıyla)

---

## NODE ID STANDARD

  file: supabase\functions\refund-order-mock\index.ts
  function: supabase\functions\refund-order-mock\index.ts::refund-order-mock_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: refund-order-mock_handler