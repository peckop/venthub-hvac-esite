---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-refund\index.ts
skeleton_hash: 23b801bcc1720e1b
generated_at: 2026-05-24T10:45:53Z
---

## Genel Bakış
Bu modül, Supabase ortamında çalışan bir HTTP endpoint’i olarak iyzico ödeme sistemine ait iade (refund) işlemlerini yürütür. Gelen istekleri alır, gerekli doğrulamaları ve iyzico SDK çağrılarını gerçekleştirir, ardından işlem sonucunu HTTP yanıtı olarak döndürür.

## Fonksiyon Grupları
### İade İşlem İşleyicisi
Modülün tek sorumluluğu, iade talebini işleyerek iyzico API’siyle etkileşime geçmek ve sonucu istemciye iletmektir.  
- iyzico‑refund_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## Önerilen Mimari Varsayımlar (fonksiyon gövdesine dayalı)

[Aksiyom 1]: Eğer `req` nesnesi `undefined` veya `null` ise, fonksiyon HTTP 400 (Bad Request) yanıtı döndürür.  
[Aksiyom 2]: Eğer `req.body` içinde `paymentId` alanı yoksa, fonksiyon HTTP 400 (Bad Request) yanıtı döndürür.  
[Aksiyom 3]: Eğer `req.body` içinde `amount` alanı yoksa, fonksiyon HTTP 400 (Bad Request) yanıtı döndürür.  
[Aksiyom 4]: Eğer iyzico API çağrısı başarısız olursa (örneğin 4xx/5xx yanıtı alırsa), fonksiyon HTTP 502 (Bad Gateway) yanıtı döndürür.  
[Aksiyom 5]: Eğer iyzico API çağrısı başarılı olursa, fonksiyon HTTP 200 (OK) yanıtı döndürür ve yanıt gövdesinde iyzico’dan gelen veri yer alır.  
[Aksiyom 6]: Eğer `req.headers` içinde `Authorization` veya benzeri kimlik doğrulama başlığı yoksa, fonksiyon HTTP 401 (Unauthorized) yanıtı döndürür.  

> **Not:** Yukarıdaki aksiyomlar, fonksiyonun gövdesinde yer alan temel kontrol akışına dayanmaktadır. Gerçek uygulamada, ek alanlar, hata kodları veya özel iş kuralları eklenmiş olabilir; bu durumda aksiyomlar güncellenmelidir.

---

## FONKSIYON DETAYLARI

### iyzico-refund_handler
**Ne yapar**: İyzico ödeme sistemine yönelik iade (refund) işlemlerini işleyen bir HTTP istek yöneticisidir.  

**Nasıl yapar**: Gelen `req` nesnesini alır, iade işlemi için gerekli doğrulamaları ve İyzico API çağrılarını gerçekleştirir, ardından bir `Response` nesnesi döndürür. (İç mantığı kod içinde tanımlı olduğu için burada özetlenmiştir.)  

**Parametreler**:
- `req`: any — HTTP istek nesnesi; iade talebine ilişkin veri ve başlıkları içerir.  

**Dönüş**: `Response` — İade işleminin sonucunu ve ilgili HTTP durum kodunu içeren yanıt nesnesi.

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
  - `corsHeaders` — CORS yanıt başlıklarını içeren sabit bir nesne.
  - `supabaseUrl` — Supabase proje URL’si, ortam değişkeninden alınır.
  - `serviceKey` — Supabase servis rol anahtarı, ortam değişkeninden alınır.
  - `IYZ_API` — İyzico API anahtarı, ortam değişkeninden alınır.
  - `IYZ_SEC` — İyzico gizli anahtarı, ortam değişkeninden alınır.
  - `IYZ_URI` — İyzico temel URL’si, ortam değişkeninden alınır; yoksa sandbox URL’si kullanılır.
  - `body` — İstek gövdesinin JSON olarak ayrıştırılmış hali; ayrıştırma hatasında boş nesne.
  - `orderId` — `body?.order_id` üzerinden alınan sipariş kimliği (string | undefined).
  - `amountReq` — `body?.amount` sayısal olarak dönüştürülmüş tutar (number | undefined).
  - `_reason` — İptal/geri ödeme nedeni (`body?.reason`), isteğe bağlı.
  - `authHeader` — İstek başlığından alınan `authorization` değeri.
  - `anonKey` — Supabase anonim anahtarı, ortam değişkeninden alınır.
  - `authClient` — Supabase istemcisi, `createClient` ile oluşturulur; `Authorization` başlığı authHeader ile set edilir.
  - `user` — AuthClient üzerinden `auth.getUser()` çağrısı sonucu elde edilen kullanıcı nesnesi.
  - `authErr` — Kullanıcı doğrulama sırasında oluşan hata.
  - `reqUserId` — Doğrulanan kullanıcının ID’si (`user.id`), `string | null`.
  - `ordResp` — Sipariş verisini Supabase REST API üzerinden çeken `fetch` yanıtı.
  - `orders` — `ordResp` yanıtının JSON olarak ayrıştırılmış hali; dizi.
  - `order` — `orders[0]` olarak alınan tek sipariş nesnesi; bulunamazsa `null`.
  - `isAdmin` — Kullanıcının admin rolüne sahip olup olmadığını gösteren boolean.
  - `prof` — Kullanıcı profilini Supabase üzerinden çeken `fetch` yanıtı.
  - `arr` — `prof` yanıtının JSON olarak ayrıştırılmış hali; dizi.
  - `row` — `arr[0]` olarak alınan profil nesnesi; admin kontrolü için kullanılır.
  - `isOwner` — `reqUserId` mevcutsa ve siparişin `user_id`siyle eşleşiyorsa `true`.
  - `totalAmount` — Siparişin toplam tutarı (`order.total_amount`) sayısal değere dönüştürülmüş hali.
  - `prevDebug` — Siparişin önceki ödeme debug bilgisi (`order.payment_debug`) tip güvenliğiyle `PaymentDebug`.
  - `refundedTotalPrev` — Önceden iade edilen toplam tutar (`prevDebug.refunded_total`), sayısal.
  - `payId` — İyzico ödeme kimliği; `order.payment_debug.paymentId` veya `order.payment_debug.raw.paymentId` üzerinden alınır.
  - `transactions` — İyzico işlem listesi; `order.payment_debug.raw.itemTransactions` dizisi.
  - `Iyzi` — `Iyzipay` paketinin tip güvenliğiyle `IyziCtor` olarak cast edilmiş sınıf.
  - `sdk` — `Iyzi` sınıfından oluşturulan İyzico SDK örneği (`apiKey`, `secretKey`, `uri` ile yapılandırılmış).
  - `targetAmount` — İade edilecek tutar; istek tutarı varsa onu, yoksa siparişin toplam tutarını kullanır.
  - `epsilon` — Kayan nokta karşılaştırması için tolerans değeri (0.0001).
  - `isFull` — Tam iade mi yoksa kısmi iade mi olduğunu belirleyen boolean.
  - `iyzResult` — İyzico’dan gelen yanıt (`IyziCancelResponse` veya `IyziRefundResponse`), hata durumunda `null`.
  - `LOCALE_TR` — İyzico SDK için Türkçe locale değeri; paket içinde tanımlı değilse `'tr'`.
  - `ptx` — Kısmi iade için kullanılan `paymentTransactionId` (ilk transaction’dan alınır).
  - `ok` — İyzico yanıtının başarı durumunu gösteren boolean (`status` `'success'` veya `'SUCCESS'`).
  - `itemsResp` — Tam iade durumunda sipariş kalemlerini çeken `fetch` yanıtı.
  - `items` — `itemsResp` JSON çıktısı; dizi.
  - `it` — `items` dizisindeki tek bir sipariş kalemi nesnesi (`product_id`, `quantity`).
  - `pResp` — Ürün stok bilgisini çeken `fetch` yanıtı.
  - `arr` *(product fetch)* — `pResp` JSON çıktısı; dizi.
  - `cur` — `arr[0]` olarak alınan ürün nesnesi; mevcut stok bilgisi içerir.
  - `curStock` — Mevcut stok miktarı (`cur.stock_qty`) sayısal.
  - `newStock` — Güncellenmiş stok miktarı (`curStock + it.quantity`).
  - `newDebug` — Tam iade sonrası güncellenmiş `payment_debug` nesnesi (refund bilgileri eklenir).
  - `newStatus` — Siparişin yeni durumu; gönderilmemişse `'cancelled'`, aksi halde mevcut durum korunur.
  - `partials` — Önceki kısmi iade kayıtları (`prevDebug.partial_refunds`) dizisi.
  - `newRefundedTotal` — Kısmi iade sonrası toplam iade tutarı.
  - `newStatusPayment` — Kısmi iade sonrası ödeme durumu (`'refunded'` veya `'partial_refunded'`).
  - `dbg` — Kısmi iade sonrası güncellenmiş `payment_debug` nesnesi (yeni iade kaydı eklenir).
- **Dönüş**: `Response` — HTTP yanıtı döner; başarılı, hata veya yönlendirme durumlarına göre farklı JSON gövdeleri ve uygun status kodları içerir.

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-refund\index.ts
  function: supabase\functions\iyzico-refund\index.ts::iyzico-refund_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-refund_handler