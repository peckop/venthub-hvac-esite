---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-update-order\index.ts
skeleton_hash: 8dabcdea4ab361bb
entity_hashes:
  func:admin-update-order_handler: 401e11b0dc3cc59d
  func:firstProfileRow: 401596132e3baec8
  overview: e4e143931d01e33c
generated_at: 2026-08-15T09:05:02Z
---

## Genel Bakış
Bu modül, Supabase Edge Function olarak deployed bir HTTP API servisidir. Yöneticilerin mevcut siparişleri güncellemek için kullandığı bir uç nokta sağlar; gelen istekleri doğrular, yönetici yetkilendirmesini kontrol eder ve veritabanında ilgili sipariş kaydını günceller.

## Fonksiyon Grupları
### Sipariş Güncelleme İşleyicisi
Modülün ana giriş noktası olarak tüm HTTP istek-yanıt döngüsünü, kimlik doğrulamayı ve iş mantığını yönetir. Gelen isteği alarak yönetici rolünü doğrular, Supabase istemcisi aracılığıyla sipariş güncellemesini gerçekleştirir ve uygun HTTP yanıtını döner.
- admin-update-order_handler

### Yardımcı Veri İşlevleri
Gelen veri setinden belirli alanları (örneğin yönetici rolü ve kiracı kimliği) çıkaran ve işleyici tarafından iç yardımcı olarak kullanılan fonksiyonları barındırır. Bu işlevler, handler içindeki karmaşık mantığı basitleştirmek ve veri dönüşümünü merkezileştirmek için tasarlanmıştır.
- firstProfileRow

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyomlar, fonksiyon gövdesindeki mantıksal akışa dayanarak türetilmiştir.

[Aksiyom 1]: Eğer istek geçerli bir JSON gövdesi içermiyorsa veya gerekli alanlar (order_id, updates) eksikse, istek 400 hata koduyla reddedilir.

[Aksiyom 2]: Eğer istek başlığındaki Authorization token'ı (Bearer) yoksa veya geçerli bir Supabase JWT içermiyorsa, istek 401 Unauthorized ile reddedilir.

[Aksiyom 3]: Eğer JWT'den çıkarılan kullanıcıya ait bir profil kaydı (profiles tablosu) bulunamazsa, istek 403 Forbidden ile reddedilir.

[Aksiyom 4]: Eğer kullanıcının profilindeki `role` alanı `admin` veya `super_admin` değerlerinden birine sahip değilse, istek 403 Forbidden ile reddedilir.

[Aksiyom 5]: Eğer kullanıcının profilindeki `tenant_id` değeri null ise, istek 403 Forbidden ile reddedilir (çünkü çoklu kiracı modelinde hangi kiracıya ait olduğunu bilemez).

[Aksiyom 6]: Eğer güncellenecek sipariş (order_id ile) veritabanında bulunamazsa, istek 404 Not Found ile reddedilir.

[Aksiyom 7]: Eğer güncellemeye çalışılan siparişin `tenant_id` alanı, isteği yapan kullanıcının `tenant_id` alanı ile eşleşmiyorsa, istek 403 Forbidden ile reddedilir (kiracı izolasyonu ihlali).

[Aksiyom 8]: Eğer Supabase veritabanı bağlantısı (URL veya anon key) kurulamazsa veya sorgu sırasında bir veritabanı hatası oluşursa, istek 500 Internal Server Error ile reddedilir.

[Aksiyom 9]: Eğer `firstProfileRow` fonksiyonu beklenmedik bir veri yapısı (null dışı, ancak `role` veya `tenant_id` alanlarını içermeyen bir nesne) döndürürse, bu durum beklenmeyen bir sistem hatası olarak değerlendirilir ve istek 500 ile reddedilir.

---

## FONKSİYON DETAYLARI

### firstProfileRow

**Ne yapar**: PostgREST API yanıtlarından dönen dizilerden ilk profil satırını güvenli bir şekilde çıkarır ve `role` ile `tenant_id` alanlarını içeren tip-güvenli bir nesneye dönüştürür. Bu fonksiyon, `fetch(...).json()` çağrısının tipsiz (any) dönüş değerini runtime seviyesinde doğrulayarak güvenlik sağlar.

