---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\iyzico-callback\index.ts
skeleton_hash: 828e661b626678aa
generated_at: 2026-05-24T07:35:33Z
---

## Genel Bakış
Bu modül, İyzico ödeme sağlayıcısından gelen geri dönüş isteklerini yakalayıp işleyen bir Supabase Edge fonksiyonudur. Tek bir ana işleyici fonksiyon üzerinden, İyzico tarafından gönderilen veri paketini alır, gerekli doğrulama ve işleme adımlarını gerçekleştirir ve uygun HTTP yanıtını döndürür.

## Fonksiyon Grupları
### İyzico Callback İşleme
Modülün tek sorumluluğu, İyzico webhook çağrılarını kabul etmek ve işlemektir.
- iyzico-callback_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmıştır.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa, fonksiyon iyzico callback verilerini işleyemez ve beklenen yanıt üretilemez.

---

## FONKSIYON DETAYLARI

### iyzico-callback_handler
**Ne yapar**: iyzico ödeme sisteminden gelen geri çağrı (webhook) isteğini işler, ödeme durumunu kontrol eder ve gerekli işlemleri yapar.  
**Nasıl yapar**: İstekten gerekli verileri (örneğin token, paymentId, status) çıkarır, iyzico tarafından sağlanan imzayı doğrular, başarılı veya başarısız ödeme durumuna göre veritabanını günceller ve uygun HTTP yanıtı döndürür.  
**Parametreler**:  
- req: Request — iyzico tarafından gönderilen HTTP isteği, genellikle query parametreleri veya JSON gövdesi içerir.  
**Dönüş**: Response — işlem sonucunu temsil eden HTTP yanıtı (örneğin 200 OK veya hata durumunda 4xx/5xx).

---

## TYPE ALIASES

### CheckoutRetrieveResponse
```typescript
type CheckoutRetrieveResponse = {
  paymentStatus?: string;
  conversationId?: string;
  errorMessage?: string;
  paymentId?: string;
  cardFamily?: string;
  binNumber?: string;
  lastFourDigits?: string;
  [k: string]: unk
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::<anonymous>
- **params**: resolve, reject
- **ic_degiskenler**:
  - `resolve` — Fonksiyonun başarılı sonuçta çağrılması gereken Promise resolve callback'i
  - `reject` — Fonksiyonun hata durumunda çağrılması gereken Promise reject callback'i
  - `retrieveReq` — Iyzico checkout formunu almak için gönderilen istek nesnesi
  - `sdk` — Iyzipay entegrasyonu için başlatılmış SDK nesnesi (Iyzipay)
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::<anonymous>
- **params**: err, res
- **ic_degiskenler**:
  - `err` — Iyzico retrieve işlemi sırasında oluşan hata nesnesi (unknown tipinde)
  - `res` — Iyzico checkout form retrieve yanıtı (CheckoutRetrieveResponse tipinde)
  - `resolve` — Dış fonksiyondan alınan Promise resolve callback'i
  - `reject` — Dış fonksiyondan alınan Promise reject callback'i
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: supabase/functions/iyzico-callback/index.ts::patchStatus
- **params**: newStatus
- **ic_degiskenler**:
  - `newStatus` — Güncellenecek sipariş durumu ('paid', 'failed' veya 'confirmed')
  - `orderId` — Venthub orders tablosunda güncellenecek siparişin benzersiz kimliği (string veya undefined)
  - `result` — Iyzico callback yanıtından elde edilen nesne, conversationId içerebilir
  - `conversationId` — Iyzico işlemiyle ilişkili konuşma kimliği (string veya undefined)
  - `supabaseUrl` — Supabase projesinin REST API endpoint URL'si (string)
  - `serviceRoleKey` — Supabase service role anahtarı, admin yetkileriyle isteklerde kullanılır
  - `debugInfo` — Ödeme hata ayıklama bilgisi, yanıtın body kısmına eklenir
  - `filterById` — orderId varsa oluşturulan filtre sorgusu (string)
  - `filterByConv` — orderId yoksa conversationId üzerinden oluşturulan filtre sorgusu (string)
  - `filter` — Kullanılacak final filtre (filterById veya filterByConv)
  - `resp` — Supabase PATCH isteğinin cevabı (Response nesnesi)
- **Dönüş**: Response — Supabase PATCH isteğinin ham Response nesnesi (veya null eğer filtre yok)

---

## NODE ID STANDARD

  file: supabase\functions\iyzico-callback\index.ts
  function: supabase\functions\iyzico-callback\index.ts::iyzico-callback_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: iyzico-callback_handler