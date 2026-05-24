---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: e7449cae93703b16
generated_at: 2026-05-24T07:34:33Z
---

## Genel Bakış
Bu modül, Supabase fonksiyonu üzerinden gelen HTTP isteklerini alarak İyzico ödeme entegrasyonunu gerçekleştiren tek bir işlevi içerir. İstekleri işleyerek ödeme işlemlerini başlatır, gerekli doğrulama ve yanıt hazırlama süreçlerini yönetir.

## Fonksiyon Grupları
### İyzico Ödeme İşleme
Bu grup, gelen istekleri çözümleyip İyzico API'si ile etkileşime geçerek ödeme işlemlerini başlatmak ve sonuçları istemciye dönük yanıt olarak hazırlamaktan sorumludur.
- iyzico-payment_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için geçerli bir `Request` nesnesi beklenir; bu nesnenin belirli özelliklerinin eksikliği veya yanlış biçimi işlemin başarısız olmasına yol açar.

- **Eğer** `req` **tanımsız veya null** ise, **sonuç**: handler bir hata fırlatır veya başarısız yanıt döner.  
- **Eğer** `req.body` **eksik, boş veya geçersiz JSON** ise, **sonuç**: ödeme işleme verisi alınamadığı için işlem başarısız olur.  
- **Eğer** `req.headers['content-type']` **`application/json` değilse**, **sonuç**: istek içeriği ayrıştırılamaz ve handler geçersiz istek hatası döner.  
- **Eğer** `req.method` **`POST` değilse**, **sonuç**: sadece POST isteklerini işlemeyi bekleyen fonksiyon beklenmeyen davranış gösterir (örneğin metod izni hatası veya işlem atlanır).

---

## FONKSIYON DETAYLARI

### iyzico-payment_handler
**Ne yapar**: İyzico ödeme entegrasyonu ile ilgili gelen HTTP isteklerini işler ve uygun bir yanıt döndürür.  
**Nasıl yapar**: İstek gövdesinden ödeme bilgilerini çıkarır, İyzico API'sine gerekli işlemi (örneğin ödeme oluşturma, iade, sorgulama) yapar, dönüş sonucunu değerlendirir ve istemciye JSON formatında bir Response nesnesi döndürür.  
**Parametreler**:  
- req: Request — İşlenecek HTTP isteği; ödeme detayları, başlıklar ve kimlik doğrulama bilgileri içerir.  
**Dönüş**: Response — İşlemin sonucunu taşıyan HTTP yanıtı; başlıklar, durum kodu ve genellikle JSON gövdesi içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_1
- **params**: obj: PaymentMin
- **ic_degiskenler**: yok
- **Dönüş**: object (gizlenmiş buyer, shippingAddress ve billingAddress alanlarıyla zenginleştirilmiş PaymentMin nesnesi)

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_2
- **params**: k?: string | null
- **ic_degiskenler**: s — k’nın string temsili
- **Dönüş**: string (kısaltılmış veya '(missing)' döndüren maskeleme fonksiyonu)

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_3
- **params**: raw
- **ic_degiskenler**:
  - _productId — raw.product_id
  - unitPrice — Number(raw.unit_price)
  - qty — Math.max(1, Number(raw.quantity ?? 1))
  - safeUnit — unitPrice’nin finite olup olmadığına göre 0 veya unitPrice
  - p — prodMap.get(_productId) sonucu veya boş obje
  - fid — String(_productId || '')
  - fallbackName — p.name, nameMap.get(fid) veya 'Ürün' varsayılanı
  - fallbackImage — p.image_url, imageMap.get(fid) veya null
- **Dönüş**: object (order_id, product_id, product_name, unit_price, quantity, total_price, price_at_time, product_image_url alanları)

### [N4_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_4
- **params**: item
- **ic_degiskenler**: yok
- **Dönüş**: object (id, name, category1='HVAC', category2='Products', itemType='PHYSICAL', price (iki ondalık) )

### [N5_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_5
- **params**: yok
- **ic_degiskenler**:
  - su — Deno.env.get('SUPABASE_URL') veya boş string
  - host — new URL(su).host
  - projectRef — host.split('.')[0]
- **Dönüş**: string (callback URL) veya hata durumunda boş string

### [N6_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_6
- **params**: it
- **ic_degiskenler**: yok
- **Dönüş**: object (id, name, category1, category2, itemType, price)

### [N7_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_7
- **params**: resolve, reject
- **ic_degiskenler**: yok
- **Dönüş**: yok (fonksiyon undefined döndürür; iç callback ile resolve/reject tetiklenir)

### [N8_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts::iyzico-payment_handler_8
- **params**: err: unknown, res: { status?: string; token?: string; paymentPageUrl?: string; checkoutFormContent?: string; errorMessage?: string }
- **ic_degiskenler**: yok
- **Dönüş**: yok (fonksiyon undefined döndürür; err varsa reject(err) çağırır, yoksa resolve(res) çağırır)

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler