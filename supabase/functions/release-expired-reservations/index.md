---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: c345348c4088ef24
entity_hashes:
  func:release-expired-reservations_handler: 2ee83a2fc9a11645
  overview: d6e6683c81c36dd3
generated_at: 2026-08-14T12:38:19Z
---

## Genel Bakış
Bu modül, süresi dolmuş rezervasyonları otomatik olarak serbest bırakan bir Supabase Edge Function'dır. Gelen HTTP istekleri aracılığıyla tetiklenerek veritabanındaki geçerlilik süresi dolan rezervasyon kayıtlarını tespit eder, bunların durumunu günceller ve ilişkili kaynakların yeniden kullanıma açılmasını sağlar.

## Fonksiyon Grupları

### HTTP İstek İşleyici
Tek bir HTTP endpoint üzerinden dışarıya açılan giriş noktasıdır; isteği alır, iş mantığını koordine eder ve sonucu yanıt olarak döner.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase Edge Functions ortamında HTTP tabanlı bir istek işleyicisi olarak yapılandırılmıştır.

[Aksiyom 1]: Eğer geçerli bir HTTP `Request` nesnesi (req parametresi) sağlanmazsa, fonksiyon başlatılamaz ve HTTP yanıtı üretilemez.

[Aksiyom 2]: Eğer `corsHeaders` sabiti (object) tanımlı değilse veya boş/eksik ise, istemcilere döndürülen HTTP yanıtlarında CORS başlıkları eksik kalır ve tarayıcı tarafı istekleri engellenebilir.

[Aksiyom 3]: Eğer Supabase Edge Functions çalışma ortamı (runtime) mevcut değilse, bu fonksiyon çalıştırılamaz — fonksiyon imzası `Request` tipine bağımlıdır.

[Aksiyom 4]: Eğer Supabase veritabanı bağlantısı (edge function ortamında otomatik sağlanan) erişilebilir durumda değilse, rezervasyon kayıtları sorgulanamaz ve süresi dolmuş kayıtlar tespit edilemez.

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
- import: https://esm.sh/@supabase/supabase-js@2.39.3::createClient

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

### [N1_NASIL] AST Pointer: supabase/functions/release-expired-reservations/index.ts::release-expired-reservations_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase proje URL'si
  - `supabaseKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan Supabase servis rol anahtarı
  - `authHeader` — `req.headers.get('Authorization')` ile istekten alınan yetkilendirme başlığı
  - `isAuthorized` — Boolean flag, kullanıcının yetkili olup olmadığını tutar
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan anonim anahtar, JWT doğrulama için kullanılır
  - `createClientAuth` — Dinamik import ile yüklenen alternatif `createClient` fonksiyonu, anonim anahtarla istemci oluşturmak için
  - `authClient` — Anonim anahtar ve Authorization header ile oluşturulan Supabase istemcisi, kullanıcı kimliğini doğrulamak için
  - `user` — `authClient.auth.getUser()` sonucundan çıkarılan kullanıcı nesnesi
  - `roleCheck` — `fetch` ile `/rest/v1/user_profiles` endpoint'ine yapılan rol kontrol isteği sonucu (Response)
  - `arr` — `roleCheck.json()` ile parse edilen rol kontrol yanıt dizisi
  - `role` — `arr[0]?.role` ile elde edilen kullanıcının rolü ('admin' veya 'superadmin' kontrolü yapılır)
  - `supabase` — `createClient(supabaseUrl, supabaseKey)` ile oluşturulan Supabase servis istemcisi
  - `settingsData` — `inventory_settings` tablosundan `reservation_timeout_hours` alanını seçen sorgu sonucu verisi
  - `settings` — `settingsData`'nın `InventorySettings` tipine cast edilmiş hali
  - `hours` — Rezervasyon zaman aşımı süresi saat cinsinden, `settings?.reservation_timeout_hours` veya varsayılan 24
  - `timeoutDate` — Şu andan `hours` kadar önceki tarih nesnesi, süresi dolmuş siparişlerin eşik zamanı
  - `expiredOrders` — `venthub_orders` tablosundan süresi dolmuş 'pending' durumlu siparişlerin listesi
  - `findErr` — Süresi dolmuş siparişleri bulma sorgusunun hata nesnesi
  - `releasedCount` — Sayaç, başarıyla iptal edilen ve stoku iade edilen sipariş sayısı
  - `order` — `expiredOrders` dizisi üzerindeki döngü değişkeni, her süresi dolmuş siparişi temsil eder
  - `updateErr` — Sipariş durumunu 'cancelled'/'failed' olarak güncelleme sorgusunun hata nesnesi
  - `itemsRaw` — `venthub_order_items` tablosundan belirli siparişin ürün listesini seçen sorgu sonucu verisi
  - `items` — `itemsRaw`'ın `OrderItem` tipine cast edilmiş hali
  - `item` — `items` dizisi üzerindeki iç döngü değişkeni, her sipariş kalemini temsil eder
  - `rpcErr` — `adjust_stock_v2` RPC çağrısının hata nesnesi, stok iade işleminin sonucu
  - `orderErr` — Sipariş bazlı try-catch bloğunun yakaladığı hata nesnesi
  - `error` — Ana try-catch bloğunun yakaladığı genel hata nesnesi
- **Dönüş**: `Response` — JSON body ile sonuç döner:
  - CORS OPTIONS istekleri: 200 `{ 'ok' }`
  - Eksik config: 500 `{ error: 'Missing Supabase Config' }`
  - Yetkisiz erişim: 401 `{ error: 'Unauthorized' }`
  - Süresi dolmuş sipariş yoksa: 200 `{ message: 'No expired reservations found.', released: 0 }`
  - Başarılı: 200 `{ success: true, released_count, message }`
  - Genel hata: 500 `{ error: 'internal_error' }`

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler