---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\release-expired-reservations\index.ts
skeleton_hash: 76ff1858bfa4c1bf
generated_at: 2026-05-24T10:46:27Z
---

## Genel Bakış
Bu modül, Supabase Edge Functions ortamında çalışan ve süresi dolmuş rezervasyonları otomatik olarak serbest bırakmak için tasarlanmış bir HTTP işleyici modülüdür. Gelen HTTP isteklerini işleyerek veritabanındaki geçerlilik süresi tamamlanmış rezervasyonları tespit eder, durumlarını güncelleyerek sistem kaynaklarının yeniden kullanılabilir hale gelmesini sağlar.

## Fonksiyon Grupları
### Ana HTTP İşleyici
Modülün tüm temel işlevlerini yerine getiren tek gruptur; gelen HTTP isteklerini işler, süresi dolmuş rezervasyonları tespit ederek kaynakları boşaltır ve işlem sonucunu içeren HTTP yanıtı döndürür.
- release-expired-reservations_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase Edge Functions ortamında bir HTTP isteği (`req`) alıp, süresi dolmuş rezervasyonları veritabanında güncelleyerek serbest bırakmak için çalışır. İşlemin başarılı olabilmesi için aşağıdaki koşulların mevcut olması gerekir.

**Aksiyom 1**: Eğer `req` parametresi sağlanmazsa (null/undefined), işlem **400 Bad Request** yanıtı döner ve rezervasyonlar serbest bırakılmaz.  
**Aksiyom 2**: Eğer `req` nesnesi içinde geçerli bir HTTP yöntemi (`GET`, `POST`, vb.) bulunmazsa, işlem **405 Method Not Allowed** yanıtı döner.  
**Aksiyom 3**: Eğer `req` içinde beklenen JSON gövdesi (`req.body`) yoksa veya geçersiz JSON ise, JSON ayrıştırma hatası oluşur ve işlem **400 Bad Request** yanıtı verir.  
**Aksiyom 4**: Eğer `corsHeaders` sabiti tanımlı değilse (undefined), yanıtın CORS başlıkları eklenemez; bu durumda tarayıcı tarafı **CORS** hatası alır ve istek başarısız olur.  
**Aksiyom 5**: Eğer Supabase istemcisi (veritabanı bağlantısı) erişilemez ya da kimlik doğrulama başarısız olursa, süresi dolmuş rezervasyonları sorgulama ve güncelleme adımları yürütülemez; sonuçta **500 Internal Server Error** döner ve hiçbir rezervasyon serbest bırakılmaz.  
**Aksiyom 6**: Eğer veritabanında “süresi dolmuş” rezervasyonları belirlemek için kullanılan tarih‑saat alanı (`expires_at` vb.) eksik ya da hatalı biçimde saklanmışsa, süresi dolmuş kayıtların tespiti yapılamaz; bu durumda **0** rezervasyon güncellenir ve işlem **200 OK** yanıtı döner (ancak hiçbir değişiklik yapılmaz).  

*Domain‑specific kural*: Süresi dolmuş rezervasyonların tespiti, veritabanındaki `expires_at` (veya benzeri) zaman damgasının **şu anki UTC zamanından** önce olması koşuluna dayanır. Bu zaman damgasının formatı ve saat dilimi **bilinmiyor**; ancak doğru karşılaştırma yapılabilmesi için UTC‑standardına uygun bir tarih‑saat değeri gereklidir.

---

## FONKSIYON DETAYLARI

### release-expired-reservations_handler
**Ne yapar**: Gelen HTTP isteğini alır ve süresi dolmuş rezervasyonları serbest bırakma işlemini gerçekleştirir.  
**Nasıl yapar**: İsteği analiz eder, ilgili veritabanı sorgularını çalıştırır ve sonuçları HTTP yanıtı olarak döndürür.  
**Parametreler**:
- req: Request — HTTP isteği nesnesi, içinde gerekli başlıklar ve gövde verileri bulunur.  
**Dönüş**: Response — İşlemin sonucunu içeren HTTP yanıtı.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — CORS başlıklarını içeren sabit nesne, tüm yanıt başlıklarında kullanılır
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'si, veritabanı erişimi için kullanılır
  - `supabaseKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan Supabase hizmet rolü anahtarı, yetkili API erişimi için kullanılır
  - `authHeader` — İstek başlığından alınan `Authorization` başlığı, kimlik doğrulama işlemleri için kullanılır
  - `isAuthorized` — Kullanıcının yetkili olup olmadığını belirten boolean değer, başlangıçta `false` olarak ayarlanır
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anonim Supabase anahtarı, yedek kimlik doğrulama için kullanılır, varsayılan olarak boş string değeri alır
  - `createClientAuth` — `https://esm.sh/@supabase/supabase-js@2.45.4` modülünden içe aktarılan `createClient` fonksiyonu, yedek kimlik doğrulama istemcisi oluşturmak için kullanılır
  - `authClient` — `supabaseUrl` ve `anonKey` ile oluşturulan Supabase istemcisi, kullanıcı kimlik doğrulama işlemleri için kullanılır
  - `user` — `authClient.auth.getUser()` ile alınan doğrulanmış kullanıcı nesnesi
  - `roleCheck` — Kullanıcının rolüni kontrol etmek için yapılan REST API çağrısı sonucu, `supabaseUrl/rest/v1/user_profiles` endpoint'ine yapılan istek sonucudur
  - `arr` — `roleCheck.json()` ile dönen kullanıcı profili verileri dizisi, hata durumunda boş dizi ile ele alınır, `arr[0]` ile ilk profili alınır
  - `role` — Kullanıcının rolü, `arr[0]?.role` ile alınan değerdir
  - `err` — Kimlik doğrulama yedek yolunda oluşan hata nesnesi, konsola `Auth fallback error:` mesajı ile birlikte yazdırılır
  - `supabase` — `createClient(supabaseUrl, supabaseKey)` ile oluşturulan ana Supabase istemcisi, tüm veritabanı ve RPC işlemleri için kullanılır
  - `settingsData` — `inventory_settings` tablosundan alınan ayar verisi, `maybeSingle()` ile tek satır olarak alınır
  - `settings` — `settingsData`'nın `InventorySettings` türüne dönüştürülmüş hali, `null` olabilir
  - `hours` — Rezervasyon timeout saati, `settings?.reservation_timeout_hours` değerinden alınır, eğer bu değer yoksa varsayılan olarak 24 kullanılır
  - `timeoutDate` — Süresi dolmuş siparişleri bulmak için kullanılan tarih nesnesi, mevcut saatten `hours` kadar geriye gidilmiş değere sahiptir
  - `expiredOrders` — Süresi dolmuş "pending" durumundaki siparişler listesi, `venthub_orders` tablosundan sorgulanır
  - `findErr` — `expiredOrders` sorgusu sırasında oluşan hata nesnesi
  - `releasedCount` — İptal edilen ve stokları iade edilen başarılı sipariş sayısı, başlangıçta 0 olarak ayarlanır
  - `order` — Döngüdeki mevcut sipariş nesnesi, `expiredOrders` dizisinden alınır
  - `updateErr` — Siparişi "cancelled" ve "failed" durumuna güncellerken oluşan hata nesnesi
  - `itemsRaw` — Sipariş kalemleri verisi, `venthub_order_items` tablosundan `order.id` ile sorgulanır
  - `items` — `itemsRaw`'ın `OrderItem` türüne dönüştürülmüş hali
  - `item` — Döngüdeki mevcut sipariş kalemi nesnesi, `items` dizisinden alınır
  - `rpcErr` — Stok ayarlama RPC çağrısı (`adjust_stock_v2`) sırasında oluşan hata nesnesi
  - `orderErr` — Bireysel sipariş işleme sırasında oluşan hata nesnesi, iç içe `catch` bloğunda yakalanır
  - `error` — Genel hata nesnesi, en dıştaki `catch` bloğunda yakalanır
- **Dönüş**: `Response` türünde nesne döner. Durum kodları 200 (başarılı), 401 (yetkisiz erişim) ve 500 (sunucu hatası) aralığında olabilir. Yanıt içeriği ya plain text 'ok' ya da JSON formatında mesaj ve veri içerir.

---

## NODE ID STANDARD

  file: supabase\functions\release-expired-reservations\index.ts
  function: supabase\functions\release-expired-reservations\index.ts::release-expired-reservations_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: release-expired-reservations_handler