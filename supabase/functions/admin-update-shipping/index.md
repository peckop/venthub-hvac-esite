---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: 7a7e3250996d2d50
entity_hashes:
  func:admin-update-shipping_handler: fab3b88ab551f027
  overview: 85e2231565ecbbaa
generated_at: 2026-05-28T22:42:59Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Fonksiyonu olarak, yetkili admin kullanıcılarının sistemdeki kargo bilgilerini güncellemek için kullandığı tek bir HTTP işleyiciyi barındırır. Modülün temel sorumluluğu, gelen istekleri kimlik doğrulamasından geçirerek, doğrulanmış kargo güncelleme verilerini veritabanına yazmak ve işlemin sonucuna uygun bir HTTP yanıtı döndürmektir.

## Fonksiyon Grupları
### Kimlik Doğrulama ve İstek İşleme
Bu grup, modülün kapısını oluşturur. Gelen HTTP isteğinin güvenli ve yetkili olup olmadığını kontrol eder, ardından istek gövdesinden güncellenecek kargo bilgilerini ayrıştırır.
- admin-update-shipping_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Fonksiyon gövdesi (implementation body) paylaşılmadığından, modülün çalışma zamanı davranışına ilişkin mimari varsayımlar üretilememektedir. Mevcut bilgiler yalnızca fonksiyon imzası (`admin-update-shipping_handler(req)`) ve eski dokümanın eksik açıklamasından ibarettir. Fonksiyon gövdesi eklendiğinde revize edilmelidir.

---

## FONKSİYON DETAYLARI

