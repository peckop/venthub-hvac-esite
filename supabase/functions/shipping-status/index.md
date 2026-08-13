---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\shipping-status\index.ts
skeleton_hash: 3b569cae7979ec9d
entity_hashes:
  func:jsonResponse: 60e54d50747b3229
  func:shipping-status_handler: d099b53accac2970
  overview: 695bc1e855ae9226
generated_at: 2026-08-13T07:40:32Z
---

## Genel Bakış
Bu modül, kargo durumu sorgularını karşılayan bir Supabase edge function'dır. Gelen HTTP isteklerini işleyerek yapılandırılmış JSON yanıtları döndürür ve yanıt oluşturımında tutarlılık sağlamak için bir yardımcı işlev kullanır.

## Fonksiyon Grupları
### İstek İşleyicisi
Modülün ana giriş noktasıdır ve gelen kargo durumu isteklerini alarak işler, nihai yanıtı istemciye iletir.
- shipping-status_handler

### Yanıt Oluşturma Yardımcıları
HTTP yanıtlarını JSON formatında standartlaştırmak için kullanılan yardımcı işlevi içerir.
- jsonResponse

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kargo durumu sorgularını işleyen bir Supabase Edge Function olarak tasarlanmıştır.

[Aksiyom 1]: Eğer `shipping-status_handler` fonksiyonuna geçilen `req` parametresi geçerli bir `Request` nesnesi değilse, fonksiyon beklenmeyen davranış sergiler veya hata fırlatır.

[Aksiyom 2]: Eğer `jsonResponse` fonksiyonuna geçilen `init` parametresi geçerli bir `ResponseInit` nesnesi değilse, yanıt oluşturulamaz.

[Aksiyom 3]: Eğer `shipping-status_handler` tarafından üretilen yanıt `jsonResponse` aracılığı ile döndürülmezse, istemciye standart JSON formatında yanıt ulaştırılamaz.

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
- import: https://esm.sh/@supabase/supabase-js@2::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: shipping-status/index.ts::jsonResponse
- **params**: (body: unknown, init: ResponseInit = {})
- **ic_degiskenler**:
  (fonksiyon gövdesinde açıkça tanımlanmış yerel değişken yok)
- **Dönüş**: Response — JSON içeriği ile HTTP yanıt nesnesi oluşturur ve döndürür.

### [N2_NASIL] AST Pointer: shipping-status/index.ts::shipping-status_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `SUPABASE_URL` — Deno ortamından alınan Supabase proje URL adresi.
  - `SERVICE_KEY` — Deno ortamından alınan Supabase servis rolü anahtarı.
  - `forwarded` — İstemcinin yönlendirme (forwarded-for) IP adresi başlığı değeri.
  - `ip` — İstemcinin gerçek IP adresi, various başlıklardan çözümlenir.
  - `key` — IP tabanlı rate limiting için benzersiz anahtar.
  - `result` — checkRateLimit fonksiyonunun döndüğü sonuç nesnesi, istek izin durumunu içerir.
  - `rlHeaders` — rateLimitHeaders fonksiyonu tarafından oluşturulan HTTP başlık nesnesi.
  - `url` — Request URL'sinden oluşturulan URL nesnesi, sorgu parametrelerine erişim sağlar.
  - `tracking` — Sorgu parametrelerinden alınan kargo takip numarası.
  - `supabase` — createClient ile oluşturulmuş Supabase istemci nesnesi.
  - `query` — Supabase veritabanı sorgusu, belirli takip numarasına ait sipariş bilgilerini seçer.
  - `data` — Supabase sorgusunun başarılı sonucu, sipariş veri nesnesi.
  - `error` — Supabase sorgusunun hata nesnesi, sorgu başarısız olduğunda dolu olur.
  - `_e` — Yakalanan genel hata nesnesi, try-catch bloğunda yakalanır.
- **Dönüş**: Response — Kargo durumu bilgisi veya hata mesajı ile HTTP yanıt nesnesi döndürür.

---

## NODE ID STANDARD

  file: supabase\functions\shipping-status\index.ts
  function: supabase\functions\shipping-status\index.ts::jsonResponse
  function: supabase\functions\shipping-status\index.ts::shipping-status_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: jsonResponse
  export: shipping-status_handler