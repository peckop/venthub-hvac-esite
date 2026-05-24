---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\refund-order-mock\index.ts
skeleton_hash: f6440556e54dc688
generated_at: 2026-05-24T07:51:47Z
---

## Genel Bakış
Bu modül, bir siparişin iade işlemini simüle eden bir Supabase fonksiyonudur. Tek bir ana işleyici fonksiyon üzerinden gelen HTTP isteklerini alır, gerekli doğrulama ve mock iade işlemini gerçekleştirir ve istemciye uygun bir yanıt döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Üretimi
Bu grup, dışarıdan gelen istekleri işleyip mock iade sürecini başlatan ve sonuç olarak HTTP yanıtı oluşturan fonksiyonu içerir.
- refund-order-mock_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, tek bir parametre olan `req` ile çalışan bir handler fonksiyonunu içerir.

[Aksiyom 1]: Eğer `req` argümanı sağlanmazsa, fonksiyon çalıştırılırken bir hata (örneğin TypeError) oluşur.  
[Aksiyom 2]: Eğer `req` bir nesne değilse, fonksiyonun davranışı belirsizdir (tanımsız).  
[Aksiyom 3]: Eğer `req` içinde fonksiyonun işleme yapması için beklenen veri yapısı eksikse, fonksiyonun sonucu veya hata durumu belirsizdir.

---

## FONKSIYON DETAYLARI

### refund-order-mock_handler
**Ne yapar**: Gelen HTTP isteğini alarak iade işlemi için sahte (mock) bir yanıt üretir.  
**Nasıl yapar**: Fonksiyon, isteği işler ve önceden tanımlanmış mock veri yapısını içeren bir `Response` nesnesi döndürür; gerçek bir veritabanı veya dış servis etkileşimi yapmaz.  
**Parametreler**:
- req: Request — İşlenecek gelen HTTP isteği (başlıklar, gövde vb. içerir).  
**Dönüş**: Response — Mock iade işlemi sonucunu içeren HTTP yanıtı (durum kodu, başlıklar ve JSON gövde).

---

## INTERFACES

### RefundRequest
- `order_id: string`
- `amount?: number`
- `reason?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: refund-order-mock/index.ts::refund-order-mock_handler
- **params**: (req)
- **ic_degiskenler**:
  - `origin` — value of the Origin request header, defaulted to '*' if missing; used to set CORS Allow-Origin.
  - `cors` — object containing CORS response headers (Allow-Origin, Vary, Allow-Headers, Allow-Methods, Max-Age) built from request headers and defaults.
  - `supabaseUrl` — Supabase project URL read from environment variable SUPABASE_URL (empty string if unset).
  - `serviceKey` — Supabase service role key read from SUPABASE_SERVICE_ROLE_KEY (empty if unset).
  - `anonKey` — Supabase anon/public key read from SUPABASE_ANON_KEY (empty if unset).
  - `authHeader` — raw Authorization header value from the incoming request.
  - `authClient` — Supabase client initialized with anonKey and per‑request Authorization header for user‑level calls.
  - `user` — user object returned by auth.getUser(); contains the authenticated user's ID and metadata.
  - `authErr` — error object from auth.getUser(); non‑null indicates token validation failure.
  - `actorUserId` — authenticated user's ID (user.id) used for ownership and admin checks.
  - `body` — parsed JSON payload of the request, typed as RefundRequest; fallback to empty object on parse error.
  - `order_id` — trimmed order_id string from body; used to fetch the specific order.
  - `amount` — numeric refund amount from body if valid and finite; otherwise undefined.
  - `reason` — refund reason string truncated to 140 characters if provided; otherwise undefined.
  - `ordResp` — HTTP response from fetching the order record via Supabase REST endpoint.
  - `arr` — JSON array parsed from ordResp; expected to contain zero or one order objects.
  - `order` — first element of arr if it is an array, otherwise null; represents the order row.
  - `isAdmin` — boolean flag, initially false, set to true if the actor's profile role is 'admin' or 'superadmin'.
  - `prof` — HTTP response from fetching the actor's user_profile row.
  - `prows` — JSON array parsed from prof; expected zero or one profile objects.
  - `prow` — first element of prows if array, otherwise null; the profile record.
  - `isOwner` — boolean indicating whether actorUserId matches the order's user_id.
  - `totalAmount` — numeric value of order.total_amount (default 0) used as the full order total.
  - `target` — amount to refund: the validated amount if positive, otherwise the totalAmount.
  - `isFull` — true when target >= totalAmount, indicating a full refund.
  - `newPaymentStatus` — 'refunded' for full refund, 'partial_refunded' otherwise.
  - `newOrderStatus` — for full refund: preserve shipped/delivered status, else set to 'cancelled'; for partial refund: keep original order status.
  - `dbg` — existing payment_debug field from the order (or empty object) used as base for debug info.
  - `newDebug` — updated payment_debug object adding mock refund flags, reason, type, amount, and aggregated totals/partial refunds.
  - `itemsResp` — HTTP response fetching order items for the given order_id.
  - `items` — JSON array of order items (product_id, quantity) from itemsResp.
  - `it` — loop variable representing each order item during stock restoration mock.
  - `upd` — HTTP PATCH response updating the order with new payment_status, status, and payment_debug.
  - `txt` — text body of upd response if the request fails; used for error reporting.
  - `payload` — object inserted into order_refund_events audit table (order_id, amount, reason, actor_user_id).
  - `_e` — caught unknown error from the outer try block.
  - `msg` — string representation of _e, either its message property or fallback toString.
- **Dönüş**: Response object (either success JSON with `{ok:true, order_id, payment_status, amount}` or error JSON with appropriate status code and CORS headers).

---

## NODE ID STANDARD

  file: supabase\functions\refund-order-mock\index.ts
  function: supabase\functions\refund-order-mock\index.ts::refund-order-mock_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: refund-order-mock_handler