### admin-update-shipping_handler
**Ne yapar**: Bu fonksiyon, bir HTTP isteği alarak bir yanıt döndüren bir Supabase Edge Function istek işleyicisidir. Fonksiyonun adı, yöneticilerin kargo veya gönderi bilgilerini güncellemek üzere tasarlandığını belirtir.
**Nasıl yapar**: Fonksiyon, gelen HTTP istek nesnesini (req) alır, istek içeriğine göre kargo güncelleme işlemlerini başlatır ve sonuç olarak bir HTTP yanıt nesnesi (Response) oluşturur. İşlem mantığı, istek verilerine dayanarak arka uçta veri tabanı güncellemeleri yapmayı ve durum kodlarını ayarlamayı içerir.
**Parametreler**:
- req: Request — İşlenecek olan HTTP isteği nesnesi. İstek gövdesinde veya parametrelerinde kargo güncellemelerine ilişkin veriler taşır.
**Dönüş**: Response — İşlemin sonucunu belirten bir HTTP yanıtı. Başarılı bir güncelleme için uygun bir durum kodu (örn. 200 OK) ve gerekirse bir mesaj içerir; hata durumunda ise hata kodu ve açıklama döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler
- **params**: `(req)` — gelen HTTP isteği (Deno Request nesnesi)
- **ic_degiskenler**:
  - `requestId` — benzersiz istek tanımlayıcısı, crypto.randomUUID() veya Date.now() ile oluşturulur
  - `origin` — isteğin Origin header değeri
  - `allowed` — izin verilen originlerin listesi (ALLOWED_ORIGINS env değişkeninden virgülle ayrılmış)
  - `okOrigin` — gelen origin'in izin listesinde olup olmadığı (boolean)
  - `cors` — CORS header'larını içeren dict (Access-Control-Allow-Origin, Allow-Headers, Allow-Methods, Max-Age)
  - `ct` — Content-Type header değeri küçük harfe çevrilmiş
  - `max` — MAX_BODY_KB env değişkeninden okunan maksimum gövde boyutu (byte cinsinden)
  - `cl` — Content-Length header değerinin integer karşılığı
  - `_text` — req._text() ile okunan ham gövde metni
  - `parsed` — _text'in JSON.parse ile ayrıştırılmış hali (Record<string, unknown>)
  - `qs` — req.url'den çıkarılmış URLSearchParams (query string parametreleri)
  - `cancel` — parsed body veya query string'den okunan cancel flag'i (boolean), siparişin kargo iptali için kullanılır
  - `order_id` — parsed body'den veya query string'den okunan sipariş ID'si (order_id veya orderId anahtarlarından)
  - `carrier` — kargo şirketi adı (parsed body veya query string'den)
  - `tracking_number` — kargo takip numarası (parsed body veya query string'den)
  - `tracking_url` — kargo takip URL'i (parsed body veya query string'den, opsiyonel)
  - `send_email` — bildirim e-postası gönderilsin mi flag'i (boolean, varsayılan true)
  - `supabaseUrl` — SUPABASE_URL env değişkeni
  - `anonKey` — SUPABASE_ANON_KEY env değişkeni
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY env değişkeni, servis düzeyindeki tüm Supabase istekleri için kullanılır
  - `authHeader` — Authorization header değeri
  - `authClient` — anonKey + Authorization header ile oluşturulan Supabase client (kullanıcı doğrulama için)
  - `user` — authClient.auth.getUser() sonucundan dönen kullanıcı nesnesi (id alanı)
  - `authErr` — auth.getUser() hata nesnesi
  - `roleCheck` — user_profiles tablosunda rol kontrolü yapan fetch sonucu (Response)
  - `arr` — roleCheck yanıtının JSON dizisi (veya parse hatasında boş dizi)
  - `role` — kullanıcının rolü (arr[0]?.role, 'admin' veya 'superadmin' olmalı)
  - `isCurrentlyShipped` — siparişin şu an kargoya verilmiş olup olmadığı (boolean, shipped_at null değilse veya status 'shipped' ise true)
  - `wantCancel` — iptal isteği: cancel flag veya zaten kargoda ve carrier/tracking eksikse true
  - `updCancel` — iptal işlemi için PATCH isteği sonucu (venthub_orders tablosunda carrier, tracking_number, tracking_url, shipped_at alanlarını null'a çeker, status'ü 'confirmed'a set eder)
  - `txt` — updCancel._text() ile okunan hata gövde metni
  - `isFirstShip` — bu ilk kargo kaydı mı (boolean, shipped_at ilk kez set edilecekse true)
  - `patchBody` — venthub_orders tablosuna PATCH edilecek veri sözlüğü (carrier, tracking_number, tracking_url; isFirstShip ise shipped_at ve status eklenir)
  - `upd` — kargo güncelleme PATCH isteği sonucu
  - `headerKey` — x-idempotency-key header değeri (opsiyonel)
  - `derivedKey` — computeIdemKey ile türetilen idempotency anahtarı (SHA-256 hash, hex string)
  - `idemKey` — headerKey veya derivedKey, idempotency kaydı için kullanılır
  - `customer_email` — sipariş sahibinin e-posta adresi (bildirim için, Auth Admin API'den alınır)
  - `customer_name` — sipariş sahibinin adı (bildirim için, user_metadata.full_name veya name)
  - `ordResp` — venthub_orders tablosundan user_id ve order_number çeken fetch sonucu
  - `row` — ordResp yanıtının ilk satırı (user_id ve order_number alanları)
  - `uid` — sipariş sahibinin Supabase auth user ID'si (row?.user_id)
  - `usrResp` — Auth Admin API (/auth/v1/admin/users/{uid}) ile kullanıcı bilgisi çeken fetch sonucu
  - `u` — usrResp JSON yanıtı (email ve user_metadata alanlarını içerir)
  - `metaName` — user_metadata'dan full_name veya name alanı
  - `emailResult` — e-posta gönderim sonucu sözlüğü `{ sent: boolean, disabled: boolean }`
  - `resp` — shipping-notification edge function'ına yapılan POST isteği sonucu
  - `j` — resp JSON yanıtı (ShippingNotifyResponse: disabled, subject, result.id alanları)
  - `_e` — catch bloğu yakaladığı hata nesnesi (Error veya bilinmeyen)
  - `msg` — _e'nin message özelliği veya String(_e)
- **Dönüş**: `Response` — JSON gövdeli HTTP Response; başarı: `{ ok: true, email: emailResult }` (200), hata: `{ error: string, message?: string, missing?: string[] }` (400/401/403/405/413/415/500)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::pick
- **params**: `(keys: string[])` — parsed body içinden aranacak anahtarların dizisi
- **ic_degiskenler**:
  - `k` — döngüdeki mevcut anahtar
  - `v` — parsed[k] ile elde edilen değer (unknown)
- **Dönüş**: `string | null` — ilk geçerli değerin trimlenmiş string karşılığı veya null

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::cancel (IIFE)
- **params**: yok (IIFE, parametre almaz; outer scope'tan parsed ve qs'yi kapanır)
- **ic_degiskenler**:
  - `vRaw` — parsed['cancel'] ?? qs.get('cancel') değerinin union karşılığı (boolean, string veya null/undefined)
- **Dönüş**: `boolean` — cancel isteği varsa true, aksi halde false

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::send_email (IIFE)
- **params**: yok (IIFE, parametre almaz; outer scope'tan parsed ve qs'yi kapanır)
- **ic_degiskenler**:
  - `v` — parsed['send_email'] ?? parsed['sendEmail'] ?? qs.get('send_email') ?? qs.get('sendEmail') union karşılığı
- **Dönüş**: `boolean` — e-posta gönderilsin mi (varsayılan true)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts::computeIdemKey
- **params**: `(action: 'ship' | 'cancel', orderId: string, carrier?: string | null, tn?: string | null)` — aksiyon türü, sipariş ID'si, kargo şirketi (opsiyonel), takip numarası (opsiyonel)
- **ic_degiskenler**:
  - `raw` — parametrelerin pipe-separated (`|`) birleştirilmiş ham stringi
  - `bytes` — raw string'in TextEncoder ile UTF-8 byte dizisine çevrilmiş hali
  - `hash` — crypto.subtle.digest('SHA-256', bytes) ile hashlenmiş ArrayBuffer
- **Dönüş**: `string` — hex formatında 64 karakterlik SHA-256 hash (idempotency anahtarı)

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler