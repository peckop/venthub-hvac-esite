---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-iyzico-reconcile\index.ts
skeleton_hash: a45e063ea3065638
generated_at: 2026-05-24T07:23:43Z
---

## Genel Bakış
Bu modül, Supabase üzerindeki bir admin fonksiyonudur ve Iyzico ödeme sistemiyle veri karşılaştırma (reconcile) işlemlerini yönetir. Gelen HTTP isteklerini alır, gerekli eşleştirme ve doğrulama adımlarını gerçekleştirir ve işlem sonucunu istemciye yanıt olarak döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Üretimi
Bu grup, dışarıdan gelen istekleri alıp işlemeyi ve uygun HTTP yanıtını üretmeyi担当lar.
- admin-iyzico-reconcile_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### admin-iyzico-reconcile_handler
**Ne yapar**: Admin Iyzico reconciliasyon işlemini yöneten bir handler fonksiyonudur.  
**Nasıl yapar**: Gelen `req` parametresini işleyerek gerekli reconciliasyon mantığını uygular ve sonucu bir `Response` nesnesi olarak döndürür.  
**Parametreler**:
- req: unknown — Handler'a gelen istek nesnesi.  
**Dönüş**: Response — İşlem sonucu oluşturulan yanıt nesnesi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler
- **params**: req — incoming HTTP request object
- **ic_degiskenler**:
  - `cors` — CORS header object used for all responses
  - `supabaseUrl` — Supabase project URL read from environment
  - `serviceRoleKey` — Supabase service role key for privileged operations
  - `anonKey` — Supabase anon key for client‑side auth
  - `authHeader` — value of the Authorization header from the request
  - `authClient` — Supabase client initialized with anon key and user‑level auth header
  - `user` — authenticated user object returned by `authClient.auth.getUser()`
  - `authErr` — error from the Supabase auth getUser call
  - `roleCheck` — fetch response checking the user's role in the `user_profiles` table
  - `arr` — parsed JSON array from the role check response (expected to contain role data)
  - `role` — role string extracted from the first element of `arr`
  - `_id` — order ID filter extracted from request body (POST) or query string (GET)
  - `conv` — conversation ID filter extracted from request body (POST) or query string (GET)
  - `body` — parsed JSON payload of a POST request
  - `url` — URL object built from `req.url` for extracting query parameters in non‑POST requests
  - `_limit` — maximum number of orders to fetch via RPC (hard‑coded to 10)
  - `rpcListUrl` — full URL of the Supabase RPC endpoint `fn_admin_get_orders`
  - `listBody` — payload sent to the RPC, containing `_id`, `conv`, `_limit`, and optional `p_status`
  - `listResp` — fetch response from the RPC call
  - `text` — plain‑text body of a failed RPC response (used for error reporting)
  - `orders` — array of order records returned by the RPC
  - `fnHost` — derived Supabase functions host URL constructed from `supabaseUrl`
  - `results` — accumulator array storing the outcome of each order's callback processing
  - `o` — current order object being iterated over in the `for...of` loop
  - `token` — payment token extracted from the current order (`o.payment_token`)
  - `cbUrl` — full URL of the iyzico‑callback function
  - `cbResp` — fetch response from the iyzico‑callback POST request
  - `cbJson` — parsed JSON payload returned by the callback
  - `st` — status value from the callback JSON (defaults to `'pending'`)
  - `msg` — error message string extracted from a caught exception (either `Error.message` or stringified value)
  - `e` — caught exception value in the per‑order `try/catch` block
  - `e` — caught exception value in the outer `try/catch` block (handles unexpected errors)
  - `msg` — error message string derived from the outer catch’s exception `e` (same handling as above)
- **Dönüş**: Response — a Promise resolving to an HTTP Response object (JSON payload with appropriate status, CORS headers, and content type)

---

## NODE ID STANDARD

  file: supabase\functions\admin-iyzico-reconcile\index.ts
  function: supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-iyzico-reconcile_handler