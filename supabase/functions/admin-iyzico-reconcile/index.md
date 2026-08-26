---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\admin-iyzico-reconcile\index.ts
skeleton_hash: a9fe4c7afba6313c
entity_hashes:
  func:admin-iyzico-reconcile_handler: e8970eccf3f1fb90
  overview: b0badc73158954b7
generated_at: 2026-08-25T07:33:07Z
---

## Genel Bakış

Bu modül, Supabase Edge Function olarak çalışan bir admin mutabakat (reconciliation) servisidir. iyzico ödeme sağlayıcısı ile sistem arasındaki işlem kayıtlarını karşılaştırarak uyumsuzlukları tespit etme ve düzeltme amacıyla kullanılır. Modül, gelen HTTP isteklerini tek bir handler üzerinden işler.

## Fonksiyon Grupları

### Ana Handler

Gelen HTTP isteklerini karşılayan ve iyzico mutabakat sürecini tetikleyen tek giriş noktasıdır. Supabase'in `serve` dekoratörü ile tanımlanmış olup, istek parametrelerini alıp uygun mutabakat işlemlerini yürütür ve sonuç olarak bir Response döndürür.

- admin-iyzico-reconcile_handler

### Dış Bağımlılıklar

Modül, Supabase Edge Function altyapısına (`Deno.serve` ve `@serve` dekoratörü) bağlıdır. iyzico API'si ile iletişim kurması beklenmektedir; ancak kaynak kodda bu iletişimi sağlayan yardımcı fonksiyon veya modül ayrıntıları verilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, modülün doğru çalışması için hangi koşulların (örneğin harici API erişimi, veritabanı bağlantısı, yetkilendirme mekanizması, eşik değerleri vb.) gerektiğini belirleyecek kaynak bilgi bulunmamaktadır. Yalnızca fonksiyon imzası (`req` alır, `Response` döndürür) ve çalıştırma ortamı (`@serve(Deno.serve)`) bilinmektedir; bunlar genel çerçeve varsayımlarıdır, modüle özgü aksiyom değildir.

---

## FONKSİYON DETAYLARI

### admin-iyzico-reconcile_handler
**Ne yapar**: iyzico ödeme sistemi ile mutabakat (reconciliation) işlemini gerçekleştiren bir HTTP sunucu fonksiyonudur. Supabase Edge Function ortamında çalışır ve gelen HTTP isteklerini işleyerek iyzico mutabakat sürecini yönetir.

**Nasıl yapar**: `@serve(Deno.serve)` dekoratörü ile Dono runtime'ında bir HTTP handler olarak kaydedilir. Bu dekoratör, fonksiyonun dışarıdan gelen HTTP isteklerini dinlemesini ve yanıt üretmesini sağlar. Fonksiyon `async` olarak tanımlanmıştır, bu sayede asenkron işlemler (veritabanı sorguları, harici API çağrıları vb.) gerçekleştirilebilir. Fonksiyonun iç mantığı hakkında verilen kaynakta detaylı bilgi bulunmamaktadır.

**Parametreler**:
- req: Request — Gelen HTTP isteğini temsil eder. İstek gövdesi, başlıkları ve diğer HTTP verilerini içerir.

**Dönüş**: Response — Fonksiyon, HTTP yanıt nesnesi döndürür. Yanıt durum kodu, başlıklar ve isteğe bağlı yanıt gövdesi içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-iyzico-reconcile/index.ts::admin-iyzico-reconcile_handler
- **params**: `req` — gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısından dönen CORS başlık nesnesi
  - `cors` — `corsHeaders` değişkeninin kısa alias'ı; tüm yanıt başlıklarında kullanılır
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'i; ortam değişkeni yoksa CONFIG_MISSING hatası döner
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan servis rol anahtarı; RPC ve rol kontrolü fetch'lerinde Authorization başlığında kullanılır
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anonim anahtar; `authClient` oluşturmak için kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme başlığı; yoksa 401 döner
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi; `authHeader` global header olarak eklenir, kullanıcı doğrulaması için kullanılır
  - `user` — `authClient.auth.getUser(...)` sonucu destructuring ile alınan kullanıcı nesnesi; `user.id` rol kontrolünde kullanılır
  - `authErr` — `authClient.auth.getUser(...)` sonucu destructuring ile alınan hata; varsa veya `user` yoksa 401 döner
  - `roleCheck` — `fetch` ile `${supabaseUrl}/rest/v1/user_profiles?id=eq.${user.id}&select=role` endpoint'ine yapılan HTTP yanıtı; kullanıcının rolünü doğrulamak için kullanılır
  - `arr` — `roleCheck.json().catch(() => [])` sonucu dönen dizi; `.catch` ile JSON parse hatasında boş dizi döner
  - `role` — `arr[0]?.role` ile alınan kullanıcı rolü string'i; `'admin'` veya `'super_admin'` değilse 403 döner
  - `id` — sipariş filtreleme için kullanılan ID; POST isteğinde `body?.id`, diğer durumlarda `url.searchParams.get('id')` ile alınır; başlangıçta `null`
  - `conv` — sipariş filtreleme için kullanılan conversation ID; POST isteğinde `body?.conv`, diğer durumlarda `url.searchParams.get('conv')` ile alınır; başlangıçta `null`
  - `body` — POST isteğinde `req.json().catch(() => null)` ile parse edilen istek gövdesi; `id` ve `conv` değerleri buradan çıkarılır
  - `url` — `new URL(req.url)` ile oluşturulan URL nesnesi; GET isteğinde query parametrelerini (`id`, `conv`, `limit`) okumak için kullanılır
  - `l` — `url.searchParams.get('limit')` ile alınan limit string'i; varsa `parseInt` ile sayıya dönüştürülür
  - `limit` — sipariş listeleme limiti; varsayılan `10`, `Math.max(1, Math.min(100, ...))` ile 1-100 aralığına kısıtlanır
  - `rpcListUrl` — `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders` RPC endpoint URL'i
  - `listBody` — RPC'ye POST ile gönderilen istek gövdesi; `{ p_id, p_conv, p_limit, p_status }` alanlarını içerir. `id` ve `conv` yoksa `p_status = 'pending'`, varsa `p_status = null` atanır
  - `listResp` — `fetch(rpcListUrl, ...)` ile yapılan RPC yanıt nesnesi; `serviceRoleKey` ile yetkilendirilir
  - `text` — `listResp.text().catch(() => '')` ile alınan hata metni; RPC başarısız olduğunda yanıt gövdesinde döndürülür
  - `orders` — `listResp.json().catch(() => [])` ile alınan sipariş dizisi; boş veya dizi değilse "no orders found" döner
  - `fnHost` — IIFE ile hesaplanan Supabase Functions host URL'i; `supabaseUrl`'den host çıkarılarak `https://{ref}.functions.supabase.co` formatında oluşturulur, parse hatasında boş string döner
  - `results` — `Array<Record<string, unknown>>` tipinde sonuç dizisi; her sipariş için `{ id, conversation_id, status/skipped/error, ... }` nesneleri eklenir
  - `o` — `orders` dizisi üzerindeki `for...of` döngüsündeki her bir sipariş nesnesi
  - `token` — `o?.payment_token || null` ile alınan ödeme token'ı; yoksa sipariş `skipped:'no_token'` ile atlanır
  - `cbUrl` — `${fnHost}/iyzico-callback` callback fonksiyon URL'i
  - `cbResp` — `fetch(cbUrl, ...)` ile callback fonksiyonuna yapılan HTTP yanıtı; `token`, `conversationId`, `orderId` gönderilir
  - `cbJson` — `cbResp.json().catch(() => ({}))` ile alınan callback JSON yanıtı
  - `st` — `cbJson?.status || 'pending'` ile alınan ödeme durumu; sonuç dizisine `from:'callback'` ile eklenir
  - `e` — `catch` bloğundaki hata nesnesi; `unknown` tipindedir
  - `msg` — `e instanceof Error ? e.message : String(e ?? '')` ile elde edilen hata mesajı string'i; hem üst `catch` bloğunda hem de döngü içi `catch` bloğunda kullanılır
- **Dönüş**: `Response` nesnesi — tüm durumlarda JSON gövdeli HTTP yanıtı döner (200, 401, 403, 500)

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::admin-iyzico-reconcile_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-iyzico-reconcile_handler