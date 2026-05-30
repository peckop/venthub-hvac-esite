---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts
skeleton_hash: 2aae01d91a254e30
entity_hashes:
  func:admin-update-order_handler: 046f5c7fec17e235
  overview: 236389b6147671e5
generated_at: 2026-05-30T20:27:23Z
---

## Genel Bakış
Bu modül, yöneticilerin mevcut siparişleri güncellemesi için bir Supabase Edge Function olarak_deploye edilmiş bir HTTP API servisidir. Modül, gelen isteği doğrulamak, yönetici yetkisini kontrol etmek, veritabanı bağlantısı kurarak sipariş kaydını güncellemek ve işlemin sonucuna göre bir yanıt döndürmekten sorumludur.

## Fonksiyon Grupları
### Sipariş Güncelleme İşleyicisi
Modülün tek bileşeni olarak tüm HTTP istek-yanıt döngüsünü yönetir. İsteğin içeriğini ayrıştırır, kimlik doğrulama ve yetkilendirme adımlarını uygular, veritabanı işlemlerini koordine eder.
- admin_update_order_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function ortamında çalışan bir HTTP handler'ıdır. Aşağıdaki mimari varsayımlar fonksiyon imzası ve modül yapısından türetilmiştir:

**[Aksiyom 1]:** Eğer geçerli bir HTTP `Request` nesnesi (req) yoksa, handler fonksiyonu çalıştırılamaz ve istemciye hata yanıtı döner.

**[Aksiyom 2]:** Eğer istek gövdesinde (request body) geçerli bir sipariş JSON verisi yoksa veya JSON ayrıştırma başarısız olursa, fonksiyon istemciye hata yanıtı döner.

**[Aksiyom 3]:** Eğer isteği yapan kullanıcının admin yetkisi yoksa veya yetkilendirme doğrulanamazsa, fonksiyon istemciye yetkilendirme hatası (401/403) yanıtı döner.

**[Aksiyom 4]:** Eğer Supabase veritabanı bağlantısı kurulamazsa veya veritabanı erişilemez durumdaysa, sipariş güncelleme işlemi başarısız olur ve istemciye sunucu hatası yanıtı döner.

**[Aksiyom 5]:** Eğer güncellenmeye çalışılan sipariş kaydı veritabanında mevcut değilse, güncelleme işlemi başarısız olur veya ilgili durum koduyla yanıt döner.

**[Aksiyom 6]:** Fonksiyon, istek-yanıt döngüsünü tamamen asenkron olarak yönetir; tüm HTTP yanıtları `Response` nesnesi olarak döndürülür.

---

*Not: Fonksiyon imzasında (`req: Request`) hiçbir default değer tanımlı değildir; dolayısıyla eşik değerleri, limitler veya varsayılan parametrelerle ilgili bir varsayım üretilememiştir.*

---

## FONKSİYON DETAYLARI

### admin-update-order_handler

**Ne yapar**: Bu fonksiyon, HTTP isteklerini alarak admin panelinden sipariş güncelleme işlemlerini yönetir. Supabase Edge Function yapısı içinde yer alan bu handler, Request nesnesini işler ve Response nesnesi döndürerek istemciye sonuç bildirir.

**Nasıl yapar**: `@ts-nocheck` directive'i ile TypeScript tip kontrolü devre dışı bırakılmıştır. Fonksiyon, bir HTTP Request nesnesini parametre olarak alır ve gerekli iş mantığını uygulayarak Response nesnesi ile sonuç döndürür. Edge Function mimarisi gereği, bu handler Sunucu Tarafı (server-side) çalışarak API uç noktasına gelen istekleri işler.

**Parametreler**:
- `req`: Request — İşlenecek HTTP istek nesnesi. İstemciden gelen HTTP method, header, body ve query parametrelerini içerir. Admin tarafından gönderilen sipariş güncelleme talimatlarını taşır.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarı durumunda güncellenen sipariş bilgilerini, hata durumunda ise hata mesajını ve uygun HTTP durum kodunu döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin-update-order/index.ts::admin-update-order_handler
- **params**: `req: Request`
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` ile elde edilen CORS başlık nesnesi
  - `cors` — ikinci kez tanımlanan ve actual olarak kullanılan CORS başlık nesnesi (Access-Control-Allow-Headers, Allow-Methods içerir)
  - `origin` — İsteğin `origin` başlığından okunan değer, boş string fallback'li
  - `allowed` — `ALLOWED_ORIGINS` env var'ından virgülle ayrılmış izinli origin listesi, trimlenmiş ve boş olmayanlar filtrelenmiş
  - `okOrigin` — Origin'in allowed listesinde olup olmadığını veya listenin boş olup olmadığını kontrol eden boolean
  - `requestId` — `crypto.randomUUID()` veya `Date.now()` ile üretilen benzersiz istek tanımlayıcısı
  - `ct` — `content-type` başlığının küçük harfe çevrilmiş hali
  - `max` — `MAX_BODY_KB` env var'ından okunan, byte cinsinden maksimum gövde boyutu limiti
  - `cl` — `content-length` header'ından okunan istek gövdesi boyutu (byte)
  - `supabaseUrl` — `SUPABASE_URL` env var'ından okunan Supabase URL adresi
  - `serviceRoleKey` — `SUPABASE_SERVICE_ROLE_KEY` env var'ından okunan service role anahtarı
  - `anonKey` — `SUPABASE_ANON_KEY` env var'ından okunan anon anahtar
  - `authHeader` — `Authorization` başlığından okunan JWT token değeri
  - `authClient` — anonKey ile oluşturulan Supabase client, Authorization başlığı user token'ı ile başlatılmış
  - `user` — `authClient.auth.getUser()` sonucundan elde edilen authenticated kullanıcı nesnesi
  - `authErr` — kimlik doğrulama hata nesnesi
  - `bodyClone` — istek gövdesinin klonlanarak JSON parse edilmesi, hata durumunda boş obje
  - `tenantId` — `resolveTenantId(req, bodyClone)` ile çözümlenen kiracı ID'si
  - `roleCheck` — `user_profiles` tablosunda kullanıcının rolünü sorgulayan fetch response'u
  - `arr` — roleCheck response'unun JSON parse edilmiş hali (rol array'i)
  - `role` — `arr[0]?.role` ile elde edilen kullanıcının rolü ('admin' veya 'superadmin' olmalı)
  - `body` — `req.json()` ile parse edilen istek gövdesi
  - `id` — `body.id`, güncellenecek siparişin UUID'si
  - `conversation_id` — `body.conversation_id`, güncellenecek siparişin konuşma ID'si
  - `status` — `body.status`, istenen yeni sipariş durumu
  - `display_code` — `body.display_code`, UI'da görünen sipariş kodunun son 8 hanesi
  - `newStatus` — `status` değerinin string'e çevrilmiş hali, varsayılan 'paid'
  - `resp` — `patch()` çağrılarından dönen Response nesnesi, hangi identifier kullanılıyorsa ona göre atanır
  - `ok` — `resp.ok` değerinden elde edilen boolean, PATCH işleminin başarılı olup olmadığını gösterir
  - `text` — `resp` gövdesinin text olarak okunmuş hali
  - `recent` — `listRecent(200)` ile son 200 siparişin getirildiği array (display_code araması için)
  - `target` — `recent` array'inde `display_code` ile eşleşen sipariş nesnesi, `id` alanının son 8 hanesi ile karşılaştırılır
- **Dönüş**: `Response` — JSON { ok, response } veya hata Response'u

---

### [N2_NASIL] AST Pointer: admin-update-order/index.ts::patch
- **params**: `filter: string`
- **ic_degiskenler**: (yok — doğrudan fetch çağrısı yapılır)
- **Dönüş**: `Promise<Response>` — Supabase REST API PATCH yanıtını döner; `status` alanını `newStatus` değerine günceller, `Prefer: return=representation` ile temsilci veri döner; outer scope'tan `supabaseUrl`, `serviceRoleKey`, `tenantId`, `newStatus` değişkenlerini kapanım yoluyla kullanır

---

### [N3_NASIL] AST Pointer: admin-update-order/index.ts::listRecent
- **params**: `_limit: number` (varsayılan 100)
- **ic_degiskenler**:
  - `res` — `venthub_orders` tablosundan son `_limit` adet siparişi `created_at` azalan sırada çeken fetch response'u; `id,conversation_id,created_at` alanlarını seçer
  - `txt` — `res` gövdesinin ham metin olarak okunmuş hali
  - `data` — IIFE ile `JSON.parse(txt)` yapılmaya çalışılan dizi; parse hatasında boş döner
- **Dönüş**: `Promise<Array>` — `id`, `conversation_id`, `created_at` alanlarını içeren sipariş nesneleri dizisi; outer scope'tan `supabaseUrl`, `serviceRoleKey`, `tenantId` değişkenlerini kapanım yoluyla kullanır

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler