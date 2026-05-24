---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-refund\index.ts
skeleton_hash: 23b801bcc1720e1b
generated_at: 2026-05-24T07:38:11Z
---

## Genel Bakış
Bu modül, Supabase fonksiyonu olarak iyzico ödeme iadesi işlemlerini yöneten tek bir giriş noktası sağlar. İstekleri alıp gerekli doğrulama ve iyzico API entegrasyonunu yürüterek iade işlemini tamamlar ve sonucu uygun HTTP yanıtı olarak döndürür.

## Fonksiyon Grupları
### Ana İşlev
Modülün tek işlevi, gelen HTTP isteklerini işleyerek iyzico üzerinden para iadesini başlatmak ve sonucu kullanıcıya bildirmektir.
- iyzico-refund_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### iyzico-refund_handler
**Ne yapar**: iyzico ödeme sistemine ait iade işlemlerini yöneten bir HTTP istek işleyicisidir.  
**Nasıl yapar**: Gelen `req` nesnesini alır, gerekli iade işlemlerini gerçekleştirir ve uygun bir `Response` nesnesi döndürür.  
**Parametreler**:  
- req: belirsiz — İşlenecek HTTP isteği nesnesi (tür belirtilmemiş)  
**Dönüş**: Response — İşlem sonucunu temsil eden yanıt nesnesi

---

## TYPE ALIASES

### PaymentTransaction
```typescript
type PaymentTransaction = { paymentTransactionId?: string }
```

### PaymentDebug
```typescript
type PaymentDebug = {
  refunded_total?: number;
  paymentId?: string;
  raw?: { paymentId?: string; itemTransactions?: PaymentTransaction[] };
  partial_refunds?: { amount: number; at: string }[];
  [k: string]: un
```

### IyziCancelResponse
```typescript
type IyziCancelResponse = { status?: string; [k: string]: unknown }
```

### IyziRefundResponse
```typescript
type IyziRefundResponse = { status?: string; [k: string]: unknown }
```

### IyziSdk
```typescript
type IyziSdk = {
  cancel: {
    create: (
      req: { locale?: unknown; paymentId: string | null; ip: string },
      cb: (err: unknown, res: IyziCancelResponse) => void
    ) => void;
  };
  refund: {
   
```

### IyziCtor
```typescript
type IyziCtor = new (args: { apiKey: string; secretKey: string; uri: string }) => IyziSdk
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-refund\index.ts::iyzico-refund_handler
- **params**: (req)
- **ic_degiskenler**:
  - `corsHeaders` — CORS headers object used for all HTTP responses
  - `supabaseUrl` — Supabase project URL read from environment variable SUPABASE_URL
  - `serviceKey` — Supabase service‑role key read from environment variable SUPABASE_SERVICE_ROLE_KEY
  - `IYZ_API` — Iyzico API key read from environment variable IYZICO_API_KEY
  - `IYZ_SEC` — Iyzico secret key read from environment variable IYZICO_SECRET_KEY
  - `IYZ_URI` — Iyzico base URL (defaults to sandbox) read from environment variable IYZICO_BASE_URL
  - `body` — Parsed JSON payload of the request; empty object if JSON parsing fails
  - `orderId` — Value of `body.order_id` (string or undefined)
  - `amountReq` — Numeric refund amount from `body.amount` if present and a number, otherwise undefined
  - `_reason` — Value of `body.reason` (string or undefined)
  - `authHeader` — Contents of the request’s `authorization` header (string or null)
  - `anonKey` — Supabase anon key from environment variable SUPABASE_ANON_KEY (may be empty string)
  - `authClient` — Supabase client initialized with the anon key and per‑request user auth header
  - `user` — Authenticated user object returned by `authClient.auth.getUser()`
  - `authErr` — Error object from the Supabase auth getUser call
  - `reqUserId` — Authenticated user’s ID (`user.id`) or null if no user
  - `ordResp` — HTTP Response from fetching the order record via Supabase REST
  - `orders` — Parsed JSON array of order data (empty array on parse failure)
  - `order` — First element of `orders` if it is an array, otherwise null
  - `isAdmin` — Boolean flag set to true when the user’s profile role is `'admin'`
  - `prof` — HTTP Response from fetching the user profile record
  - `arr` — Parsed JSON array from the profile fetch (empty on error)
  - `row` — First element of `arr` if it is an array, otherwise null
  - `isOwner` — Boolean true when `reqUserId` matches `order.user_id`
  - `totalAmount` — Numeric value of `order.total_amount` (defaults to 0)
  - `prevDebug` — Existing `payment_debug` field from the order, typed as `PaymentDebug`
  - `refundedTotalPrev` — Previously refunded total amount extracted from `prevDebug`
  - `payId` — Payment ID taken from `order.payment_debug.paymentId` or its nested `raw.paymentId` (string or null)
  - `transactions` — Array of transaction items from `order.payment_debug.raw.itemTransactions` (empty array if missing)
  - `Iyzi` — The Iyzipay library cast to its constructor type (`IyziCtor`)
  - `sdk` — Initialized Iyzipay SDK instance with API key, secret key, and base URI
  - `targetAmount` — Amount to refund: requested amount if valid, otherwise the full order total
  - `epsilon` — Small tolerance constant (0.0001) used for floating‑point equality checks
  - `isFull` — Boolean indicating whether a full cancel should be performed (based on refunded total vs order total)
  - `iyzResult` — Result from the Iyzipay cancel or refund API (`null` until the call completes)
  - `LOCALE_TR` — Locale string for Iyzipay API calls (defaults to `'tr'`)
  - `ptx` — Payment transaction ID of the first transaction (`transactions[0].paymentTransactionId`) used for partial refunds
  - `newDebug` — Updated `payment_debug` object for a full cancel (includes refund result, flags, timestamps)
  - `newStatus` — New order status after a full cancel (unchanged if shipped/delivered, otherwise `'cancelled'`)
  - `itemsResp` — HTTP Response from fetching order items via Supabase REST
  - `items` — Parsed JSON array of order items (each with `product_id` and `quantity`)
  - `it` — Individual order item iterated in the stock‑restoration loop
  - `pResp` — HTTP Response from fetching a product’s stock information
  - `arr` — Parsed JSON array from the product fetch (reused name, distinct scope)
  - `cur` — First product object from the product fetch
  - `curStock` — Current stock quantity of the product (numeric)
  - `newStock` — Updated stock quantity after adding the returned item quantity
  - `partials` — Existing `partial_refunds` array from `prevDebug`
  - `newRefundedTotal` — Updated total refunded amount after applying this refund
  - `newStatusPayment` — Updated `payment_status` after a partial refund (`'refunded'` or `'partial_refunded'`)
  - `dbg` — Updated `payment_debug` object for a partial refund (includes refund result, flags, timestamps, and appended partial refund record)
  - `_e` — Caught exception variable (type `unknown`) in various `try/catch` blocks
  - `msg` — Human‑readable error message extracted from `_e` (string) used in error responses
- **Dönüş**: `Response` (HTTP response object) – the function always returns a `Response` with appropriate status, headers, and JSON body.

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-refund\index.ts
  function: supabase\functions\iyzico-refund\index.ts::iyzico-refund_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-refund_handler