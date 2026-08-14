---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\iyzico-refund\index.ts
skeleton_hash: 08f598d2cf9e96a2
entity_hashes:
  func:iyzico-refund_handler: b3edad3bb6b5ef11
  overview: 86377044cea6469b
generated_at: 2026-08-14T22:02:42Z
---

## Genel Bakış
Bu modül, Supabase Functions ortamında çalışan bir HTTP endpoint'idir. Temel sorumluluğu, iyzico ödeme sistemi üzerinden gelen iade (refund) taleplerini almak, gerekli doğrulamaları yaparak iyzico API'sine iletmek ve işlem sonucunu istemciye bildirmektir.

## Fonksiyon Grupları
### İade İşlem İşleyicisi
Modülün tüm iş mantığını tek bir işleyicide merkezileştirir. Kimlik doğrulama, alan kontrolleri, iyzico SDK ile API iletişimi ve hata yönetimi adımlarını gerçekleştirerek iade işlemini tamamlar.
- iyzico-refund_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, iyzico ödeme sistemi entegrasyonu ile çalışan bir HTTP endpoint'idir. Fonksiyon imzası ve modül amacına dayanan mimari varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `req` parametresi geçerli bir HTTP istek nesnesi değilse, istek işlenemez ve işleyici geçersiz giriş hatası döndürür.

[Aksiyom 2]: Eğer iyzico API kimlik bilgileri (API Key, Secret Key, base URL) ortam değişkenlerinde tanımlı değilse, iyzico SDK başlatılamaz ve iade işlemi başarısız olur.

[Aksiyom 3]: Eğer istek gövdesinde zorunlu alanlar (örn: iade talebine ilişkin bilgiler) eksikse, işleyici doğrulama hatası ile yanıt verir.

[Aksiyom 4]: Eğer Supabase Edge Functions runtime ortamında iyzico SDK modülü (veya eşdeğeri HTTP istemcisi) yüklü değilse, modül çalışmaz.

[Aksiyom 5]: Eğer istek kimlik doğrulama bilgisi içermiyorsa veya geçersizse, işleyici yetkilendirme hatası ile yanıt verir.

---

## FONKSİYON DETAYLARI

### iyzico-refund_handler
**Ne yapar**: HTTP isteklerini alarak iyzico ödeme sistemi üzerinden bir geri ödeme (refund) işlemi başlatır veya bu işlemle ilgili bir durum sorgulaması yapar.
**Nasıl yapar**: Fonksiyon, bir HTTP Request nesnesi alır. Bu isteğin gövdesindeki (body) verileri çıkararak iyzico'nun sunduğu geri ödeme API endpoint'ine gerekli parametrelerle bir istek gönderir. API'den dönen sonucu işleyerek uygun bir HTTP Response (başarı/hata durumu ile birlikte) oluşturur ve istemciye döner.
**Parametreler**:
- req: Request — Fonksiyonun işleyeceği HTTP istek nesnesi. İsteğin metodu, gövdesi (geri ödeme bilgileri) ve varsa başlık bilgilerini içerir.
**Dönüş**: Response — iyzico API'sinden alınan sonuca göre başarı veya hata durumunu belirten, JSON formatında bir HTTP yanıt nesnesi. Genellikle { success: boolean, data?: object, error?: string } yapısında bir gövdeye sahiptir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient
- import: npm:iyzipay::Iyzipay

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
  [k: string]: unknown
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
    create:
