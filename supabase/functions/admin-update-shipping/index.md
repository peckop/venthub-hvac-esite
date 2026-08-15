---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-update-shipping\index.ts
skeleton_hash: 8826e4eb433f0803
entity_hashes:
  func:admin-update-shipping_handler: fab3b88ab551f027
  func:firstProfileRow: a0e6e5d01b903221
  overview: 36b9e64a0a5f328f
generated_at: 2026-08-15T09:03:36Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan bir kargo güncelleme servisidir. Yönetici kullanıcıların siparişlere ait kargo bilgilerini güvenli bir şekilde güncellemesini sağlar. Tek bir HTTP istek işleyicisi üzerinden kimlik doğrulama, yetki kontrolü ve veritabanı güncelleme işlemlerini yönetir.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Üretme
Gelen HTTP isteklerini alır, yönetici kimliğini doğrular ve yetki kontrolünü gerçekleştirir. İşlem sonucuna göre başarılı veya hatalı bir HTTP yanıtı döndürerek istemciye geri bildirim sağlar.
- admin-update-shipping_handler, firstProfileRow

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### firstProfileRow
**Ne yapar**: Bu fonksiyon, PostgREST API'inden dönen ve ham bir JSON verisi olan `unknown` tipindeki bir değeri alır. Fonksiyon, bu değerin bir dizi (array) olup olmadığını ve ilk elemanının geçerli bir profil nesnesi (belirli alanlara sahip bir nesne) olup olmadığını kontrollü bir şekilde doğrular. Doğrulama başarılı ise ilk profil satırından `role` ve `tenant_id` alanlarını çıkararak tip güvenli bir nesne olarak döndürür; aksi takdirde `null` döner.

**Nasıl yapar**: Fonksiyon, gelen `value` parametresi üzerinde bir dizi runtime kontrolü uygular. Önce değerin bir dizi olup olmadığını ve boş olmadığını kontrol eder. Ardından dizinin ilk elemanının bir nesne (`object`) olup olmadığını doğrular. Bu kontrollerden geçerse, ilkel bir `Record<string, unknown>` tipine dönüştürdüğü bu nesnenin `role` ve `tenant_id` alanlarının string tipinde olup olmadığını test eder. Bu alanların mevcut ve doğru tipte olmaları durumunda ilgili değerleri, değilse `null` değerlerini içeren tip güvenli bir nesne oluşturur. Bu desen, tip uydurmaya (`type casting`) dayanmayan, dinamik ve güvenli bir veri çıkarma yöntemi sunar.

**Parametreler**:
- value: unknown — PostgREST dizisi (`fetch().json()` çağrısından dönen) veya herhangi bir veriyi temsil eder. Fonksiyon, bu değerin dizin ilk elemanının `role` ve `tenant_id` alanlarını içermesini bekler.

**Dönüş**: `{ role: string | null; tenant_id: string | null } | null` — Doğrulama başarılı ise, `role` ve `tenant_id` alanlarını (her ikisi de `string` veya `null` olabilir) içeren bir nesne döner. Doğrulama başarısız olursa (gelen değer diz değilse, boş dizi ise veya ilk eleman geçerli bir nesne/yapı değilse) `null` döner.

### admin-update-shipping_handler
**Ne yapar**: Bu fonksiyon, bir HTTP isteği alarak bir yanıt döndüren bir Supabase Edge Function istek işleyicisidir. Fonksiyonun adı, yöneticilerin kargo veya gönderi bilgilerini güncellemek üzere tasarlandığını belirtir.
**Nasıl yapar**: Fonksiyon, gelen HTTP istek nesnesini (req) alır, istek içeriğine göre kargo güncelleme işlemlerini başlatır ve sonuç olarak bir HTTP yanıt nesnesi (Response) oluşturur. İşlem mantığı, istek verilerine dayanarak arka uçta veri tabanı güncellemeleri yapmayı ve durum kodlarını ayarlamayı içerir.
**Parametreler**:
- req: Request — İşlenecek olan HTTP isteği nesnesi. İstek gövdesinde veya parametrelerinde kargo güncellemelerine ilişkin veriler taşır.
**Dönüş**: Response — İşlemin sonucunu belirten bir HTTP yanıtı. Başarılı bir güncelleme için uygun bir durum kodu (örn. 200 OK) ve gerekirse bir mesaj içerir; hata durumunda ise hata kodu ve açıklama döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant.ts::TenantMismatchError
- import: ../_shared/tenant.ts::tenantFromVerifiedUser
- import: https://deno.land/std@0.168.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::firstProfileRow
- **params**: `(value: unknown)`
- **ic_degiskenler**: 
  - `first` — value[0] indisinden alınan ilk eleman, array olup olmadığı ve eleman tipi kontrolü için kullanılır
  - `record` — first nesnesi Record<string, unknown> tipine dönüştürülmüş kayıt, role ve tenant_id alanları bu nesneden okunur
- **Dönüş**: `{ role: string | null; tenant_id: string | null } | null`

### [N2_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::admin-update-shipping_handler
- **params**: `(req: Request)`
- **ic_degiskenler**: 
  - `requestId` — Her istek için benzersiz tanımlayıcı, crypto.randomUUID veya Date.now ile oluşturulur
  - `origin` — İstek header'ından gelen origin değeri, CORS kontrolü için kullanılır
  - `allowed` — ALLOWED_ORIGINS env değişkeninden split edilmiş izin verilen origin listesi
  - `okOrigin` — Mevcut origin'in izin verilen listede olup olmadığını kontrol eden boolean
  - `cors` — getCorsHeaders ile elde edilen CORS başlık nesnesi
  - `ct` — Content-Type header'ının lowercased hali, JSON olup olmadığının kontrolü için
  - `max` — MAX_BODY_KB env değişkeninden hesaplanan maksimum gövde boyutu (bayt)
  - `cl` — Content-Length header'ından alınan mevcut gövde boyutu (bayt)
  - `_text` — req.text() ile okunan ham istek gövdesi metni
  - `parsed` — _text'in JSON.parse ile ayrıştırılmış hali, request parametreleri için
  - `pick` — İç içe fonksiyon, parsed objesinde belirli anahtarlar arayan yardımcı fonksiyon
  - `qs` — req.url'den oluşturulan URL searchParams nesnesi
  - `cancel` — iptal isteği boolean değeri, parsed veya query'den alınır
  - `order_id` — Sipariş ID'si, parsed veya query'den alınır
  - `carrier` — Kargo şirketi, parsed veya query'den alınır
  - `tracking_number` — Kargo takip numarası, parsed veya query'den alınır
  - `tracking_url` — Kargo takip URL'i, parsed veya query'den alınır
  - `send_email` — E-posta gönderilip gönderilmeyeceğini belirleyen boolean, parsed veya query'den alınır
  - `supabaseUrl` — SUPABASE_URL env değişkeninden alınan Supabase URL'i
  - `anonKey` — SUPABASE_ANON_KEY env değişkeninden alınan Supabase anon anahtarı
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY env değişkeninden alınan Supabase servis rolü anahtarı
  - `authHeader` — İstek header'ından alınan Authorization başlığı
  - `authClient` — anonKey ile oluşturulan Supabase istemcisi, JWT ile kimlik doğrulama için
  - `jwt` — Authorization header'ından çıkarılan JWT token'ı
  - `user` — authClient.auth.getUser ile doğrulanmış kullanıcı nesnesi
  - `authErr` — Kimlik doğrulama sırasında oluşan hata
  - `roleCheck` — Kullanıcı rolünü kontrol etmek için yapılan fetch isteği yanıtı
  - `profileRow` — firstProfileRow ile elde edilen kullanıcı profil satırı
  - `role` — profileRow?.role değerinden alınan kullanıcı rolü
  - `tenantId` — tenantFromVerifiedUser ile elde edilen tenant ID'si
  - `isCurrentlyShipped` — Siparişin mevcut durumunun shipped olup olmadığını belirleyen boolean
  - `wantCancel` — İptal isteği boolean değeri, cancel parametresi veya mevcut duruma göre belirlenir
  - `updCancel` — İptal işlemini gerçekleştiren PATCH isteği yanıtı
  - `txt` — updCancel başarısız olduğunda alınan hata metni
  - `isFirstShip` — İlk kez kargo gönderimi yapılıp yapılmadığını belirleyen boolean
  - `cur` — Mevcut sipariş durumunu getiren fetch isteği yanıtı
  - `arr` — cur.json() ile elde edilen dizi (sipariş satırları)
  - `row` — arr[0] indisinden alınan ilk sipariş satırı
  - `computeIdemKey` — İdempotens anahtarı hesaplayan iç içe fonksiyon
  - `patchBody` — Sipariş güncellemesi için gönderilecek JSON gövdesi
  - `upd` — Sipariş güncellemesini gerçekleştiren PATCH isteği yanıtı
  - `txt` — upd başarısız olduğunda alınan hata metni
  - `headerKey` — İstek header'ından gelen x-idempotency-key değeri
  - `derivedKey` — computeIdemKey ile hesaplanan idempotens anahtarı
  - `idemKey` — Son idempotens anahtarı (headerKey veya derivedKey)
  - `customer_email` — Müşteri e-posta adresi, bildirim için kullanılır
  - `customer_name` — Müşteri adı, bildirim için kullanılır
  - `ordResp` — Sipariş detaylarını getiren fetch isteği yanıtı
  - `arr` — ordResp.json() ile elde edilen dizi
  - `row` — arr[0] indisinden alınan sipariş satırı
  - `uid` — row?.user_id değerinden alınan kullanıcı ID'si
  - `usrResp` — Kullanıcı bilgilerini getiren Auth Admin API isteği yanıtı
  - `u` — usrResp.json() ile elde edilen kullanıcı nesnesi
  - `metaName` — u.user_metadata.full_name veya u.user_metadata.name değerinden alınan isim
  - `emailResult` — E-posta gönderim sonucunu tutan nesne {sent: boolean, disabled: boolean}
  - `resp` — shipping-notification fonksiyonuna yapılan istek yanıtı
  - `j` — resp.json() ile elde edilen JSON yanıtı (ShippingNotifyResponse)
  - `_e` — catch bloğunda yakalanan hata nesnesi
  - `msg` — _e.message veya String(_e) ile elde edilen hata mesajı
- **Dönüş**: `Response` (çeşitli HTTP durum kodlarıyla)

### [N3_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::pick
- **params**: `(keys: string[])`
- **ic_degiskenler**: 
  - `k` — Döngü değişkeni, keys dizisindeki her anahtar
  - `v` — parsed objesinden k ile alınan değer
- **Dönüş**: `string | null`

### [N4_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::cancel
- **params**: `(yok)`
- **ic_degiskenler**: 
  - `vRaw` — parsed['cancel'] veya qs.get('cancel') değerinden alınan ham değer
- **Dönüş**: `boolean`

### [N5_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::send_email
- **params**: `(yok)`
- **ic_degiskenler**: 
  - `v` — parsed['send_email'] veya qs.get('send_email') değerinden alınan değer
- **Dönüş**: `boolean`

### [N6_NASIL] AST Pointer: supabase/functions/admin-update-shipping/index.ts::computeIdemKey
- **params**: `(action: 'ship' | 'cancel', orderId: string, carrier?: string|null, tn?: string|null)`
- **ic_degiskenler**: 
  - `raw` — Parametrelerin '|' ile birleştirilmesiyle oluşturulan ham string
  - `bytes` — raw string'in TextEncoder ile bayt dizisine dönüştürülmüş hali
  - `hash` — crypto.subtle.digest ile hesaplanan SHA-256 hash'i
- **Dönüş**: `string` (16 baytlık hex string)

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-shipping\index.ts
  function: supabase\functions\admin-update-shipping\index.ts::firstProfileRow
  function: supabase\functions\admin-update-shipping\index.ts::admin-update-shipping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-shipping_handler
  export: firstProfileRow