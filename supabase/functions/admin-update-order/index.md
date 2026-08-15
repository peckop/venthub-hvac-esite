---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-update-order\index.ts
skeleton_hash: 855899dc96f26e1d
entity_hashes:
  func:admin-update-order_handler: 401e11b0dc3cc59d
  overview: 0343caf9b492a7ea
generated_at: 2026-08-14T22:03:06Z
---

## Genel Bakış
Bu modül, yöneticilerin mevcut siparişleri güncellemek için kullanabilecekleri bir Supabase Edge Function olarak deployed bir HTTP API servisidir. Tek bir handler fonksiyonu, gelen HTTP isteklerini alarak yönetici yetkilendirmesi doğrultusunda veritabanı üzerindeki sipariş kayıtlarını günceller ve sonucu istemciye bildirir.

## Fonksiyon Grupları
### Sipariş Güncelleme İşleyicisi
Modülün tek bileşeni olarak tüm iş mantığını ve istek-yanıt döngüsünü yönetir. Gelen isteği doğrular, yönetici kimliğini ve yetkisini doğrular, Supabase veritabanı bağlantısı kurarak ilgili sipariş kaydını günceller ve işlem sonucuna uygun HTTP yanıtı döner.
- admin_update_order_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından türetilen minimum varsayımlar tanımlanabilir.

[Aksiyom 1]: Eğer `req` parametresi `Request` tipinde bir nesne olarak sağlanmazsa, fonksiyon çağırmada tip hatası oluşur.

[Aksiyom 2]: Eğer fonksiyon bir `Response` nesnesi döndürmezse, HTTP istemcisi geçersiz yanıt alır veya sunucu hatası oluşur.

---

**Not:** Fonksiyon gövdesi (implementasyon detayları) paylaşılmadığından, modülün iç işleyişine (veritabanı bağlantısı, yetkilendirme mantığı, API anahtarı kullanımı vb.) ilişkin aksiyomlar türetilmemiştir. Mevcut aksiyomlar yalnızca fonksiyon imzasındaki parametre ve dönüş tiplerine dayanmaktadır.

---

## FONKSİYON DETAYLARI

### admin-update-order_handler
**Ne yapar**: Bu fonksiyon, bir HTTP POST isteği alarak, bir siparişin (order) güncellenmesi işlemini tetikleyen bir Supabase Edge Function'ın ana giriş noktasıdır (handler). Genellikle bir yönetici (admin) yetkisiyle çalışması beklenen bu fonksiyon, istek gövdesinden gelen verileri işleyerek ilgili sipariş kaydını veritabanında günceller.

**Nasıl yapar**: Fonksiyon, `@serve(Deno.serve)` dekoratörü ile işaretlenmiştir. Bu dekoratör, fonksiyonu bir Deno HTTP sunucusu işleyicisi (request handler) olarak kaydeder; bu sayede gelen bir HTTP isteği (`Request` nesnesi) bu fonksiyona yönlendirilir. Fonksiyon, asenkron (`async`) olarak çalışır, isteği işler ve bir `Response` nesnesi döndürerek HTTP yanıtını oluşturur.

**Parametreler**:
- `req`: `Request` — Gelen HTTP isteğini temsil eder. Standart web API Request nesnesidir. Genellikle gövdesinde (`req.json()` kullanarak) güncellenecek siparişin ID'si ve yeni değerleri gibi JSON verileri barındırır.

