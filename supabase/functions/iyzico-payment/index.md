---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: e7449cae93703b16
entity_hashes:
  func:iyzico-payment_handler: de31c29702dafb3c
  overview: d39806382aa360a5
generated_at: 2026-05-28T22:44:38Z
---

## Genel Bakış
Bu modül, İyzico ödeme altyapısıyla entegre çalışan bir Supabase Edge Function'dır. Gelen HTTP isteklerini alarak ödeme işlemlerini başlatır, ilgili API süreçlerini yönetir ve sonucu istemciye yanıt olarak iletir.

## Fonksiyon Grupları
### Ödeme İşleme
Bu grup, gelen HTTP isteklerini işleyerek İyzico ile ödeme başlatma, doğrulama ve iptal gibi temel operasyonları yürütür.
- iyzico_payment_handler

---



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

### [N1_NASIL] AST Pointer: iyzico-payment/index.ts::sanitize_payment_obj
- **params**: `obj: PaymentMin`
- **ic_degiskenler**:
  - `obj` — Ödeme nesnesi; buyer, shippingAddress, billingAddress alanları maskelenir
  - `obj.buyer.email` — Alıcı e-posta adresi, `mask()` ile gizlenir
  - `obj.buyer.gsmNumber` — Alıcı telefon numarası, `mask()` ile gizlenir
  - `obj.shippingAddress.address` — Teslimat adresi, `'***'` ile gizlenir
  - `obj.billingAddress.address` — Fatura adresi, `'***'` ile gizlenir
- **Dönüş**: `PaymentMin` nesnesi (maskelenmiş alanlarla, spread ile kopyalanmış)

### [N2_NASIL] AST Pointer: iyzico-payment/index.ts::mask
- **params**: `k?: string | null`
- **ic_degiskenler**:
  - `k` — Masklanacak anahtar/veri stringi
  - `s` — `String(k)` dönüşümü ile elde edilen safe string kopyası
- **Dönüş**: `string` — Kızgın maskeleme sonucu; uzunluk ≤10 ise olduğu gibi, >10 ise ilk 6 karakter + `…` + son 4 karakter

### [N3_NASIL] AST Pointer: iyzico-payment/index.ts::map_raw_to_line_item
- **params**: `raw` (ham satır objesi)
- **ic_degiskenler**:
  - `raw.product_id` — Ham satırdaki ürün ID'si
  - `raw.unit_price` — Ham satırdaki birim fiyat
  - `raw.quantity` — Ham satırdaki miktar, `Number(raw.quantity ?? 1)` ile normalize edilir
  - `_productId` — `raw.product_id` değerinin atanması
  - `unitPrice` — `Number(raw.unit_price)` ile sayısal dönüşüm
  - `qty` — Miktar; `Math.max(1, ...)` ile minimum 1 garantisi
  - `safeUnit` — Geçerli sonsuz olmayan sayısal birim fiyat veya `0` fallback
  - `p` — `prodMap.get(_productId)` ile ürün haritasından eşleşen ürün nesnesi veya boş obje
  - `fid` — String ürün ID'si, `String(_productId || '')`
  - `fallbackName` — Ürün adı: önce `p.name`, sonra `nameMap.get(fid)`, sonra `'Ürün'`
  - `fallbackImage` — Ürün görseli: önce `p.image_url`, sonra `imageMap.get(fid)`, sonra `null`
  - `dbOrderId` — Dışarıdan gelen veritabanı sipariş ID'si
  - `prodMap` — Dışarıdan gelen ürün haritası (`Map`)
  - `nameMap` — Dışarıdan gelen ürün adı haritası (`Map`)
  - `imageMap` — Dışarıdan gelen ürün görseli haritası (`Map`)
- **Dönüş**: `{ order_id, product_id, product_name, unit_price, quantity, total_price, price_at_time, product_image_url }` nesnesi

### [N4_NASIL] AST Pointer: iyzico-payment/index.ts::to_iyzico_basket_item
- **params**: `item`
- **ic_degiskenler**:
  - `item.product_id` — Ürün ID'si
  - `item.unit_price` — Birim fiyat
  - `item.quantity` — Miktar
  - `prodMap` — Dışarıdan gelen ürün haritası; `item.product_id` ile `get()` çağrısı yapılarak name alınır
  - `to2` — Dışarıdan gelen sayısal yuvarlama yardımcı fonksiyonu
- **Dönüş**: `{ id, name, category1: 'HVAC', category2: 'Products', itemType: 'PHYSICAL', price }` — price ondalık iki basamaklı string

### [N5_NASIL] AST Pointer: iyzico-payment/index.ts::get_callback_url
- **params**: yok
- **ic_degiskenler**:
  - `su` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase URL'si, boş string fallback
  - `host` — `new URL(su).host` ile ayrıştırılan hostname
  - `projectRef` — `host.split('.')[0]` ile elde edilen Proje referansı
- **Dönüş**: `string` — `https://{projectRef}.functions.supabase.co/iyzico-callback` formatında callback URL; parse hatasında boş string

### [N6_NASIL] AST Pointer: iyzico-payment/index.ts::to_iyzico_basket_item_full
- **params**: `it`
- **ic_degiskenler**:
  - `it.id` — Basket item ID
  - `it.name` — Basket item adı
  - `it.category1` — Kategori 1
  - `it.category2` — Kategori 2
  - `IYZI.BASKET_ITEM_TYPE?.PHYSICAL` — IYZI sabitinden PHYSICAL item type; fallback `'PHYSICAL'`
  - `it.price` — Fiyat
- **Dönüş**: `{ id, name, category1, category2, itemType, price }` — Iyzipay SDK basket item formatı

### [N7_NASIL] AST Pointer: iyzico-payment/index.ts::init_checkout_form_promise_executor
- **params**: `resolve`, `reject`
- **ic_degiskenler**:
  - `sdk` — Dışarıdan gelen Iyzipay SDK instance'ı
  - `sdkRequest` — Dışarıdan gelen checkout form initialize istek nesnesi
  - `sdk.checkoutFormInitialize.create` — Iyzipay checkout form oluşturma API çağrısı
  - `err` — Callback hata nesnesi; varsa `reject(err)` ile reddedilir
  - `res` — Callback yanıt nesnesi (`{ status?, token?, paymentPageUrl?, checkoutFormContent?, errorMessage? }`)
- **Dönüş**: Promise executor — `resolve(res)` ile SDK yanıtını döner

### [N8_NASIL] AST Pointer: iyzico-payment/index.ts::checkout_form_callback
- **params**: `err: unknown`, `res: { status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }`
- **ic_degiskenler**:
  - `err` — Hata nesnesi;truthy ise `reject(err)` çağrılır
  - `res` — SDK yanıt nesnesi; içeriği `status`, `token`, `paymentPageUrl`, `checkoutFormContent`, `errorMessage` alanlarını barındırır
  - `reject` — Dışarıdan gelen Promise reject fonksiyonu
  - `resolve` — Dışarıdan gelen Promise resolve fonksiyonu
- **Dönüş**: yok (yan etki: `reject(err)` veya `resolve(res)` çağrısı)

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler