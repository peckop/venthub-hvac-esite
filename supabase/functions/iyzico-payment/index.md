---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\iyzico-payment\index.ts
skeleton_hash: debf4ca0e0179b96
entity_hashes:
  func:iyzico-payment_handler: de31c29702dafb3c
  overview: e7caf5244e4f3d30
generated_at: 2026-08-15T09:05:02Z
---

## Genel Bakış
Bu modül, İyzico ödeme altyapısını kullanarak güvenli online ödeme süreçlerini yöneten bir Supabase Edge Function'dır. Tek bir HTTP handler fonksiyonu aracılığıyla, istemciden gelen isteklere göre ödeme başlatma, iptal etme ve durum sorgulama gibi temel finansal operasyonları merkezi ve güvenli bir şekilde yürütür.

## Fonksiyon Grupları
### HTTP İstek İşleme ve Yönlendirme
Gelen tüm HTTP isteklerini alarak, istek metoduna ve içeriğine göre ilgili İyzico ödeme işlemini başlatır ve sonucunu istemciye iletir.
- iyzico-payment_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### iyzico-payment_handler

**Ne yapar**: Bu fonksiyon, gelen HTTP isteklerini işleyerek iyzico ödeme sistemiyle ilgili işlemlerin yürütülmesini sağlar. Supabase Edge Function yapısı kapsamında tanımlanmış bir HTTP handler fonksiyonudur. Fonksiyon, HTTP talebini alır ve uygun bir HTTP yanıtı döndürür.

**Nasıl yapar**: Fonksiyonun detaylı iç mantığı docstring'de belgelenmemiştir. Genel yapı itibarıyla, gelen HTTP Request nesnesini analiz ederek iyzico ödeme akışına uygun şekilde işler ve Response nesnesi oluşturarak istemciye geri dönüş yapar. Edge Function yapısı gereği asynchronous olarak çalışabilir.

**Parametreler**:
- `req`: Request — HTTP isteği nesnesi. İstemciden gelen tüm HTTP talep bilgilerini (headers, body, query params, method vb.) içerir. Bu nesne aracılığıyla isteğin içeriğine erişilir.

**Dönüş**: `Response` — Fonksiyonun döndürdüğü HTTP yanıt nesnesi. İşlem sonucuna göre istemciye uygun durum kodu ve içerik döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: npm:iyzipay::Iyzipay

---

## AST POINTERS

### [N1_NASIL] AST Pointer: iyzico-payment/index.ts::maskPaymentInfo
- **params**: `(obj: PaymentMin)` — Ödeme bilgisi nesnesi
- **ic_degiskenler**:
  - yok — Spread operasyonları ile doğrudan dönüş yapılıyor
- **Dönüş**: Maskelenmiş `PaymentMin` nesnesi (buyer.email, buyer.gsmNumber masked; registrationAddress, ip ve shipping/billing address'ler `'***'` ile değiştirilmiş)

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler