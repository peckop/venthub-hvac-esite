---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\admin-iyzico-reconcile\index.ts
skeleton_hash: fca46df2b3bf6235
entity_hashes:
  func:admin-iyzico-reconcile_handler: e8970eccf3f1fb90
  overview: b0badc73158954b7
generated_at: 2026-08-14T22:02:42Z
---

## Genel Bakış
Bu modül, Supabase Edge Functions平台上 üzerinde barındırılan bir admin API uç noktasıdır. Iyzico ödeme sistemi ile sistemdeki yerel kayıt arasındaki veri tutarlılığını (mutabakatı) denetlemek için kullanılır. Yetkilendirilmiş yöneticiler tarafından erişilen bu fonksiyon, ödeme uzlaşma işlemlerini koordine eder.

## Fonksiyon Grupları
### Ödeme Mutabakat İşleme
Iyzico ile yerel sistem arasındaki ödeme verilerini eşleştiren ve tutarsızlıkları tespit eden merkezi işleyici.
- admin-iyzico-reconcile_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function olarak çalışan bir HTTP handler'idır. Mimari varsayımlar fonksiyon imzası ve modül bağlamından türetilmiştir.

**[Aksiyom 1]:** Eğer `req` parametresi geçerli bir HTTP Request nesnesi değilse (null, undefined veya yanlış tipte ise), handler fonksiyonu beklenmedik hata fırlatır veya geçersiz yanıt döner.

**[Aksiyom 2]:** Eğer handler fonksiyonu bir HTTP Response nesnesi döndürmezse (return yoksa veya undefined dönerse), istemci tarafında bağlantısı kesilmemiş/belirsiz bir yanıt durumu oluşur ve client timeout'a uğrar.

**[Aksiyom 3]:** Eğer modül çalışması için gerekli olan Iyzico API kimlik bilgileri (API key, secret key vb.) ortam değişkenlerinde tanımlı değilse, mutabakat (reconcile) işlemi başarısız olur ve hata yanıtı döner.

**[Aksiyom 4]:** Eğer istek sahibi geçerli bir admin oturumuna (yetkilendirme token'ı) sahip değilse, fonksiyon isteği reddeder ve 401/403 hatası ile yanıt verir.

**[Aksiyom 5]:** Eğer istek gövdesi (request body) Iyzico ile yerel veritabanı arasındaki veri eşleştirmesi için gerekli parametreleri içermiyorsa (tarih aralığı, transaction ID vb.), mutabakat işlemi tamamlanamaz.

**[Aksiyom 6]:** Eğer Iyzico API'sine erişim kesintiye uğrarsa veya zaman aşımlı yanıt verirse, mutabakat işlemi kısmi veya tamamen başarısız olur.

**[Aksiyom 7]:** Eğer Supabase veritabanı bağlantısı kesikse veya tablolar (ödeme kayıtları) erişilebilir durumda değilse, yerel tarafın doğrulanması yapılamaz ve tutarsızlık raporlanamaz.

**[Aksiyom 8]:** Fonksiyon imzasında `req` dışında parametre tanımlanmamıştır; bu nedenle işlevsellik tamamen `req` nesnesinin içeriğine (header, body, query params) bağımlıdır.

---

## FONKSİYON DETAYLARI

### admin-iyzico-reconcile_handler

**Ne yapar**: Bu fonksiyon, iyzico ödeme platformu ile yapılan işlemlerin mutabakatını (reconciliation) gerçekleştirmek üzere tasarlanmış bir Supabase Edge Function handler'ıdır. Admin düzeyinde ödeme uzlaşma işlemlerini yönetir ve HTTP isteklerini işleyerek uygun yanıtları döndürür.

**Nasıl yapar**: Fonksiyon, gelen HTTP isteğini (`req`) alarak iyzico ödeme sistemi ile ilgili mutabakat işlemlerini yürütür. Bu tür fonksiyonlar genellikle iyzico API'sinden ödeme verilerini çeker, mevcut sistemdeki kayıtlarla karşılaştırır ve tutarsızlık durumlarında düzeltme veya raporlama yapar. Supabase Edge Function yapısı gereği, istek metodunu (GET, POST vb.) kontrol ederek ilgili mantığı çalıştırır.

**Parametreler**:
- `req`: Request (Supabase Request) — Gelen HTTP isteği nesnesi. İyzico mutabakat işlemi için gerekli parametreleri, başlıkları ve yetkilendirme bilgilerini içerir. Fonksiyon bu istek üzerinden admin işlem talimatlarını ve filtre kriterlerini alır.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Mutabakat işleminin başarılı veya başarısız olduğunu belirten durum kodu (status code) ve gerekirse detaylı JSON verisi döndürür. Başarılı işlemlerde mutabakat sonuçları, başarısızlıklarda ise hata açıklamaları içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-iyzico-reconcile/index.ts::admin-iyzico-reconcile_handler
- **params**: `req` — gelen HTTP isteği (Request nesnesi)
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) çağrısıyla elde edilen CORS başlıkları sözlüğü
  - `cors` — Cors header sözlüğü (Access-Control-Allow-Methods ve Headers ile sabit değerlerle yeniden tanımlanmış; OPTIONS yanıtında ve tüm Response header'larında kullanılır)
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile çevre değişkeninden alınan Supabase proje URL'i; tüm API istemleri için taban URL olarak kullanılır
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile alınan servis rolü anahtarı; yetkili isteklerde Authorization ve apikey header'larında kullanılır
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY') ile alınan anonim istemci anahtarı; authClient oluşturmada kullanılır
  - `authHeader` — req.headers.get('Authorization') ile gelen istekten alınan Bearer token; kullanıcı kimlik doğrulaması için kullanılır
  - `authClient` — createClient ile anonKey ve authHeader kullanılarak oluşturulan Supabase istemcisi; kullanıcının kimliğini doğrulamak için auth.getUser() çağrılır
  - `user` — authClient.auth.getUser() destructuring'inden gelen kullanıcı nesnesi; user.id ile kullanıcı rolü kontrolü yapılır
  - `authErr` — authClient.auth.getUser() destructuring'inden gelen hata nesnesi; hata varsa 401 yanıtı döner
  - `roleCheck` — user_profiles tablosuna fetch ile yapılan rol sorgusunun Response nesnesi; serviceRoleKey ile yetkilendirilmiş istek
  - `arr` — roleCheck.json().catch() ile parse edilen dizi; kullanıcı profil bilgilerini içerir
  - `role` — arr[0]?.role ile ilk kayıttan çıkarılan kullanıcı rolü stringi; 'admin' veya 'superadmin' olmalıdır
  - `_id` — POST body'sinden body?.id veya URL search params'dan url.searchParams.get('id') ile alınan sipariş ID filtresi; null olabilir
  - `conv` — POST body'sinden body?.conv veya URL search params'dan url.searchParams.get('conv') ile alınan conversation_id filtresi; null olabilir
  - `body` — req.json().catch() ile parse edilen POST isteği gövdesi; sadece POST methodunda kullanılır
  - `_limit` — Sabit sayısal değer 10; RPC sorgusunda döndürülecek maksimum sipariş sayısını belirler
  - `rpcListUrl` — `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders` ile oluşturulan RPC endpoint URL'i
  - `listBody` — RPC çağrısı için gönderilen parametre nesnesi; p_id, p_conv, p_limit ve p_status alanlarını içerir; _id ve conv yoksa p_status='pending', varsa p_status=null ayarlanır
  - `listResp` — fn_admin_get_orders RPC'sine POST ile yapılan isteğin Response nesnesi
  - `text` — listResp.text().catch() ile hata durumunda alınan yanıt gövdesi metni; hata detayı olarak döndürülür
  - `orders` — listResp.json().catch() ile parse edilen siparişler dizisi; her eleman bir sipariş kaydıdır
  - `fnHost` — IIFE içinde hesaplanan fonksiyon host URL'i; supabaseUrl'den host extract edilip ref adı çıkarılarak `${ref}.functions.supabase.co` formatında oluşturulur; iyzico-callback endpoint'i için taban URL olarak kullanılır
    - `su` — IIFE içinde supabaseUrl referansı (null assertion ile); URL parse edilir
    - `host` — new URL(su).host ile extract edilen hostname; domain adını içerir
    - `ref` — host.split('.')[0] ile hostname'den çıkarılan proje referans adı
  - `results` — Her siparişin işlenme sonucunu tutan dizi (Array<Record<string, unknown>>); nihai yanıtın results alanına yazılır
  - `o` — for...of döngüsünde orders dizisinden iterasyonla alınan tek bir sipariş nesnesi
  - `token` — o?.payment_token ile siparişten alınan iyzico ödeme token'ı; yoksa sipariş atlanır
  - `cbUrl` — `${fnHost}/iyzico-callback` ile oluşturulan callback endpoint URL'i
  - `cbResp` — iyzico-callback fonksiyonuna POST ile yapılan isteğin Response nesnesi; token, conversationId, orderId gönderilir
  - `cbJson` — cbResp.json().catch() ile parse edilen callback yanıt nesnesi; status alanını içerir
  - `st` — cbJson?.status ile alınan ödeme durumu stringi; yoksa 'pending' default'u kullanılır
  - `e` — for döngüsü içindeki try-catch ve ana catch bloklarında yakalanan hata nesnesi (unknown tipinde)
  - `msg` — e instanceof Error kontrolü ile hata nesnesinden çıkarılan mesaj stringi; hata yanıtlarında error alanına yazılır
- **Dönüş**: `Response` — JSON body ile HTTP Response nesnesi; duruma göre 200, 401, 403 veya 500 status kodları döner
  - OPTIONS isteklerinde 200 boş Response
  - Config eksikliğinde `{ error: 'CONFIG_MISSING' }` ile 500
  - Yetkilendirme hatalarında `{ error: 'unauthorized' }` ile 401
  - Rol yetersizliğinde `{ error: 'forbidden' }` ile 403
  - RPC başarısızlığında `{ ok: false, httpStatus, rpcUrl, body }` ile 200
  - Sipariş bulunamadığında `{ ok: false, processed: 0 }` ile 200
  - Başarılı işleme `{ ok: true, processed, results }` ile 200
  - Yakalanmış hatalarda `{ error: msg }` ile 500

---

## NODE ID STANDARD

  file: supabase\functions\admin-iyzico-reconcile\index.ts
  function: supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-iyzico-reconcile_handler