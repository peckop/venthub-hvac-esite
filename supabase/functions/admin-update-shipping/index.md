---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: ad1854674ef465fa
entity_hashes:
  func:admin-update-shipping_handler: fab3b88ab551f027
  overview: 4fd12c8678544e09
generated_at: 2026-05-29T11:42:15Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak tasarlanmış, yetkili yönetici kullanıcıların sistemdeki kargo bilgilerini güncellemek için kullandığı merkezi bir HTTP API sunucusudur. Modülün temel amacı, gelen istekleri güvenli bir şekilde işleyerek, veritabanında kargo durumunu veya ilgili detayları güncellemektir.

## Fonksiyon Grupları
### İstek Giriş ve Güvenlik Katmanı
Bu grup, modülün dışarıya açılan kapısıdır. Gelen HTTP isteğini kabul eder, yöneticinin kimliğini doğrular ve yetki kontrolünden geçirerek isteğin güvenli bir şekilde işlenmesini sağlar.
- admin-update-shipping_handler

### İş Mantığı ve Veri İşleme
Bu grup, modülün çekirdek sorumluluğunu taşır. Doğrulanmış istekten gelen yeni kargo bilgilerini alır, veritabanı üzerindeki ilgili kaydı günceller ve işlemin başarı durumunu takip eder.
- admin-update-shipping_handler

### Yanıt Üretme
Bu grup, işlemin sonucunu dışarıya bildirir. Veritabanı güncelleme işleminin başarılı veya başarısız olmasına göre uygun HTTP durum kodu ve mesajı içeren bir yanıt nesnesi oluşturarak istemciye geri döner.
- admin-update-shipping_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir Supabase Edge Fonksiyonu olarak kimlik doğrulama ve veritabanı erişimi üzerine inşa edilmiştir.

**[Aksiyom 1 – Kimlik Doğrulama Hizmeti Erişilebilirliği]:** Eğer Supabase kimlik doğrulama servisi (auth) erişilebilir değilse, isteklerin admin kullanıcısı olup doğrulanamaması nedeniyle tüm kargo güncelleme istekleri reddedilir.

**[Aksiyom 2 – Veritabanı Bağlantısı]:** Eğer Supabase veritabanı bağlantısı kesik veya erişilemezse, kargo bilgileri güncellenemez ve istek başarısızlık yanıtıyla sonuçlanır.

**[Aksiyom 3 – İstek Gövdesi Varlığı]:** Eğer gelen HTTP isteğinin gövdesi (body) yoksa veya geçerli JSON formatında değilse, güncellenecek kargo verileri ayrıştırılamaz ve işleyici hatalı istek (bad request) yanıtı döndürür.

**[Aksiyom 4 – Admin Rolü Gereksinimi]:** Eğer kimlik doğrulanan kullanıcının admin rolü yoksa, kargo güncelleme işlemi yetki hatası (forbidden) ile engellenir.

**[Aksiyom 5 – Supabase Edge Fonksiyon Ortamı]:** Eğer modül, Supabase Edge Fonksiyon runtime ortamında (Deno) çalışmıyorsa, Edge Fonksiyona özgü API'ler (örn: `Deno.serve`, `supabaseClient`) kullanılamaz ve işleyici başlatılamaz.

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
- **params**: `req` — Gelen HTTP isteği (Request objesi)
- **ic_degiskenler**:
  - `requestId` — Benzersiz istek tanımlayıcısı, crypto.randomUUID() veya timestamp'ten üretildi
  - `origin` — İsteğin origin header değeri, CORS doğrulamasında kullanılır
  - `allowed` — ALLOWED_ORIGINS ortam değişkeninden split edilmiş izinli originler dizisi
  - `okOrigin` — İsteğin origin'inin izinli listede olup olmadığı boolean sonucu
  - `cors` — HTTP yanıtlarına eklenecek CORS başlık nesnesi
  - `ct` — Content-Type header'ının lowercase hali, JSON doğrulamasında kullanılır
  - `max` — MAX_BODY_KB env'den okunan maksimum gövde boyutu (byte cinsinden)
  - `cl` — İstek Content-Length header değeri (byte cinsinden)
  - `_text` — Request body'nin ham metin olarak okunması
  - `parsed` — `_text`'in JSON.parse ile nesneye dönüştürülmüş hali; pick fonksiyonuyla alan okunur
  - `qs` — `new URL(req.url).searchParams` — URL query parametreleri, body fallback olarak kullanılır
  - `cancel` — Kargo iptali istenip istenmediğini belirleyen boolean; parsed body veya qs'den okunur
  - `order_id` — Sipariş ID'si; pick() ile body'den veya query string'den alınır
  - `carrier` — Kargo taşıyıcı adı; pick() ile body'den veya query string'den alınır
  - `tracking_number` — Kargo takip numarası; pick() ile body'den veya query string'den alınır
  - `tracking_url` — Kargo takip URL'i; pick() ile body'den veya query string'den alınır (opsiyonel)
  - `send_email` — Kargo bildirim emaili gönderilip gönderilmeyeceği boolean; parsed body veya qs'den fallback ile belirlenir, default true
  - `supabaseUrl` — SUPABASE_URL ortam değişkeni, API çağrıları için taban URL
  - `anonKey` — SUPABASE_ANON_KEY ortam değişkeni, kimlik doğrulama client'ı için kullanılır
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY ortam değişkeni, yetkili API çağrıları için kullanılır
  - `authHeader` — İstekten okunan Authorization header değeri; yoksa 401 döner
  - `authClient` — AnonKey + Authorization header ile oluşturulmuş Supabase client; kullanıcının kimliğini doğrulamak için kullanılır
  - `user` — authClient.auth.getUser() sonucu doğrulanmış kullanıcı nesnesi; user.id ile rol kontrolü yapılır
  - `authErr` — auth.getUser() sonucu hata nesnesi; user ile birlikte unauthorized kontrolünde kullanılır
  - `roleCheck` — user_profiles tablosundan kullanıcının rolünü sorgulayan fetch response'u
  - `arr` — roleCheck yanıtının JSON parse edilmiş hali; rol array'ini tutar (arr[0]?.role)
  - `role` — Kullanıcının rol değeri; 'admin' veya 'superadmin' olmalı, değilse 403 döner
  - `isCurrentlyShipped` — Siparişin şu an kargoya verilip verilmediğini gösteren boolean; shipped_at != null veya status == 'shipped' kontrolü ile belirlenir
  - `cur` — Mevcut sipariş durumunu sorgulayan fetch response'u (isCurrentlyShipped hesaplama için)
  - `row` (cur) — cur yanıtının ilk satırı; row.shipped_at ve row.status alanları okunur
  - `wantCancel` — İptal akışına girilip girilmeyeceğini belirleyen boolean; cancel || (isCurrentlyShipped && (!carrier || !tracking_number))
  - `updCancel` — Kargo iptali için venthub_orders tablosuna PATCH yapan fetch response'u; carrier/tracking/shipped_at null, status 'confirmed' yapılır
  - `txt` (updCancel) — updCancel başarısızsa hata gövdesinin ham metin hali
  - `isFirstShip` — Siparişin ilk kez kargoya verilip verilmediğini gösteren boolean; shipped_at null ve status != 'shipped' ise true
  - `cur` (isFirstShip) — İlk sevkiyat kontrolü için mevcut sipariş durumunu sorgulayan fetch response'u
  - `row` (isFirstShip) — cur yanıtının ilk satırı; row.shipped_at ve row.status alanları kontrol edilir
  - `patchBody` — Kargo güncelleme PATCH gövdesi; carrier, tracking_number, tracking_url alanlarını içerir; isFirstShip ise shipped_at ve status de eklenir
  - `upd` — Kargo bilgilerini güncellemek için venthub_orders tablosuna PATCH yapan fetch response'u
  - `txt` (upd) — upd başarısızsa hata gövdesinin ham metin hali
  - `headerKey` — x-idempotency-key header'ından okunan istemci tarafı idempotency anahtarı
  - `derivedKey` — computeIdemKey() ile action, orderId, carrier, tn değerlerinden SHA-256 hash olarak türetilen idempotency anahtarı
  - `idemKey` — Kullanılacak idempotency anahtarı; headerKey varsa o, yoksa derivedKey kullanılır
  - `customer_email` — Müşterinin email adresi; Auth Admin API'den user nesnesinden alınır, bildirim emaili için kullanılır
  - `customer_name` — Müşterinin tam adı; user_metadata.full_name veya user_metadata.name'den alınır
  - `ordResp` — Siparişten user_id ve order_number alanlarını sorgulayan fetch response'u
  - `row` (ordResp) — ordResp yanıtının ilk satırı; row.user_id ve row.order_number alanlarını içerir
  - `uid` — row.user_id'den alınan sipariş sahibinin Supabase kullanıcı ID'si
  - `usrResp` — Auth Admin API ile kullanıcının detaylı bilgisini (email, user_metadata) çeken fetch response'u
  - `u` — usrResp JSON yanıtından parse edilmiş kullanıcı nesnesi; u.email, u.user_metadata.full_name, u.user_metadata.name alanlarını içerir
  - `metaName` — u.user_metadata'dan alınan tam ad; full_name veya name tercih sırasıyla kontrol edilir
  - `emailResult` — Email gönderim sonucunu tutan nesne; { sent: boolean, disabled: boolean } formatında
  - `resp` — shipping-notification edge function'ına POST isteği yapan fetch response'u
  - `j` — resp JSON yanıtından parse edilmiş { disabled?, subject?, result?: { id? } } nesnesi
  - `body` (email event) — shipping_email_events tablosuna kaydedilecek email event nesnesi; order_id, email_to, subject, provider, provider_message_id, carrier, tracking_number alanlarını içerir
- **Dönüş**: `Response` — Başarı durumunda `{ ok: true, email: { sent, disabled } }` JSON gövdesiyle 200; hata durumlarında ilgili HTTP status koduyla hata JSON'u

---

### [N2_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::pick
- **params**: `keys: string[]` — Öncelik sırasına göre kontrol edilecek alan adları dizisi
- **ic_degiskenler**:
  - `k` — Döngüdeki mevcut anahtar adı
  - `v` — parsed nesnesinden k ile okunan değer; string ve trim edilmişse veya number ve finite ise string olarak döner
- **Dönüş**: `string | null` — İlk geçerli değeri trim edilmiş string olarak döner; hiçbir alan yoksa null

---

### [N3_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::cancel IIFE
- **params**: yok
- **ic_degiskenler**:
  - `vRaw` — `parsed['cancel'] ?? qs.get('cancel')` ile elde edilen ham değer; boolean veya string olabilir
- **Dönüş**: `boolean` — cancel isteği true/false olarak normalized edilmiş hali

---

### [N4_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::send_email IIFE
- **params**: yok
- **ic_degiskenler**:
  - `v` — `parsed['send_email'] ?? parsed['sendEmail'] ?? qs.get('send_email') ?? qs.get('sendEmail')` ile elde edilen ham değer; boolean veya string olabilir
- **Dönüş**: `boolean` — Email gönderilip gönderilmeyeceği; fallback olarak true

---

### [N5_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::computeIdemKey
- **params**: `action: 'ship' | 'cancel'` — Gerçekleştirilen aksiyon türü, `orderId: string` — Sipariş ID'si, `carrier?: string | null` — Kargo taşıyıcı adı (opsiyonel), `tn?: string | null` — Takip numarası (opsiyonel)
- **ic_degiskenler**:
  - `raw` — Pipe karakteri ile birleştirilmiş ham string; `[action, orderId, carrier, tn]` elemanlarını içerir
  - `bytes` — raw string'in TextEncoder ile UTF-8 byte dizisine dönüştürülmüş hali; SHA-256 inputu
  - `hash` — crypto.subtle.digest ile hesaplanmış SHA-256 hash; ArrayBuffer formatında
- **Dönüş**: `string` — Hash'in hex string'e çevrilmiş hali (64 karakter); tekrarlanan istekleri önlemek için kullanılır

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler