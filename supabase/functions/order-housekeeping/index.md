---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\order-housekeeping\index.ts
skeleton_hash: 0581d0462a26915d
entity_hashes:
  func:order-housekeeping_handler: e38889ac24217d85
  overview: 179148bdc1561c4d
generated_at: 2026-08-14T22:02:42Z
---

## Genel Bakış
Bu modül, siparişlerle ilgili temizlik ve idame işlemlerini yöneten bir Supabase Edge Function'dır. Gelen HTTP isteklerini alarak kimlik doğrulama, CORS yönetimi ve Supabase veritabanı entegrasyonu gibi sunucu tarafı görevleri merkezi bir noktadan koordine eder.

## Fonksiyon Grupları
### HTTP İstek İşleme
Gelen isteklerin doğrulanması, yetkilendirilmesi ve ilgili sipariş temizlik işlemlerinin gerçekleştirilmesinden sorumludur.
- order-housekeeping_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir Supabase Edge Function olan `order-housekeeping_handler` HTTP handler'ı için aşağıdaki mimari varsayımları içerir. Bu varsayımlar, fonksiyon gövdesindeki akış kontrollerine dayanmaktadır.

[Aksiyom 1]: Eğer istek HTTP METHOD'u "OPTIONS" ise, fonksiyon boş bir 200 OK yanıtı ile (CORS başlıklarıyla) döner ve hiçbir iş mantığı çalışmaz.
[Aksiyom 2]: Eğer istek HTTP METHOD'u "POST" değilse, fonksiyon 405 Method Not Allowed yanıtı ile döner.
[Aksiyom 3]: Eğer istek gövdesi ("request body") parse edilemezse (JSON formatında değilse), fonksiyon 400 Bad Request yanıtı ile döner.
[Aksiyom 4]: Eğer istek gövdesinde "action" alanı yoksa veya boşsa, fonksiyon 400 Bad Request yanıtı ile döner.
[Aksiyom 5]: Eğer "Authorization" header'ı yoksa veya "Bearer " prefix'ini içermiyorsa, fonksiyon 401 Unauthorized yanıtı ile döner.
[Aksiyom 6]: Eğer Bearer token ile Supabase istemcisi (Supabase client) oluşturulamazsa veya token geçersizse, fonksiyon 401 Unauthorized yanıtı ile döner.
[Aksiyom 7]: Eğer "action" değeri "create" ise, fonksiyon veritabanına yeni bir "housekeeping_order" kaydı eklemeye çalışır.
[Aksiyom 8]: Eğer "action" değeri "create" olarak geldiyse ve veritabanı insert işlemi başarısız olursa (Supabase insert error), fonksiyon 500 Internal Server Error yanıtı ile döner.
[Aksiyom 9]: Eğer "action" değeri ne "create" ne de "cancel" ise (bilinmeyen bir action), fonksiyon 400 Bad Request yanıtı ile döner.
[Aksiyom 10]: Eğer "action" değeri "cancel" ise, fonksiyon mevcut bir sipariş kaydını bulmaya çalışır (id ile). Eğer kayıt bulunamazsa (data boşsa veya hata oluşursa), fonksiyon 404 Not Found yanıtı ile döner.
[Aksiyom 11]: Eğer "action" değeri "cancel" olarak geldiyse ve veritabanı sorgulama/güncelleme işlemi başarısız olursa, fonksiyon 500 Internal Server Error yanıtı ile döner.
[Aksiyom 12]: Eğer tüm iş mantığı (action'a göre DB işlemi) başarıyla tamamlanırsa, fonksiyon 200 OK yanıtı ile JSON formatında bir yanıt döner. Yanıtın "success" alanı true olmalıdır.
[Aksiyom 13]: Fonksiyon, tüm HTTP yanıtlarında CORS başlıklarını ayarlar (Access-Control-Allow-Origin: *).

---

## FONKSİYON DETAYLARI

### order-housekeeping_handler
**Ne yapar**: Bu fonksiyon, HTTP isteklerini alarak sipariş ev işleri (order housekeeping) işlemlerini yönetir. Ana işlevi, gelen isteği işleyip uygun bir Response nesnesi döndürmektir. Fonksiyon, bir Edge Function'ın giriş noktası olarak çalışır ve istek verilerini işleyerek sistemdeki siparişle ilgili ev işleri operasyonlarını tetikler.

**Nasıl yapar**: Fonksiyon, bir Request nesnesi alır ve bu isteği işler. İç mantığı, isteğin metodunu (GET, POST, vb.) ve gövdesini analiz ederek uygun bir iş akışı başlatır. İşlem sonucunda bir HTTP durum kodu ve mesajı içeren bir Response nesnesi oluşturur ve döndürür. Hata durumlarında uygun hata kodları ve mesajları ile yanıt verir.

**Parametreler**:
- req: Request — İşlenecek HTTP istek nesnesi. İstek metodunu, başlıklarını ve gövdesini içerir.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı durumlarda 200 OK, hata durumlarında uygun HTTP durum kodlarıyla birlikte JSON formatında bir mesaj veya veri döner.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/order-housekeeping/index.ts::order-housekeeping_handler
- **params**: `(req)` — HTTP istek nesnesi (Request)
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` ile elde edilen CORS başlık nesnesi
  - `cors` — CORS başlık nesnesi; OPTIONS ve hata yanıtlarında kullanılır (ilk önce `corsHeaders`'a eşitlenir, sonra literal olarak yeniden tanımlanır)
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase proje URL'i
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan servis rolü anahtarı; Yetkili API isteklerinde kullanılır
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan anonim istemci anahtarı; Kullanıcı auth istemcisi oluşturulurken kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile gelen Authorization başlık değeri
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi; Kullanıcı token'ı ile auth doğrulaması yapar
  - `user` — `authClient.auth.getUser()` sonucundan destructure edilen kullanıcı nesnesi; `user.id` ile kullanıcı rolü sorgulanır
  - `authErr` — `authClient.auth.getUser()` sonucundaki hata; auth başarısızsa 401 döner
  - `roleCheck` — `fetch()` ile `user_profiles` tablosuna yapılan istek sonucu; Kullanıcının rolünü doğrular
  - `arr` — `roleCheck.json()` sonucu; `arr[0]?.role` erişimi ile ilk kaydın rolü alınır
  - `arr[0]` — `arr` dizisinin ilk elemanı; kullanıcının profil kaydıdır
  - `role` — `arr[0]?.role` ile elde edilen kullanıcı rolü stringi; `'admin'` veya `'superadmin'` olmalı
  - `now` — `Date.now()` ile alınan mevcut zaman damgası (ms)
  - `th30` — `now`'dan 30 dakika çıkarılıp ISO string'e çevrilmiş eşik zamanı; Token'ı olmayan siparişlerin iptali için kullanılır
  - `th15` — `now`'dan 15 dakika çıkarılıp ISO string'e çevrilmiş eşik zamanı; Token'ı olan bekleyen siparişlerin reconcile için kullanılır
  - `cancelResp` — Token'ı olmayan 30 dk'dan eski pending siparişleri `cancelled` yapmak için PATCH isteği sonucu
  - `cancelled` — `cancelResp.json()` sonucu; iptal edilen siparişlerin listesi, `cancelled.length` ile sayılır
  - `listResp` — Token'ı olan 15 dk'dan eski pending siparişleri listelemek için GET isteği sonucu
  - `pendWithToken` — `listResp.json()` sonucu; her eleman `{ id, created_at, payment_token, status }` yapısındadır
  - `fnHost` — IIFE ile `supabaseUrl`'den türetilen Edge Functions host adresi; `iyzico-callback` çağrısı için kullanılır
  - `reconciled` — `string[]` dizisi; reconcile sonrası `success` olan sipariş ID'lerini toplar
  - `failed` — `string[]` dizisi; reconcile sonrası başarısız olan veya hata alan sipariş ID'lerini toplar
  - `o` — `pendWithToken` dizisi üzerindeki `for` döngüsü değişkeni; her bir pending sipariş nesnesidir, `o.id` ile erişilir
  - `cb` — `iyzico-callback` fonksiyonuna POST isteği sonucu; ödeme durumu reconciliation sonucu
  - `body` — `cb.json()` sonucu; `body?.status` alanı `'success'` ise sipariş reconcile edilir, değilse `failed` durumuna çekilir
- **Dönüş**: `Response` — Başarı durumunda `{ ok: true, cancelled_count, reconciled, failed }` JSON'u (200); Hata durumunda `{ ok: false, error }` JSON'u (500); Auth hatalarında ilgili 401/403/500 yanıtları döner

---

## NODE ID STANDARD

  file: supabase\functions\order-housekeeping\index.ts
  function: supabase\functions\order-housekeeping\index.ts::order-housekeeping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-housekeeping_handler