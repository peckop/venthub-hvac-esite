---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts
skeleton_hash: 0340d9cc1fa5afae
entity_hashes:
  func:admin-update-order_handler: 046f5c7fec17e235
  overview: cc5b05e5e6c2045f
generated_at: 2026-05-29T11:41:38Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarakploye edilmiş bir HTTP servisidir. Tek bir asenkron handler fonksiyonu içerir. Temel sorumluluğu, admin panelinden gelen sipariş güncelleme isteklerini alıp doğrulamak, yetkilendirmeyi gerçekleştirmek ve ardından veritabanındaki ilgili sipariş kaydını güncelleyerek istemciye uygun bir durum koduyla yanıt dönmektir.

## Fonksiyon Grupları
### Admin Sipariş Güncelleme İşleyicisi
Modülün tek bileşeni olarak HTTP istek-yanıt döngüsünün tamamını yönetir. İsteğin gövdesinden sipariş verilerini ayrıştırır, admin yetkisini doğrular, Supabase veritabanı bağlantısı kurarak sipariş kaydını günceller ve operasyonun sonucuna göre başarı veya hata yanıtı üretir.
- admin-update-order_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir yöneticinin mevcut bir siparişi güncellemesi için HTTP tabanlı bir API sunar ve bu işlem için kimlik doğrulama ile yetkilendirme gerektirir.

**[Aksiyom 1]:** Eğer geçerli bir HTTP Request nesnesi (`req`) sağlanmazsa, handler fonksiyonu düzgün çalışamaz ve hata yanıtı üretilir.

**[Aksiyom 2]:** Eğer istekte bulunan kullanıcının admin yetkisi yoksa, sipariş güncelleme işlemi gerçekleştirilmez ve yetkilendirme hatası döner.

**[Aksiyom 3]:** Eğer güncellenecek sipariş ID'si istek içinde sağlanmazsa veya geçersiz bir sipariş ID'si iletilirse, güncelleme başarısız olur.

**[Aksiyom 4]:** Eğer Supabase veritabanı bağlantısı kesikse veya veritabanı erişilemez durumdaysa, sipariş güncelleme işlemi başarısız olur.

**[Aksiyom 5]:** Eğer güncelleme için geçersiz veya eksik alanlar (örn: sipariş durumu, teslimat bilgileri vb.) sağlanırsa, doğrulama hatası üretilir.

**[Aksiyom 6]:** Eğer güncelleme işlemi veritabanında başarılı bir şekilde gerçekleştirilirse, istemciye success durum kodu ile onay yanıtı döner.

**[Aksiyom 7]:** Eğer güncelleme sırasında beklenmeyen bir sunucu hatası oluşursa, istemciye 500 seviyesinde bir hata yanıtı üretilir.

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

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::admin-update-order_handler
- **params**: (req: Request)
- **ic_degiskenler**: 
  - `corsHeaders` — getCorsHeaders fonksiyonundan dönen CORS başlıkları nesnesi
  - `origin` — HTTP isteğinin origin başlığı, CORS doğrulaması için kullanılır
  - `allowed` — ALLOWED_ORIGINS env değişkeninden split ile elde edilen izin verilen origin listesi
  - `okOrigin` — İsteğin origin'inin izin verilen originler listesinde olup olmadığını kontrol eden boolean
  - `requestId` — Benzersiz istek ID'si, crypto.randomUUID ile üretilir veya Date.now() ile oluşturulur
  - `ct` — Content-Type başlığının küçük harfli hali, JSON doğrulaması için kullanılır
  - `max` — Maksimum gövde boyutu (byte cinsinden), MAX_BODY_KB env değişkeninden hesaplanır
  - `cl` — Content-Length başlığının numeric değeri, payload boyut kontrolü için kullanılır
  - `supabaseUrl` — SUPABASE_URL env değişkeni
  - `serviceRoleKey` — SUPABASE_SERVICE_ROLE_KEY env değişkeni
  - `anonKey` — SUPABASE_ANON_KEY env değişkeni
  - `authHeader` — Authorization başlığının değeri
  - `authClient` — Anon key ile oluşturulan ve auth header eklenen Supabase istemcisi
  - `user` — authClient.auth.getUser() çağrısından dönen kullanıcı nesnesi
  - `authErr` — auth.getUser() çağrısındaki hata nesnesi
  - `roleCheck` — Kullanıcı rolünü kontrol etmek için yapılan fetch isteği
  - `arr` — roleCheck yanıtının JSON parse edilmiş hali (user_profiles tablosu satırı)
  - `role` — Kullanıcının rolü (arr[0]?.role)
  - `body` — İstek gövdesinin JSON parse edilmiş hali
  - `id` — body.id, sipariş ID'si
  - `conversation_id` — body.conversation_id, konuşma ID'si
  - `status` — body.status, yeni durum değeri
  - `display_code` — body.display_code, UI'da görülen son 8 hanelik kod
  - `newStatus` — status parametresinin string hali, varsayılan 'paid'
  - `resp` — PATCH isteğinin Response nesnesi
  - `ok` — resp.ok değerinden elde edilen boolean, işlemin başarılı olup olmadığını gösterir
  - `text` — resp.text() çağrısından dönen yanıt metni
- **Dönüş**: Response (JSON.stringify ile {ok, response} veya hata JSON'u)

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::patch
- **params**: (filter: string)
- **ic_degiskenler**: (yok - sadece fetch çağrısı yapıyor)
- **Dönüş**: Promise<Response> (fetch çağrısının response'u)

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::listRecent
- **params**: (_limit = 100)
- **ic_degiskenler**: 
  - `res` — VenthubOrders tablosundan son siparişleri çeken fetch isteğinin response'u
  - `txt` — res.text() çağrısından dönen ham JSON metni
  - `data` — txt'nin JSON parse edilmiş hali, dizi değilse boş diziye dönüşür
- **Dönüş**: Array<{id?: string, conversation_id?: string, created_at?: string}> (venthub_orders tablosundaki son kayıtlar)

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler