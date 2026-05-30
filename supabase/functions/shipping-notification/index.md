---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\shipping-notification\index.ts
skeleton_hash: 36e242b42237e9f8
entity_hashes:
  func:loadShippingTemplate: 4b4a832183734352
  func:renderTemplate: 26cc0a301db3fae9
  func:shipping-notification_handler: 06ce613108984be4
  overview: 9cf32250487e69ff
generated_at: 2026-05-30T21:17:00Z
---

## Genel Bakış
Bu modül, kargo bildirimleri için bir HTTP uç noktasıdır. Gelen isteklere yanıt olarak, depolama alanındaki şablonları yükler, istek verileriyle birleştirerek bildirim metni oluşturur ve bunu istemciye iletir.

## Fonksiyon Grupları
### Şablon İşleme
Gerekli şablonu depolama alanından yükler ve şablon içindeki yer tutucuları verilen verilerle değiştirerek nihai bildirim metnini üretir.
- loadShippingTemplate, renderTemplate

### İstek Koordinasyonu
Gelen HTTP isteklerini yönetir, şablon yükleme ve işleme adımlarını koordine ederek istemciye uygun bir yanıt döndürür.
- shipping-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, fonksiyon imzaları ve mevcut doküman bilgisi temelinde aşağıdakilerdir.

[Aksiyom 1]: Eğer `loadShippingTemplate` fonksiyonu çağrıldığında depolama alanındaki şablon dosyası erişilebilir değilse veya mevcut değilse, fonksiyon hata fırlatır (örneğin, bir istisna) veya uygun bir hata yönetimi mekanizması devreye girer.

[Aksiyom 2]: Eğer `renderTemplate` fonksiyonu çağrıldığında `tpl` parametresi geçerli bir şablon dizesi değilse (örneğin, boş string veya `null`/`undefined`), fonksiyonun davranışı belirsizdir veya hata oluşur. Fonksiyon, şablonu `_data` parametresiyle birleştirebilir.

[Aksiyom 3]: Eğer `shipping-notification_handler` fonksiyonu bir HTTP isteği (`req`) ile çağrıldığında, istek içinde gerekli veriler (örneğin, şablonu dolduracak veri alanları) eksikse, şablon işleme kısmen tamamlanır veya eksik veriler için boş/varsayılan değerler kullanılır.

[Aksiyom 4]: Eğer `shipping-notification_handler` fonksiyonu bir HTTP isteği (`req`) ile çağrıldığında, istek yöntemi (HTTP method) modülün beklediği yöntem (örneğin, POST) değilse, fonksiyon uygun bir HTTP hata kodu (örneğin, 405 Method Not Allowed) ile yanıt verir.

[Aksiyom 5]: Eğer `loadShippingTemplate` fonksiyonu başarıyla bir şablon yüklerse, bu şablon `renderTemplate` fonksiyonuna geçerli bir string olarak传递 edilmelidir. Aksi halde, `renderTemplate` işlevi düzgün çalışamaz.

[Aksiyom 6]: Eğer `renderTemplate` fonksiyonu, `_data` parametresinde şablonda referans alan ancak veri setinde bulunmayan bir anahtar (key) içeriyorsa, bu anahtar için şablonda boş bir alan veya belirli bir hata işleme davranışı gösterilir.

[Aksiyom 7]: Eğer `shipping-notification_handler` fonksiyonu bir HTTP yanıtı oluştururken, yanıtın içeriği (content type) metin tabanlı olmalıdır (örneğin, `text/plain` veya `text/html`), çünkü modül bildirim metni üretir.

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
- `tenant_id?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: shipping-notification/index.ts::renderTemplate
- **params**: `tpl: string`, `_data: Record<string, unknown>`
- **ic_degiskenler**:
  - **1. if-blocks replace callback içinde:**
    - `_m` — regex eşleşme nesnesi, replace callback parametresi, doğrudan kullanılmaz
    - `key` — `{{#if ...}}` içindeki değişken adı, `_data` içinde lookup anahtarı
    - `inner` — `{{#if}}...{{/if}}` arasındaki HTML içeriği, truthy ise döndürülür
    - `v` — `_data[key]` ile elde edilen değerin truthy olup olmadığı kontrol edilir
    - `truthy` — `v`'nin truthy/Falsy durumu, inner içeriğinin korunup korunmayacağına karar verir
  - **2. variable replace callback içinde:**
    - `_m` — regex eşleşme nesnesi, replace callback parametresi, doğrudan kullanılmaz
    - `key` — `{{...}}` içindeki değişken adı, `_data` içinde lookup anahtarı
    - `v` — `_data[key]` ile elde edilen değer, null ise boş string, değilse String(v) olarak döndürülür
- **Dönüş**: `string` — if-block ve değişken replacement'ları uygulanmış şablon metni

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