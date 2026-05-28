---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: 76ff1858bfa4c1bf
entity_hashes:
  func:release-expired-reservations_handler: 2ee83a2fc9a11645
  overview: d1d2ca21ba221e38
generated_at: 2026-05-28T22:48:13Z
---

## Genel Bakış
Bu modül, süresi dolmuş rezervasyonları otomatik olarak serbest bırakmak için bir Supabase Edge Function olarak çalışır. Gelen HTTP isteklerini işleyerek veritabanındaki süresi dolmuş rezervasyon kayıtlarını tespit eder, bunların durumunu günceller ve kaynakların yeniden kullanılabilir hale gelmesini sağlar.

## Fonksiyon Grupları
### Ana HTTP İşleyici
Modülün tüm temel işlevlerini yerine getiren tek bir HTTP istek işleyicisi grubudur; isteği alır, iş mantığını yürütür ve sonucu HTTP yanıtı olarak döner.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase Edge Functions ortamında süresi dolmuş rezervasyonları serbest bırakan bir HTTP istek işleyicisidir.

[Aksiyom 1]: Eğer `req: Request` parametresi geçerli bir HTTP isteği nesnesi değilse, fonksiyon çalıştırılamaz.

[Aksiyom 2]: Eğer `corsHeaders` sabit objesi tanımlı değilse, HTTP yanıtlarında Cross-Origin Resource Sharing başlıkları eksik olur ve istemci tarafı tarayıcı engeli yaşar.

[Aksiyom 3]: Eğer veritabanı bağlantısı (Supabase istemcisi) kullanılamıyorsa, süresi dolmuş rezervasyonlar sorgulanamaz ve serbest bırakma işlemi gerçekleşmez.

[Aksiyom 4]: Eğer "süresi dolmuş rezervasyon" tanımı için veritabanında geçerlilik süresi alanı (örn: `expires_at`, `reservation_end_time`) yoksa veya doğru indekslenmemişse, süresi dolmuş rezervasyonların tespiti başarısız olur veya performans düşüklüğü oluşur.

[Aksiyom 5]: Eğer rezervasyon durumu alanı güncellemeye kapalı (readonly) ise veya durum alanı farklı bir değer bekliyorsa (örn: sadece 'pending' durumdaki rezervasyonlar serbest bırakılacaksa), serbest bırakma işlemi istenen sonucu vermez.

[Aksiyom 6]: Eğer HTTP isteği POST/GET yöntemiyle gelmiyorsa veya beklenmeyen bir yöntem kullanılıyorsa, fonksiyon uygun HTTP durum koduyla yanıt dönmelidir; aksi halde istemci uygun hata bilgisini alamaz.

---

## FONKSİYON DETAYLARI

### release-expired-reservations_handler

**Ne yapar**: Süresi dolmuş rezervasyonları serbest bırakan HTTP istek işleyicisidir. Bu fonksiyon, belirli bir zaman dilimi içinde kullanılmamış veya son kullanma tarihi geçmiş rezervasyonları tespit edip iptal ederek ilgili kaynakları tekrar müsait hale getirir.

**Nasıl yapar**: Fonksiyon, bir Supabase Edge Function olarak HTTP isteklerini karşılar. Gelen isteği işler ve süresi dolmuş rezervasyonları veritabanında bulup serbest bırakma işlemini gerçekleştirir. İşlem sonucunda HTTP yanıt döndürür.

**Parametreler**:
- `req`: Request — Gelen HTTP istek nesnesi. İstek ile ilgili bilgileri (metot, gövde, başlıklar vb.) içerir ve fonksiyonun çalıştırılması için gerekli parametreleri taşır.

**Dönüş**: Response — İşlem sonucuna göre HTTP yanıt nesnesi döndürür. Başarı veya hata durumunu belirten durum kodu ve opsiyonel mesaj içerebilir.

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

## SABİTLER
- **corsHeaders** (object) — `{
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/release-expired-reservations/index.ts`::release-expired-reservations_handler
- **params**: `(req: Request)` — gelen HTTP isteği, CORS handling, yetkilendirme header'ı ve method kontrolü için kullanılır
- **ic_degiskenler**:
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase proje URL'i, tüm API çağrılarında base URL olarak kullanılır
  - `supabaseKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan service role anahtarı, yetkilendirme ve Supabase client oluşturma için kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile istekten alınan Authorization header'ı, Bearer token doğrulaması için kullanılır
  - `isAuthorized` — boolean flag, kullanıcının yetkili olup olmadığını tutar, başlangıçta `false`'dur
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan anon key, fallback auth client oluşturma için kullanılır
  - `createClientAuth` — dinamik `import()` ile `@supabase/supabase-js`'den alınan `createClient` fonksiyonu, auth client oluşturmada kullanılır
  - `authClient` — anon key ve Authorization header ile oluşturulan Supabase client, `authClient.auth.getUser()` ile kullanıcı doğrulaması yapılır
  - `user` — `authClient.auth.getUser()` sonucundaki `data.user` objesi, `user.id` ile user_profiles tablosunda rol sorgulanır
  - `roleCheck` — `fetch()` ile `user_profiles` tablosuna yapılan rol sorgulamasının Response objesi, `roleCheck.ok` ile başarı kontrolü yapılır
  - `arr` — `roleCheck.json()` parse sonucu (array), `arr[0]?.role` ile ilk elemanın rolü alınır
  - `role` — `arr[0]?.role` ifadesinden çıkarılan rol stringi, `'admin'` veya `'superadmin'` kontrolü yapılır
  - `supabase` — `createClient(supabaseUrl, supabaseKey)` ile oluşturulan service-role Supabase client'ı, tüm veritabanı işlemleri bu üzerinden yürütülür
  - `settingsData` — `supabase.from('inventory_settings').select('reservation_timeout_hours').maybeSingle()` sonucu, ayar satırını tutar
  - `settings` — `settingsData`'nın `InventorySettings | null` type'ına cast hali, `settings?.reservation_timeout_hours` erişimi için kullanılır
  - `hours` — `settings?.reservation_timeout_hours || 24` hesaplaması ile belirlenen timeout süresi (saat cinsinden), zaman eşiği hesabında kullanılır
  - `timeoutDate` — `new Date()` üzerine `setHours(getHours() - hours)` yapılarak hesaplanan Date objesi, bu tarihten önceki siparişler "süresi dolmuş" kabul edilir
  - `expiredOrders` — `supabase.from('venthub_orders').select('id, order_number').eq('status','pending').eq('payment_status','pending').lt('created_at', timeoutDate.toISOString())._limit(100)` sorgusunun result data'sı, süresi dolmuş siparişlerin listesi
  - `findErr` — expiredOrders sorgusunun `error` değeri, hata varsa `throw` ile dış fırlatılır
  - `releasedCount` — `0`'dan başlayarak her başarılı iptalde artan sayaç, sonuç mesajında kullanılır
  - `order` — `expiredOrders` dizisi üzerindeki `for...of` döngüsünün her iterasyonundaki sipariş objesi, `order.id` ve `order.order_number` alanlarına erişilir
  - `updateErr` — `supabase.from('venthub_orders').update(...).eq('id', order.id)` çağrısının error değeri, sipariş iptal işleminin başarısızlığını yakalar
  - `itemsRaw` — `supabase.from('venthub_order_items').select('product_id, quantity').eq('order_id', order.id)` sorgusunun result data'sı, siparişin kalemlerini tutar
  - `items` — `itemsRaw`'ın `OrderItem[]` type'ına cast hali, `items` ve `items.length > 0` kontrolü ile üzerinde döngü yapılır
  - `item` — `items` dizisi üzerindeki `for...of` döngüsünün her iterasyonundaki kalem objesi, `item.product_id` ve `item.quantity` alanları kullanılır
  - `rpcErr` — `supabase.rpc('adjust_stock_v2', { p_product_id, p_delta })` çağrısının error değeri, stok iade işleminin başarısızlığını yakalar
  - `orderErr` — inner try-catch'te yakalanan hata, tekil sipariş iptal sürecindeki kritik hataları loglar
  - `error` — outer try-catch'te yakalanan genel hata, `'[FATAL] Edge Function Error'` olarak loglanır
- **Dönüş**: `Response` — üç farklı durumda döner:
  1. OPTIONS isteği → `200 ok` + corsHeaders
  2. Yetkisiz istek → `401 { error: 'Unauthorized' }`
  3. Eksik config → `500 { error: 'Missing Supabase Config' }`
  4. Süresi dolmuş sipariş yoksa → `200 { message, released: 0 }`
  5. Başarılı sonuç → `200 { success, released_count, message }`
  6. Fatal hata → `500 { error: 'internal_error' }`

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler