---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: d670578debdc12bc
entity_hashes:
  func:admin-create-coupon_handler: 72913923d4da4715
  overview: 5cba6bb90779bd31
generated_at: 2026-05-29T11:39:37Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak çalışan HTTP endpoint'idir. Yönetici paneli üzerinden yeni indirim kuponları oluşturulmasını sağlar. Gelen istekleri işleyerek kupon verilerini doğrular, veritabanına kaydeder ve uygun HTTP yanıtları döndürür.

## Fonksiyon Grupları
### Kupon Oluşturma İşlemleri
Tüm HTTP isteklerini yöneterek kupon oluşturma sürecini tek bir işleyici içinde yürütür. İstek doğrulama, yetki kontrolü, veri kaydı ve yanıt üretimini içerir.
- admin_create_coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function平台上 çalışan bir HTTP endpoint'idir. Yalnızca yapısal unsurlardan (fonksiyon imzası ve sabitler) türetilen aksiyomlar aşağıdadır.

---

**[Aksiyom 1]:** Eğer `corsHeaders` sabiti tanımlı değilse veya boşsa, cross-origin istekler yanıt başlıklarında CORS kurallarına uygun şekilde işlenemez ve istemciler tarayıcı güvenlik politikası nedeniyle yanıta erişemez.

**[Aksiyom 2]:** Eğer `req` parametresi `Request` tipinde değilse (örn: `null`, `undefined` veya farklı bir tip), fonksiyon HTTP method, header veya body bilgisine erişemeden çalışma zamanı hatası verir.

**[Aksiyom 3]:** Eğer istek gövdesi (request body) geçerli bir JSON içermiyorsa veya `Content-Type` header'ı `application/json` olarak ayarlanmamışsa, kupon oluşturma verileri parse edilemez ve işlenemez.

**[Aksiyom 4]:** Eğer Supabase Edge Function runtime ortamı (Deno) müsait değilse veya fonksiyon deploy edilmemişse, HTTP istekleri bu endpoint'e yönlendirilemez ve bağlantı hatası oluşur.

---

## FONKSİYON DETAYLARI

### admin-create-coupon_handler

**Ne yapar**: Bu fonksiyon, administrative panel üzerinden yeni bir kupon oluşturma işlemini yöneten HTTP isteklerini işler. Supabase Edge Function yapısında yer alan bu handler, admin kullanıcılarının kupon sistemine yeni kayıtlar eklemesini sağlar.

**Nasıl yapar**: Fonksiyon, gelen HTTP Request nesnesini kabul eder ve ilgili isteği işleyerek bir Response döndürür. Supabase Edge Functions mimarisinde çalışır ve TypeScript tabanlıdır. İşlevin detaylı iç mantığı dokümanda belirtilmemiştir.

**Parametreler**:
- `req`: Request — İşlenecek HTTP istek nesnesi. İstek gövdesinde kupon verileri ve authentication bilgileri bulunmaktadır.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı oluşturma durumunda onay, hata durumunda ise uygun hata mesajını döndürür.

**Not**: Fonksiyon docstring'i boş bırakılmış olup, detaylı iç mantık ve implementasyon bilgileri kaynak kodda mevcuttur. Belgeleme için kaynak kod incelenerek parametre şeması, validasyon kuralları ve hata yönetimi detayları eklenmelidir.

---

## SABİTLER
- **corsHeaders** (object) — `{
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, c...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-create-coupon/index.ts::admin-create-coupon_handler
- **params**: `(req: Request)` — gelen HTTP isteği
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` ile elde edilen CORS başlık nesnesi, tüm yanıtlara eklenir
  - `cors` — `corsHeaders`'ın alias'ı olarak atanmış, fonksiyon gövdesinde tekrar kullanılmaz
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase proje URL'i, istemci oluşturmada kullanılır
  - `SUPABASE_ANON_KEY` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan anonim anahtar, kullanıcı bazlı Supabase istemcisi oluşturulurken kullanılır
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan servis rolü anahtarı, admin Supabase istemcisi oluşturulurken kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile alınan Yetkilendirme başlığı, kullanıcı kimlik doğrulaması için kullanılır
  - `supabaseUser` — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })` ile oluşturulan kullanıcı Supabase istemcisi, `auth.getUser()` çağrısıyla kullanılır
  - `supabaseAdmin` — `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` ile oluşturulan servis rolü Supabase istemcisi, profil sorgulama ve kupon ekleme işlemlerinde kullanılır
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının `data` sonucu, kullanıcı bilgilerini içerir
  - `userErr` — `supabaseUser.auth.getUser()` çağrısının `error` sonucu, kimlik doğrulama hatası varsa doludur
  - `userId` — `userRes.user.id` değerinden alınan kimlik doğrulanmış kullanıcının UUID'si, profil sorgusu ve `created_by` alanına yazılır
  - `profile` — `supabaseAdmin.from('user_profiles').select('role').eq('id', userId).maybeSingle()` sorgusunun sonucu, kullanıcının rol bilgisini içerir
  - `profErr` — profil sorgusunun `error` sonucu, veritabanı hatası varsa doludur
  - `userRole` — `profile?.role` değerinden alınan kullanıcı rolü, `'user'` varsayılanı ile `'admin'`/`'superadmin'` kontrolü yapılır
  - `body` — `await req.json().catch(() => ({}))` ile parse edilen istek gövdesi, `CouponBody` arayüzü ile tiplendirilmiş (code, type, value, starts_at, ends_at, active, usage_limit alanları)
  - `code` — `String(body.code || '').trim()` ile temizlenmiş kupon kodu, 3-50 karakter arası olmalı
  - `type` — `String(body.type || '')` ile alınan indirim türü, `'percent'` veya `'fixed'` olmalı
  - `value` — `Number(body.value)` ile sayıya dönüştürülen indirim değeri, sıfırdan büyük olmalı
  - `starts_at` — `body.starts_at` varsa `String(body.starts_at)`, yoksa `null`; kupon geçerlilik başlangıç tarihi
  - `ends_at` — `body.ends_at` varsa `String(body.ends_at)`, yoksa `null`; kupon geçerlilik bitiş tarihi
  - `is_active` — `Boolean(body.active ?? true)` ile belirlenen aktiflik durumu, varsayılan `true`
  - `usage_limit` — `body.usage_limit`'ten parse edilen kullanım limiti, `null` olabilir (sınırsız), geçersiz değerlerde `null` atanır
  - `ul` — `Number(body.usage_limit)` ile parse edilen geçici kullanım limiti sayısı, `!Number.isFinite(ul) || ul < 1` kontrolü ile `null` veya geçerli sayıya dönüştürülür
  - `errs` — validasyon hatalarını toplayan `string[]` dizisi, geçersiz alan isimleri eklenir (`'code'`, `'type'`, `'value'`)
  - `payload` — `supabaseAdmin.from('coupons').insert(payload)` ile veritabanına yazılacak kupon nesnesi; alanları: `code`, `discount_type` (`'percentage'`/`'fixed_amount'`), `discount_value`, `valid_from` (ISO tarih), `valid_until` (ISO tarih), `is_active`, `usage_limit`, `used_count` (0), `created_by` (userId)
  - `data` — `supabaseAdmin.from('coupons').insert(payload).select('id, code, discount_type, discount_value, valid_from, valid_until, is_active, usage_limit, used_count, created_at').single()` çağrısının `data` sonucu, eklenen kuponun tam bilgilerini içerir
  - `insErr` — insert işleminin `error` sonucu, veritabanı ekleme hatası varsa doludur
  - `_e` — `catch` bloğu yakalama değişkeni, `unknown` tipinde, hata nesnesi veya string olabilir
  - `msg` — `_e instanceof Error ? _e.message : String(_e)` ile elde edilen hata mesajı, internal hata yanıtında `details` alanına yazılır
- **Dönüş**: `Response` — OPTIONS istekleri için 204, method hatası için 405, kimlik doğrulama hataları için 401, yetki hatası için 403, validasyon hataları için 400, başarılı kupon oluşturma için 200 (JSON ile kupon verisi), genel catch bloğu için 500

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler