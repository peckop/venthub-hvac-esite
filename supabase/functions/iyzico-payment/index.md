---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: 728e831857b032c6
entity_hashes:
  func:iyzico-payment_handler: de31c29702dafb3c
  overview: 10ad7fb56d2cc8ae
generated_at: 2026-05-30T21:16:10Z
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

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler