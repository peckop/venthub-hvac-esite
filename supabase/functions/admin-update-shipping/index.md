---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: 3eb11ad216d5654c
entity_hashes:
  func:admin-update-shipping_handler: fab3b88ab551f027
  overview: 8251562ffb6b834e
generated_at: 2026-08-15T07:34:13Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan bir kargo güncelleme servisidir. Yönetici kullanıcıların siparişlere ait kargo bilgilerini güvenli bir şekilde güncellemesini sağlar. Tek bir HTTP istek işleyicisi üzerinden kimlik doğrulama, yetki kontrolü ve veritabanı güncelleme işlemlerini yönetir.

## Fonksiyon Grupları

### İstek İşleme ve Yanıt Üretme
Gelen HTTP isteklerini alır, yönetici kimliğini doğrular ve yetki kontrolünü gerçekleştirir. İşlem sonucuna göre başarılı veya hatalı bir HTTP yanıtı döndürerek istemciye geri bildirim sağlar.
- admin-update-shipping_handler

---

**Not:** Modül tek fonksiyondan oluştuğu için, tüm sorumluluklar bu işleyici içerisinde gerçekleştirilir. Fonksiyon gövdesi paylaşılmadığından, iç bağımlılıklar (veritabanı tabloları, harici servisler) ve detaylı akış hakkında kesin bilgi verilememektedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesine erişilmeksizin sadece imza bilgisinden türetilen temel mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `admin_update_shipping_handler` fonksiyonu bir `req` parametrisiz çağrılırsa, fonksiyon çalıştırılamaz (TypeError oluşur).

[Aksiyom 2]: Eğer `Response` sınıfı/nesnesi çalışma ortamında mevcut değilse, fonksiyonun HTTP yanıt üretmesi mümkün olmaz ve modül hiç bir isteğe yanıt veremez.

[Aksiyom 3]: Eğer `req` parametresi geçerli bir istek (request) nesnesi değilse, fonksiyonun isteği doğru şekilde işleyememesi beklenir (çalışma zamanı hatası veya beklenmeyen davranış oluşur).

[Aksiyom 4]: Eğer modül asenkron (async) ortamda çalıştırılmazsa, `await` tabanlı iç bağımlılıkların çalışması başarısız olur.

> **Not:** Fonksiyon gövdesine erişilemediğinden, modülün iç iş mantığına (kimlik doğrulama, yetki kontrolü, veritabanı sorguları, eşik değerleri vb.) ilişkin aksiyomlar burada tanımlanamamıştır. Bu aksiyomlar fonksiyon gövdesi incelendiğinde eklenecektir.

---

## FONKSİYON DETAYLARI

