---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: 7a7e3250996d2d50
generated_at: 2026-05-24T07:30:20Z
---

## Genel Bakış
Bu modül, Supabase üzerindeki admin güncelleme işlevini sağlayan bir HTTP işleyicidir. Admin tarafından gönderilen kargo bilgisi güncelleme isteklerini alır, doğrular ve ilgili veri tabanı güncelleme işlemini tetikler.

## Fonksiyon Grupları
### İstek İşleme
Tek bir fonksiyon, gelen istekleri işler ve uygun yanıt üretir.
- admin-update-shipping_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### admin-update-shipping_handler
**Ne yapar**: Fonksiyonun amacı belgelenmemiştir.  
**Nasıl yapar**: İç mantığı belgelenmemiştir.  
**Parametreler**:
- req: type unknown — description: sağlanmadı  
**Dönüş**: Response — description: sağlanmadı

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::admin-update-shipping_handler
- **params**: req
- **ic_degiskenler**:
  - requestId — unique identifier for the request, generated via crypto.randomUUID or timestamp fallback
  - origin — value of the Origin header from the incoming request
  - allowed — array of allowed origins parsed from the ALLOWED_ORIGINS environment variable (split by ',', trimmed, empty values removed)
  - okOrigin — boolean flag indicating whether the request origin is permitted (true if allowed list empty or origin present in allowed)
  - cors — object containing CORS response headers to be applied on every outgoing response
  - ct — lower‑cased Content‑Type header value used to verify the request carries JSON
  - max — maximum allowed request body size in bytes (derived from MAX_BODY_KB env, default 200 KB)
  - cl — numeric Content‑Length header value (default 0 if missing or unparsable)
  - _text — raw request body text obtained via req._text()
  - parsed — object resulting from JSON.parse(_text); empty object if parsing fails or body is empty
  - order_id — order identifier extracted from JSON body (order_id/orderId) or query string
  - carrier — shipping carrier name extracted from body or query string
  - tracking_number — tracking number extracted from body or query string
  - tracking_url — optional tracking URL extracted from body or query string
  - send_email — boolean flag determining whether to send an e‑mail notification (defaults to true)
  - supabaseUrl — Supabase project URL read from SUPABASE_URL env
  - anonKey — Supabase anon key read from SUPABASE_ANON_KEY env
  - serviceKey — Supabase service role key read from SUPABASE_SERVICE_ROLE_KEY env
  - authHeader — Authorization header value taken from the incoming request
  - authClient — Supabase client instantiated with anonKey and the auth header for user‑level calls
  - user — authenticated user object returned by authClient.auth.getUser()
  - authErr — error object from authClient.auth.getUser() (null on success)
  - roleCheck — fetch Response when querying the user_profiles table to check the user’s role
  - arr — temporary array holding the JSON rows returned from a Supabase query
  - role — role string (e.g., 'admin', 'superadmin') of the authenticated user
  - isCurrentlyShipped — flag set to true if the order already has a shipped_at timestamp or status 'shipped'
  - cur — fetch Response used to retrieve the current order record (status, shipped_at)
  - row — first element of the query result array representing the order (may be undefined)
  - wantCancel — boolean that triggers the cancel flow when either cancel is explicitly true or the order is already shipped but carrier/tracking missing
  - updCancel — fetch Response of the PATCH request that reverts shipping fields (carrier, tracking_number, tracking_url, shipped_at, status)
  - txt — error body text extracted from a failed fetch response (used for error reporting)
  - qs — URLSearchParams instance built from req.url for reading query string parameters
  - isFirstShip — flag indicating whether this is the first time the order is being marked as shipped
  - patchBody — object containing the fields to update in the order record (carrier, tracking_number, tracking_url, optionally shipped_at and status)
  - upd — fetch Response of the main PATCH request that applies the shipping update
  - headerKey — idempotency key supplied via the x-idempotency‑key header (may be empty)
  - derivedKey — SHA‑256 hash (hex string) computed from action, orderId, carrier and tracking number
  - idemKey — final idempotency key used (headerKey if present, otherwise derivedKey)
  - customer_email — e‑mail address of the order’s customer, fetched via the Auth Admin API
  - customer_name — full name of the customer, derived from user_metadata.full_name or user_metadata.name
  - ordResp — fetch Response when retrieving basic order info (user_id, order_number)
  - uid — user_id foreign key value from the order record
  - usrResp — fetch Response when retrieving the user record via Supabase Auth Admin API
  - u — parsed JSON user object containing email and optional metadata
  - metaName — name extracted from u.user_metadata.full_name or u.user_metadata.name
  - emailResult — object tracking the outcome of the e‑mail notification attempt ({sent: boolean, disabled: false})
  - resp — fetch Response from the shipping‑notification function
  - j — parsed JSON from the shipping‑notification response (may contain disabled flag or result)
  - body — JSON payload logged to the shipping_email_events table (best‑effort)
  - _e — caught error in the outer try/catch block
  - msg — error message string derived from _e (used for unexpected error responses)
- **Dönüs**: Response

### [N2_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::pick
- **params**: keys
- **ic_degiskenler**:
  - k — iterator variable holding the current key being inspected from the keys array
  - v — value associated with key k in the parsed object
- **Dönüs**: string | null

### [N3_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::cancel
- **params**: (none)
- **ic_degiskenler**:
  - vRaw — raw value for the cancel flag taken from parsed body or query string param
- **Dönüs**: boolean

### [N4_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::send_email
- **params**: (none)
- **ic_degiskenler**:
  - v — raw value for the send_email flag taken from parsed body or query string param
- **Dönüs**: boolean

### [N5_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::computeIdemKey
- **params**: action, orderId, carrier, tn
- **ic_degiskenler**:
  - raw — concatenated string "action|orderId|carrier|tn" used as input to the hash function
  - bytes — Uint8Array representation of raw encoded via TextEncoder
  - hash — ArrayBuffer containing the SHA‑256 digest of bytes
- **Dönüs**: string (hex‑encoded SHA‑256 hash)

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler