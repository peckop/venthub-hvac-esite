---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts
skeleton_hash: f52d9153a17ad7ad
entity_hashes:
  func:admin-update-order_handler: 046f5c7fec17e235
  overview: 105a307c9f13c203
generated_at: 2026-05-28T22:42:25Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan tek bir HTTP handler içermektedir. Amacı, admin yetkisine sahip kullanıcıların mevcut bir siparişi güncellemesi talebini alarak doğrulama ve yetkilendirme işlemlerini gerçekleştirmek, ardından sipariş kaydını veritabanında güncelleyip sonucu istemciye bildirmektir.

## Fonksiyon Grupları
### Admin Sipariş Güncelleme Handler
Modülün tek ve ana bileşeni olarak, HTTP isteğinin tam yaşam döngüsünü yönetir: isteği alır, geçerliliğini ve admin yetkisini doğrular, güncelleme işlemini tetikler ve uygun HTTP yanıtını üretir.
- admin-update-order_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir yöneticinin sipariş güncelleme isteğini işleyen bir HTTP handler fonksiyonudur. Aşağıdaki mimari varsayımlar modülün doğru çalışması için gereklidir:

---

**[Aksiyom 1]:** Eğer geçerli bir `Request` nesnesi (`req`) yoksa, handler fonksiyonu isteği işleyemez ve uygun bir hata yanıtı (400 Bad Request) döndürülmesi gerekir.

**[Aksiyom 2]:** Eğer isteği gönderen kullanıcının admin yetkisi doğrulanamıyorsa, handler fonksiyonu isteği reddetmeli ve 401 Unauthorized veya 403 Forbidden yanıtı döndürmelidir.

**[Aksiyom 3]:** Eğer güncellenecek siparişin ID'si istek içerisinde sağlanamıyorsa, handler fonksiyonu işlemi tamamlayamaz ve 400 Bad Request yanıtı döndürülmesi gerekir.

**[Aksiyom 4]:** Eğer belirtilen sipariş ID'sine sahip bir sipariş veritabanında mevcut değilse, handler fonksiyonu güncelleme yapamaz ve 404 NotFound yanıtı döndürülmesi gerekir.

**[Aksiyom 5]:** Eğer veritabanı bağlantısı (Supabase client) sağlanamıyorsa, handler fonksiyonu sipariş verisini okuyamaz veya güncelleyemez ve 500 Internal Server Error yanıtı döndürülmesi gerekir.

**[Aksiyom 6]:** Eğer istek gövdesindeki güncelleme verisi geçersiz veya bozuksa (örn: geçersiz JSON formatı), handler fonksiyonu veriyi işleyemez ve 400 Bad Request yanıtı döndürülmesi gerekir.

---

> **Not:** Bu modülde `request.body` formatı, izin verilen güncelleme alanları ve doğrulama kuralları fonksiyon gövdesinde tanımlı olmakla birlikte, verilen bilgilerde bu detaylar açıkça belirtilmemiştir. Eşik değerleri ve kabul kriterleri hakkında kesin bilgi mevcut değildir.

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
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `origin` — Request'ten gelen origin header'ı, CORS kontrolü için kullanılır
  - `allowed` — Environment variable'dan split edilen izin verilen origin listesi
  - `okOrigin` — Origin'in allowed listesinde olup olmadığını kontrol eden boolean flag
  - `requestId` — Her istek için benzersiz UUID veya timestamp, response header'larında kullanılır
  - `cors` — CORS header'larını içeren object
  - `ct` — Content-Type header'ının lowercased hali, JSON kontrolü için kullanılır
  - `max` — Environment variable'dan alınan max body boyutu byte cinsinden
  - `cl` — Content-Length header'ı, byte cinsinden
  - `supabaseUrl` — Environment variable'dan alınan Supabase URL'i
  - `serviceRoleKey` — Environment variable'dan alınan service role key
  - `anonKey` — Environment variable'dan alınan anon key
  - `authHeader` — Authorization header'ı, kullanıcı doğrulama için kullanılır
  - `authClient` — Anon key ile oluşturulan Supabase client, kullanıcı doğrulaması için
  - `user` — authClient.auth.getUser() ile alınan kullanıcı objesi
  - `authErr` — authClient.auth.getUser() hata sonucu
  - `roleCheck` — Kullanıcı rolünü kontrol etmek için fetch sonucu Response
  - `arr` — roleCheck response'unun JSON parse sonucu array
  - `role` — Kullanıcının rolü, admin veya superadmin olmalı
  - `body` — req.json() ile parse edilen request body
  - `id` — Body'den alınan sipariş ID'si
  - `conversation_id` — Body'den alınan conversation ID'si
  - `status` — Body'den alınan yeni durum
  - `display_code` — Body'den alınan display kodu (ID'nin son 8 hanesi)
  - `newStatus` — status değerinin string representation'ı, varsayılan 'paid'
  - `resp` — patch fonksiyonu sonucu Response nesnesi
  - `ok` — resp'nin ok property'si, başarılı güncelleme kontrolü
  - `text` — resp'nin text body'si, yanıt mesajı
  - `_e` — catch bloğundaki hata nesnesi
- **Dönüş**: `Response`

### [N2_NASIL] AST Pointer: admin-update-order/index.ts::patch
- **params**: `(filter: string)`
- **ic_degiskenler**:
  - `filter` — VentHub orders tablosunda güncelleme yapılacak satırı filtreleyen WHERE clause parçası
- **Dönüş**: `Response` (fetch sonucu) — venthub_orders tablosunda status güncelleme sonucu

### [N3_NASIL] AST Pointer: admin-update-order/index.ts::listRecent
- **params**: `(_limit = 100)`
- **ic_degiskenler**:
  - `_limit` — Çekilecek maksimum sipariş sayısı, varsayılan 100
  - `res` — fetch sonucu Response nesnesi
  - `txt` — Response body'sinin text hali
  - `data` — txt'nin JSON parse sonucu array veya parse hatasında boş array
- **Dönüş**: `Array<{id?: string, conversation_id?: string, created_at?: string}>` — Son eklenen siparişlerin listesi

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler