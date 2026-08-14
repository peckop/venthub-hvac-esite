---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\stock-alert\index.ts
skeleton_hash: 5e4b57ede49f72b6
entity_hashes:
  func:checkAllProducts: 84cfac7d1bdd2b56
  func:checkSpecificProduct: 5027f709f9a40c80
  func:getAlertRecipients: b32f47ebd9b11ba3
  func:processProductAlert: c58aae9b08876f88
  func:sendNotification: 9cdc9ad48f9dd1f6
  func:stock-alert_handler: 9f0ae49f1a00dd49
  overview: f1961f87b9e63cad
generated_at: 2026-08-14T12:38:44Z
---

## Genel Bakış
VentHub HVAC platformu için tasarlanmış bir Supabase Edge Fonksiyonudur. Temel amacı, ürün stok seviyelerinin önceden tanımlı kritik eşik değerlerin altına düştüğünde otomatik uyarılar üreterek tedarik zinciri süreçlerini başlatmaktır. Modül, hem tüm ürün envanterini tarayan toplu kontrol hem de belirli bir ürünü hedefleyen tetikleme modları ile esnek bir uyarı yönetimi sunar.

## Fonksiyon Grupları
### İstek Kabul ve Yönlendirme
Gelen HTTP isteğini dinler, istek parametrelerini analiz eder ve verilen komuta bağlı olarak stok kontrol işinin doğru metodunu başlatır.
- stock-alert_handler

### Stok Kontrol ve Değerlendirme
Veritabanındaki ürün stoklarını çekerek definedik eşik değerleriyle karşılaştırır. İstenen kapsamda (tüm ürünler veya tek bir ürün) stok yetersizliği tespit eder.
- checkAllProducts, checkSpecificProduct

### Uyarı İşleme ve Bildirim Tetikleme
Stok uyarısı oluşturulan her bir ürün için ilgili alıcıların listesini çeker ve tanımlı bildirim kanalları üzerinden öncelik sırasına göre ulaşılabilir uyarılar gönderir.
- processProductAlert, getAlertRecipients, sendNotification

---

## AXIOMS – Mimari Varsayımlar

Bu modül, stok seviyeleri belirli bir eşiğin altına düştüğünde bildirim göndererek tedarik süreçlerini tetikler. Fonksiyon imzaları ve modül yapısı dikkate alınarak aşağıdaki aksiyomlar türetilmiştir:

[Aksiyom 1]: Eğer `stock-alert_handler` fonksiyonuna geçerli bir HTTP isteği (`Request`) ulaşmazsa, fonksiyon uygun bir hata yanıtı (örn. 400/405) döndürmeli veya işlenmemelidir; aksi halde beklenmeyen davranış veya çökme olur.

[Aksiyom 2]: Eğer `supabase` istemcisi (`SupabaseClient`) `checkAllProducts` veya `checkSpecificProduct` fonksiyonlarına başarıyla bağlanamazsa (örn. kimlik doğrulama hatası, ağ kesintisi), stok kontrolü yapılamaz ve dolayısıyla hiçbir uyarı bildirimi gönderilemez; bu durumda ilgili hata loglanmalı veya çağrıya hata ile dönülmelidir.

[Aksiyom 3]: Eğer `checkSpecificProduct` fonksiyonuna geçerli bir `_productId` parametresi verilmezse (boş string, null veya tanımsız), fonksiyon o ürünü işleyemez; bu durumda o ürüne ait uyarı kontrolü atlanır veya hata döndürülür.

[Aksiyom 4]: Eğer `processProductAlert` fonksiyonunda `product` nesnesi içinde stok seviyesi veya eşik değeri bilgisi eksikse (bu değerlerin hangisi olduğu bilinmiyor), ürünün düşük stoklu olup olmadığı değerlendirilemez; bu durumda o ürün için uyarı işlemi yapılamaz.

[Aksiyom 5]: Eğer `processProductAlert` fonksiyonuna verilen `recipients` listesi boşsa (`AlertRecipient[]` boş dizi), stok uyarısı için bildirim gönderilecek alıcı bulunmaz; bu durumda `sendNotification` çağrılmaz veya uyarı işlemi tamamlanmaz.

[Aksiyom 6]: Eğer `sendNotification` fonksiyonuna `priority` parametresi geçerli bir değer değilse (örn. tanımsız string, boş string), bildirimin önceliği belirlenemez; bu durumda bildirim ya gönderilemez ya da varsayılan

---

## FONKSİYON DETAYLARI

### stock-alert_handler
**Ne yapar**: Bu fonksiyon, stok alert sisteminin ana HTTP istek işleyicisidir. Gelen bir Request nesnesini alır ve ilgili iş mantığını (belirli bir ürünü veya tüm ürünleri kontrol etme) çağırarak bir Response nesnesi döndürür.
**Nasıl yapar**: Fonksiyonun gövdesi verilmemiştir, ancak adı ve parametreleri göz önüne alındığında, HTTP isteğinin içeriğine (örneğin bir `productId` parametresi varlığına) göre `checkSpecificProduct` veya `checkAllProducts` fonksiyonlarından birini çağıran bir yönlendirici (router) gibi davranması beklenir.
**Parametreler**:
- `req: Request` — Gelen HTTP isteği nesnesi, istemciden gelen verileri ve headers'ları içerir.
**Dönüş**: `Response` — İşlemin sonucunu içeren, istemciye gönderilecek HTTP yanıtı.

### checkAllProducts
**Ne yapar**: Veritabanındaki **tüm ürünleri** stok seviyelerine göre tarar, stok miktarı belirlenmiş eşik değerin (veya varsayılan 5 birim) altında veya eşitinde olan ürünler için uyarı sürecini başlatır.
**Nasıl yapar**: Supabase istemcisi aracılığıyla `products` tablosundan düşük stoklu olabilecek tüm ürünleri çeker. SQL tarafında karmaşık filtreleme yerine, JavaScript tarafında her bir ürünün `stock_qty` değerini, kendi `low_stock_threshold` alanı (yoksa 5) ile karşılaştırarak filtreler. Ardından, alıcıları tek seferde çekip (N+1 sorgu optimizasyonu) her uygun ürün için `processProductAlert` fonksiyonunu çağırarak sonuçları derler.
**Parametreler**:
- `supabase: SupabaseClient` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi.
**Dönüş**: `results` — Her bir işlenen ürün için `processProductAlert` fonksiyonunun döndüğü sonuç nesnelerinden oluşan bir dizi (array). Her sonuç, ürün adını, uyarı türünü, gönderilen bildirim sayısını ve başarı durumunu içerir.

### checkSpecificProduct
**Ne yapar**: Verilen **tek bir ürünün** stok seviyesini kontrol eder ve belirlenen eşik değerinin altındaysa uyarı sürecini başlatır.
**Nasıl yapar**: Supabase istemcisi ile belirtilen `_productId`'ye sahip ürünü `products` tablosundan çeker. Ürün bulunamazsa hata fırlatır. Ürünün stok miktarı, eşik değerinden yüksekse uyarı yapılmaz ve basit bir bilgi mesajı döndürülür. Düşük veya eşit ise, alıcıları çekerek `processProductAlert` fonksiyonunu çağırır ve sonucu döndürür.
**Parametreler**:
- `supabase: SupabaseClient` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi.
- `_productId: string` — Kontrol edilecek ürünün benzersiz kimliği (ID'si).
**Dönüş**: Uyarı yapıldığında, `processProductAlert` fonksiyonunun sonucunu içeren tek elemanlı bir dizi (array). Stok eşik değerinin üzerindeyse, `product.name` ve "Stock above threshold" mesajını içeren bir nesne dizisi.

### processProductAlert
**Ne yapar**: Belirli bir ürün için stok durumuna göre bir uyarı türü (`out_of_stock` veya `low_stock`) belirler ve öncelikli olarak tanımlanmış alıcılara bu uyarı bildirimlerini gönderir.
**Nasıl yapar**: Ürünün `stock_qty` değerine bakarak uyarı türünü ve önceliğini belirler. `alertData` adında bir nesne oluşturarak ürün detaylarını paketler. Sonra, her bir alıcının (`recipients`) tercih ettiği bildirim kanallarına (WhatsApp, SMS, Email) göre döngü yapar ve her bir kanal için `sendNotification` fonksiyonunu çağırarak bildirimleri gönderir. Fonksiyon, gönderilen bildirim sayısını ve tüm bildirimlerin başarılı olup olmadığını özetleyen bir sonuç nesnesi döndürür.
**Parametreler**:
- `supabase: SupabaseClient` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi.
- `product: Product` — Uyarı gönderilecek ürünün tüm detaylarını (id, name, stock_qty, low_stock_threshold) içeren nesne.
- `recipients: AlertRecipient[]` — Uyarı bildirimlerinin gönderileceği kişi/kişilerin listesi ve tercih ettikleri bildirim kanallarını tanımlayan dizi.
**Dönüş**: `{ product, alertType, notifications, success }` — İşlem sonucunu özetleyen bir nesne. `product` (ürün adı), `alertType` ('out_of_stock' veya 'low_stock'), `notifications` (gönderilen bildirim sayısı), `success` (tüm bildirimler başarılıysa true, değilse false).

### sendNotification
**Ne yapar**: Bu fonksiyon, belirtilen türde bir bildirim (e-posta, SMS vb.) alıcısına göndermek için Supabase'deki `notification-service` edge fonksiyonunu çağırır. Temel olarak, stok uyarıları gibi belirli bir veri setini alarak harici bir hizmete iletir.

**Nasıl yapar**: Fonksiyon, ortam değişkenlerinden `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini okur. Ardından, `notification-service` endpoint'ine `POST` isteği göndermek için `fetch` kullanır. İstek gövdesi, bildirim türü, alıcı, öncelik, zorunlu bir `message` alanı ve orijinal veriyi genişleten bir `data` nesnesi içerir. `message` alanı, `data.alertType` değerine göre dinamik olarak oluşturulur; bu, notification-service'in şablon olmadığında kullanacağı gövdeyi tanımlar ve önceki bir hatayı (`.replace()` çağrısının 500 hatası vermesi) önler. İşlem başarıyla tamamlanırsa `{ type, recipient, success: true }` döner, bir hata yakalanırsa hata günlüğe yazılır ve `{ success: false }` döner.

**Parametreler**:
- `type`: string — Gönderilecek bildirim türünü belirtir (örn: "email", "sms").
- `to`: string — Bildirimin gönderileceği alıcının adresi veya numarası.
- `data`: AlertData — Bildirim için gerekli tüm verileri (ürün adı, mevcut stok, eşik değeri, uyarı türü) içeren bir nesne.
- `priority`: string — Bildirimin öncelik seviyesini belirtir (örn: "high", "low").

**Dönüş**: `Promise<{ type: string; recipient: string; success: boolean }>` — Bildirim denemesinin sonucunu ve alıcıyı içeren bir nesne döner.

### getAlertRecipients
**Ne yapar**: Stok uyarı bildirimlerinin gönderileceği alıcıların listesini veritabanından çeker. Varsayılan bir alıcı (sistem yöneticisi) sağlamaya çalışır ve bulamazsa sabit bir acil durum email adresi ile geri dönüş (fallback) yapar.
**Nasıl yapar**: `inventory_settings` tablosundan ana `alert_email` adresini çeker. Eğer bu adres mevcutsa, onu bir `AlertRecipient` nesnesine dönüştürüp listeye ekler. Eğer bu adrese ulaşılamazsa veya hiç alıcı bulunamazsa, `stok@venthub.com` adresini içeren sabit bir geri dönüş alıcısı oluşturur. Her iki durumda da alıcıya sadece email bildirimi enabled olan, düşük ve kritik stok uyarılarını da alan bir yapı atar.
**Parametreler**:
- `supabase: SupabaseClient` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi.
**Dönüş**: `Promise<AlertRecipient[]>` — Bildirim gönderilecek alıcıların (isim, telefon, email, whatsapp, rol, ve hangi bildirim türlerini/alıcıları istediği) listesini içeren asenkron dizi.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://deno.land/std@0.168.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.39.3::SupabaseClient
- import: https://esm.sh/@supabase/supabase-js@2.39.3::createClient

---

## INTERFACES

### Product
- `id: string`
- `name: string`
- `stock_qty: number`
- `low_stock_threshold: number`

### AlertRecipient
- `name: string`
- `phone: string`
- `email: string`
- `whatsapp: string`
- `role: 'admin' | 'manager' | 'buyer'`
- `notifications: {`

### AlertData
- `productName: string`
- `_productId: string`
- `currentStock: number`
- `threshold: number`
- `alertType: 'out_of_stock' | 'low_stock'`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::stock-alert_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) ile gelen, istekteki origin'e göre ayarlanmış CORS başlıkları
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile okunan ortam değişkeni, Supabase proje URL'si
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile okunan ortam değişkeni, servis rolü anahtarı
  - `authHeader` — req.headers.get('Authorization') ile gelen yetkilendirme başlığı
  - `isAuthorized` — boolean, isteğin yetkili olup olmadığını belirtir
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY') ile okunan, anonim kullanıcı anahtarı
  - `createClientAuth` — Dinamik import ile yüklenen Supabase istemcisi (anonKey ile)
  - `authClient` — createClientAuth ile oluşturulan, anonim anahtarı ve Authorization başlığını kullanan istemci
  - `user` — authClient.auth.getUser() çağrısından dönen kullanıcı nesnesi
  - `roleCheck` — fetch ile user_profiles tablosunda rol kontrolü yapan HTTP yanıt nesnesi
  - `arr` — roleCheck.json().catch() ile parse edilen (hata durumunda boş dizi) rol verisi
  - `role` — arr[0]?.role, kullanıcının rolü (admin veya superadmin)
  - `supabase` — createClient ile oluşturulan, serviceRoleKey ile Servis Rolü yetkisine sahip Supabase istemcisi
  - `alertResults` — unknown[] tipinde, işlenen uyarı sonuçları dizisi
  - `error` — try-catch bloğundaki hata nesnesi
- **Dönüş**: Response (JSON.stringify ile success, alerts_processed, results, timestamp veya error döner)

### [N2_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::checkAllProducts
- **params**: (supabase: SupabaseClient)
- **ic_degiskenler**:
  - `allLowStock` — supabase.from('products').select(...).filter(...) sorgusundan dönen tüm düşük stoklu ürünler
  - `fetchErr` — aynı sorgudan dönen hata nesnesi (varsa)
  - `productsToAlert` — allLowStock dizisinin, stock_qty low_stock_threshold değerine eşit veya küçük olan filtrelenmiş hali
  - `recipients` — getAlertRecipients(supabase) çağrısı ile global olarak çekilen bildirim alıcıları
  - `results` — processProductAlert çağrılarının sonuçlarını toplayan dizi
- **Dönüş**: results dizisi (unknown[])

### [N3_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::checkSpecificProduct
- **params**: (supabase: SupabaseClient, _productId: string)
- **ic_degiskenler**:
  - `product` — supabase.from('products').select(...).eq('id', _productId).single() ile belirli bir ürünün verileri
  - `error` — aynı sorgudan dönen hata nesnesi (varsa)
  - `recipients` — getAlertRecipients(supabase) çağrısı ile çekilen bildirim alıcıları
- **Dönüş**: [{ product: product.name, message: '...' }] veya [processProductAlert(...)] sonucu

### [N4_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::processProductAlert
- **params**: (supabase: SupabaseClient, product: Product, recipients: AlertRecipient[])
- **ic_degiskenler**:
  - `alertType` — product.stock_qty'a göre belirlenen uyarı türü ('out_of_stock' veya 'low_stock')
  - `priority` — product.stock_qty'a göre belirlenen öncelik ('critical' veya 'high')
  - `alertData` — AlertData nesnesi, ürün adı, ID'si, mevcut stok, eşik değeri ve alertType içerir
  - `notifications` — sendNotification çağrılarının sonuçlarını toplayan dizi
- **Dönüş**: { product, alertType, notifications: notifications.length, success: boolean }

### [N5_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::sendNotification
- **params**: (type: string, to: string, data: AlertData, priority: string)
- **ic_degiskenler**:
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile okunan ortam değişkeni
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile okunan ortam değişkeni
  - `response` — fetch ile notification-service endpoint'ine POST isteği gönderen HTTP yanıt nesnesi
- **Dönüş**: { type, recipient: to, success: response.ok } veya { type, recipient: to, success: false }

### [N6_NASIL] AST Pointer: supabase/functions/stock-alert/index.ts::getAlertRecipients
- **params**: (supabase: SupabaseClient)
- **ic_degiskenler**:
  - `settings` — supabase.from('inventory_settings').select('alert_email').maybeSingle() ile çekilen envanter ayarları
  - `recipients` — AlertRecipient[] dizisi, bildirim alıcılarını tutar
- **Dönüş**: Promise<AlertRecipient[]> (recipients dizisi)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    index_ts__checkAllProducts["checkAllProducts"]
    index_ts__checkSpecificProduct["checkSpecificProduct"]
    index_ts__getAlertRecipients["getAlertRecipients"]
    index_ts__processProductAlert["processProductAlert"]
    index_ts__sendNotification["sendNotification"]
    index_ts__stock-alert_handler["stock-alert_handler"]
    index_ts__checkSpecificProduct --> index_ts__processProductAlert
    index_ts__checkSpecificProduct --> index_ts__getAlertRecipients
    index_ts__checkAllProducts --> index_ts__processProductAlert
    index_ts__processProductAlert --> index_ts__sendNotification
    index_ts__checkAllProducts --> index_ts__getAlertRecipients
```

## NODE ID STANDARD

  file: supabase\functions\stock-alert\index.ts
  function: supabase\functions\stock-alert\index.ts::stock-alert_handler
  function: supabase\functions\stock-alert\index.ts::checkAllProducts
  function: supabase\functions\stock-alert\index.ts::checkSpecificProduct
  function: supabase\functions\stock-alert\index.ts::processProductAlert
  function: supabase\functions\stock-alert\index.ts::sendNotification
  function: supabase\functions\stock-alert\index.ts::getAlertRecipients

---

## DISA AKTARILANLAR (EXPORTS)
  export: checkAllProducts
  export: checkSpecificProduct
  export: getAlertRecipients
  export: processProductAlert
  export: sendNotification
  export: stock-alert_handler