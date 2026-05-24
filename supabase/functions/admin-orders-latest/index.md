---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-orders-latest\index.ts
skeleton_hash: b282b0917505ca5b
generated_at: 2026-05-24T07:29:37Z
---

## Genel Bakış
Bu modül, yönetici paneli üzerinden en son siparişlerin getirilmesini sağlayan bir işlev içerir. Tek bir ana handler fonksiyonu, gelen HTTP isteğini işleyerek Supabase veritabanından güncel sipariş verilerini çek ve istemciye yanıt olarak döndürür.

## Fonksiyon Grupları
### Ana İşlev
Modülün tek işlevi, yönetici tarafından istenen en son siparişleri listelemek ve bu veriyi istemciye iletmektir.
- admin-orders-latest_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir istek nesnesi (req) parametresi ile çalışır.

[Aksiyom 1]: Eğer req parametresi sağlanmazsa, fonksiyon çağrılırken TypeError hatası oluşur.
[Aksiyom 2]: Eğer req null veya undefined ise, fonksiyonun davranışı belirsizdir ve hata fırlatabilir.

---

## FONKSIYON DETAYLARI

### admin-orders-latest_handler
**Ne yapar**: Admin tarafından yapılan son siparişleri getiren bir işleyici fonksiyonudur.  
**Nasıl yapar**: Gelen `req` isteğini işleyerek en güncel admin sipariş verilerini alır ve bu verileri bir `Response` nesnesi içinde döndürür.  
**Parametreler**:
- req: belirtilmemiş — İşlenecek HTTP isteği nesnesi.  
**Dönüş**: Response — İşlem sonucu oluşturulan HTTP yanıtı nesnesi.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-orders-latest\index.ts::admin-orders-latest_handler
- **params**: (req)
- **ic_degiskenler**:
  - `origin` — request header 'origin' value or empty string.
  - `allowed` — array of allowed origins from env var ALLOWED_ORIGINS (split, trimmed, filtered).
  - `okOrigin` — boolean true if origin is allowed (empty allowed list or origin present).
  - `requestId` — unique request identifier (UUID or timestamp).
  - `cors` — object containing CORS response headers.
  - `supabaseUrl` — Supabase project URL from env SUPABASE_URL.
  - `serviceRoleKey` — Supabase service role key from env SUPABASE_SERVICE_ROLE_KEY.
  - `authHeader` — value of the Authorization request header.
  - `anonKey` — Supabase anon key from env SUPABASE_ANON_KEY.
  - `supabaseUser` — Supabase client initialized with anon key and per‑request auth header.
  - `supabaseAdmin` — Supabase client initialized with service role key.
  - `userRes` — data object from supabaseUser.auth.getUser() containing the authenticated user.
  - `userErr` — error object from supabaseUser.auth.getUser().
  - `profile` — row from user_profiles table for the user (contains role).
  - `profErr` — error from fetching the user profile.
  - `userRole` — role string extracted from profile (e.g., 'admin' or 'superadmin').
  - `url` — URL object built from the request URL for reading query parameters.
  - `status` — trimmed status query parameter (empty string if absent).
  - `from` — trimmed from date query parameter (empty string if absent).
  - `to` — trimmed to date query parameter (empty string if absent).
  - `q` — trimmed search query parameter (empty string if absent).
  - `preset` — trimmed preset query parameter (empty string if absent).
  - `limitParam` — number limit for pagination, clamped to 1‑100, default 50.
  - `pageParam` — number page for pagination, clamped to minimum 1, default 1.
  - `offset` — calculated offset = (pageParam‑1) * limitParam.
  - `params` — URLSearchParams holding Supabase query arguments (select, order, filters).
  - `isPendingShipments` — true when preset equals 'pendingShipments'.
  - `requestUrl` — full Supabase REST endpoint URL with encoded query string.
  - `resp` — Response from fetch to the Supabase endpoint.
  - `rows` — array of order objects parsed from resp.json() (empty array on parse failure).
  - `contentRange` — value of the content‑range header from resp (default '0‑0/0').
  - `total` — total number of matching orders extracted from content‑range.
  - `_e` — caught exception in the try/catch block.
  - `msg` — string representation of _e used for error response.
  - `isUuid` — boolean indicating whether q matches a UUID pattern.
  - `like` — SQL‑style wildcard pattern (*q*) used for ilike matching.
  - `normalizeDateStart` — helper function converting YYYY‑MM‑DD or ISO string to ISO start‑of‑day UTC.
  - `normalizeDateEnd` — helper function converting YYYY‑MM‑DD or ISO string to ISO end‑of‑day UTC.
- **Dönüş**: Response (JSON body with orders data or error).

---

## NODE ID STANDARD

  file: supabase\functions\admin-orders-latest\index.ts
  function: supabase\functions\admin-orders-latest\index.ts::admin-orders-latest_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-orders-latest_handler