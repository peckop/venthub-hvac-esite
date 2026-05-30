---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: 728e831857b032c6
entity_hashes:
  func:iyzico-payment_handler: de31c29702dafb3c
  overview: 10ad7fb56d2cc8ae
generated_at: 2026-05-30T20:29:25Z
---

## Genel Bakış

Bu modül, İyzico ödeme altyapısıyla entegre çalışan bir Supabase Edge Function'dır. HTTP istekleri üzerinden ödeme başlatma, iptal etme ve durum sorgulama gibi temel ödeme operasyonlarını merkezi olarak yönetir. Hassas müşteri verilerini (e-posta, adres bilgileri) maskeleyerek güvenli ödeme süreçleri sunar.

## Fonksiyon Grupları

### Ödeme İşlemi Yönetimi
Gelen HTTP isteklerini alarak İyzico API'sine uygun ödeme akışlarını yönlendirir. İstek metoduna göre (ödeme başlatma, iptal, durum sorgulama) uygun işlemi başlatır ve sonucu istemciye iletir.

- iyzico_payment_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır. Mevcut bilgiler (fonksiyon imzası ve modül sabitleri), modülün doğru çalışması için zorunlu olan koşulları belirlemek için yeterli değildir. Aksiyomlar, fonksiyon gövdesinin analiz edilmesiyle üretilebilir.

---

## FONKSİYON DETAYLARI

### iyzico-payment_handler

**Ne yapar**: Bu fonksiyon, gelen HTTP isteklerini işleyerek iyzico ödeme sistemiyle ilgili işlemlerin yürütülmesini sağlar. Supabase Edge Function yapısı kapsamında tanımlanmış bir HTTP handler fonksiyonudur. Fonksiyon, HTTP talebini alır ve uygun bir HTTP yanıtı döndürür.

**Nasıl yapar**: Fonksiyonun detaylı iç mantığı docstring'de belgelenmemiştir. Genel yapı itibarıyla, gelen HTTP Request nesnesini analiz ederek iyzico ödeme akışına uygun şekilde işler ve Response nesnesi oluşturarak istemciye geri dönüş yapar. Edge Function yapısı gereği asynchronous olarak çalışabilir.

**Parametreler**:
- `req`: Request — HTTP isteği nesnesi. İstemciden gelen tüm HTTP talep bilgilerini (headers, body, query params, method vb.) içerir. Bu nesne aracılığıyla isteğin içeriğine erişilir.

**Dönüş**: `Response` — Fonksiyonun döndürdüğü HTTP yanıt nesnesi. İşlem sonucuna göre istemciye uygun durum kodu ve içerik döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::maskPaymentMin
- **params**: `obj` — `PaymentMin` tipinde, ödeme verisi içeren nesne; hassas alanlar maskelenir
- **ic_degiskenler**: (yok — parametre üzerinde spread + koşullu eşleme yapılır)
- **Dönüş**: Hassas alanları (`email`, `gsmNumber`, `registrationAddress`, `ip`, `address`) maskelenmiş `PaymentMin` nesnesi; `buyer`, `shippingAddress`, `billingAddress` koşullu olarak eklenir
- **Closure değişkenleri**: `mask` — metin maskeleyici yardımcı fonksiyon

---

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mask
- **params**: `k` — `string | null | undefined`, maskelenecek anahtar/metin
- **ic_degiskenler**:
  - `s` — `String(k)` dönüşümü ile elde edilen güvenli string; uzunluk kontrolü ve dilimleme için kullanılır
- **Dönüş**: `string` — Uzunluk ≤10 ise aynen döner; >10 ise ilk 6 karakter + `…` + son 4 karakter formatında kısaltılmış metin; `k` falsy ise `'(missing)'` döner

---

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mapRawToOrderItem
- **params**: `raw` — Ham ürün satır verisi (DB satırı)
- **ic_degiskenler**:
  - `_productId` — `raw.product_id` değerinden elde edilen ürün ID'si; ürün haritasında arama ve dönüş objesinde `product_id` alanı için kullanılır
  - `unitPrice` — `Number(raw.unit_price)` ile elde edilen birim fiyat; hesaplamalarda kullanılır
  - `qty` — `Math.max(1, Number(raw.quantity ?? 1))` ile elde edilen miktar; minimum 1 garanti edilir
  - `safeUnit` — `Number.isFinite(unitPrice)` kontrolü ile finite olmayan değerlerde 0'a düşürülen güvenli birim fiyat
  - `p` — `_productId` varsa `prodMap.get(_productId)` ile elde edilen ürün kaydı (`Record<string, unknown>`); `name` ve `image_url` alanları kullanılır, bulunamazsa boş nesne `{}`
  - `fid` — `String(_productId || '')` — string karşılığı; `nameMap` ve `imageMap` aramalarında kullanılır
  - `fallbackName` — `p.name` → `nameMap.get(fid)` → `'Ürün'` sıralamasıyla belirlenen ürün adı fallback zinciri
  - `fallbackImage` — `p.image_url` → `imageMap.get(fid)` → `null` sıralamasıyla belirlenen ürün görsel URL fallback zinciri
- **Closure değişkenleri**: `prodMap` — ürün bilgileri Map'i; `nameMap` — ürün ad fallback Map'i; `imageMap` — ürün görsel fallback Map'i; `dbOrderId` — veritabanı sipariş ID'si; `tenantId` — kiracı/mağaza tanımlayıcısı
- **Dönüş**: `{ order_id, product_id, product_name, unit_price, quantity, total_price, price_at_time, product_image_url, tenant_id }` — sipariş kalemi nesnesi; `total_price = safeUnit * qty` olarak hesaplanır

---

### [N4_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mapItemToBasketItem
- **params**: `item` — Sipariş kalemi nesnesi (`product_id`, `unit_price`, `quantity` alanları beklenir)
- **ic_degiskenler**: (yok — doğrudan parametre ve closure'dan değerler kullanılır)
- **Closure değişkenleri**: `prodMap` — ürün adı çözümlemek için kullanılır; `to2` — fiyat yuvarlama yardımcısı
- **Dönüş**: `{ id, name, category1: 'HVAC', category2: 'Products', itemType: 'PHYSICAL', price }` — Iyzipay sepet kalemi formatında nesne; `price` alanı `to2(Number(item.unit_price) * Number(item.quantity)).toFixed(2)` ile hesaplanır; `name` alanı `prodMap.get(item.product_id)?.name` veya `'Ürün'` fallback'i

---

### [N5_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::buildCallbackUrl
- **params**: (yok)
- **ic_degiskenler**:
  - `su` — `Deno.env.get('SUPABASE_URL') || ''` ile elde edilen Supabase URL'si; ortam değişkeninden okunur
  - `host` — `new URL(su).host` ile ayrıştırılan hostname; örn. `tnofewwkwlyjsqgwjjga.supabase.co`
  - `projectRef` — `host.split('.')[0]` ile elde edilen Supabase proje referans ID'si
- **Dönüş**: `string` — Tam callback URL'si (`https://{projectRef}.functions.supabase.co/iyzico-callback`); URL ayrıştırma başarısız olursa boş string `''` döner

---

### [N6_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mapToIyziBasketItem
- **params**: `it` — Daha önce dönüştürülmüş sepet kalemi nesnesi (`id`, `name`, `category1`, `category2`, `itemType`, `price` alanları beklenir)
- **ic_degiskenler**: (yok — doğrudan spread + alan eşleme yapılır)
- **Closure değişkenleri**: `IYZI` — Iyzipay sabitleri nesnesi; `IYZI.BASKET_ITEM_TYPE?.PHYSICAL` kullanılır
- **Dönüş**: `{ id, name, category1, category2, itemType, price }` — Iyzipay SDK sepet kalemi formatında nesne; `itemType` alanı `IYZI.BASKET_ITEM_TYPE?.PHYSICAL ?? 'PHYSICAL'` olarak çözümlenir

---

### [N7_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::initCheckoutForm
- **params**: `resolve` — Promise resolve callback'i; `reject` — Promise reject callback'i
- **ic_degiskenler**: (yok)
- **Closure değişkenleri**: `sdk` — Iyzipay SDK instance'ı; `sdk.checkoutFormInitialize.create()` çağrılır; `sdkRequest` — Checkout form başlatma istek parametreleri
- **Dönüş**: void — Promise executor fonksiyonu; `sdk.checkoutFormInitialize.create(sdkRequest, callback)` çağrısı ile asenkron ödeme sayfası başlatılır; `err` varsa `reject(err)`, başarı durumunda `resolve(res)` çağrılır

---

### [N8_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::checkoutFormCallback
- **params**: `err` — `unknown` tipinde hata nesnesi (SDK hata durumu); `res` — `{ status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }` — SDK yanıt nesnesi
- **ic_degiskenler**: (yok)
- **Closure değişkenleri**: `resolve` — dış scope'dan gelen Promise resolve; `reject` — dış scope'dan gelen Promise reject
- **Dönüş**: void — N7'deki `create` methodunun callback'i; `err` varsa `reject(err)`, başarı durumunda `resolve(res)`

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler