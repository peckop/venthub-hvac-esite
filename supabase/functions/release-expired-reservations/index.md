---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: a7cae81d35deed42
entity_hashes:
  func:release-expired-reservations_handler: 2ee83a2fc9a11645
  overview: 6bf610a5523c7d5f
generated_at: 2026-08-15T07:34:00Z
---

## Genel Bakış
Bu modül, süresi dolmuş rezervasyonları otomatik olarak serbest bırakan bir Supabase Edge Function'dır. Gelen HTTP istekleri aracılığıyla tetiklenerek veritabanındaki geçerlilik süresi dolan rezervasyon kayıtlarını tespit eder, bunların durumunu günceller ve ilişkili kaynakların yeniden kullanıma açılmasını sağlar.

## Fonksiyon Grupları
### HTTP İstek İşleyici
Tek bir HTTP endpoint üzerinden dışarıya açılan giriş noktasıdır; isteği alır, iş mantığını koordine eder ve sonucu yanıt olarak döner.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase Edge Functions ortamında HTTP tabanlı bir istek işleyici olarak yapılandırılmıştır.

**[Aksiyom 1]:** Eğer Supabase Edge Functions runtime ortamı (Deno) yoksa, fonksiyon çalıştırılamaz ve HTTP 500 hata yanıtı döner.

**[Aksiyom 2]:** Eğer `@serve` dekoratörü doğru yapılandırılmamışsa (örn. yanlış endpoint rotası), HTTP istekleri bu handler'a yönlendirilemez ve istemci tarafında bağlantı hatası oluşur.

**[Aksiyom 3]:** Eğer `req: Request` parametresi geçerli bir HTTP isteği içermiyorsa (örn. bozuk/eksik header-lar), iş mantığı beklenmedik davranış gösterebilir.

**[Aksiyom 4]:** Eğer modülün erişim izni olduğu veritabanı bağlantısı (Supabase client) yoksa veya erişim izni reddedilirse, rezervasyon sorgulama/güncelleme işlemleri başarısız olur.

**[Aksiyom 5]:** Fonksiyon asenkron (`async`) olarak tanımlanmıştır; eğer await edilen bir operasyon (DB sorgusu, HTTP çağrısı vb.) zaman aşımına uğrarsa, fonksiyon zaman aşımı hatası ile sonlanır.

> **Not:** Fonksiyon gövdesi (implementation body) paylaşılmadığından, iş mantığına ilişkin aksiyomlar (örn: hangi eşik değerine göre rezervasyon "süresi dolmuş" kabul edilir, hangi tablolar güncellenir, ne tür kaynaklar serbest bırakılır vb.) belirlenememiştir. Bu bilgiler için fonksiyon gövdesinin incelenmesi gereklidir.

---

## FONKSİYON DETAYLARI

### release-expired-reservations_handler

**Ne yapar**: Süresi dolmuş rezervasyonları serbest bırakan HTTP istek işleyicisidir. Bu fonksiyon, belirli bir zaman dilimi içinde kullanılmamış veya son kullanma tarihi geçmiş rezervasyonları tespit edip iptal ederek ilgili kaynakları tekrar müsait hale getirir.

**Nasıl yapar**: Fonksiyon, bir Supabase Edge Function olarak HTTP isteklerini karşılar. Gelen isteği işler ve süresi dolmuş rezervasyonları veritabanında bulup serbest bırakma işlemini gerçekleştirir. İşlem sonucunda HTTP yanıt döndürür.

**Parametreler**:
- `req`: Request — Gelen HTTP istek nesnesi. İstek ile ilgili bilgileri (metot, gövde, başlıklar vb.) içerir ve fonksiyonun çalıştırılması için gerekli parametreleri taşır.

**Dönüş**: Response — İşlem sonucuna göre HTTP yanıt nesnesi döndürür. Başarı veya hata durumunu belirten durum kodu ve opsiyonel mesaj içerebilir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://deno.land/std@0.177.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### InventorySettings
- `reservation_timeout_hours: number`

### ExpiredOrder
- `id: string`
- `order_number: string | null`

### OrderItem
- `product_id: string`
- `quantity: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/release-expired-reservations/index.ts`::release-expired-reservations_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `corsHeaders` — İsteğin origin'ine göre ayarlanmış CORS başlıkları nesnesi.
  - `supabaseUrl` — Ortam değişkeninden alınan Supabase proje URL'si.
  - `supabaseKey` — Ortam değişkeninden alınan Supabase service role anahtarı.
  - `authHeader` — İstek başlığından alınan `Authorization` değeri.
  - `isAuthorized` — İstek yapan kullanıcının yetkili olup olmadığını belirleyen boolean bayrak.
  - `anonKey` — Ortam değişkeninden alınan Supabase anonim anahtar (auth istemcisi için).
  - `createClientAuth` — Dinamik import ile yüklenen Supabase istemci oluşturucu fonksiyonu.
  - `authClient` — Kullanıcı kimlik doğrulaması için oluşturulan geçici Supabase istemcisi.
  - `user` — `authClient.auth.getUser` çağrısından dönen kullanıcı nesnesi.
  - `roleCheck` — Kullanıcının rolünü kontrol etmek için Supabase REST API'sine yapılan fetch isteğinin sonucu.
  - `arr` — `roleCheck.json()` çağrısından dönen, kullanıcı rollerini içeren dizi.
  - `role` — `arr` dizisinin ilk elemanından alınan rol string'i (`'admin'` veya `'superadmin'`).
  - `supabase` — Ana Supabase istemcisi, service role anahtarıyla oluşturulmuş.
  - `settingsData` — `inventory_settings` tablosundan sorgulanan rezervasyon ayarları verisi.
  - `settings` — `settingsData`'nın tip güvenli hali (InventorySettings veya null).
  - `hours` — Rezervasyon zaman aşımı süresi (saat cinsinden, varsayılan 24).
  - `timeoutDate` — Mevcut saatten `hours` kadar önceki zamanı temsil eden Date nesnesi.
  - `expiredOrders` — Zaman aşımına uğramış ve `pending` durumundaki siparişlerin listesi.
  - `findErr` — Süresi dolmuş siparişleri sorgulama hata nesnesi.
  - `releasedCount` — Başarıyla iptal edilen ve stokları iade edilen sipariş sayacı.
  - `order` — `expiredOrders` dizisi üzerindeki döngüde mevcut sipariş nesnesi.
  - `updateErr` — Sipariş durumunu güncelleme (iptal etme) hata nesnesi.
  - `itemsRaw` — Siparişin ürünlerini (miktar ve ürün ID) içeren ham veri.
  - `items` — `itemsRaw`'ın tip güvenli hali (OrderItem[]).
  - `item` — `items` dizisi üzerindeki döngüde mevcut sipariş kalemi.
  - `rpcErr` — `adjust_stock_v2` RPC çağrısından dönen hata nesnesi.
- **Dönüş**: `Promise<Response>` — İşlem sonucuna göre farklı HTTP Response nesneleri döndürülür:
  - OPTIONS istekleri için `200 'ok'`.
  - Eksik Supabase konfigürasyonu için `500` hatalı JSON.
  - Yetkisiz erişim için `401` hatalı JSON.
  - Süresi dolmuş sipariş bulunamadığında `200` başarılı JSON.
  - İşlem başarılı olduğunda `200` başarılı JSON (içerik: released_count, message).
  - İç hatalarda `500` hatalı JSON.

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler