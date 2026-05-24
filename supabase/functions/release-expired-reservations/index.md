---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: 76ff1858bfa4c1bf
generated_at: 2026-05-24T07:48:44Z
---

## Genel Bakış
Bu modül, Supabase Edge Functions üzerinden çalışan bir HTTP işleyici sağlar ve süresi dolmuş rezervasyonları otomatik olarak serbest bırakmayı amaçlar. İşlev, gelen isteği işleyerek veritabanındaki geçerlilik süresi tamamlanmış rezervasyonları tespit eder ve durumlarını güncelleyerek kaynakların yeniden kullanılabilir hale gelmesini sağlar.

## Fonksiyon Grupları
### Ana İşlev
Modülün tek işlevi, süresi dolan rezervasyonları belirleyip onların durumunu güncelleyerek sistemdeki kaynakları boşaltmaktır.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir HTTP isteği işleyici olarak çalışır ve CORS başlıkları için sabit bir nesne bekler.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa (null/undefined), işleyici bir hata fırlatır veya işleme devam edemez.  
[Aksiyom 2]: Eğer `corsHeaders` sabiti tanımlanmazsa, yanıt에 CORS başlıkları eklenemez ve istemci tarafında CORS engellenebilir.  
[Aksiyom 3]: Eğer `Request` türü ortamda mevcut değilse (örneğin Supabase Edge fonksiyonu dışında), işleyici derleme/hata zamanında başarısız olur.

---

## FONKSIYON DETAYLARI

### release-expired-reservations_handler
**Ne yapar**: Süresi dolmuş rezervasyonları sistemden kaldırarak kaynakları serbest bırakır.  
**Nasıl yapar**: Gelen HTTP isteğini işler, veritabanında veya önbellekteki süresi dolmuş rezervasyonları tanımlar, bu rezervasyonların durumunu günceller ve işlemin sonucunu içeren bir HTTP yanıtı döndürür.  
**Parametreler**:  
- req: Request — İşlenecek gelen HTTP isteği; istek başlıkları, gövdesi ve diğer meta veriler içerir.  
**Dönüş**: Response — İşlemin sonucunu taşıyan HTTP yanıtı; genellikle durum kodu ve işlem hakkında kısa bir mesaj içerir.

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

### [N1_NASIL] AST Pointer: supabase/functions/release-expired-reservations/index.ts::release-expired-reservations_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `supabaseUrl` — Supabase project URL obtained from environment variable SUPABASE_URL.
  - `supabaseKey` — Supabase service role key from environment variable SUPABASE_SERVICE_ROLE_KEY, used for admin privileges.
  - `authHeader` — Value of the Authorization header from the incoming request.
  - `isAuthorized` — Boolean flag indicating whether the request is authorized (either via service role key or valid user with admin/superadmin role).
  - `anonKey` — Supabase anon key from environment variable SUPABASE_ANON_KEY (default empty string) used to create an auth client for verifying user token.
  - `createClientAuth` — Imported createClient function from supabase-js v2.45.4, aliased to avoid conflict with outer createClient.
  - `authClient` — Supabase client instantiated with anon key and Authorization header to verify the user making the request.
  - `user` — User object extracted from the auth client's getUser response, representing the authenticated user.
  - `roleCheck` — Fetch request to Supabase REST endpoint to retrieve the role of the authenticated user from user_profiles table.
  - `arr` — Array result parsed from roleCheck JSON response; defaults to empty array on error.
  - `role` — Role string of the user (e.g., 'admin', 'superadmin') extracted from the first element of arr.
  - `supabase` — Supabase client created with service role key for performing privileged database operations.
  - `settingsData` — Raw data fetched from the inventory_settings table containing reservation_timeout_hours.
  - `settings` — Typed settings object (InventorySettings | null) cast from settingsData.
  - `hours` — Reservation timeout in hours, derived from settings.reservation_timeout_hours or default 24.
  - `timeoutDate` — Date object representing the cutoff time (now minus hours) used to find expired reservations.
  - `expiredOrders` — Array of order records (id, order_number) that are pending, payment pending, and created before timeoutDate.
  - `findErr` — Error object from the query that fetches expired orders.
  - `releasedCount` — Counter tracking how many expired orders have been successfully released and restocked.
  - `order` — Individual order object from the expiredOrders array being processed in the loop.
  - `updateErr` — Error from attempting to update the order status to cancelled and payment_status to failed.
  - `itemsRaw` — Raw data fetched from venthub_order_items for a given order, containing product_id and quantity.
  - `items` — Typed array of OrderItem objects cast from itemsRaw.
  - `item` — Individual order item (product_id, quantity) being processed to restore stock.
  - `rpcErr` — Error from calling the adjust_stock_v2 RPC to adjust inventory for a product.
  - `orderErr` — Error caught when any step in processing a single order fails, logged but not halting the loop.
  - `error` — Unknown error caught in the outer try/catch block, representing a failure in the overall function execution.
- **Dönüş**: Response

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler