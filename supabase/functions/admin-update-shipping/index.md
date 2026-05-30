---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: a534cbeace1d001e
entity_hashes:
  func:admin-update-shipping_handler: fab3b88ab551f027
  overview: 4717843338e56bb2
generated_at: 2026-05-30T20:28:16Z
---

## Genel Bakış
Bu modül, yetkili yönetici kullanıcıların siparişlere ait kargo bilgilerini güncellemek için kullandığı bir Supabase Edge Function'dır. Gelen HTTP isteklerini kimlik doğrulaması ve yetki kontrolünden geçirerek veritabanındaki kargo kayıtlarını güvenli bir şekilde günceller.

## Fonksiyon Grupları

### İstek Doğrulama ve İşleme
Gelen HTTP isteğini kabul eder, istekteki yöneticinin kimliğini doğrular ve yetkili olup olmadığını kontrol eder. Doğrulama başarılıysa kargo güncelleme işlemini başlatır.
- admin_update_shipping_handler

### Yanıt Üretme
Veritabanı güncelleme işleminin sonucuna göre istemciye uygun HTTP durum kodu ve bilgilendirici mesaj içeren yanıt döner.
- admin_update_shipping_handler

---



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

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::admin-update-shipping_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `requestId` — benzersiz istek kimliği, crypto.randomUUID() veya Date.now() ile oluşturulur
  - `origin` — istekten alınan Origin başlığı
  - `allowed` — ALLOWED_ORIGINS ortam değişkeninden split edilmiş izin verilen kökenler dizisi
  - `okOrigin` — origin'ın allowed listesinde olup olmadığını kontrol eden boolean
  - `cors` — CORS başlıklarını içeren nesne
  - `ct` — Content-Type başlığı, küçük harfe çevrilmiş
  - `max` — MAX_BODY_KB ortam değişkeninden hesaplanan maksimum gövde boyutu (byte)
  - `cl` — Content-Length başlığı
  - `_text` — request gövdesi metin olarak
  - `parsed` — JSON.parse ile ayrıştırılmış gövde nesnesi
  - `pick` — parsed içindeki anahtarlardan ilk geçerli değeri döndüren yardımcı fonksiyon
  - `qs` — URL search parametreleri
  - `cancel` — kargo iptal isteği boolean'ı
  - `order_id` — sipariş ID'si (parsed veya qs'den)
  - `carrier` — kargo şirketi
  - `tracking_number` — kargo takip numarası
  - `tracking_url` — kargo takip URL'si
  - `send_email` — kargo bildirimi e-postası gönderilip gönderilmeyeceğini belirleyen boolean
  - `supabaseUrl` — SUPABASE_URL ortam değişkeni
  - `anonKey` — SUPABASE_ANON_KEY ortam değişkeni
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY ortam değişkeni
  - `authHeader` — Authorization başlığı
  - `authClient` — anonKey ile oluşturulan Supabase istemcisi
  - `user` — authClient.auth.getUser() ile doğrulanmış kullanıcı
  - `authErr` — authClient.auth.getUser() hatası
  - `tenantId` — resolveTenantId ile çözümlenmiş kiracı ID'si
  - `roleCheck` — kullanıcının rolünü kontrol eden fetch isteği yanıtı
  - `arr` — roleCheck.json() ile çözümlenmiş dizi
  - `role` — arr[0].role değerinden alınan rol
  - `isCurrentlyShipped` — siparişin şu anda kargoya verilip verilmediğini belirleyen boolean
  - `wantCancel` — iptal isteği veya mevcut kargodan çıkarak belirlenen iptal boolean'ı
  - `updCancel` — iptal PATCH isteği yanıtı
  - `isFirstShip` — ilk kez kargoya verme işleminin yapılıp yapılmadığını belirleyen boolean
  - `patchBody` — sipariş güncellemesi için PATCH gövdesi
  - `upd` — kargo güncelleme PATCH isteği yanıtı
  - `headerKey` — x-idempotency-key başlığı
  - `derivedKey` — computeIdemKey ile hesaplanan derived key
  - `idemKey` — headerKey veya derivedKey
  - `customer_email` — müşteri e-posta adresi (sipariş ve kullanıcı verilerinden)
  - `customer_name` — müşteri adı (sipariş ve kullanıcı verilerinden)
  - `ordResp` — sipariş bilgilerini çekmek için yapılan fetch isteği yanıtı
  - `arr` — ordResp.json() ile çözümlenmiş dizi
  - `row` — arr[0] dizisi
  - `uid` — row.user_id
  - `usrResp` — Auth Admin API ile kullanıcı bilgisini çekmek için yapılan fetch isteği yanıtı
  - `u` — usrResp.json() ile çözümlenmiş kullanıcı nesnesi
  - `emailResult` — e-posta gönderme sonucunu tutan nesne
  - `resp` — shipping-notification fonksiyonuna yapılan fetch isteği yanıtı
  - `j` — resp.json() ile çözümlenmiş ShippingNotifyResponse
  - `body` — shipping_email_events tablosuna eklenecek JSON gövdesi
- **Dönüş**: Response

### [N2_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::pick
- **params**: (keys: string[])
- **ic_degiskenler**:
  - `k` — döngüdeki mevcut anahtar
  - `v` — parsed nesnesinden alınan değer
- **Dönüş**: string | null

### [N3_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::cancel
- **params**: ()
- **ic_degiskenler**:
  - `vRaw` — parsed['cancel'] veya qs.get('cancel') değerinden alınan ham değer
- **Dönüş**: boolean

### [N4_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::send_email
- **params**: ()
- **ic_degiskenler**:
  - `v` — parsed['send_email'], parsed['sendEmail'], qs.get('send_email') veya qs.get('sendEmail') değerinden alınan değer
- **Dönüş**: boolean

### [N5_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::computeIdemKey
- **params**: (action: 'ship' | 'cancel', orderId: string, carrier?: string|null, tn?: string|null)
- **ic_degiskenler**:
  - `raw` — parametrelerin pipe ile birleştirilmiş hali
  - `bytes` — raw dizgesinin TextEncoder ile Uint8Array'e çevrilmiş hali
  - `hash` — SHA-256 ile hesaplanan ArrayBuffer
- **Dönüş**: string

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler