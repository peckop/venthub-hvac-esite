---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts
skeleton_hash: 16704d3ccdf6ab6d
generated_at: 2026-05-24T07:26:05Z
---

## Genel Bakış
Bu modül, yönetici paneli üzerinden sipariş inceleme işlemlerini yöneten bir HTTP işleyici sağlar. Gelen istekleri alır, gerekli doğrulama ve veri işleme adımlarını gerçekleştirir ve uygun bir yanıt döndürür.

## Fonksiyon Grupları
### Ana İşlev
Modülün tek işlevi, admin-order-inspect_handler fonksiyonudur; bu fonksiyon, istekleri işleyerek sipariş inceleme sürecini başlatır ve sonuç olarak bir HTTP yanıtı üretir.  
- admin-order-inspect_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### admin-order-inspect_handler
**Ne yapar**: Bu fonksiyon, yönetici yetkisiyle bir siparişin detaylarını incelemeyi sağlayan bir HTTP istek işleyicisidir. Yetkili kullanıcıların sisteme kayıtlı sipariş bilgilerini görüntülemesini veya doğrulamalarını yapmasını mümkün kılar.  
**Nasıl yapar**: Gelen `Request` nesnesinden yetkilendirme bilgilerini ve gerekirse sipariş kimliğini çıkarır, bu bilgileri doğruladıktan sonra ilgili sipariş verilerini toplar ve bunları uygun bir biçimde bir `Response` nesnesine yerleştirerek döndürür.  
**Parametreler**:  
- req: Request — yönetici kimlik doğrulama verileri ve incelenmek istenen siparişin benzersiz tanımlayıcısı (varsa) içeren gelen HTTP isteği.  
**Dönüş**: Response — siparişin detaylarını içeren başarı yanıtı veya yetkilendirme hatası, geçersiz istek gibi durumlar için uygun hata kodunu ve mesajı taşıyan HTTP yanıtı.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler
- **params**: `req: Request` — incoming HTTP request object
- **ic_degiskenler**:
  - `cors` — CORS headers object applied to every response for cross‑origin access
  - `supabaseUrl` — Supabase project URL read from the `SUPABASE_URL` environment variable
  - `serviceRoleKey` — Supabase service‑role key read from `SUPABASE_SERVICE_ROLE_KEY` environment variable (used for admin operations)
  - `anonKey` — Supabase anon key read from `SUPABASE_ANON_KEY` environment variable (used for user‑level client)
  - `authHeader` — Value of the `Authorization` header extracted from the incoming request
  - `supabaseUser` — Supabase client initialized with the anon key and a global header containing the user’s Authorization token
  - `supabaseAdmin` — Supabase client initialized with the service‑role key (admin privileges)
  - `userRes` — Data returned by `supabaseUser.auth.getUser()` containing the authenticated user’s information
  - `userErr` — Error object from `supabaseUser.auth.getUser()`; if present, authentication failed
  - `profile` — Row fetched from the `user_profiles` table for the authenticated user (contains the `role` column)
  - `profErr` — Error from the profile fetch query; if present, the profile could not be retrieved
  - `userRole` — The `role` string from `profile` (typed as `string | undefined`); used to verify admin or superadmin privileges
  - `id` — Order ID extracted from the query string (`?id=`) or, for POST/PUT, from the JSON body; nullable string
  - `conv` — Conversation ID extracted from the query string (`?conv=`) or, for POST/PUT, from the JSON body; nullable string
  - `url` — `URL` object constructed from `req.url` to enable easy query‑parameter reading
  - `body` (parse) — Parsed JSON payload from a POST/PUT request (used to obtain `id` and `conv` when not present in query string)
  - `rpcUrl` — Full endpoint URL for the Supabase RPC function `fn_admin_get_orders`
  - `body` (rpc) — JSON payload sent to the RPC, containing `_p_id`, `p_conv`, `p_status`, and `p_limit`
  - `_text` — Raw text of the RPC response when the HTTP call fails (captured for debugging)
  - `json` — Parsed JSON result of the RPC call (expected to be an array)
  - `row` — First element of `json` if it is an array, otherwise `null`; represents the retrieved order data
  - `msg` — Error message string derived from the caught exception (`_e`); used in the 500‑error response
- **Dönüş**: `Response` — the function always returns a `Response` object (with appropriate status, headers, and JSON body)

---

## NODE ID STANDARD

  file: supabase\functions\admin-order-inspect\index.ts
  function: supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-order-inspect_handler