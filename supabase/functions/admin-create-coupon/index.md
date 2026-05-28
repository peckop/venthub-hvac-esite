---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: a957b854a7f7b2b2
generated_at: 2026-05-24T10:44:25Z
---

## Genel Bakış
Bu modül, Supabase Edge ortamında çalışan bir HTTP endpoint’idir ve yöneticinin yeni bir indirim kuponu oluşturmasını sağlar. Gelen istekten kupon verilerini alır, gerekli doğrulamaları yapar, veritabanına kaydeder ve CORS başlıkları eklenmiş bir yanıt döndürür.

## Fonksiyon Grupları
### Kupon Oluşturma ve Yanıt Üretimi
İstek verilerini işleyerek kupon kaydını gerçekleştirir ve işlem sonucuna göre uygun HTTP yanıtını (başarı veya hata) üretir.  
- admin-create-coupon_handler   (tekil fonksiyon)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### admin-create-coupon_handler
**Ne yapar**: Bu fonksiyon, yönetici yetkisine sahip kullanıcıların indirim kuponları oluşturması için tasarlanmış Supabase Edge Function işleyicisidir. Gelen HTTP isteklerini alır, gerekli doğrulama ve kontrolleri gerçekleştirir, yeni kupon kayıtları oluşturur ve işlem sonucuna uygun yanıtlar döndürür.
**Nasıl yapar**: Öncelikle gelen isteğin kimlik doğrulamasını ve yönetici yetki seviyesini doğrular. İstek gövdesinden kupon oluşturmak için gerekli parametreleri ayrıştırır ve geçerliliğini kontrol eder. Doğrulanmış verilerle Supabase veritabanına yeni kupon kaydı ekler. İşlem başarılı olursa oluşturulan kupon verisini içeren yanıt döndürür, herhangi bir hata durumunda ilgili hata kodu ve mesajı ile yanıt oluşturur.
**Parametreler**:
- req: Request — İşlenecek HTTP isteği nesnesi. İstek gövdesinde kuponun detayları (örneğin kupon kodu, indirim yüzdesi/tutarı, son kullanma tarihi, maksimum kullanım sayısı vb.) bulunmalıdır.
**Dönüş**: Response — Yapılandırılmış HTTP yanıt nesnesi. Başarılı bir oluşturma işlemi durumunda 201 Created statüsü ve oluşturulan kupon verisini içeren JSON yanıtı döndürür. Yetkisiz erişim durumunda 401 Unauthorized, geçersiz istek verileri durumunda 400 Bad Request, sunucu taraflı hatalarda 500 Internal Server Error statüleri ile ilgili hata mesajları döndürülür.

---

## SABİTLER
- **corsHeaders** (object) — `{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

- **params**: `req: Request`

- **ic_degiskenler**:
  - `SUPABASE_URL` — Supabase proje URL'si, `Deno.env.get('SUPABASE_URL')` ile alınır
  - `SUPABASE_ANON_KEY` — Supabase anonim anahtar, `Deno.env.get('SUPABASE_ANON_KEY')` ile alınır
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase servis rol anahtarı, `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınır
  - `authHeader` — İstek Authorization başlığı değeri, `req.headers.get('Authorization')` ile alınır
  - `supabaseUser` — Kullanıcı tarafında doğrulama için anonim anahtar ve authorization başlığı ile oluşturulmuş Supabase istemcisi
  - `supabaseAdmin` — Yönetici işlemleri için servis rol anahtarı ile oluşturulmuş Supabase istemcisi
  - `userRes` — `supabaseUser.auth.getUser()` çağrısından dönen veri; `.user.id` ile kullanıcı ID'si alınır
  - `userErr` — `supabaseUser.auth.getUser()` çağrısından dönen hata
  - `userId` — Kimliği doğrulanmış kullanıcının UUID değeri (`userRes.user.id`)
  - `profile` — `supabaseAdmin.from('user_profiles').select('role').eq('id', userId).maybeSingle()` sorgusundan dönen profil satırı
  - `profErr` — Profil sorgusu sırasında oluşan hata
  - `userRole` — Kullanıcının rolü, `profile?.role` değeri veya varsayılan `'user'`
  - `body` — İstek gövdesinden JSON olarak ayrıştırılmış kupon verileri ( `await req.json().catch(() => ({}))` ), şu alanlara erişilir: `body.code`, `body.type`, `body.value`, `body.starts_at`, `body.ends_at`, `body.active`, `body.usage_limit`
  - `code` — Kupon kodu, `String(body.code || '').trim()` ile normalize edilmiş
  - `type` — İndirim türü (`'percent'` veya `'fixed'`), `String(body.type || '')`
  - `value` — İndirim değeri, `Number(body.value)` ile sayıya dönüştürülmüş
  - `starts_at` — Kupon başlangıç zamanı (string veya `null`), `body.starts_at` varsa `String(body.starts_at)` ile alınır
  - `ends_at` — Kupon bitiş zamanı (string veya `null`), `body.ends_at` varsa `String(body.ends_at)` ile alınır
  - `is_active` — Kuponun aktif olup olmadığı, `Boolean(body.active ?? true)`
  - `usage_limit` — Kullanım limiti (sayı veya `null`), `body.usage_limit` üzerinden hesaplanır
  - `errs` — Doğrulama hatalarını toplayan dizi (`string[]`)
  - `payload` — Veritabanına eklenecek kupon nesnesi, şu alanları içerir: `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `is_active`, `usage_limit`, `used_count`, `created_by`
  - `data` — `supabaseAdmin.from('coupons').insert(payload).select(...).single()` çağrısından dönen eklenmiş kupon satırı
  - `insErr` — Ekleme işlemi sırasında oluşan hata
  - `_e` — `catch` bloğunda yakalanan hata nesnesi
  - `msg` — Hata mesajı, `_e instanceof Error ? _e.message : String(_e)` ile elde edilir

- **Dönüş**: `Response` — Başarılı durumda 200, eksik çevre değişkenlerinde 500, kimlik doğrulama hatasında 401, yetki hatasında 403, doğrulama hatasında 400, ekleme hatasında 400, genel hata durumunda 500 döner. OPTIONS isteklerine 204, POST dışındaki metotlara 405 yanıtı verilir.

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler