---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: b33a5fa4ac98e4a4
entity_hashes:
  func:admin-create-coupon_handler: 72913923d4da4715
  overview: e7791c38f1685aef
generated_at: 2026-05-30T21:36:13Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak çalışan tek bir HTTP endpoint'idir. Yönetici arayüzünden gelen istekleri alarak yeni indirim kuponu oluşturma işlemini yönetir. İstek gövdesindeki verileri doğrular, veritabanına kaydeder ve işlem sonucuna göre uygun HTTP yanıtını döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Kupon Oluşturma
Tek bir işleyici fonksiyon, gelen tüm HTTP isteklerini alır, işler ve kupon oluşturma mantığını yürütür. Yetkilendirme, veri doğrulama, veritabanı işlemi ve yanıt üretimini kapsayan tüm adımları tek bir akışta yönetir.
- admin-create-coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementation body) paylaşılmadığından, yalnızca fonksiyon imzası ve sabit yapısından türetilen minimum varsayımlar tanımlanabilmektedir.

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
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısından elde edilen CORS header nesnesi, tüm HTTP yanıtlarına eklenir
  - `cors` — `corsHeaders`'in alternatif alias'ı, aynı nesneye referans
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase proje URL'i, istemci oluşturmada kullanılır
  - `SUPABASE_ANON_KEY` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan anonim anahtar, normal kullanıcı yetkilendirmeli Supabase istemcisi oluşturulurken kullanılır
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan servis rolü anahtarı, yetki bypass yapan admin Supabase istemcisi oluşturulurken kullanılır
  - `authHeader` — `req.headers.get('Authorization')` ile gelen JWT token, kullanıcı kimlik doğrulaması için kullanılır
  - `supabaseUser` — `createClient` ile oluşturulan Supabase istemcisi, anonim key + Authorization header ile; kullanıcının kendi token'ıyla auth istekleri yapılır
  - `supabaseAdmin` — `createClient` ile oluşturulan Supabase istemcisi, service role key ile; veritabanı üzerinde tam yetkili operations yapılır
  - `userRes` — `supabaseUser.auth.getUser()` sonucundaki `data`, kullanıcı bilgilerini içerir
  - `userErr` — `supabaseUser.auth.getUser()` sonucundaki `error`, auth hatası varsa doludur
  - `userId` — `userRes.user.id`, doğrulanmış kullanıcının UUID'si, profil sorgusu ve coupon oluşturma payload'ında kullanılır
  - `bodyCheck` — `req.clone().json()` ile okunan talep gövdesi (hata olursa boş obje), `resolveTenantId`'ye parametre olarak verilir
  - `tenantId` — `resolveTenantId(req, bodyCheck)` ile çözümlenen kiracı ID'si, profil sorgusu ve coupon payload'ında kullanılır
  - `profile` — `user_profiles` tablosundan `role` alanını seçen sorgu sonucu `data`, kullanıcının rol bilgisini içerir
  - `profErr` — profil sorgusundaki `error`, sorgu hatası varsa doludur
  - `userRole` — `profile?.role` değerinden türetilen rol string'i, varsayılan olarak `'user'`; admin/superadmin kontrolü yapılır
  - `body` — `req.json()` ile okunan CouponBody tipindeki talep gövdesi, kupon oluşturma parametrelerini içerir
  - `code` — `body.code`'un string'e çevrilip trim edilmiş hali, kupon kodu doğrulama ve payload'da kullanılır
  - `type` — `body.type`'un string'e çevrilmiş hali, indirim türü (`percent` veya `fixed`)
  - `value` — `body.value`'un `Number()` ile sayıya çevrilmiş hali, indirim miktarı/tutarı
  - `starts_at` — `body.starts_at` varsa string'e çevrilmiş, yoksa `null`; kupon geçerlilik başlangıç tarihi
  - `ends_at` — `body.end_at` varsa string'e çevrilmiş, yoksa `null`; kupon geçerlilik bitiş tarihi
  - `is_active` — `body.active` boolean değeri, `undefined`/`null` ise `true` varsayılır; kuponun aktiflik durumu
  - `usage_limit` — `body.usage_limit`'ten türetilen `number | null`; geçerli bir pozitif finite sayı değilse `null` olur, kuponun maximum kullanım sayısını belirler
  - `errs` — validasyon hatalarını toplayan string dizisi; `code`, `type`, `value` hataları buraya eklenir, boş değilse 400 döner
  - `payload` — `coupons` tablosuna insert edilecek nesne; `code`, `discount_type`, `discount_value`, `valid_from`, `valid_until`, `is_active`, `usage_limit`, `used_count`, `created_by`, `tenant_id` alanlarını içerir; `type` alanını `discount_type` formatına dönüştürür (`'percent'` → `'percentage'`, `'fixed'` → `'fixed_amount'`)
  - `data` — `coupons` tablosuna insert sonrası `select` ile dönen tek satır (`id, code, discount_type, discount_value, valid_from, valid_until, is_active, usage_limit, used_count, created_at` alanları); başarı durumunda istemciye JSON olarak döner
  - `insErr` — insert sorgusundaki `error`, insert hatası varsa doludur
  - `_e` — `catch` bloğunda yakalanan hata nesnesi, `Error` instance ise `.message` okunur, değilse `String(_e)` ile string'e çevrilir
  - `msg` — `_e`'den türetilen hata mesajı string'i, internal error yanıtı detayında kullanılır
- **Dönüş**: `Response` — Başarılı kupon oluşturma: `200` + kupon JSON'u; validasyon/hata durumlarında uygun HTTP status kodları (204, 405, 500, 401, 403, 400) ile hata JSON'u döner; `finally` dönüşü yoktur

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler