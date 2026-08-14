---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\delivery-notification\index.ts
skeleton_hash: 6a8a5c8b24439021
entity_hashes:
  func:delivery-notification_handler: bbc4a3cdb5561a07
  func:loadTemplate: ca2a7b2c95dee67d
  func:render: 92bef16402e292d5
  overview: d34e01c15bff1856
generated_at: 2026-08-14T12:38:55Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak sipariş teslimatı tamamlandığında müşteriye otomatik e-posta bildirimi göndermekle yükümlüdür. Sipariş bilgilerini veritabanından çeker, dinamik bir şablonla e-posta içeriğini oluşturur ve harici bir e-posta servisi aracılığıyla mesajı iletir; süreç boyunca hata yönetimi ve loglama gerçekleştirilir.

## Fonksiyon Grupları
### Şablon İşleme
E-posta içeriğinin hazırlanmasıyla ilgili yardımcı işlevleri barındırır. Dosya sisteminden gerekli şablonun yüklenmesini ve bu şablonun sipariş verisiyle birleştirilerek son metnin elde edilmesini sağlar.
- render, loadTemplate

### Ana İstek İşleyici
Modülün dışarıya açılan ana giriş noktasıdır. Gelen HTTP isteğini alarak tüm iş akışını (veritabanı sorgulama, şablon hazırlama, e-posta gönderimi ve loglama) yönetir ve sonuç olarak bir HTTP yanıtı döner.
- delivery-notification_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir Supabase Edge Function olarak teslimat tamamlandığında otomatik e-posta bildirimi göndermek için tasarlanmıştır. Aşağıdaki mimari varsayımlar, fonksiyon imzaları ve modülün temel amacına dayanarak tanımlanmıştır.

[Aksiyom 1]: Eğer `render` fonksiyonuna geçerli bir şablon string'i (`tpl`) ve veri sözlüğü (`_data`) sağlanmazsa, şablon işleme başarısız olur.
[Aksiyom 2]: Eğer `loadTemplate` fonksiyonu dosya sisteminden gerekli şablon dosyasını bulamazsa veya okuyamazsa, şablon yükleme hatası oluşur.
[Aksiyom 3]: Eğer `

---

## FONKSİYON DETAYLARI

### render

**Ne yapar**: Verilen string template içindeki `{{key}}` şeklindeki placeholder'ları, sağlanan veri objesindeki karşılık gelen değerlerle değiştirerek dinamik bir metin üretir. Bu fonksiyon, HTML e-posta şablonları gibi template dosyalarında değişken değerlerin yerleştirilmesi için kullanılır.

**Nasıl yapar**: JavaScript'in `String.prototype.replace` metodunu ve bir regular expression (`/{{(\w+)}}/g`) kullanır. Regex, iki küme içine alınmış herhangi bir kelime karakteri grubunu yakalar. Eşleşen her placeholder için `_data` objesinde ilgili anahtarı arar; değer varsa `String()` ile string'e çevirerek yerine koyar, yoksa boş string (`''`) kullanır. `g` flag'i sayesinde template içindeki tüm eşleşmeler tek seferde değiştirilir.

**Parametreler**:
- `tpl: string` — Değiştirme işleminin yapılacağı şablon metni. İçinde `{{anahtar}}` formatında placeholder'lar barındırır.
- `_data: Record<string, unknown>` — Placeholder'ların yerine koyulacak değerleri içeren anahtar-değer çiftlerinden oluşan obje. Değerler `unknown` tipinde olduğu için fonksiyon herhangi bir veri tipini kabul eder.

**Dönüş**: `string` — Placeholder'ların değerlerle değiştirildiği, hazır metin döndürür. Eşleşme bulunamayan placeholder'lar boş string ile değiştirilir.

### loadTemplate
**Ne yapar**: E-posta bildirimi için kullanılacak HTML şablonunu dosya sisteminden asenkron olarak yükler.
**Nasıl yapar**: `import.meta.url` referansını kullanarak `./templates/email/delivered.html` dosyasının tam yolunu bir `URL` nesnesine dönüştürür. Ardından Deno ortamının `readTextFile` fonksiyonu ile bu dosyanın içeriğini okur. Dosya bulunamazsa veya herhangi bir hata oluşursa, bir hata yakalama bloğu ile `null` değeri döndürerek uygulamanın çökmesini önler.
**Parametreler**: Parametre almaz.
**Dönüş**: Promise<string | null> — Başarılı olursa HTML şablonunun içeriğini, başarısız olursa `null` değerini döndürür.

### delivery-notification_handler
**Ne yapar**: Bir HTTP POST isteğini alır, istemciden gelen e-posta ve teslimat bilgilerini doğrular, şablonu doldurarak bir e-posta bildirim e-postası gönderir ve sonucu istemciye JSON yanıtı olarak döndürür.
**Nasıl yapar**: İsteğin gövdesini JSON olarak ayrıştırır ve `to` alanının varlığını kontrol eder. Eksikse 400 Bad Request yanıtı döner. `loadTemplate` ile şablonu yükleyemezse 500 Internal Server Error yanıtı döner. Şablonu `render` fonksiyonu ile gönderilen verilerle doldurur ve bir e-posta gönderimi için gerekli veri yapısını oluşturur (gerçek gönderim mantığı bu örnek kodda yer almaz). Son olarak, istemciye başarılı veya başarısız olduğu bilgisini içeren bir JSON yanıtı gönderir.
**Parametreler**:
- `req`: Request — Gelen HTTP istek nesnesi. Gövdesinde `to` (alıcı e-posta adresi), `subject` (konu) ve `data` (şablona eklenecek değişkenler) alanlarını içeren bir JSON nesnesi beklenir.
**Dönüş**: Promise<Response> — İşlem sonucuna göre farklı HTTP durum kodları ve JSON gövdeli bir Response nesnesi. Başarılı olursa `{ success: true, to: string, subject: string }`, başarısız olursa `{ success: false, error: string }` yapısında bir yanıt döner.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant_config.ts::getTenantBranding
- import: ../_shared/tenant_config.ts::resolveTenantId
- import: https://deno.land/std@0.168.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### DeliveryRequest
- `order_id: string`
- `customer_email?: string`
- `customer_name?: string`
- `order_number?: string`
- `tenant_id?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::render
- **params**: `(tpl: string, _data: Record<string, unknown>)`
- **ic_degiskenler**:
  - (yok — tek satırlık bir replace ifadesi)
- **Dönüş**: `String(_data[k] ?? '')` — tpl içindeki `{{key}}` placeholder'larını `_data` sözlüğündeki değerlerle değiştirilmiş nihai string
- **Dict/Subscript Erişimleri**:
  - `_data[k]` — template placeholder anahtarının `_data` sözlüğünden okunması

---

### [N2_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::loadTemplate
- **params**: `(yok)`
- **ic_degiskenler**:
  - `url` — `import.meta.url` referansıyla `./templates/email/delivered.html` dosyasının mutlak URL'i; `Deno.readTextFile` ile okunacak hedef
- **Dönüş**: `string | null` — dosya başarıyla okunursa HTML template içeriği, başarısız olursa `null`

---

### [N3_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::delivery-notification_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısıyla elde edilen CORS response header'ları, tüm yanıtlara eklenir
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'i, API çağrılarında kullanılır
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan service role anahtarı, Yetkilendirme ve DB çağrılarında kullanılır
  - `body` — `req.json()` ile parse edilen HTTP istek gövdesi (`DeliveryRequest` tipi)
  - `order_id` — `body.order_id` — teslim edilen siparişin ID'si
  - `customer_email` — `body.customer_email` — müşteri e-posta adresi (mutable, eksikse DB'den doldurulur)
  - `customer_name` — `body.customer_name` — müşteri adı (mutable, eksikse DB'den doldurulur)
  - `order_number` — `body.order_number` — sipariş numarası (mutable, eksikse DB'den doldurulur)
  - `tenantId` — `resolveTenantId(req, body)` ile çözümlenen kiracı ID'si, branding ve DB sorgularında kullanılır
  - `branding` — `getTenantBranding(tenantId)` ile alınan kiracıya özel marka bilgileri (emailFrom, brandName, brandPrimaryColor, brandLogoUrl)
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme header'ı
  - `isAuthorized` — boolean, kullanıcının yetkili olup olmadığını tutar, başlangıçta `false`
  - **--- auth fallback bloğu içinde (try-catch) ---**
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anon anahtar, fallback auth client oluşturulurken kullanılır
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi, kullanıcının token'ıyla kimlik doğrulama yapılır
  - `user` — `authClient.auth.getUser()` destructuring ile alınan kullanıcı nesnesi
  - `roleCheck` — `fetch(...)` ile `user_profiles` tablosundan rol sorgulama sonucu (Response)
  - `arr` — `roleCheck.json()` çözümlemesi — `arr[0]?.role` ile kullanıcının rolü alınır
  - `role` — `arr[0]?.role` — kullanıcının rolü (`admin` veya `superadmin` ise yetkilendirme başarılı)
  - **--- yetkilendirme sonrası ana blok ---**
  - `resendApiKey` — `Deno.env.get('RESEND_API_KEY')` ile alınan Resend API anahtarı, e-posta gönderimi için kullanılır
  - `emailFrom` — `branding.emailFrom` — kiracıya özel e-posta gönderici adresi
  - `o` — `fetch(...)` ile `venthub_orders` tablosundan sipariş bilgisi sorgulama sonucu (eksik alanları doldurmak için)
  - `arr` — `o.json()` çözümlemesi (farklı kapsamda aynı isim), sipariş satırları dizisi
  - `row` — `Array.isArray(arr) ? arr[0] : null` — ilk sipariş satırı; `row.order_number`, `row.customer_name`, `row.customer_email` ile eksik alanlar doldurulur
  - `brandName` — `branding.brandName` — marka adı, e-posta konusu ve HTML içeriğinde kullanılır
  - `brandPrimary` — `branding.brandPrimaryColor` — marka ana rengi, HTML içinde renk olarak kullanılır
  - `brandLogoUrl` — `branding.brandLogoUrl` — marka logo URL'i, template'e parametre olarak geçilir
  - `prettyOrderNo` — Formatlanmış sipariş numarası; `order_number` varsa `#` + ikinci parçası, yoksa son 8 karakterin büyük hali
  - `subject` — E-posta konu satırı: `${brandName} | Siparişiniz teslim edildi - ${prettyOrderNo}`
  - `html` — E-posta HTML gövdesi (mutable); `loadTemplate()` sonucuna göre ya şablondan render edilir ya da inline fallback HTML oluşturulur
  - `resp` — `fetch('https://api.resend.com/emails', ...)` çağrısının sonucu (Response), e-posta gönderim yanıtı
  - `t` — `resp.text()` ile alınan hata metni, `resp.ok` false ise hata detayı olarak döner
  - `result` — `resp.json()` çözümlemesi, Resend API yanıt gövdesi; `result?.id` audit kaydı için kullanılır
  - **--- catch bloğu ---**
  - `_e` — yakalanan hata nesnesi (unknown tipi)
  - `msg` — `_e` Error instance ise `_e.message`, değilse `String(_e)` — hata mesajı
- **Dönüş**: `Response` — HTTP yanıtı:
  - `200 + corsHeaders` — OPTIONS istekleri ve disabled/pasif durumlar
  - `405` — POST dışı methodlar
  - `401` — yetkisiz erişim
  - `400` — `order_id` eksik veya müşteri bilgileri eksik
  - `500` — Resend gönderim hatası veya genel exception
  - `200 { ok: true, order_id, subject, result }` — başarılı gönderim
- **Dict/Subscript Erişimleri**:
  - `body.order_id` — istek gövdesinden sipariş ID okuma
  - `body.customer_email` — istek gövdesinden müşteri e-postası okuma
  - `body.customer_name` — istek gövdesinden müşteri adı okuma
  - `body.order_number` — istek gövdesinden sipariş numarası okuma
  - `Deno.env.get('SUPABASE_URL')` — ortam değişkeninden Supabase URL okuma
  - `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` — ortam değişkeninden service role key okuma
  - `Deno.env.get('SUPABASE_ANON_KEY')` — ortam değişkeninden anon key okuma
  - `Deno.env.get('RESEND_API_KEY')` — ortam değişkeninden Resend API key okuma
  - `req.headers.get('Authorization')` — istek header'ından Authorization okuma
  - `authClient.auth.getUser()` — Supabase auth client üzerinden kullanıcı bilgisi alma
  - `arr[0]?.role` — roleCheck yanıt dizisinin ilk elemanından role okuma
  - `row.order_number` — sipariş satırından sipariş numarası okuma
  - `row.customer_name` — sipariş satırından müşteri adı okuma
  - `row.customer_email` — sipariş satırından müşteri e-postası okuma
  - `result?.id` — Resend API yanıtından mesaj ID okuma (audit kaydı için)
  - `order_number.split('-')[1]` — sipariş numarasından gösterimlik kısmı çıkarma
  - `order_id.slice(-8)` — sipariş ID'sinden son 8 karakteri gösterim için alma

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    index_ts__delivery-notification_handler["delivery-notification_handler"]
    index_ts__loadTemplate["loadTemplate"]
    index_ts__render["render"]
```

## NODE ID STANDARD

  file: supabase\functions\delivery-notification\index.ts
  function: supabase\functions\delivery-notification\index.ts::render
  function: supabase\functions\delivery-notification\index.ts::loadTemplate
  function: supabase\functions\delivery-notification\index.ts::delivery-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: delivery-notification_handler
  export: loadTemplate
  export: render