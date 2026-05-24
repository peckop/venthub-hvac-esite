---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: 7a7e3250996d2d50
generated_at: 2026-05-24T10:47:56Z
---

## Genel Bakış
Bu modül, Supabase üzerindeki admin güncelleme işlevini sağlayan bir HTTP işleyicidir. Admin tarafından gönderilen kargo bilgisi güncelleme isteklerini alır, doğrular ve ilgili veri tabanı güncelleme işlemini tetikler.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### admin-update-shipping_handler
**Ne yapar**: Bu Supabase Edge Fonksiyonu, yetkili admin kullanıcılarının sistemdeki mevcut kargo bilgilerini güncellemek için kullanılan ana işleyici fonksiyondur. Gelen HTTP isteklerini alır, gerekli doğrulama ve işleme adımlarını gerçekleştirir ve güncelleme işleminin sonucuna uygun bir yanıt döndürür.

**Nasıl yapar**: Öncelikle gelen isteğin kimlik doğrulama bilgilerini kontrol ederek admin yetkisine sahip olup olmadığını doğrular. Eğer yetki geçersizse hemen yetkisiz erişim yanıtı döndürür. Geçerli yetki durumunda isteğin gövdesinden güncellenecek kargo kaydının kimliği ve yeni kargo bilgilerini çıkarır. Ardından Supabase veritabanı bağlantısını kullanarak ilgili kargo kaydını bulur, alınan yeni verilerle günceller. İşlem sırasında herhangi bir hata oluşursa uygun hata kodu ve açıklama içeren yanıt döndürür, başarılı bir güncelleme sonrası ise onay mesajı ve güncellenmiş kargo verisini içeren yanıt gönderir.

**Parametreler**:
- req: Request — Fonksiyona iletilen standart HTTP istek nesnesi, kimlik doğrulama token'ları, istek gövdesi, başlık bilgileri ve diğer istekle ilgili tüm verileri barındırır.

**Dönüş**: Response — İşlem sonucunu belirten HTTP durum kodları ve ilgili veriler içeren yanıt nesnesi. Başarılı durumda 200 OK kodu ile güncellenmiş kargo bilgilerini döndürür; yetkisiz erişimde 401 Unauthorized, geçersiz istek verilerinde 400 Bad Request ve sunucu taraflı hatalarda 500 Internal Server Error kodları ile açıklayıcı mesajlar içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler
- **params**: `req: Request`
- **ic_degiskenler**:
  - `requestId` — Unique request identifier generated via `crypto.randomUUID()` or current timestamp as fallback
  - `origin` — Value of the `Origin` request header, defaults to empty string
  - `allowed` — Trimmed, filtered list of allowed CORS origins from `ALLOWED_ORIGINS` environment variable
  - `okOrigin` — Boolean indicating if the request origin is permitted via CORS rules
  - `cors` — Object containing standard CORS response headers
  - `ct` — Lowercased `Content-Type` request header value, defaults to empty string
  - `max` — Maximum allowed request body size in bytes, derived from `MAX_BODY_KB` environment variable (default 200KB)
  - `cl` — Request body content length from header, defaults to 0 if missing/unparseable
  - `_text` — Raw plaintext body of the incoming request, awaited from the request
  - `parsed` — Parsed JSON request body, defaults to empty object if parsing fails
  - `pick` — Nested helper function to extract valid parameter values from parsed body or query params
  - `qs` — URL search parameters extracted from the request URL
  - `cancel` — Boolean flag indicating if shipping should be canceled, derived from request body or query params
  - `order_id` — Unique identifier for the target order, pulled from body or query params
  - `carrier` — Shipping carrier name, pulled from body or query params
  - `tracking_number` — Package tracking number, pulled from body or query params
  - `tracking_url` — Direct tracking URL for the package, pulled from body or query params
  - `send_email` — Boolean flag indicating if customer notification email should be sent, defaults to true
  - `supabaseUrl` — Supabase project URL from `SUPABASE_URL` environment variable
  - `anonKey` — Supabase anonymous public key from `SUPABASE_ANON_KEY` environment variable
  - `serviceKey` — Supabase service role key from `SUPABASE_SERVICE_ROLE_KEY` environment variable
  - `authHeader` — Value of the `Authorization` request header
  - `authClient` — Authenticated Supabase client instance using the request's authorization header
  - `authErr` — Error returned from the Supabase auth getUser call
  - `user` — Authenticated user data returned from Supabase auth
  - `roleCheck` — Fetch response from Supabase REST API to verify the user's role
  - `arr` — Parsed JSON array from the roleCheck API response, defaults to empty array on failure
  - `role` — User's role from the user_profiles table entry
  - `isCurrentlyShipped` — Boolean indicating if the order is already marked as shipped
  - `wantCancel` — Combined cancel condition, true if explicitly requested or order is already shipped without carrier/tracking
  - `updCancel` — Fetch response from Supabase REST API to cancel order shipping
  - `txt` — Raw text response from failed cancel update request
  - `isFirstShip` — Boolean indicating if this is the first time the order is being marked as shipped
  - `cur` — Fetch response from Supabase REST API to get current order status
  - `row` — First entry from the current order status API response array
  - `patchBody` — Object containing fields to update on the venthub_orders table
  - `upd` — Fetch response from Supabase REST API to update order shipping details
  - `headerKey` — Idempotency key from the `x-idempotency-key` request header
  - `derivedKey` — SHA-256 hashed idempotency key computed from request parameters
  - `idemKey` — Final idempotency key, uses headerKey if present otherwise derivedKey
  - `ordResp` — Fetch response from Supabase REST API to get order user details
  - `uid` — User ID associated with the target order
  - `usrResp` — Fetch response from Supabase Auth Admin API to get customer details
  - `u` — Parsed user data from the Auth Admin API response
  - `customer_email` — Customer's email address fetched from Auth Admin API
  - `customer_name` — Customer's full name from user metadata
  - `emailResult` — Object tracking the status of the shipping notification email
  - `resp` — Fetch response from the shipping-notification edge function
  - `j` — Parsed JSON response from the shipping-notification function
  - `body` — JSON body for logging the shipping email event
  - `_e` — Caught error in the top-level try/catch block
  - `msg` — Extracted error message from the caught exception
- **Dönüş**: `Response` (HTTP response object with appropriate status, headers, and body)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::pick
- **params**: `keys: string[]` (array of parameter keys to search for)
- **ic_degiskenler**:
  - `k` — Current key being iterated over from the input keys array
  - `v` — Value associated with the current key in the parsed request body
- **Dönüş**: `string | null` (Trimmed valid parameter value or null if no valid value found)

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::cancel_flag_getter
- **params**: (no input parameters)
- **ic_degiskenler**:
  - `vRaw` — Raw cancel value pulled from parsed request body or URL query params
- **Dönüş**: `boolean` (Parsed boolean cancel flag, defaults to false if no valid value found)

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::send_email_flag_getter
- **params**: (no input parameters)
- **ic_degiskenler**:
  - `v` — Raw send_email value pulled from parsed request body or URL query params
- **Dönüş**: `boolean` (Parsed boolean send email flag, defaults to true if no valid value found)

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::computeIdemKey
- **params**: `action: 'ship' | 'cancel'`, `orderId: string`, `carrier?: string|null`, `tn?: string|null`
- **ic_degiskenler**:
  - `raw` — Concatenated raw string of all input parameters for hashing
  - `bytes` — UTF-8 encoded binary data of the raw string
  - `hash` — SHA-256 cryptographic hash of the raw byte data
- **Dönüş**: `Promise<string>` (Hex-encoded SHA-256 hash string used as idempotency key)

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler