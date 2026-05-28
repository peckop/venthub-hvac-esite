---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\shipping-notification\index.ts
skeleton_hash: ac9d43fe59818021
entity_hashes:
  func:loadShippingTemplate: 4b4a832183734352
  func:renderTemplate: 26cc0a301db3fae9
  func:shipping-notification_handler: 06ce613108984be4
  overview: 6415456e6af3190a
generated_at: 2026-05-28T22:49:38Z
---

## Genel Bakış
Bu modül, kargo bildirimlerinin otomatik olarak hazırlanmasını ve HTTP istekleri üzerinden sunulmasını sağlar. Şablon dosyalarını dinamik olarak yükler, verilerle birleştirerek bildirim içeriği üretir ve gelen isteklere bu içerikle yanıt verir.

## Fonksiyon Grupları
### Şablon Yönetimi
Depolama alanından gerekli kargo bildirim şablonunu getirir ve metin içindeki yer tutucuları, sağlanan veri setine göre dinamik olarak doldurarak nihai bildirim metnini üretir.
- loadShippingTemplate, renderTemplate

### Ana İşleyici ve Koordinasyon
Gelen HTTP isteklerini karşılar, şablon yükleme ve işleme adımlarını yönetir. Tüm sürecin sonucu olarak oluşturulan bildirim içeriğini ve durum kodlarını paketleyerek istemciye uygun bir HTTP yanıtı döndürür.
- shipping-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kargo bildirimlerini oluşturmak için şablon tabanlı bir içerik üretim mekanizması kullanır ve HTTP isteklerini işleyerek yanıt üretir.

[Aksiyom 1]: Eğer `renderTemplate` fonksiyonuna `tpl` parametresi olarak geçerli bir string verilmezse, şablon işleme başarısız olur ve geçersiz çıktı üretilir.

[Aksiyom 2]: Eğer `renderTemplate` fonksiyonuna `data` parametresi olarak `Record<string, unknown>` yapısında bir nesne verilmezse, şablon içindeki veri alanları doğru şekilde doldurulamaz.

[Aksiyom 3]: Eğer `loadShippingTemplate` fonksiyonu tarafından erişilebilir bir depolama alanı (storage) mevcut değilse veya kargo şablonu dosyası depolama alanında bulunmuyorsa, fonksiyon gerekli şablonu yükleyemez.

[Aksiyom 4]: Eğer `shipping-notification_handler` fonksiyonuna geçerli bir HTTP istek nesnesi (`req`) verilmezse, istek işlenemez ve uygun hata yanıtı üretilmesi gerekir.

[Aksiyom 5]: Eğer `loadShippingTemplate`成功 ile çalışırsa, `renderTemplate` tarafından işlenebilir bir şablon dizesi (string) döndürmesi beklenir.

[Aksiyom 6]: Eğer `shipping-notification_handler`fonksiyonu içinde şablon yükleme başarısız olursa, handler'ın hata durumunu idare ederek istemciye uygun bir HTTP hata yanıtı (ör. 500) dönmesi gerekir.

---

## FONKSİYON DETAYLARI

### renderTemplate
**Ne yapar**: Bu fonksiyon, bir şablon dizesi içindeki değişkenleri ve koşullu blokları, sağlanan bir veri nesnesindeki değerlerle değiştirerek dinamik bir çıktı üretir. Temel olarak basit bir şablon motoru görevi görür.

**Nasıl yapar**: Fonksiyon, iki aşamalı bir string değiştirme işlemi uygular. İlk olarak, `{{#if key}}...{{/if}}` sözdizimindeki koşullu blokları işler: `key` değerinin varlığını ve truthy olup olmadığını kontrol eder, doğru ise bloğun içeriğini korur, aksi halde boş string ile değiştirir. İkinci aşamada, kalan `{{key}}` değişkenlerini bulur ve veri nesnesindeki karşılık gelen değerle değiştirir; değer `null` veya `undefined` ise boş string kullanır.

**Parametreler**:
- `tpl`: string — Değiştirilecek olan şablon dizesi. İçerisinde `{{#if ...}}` blokları ve `{{...}}` değişken yer tutucuları bulunabilir.
- `_data`: Record<string, unknown> — Şablondaki yer tutucularla eşleşecek anahtar-değer çiftlerini içeren veri nesnesi.

**Dönüş**: string — Değişkenlerin ve koşullu blokların işlendiği, sonuç şablon dizesi.

### loadShippingTemplate
**Ne yapar**: Bu asenkron fonksiyon, kargo bildirimleri için kullanılan bir HTML e-posta şablonunu dosya sisteminden yükler.

**Nasıl yapar**: Fonksiyon, çağrıldığı dosyanın bulunduğu dizine göreceli olarak `./templates/email/shipping.html` yolundaki dosyayı okumak için `Deno.readTextFile` yöntemini kullanır. Bir `URL` nesnesi oluşturarak doğru mutlak yolu hesaplar. Dosya okuma işlemi başarısız olursa (örn. dosya mevcut değilse), bir `try...catch` bloğu ile yakalanır ve `null` değeri döndürülür.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Promise<string | null> — Başarılı olursa HTML şablonunun içeriğini (string), başarısız olursa `null` değerini içeren bir promise.

### shipping-notification_handler
**Ne yapar**: Bu fonksiyon, kargo bildirimleriyle ilgili HTTP isteklerini işleyen bir sunucu işleyicisidir (handler). Gelen bir POST isteğini alır, ilgili iş mantığını yürütür ve bir HTTP yanıtı döndürür.

**Nasıl yapar**: Fonksiyonun gövdesi verilmemiştir; bu nedenle iç mantığı hakkında kesin bir bilgi bulunmamaktadır. Ancak imzasından ve adından yola çıkarak, bu fonksiyonun bir web framework'ün (örn. Deno Oak, Hono) istek işleyici (request handler) yapısında olduğu ve `Request` nesnesini `Response` nesnesine dönüştürdüğü çıkarılabilir. Fonksiyonun, bir kargo durumu güncellendiğinde tetiklenen bir webhook veya API endpoint'i işlediği varsayılabilir.

**Parametreler**:
- `req`: Request — Gelen HTTP istek nesnesi. İstek gövdesi, başlıkları ve URL parametrelerini içerir.

**Dönüş**: Response — İşlenen istekle ilgili HTTP yanıt nesnesi. Durum kodu, başlıklar ve opsiyonel bir gövde (örn. JSON yanıtı) içerebilir.

---

## INTERFACES

### ShippingNotificationRequest
- `order_id: string`
- `customer_email: string`
- `customer_name: string`
- `order_number?: string`
- `carrier: string`
- `tracking_number: string`
- `tracking_url?: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: shipping-notification/index.ts::renderTemplate
- **params**: (tpl: string, _data: Record<string, unknown>)
- **ic_degiskenler**:
  - `_m` — `replace` metoduna sağlanan eşleşme nesnesi (gerçekte kullanılmaz).
  - `key` — if-blok veya değişken kalıbından çıkarılan anahtar adı (örn. `customer_name`).
  - `inner` — if-blok kalıbının içeriği, sadece ilgili `_data[key]`_truthy ise korunur.
  - `v` — `_data[key]` değerini temsil eder, hem if-blok mantık kontrolünde hem de değişken değiştirme için kullanılır.
  - `truthy` — `v` değerinin truthy (gerçeğe dönüştürülebilir) olup olmadığını belirler; if-blok içeriğinin basılıp basılmayacağına karar verir.
- **Dönüş**: string (işlenmiş şablon)

### [N2_NASIL] AST Pointer: shipping-notification/index.ts::loadShippingTemplate
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `url` — Şablon dosyasının (`shipping.html`) tam dosya yolunu temsil eden URL nesnesi; `import.meta.url` referansıyla göreceli yolu çözer.
- **Dönüş**: Promise<string | null> (şablon içeriği veya okuma hatalanırsa null)

### [N3_NASIL] AST Pointer: shipping-notification/index.ts::shipping-notification_handler
- **params**: (req)
- **ic_degiskenler**:
  - `requestOrigin` — Gelen HTTP isteğinin `Origin` başlığından alınan değer; CORS izinleri için kontrol edilir.
  - `requestHeaders` — `Access-Control-Request-Headers` başlığından alınan değer; CORS yanıt başlıklarında kullanılır.
  - `requestMethod` — `Access-Control-Request-Method` başlığından alınan değer; CORS yanıt başlıklarında kullanılır.
  - `allowedOrigins` — `ALLOWED_ORIGINS` ortam değişkeninden virgülle ayrılmış izin verilen orijinler dizisi; boşsa tüm orijinlere izin verilir.
  - `originAllowed` — `requestOrigin` değerinin `allowedOrigins` dizisinde bulunup bulunmadığını veya listenin boş olup olmadığını belirten mantıksal değer.
  - `corsHeaders` — CORS ile ilgili tüm yanıt başlıklarını içeren nesne.
  - `body` — İstek gövdesinden (`req.json()`) parse edilmiş `ShippingNotificationRequest` nesnesi.
  - `order_id` — `body` nesnesinden destructure edilen sipariş kimliği.
  - `customer_email` — `body` nesnesinden destructure edilen müşteri e-posta adresi.
  - `customer_name` — `body` nesnesinden destructure edilen müşteri adı.
  - `carrier` — `body` nesnesinden destructure edilen kargo firması adı.
  - `tracking_number` — `body` nesnesinden destructure edilen kargo takip numarası.
  - `tracking_url` — `body` nesnesinden destructure edilen kargo takip URL'si.
  - `order_number` — `body` nesnesinden destructure edilen sipariş numarası (başlangıçta tanımsız olabilir, sonradan çözümlenir).
  - `missing` — Doğrulamada eksik olan alanların isimlerini tutan dizi; hata yanıtı için kullanılır.
  - `SUPABASE_URL` — `SUPABASE_URL` ortam değişkeninden alınan veritabanı URL'si.
  - `SERVICE_KEY` — `SUPABASE_SERVICE_ROLE_KEY` ortam değişkeninden alınan servis anahtarı; yetkilendirme ve veritabanı istekleri için kullanılır.
  - `authHeader` — Gelen isteğin `Authorization` başlığı.
  - `isAuthorized` — Kullanıcının yetkili olup olmadığını belirten mantıksal bayrak; başlangıçta `false`.
  - `anonKey` — `SUPABASE_ANON_KEY` ortam değişkeninden alınan anonim anahtar; `createClient` için kullanılır.
  - `authClient` — Supabase istemcisi; kullanıcı kimlik doğrulaması için kullanılır.
  - `roleCheck` — Kullanıcı rolünü kontrol etmek için `user_profiles` tablosuna yapılan fetch isteğinin yanıtı.
  - `arr` — `roleCheck` yanıtından parse edilen JSON dizisi (kullanıcı profil verisi).
  - `role` — `arr[0]` nesnesinden alınan kullanıcı rolü; `admin` veya `superadmin` ise yetki verilir.
  - `RESEND_API_KEY` — `RESEND_API_KEY` ortam değişkeninden alınan Resend API anahtarı; e-posta gönderimi için kullanılır.
  - `EMAIL_FROM` — `EMAIL_FROM` ortam değişkeninden alınan gönderici e-posta adresi.
  - `o` — Sipariş numarasını çözmek için `venthub_orders` tablosuna yapılan fetch isteğinin yanıtı.
  - `prettyOrderNo` — Kullanıcıya gösterilecek biçimlendirilmiş sipariş numarası (örn. `#123`); `order_number` varsa ondan, yoksa `order_id`'den üretilir.
  - `subject` — E-posta konu başlığı.
  - `html` — E-posta gövdesinin HTML içeriği; şablon yüklenemezse inline olarak oluşturulur, yüklenirse `renderTemplate` ile işlenir.
  - `resp` — Resend API'sine gönderilen e-posta isteğinin yanıtı.
  - `result` — `resp` yanıtından parse edilen JSON sonucu; başarılı gönderim bilgisini içerir.
  - `error` — `catch` bloğunda yakalanan hata nesnesi; hata mesajı olarak kullanılır.
  - `msg` — `error` nesnesinden çıkarılan hata mesajı dizesi.
- **Dönüş**: Response (JSON başarı/hata yanıtı)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    index_ts__loadShippingTemplate["loadShippingTemplate"]
    index_ts__renderTemplate["renderTemplate"]
    index_ts__shipping-notification_handler["shipping-notification_handler"]
```

## NODE ID STANDARD

  file: supabase\functions\shipping-notification\index.ts
  function: supabase\functions\shipping-notification\index.ts::renderTemplate
  function: supabase\functions\shipping-notification\index.ts::loadShippingTemplate
  function: supabase\functions\shipping-notification\index.ts::shipping-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadShippingTemplate
  export: renderTemplate
  export: shipping-notification_handler