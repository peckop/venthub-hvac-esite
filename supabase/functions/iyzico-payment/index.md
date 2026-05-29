---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: 8761b392fd3c1940
entity_hashes:
  func:iyzico-payment_handler: de31c29702dafb3c
  overview: e63f8c36df209855
generated_at: 2026-05-29T11:43:41Z
---

## Genel Bakış

Bu modül, İyzico ödeme altyapısıyla entegre çalışan bir Supabase Edge Function'dır. HTTP istekleri üzerinden ödeme başlatma, iptal etme ve durum sorgulama gibi temel ödeme operasyonlarını yönetir. Güvenlik kapsamında hassas ödeme verilerini (e-posta, adres bilgileri) maskeleyerek işler.

## Fonksiyon Grupları

### Ödeme İsteği Yönetimi
Bu grup, gelen HTTP isteklerini alır, istek metodunu ve içeriğini analiz ederek İyzico API'sine uygun ödeme akışını başlatır.
- iyzico_payment_handler

### Veri Hijyeni
Bu grup, İyzico'ya gönderilecek ödeme nesnelerindeki hassas alanları (e-posta, adres) maskeleyerek veri sızıntısını önler.
- sanitize_payment_obj

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimal ve doğrulanabilir aksiyomlar tanımlanmıştır.

---

**[Aksiyom 1]**: Eğer `req` parametresi (`Request` tipinde) sağlanmazsa veya geçersiz bir HTTP isteği gelirse, `iyzico_payment_handler` fonksiyonu çalıştırılamaz ve istemciye hata yanıtı döner.

**[Aksiyom 2]**: Eğer fonksiyon bir Supabase Edge Function ortamında çalıştırılmazsa (Edge Runtime mevcut değilse), iyzico API çağrıları ve HTTP response oluşturma işlemleri başarısız olur.

**[Aksiyom 3]**: Eğer iyzico API entegrasyonu için gerekli ortam değişkenleri (API key, secret vb.) tanımlı değilse, ödeme işlemleri başlatılamaz. *(Not: Bu değerler fonksiyon imzasında görünmeyen dış bağımlılıklardır; fonksiyon gövdesinde erişilip erişilmediği bilinmemektedir.)*

---

> **Not**: Fonksiyon gövdesi kodu paylaşılmadığı için, modül içi detaylı akış kuralları, hata yönetimi varsayımları veya domain-specific eşik değerleri çıkarılamamıştır. Mevcut aksiyonlar yalnızca fonksiyon imzası ve modülün yapısal bilgisine dayanmaktadır.

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

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mask_object
- **params**: `(obj: PaymentMin)` — маскировка yapılacak ödeme/kişisel veri nesnesi
- **ic_degiskenler**:
  - (dahili değişken yok — tüm işlem inline spread ile yapılır)
- **Dönüş**: Kişisel verileri maskelenmiş (`email`, `gsmNumber`, `registrationAddress`, `ip`, `address`) PaymentMin nesnesi; `buyer`, `shippingAddress`, `billingAddress` alanları varsa maskelenir, yoksa `undefined` döner

---

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::mask
- **params**: `(k?: string | null)` — maskelenecek anahtar/metin değeri
- **ic_degiskenler**:
  - `s` — `k` değerinin `String()` ile garanti altına alınmış hal; uzunluk kontrolü ve dilimleme bu üzerinde yapılır
- **Dönüş**: `string` — değer yoksa `'(missing)'`, 10 karakter ve altıysa aynen, daha uzunsa ilk 6 + `…` + son 4 karakter formatında

---

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::raw_to_order_item
- **params**: `(raw)` — ham sipariş satır verisi (veritabanından gelen ham kayıt)
- **ic_degiskenler**:
  - `_productId` — `raw.product_id` değerinin referansı; ürün kimliğini tutar
  - `unitPrice` — `raw.unit_price` değerinin `Number()` ile sayıya çevrilmiş hali; birim fiyatı temsil eder
  - `qty` — `raw.quantity` değerinin `Number()` ile çevrilip en az 1'e sabitlenmiş (Math.max) miktarı; sipariş adedini tutar
  - `safeUnit` — `unitPrice` sonsuz sayı değilse kendisi, değilse 0 olarak garanti altına alınmış birim fiyat
  - `p` — `prodMap` lookup haritasından `_productId` ile çekilen ürün nesnesi; ürün adı ve görseli fallback olarak kullanılır
  - `fid` — `_productId` değerinin `String()` ile garantiye alınmış hali; `nameMap` ve `imageMap` haritalarında lookup için kullanılır
  - `fallbackName` — ürün adı: önce `p.name`, sonra `nameMap.get(fid)`, son çare olarak `'Ürün'`
  - `fallbackImage` — ürün görseli: önce `p.image_url`, sonra `imageMap.get(fid)`, son çare olarak `null`
- **Dış değişken erişimleri**: `prodMap` (Map — ürün lookup haritası), `nameMap` (Map — ürün adı fallback haritası), `imageMap` (Map — ürün görseli fallback haritası), `dbOrderId` (sipariş veritabanı kimliği)
- **Dönüş**: `{ order_id, product_id, product_name, unit_price, quantity, total_price, price_at_time, product_image_url }` yapısında sipariş kalemi nesnesi

---

### [N4_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::item_to_basket_item
- **params**: `(item)` — sipariş kalemi nesnesi (order item)
- **ic_degiskenler**:
  - (dahili değişken yok — tüm değerler inline hesaplanır)
- **Dış değişken erişimleri**: `prodMap` (Map — ürün lookup haritası, `get` metodu ile ürün bilgisi çekilir), `to2` (sayıyı iki ondalık basamağa yuvarlayan yardımcı fonksiyon)
- **Dönüş**: `{ id, name, category1: 'HVAC', category2: 'Products', itemType: 'PHYSICAL', price }` yapısında iyzicoya gönderilecek sepet kalemi nesnesi

---

### [N5_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::build_callback_url
- **params**: yok
- **ic_degiskenler**:
  - `su` — `SUPABASE_URL` ortam değişkeninin değeri; boş string fallback'li olarak alınır
  - `host` — `su` URL'sinden çıkarılan hostname (ör. `tnofewwkwlyjsqgwjjga.supabase.co`)
  - `projectRef` — `host` stringinin ilk `.`'den önceki kısmı; Supabase proje referansı
- **Dönüş**: `string` — iyzico callback URL'i (`https://{projectRef}.functions.supabase.co/iyzico-callback`); `catch` bloğunda boş string `''` döner

---

### [N6_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::format_basket_item
- **params**: `(it)` — daha önce formatlanmış basket item nesnesi
- **ic_degiskenler**:
  - (dahili değişken yok — tüm alanlar inline atanır)
- **Dış değişken erişimleri**: `IYZI` (iyzico SDK sabitler objesi; `IYZI.BASKET_ITEM_TYPE?.PHYSICAL` erişimi yapılır, yoksa `'PHYSICAL'` fallback)
- **Dönüş**: `{ id, name, category1, category2, itemType, price }` yapısında iyzico SDK'nın beklediği formata göre düzenlenmiş sepet kalemi

---

### [N7_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::checkout_form_initialize
- **params**: `(resolve, reject)` — Promise executor callback'leri
- **ic_degiskenler**:
  - (dahili değişken yok)
- **Dış değişken erişimleri**: `sdk` (iyzico SDK nesnesi — `sdk.checkoutFormInitialize.create` metodu çağrılır), `sdkRequest` (iyzico'ya gönderilen istek parametreleri objesi)
- **Dönüş**: `void` — `sdk.checkoutFormInitialize.create` çağrısının sonucu `resolve(res)` ile çözülür; hata varsa `reject(err)` ile reddedilir

---

### [N8_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::checkout_form_callback
- **params**: `(err: unknown, res: { status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string })` — iyzico SDK'nın asenkron callback parametreleri
- **ic_degiskenler**:
  - (dahili değişken yok)
- **Closure erişimleri**: `resolve` ve `reject` — üst fonksiyonun ([N7]) Promise executor kapsamından gelir
- **Dönüş**: `void` — hata varsa `reject(err)`, başarılıysa `resolve(res)` çağrılır

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler