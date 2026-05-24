---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\shipping-status\index.ts
skeleton_hash: bdf4bb8403cfeacb
generated_at: 2026-05-24T10:48:08Z
---

## Genel Bakış
Bu modül, kargo durumu sorgularını karşılamak üzere tasarlanmış bir sunucusuz fonksiyon görevi görür. Gelen HTTP isteklerini işler ve yapılandırılmış JSON yanıtları oluşturmak için bir yardımcı işlevden yararlanarak sonuçları döndürür.

## Fonksiyon Grupları
### Yanıt Oluşturma Yardımcıları
Bu grup, HTTP yanıtlarını JSON formatında standartlaştırmak ve başlıkları yönetmek için kullanılan yardımcı işlevi içerir.
- jsonResponse

### İstek İşleyicisi
Bu grup, gelen kargo durumu isteklerini karşılayan, işleyen ve nihai yanıtı istemciye ileten ana mantığı barındırır.
- shipping-status_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sağlanan iki fonksiyonun imzalarına uygun olarak çalışacak şekilde tasarlanmıştır.

[Aksiyom 1]: Eğer shipping-status_handler fonksiyonuna Request türünde olmayan bir argüman geçilirse, fonksiyon doğru şekilde çalışamaz.
[Aksiyom 2]: Eğer jsonResponse fonksiyonuna beklenenden az veya çok sayıda argüman geçilirse, fonksiyon doğru şekilde çalışamaz.
[Aksiyom 3]: Eğer jsonResponse fonksiyonuna init parametresi olarak ResponseInit türünden olmayan bir değer geçilirse, fonksiyon doğru şekilde çalışamaz.
[Aksiyom 4]: Eğer jsonResponse fonksiyonuna body parametresi olarak unknown türünden olmayan bir değer geçilirse, bilinmiyor.

---

## FONKSIYON DETAYLARI

### jsonResponse
**Ne yapar**: VentHub HVAC projesinin Supabase tabanlı shipping-status edge function'ı içinde kullanılan bir yardımcı fonksiyondur, gelen içerik ve ayarlara uygun standart JSON formatlı HTTP cevapları oluşturmak için tasarlanmıştır. Tüm JSON cevaplarının proje içinde tutarlı bir formatta sunulmasını sağlamak amacıyla geliştirilmiştir.
**Nasıl yapar**: Aldığı ham içerik verisini JSON string formatına dönüştürür, gelen cevap ayarlarıyla birleştirirken otomatik olarak JSON içeriği için gerekli Content-Type başlığını cevaba ekler. Proje genelinde standartlaştırılmış cevap yapısını korumak için tüm JSON cevabı oluşturma sürecini tek bir noktada yönetir.
**Parametreler**:
- name: body, type: unknown — JSON formatına dönüştürülerek cevap gövdesi olarak kullanılacak, herhangi bir tipte içerik verisi
- name: init, type: ResponseInit — HTTP cevabının durum kodu, özel başlıkları gibi ek yapılandırma ayarlarını içeren standart web ResponseInit nesnesi
**Dönüş**: Fonksiyona ait kesin dönüş tipi belirtilmemiştir, oluşturduğu JSON formatlı cevabı kullandığı ana işleyici fonksiyona iletmek üzere çalıştığı varsayılmaktadır.

### shipping-status_handler
**Ne yapar**: shipping-status edge function'ının ana istek işleyici fonksiyonudur, kargo durumu sorguları için istemciden gelen tüm HTTP isteklerini alır, işler ve uygun cevabı döndürür. VentHub projesinin kargo takip modülünün sunucu tarafı çalışmasının temelini oluşturan bu fonksiyon, tüm gelen istekleri doğrulayıp ilgili iş akışını başlatır.
**Nasıl yapar**: Gelen HTTP Request nesnesini ayrıştırarak isteğin metodunu, gönderilen sorgu parametrelerini veya istek gövdesini kontrol eder, gerekli yetkilendirme ve veri doğrulama adımlarını tamamladıktan sonra ilgili kaynaktan kargo durum verisini çeker. jsonResponse yardımcı fonksiyonunu kullanarak aldığı veriyi standart JSON formatında istemciye iletecek şekilde HTTP cevabını oluşturur ve döndürür.
**Parametreler**:
- name: req, type: Request — İstemciden gelen HTTP isteğinin tüm detaylarını (url, istek metodu, başlıklar, gövde verisi) içeren standart web Request nesnesi
**Dönüş**: İşlenen isteğe ait tüm bilgileri ve kargo durumu verisini içeren standart HTTP Response nesnesi döndürür, bu cevap istemciye iletilmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: shipping-status/functions/jsonResponse
- **params**: body, init
- **ic_degiskenler**: 
  - `yok` — fonksiyon gövdesinde ek bir değişken tanımı yoktur; sadece parametreler kullanılır.
- **Dönüş**: Response

### [N2_NASIL] AST Pointer: shipping-status/functions/shipping-status_handler
- **params**: req
- **ic_degiskenler**: 
  - `SUPABASE_URL` — `Deno.env.get('SUPABASE_URL')` ile ortam değişkeninden alınan Supabase proje URL’si.
  - `SERVICE_KEY` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile ortam değişkeninden alınan Supabase service role anahtarı.
  - `forwarded` — `req.headers.get('x-forwarded-for')` değeri (boş string olabilir); IP‑based rate limiting için kullanılır.
  - `ip` — İstemci IP adresi; `x-real-ip`, `cf-connecting-ip` veya `forwarded` başlığından türetilir, bulunamazsa `'unknown'`.
  - `key` — Rate‑limit anahtarı; `"shipping-status:${ip}"` biçiminde IP’ye özgü bir önbellek anahtarı.
  - `checkRateLimit` — `../_shared/rate_limit.ts` modülünden içe aktarılan, belirtilen anahtar için sınır kontrolünü yapan async fonksiyon.
  - `rateLimitHeaders` — Aynı modülden içe aktarılan, mevcut sınır durumunu yansıttı HTTP başlıkları oluştururan fonksiyon.
  - `result` — `checkRateLimit` çağrısının döndürdüğü nesne; `{ allowed, remaining, resetAt }` alanlarını içerir.
  - `rlHeaders` — `rateLimitHeaders` fonksiyonuyla üretilen, 429 (Too Many Requests) yanıtına eklenmek üzere hazırlanan başlık nesnesi.
  - `e` — İç try/catch bloğunda yakalanan hata; rate_limit modülü yükleme veya çalıştırma hatasını loglamak için kullanılır.
  - `url` — `new URL(req.url)` ile oluşturulan URL nesnesi; sorgu parametrelerine erişim sağlar.
  - `tracking` — `url.searchParams.get('tracking_number')` değeri (boş string olabilir); kullanıcı tarafından sağlanan takip numarası.
  - `supabase` — `createClient(SUPABASE_URL, SERVICE_KEY)` ile oluşturulan Supabase istemci örneği.
  - `query` — `supabase.from('venthub_orders')` ile başlayan ve `select`, `eq`, `limit` zincirleme işlemleriyle oluşturulan sorgu oluşturucusu.
  - `data` — `query.single()` çağrısının başarılı sonucunda döndürülen kayıt nesnesi (order bilgileri) veya `null`.
  - `error` — `query.single()` çağrısının hata durumunda döndürülen Supabase hata nesnesi.
  - `_e` — Dış try/catch bloğunda yakalanan genel istisna; hata yanıtı üretmek ve konsola loglamak için kullanılır.
- **Dönüş**: Response (her kod yolu `jsonResponse` üzerinden bir `Response` nesnesi döndürür)

---

## NODE ID STANDARD

  file: supabase\functions\shipping-status\index.ts
  function: supabase\functions\shipping-status\index.ts::jsonResponse
  function: supabase\functions\shipping-status\index.ts::shipping-status_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: jsonResponse
  export: shipping-status_handler