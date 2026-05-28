---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-refund\index.ts
skeleton_hash: 23b801bcc1720e1b
entity_hashes:
  func:iyzico-refund_handler: b3edad3bb6b5ef11
  overview: 47ea10031f1c462e
generated_at: 2026-05-28T22:45:06Z
---

## Genel Bakış
Bu modül, Supabase Functions ortamında iyzico ödeme sistemiyle entegre çalışan bir HTTP endpoint'idir. Temel sorumluluğu, gelen iade (refund) taleplerini doğrulamak, iyzico API'sine iletmek ve sonucu istemciye bildirmektir. Modül; kimlik doğrulama kontrolü, zorunlu alan doğrulaması ve hata yönetimi gibi temel güvenlik ve iş mantığı adımlarını tek bir işleyicide merkezileştirir.

## Fonksiyon Grupları

### İade İşlem İşleyicisi
Modülün tüm sorumluluğunu tek başına üstlenen ana işleyicidir. İstek doğrulamalarını (kimlik, alan kontrolleri) gerçekleştirir, iyzico SDK’sını kullanarak iade işlemini tetikler ve uygun HTTP durum koduyla sonucu döndürür.
- iyzico-refund_handler

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi (kaynak kod) paylaşılmadığı için, sadece fonksiyon imzasından çıkarılabilecek minimum varsayımlar:

[Aksiyom 1]: Eğer `req` parametresi geçilmezse, fonksiyon hata fırlatır veya beklenmeyen davranış gösterir.

[Aksiyom 2]: Fonksiyon bir HTTP istek nesnesi (`Request`) bekler; farklı bir tip verilirse, içindeki özelliklere (`.json()`, `.headers` vb.) erişim başarısız olur.

---

**Not:** Detaylı mimari aksiyomlar için fonksiyon gövdesi (index.ts içindeki `iyzico-refund_handler` fonksiyonunun implementasyonu) paylaşılmalıdır. Mevcut bilgilerle iyzico SDK kullanımı, hata yönetimi, yanıt formatı veya iş mantığı hakkında kesin aksiyom üretmek mümkün değildir.

---

## FONKSİYON DETAYLARI

### iyzico-refund_handler
**Ne yapar**: HTTP isteklerini alarak iyzico ödeme sistemi üzerinden bir geri ödeme (refund) işlemi başlatır veya bu işlemle ilgili bir durum sorgulaması yapar.
**Nasıl yapar**: Fonksiyon, bir HTTP Request nesnesi alır. Bu isteğin gövdesindeki (body) verileri çıkararak iyzico'nun sunduğu geri ödeme API endpoint'ine gerekli parametrelerle bir istek gönderir. API'den dönen sonucu işleyerek uygun bir HTTP Response (başarı/hata durumu ile birlikte) oluşturur ve istemciye döner.
**Parametreler**:
- req: Request — Fonksiyonun işleyeceği HTTP istek nesnesi. İsteğin metodu, gövdesi (geri ödeme bilgileri) ve varsa başlık bilgilerini içerir.
**Dönüş**: Response — iyzico API'sinden alınan sonuca göre başarı veya hata durumunu belirten, JSON formatında bir HTTP yanıt nesnesi. Genellikle { success: boolean, data?: object, error?: string } yapısında bir gövdeye sahiptir.

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

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-refund/index.ts::iyzico-refund_handler
- **params**: (req: Request)
- **ic_degiskenler**: 
  - `corsHeaders` — CORS başlık nesnesi, isteklerin cross-origin erişimine izin verir
  - `supabaseUrl` — Supabase projesi URL'i, ortam değişkeninden alınır
  - `serviceKey` — Supabase servis rolü anahtarı, veritabanı işlemleri için kullanılır
  - `IYZ_API` — Iyzipay API anahtarı, ödeme sistemi bağlantısı için kullanılır
  - `IYZ_SEC` — Iyzipay gizli anahtarı, ödeme sistemi bağlantısı için kullanılır
  - `IYZ_URI` — Iyzipay API URI adresi, sandbox veya production endpointi
  - `body` — İstek gövdesi JSON verisi, order_id, amount ve reason alanlarını içerir
  - `orderId` — İade edilecek siparişin benzersiz tanımlayıcısı
  - `amountReq` — İsteğe bağlı iade tutarı, belirtilmemişse sipariş toplamı kullanılır
  - `_reason` — İade nedeni (loglama için, işlevde doğrudan kullanılmıyor)
  - `authHeader` — Authorization başlığı, kimlik doğrulama için gerekli token
  - `anonKey` — Supabase anonim anahtarı, kimlik doğrulama istemcisi için kullanılır
  - `authClient` — Kimlik doğrulama için Supabase istemcisi, kullanıcı token'ını doğrular
  - `user` — Doğrulanmış kullanıcı nesnesi, kullanıcı bilgilerini içerir
  - `authErr` — Kimlik doğrulama hatası, kullanıcı doğrulanamazsa oluşur
  - `reqUserId` — Kimliği doğrulanmış kullanıcının ID'si
  - `ordResp` — Sipariş verisi için HTTP yanıt nesnesi
  - `orders` — Sipariş verisi dizisi, veritabanından gelen sipariş kayıtları
  - `order` — İlk sipariş nesnesi, işlenecek olan sipariş
  - `isAdmin` — Kullanıcının admin olup olmadığını belirten bayrak
  - `prof` — Kullanıcı profil verisi için HTTP yanıt nesnesi
  - `arr` — Kullanıcı profil dizisi, veritabanından gelen profil kayıtları
  - `row` — İlk profil satırı, kullanıcının rolünü içerir
  - `isOwner` — Kullanıcının siparişin sahibi olup olmadığını belirten bayrak
  - `totalAmount` — Sipariş toplam tutarı, iade miktarı için referans
  - `prevDebug` — Önceki ödeme debug bilgisi, iade geçmişi için kullanılır
  - `refundedTotalPrev` — Daha önce iade edilen toplam tutar
  - `payId` — Iyzipay ödeme ID'si, tam iptal işlemi için gerekli
  - `transactions` — Ödeme işlemleri dizisi, parsiyel iade için işlem ID'leri
  - `Iyzi` — Iyzipay yapıcı fonksiyonu, SDK nesnesi oluşturmak için kullanılır
  - `sdk` — Iyzipay SDK nesnesi, ödeme iptal/iade işlemleri için kullanılır
  - `targetAmount` — Hedef iade tutarı, tam veya parsiyel iade miktarı
  - `epsilon` — Kayan nokta hassasiyeti, tam iade kontrolü için kullanılır
  - `isFull` — Tam iptal işlemi mi yoksa parsiyel iade mi olduğunu belirler
  - `iyzResult` — Iyzipay API yanıt nesnesi, iade/iptal işleminin sonucu
  - `LOCALE_TR` — Türkçe dil ayarı, Iyzipay API çağrıları için kullanılır
  - `ptx` — Ödeme işlem ID'si, parsiyel iade için gerekli
  - `ok` — Iyzipay işleminin başarılı olup olmadığını belirten bayrak
  - `itemsResp` — Sipariş kalemleri için HTTP yanıt nesnesi
  - `items` — Sipariş kalemleri dizisi, stok iadesi için kullanılır
  - `it` — Döngü içindeki her bir sipariş kalemi
  - `pResp` — Ürün bilgisi için HTTP yanıt nesnesi
  - `cur` — Mevcut ürün nesnesi, stok bilgisi içerir
  - `curStock` — Ürünün mevcut stok miktarı
  - `newStock` — Stok iadesi sonrası yeni stok miktarı
  - `newDebug` — Güncellenmiş ödeme debug bilgisi, tam iptal sonrası
  - `newStatus` — Sipariş durumu güncelleme (shipped/delivered hariç cancelled)
  - `partials` — Daha önceki parsiyel iadeler dizisi
  - `newRefundedTotal` — Yeni toplam iade tutarı (parsiyel iade sonrası)
  - `newStatusPayment` — Yeni ödeme durumu (refunded veya partial_refunded)
  - `dbg` — Güncellenmiş ödeme debug bilgisi, parsiyel iade sonrası
- **Dönüş**: Response — JSON yanıt nesnesi, farklı durumlara göre farklı mesajlar ve HTTP durum kodları döner:
  - Başarılı tam iptal: `{ status: 'refunded', type: 'cancel', amount: targetAmount, order_id: orderId }`
  - Başarılı parsiyel iade: `{ status: newStatusPayment, type: 'refund', amount: targetAmount, refunded_total: newRefundedTotal, order_id: orderId }`
  - Hata durumları: `{ error: { code: string, message: string } }` formatında hata mesajları
  - Önceden işlenmiş iade: `{ status: 'already_refunded', order_id: orderId }`

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-refund\index.ts
  function: supabase\functions\iyzico-refund\index.ts::iyzico-refund_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-refund_handler