---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-payment\index.ts
skeleton_hash: e7449cae93703b16
generated_at: 2026-05-24T10:45:59Z
---

## Genel Bakış
Bu modül, İyzico ödeme altyapısı ile entegrasyonu sağlayan bir Supabase Edge Function olarak çalışır. Gelen HTTP isteklerini kabul ederek ödeme işlemlerini başlatır, gerekli parametreleri işler ve sonucu istemciye yanıt olarak döner.

## Fonksiyon Grupları
### Ödeme İşleme
Bu grup, gelen HTTP isteklerini alır, İyzico API'si ile gerekli ödeme işlemlerini gerçekleştirir ve işlem sonucuna göre uygun yanıtı hazırlar.
- iyzico-payment_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### iyzico-payment_handler
**Ne yapar**: İyzico ödeme sistemi ile entegre çalışan bir HTTP istek işleyicisidir. Gelen ödeme taleplerini alır, ilgili iyzico API süreçlerini yönetir ve sonucu HTTP yanıtı olarak döndürür.

**Nasıl yapar**: Supabase Edge Function olarak çalışan bu handler, gelen HTTP isteğini alır, istek içeriğine göre gerekli ödeme adımlarını (doğrulama, provizyon, iptal vb.) başlatır ve işlemin sonucunu bir Response nesnesi ile geri döndürür.

**Parametreler**:
- req: Request — Gelen HTTP isteğini temsil eden Request nesnesi. İstek gövdesi (body), başlıkları (headers) ve HTTP metodu (method) bu nesne üzerinden erişilir.

**Dönüş**: Response — İşlem sonucunda oluşturulan HTTP yanıtı. Başarılı veya başarısız durumu belirten, gerekirse hata mesajı veya ödeme bilgilerini içeren bir Response nesnesi döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-payment/index.ts

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-payment\index.ts
  function: supabase\functions\iyzico-payment\index.ts::iyzico-payment_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-payment_handler