---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\delivery-notification\index.ts
skeleton_hash: 43bb5a40d783a90f
entity_hashes:
  func:delivery-notification_handler: bbc4a3cdb5561a07
  func:loadTemplate: 4c5f3a8524c0bb12
  func:render: b6f065ff28ae59f4
  overview: 2a9f927139118f99
generated_at: 2026-05-28T22:43:39Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak teslimat tamamlandığında müşterilere otomatik e‑posta bildirimi göndermekten sorumludur. Sipariş bilgilerini veritabanından çeker, önceden hazırlanmış şablonları bu verilerle dinamik olarak doldurur ve harici bir e‑posta servisi üzerinden mesajı iletir; tüm işlem ise denetim ve loglama amaçlı kaydedilir.

## Fonksiyon Grupları
### Şablon İşleme
Bu grup, e‑posta içeriğinin hazırlanmasıyla ilgili işlevleri kapsar. Dosya sisteminden şablon yüklenmesini ve bu şablonların sipariş verileriyle doldurulmasını sağlar.
- render, loadTemplate

### Ana İstek İşleyici
Bu grup, modülün dış dünya ile tek temas noktasıdır. Gelen HTTP isteklerini yönetir, iş akışını (veri çekme, şablon hazırlama, e‑posta gönderimi ve loglama) koordine eder.
- delivery-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için gerekli mimari varsayımlar, fonksiyon imzaları ve dokümandan elde edilen yapısal bilgilere dayanarak aşağıdaki gibi belirlenmiştir:

**[Aksiyom 1]**: Eğer `loadTemplate()` çağrıldığında erişilebilir bir şablon dosyası (tpl) yoksa, `render` fonksiyonuna geçerli bir şablon dizesi (string) iletilemez ve e-posta içeriği oluşturulamaz.

**[Aksiyom 2]**: Eğer `delivery-notification_handler` fonksiyonuna iletilen `req` nesnesi, işlenmek için gerekli verileri (örn: teslimat/sipariş tanımlayıcıları) içermiyorsa, sipariş verileri veritabanından başarıyla çekilemez ve bildirim gönderimi başarısız olur.

**[Aksiyom 3]**: Eğer `render(tpl, _data)` fonksiyonuna iletilen `_data` parametresi, şablon dizesinde (`tpl`) referans verilen tüm alanları içermiyorsa, şablon tutarsız veya eksik doldurulur.

**[Aksiyom 4]**: Eğer e-posta gönderimi için kullanılan harici e-posta servisi (SMTP/API) yapılandırılmamış veya erişilemez durumdaysa, `delivery-notification_handler` tarafından tetiklenen bildirim gönderimi başarısız olur.

**[Aksiyom 5]**: Eğer teslimat olayı tetiklendiğinde, ilgili sipariş/teslimat kaydı veritabanında mevcut değilse veya erişilemezse, bildirim için gerekli sipariş verileri alınamaz ve iş akışı durur.

---

## FONKSİYON DETAYLARI

### render
**Ne yapar**: Verilen bir şablon dizesindeki `{{anahtar}}` yapısındaki yer tutucuları, sağlanan veri nesnesindeki karşılıkları ile değiştirerek dinamik bir çıktı oluşturur.
**Nasıl yapar**: `String.prototype.replace` metodunu bir regex ile kullanarak `{{(\w+)}}` kalıplarını tespit eder. Eşleşen anahtarın (`k`) veri nesnesinde (`_data`) karşılığını arar ve bulamazsa boş bir dize kullanarak değişikliği uygular. Bu işlem, şablon motorları için basit bir değişken ekleme (interpolation) mekanizması sağlar.
**Parametreler**:
- `tpl`: string — Değiştirilecek şablon dizesi. İçerisinde `{{değişken_adı}}` formatında yer tutucular bulunmalıdır.
- `_data`: Record<string, unknown> — Şablondaki yer tutucuların değerlerini içeren nesne. Anahtarlar yer tutucu adlarıyla, değerler ise yerine konacak verilerle eşleşmelidir.
**Dönüş**: string — Yer tutucuların veri ile değiştirildiği yeni şablon dizesi.

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

## INTERFACES

### DeliveryRequest
- `order_id: string`
- `customer_email?: string`
- `customer_name?: string`
- `order_number?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::render
- **params**: `tpl` — şablon metni (string), `_data` — anahtar-değer çiftlerini içeren sözlük (Record<string, unknown>)
- **ic_degiskenler**:
  - Fonksiyon gövdesinde params dışında tanımlı iç değişken yoktur; `tpl.replace(...)` ifadesi doğrudan return edilir
- **Dönüş**: string — `{{anahtar}}` ifadelerinin `_data` sözlüğündeki değerlerle değiştirildiği şablon metni

### [N2_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::loadTemplate
- **params**: yok
- **ic_degiskenler**:
  - `url` — `import.meta.url` referansıyla oluşturulan URL nesnesi; `./templates/email/delivered.html` dosyasının mutlak yolunu temsil eder
- **Dönüş**: string | null — dosya başarıyla okunursa HTML içeriği, başarısız olursa null

### [N3_NASIL] AST Pointer: supabase/functions/delivery-notification/index.ts::delivery-notification_handler
- **params**: `req` — gelen HTTP isteği (Request)
- **ic_degiskenler**:
  - `origin` — istek header'ından alınan ORIGIN değeri; yoksa `'*'` (CORS header'ı için kullanılır)
  - `corsHeaders` — CORS ile ilgili tüm header'ları tutan nesne; Access-Control-Allow-Origin, Vary, Allow-Headers, Allow-Methods, Max-Age içerir
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile okunan Supabase servis URL'i
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan servis rolü anahtarı
  - `authHeader` — istekten okunan Authorization header değeri (string veya null)
  - `isAuthorized` — yetkilendirme durumunu tutan boolean bayrak; başlangıçta false
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan Supabase anonim anahtarı
  - `authClient` — `createClient` ile oluşturulan geçici Supabase istemcisi; istemci tarafı token ile kimlik doğrulaması yapmak için kullanılır
  - `user` — `authClient.auth.getUser()` sonucundan destructure edilen kullanıcı nesnesi
  - `roleCheck` — Supabase REST API üzerinden `user_profiles` tablosunda rol sorgulama isteği sonucu (Response nesnesi)
  - `arr` (birinci kullanım) — `roleCheck.json()` sonucunun catch ile boş diziye fallback eden hali; kullanıcının profil satırlarını tutar
  - `role` — `arr[0]?.role` erişimi ile elde edilen kullanıcının rol değeri (admin, superadmin veya diğer)
  - `resendApiKey` — `Deno.env.get('RESEND_API_KEY')` ile okunan Resend e-posta servisi API anahtarı
  - `emailFrom` — `Deno.env.get('EMAIL_FROM')` ile okunan e-posta gönderici adresi; varsayılan `'VentHub <onboarding@resend.dev>'`
  - `body` — `req.json()` ile parse edilen istek gövdesi (DeliveryRequest tipinde)
  - `order_id` — `body.order_id` — teslimat bildirimi yapılacak siparişin benzersiz ID'si
  - `customer_email` — `body.customer_email` — müşteri e-posta adresi; eksikse veritabanından türetilir
  - `customer_name` — `body.customer_name` — müşteri tam adı; eksikse veritabanından türetilir
  - `order_number` — `body.order_number` — sipariş numarası; eksikse veritabanından türetilir
  - `o` — Supabase REST API üzerinden `venthub_orders` tablosunda sipariş bilgisi sorgulama isteği sonucu (Response)
  - `arr` (ikinci kullanım) — `o.json()` sonucunun catch ile boş diziye fallback eden hali; sipariş satırlarını tutar
  - `row` — `Array.isArray(arr) ? arr[0] : null` ile elde edilen ilk sipariş satırı nesnesi veya null; order_number, customer_name, customer_email alanlarını içerir
  - `prettyOrderNo` — insan tarafından okunabilir sipariş numarası; order_number varsa `#${order_number.split('-')[1]}`, yoksa sipariş ID'nin son 8 karakterinin büyük harfli hali
  - `subject` — e-posta konu satırı; `"Siparişiniz teslim edildi - {prettyOrderNo}"` formatında
  - `html` — gönderilecek e-postanın HTML içeriği; önce `loadTemplate()` ile yüklenir, başarısız olursa dizi.join ile satır satır oluşturulur
  - `resp` — `https://api.resend.com/emails` adresine POST isteği ile gönderilen e-posta gönderim sonucu (Response)
  - `t` — `resp._text()` ile okunan hata yanıtı metni; send_failed durumunda hata detayı olarak kullanılır
  - `result` — `resp.json()` ile parse edilen Resend API yanıt nesnesi; `result?.id` alanını içerir
  - `msg` — outer catch bloğunda yakalanan `_e` hatasının message değeri; Error ise `.message`, değilse `String(_e)` ile elde edilir
- **Dönüş**: Response — JSON gövdeli HTTP yanıtı; başarılı teslimde `{ ok: true, order_id, subject, result }`, hata durumunda `{ error: msg }` veya `{ error: 'method_not_allowed' }` veya `{ error: 'missing_fields', missing: [...] }` veya `{ error: 'customer_info_missing' }` veya `{ error: 'Unauthorized' }` veya `{ disabled: true }` veya `{ error: 'send_failed', body: t }` döner

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