**Nasıl yapar**: Fonksiyon, gelen `unknown` türündeki değeri aşamalı olarak doğrular: önce değerin bir dizi olup olmadığını ve boş olmadığını kontrol eder, ardından dizinin ilk elemanının bir nesne olup olmadığını ve `null` olmadığını doğrular. Tüm kontroller geçildikten sonra, `Record<string, unknown>` türüne genişletilen kayıt nesnesinden `role` ve `tenant_id` alanlarını tek tek çıkarır. Her alan için `typeof` kontrolü yapılır; alan mevcut ve `string` tipindeyse değeri korunur, aksi takdirde `null` döner. Bu desen `_shared/caller.ts` modülündeki `toProfileRow` fonksiyonuyla aynı güvenlik yaklaşımını izler — tip ataması yerine runtime doğrulama tercih edilir.

**Parametreler**:
- `value: unknown` — PostgREST veya benzeri bir API'den `fetch().json()` ile alınan, bilinmeyen tipteki ham yanıt verisi. Dizi (array) formatında olması beklenir ve dizinin ilk elemanının `role` ile `tenant_id` alanlarını içermesi gerekir.

**Dönüş**: `{ role: string | null; tenant_id: string | null } | null` — Doğrulama başarılıysa `role` ve `tenant_id` alanlarını içeren bir nesne döner. Her iki alan da opsiyoneldir ve `string` veya `null` olabilir. Gelen değer geçerli bir dizi değilse, dizi boşsa, ilk eleman geçerli bir nesne değilse ya da alanlar bulunamıyorsa `null` döner.

### admin-update-order_handler
**Ne yapar**: Bu fonksiyon, bir HTTP POST isteği alarak, bir siparişin (order) güncellenmesi işlemini tetikleyen bir Supabase Edge Function'ın ana giriş noktasıdır (handler). Genellikle bir yönetici (admin) yetkisiyle çalışması beklenen bu fonksiyon, istek gövdesinden gelen verileri işleyerek ilgili sipariş kaydını veritabanında günceller.

**Nasıl yapar**: Fonksiyon, `@serve(Deno.serve)` dekoratörü ile işaretlenmiştir. Bu dekoratör, fonksiyonu bir Deno HTTP sunucusu işleyicisi (request handler) olarak kaydeder; bu sayede gelen bir HTTP isteği (`Request` nesnesi) bu fonksiyona yönlendirilir. Fonksiyon, asenkron (`async`) olarak çalışır, isteği işler ve bir `Response` nesnesi döndürerek HTTP yanıtını oluşturur.

**Parametreler**:
- `req`: `Request` — Gelen HTTP isteğini temsil eder. Standart web API Request nesnesidir. Genellikle gövdesinde (`req.json()` kullanarak) güncellenecek siparişin ID'si ve yeni değerleri gibi JSON verileri barındırır.

**Dönüş**: `Response` — İşlem sonucunu içeren bir HTTP yanıt nesnesi. Başarılı bir güncelleme sonrası genellikle HTTP 200 OK durum kodu ve güncellenen siparişin verilerini veya bir başarı mesajını JSON formatında gövdesinde barındırır. Bir hata durumunda ise uygun HTTP hata kodları (örn. 400, 403, 500) ve hata açıklamasını içeren bir yanıt döner.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant.ts::TenantMismatchError
- import: ../_shared/tenant.ts::tenantFromVerifiedUser
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/admin-update-order/index.ts`::firstProfileRow
- **params**: `(value: unknown)`
- **ic_degiskenler**:
  - `first` — `value` indis 0'dan alınan ilk eleman; dizi elemanının referansı
  - `record` — `first`'in `Record<string, unknown>` türüne cast edilmiş hali; `role` ve `tenant_id` alanlarına erişim sağlar
- **Dönüş**: `{ role: string | null; tenant_id: string | null } | null` — dizinin ilk elemanından `role` ve `tenant_id` alanlarını çıkarır; geçersiz veya boş input gelirse `null` döner

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::firstProfileRow
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler
  export: firstProfileRow