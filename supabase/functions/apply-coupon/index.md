---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts
skeleton_hash: 9b98a0b5fd98d396
generated_at: 2026-05-24T07:30:42Z
---

## Genel Bakış
Bu modül, bir Supabase Edge fonksiyonu olarak kupon uygulama işlemini gerçekleştirir. İsteklere CORS başlıklarını ekleyerek tarayıcı tarafı güvenliği sağlar ve ardından gelen veriyi işleyerek kuponun geçerliliğini kontrol eder, uygulama sonucunu döndürür.

## Fonksiyon Grupları
### CORS Yardımcıları
İsteklere uygun CORS başlıklarını ekleyerek cross‑origin isteklerin güvenli bir şekilde işlenmesini sağlar.
- buildCors

### Ana İşlem Mantığı
Kupon uygulama işlemini yönetir: gelen isteği alır, gerekli doğrulama ve işleme adımlarını yürütür, ardından uygun yanıtı oluşturur ve döndürür.
- apply-coupon_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modülün fonksiyonları bir `Request` nesnesi alarak çalışır; bu nesnenin geçerli bir tipte olması gerekir.

[Aksiyom 1]: Eğer `buildCors` fonksiyonuna geçirilen `req` argüansı geçerli bir `Request` nesnesi değilse, fonksiyon tür hatası veya çalışma zamanı hatası verir.  
[Aksiyom 2]: Eğer `apply-coupon_handler` fonksiyonuna geçirilen `req` argüansı geçerli bir `Request` nesnesi değilse, fonksiyon tür hatası veya çalışma zamanı hatası verir.  
[Aksiyom 3]: Eğer modülün derlendiği/çalıştırdığı ortamda `Request` tipi tanımlı değilse (tip tanımları eksikse), fonksiyonların derleme başarısız olur.

---

## FONKSIYON DETAYLARI

### buildCors
**Ne yapar**: İstenen CORS başlıklarını oluşturur ve döndürür.  
**Nasıl yapar**: İstek nesnesinden origin, metod ve header bilgilerini okuyarak uygun `Access-Control-Allow-*` başlıklarını hazırlar ve bir nesne olarak döndürür.  
**Parametreler**:
- req: Request — İşlenecek HTTP isteği nesnesi  
**Dönüş**: { headers: Record<string, string>, ok: boolean } — headers nesnesi ve işlemin başarılı olup olmadığını gösteren bayrak  

### apply-coupon_handler
**Ne yapar**: Kupon uygulama işlemini gerçekleştirir ve HTTP yanıtı üretir.  
**Nasıl yapar**: İstekten kupon kodunu ve ilgili veri (örneğin kullanıcı kimliği, sepet bilgisi) çıkarır, veritabanında kuponun geçerliliğini kontrol eder, uygulanabilir ise indirim hesaplar ve sonuç olarak uygun durum kodu ve mesaj içeren bir `Response` nesnesi döndürür.  
**Parametreler**:
- req: Request — Kupon uygulama işlemi için gerekli veriyi taşıyan HTTP isteği  
**Dönüş**: Response — HTTP durum kodu, başlıklar ve yanıt gövdesi içeren Supabase Edge Functions yanıtı

---

## TYPE ALIASES

### CouponRow
```typescript
type CouponRow = {
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number | null
  valid_from: string | null
  valid_until: string | null
  is_acti
```

### ApplyCouponReq
```typescript
type ApplyCouponReq = {
  code: string
  subtotal: number
}
```

### ApplyCouponResp
```typescript
type ApplyCouponResp = {
  val_id: boolean
  reason?: string
  discount_amount?: number
  final_total?: number
  normalized_code?: string
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts::buildCors
- **params**: (req: Request)
- **ic_degiskenler**:
  - `origin` — value of the 'Origin' request header, empty string if missing.
  - `allowed` — array of allowed origins from env var `ALLOWED_ORIGINS`, split by commas, trimmed, filtered to non‑empty.
  - `ok` — boolean indicating whether the request origin is allowed (either no restrictions or origin present in `allowed` list).
  - `headers` — object containing CORS response headers to be set.
- **Dönüş**: { headers: Record<string,string>, ok: boolean }

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts::apply-coupon_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `requestId` — unique identifier for the request, either a UUID or timestamp string.
  - `cors` — result of calling `buildCors(req)`, containing CORS headers and ok flag.
  - `ct` — lowercased `Content-Type` header value.
  - `max` — maximum allowed request body size in bytes (from `DENO.env.MAX_BODY_KB`, default 100 KB).
  - `cl` — parsed `Content‑Length` header as integer, default 0.
  - `SUPABASE_URL` — Supabase project URL from environment.
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key from environment.
  - `supabase` — Supabase client instance initialized with URL and service role key.
  - `forwarded` — value of the `X-Forwarded-For` header (empty string if missing).
  - `ip` — client IP address derived from `X-Real-IP`, `CF-Connecting-IP`, first `X-Forwarded-For` entry, or `'unknown'`.
  - `key` — rate‑limit key string in the form `coupon:<ip>`.
  - `checkRateLimit` — function imported from `../_shared/rate_limit.ts` that checks rate limits.
  - `rateLimitHeaders` — function imported from `../_shared/rate_limit.ts` that builds rate‑limit response headers.
  - `result` — object returned by `checkRateLimit` containing `{ allowed, remaining, resetAt }`.
  - `rl` — headers object produced by `rateLimitHeaders` for the current rate‑limit state.
  - `body` — parsed JSON payload of the request (defaults to empty object on parse error), typed as `ApplyCouponReq`.
  - `code` — trimmed coupon code string from `body.code`.
  - `subtotal` — numeric subtotal from `body.subtotal` (default 0).
  - `_data` — raw data row returned from Supabase query (may be null).
  - `error` — error object from Supabase query, if any.
  - `row` — typed coupon row (`CouponRow | null`) derived from `_data`.
  - `now` — current timestamp in milliseconds.
  - `startsOk` — boolean indicating coupon validity start time is in the past or unset.
  - `endsOk` — boolean indicating coupon validity end time is in the future or unset.
  - `activeOk` — boolean indicating the coupon is marked active.
  - `limitOk` — boolean indicating usage limit not exceeded (or no limit).
  - `minOk` — boolean indicating subtotal meets minimum order amount (or no minimum).
  - `discount` — calculated discount amount before capping.
  - `finalTotal` — final amount after applying discount, rounded to two decimal places.
  - `resp` — response payload conforming to `ApplyCouponResp` with validation flag, discount, final total, and normalized code.
  - `msg` — error message string extracted from caught exception `_e`.
- **Dönüş**: Response

---

## NODE ID STANDARD

  file: supabase\functions\apply-coupon\index.ts
  function: supabase\functions\apply-coupon\index.ts::buildCors
  function: supabase\functions\apply-coupon\index.ts::apply-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: apply-coupon_handler
  export: buildCors