```

### IyziCtor
```typescript
type IyziCtor = new (args: { apiKey: string; secretKey: string; uri: string }) => IyziSdk
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-refund/index.ts::iyzico-refund_handler
- **params**: `req` — HTTP isteği (Request nesnesi, method, headers, json body içerir)
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` ile alınan CORS başlık nesnesi
  - `cors` — `corsHeaders`'ın alias'ı, tekrar atama
  - `corsHeaders` (yeniden tanımlı) — Manuel oluşturulmuş CORS başlık Record'ı; allowed, origin ile dinamik origin ayarı, OPTIONS/POST metodları
  - `supabaseUrl` — `Deno.env.get("SUPABASE_URL")` ile alınan Supabase URL'i
  - `serviceKey` — `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")` ile alınan servis rol anahtarı
  - `IYZ_API` — `Deno.env.get("IYZICO_API_KEY")` ile alınan Iyzico API anahtarı
  - `IYZ_SEC` — `Deno.env.get("IYZICO_SECRET_KEY")` ile alınan Iyzico gizli anahtarı
  - `IYZ_URI` — `Deno.env.get("IYZICO_BASE_URL")` ile alınan Iyzico base URL'i, varsayılan `"https://sandbox-api.iyzipay.com"`
  - `body` — `req.json()` ile parse edilmiş istek gövdesi, hata olursa boş obje `{}`
  - `orderId` — `body?.order_id`, string tipinde sipariş ID'si, zorunlu alan
  - `amountReq` — `body?.amount`, number tipinde iade tutarı, opsiyonel
  - `_reason` — `body?.reason`, string tipinde iade sebebi, opsiyonel
  - `authHeader` — `req.headers.get("authorization")`, Bearer token içeren auth başlığı
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anon key, auth client oluşturulurken kullanılır
  - `authClient` — `createClient` ile anonKey + authHeader kullanılarak oluşturulmuş Supabase istemcisi
  - `user` — `authClient.auth.getUser()` ile alınmış authenticated kullanıcı nesnesi (id içerir)
  - `authErr` — getUser hatası veya null
  - `reqUserId` — `user.id`, isteği yapan kullanıcının UUID'si
  - `ordResp` — Supabase REST API ile `venthub_orders` tablosundan sipariş getirme yanıt nesnesi
  - `orders` — `ordResp.json()` ile parse edilmiş sipariş dizisi
  - `order` — `orders[0]`, ilk (ve tek beklenen) sipariş kaydı; id, user_id, status, payment_status, total_amount, payment_debug içerir
  - `isAdmin` — boolean, kullanıcının admin rolünde olup olmadığını tutar
  - `prof` — Supabase REST API ile `user_profiles` tablosundan rol sorgulama yanıt nesnesi
  - `arr` — `prof.json()` ile parse edilmiş profil dizisi (admin kontrolü kısmında)
  - `row` — `arr[0]`, ilk profil satırı; `role` alanını barındırır
  - `isOwner` — boolean, isteği yapan kullanıcının sipariş sahibi olup olmadığını tutar (`reqUserId === order.user_id`)
  - `totalAmount` — `Number(order.total_amount) || 0`, siparişin toplam tutarı
  - `prevDebug` — `order.payment_debug` cast edilmiş `PaymentDebug` nesnesi; önceki ödeme debug bilgileri (refunded_total, paymentId, partial_refunds vb.)
  - `refundedTotalPrev` — `Number(prevDebug?.refunded_total || 0)`, önceden iade edilen toplam tutar
  - `payId` — `order.payment_debug.paymentId` veya `order.payment_debug.raw.paymentId`, IyziCo payment ID'si
  - `transactions` — `order.payment_debug.raw.itemTransactions` dizisi, `PaymentTransaction[]` tipinde; her birinde paymentTransactionId bulunur
  - `Iyzi` — `Iyzipay`'ın `IyziCtor` tipine cast edilmiş hali, constructor referansı
  - `sdk` — `new Iyzi({apiKey, secretKey, uri})` ile oluşturulmuş IyziCo SDK örneği; cancel ve refund metodları barındırır
  - `targetAmount` — iade edilecek tutar; `amountReq` varsa ve sıfırdan büyükse `amountReq`, aksi halde `totalAmount`
  - `epsilon` — `0.0001`, floating-point karşılaştırma toleransı
  - `isFull` — boolean; tam iade (cancel) mi yoksa parsiyel iade (refund) mi olduğunu belirler
  - `iyzResult` — IyziCo API'den dönen `IyziCancelResponse` veya `IyziRefundResponse` sonucu
  - `LOCALE_TR` — IyziCo locale sabiti, `Iyzipay.LOCALE.TR` veya `'tr'`
  - `ptx` — `transactions[0].paymentTransactionId`, parsiyel iade için kullanılacak işlem ID'si
  - `ok` — boolean, `iyzResult.status === 'success'` kontrolü ile API başarısını tutar
  - `itemsResp` — tam iade yolunda `venthub_order_items` tablosundan sipariş kalemlerini getiren yanıt
  - `items` — sipariş kalemleri dizisi; her birinde `product_id` ve `quantity` bulunur
  - `it` — `for...of` döngüsündeki her bir sipariş kalemi
  - `pResp` — tam iade yolunda `products` tablosundan ürün bilgisi getiren yanıt
  - `arr` (ürün döngüsü içinde) — ürün sorgulama sonucu dizisi
  - `cur` — `arr[0]`, mevcut ürün kaydı; `stock_qty` alanını barındırır
  - `curStock` — `Number(cur?.stock_qty ?? 0)`, ürünün mevcut stok miktarı
  - `newStock` — `curStock + Number(it.quantity || 0)`, stok iadesi sonrası yeni stok miktarı
  - `newDebug` — tam iade sonrası güncellenmiş `PaymentDebug` nesnesi; refund_result, refund_type='cancel', refunded_total=totalAmount, manual_refund_applied=true, manual_refund_applied_at Zeitstempelı içerir
  - `newStatus` — tam iade sonrası sipariş durumu; shipped/delivered ise korunur, aksi halde `'cancelled'`
  - `partials` — `prevDebug.partial_refunds` dizisi, önceki parsiyel iade kayıtları
  - `newRefundedTotal` — `refundedTotalPrev + targetAmount`, güncellenmiş toplam iade tutarı
  - `newStatusPayment` — parsiyel iade sonrası payment_status; toplam iade tutarı sipariş tutarına eşit ise `'refunded'`, aksi halde `'partial_refunded'`
  - `dbg` — parsiyel iade sonrası güncellenmiş `PaymentDebug` nesnesi; refund_result, refund_type='refund', refund_amount, refunded_total, partial_refunds güncellenmiş dizi içerir
- **Dönüş**: `Response` — HTTP yanıt nesnesi; farklı durumlarda JSON body ile 200, 400, 401, 403, 404, 405, 500, 502 durum kodları döner. Başarılı tam iade durumunda `{ status: 'refunded', type: 'cancel', amount, order_id }`, parsiyel iade durumunda `{ status, type: 'refund', amount, refunded_total, order_id }`, zaten iade edilmişse `{ status: 'already_refunded', order_id }` döner. Yan etkiler: IyziCo API çağrısı (cancel/refund), stok güncelleme (tam iade yolunda), sipariş durumu ve payment_debug güncelleme.

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-refund\index.ts
  function: supabase\functions\iyzico-refund\index.ts::iyzico-refund_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-refund_handler