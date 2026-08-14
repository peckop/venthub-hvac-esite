---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\refund-order-mock\index.ts
skeleton_hash: 4b351dda23d540b3
entity_hashes:
  func:refund-order-mock_handler: 4c50c7cb50c6be68
  overview: b618c82b37f33caf
generated_at: 2026-08-14T22:02:42Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan bir HTTP endpoint'tir. Dışarıdan gelen bir sipariş iade (refund) isteğini alır, basit bir mock (simüle edilmiş) iş mantığı uygular ve önceden tanımlı bir yanıt yapısıyla HTTP cevabı üretir.

## Fonksiyon Grupları
### İstek İşleme ve Mock Yanıt Üretimi
Bu grup, bir iade talebini kabul ederek simüle edilmiş bir iş sonucunu HTTP yanıtı olarak döndürmekten sorumludur.
- refund-order-mock_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir Supabase Edge Function HTTP handler'ıdır; tek bir `req` parametresi alarak mock iade yanıtı üretir.

[Aksiyom 1]: Eğer `req` parametresi geçerli bir HTTP request nesnesi değilse, fonksiyon beklenmeyen bir hata ile karşılaşır veya geçersiz HTTP yanıtı döner.

[Aksiyom 2]: Eğer bu modül çağrılırsa, her zaman **mock (simüle edilmiş)** iade verisi döner; gerçek bir ödeme/iade işleçisi çalışmaz.

[Aksiyom 3]: Eğer istek başarıyla işlenirse, modül **önceden tanımlı bir veri yapısı** ile HTTP yanıt nesnesi üretir.

[Aksiyom 4]: Eğer istek işlenirken bir hata oluşursa, modülün bu duruma nasıl yanıt verdiği implementasyona bağlıdır (docstring'de hata senaryosu tanımlanmamıştır).

---

## FONKSİYON DETAYLARI

### refund-order-mock_handler
**Ne yapar**: Bu fonksiyon, bir siparişin geri ödemesi (refund) işlemini isteyen bir HTTP isteğini (request) ele alır. Fonksiyon, verilen bilgilere dayanarak bir geri ödeme işlemini **sahte (mock)** olarak simüle eder ve sonucu bildiren bir HTTP yanıtı (response) üretir. Bu, gerçek bir ödeme ağ geçidine (payment gateway) bağlanmadan test ve geliştirme süreçleri için kullanılan bir simülasyon fonksiyonudur.

**Nasıl yapar**: Fonksiyon, gelen isteğin (req) gövdesini (body) ayrıştırarak `order_id` ve `refund_reason` alanlarını bekler. Bu alanların varlığını ve türlerini doğrular. Doğrulama başarılı olursa, belirli bir geri ödeme işlemi iş mantığını (örneğin, bir veritabanı kaydını güncelleme) simüle eden bir dizi adım çalıştırır. İşlem的成功ızlıkla tamamlanırsa, succeeded: true durumu ile bir yanıt döner; herhangi bir hata (geçersiz parametre, eksik alan) oluşursa, succeeded: false ve bir hata mesajı içeren bir yanıt üretir.

**Parametreler**:
- `req`: Request — Supabase Edge Function tarafından sağlanan ve isteği temsil eden HTTP Request nesnesi. Fonksiyon bu nesnenin `body` özelliğinden JSON verisini okur.

**Dönüş**: Response — Fonksiyon, her durumda bir HTTP Response nesnesi döndürür. Başarılı simülasyon durumunda `200 OK` durum kodu ve `{ succeeded: true, message: string, order_id: string }` yapısında bir JSON gövdesi; hata durumunda `400 Bad Request` veya `500 Internal Server Error` durum kodu ve `{ succeeded: false, error: string }` yapısında bir JSON gövdesi döner.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://deno.land/std@0.168.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### RefundRequest
- `order_id: string`
- `amount?: number`
- `reason?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/refund-order-mock/index.ts::refund-order-mock_handler
- **params**: `(req)` — HTTP request nesnesi (Deno.Request), method, headers, body barındırır
- **ic_degiskenler**:
  - `origin` — `req.headers.get('origin')` ile alınan origin değeri, yoksa `'*'` fallback
  - `cors` — CORS başlık nesnesi; `Access-Control-Allow-Headers` ve `Access-Control-Allow-Methods` içerir
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase URL'i, boş string fallback
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan service role anahtarı, boş string fallback
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anon anahtarı, boş string fallback
  - `authHeader` — `req.headers.get('authorization')` ile alınan Authorization başlık değeri
  - `authClient` — `createClient(supabaseUrl, anonKey, {...})` ile oluşturulan Supabase istemcisi; auth header'ı global olarak eklenmiştir
  - `user` — `authClient.auth.getUser()` destructured `data.user`; kimliği doğrulanmış kullanıcı nesnesi
  - `authErr` — `authClient.auth.getUser()` destructured `error`; auth hatası veya null
  - `actorUserId` — `user.id` değerinden alınan işlem yapan kullanıcının UUID'si
  - `body` — `req.json()` ile parse edilen istek gövdesi, `RefundRequest` tipine cast; `order_id`, `amount`, `reason` alanlarını barındırır
  - `order_id` — `body.order_id` değerinin trim edilmiş hali; hedef siparişin UUID'si
  - `amount` — `body.amount` değerinden; sayı ve finite ise `Number(body.amount)`, değilse `undefined`
  - `reason` — `body.reason` değerinden; string ise ilk 140 karaktere kesilmiş iade sebebi
  - `ordResp` — `${supabaseUrl}/rest/v1/venthub_orders?id=eq.${order_id}&select=...` REST sorgusunun fetch yanıtı
  - `arr` — `ordResp.json()` sonucu; sipariş satırları dizisi veya boş dizi
  - `order` — `arr[0]` ilk sipariş kaydı veya null; `id`, `user_id`, `status`, `payment_status`, `total_amount`, `payment_debug` alanları içerir
  - `isAdmin` — boolean; `actorUserId` varsa `user_profiles` tablosundan rol kontrolü ile `true`/`false`
  - `prof` — `${supabaseUrl}/rest/v1/user_profiles?id=eq.${actorUserId}&select=role` REST sorgusunun fetch yanıtı
  - `prows` — `prof.json()` sonucu; profil satırları dizisi
  - `prow` — `prows[0]` ilk profil kaydı veya null; `role` alanını barındırır
  - `isOwner` — boolean; `actorUserId` ve `order.user_id` eşleşiyorsa `true`
  - `totalAmount` — `order.total_amount` değerinden `Number()` ile parse edilen toplam sipariş tutarı
  - `target` — iade hedef tutarı; `amount` geçerli pozitif sayıysa `amount`, değilse `totalAmount`
  - `isFull` — boolean; `target >= totalAmount` ise tam iade, değilse kısmi iade
  - `newPaymentStatus` — `'refunded'` (tam iade) veya `'partial_refunded'` (kısmi iade)
  - `newOrderStatus` — tam iadeyse ve sipariş `shipped`/`delivered` dışındaysa `'cancelled'`, aksi halde mevcut `order.status`
  - `dbg` — `order.payment_debug` değerinden mevcut ödeme debug nesnesi, boş nesne fallback
  - `newDebug` — `dbg` üzerine spread ile `mock_refund`, `mock_refund_reason`, `refund_type`, `refund_amount`, `refunded_total`, `partial_refunds` alanları eklenmiş güncellenmiş debug nesnesi
  - `itemsResp` — tam iade durumunda `${supabaseUrl}/rest/v1/venthub_order_items?order_id=eq.${order_id}&select=product_id,quantity` REST sorgusunun fetch yanıtı
  - `items` — `itemsResp.json()` sonucu; sipariş kalemleri dizisi
  - `it` — `items` dizisi üzerindeki `for` döngüsünün her elemanı; `product_id` ve `quantity` alanlarını barındırır
  - `upd` — `${supabaseUrl}/rest/v1/venthub_orders?id=eq.${order_id}` PATCH isteğinin fetch yanıtı; sipariş güncellemesi sonucu
  - `txt` — `upd` başarısızsa `upd._text()` ile alınan hata gövdesi metni
  - `payload` — audit insert için nesne: `{ order_id, amount: target, reason, actor_user_id }`
  - `_e` — `catch` bloğu yakalama değişkeni; `unknown` tipinde hata nesnesi
  - `msg` — `_e` Error ise `_e.message`, değilse `String(_e)` ile elde edilen hata mesajı stringi
- **Dönüş**: `Response` — her durumda HTTP Response döner; başarıda `{ ok: true, order_id, payment_status, amount }` JSON gövdesi, hatalarda farklı hata kodlarıyla hata JSON'u

---

## NODE ID STANDARD

  file: supabase\functions\refund-order-mock\index.ts
  function: supabase\functions\refund-order-mock\index.ts::refund-order-mock_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: refund-order-mock_handler