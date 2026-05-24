---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: a957b854a7f7b2b2
generated_at: 2026-05-24T07:27:38Z
---

## Genel Bakış
Bu modül, yönetici tarafından yeni indirim kuponu oluşturulmasını sağlayan bir Supabase Edge fonksiyonudur. Gelen HTTP isteklerini işleyerek kupon bilgilerini doğrular, veritabanına kaydeder ve uygun yanıt döndürür.

## Fonksiyon Grupları
### Kupon Oluşturma İşlemi
Yönetici tarafından gönderilen kupon oluşturma taleplerini alır, gerekli doğrulama ve veri kaydetme adımlarını gerçekleştirir.
- admin-create-coupon_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir HTTP isteğini işleyerek kupon oluşturma işlemini gerçekleştirir ve yanıt gönderirken `corsHeaders` sabitini kullanır.

[Aksiyom 1]: Eğer `req` parametresi geçerli bir `Request` nesnesi değilse, işlev istek gövdesini okurken veya JSON ayrıştırırken bir hata fırlatır.  
[Aksiyom 2]: Eğer `corsHeaders` sabiti tanımlı değilse veya bir nesne değilse, işlev HTTP yanıtına uygun CORS başlıkları ekleyemez ve istemci tarafında CORS engeliyle ilgili hatalar oluşabilir.  
[Aksiyom 3]: Eğer `corsHeaders` nesnesi gerekli CORS başlıklarını (örneğin `Access-Control-Allow-Origin`) içermiyorsa, tarayıcı tarafından yapılan cross‑origin istekler reddedilebilir.

---

## FONKSIYON DETAYLARI

### admin-create-coupon_handler
**Ne yapar**: Yönetici tarafından kupon oluşturma isteğini işler ve uygun HTTP yanıtı döndürür.  
**Nasıl yapar**: Gelen `Request` nesnesinden kupon verilerini çıkarır, gerekli doğrulama ve veritabanı işlemlerini gerçekleştirir, ardından işlem sonucunu içeren bir `Response` nesnesi oluşturur ve döndürür.  
**Parametreler**:
- req: Request — Kupon oluşturma için gerekli verileri içeren HTTP isteği  
**Dönüş**: Response — İşlemin başarılı ya da başarısız olduğu bilgisini taşıyan HTTP yanıtı (örneğin, oluşturulan kuponun detayları veya hata mesajı)

---

## SABİTLER
- **corsHeaders** (object) — `{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler
- **params**: `req: Request`
- **ic_degiskenler**:
  - `SUPABASE_URL` — Supabase project URL read from environment variables.
  - `SUPABASE_ANON_KEY` — Supabase anon key for client‑side access.
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service‑role key for privileged admin access.
  - `authHeader` — Value of the `Authorization` header from the incoming request.
  - `supabaseUser` — Supabase client initialized with the anon key and the user’s auth header (user‑level operations).
  - `supabaseAdmin` — Supabase client initialized with the service‑role key (admin‑level operations).
  - `userRes` — Result of `supabaseUser.auth.getUser()` containing the authenticated user data.
  - `userErr` — Possible error from `supabaseUser.auth.getUser()`.
  - `userId` — UUID of the authenticated user (`userRes.user.id`).
  - `profile` — Row from the `user_profiles` table for the user, containing the `role`.
  - `profErr` — Possible error from fetching the user profile.
  - `userRole` — Normalized role string (defaults to `'user'`) used to verify admin privileges.
  - `body` — Parsed JSON payload of the request, typed as `CouponBody`.
  - `code` — Trimmed coupon code string from `body.code`.
  - `type` — Coupon type string from `body.body.type` (`'percent'` or `'fixed'`).
  - `value` — Numeric discount value parsed from `body.value`.
  - `starts_at` — ISO date string for the coupon start date, or `null` if not provided.
  - `ends_at` — ISO date string for the coupon end date, or `null` if not provided.
  - `is_active` — Boolean flag indicating whether the coupon is active (defaults to `true`).
  - `usage_limit` — Number or `null` representing the maximum number of uses; `null` means unlimited.
  - `errs` — Array collecting validation error fields (`'code'`, `'type'`, `'value'`) during input validation.
  - `payload` — Object prepared for insertion into the `coupons` table, containing all coupon fields.
  - `data` — Coupon record returned from the Supabase `insert` operation (including generated fields like `id`, `created_at`).
  - `insErr` — Possible error from the Supabase `insert` operation.
  - `_e` — Caught unknown error in the outer `try/catch` block.
  - `msg` — String representation of the caught error (`_e.message` if it’s an `Error`, otherwise `String(_e)`), used for the internal error response.
- **Dönüş**: `Response` (the function returns a `Promise<Response>` due to being `async`).

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler