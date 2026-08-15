---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\shipping-status\index.ts
skeleton_hash: c75e333122af75fd
entity_hashes:
  func:jsonResponse: 60e54d50747b3229
  func:shipping-status_handler: d099b53accac2970
  overview: 41fd0f2fe1f6fb98
generated_at: 2026-08-15T07:34:14Z
---

## Genel Bakış
Bu modül, kargo durumu sorgularını işleyen bir Supabase edge function olarak tasarlanmıştır. Gelen HTTP isteklerini alır, işler ve istemciye standart JSON formatında yanıt döndürür. Yanıt oluşturumunda tutarlılık için yardımcı bir fonksiyon kullanır.

## Fonksiyon Grupları
### Ana İstek İşleyicisi
Modülün ana giriş noktasıdır ve gelen kargo durumu isteklerini işleyerek nihai yanıtı üretir.
- shipping-status_handler

### Yanıt Yardımcıları
HTTP yanıtlarını JSON formatında paketlemek için kullanılan yardımcı fonksiyonları içerir.
- jsonResponse

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function平台上 kargo durumu sorgularını işleyen bir HTTP istek handler'ıdır.

**[Aksiyom 1]:** Eğer `req` parametresi geçerli bir `Request` nesnesi değilse veya `null/undefined` ise, `shipping-status_handler` isteği işleyemez ve fonksiyon hata ile sonuçlanır.

**[Aksiyom 2]:** Eğer `jsonResponse` fonksiyonuna `body` parametresi olarak JSON-serializable olmayan bir değer verilirse, HTTP yanıt gövdesi oluşturulamaz ve istemci geçersiz bir yanıt alır.

**[Aksiyom 3]:** Eğer `shipping-status_handler` tarafından döndürülen `Response` nesnesi (`jsonResponse` veya doğrudan `Response` constructor ile) oluşturulamazsa, Supabase Edge Function runtime'ıvarsayılan bir hata yanıtı üretir.

**[Aksiyom 4]:** Eğer `jsonResponse` fonksiyonu çağrılmazsa ve handler doğrudan `new Response()` kullanarak JSON yanıtı döndürmeye çalışırsa, yanıt formatı tutarsız olur ve istemci tarafında parse hataları oluşabilir.

**[Aksiyom 5]:** Eğer `ResponseInit` parametresi (`init`) geçerli HTTP header veya status code içermiyorsa, döndürülen yanıt varsayılan `200 OK` durum kodu ile gönderilir.

---

> **Not:** Fonksiyon gövdeleri sağlandığında (örn: request body parsing, auth kontrolü, veritabanı sorgusu mantığı), aksiyomlar genişletilebilir ve veri doğrulama eşikleri, yetkilendirme gereksinimleri gibi domain-specific kurallar eklenebilir.

---

## FONKSİYON DETAYLARI

### jsonResponse
**Ne yapar**: Verilen veriyi JSON formatına dönüştürerek standart bir HTTP yanıtı oluşturur. Bu bir yardımcı fonksiyondur ve genellikle API uç noktalarından gönderilecek tutarlı ve doğru formatta yanıtları paketlemek için kullanılır.
**Nasıl yapar**: Fonksiyon, `JSON.stringify` metodu ile verilen `body` nesnesini iki boşluk girintili bir JSON dizgesine dönüştürür. Ardından, `new Response` constructor'ı ile bu dizgeyi gövde olarak, varsayılan `content-type` ve `cache-control` başlıklarını içeren, isteğe bağlı olarak其他 başlıklar ve durum kodu eklenebilen bir HTTP yanıtı nesnesi döndürür.
**Parametreler**:
- `body`: unknown — Yanıtın gövdesinde yer alacak olan veri. Fonksiyon tarafından JSON dizgesine dönüştürülür.
- `init`: ResponseInit — Response nesnesinin yapılandırma seçeneklerini içeren isteğe bir nesne. `headers` ve `status` özellikleri desteklenir. Varsayılan değer `{}`.
**Dönüş**: Response — Oluşturulan HTTP yanıtı nesnesi.

### shipping-status_handler
**Ne yapar**: shipping-status edge function'ının ana istek işleyici fonksiyonudur, kargo durumu sorguları için istemciden gelen tüm HTTP isteklerini alır, işler ve uygun cevabı döndürür. VentHub projesinin kargo takip modülünün sunucu tarafı çalışmasının temelini oluşturan bu fonksiyon, tüm gelen istekleri doğrulayıp ilgili iş akışını başlatır.
**Nasıl yapar**: Gelen HTTP Request nesnesini ayrıştırarak isteğin metodunu, gönderilen sorgu parametrelerini veya istek gövdesini kontrol eder, gerekli yetkilendirme ve veri doğrulama adımlarını tamamladıktan sonra ilgili kaynaktan kargo durum verisini çeker. jsonResponse yardımcı fonksiyonunu kullanarak aldığı veriyi standart JSON formatında istemciye iletecek şekilde HTTP cevabını oluşturur ve döndürür.
**Parametreler**:
- name: req, type: Request — İstemciden gelen HTTP isteğinin tüm detaylarını (url, istek metodu, başlıklar, gövde verisi) içeren standart web Request nesnesi
**Dönüş**: İşlenen isteğe ait tüm bilgileri ve kargo durumu verisini içeren standart HTTP Response nesnesi döndürür, bu cevap istemciye iletilmek üzere kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointers: supabase/functions/shipping-status/index.ts::jsonResponse
- **params**: `body: unknown` — Döndürülecek JSON verisi, `init: ResponseInit` — Response nesnesi için ek ayarlar (varsayılan: {})
- **ic_degiskenler**: (yok — parametreler doğrudan kullanılır)
- **Dönüş**: `Response` — JSON verisini içeren HTTP Response nesnesi

### [N2_NASIL] AST Pointer: supabase/functions/shipping-status/index.ts::shipping-status_handler
- **params**: `req: Request` — Gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `SUPABASE_URL` — Ortam değişkeninden alınan Supabase projesi URL'i
  - `SERVICE_KEY` — Ortam değişkeninden alınan Supabase servis rolü anahtarı
  - `forwarded` — x-forwarded-for header değerinden istemci IP adreslerini ayırır
  - `ip` — İstemcinin gerçek IP adresi (birden fazla header'dan deneyerek)
  - `key` — Rate limiting için benzersiz anahtar (IP adresine göre)
  - `checkRateLimit` — Dinamik import ile yüklenen rate limiting kontrol fonksiyonu
  - `rateLimitHeaders` — Dinamik import ile yüklenen rate limiting başlıkları oluşturma fonksiyonu
  - `url` — İsteğin URL nesnesi, query parametrelerini okumak için
  - `tracking` — URL'den alınan tracking_number parametresi
  - `supabase` — Supabase istemcisi (createClient ile oluşturulan)
  - `query` — Supabase sorgu nesnesi (venthub_orders tablosundan veri çekmek için)
  - `data` — Sorgu sonucundan gelen sipariş verileri
  - `error` — Sorgu sonucundan gelen hata nesnesi
  - `_e` — Try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: `Response` — JSON yanıt nesnesi

---

## NODE ID STANDARD

  file: supabase\functions\shipping-status\index.ts
  function: supabase\functions\shipping-status\index.ts::jsonResponse
  function: supabase\functions\shipping-status\index.ts::shipping-status_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: jsonResponse
  export: shipping-status_handler