**Dönüş**: `Response` — İşlem sonucunu içeren bir HTTP yanıt nesnesi. Başarılı bir güncelleme sonrası genellikle HTTP 200 OK durum kodu ve güncellenen siparişin verilerini veya bir başarı mesajını JSON formatında gövdesinde barındırır. Bir hata durumunda ise uygun HTTP hata kodları (örn. 400, 403, 500) ve hata açıklamasını içeren bir yanıt döner.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant_config.ts::resolveTenantId
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::admin-update-order_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) ile üretilen CORS başlık nesnesi
  - `cors` — corsHeaders'ın kısaltma referansı, tüm yanıt başlıklarında kullanılır
  - `origin` — req.headers'tan okunan origin değeri; boş string fallback'li
  - `allowed` — Deno.env.get('ALLOWED_ORIGINS') ile alınan, virgülle ayrılmış izinli origin listesi (trim + filter uygulanmış)
  - `okOrigin` — origin'in allowed listesinde olup olmadığını gösteren boolean; allowed boşsa true kabul edilir
  - `requestId` — benzersiz istek takip ID'si; crypto.randomUUID() veya Date.now() fallback'i
  - `ct` — req.headers'tan gelen content-type değerinin küçük harfe çevrilmiş hali
  - `max` — Deno.env.get('MAX_BODY_KB') ile alınan maksimum gövde boyutu, byte'a çevrilmiş (varsayılan 100KB)
  - `cl` — req.headers'tan content-length değeri; parse edilemezse 0
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile alınan Supabase proje URL'i
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile alınan service role anahtarı
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY') ile alınan anon anahtar
  - `authHeader` — req.headers.get('Authorization') ile alınan yetkilendirme başlığı
  - `authClient` — anonKey ile createClient ile oluşturulan Supabase istemcisi; authHeader global header olarak eklenmiş
  - `user` — authClient.auth.getUser() ile elde edilen authenticated kullanıcı nesnesi (data.user destructured)
  - `authErr` — authClient.auth.getUser() sonucundaki hata nesnesi (data.error destructured)
  - `bodyClone` — req.clone().json() ile elde edilen request body klonu; parse hatası olursa boş obje
  - `tenantId` — resolveTenantId(req, bodyClone) çağrısıyla hesaplanan kiracı ID'si
  - `roleCheck` — user_profiles tablosuna fetch ile rol kontrolü yapılan yanıt nesnesi; user.id ve tenantId ile filtrelenmiş
  - `arr` — roleCheck.json() sonucu; roleCheck.ok ise JSON array, değilse boş dizi
  - `role` — arr[0]?.role ile alınan kullanıcının rolü ('admin' veya 'superadmin' olmalı)
  - `body` — req.json() ile parse edilen istek gövdesi; parse hatası olursa boş obje
  - `id` — body.id; sipariş güncellemesi için birincil filtre (UUID)
  - `conversation_id` — body.conversation_id; sipariş güncellemesi için alternatif filtre
  - `status` — body.status; güncellenecek yeni sipariş durumu
  - `display_code` — body.display_code; UI'da görünen sipariş kodunun son 8 hanesi
  - `newStatus` — status değerinin string'e çevrilmiş hali; boşsa 'paid' fallback'i
  - `resp` — patch() çağrılarından dönen Response nesnesi; hangi filtre kullanılırsa kullanılsın sonucu tutar
  - `recent` — display_code kullanıldığında listRecent(200) ile getirilen son 200 sipariş dizisi
  - `target` — display_code ile eşleşen (o.id toString低位 eşleşmesi ile) sipariş nesnesi
  - `ok` — resp ve resp.ok durumu; yanıtın başarılı olup olmadığını gösterir
  - `text` — resp.text() ile alınan yanıt gövdesi string'i
- **Dönüş**: Response (JSON payload ile `ok` ve `response` alanları; HTTP status kodları: 200, 400, 401, 403, 404, 405, 413, 415, 500)

---

### [N2_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::patch
- **params**: `(filter: string)` — venthub_orders tablosuna uygulanacak filtre sorgu stringi (ör: `id=eq.xxx` veya `conversation_id=eq.xxx`)
- **ic_degiskenler**: yok (closure ile üst kapsam değişkenlerine erişir: `supabaseUrl`, `tenantId`, `serviceRoleKey`, `newStatus`)
- **Dönüş**: Response (PATCH isteği sonucu; `Prefer: return=representation` ile temsilci veri döner)

---

### [N3_NASIL] AST Pointer: supabase/functions/admin-update-order/index.ts::listRecent
- **params**: `(_limit = 100)` — çekilecek maksimum sipariş sayısı; varsayılan 100
- **ic_degiskenler**:
  - `res` — Supabase REST API'ye yapılan GET isteğinin Response nesnesi; venthub_orders tablosundan son kayıtları çeker
  - `txt` — res.text() ile alınan ham JSON string yanıtı
  - `data` — JSON.parse(txt) ile çözümlenen veri; parse hatasında boş dizi `[]` döner
- **Dönüş**: Array — her biri `{ id, conversation_id, created_at }` alanlarına sahip sipariş nesnelerinden oluşan dizi; veri dizi değilse boş dizi

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler