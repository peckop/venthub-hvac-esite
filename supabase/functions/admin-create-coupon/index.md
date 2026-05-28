---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-create-coupon\index.ts
skeleton_hash: a957b854a7f7b2b2
entity_hashes:
  func:admin-create-coupon_handler: 72913923d4da4715
  overview: fe946b312ab86c27
generated_at: 2026-05-28T22:41:01Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak çalışan bir HTTP endpoint'idir. Yöneticilerin sisteme yeni indirim kuponları oluşturmasını sağlar. Gelen isteklerdeki kupon verilerini doğrulayıp veritabanına kaydeder ve CORS uyumlu HTTP yanıt döndürür.

## Fonksiyon Grupları
### Kupon Oluşturma İşlemleri
HTTP isteklerini yöneterek kupon oluşturma sürecini yürütür. İstek doğrulama, yetki kontrolü, veri kaydı ve yanıt üretimini tek bir işleyici içinde gerçekleştirir.
- admin_create_coupon_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir Supabase Edge Function olarak tanımlanmıştır ve yönetici tarafından indirim kuponu oluşturmak için kullanılır.

[Aksiyom 1]: Eğer `req` parametresi (HTTP isteği) sağlanmazsa veya geçerli bir HTTP isteği değilse, fonksiyon isteği işleyemez ve bir hata yanıtı döner.

[Aksiyom 2]: Eğer `corsHeaders` sabiti tanımlı değilse veya boş bir nesne ise, yanıtta CORS başlıkları ayarlanmaz ve tarayıcı tarafı çapraz kaynak istekleri engellenebilir.

[Aksiyom 3]: Eğer Supabase veritabanı bağlantısı (çevresel değişkenler aracılığıyla) sağlanmazsa veya bağlantı kesilirse, fonksiyon kuponu oluşturamaz ve bir hata yanıtı döner.

[Aksiy

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
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-create-coupon/index.ts::admin-create-coupon_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` çağrısından alınan Supabase proje URL'si.
  - `SUPABASE_ANON_KEY` — `Deno.env.get('SUPABASE_ANON_KEY')` çağrısından alınan Supabase anonim anahtarı.
  - `SUPABASE_SERVICE_ROLE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` çağrısından alınan Supabase servis rolü anahtarı.
  - `authHeader` — `req.headers.get('Authorization')` çağrısından alınan kimlik doğrulama başlık değeri.
  - `supabaseUser` — Anonim anahtar ve kullanıcı kimlik bilgisiyle oluşturulan Supabase istemcisi, kullanıcı doğrulaması için kullanılır.
  - `supabaseAdmin` — Servis rolü anahtarıyla oluşturulan Supabase istemcisi, yönetimsel veritabanı işlemleri (rol kontrolü, insert) için kullanılır.
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının sonucu, oturum açmış kullanıcının bilgilerini içerir.
  - `userId` — `userRes.user.id` değerinden提取的， kimliği doğrulanmış kullanıcının benzersiz ID'si.
  - `profile` — `supabaseAdmin.from('user_profiles').select('role')...` sorgusunun sonucu, kullanıcının rolünü içeren satır.
  - `userRole` — `profile?.role` değerinden elde edilen kullanıcı rolü (örn. 'admin', 'superadmin'), yoksa varsayılan 'user'.
  - `body` — `req.json()` çağrısından parse edilen istek gövdesi, `CouponBody` arayüzüne cast edilmiştir.
  - `code` — `body.code` değerinden temizlenmiş (trim) kupon kodu dizesi.
  - `type` — `body.type` değerinden elde edilen kupon türü ('percent' veya 'fixed').
  - `value` — `body.value` değerinden sayıya dönüştürülmüş indirim miktarı.
  - `starts_at` — `body.starts_at` varsa string'e dönüştürülmüş, yoksa null olan geçerlilik başlangıç tarihi.
  - `ends_at` — `body.ends_at` varsa string'e dönüştürülmüş, yoksa null olan geçerlilik bitiş tarihi.
  - `is_active` — `body.active` değerinin boolean karşılığı (true ise `true`, null/undefined ise `true`).
  - `usage_limit` — `body.usage_limit` değerinden işlenen, null veya pozitif bir tam sayı olabilen kullanım limiti.
  - `errs` — Doğrulama hatalarını toplayan string dizisi.
  - `payload` — `coupons` tablosuna eklenecek tüm alanları içeren, veritabanı için hazırlanmış nesne.
  - `data` — `supabaseAdmin.from('coupons').insert().select().single()` çağrısının başarı durumunda dönen inserted satır verisi.
  - `insErr` — Insert işleminde oluşabilecek hata nesnesi.
  - `_e` — `catch` bloğunda yakalanan ham hata nesnesi.
  - `msg` — `_e` nesnesinden elde edilen hata mesajı dizesi.
- **Dönüş**: `Response` (İstek methoduna göre 204, 405, 401, 403, 400, 500 veya 200 durum kodlu JSON gövdeli HTTP yanıt).

---

## NODE ID STANDARD

  file: supabase\functions\admin-create-coupon\index.ts
  function: supabase\functions\admin-create-coupon\index.ts::admin-create-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-create-coupon_handler