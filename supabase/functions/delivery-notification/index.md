---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\delivery-notification\index.ts
skeleton_hash: 187d307a4730bcbb
entity_hashes:
  func:delivery-notification_handler: bbc4a3cdb5561a07
  func:loadTemplate: 4c5f3a8524c0bb12
  func:render: b6f065ff28ae59f4
  overview: 67feee8fa1af924d
generated_at: 2026-05-29T11:42:58Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak teslimat tamamlandığında müşterilere otomatik e-posta bildirimi göndermekten sorumludur. Sipariş bilgilerini veritabanından çeker, önceden hazırlanmış şablonları bu verilerle dinamik olarak doldurur ve harici bir e-posta servisi üzerinden mesajı iletir; tüm işlem ise denetim ve loglama amaçlı kaydedilir.

## Fonksiyon Grupları
### Şablon İşleme
Bu grup, e-posta içeriğinin hazırlanmasıyla ilgili işlevleri kapsar. Dosya sisteminden şablon yüklenmesini ve bu şablonların sipariş verileriyle doldurulmasını sağlar.
- render, loadTemplate

### Ana İstek İşleyici
Bu grup, modülün dış dünya ile tek temas noktasıdır. Gelen HTTP isteklerini yönetir, iş akışını (veri çekme, şablon hazırlama, e-posta gönderimi ve loglama) koordine eder.
- delivery-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, teslimat tamamlanma olayını tetikleyerek müşteriye otomatik e‑posta bildirimi gönderen bir Supabase Edge Function'dır. Aşağıdaki varsayımlar fonksiyon imzaları ve genel bakıştan türetilmiştir.

**[Aksiyom 1 – Şablon Yükleme Altyapısı]:** Eğer `loadTemplate()` fonksiyonunun çağrıldığı anda şablon dosyasına erişilebilir bir depolama ortamı (dosya sistemi veya benzeri bir kaynak) yoksa, e‑posta içeriği oluşturulamaz ve bildirim gönderimi başarısız olur.

**[Aksiyom 2 – Render Girişleri]:** Eğer `render(tpl, _data)` fonksiyonuna geçilen `tpl` (şablon dizgesi) boş veya geçerli bir şablon yapısı içermiyor ya da `_data` (sipariş verisi sözlüğü) boş veya eksik ise, doldurulmuş geçerli bir e‑posta içeriği üretilemez.

**[Aksiyom 3 – Veritabanı Erişimi]:** Eğer `delivery-notification_handler(req)` çalışırken sipariş bilgilerini çekmek için kullanılan veritabanı bağlantısı mevcut değilse veya sorgu sonucu boş dönerse, bildirim için gerekli veriler temin edilemez ve işlem tamamlanamaz.

**[Aksiyom 4 – İstek Nesnesi]:** Eğer `delivery-notification_handler(req)` fonksiyonuna geçilen `req` nesnesi geçerli bir HTTP isteği içermiyor ya da zorunlu alanları (örn. teslimat olayını tetikleyen identifikasyon bilgisi) eksik ise, handler fonksiyonu doğru bir şekilde işleyemez ve bildirim tetiklenemez.

**[Aksiyom 5 – Harici E‑posta Servisi]:** Eğer e‑posta gönderimi için kullanılan harici e‑posta servisi (SMTP veya API tabanlı bir servis) erişilebilir durumda değilse veya istekleri reddederse, hazırlanmış bildirim mesajı müşteriye ulaşamaz; bu durum denetim loglarına kaydedilir.

**[Aksiyom 6 – Şablon-Veri Eşleşmesi]:** Eğer `render` fonksiyonuna verilen `_data` sözlüğündeki anahtarlar ile `tpl` şablonundaki yer tutucu alanlar (placeholder'lar) arasında uyumsuzluk varsa, şablon düzgün doldurulamaz ve eksik veya hatalı içerikli bir e‑posta oluşur.

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

### [N1_NASIL] AST Pointer: `delivery-notification/index.ts`::render
- **params**: `tpl: string`, `_data: Record<string, unknown>`
- **ic_degiskenler**:
  (yok — parametre ve regex replace dışında ara değişken yok)
- **Dönüş**: `String` — tpl içindeki `{{key}}` placeholder'larını `_data` sözlüğündeki değerlerle değiştirilmiş sonuç döner

### [N2_NASIL] AST Pointer: `delivery-notification/index.ts`::loadTemplate
- **params**: (yok)
- **ic_degiskenler**:
  - `url` — `import.meta.url` referansıyla `./templates/email/delivered.html` dosyasının mutlak URL'ini tutar
- **Dönüş**: `string | null` — HTML template içeriği veya dosya bulunamazsa `null`

### [N3_NASIL] AST Pointer: `delivery-notification/index.ts`::delivery-notification_handler
- **params**: `req` (Deno Request nesnesi)
- **ic_degiskenler**:
  - `origin` — İstek header'ından `origin` değeri; yoksa `'*'` fallback
  - `corsHeaders` — CORS izin header'larını içeren nesne (Allow-Headers, Allow-Methods)
  - `supabaseUrl` — `SUPABASE_URL` ortam değişkeni; Supabase REST API çağrıları için temel URL
  - `serviceKey` — `SUPABASE_SERVICE_ROLE_KEY` ortam değişkeni; yetkili API çağrılarında bearer token olarak kullanılır
  - `authHeader` — İstekten alınan `Authorization` header değeri
  - `isAuthorized` — Kullanıcının yetkili olup olmadığını tutan boolean bayrak
  - `anonKey` — `SUPABASE_ANON_KEY` ortam değişkeni; anonim auth client oluşturmak için
  - `authClient` — Anonim key ile oluşturulmuş Supabase client; kullanıcı token'ını doğrulamak için
  - `user` — `authClient.auth.getUser()` sonucundan çıkarılan kullanıcı nesnesi; `user.id` ile rol sorgulanır
  - `roleCheck` — `user_profiles` tablosundaki rol bilgisini sorgulayan fetch sonucu (Response)
  - `arr` (ilk kullanım) — `roleCheck.json()` ile parse edilmiş rol yanıt dizisi
  - `role` — `arr[0]?.role` ifadesinden elde edilen kullanıcı rolü; `'admin'` veya `'superadmin'` ise yetkilendirme başarılı
  - `err` — Auth fallback try-catch bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
  - `resendApiKey` — `RESEND_API_KEY` ortam değişkeni; Resend e-posta gönderim API anahtarı
  - `emailFrom` — `EMAIL_FROM` ortam değişkeni; gönderici e-posta adresi, yoksa `'VentHub <onboarding@resend.dev>'`
  - `body` — `req.json()` ile parse edilmiş istek gövdesi; `DeliveryRequest` tipinde
  - `order_id` — `body.order_id` — sipariş benzersiz tanımlayıcısı; sipariş sorgulama ve audit için kullanılır
  - `customer_email` — `body.customer_email` — müşteri e-posta adresi; e-posta gönderilecek alıcı
  - `customer_name` — `body.customer_name` — müşteri adı; e-posta içeriğinde selamlama için
  - `order_number` — `body.order_number` — sipariş numarası; e-posta konu satırında gösterilir
  - `o` — Eksik müşteri bilgilerini tamamlamak için `venthub_orders` tablosuna yapılan fetch sonucu (Response)
  - `arr` (ikinci kullanım) — `o.json()` ile parse edilmiş sipariş yanıt dizisi
  - `row` — `arr[0]` referansı; sipariş satırı nesnesi — `row.order_number`, `row.customer_name`, `row.customer_email` erişimleri ile eksik alanlar tamamlanır
  - `prettyOrderNo` — Formatlanmış sipariş numarası; `order_number` varsa `'#{ikinci_kısmı}'`, yoksa `order_id`'nin son 8 karakteri
  - `subject` — E-posta konu satırı; `"Siparişiniz teslim edildi - {prettyOrderNo}"` formatında
  - `html` — E-posta HTML içeriği; `loadTemplate()` sonucu template varsa `render()` ile doldurulur, yoksa fallback HTML string dizisi ile oluşturulur
  - `resp` — `https://api.resend.com/emails` POST isteği sonucu (Response); e-posta gönderim durumunu içerir
  - `t` — `resp._text()` ile alınan hata gövdesi metni; gönderim başarısızsa hata detayı olarak döner
  - `result` — `resp.json()` ile parse edilmiş Resend API yanıt nesnesi; `result.id` provider message ID olarak audit kaydına yazılır
  - `_e` — Ana try-catch bloğunda yakalanan hata nesnesi
  - `msg` — `_e` Error ise `_e.message`, değilse `String(_e)` dönüşümü; hata yanıtı gövdesi olarak kullanılır
- **Dönüş**: `Response` — JSON gövdeli HTTP yanıtı:
  - `200` + CORS headerları: OPTIONS Preflight, başarılı gönderim (`{ ok, order_id, subject, result }`), veya Resend API_KEY eksikse `{ disabled: true }`
  - `400`: `order_id` eksik (`{ error: 'missing_fields', missing: [...] }`) veya müşteri bilgileri eksik (`{ error: 'customer_info_missing' }`)
  - `405`: POST dışı HTTP method
  - `401`: Yetkilendirme başarısız
  - `500`: E-posta gönderim hatası veya genel Exception
  - **Yan etkiler**: Resend API'ye e-posta gönderir; `shipping_email_events` tablosuna audit kaydı inserted edilir

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