### admin-update-shipping_handler
**Ne yapar**: Bu fonksiyon, bir HTTP isteği alarak bir yanıt döndüren bir Supabase Edge Function istek işleyicisidir. Fonksiyonun adı, yöneticilerin kargo veya gönderi bilgilerini güncellemek üzere tasarlandığını belirtir.
**Nasıl yapar**: Fonksiyon, gelen HTTP istek nesnesini (req) alır, istek içeriğine göre kargo güncelleme işlemlerini başlatır ve sonuç olarak bir HTTP yanıt nesnesi (Response) oluşturur. İşlem mantığı, istek verilerine dayanarak arka uçta veri tabanı güncellemeleri yapmayı ve durum kodlarını ayarlamayı içerir.
**Parametreler**:
- req: Request — İşlenecek olan HTTP isteği nesnesi. İstek gövdesinde veya parametrelerinde kargo güncellemelerine ilişkin veriler taşır.
**Dönüş**: Response — İşlemin sonucunu belirten bir HTTP yanıtı. Başarılı bir güncelleme için uygun bir durum kodu (örn. 200 OK) ve gerekirse bir mesaj içerir; hata durumunda ise hata kodu ve açıklama döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant_config.ts::resolveTenantId
- import: https://deno.land/std@0.168.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin-update-shipping/index.ts::admin-update-shipping_handler
- **params**: `req` — HTTP request object (Deno Request)
- **ic_degiskenler**:
  - `requestId` — uniquely identifies the request for tracing; generated via `crypto.randomUUID()` or `Date.now()` fallback
  - `origin` — Origin header value from the incoming request
  - `allowed` — array of allowed CORS origins parsed from `ALLOWED_ORIGINS` env var
  - `okOrigin` — boolean; true if origin is absent, allowed list is empty, or origin is in allowed list
  - `cors` — CORS headers object returned by `getCorsHeaders(req)`
  - `ct` — lowercased Content-Type header for media type validation
  - `max` — maximum allowed body size in bytes; parsed from `MAX_BODY_KB` env var
  - `cl` — Content-Length header value as integer
  - `_text` — raw request body as text string via `req.text()`
  - `parsed` — JSON-parsed request body; defaults to `{}` on empty body or parse error
  - `pick` — inner helper function that extracts first matching string/number value from `parsed` given a list of keys
  - `qs` — URL search parameters from `req.url`
  - `cancel` — boolean parsed from `parsed['cancel']` or `qs.get('cancel')`; triggers cancel flow
  - `order_id` — order identifier; extracted from body keys `order_id`/`orderId` or query params
  - `carrier` — shipping carrier name; extracted from body key `carrier` or query param
  - `tracking_number` — tracking number; extracted from body keys `tracking_number`/`trackingNumber` or query params
  - `tracking_url` — tracking URL; extracted from body keys `tracking_url`/`trackingUrl` or query params
  - `send_email` — boolean; controls whether shipping notification email is sent; defaults to `true`
  - `supabaseUrl` — Supabase project URL from `SUPABASE_URL` env var
  - `anonKey` — Supabase anonymous key from `SUPABASE_ANON_KEY` env var
  - `serviceKey` — Supabase service role key from `SUPABASE_SERVICE_ROLE_KEY` env var
  - `authHeader` — raw `Authorization` header value
  - `authClient` — Supabase client initialized with user's JWT for identity verification
  - `jwt` — extracted JWT string from `authHeader` (Bearer prefix stripped)
  - `user` — authenticated user object obtained via `authClient.auth.getUser(jwt)`
  - `authErr` — error object from auth verification; triggers 401 if present
  - `tenantId` — resolved tenant identifier via `resolveTenantId(req, parsed)`
  - `roleCheck` — fetch response to query `user_profiles` for caller's role
  - `arr` — JSON array result from role check query
  - `role` — user's role string (`admin` or `superadmin` required)
  - `isCurrentlyShipped` — boolean; true if order already has `shipped_at` set or status is `shipped`
  - `cur` — fetch response querying current order status (cancel path)
  - `row` — first row from order status query (cancel path); checked for `shipped_at` and `status`
  - `wantCancel` — boolean; true if cancel is explicitly requested or implicit cancel applies
  - `updCancel` — fetch response for PATCH that reverts shipping fields to null
  - `txt` — error response text from failed cancel update
  - `isFirstShip` — boolean; true if order has not been shipped before (controls `shipped_at` and `status` update)
  - `cur` — fetch response querying current order status (ship path)
  - `row` — first row from order status query (ship path)
  - `computeIdemKey` — inner async function that computes SHA-256 idempotency key from action/orderId/carrier/tracking
  - `patchBody` — object sent in PATCH body; always includes `carrier`, `tracking_number`, `tracking_url`; conditionally includes `shipped_at` and `status`
  - `upd` — fetch response for PATCH update of order with shipping info
  - `txt` — error response text from failed order update
  - `headerKey` — idempotency key from `x-idempotency-key` request header
  - `derivedKey` — computed SHA-256 idempotency key via `computeIdemKey`
  - `idemKey` — final idempotency key; prefers header value over derived
  - `customer_email` — customer's email address fetched from Auth Admin API; nullable
  - `customer_name` — customer's full name from user metadata; nullable
  - `ordResp` — fetch response querying order for `user_id` and `order_number`
  - `arr` — JSON array from order details query
  - `row` — first row containing `user_id` and `order_number`
  - `uid` — `user_id` from the order row; used to fetch user profile
  - `usrResp` — fetch response to Auth Admin API for user profile
  - `u` — user object with `email` and `user_metadata` fields
  - `metaName` — name extracted from `user_metadata.full_name` or `user_metadata.name`
  - `emailResult` — object `{ sent: boolean, disabled: boolean }` tracking email notification outcome
  - `resp` — fetch response to `shipping-notification` edge function
  - `j` — parsed JSON response from shipping notification; contains `disabled`, `subject`, `result.id`
  - `body` — JSON string body for logging shipping email event to `shipping_email_events` table
- **Dönüş**: `Response` — HTTP response; 200 with `{ ok: true, email: emailResult }` on success; various error codes (400, 401, 403, 405, 413, 415, 500) on failure

---

### [N2_NASIL] AST Pointer: admin-update-shipping/index.ts::pick
- **params**: `keys: string[]` — list of property names to search in parsed body
- **ic_degiskenler**:
  - `k` — current key being iterated from `keys` array
  - `v` — value retrieved from `parsed[k]`; checked for string or finite number type
- **Dönüş**: `string | null` — trimmed string value of first matching key, or `null` if no match

---

### [N3_NASIL] AST Pointer: admin-update-shipping/index.ts::cancel_iife
- **params**: yok (IIFE — parametre almaz)
- **ic_degiskenler**:
  - `vRaw` — raw cancel value; first tries `parsed['cancel']`, falls back to `qs.get('cancel')`; can be boolean or string
- **Dönüş**: `boolean` — `true` if cancel is requested; `false` by default

---

### [N4_NASIL] AST Pointer: admin-update-shipping/index.ts::send_email_iife
- **params**: yok (IIFE — parametre almaz)
- **ic_degiskenler**:
  - `v` — raw send_email value; resolves from `parsed['send_email']`, `parsed['sendEmail']`, `qs.get('send_email')`, or `qs.get('sendEmail')`
- **Dönüş**: `boolean` — `true` if email should be sent (default); `false` only if explicitly set to false

---

### [N5_NASIL] AST Pointer: admin-update-shipping/index.ts::computeIdemKey
- **params**: `action: 'ship' | 'cancel'` — action type, `orderId: string` — order identifier, `carrier?: string | null` — carrier name, `tn?: string | null` — tracking number
- **ic_degiskenler**:
  - `raw` — pipe-delimited string concatenation of `[action, orderId, carrier, tn]`
  - `bytes` — UTF-8 encoded byte array of `raw` via `TextEncoder`
  - `hash` — SHA-256 digest of `bytes` via `crypto.subtle.digest`
- **Dönüş**: `Promise<string>` — hex-encoded SHA-256 hash string

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler