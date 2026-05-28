---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-orders-latest\index.ts
skeleton_hash: b282b0917505ca5b
entity_hashes:
  func:admin-orders-latest_handler: 9cf0e6c826d5f20e
  overview: c84ffe0de5df59aa
generated_at: 2026-05-28T22:41:58Z
---

## Genel Bakış
Bu modül, yönetici paneli için son siparişleri getiren bir Supabase Edge Function'dır. Gelen HTTP isteklerini işleyerek veritabanından güncel sipariş listesini çeker ve istemciye yanıt olarak döndürür.

## Fonksiyon Grupları
### Ana İşlev
Modülün tek sorumluluğu, yönetici tarafından istenen en son siparişleri listeleyip HTTP yanıtı olarak sunmaktır.
- admin-orders-latest_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, admin-orders-latest_handler fonksiyonunun doğru çalışması için aşağıdaki zorunlu koşulları gerektirir.

[Aksiyom 1]: Eğer req parametresi sağlanmazsa veya geçerli bir HTTP isteği nesnesi (Request) değilse, fonksiyonun çalışma zamanı davranışı bilinmiyor ve hata fırlatılabilir.

[Aksiyom 2]: Eğer Supabase veritabanı bağlantısı kurulamazsa veya veritabanı erişilemez durumda olursa, istenen sipariş verileri getirilemez ve hata yanıtı döndürülür.

[Aksiyom 3]: Eğer veritabanında sipariş kaydı bulunamazsa, boş bir dizi veya uygun bir boş veri yapısı döndürülür.

[Aksiyom 4]: Eğer istek yapan kullanıcının yönetici (admin) yetkisi yoksa veya Yetkilendirme (Authorization) başlığı geçersizse, istek reddedilir ve yetkilendirme hatası yanıtı döndürülür.

---

## FONKSİYON DETAYLARI

### admin-orders-latest_handler
**Ne yapar**: Bu fonksiyon, HTTP isteklerini (request) alarak en güncel sipariş verilerini işleyen bir API endpoint'ini temsil eder. Genellikle bir web framework veya APIateway tarafından çağrılarak istekteki verileri işler ve uygun bir yanıt (response) döndürür.
**Nasıl yapar**: Fonksiyon, bir `Request` nesnesi alır ve bu isteği işleyerek sonucu bir `Response` nesnesi olarak paketler. İç mantığı, isteğin içeriğine göre sipariş veritabanını sorgulamak, filtrelemek ve en güncel kayıtları seçmek üzerinedir. Ancak verilen bilgiler dahilinde fonksiyonun tam iç işleyiş (mantığı) ayrıntılı olarak belgelenememektedir.
**Parametreler**:
- `req`: Request — İşlenecek HTTP istek nesnesi. İstek gövdesi, başlıkları ve URL parametreleri gibi verileri içerir.
**Dönüş**: Response — Fonksiyonun işlenen isteğe karşılık olarak döndürdüğü HTTP yanıt nesnesi. Başarılı durumlarda istenen verileri (sipariş listesi), hata durumunda ise uygun hata kodlarını ve mesajlarını içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-orders-latest/index.ts::admin-orders-latest_handler
- **params**: `(req)` — Incoming HTTP request objesi (Deno Request)
- **ic_degiskenler**:
  - `origin` — `req.headers.get('origin')` ile alınan istek kaynağı origin'i, CORS doğrulamasında kullanılır
  - `allowed` — `Deno.env.get('ALLOWED_ORIGINS')` değerinin virgülle ayrılıp trim edilerek oluşturulmuş izinli origin listesi dizisi
  - `okOrigin` — origin'in allowed listesinde olup olmadığını veya listenin boş olup olmadığını belirleyen boolean flag
  - `requestId` — `crypto.randomUUID()` veya `Date.now()` ile üretilen benzersiz istek tanımlayıcısı, response header'larında `X-Request-Id` olarak döner
  - `cors` — `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods` anahtarlarını tutan CORS header nesnesi, `Record<string, string>` tipinde
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'i
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan service role anahtarı
  - `authHeader` — `req.headers.get('Authorization')` ile alınan JWT bearer token, kullanıcı doğrulaması için kullanılır
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anon key, kullanıcı client'ı oluşturmak için kullanılır
  - `supabaseUser` — `createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })` ile oluşturulan, kullanıcı Yetkisiyle çalışan Supabase istemcisi
  - `supabaseAdmin` — `createClient(supabaseUrl, serviceRoleKey)` ile oluşturulan, service role yetkisiyle çalışan Supabase istemcisi
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının data sonucu, `userRes.user.id` ile kullanıcının ID'sine erişilir
  - `userErr` — `supabaseUser.auth.getUser()` çağrısının hata sonucu, hata varsa 401 döner
  - `profile` — `supabaseAdmin.from('user_profiles').select('role')...maybeSingle()` sorgusunun data sonucu, `profile?.role` ile kullanıcının rolü alınır
  - `profErr` — user_profiles sorgusunun hata sonucu, hata varsa veya rol uyumsuzsa 403 döner
  - `userRole` — `profile?.role` değerinden alınan kullanıcı rolü字符串, `'admin'` veya `'superadmin'` olmalı
  - `url` — `new URL(req.url)` ile parse edilen istek URL nesnesi, query string parametrelerine erişim sağlar
  - `status` — `url.searchParams.get('status')?.trim() || ''` ile alınan sipariş durumu filtresi
  - `from` — `url.searchParams.get('from')?.trim() || ''` ile alınan tarih başlangıç filtresi
  - `to` — `url.searchParams.get('to')?.trim() || ''` ile alınan tarih bitiş filtresi
  - `q` — `url.searchParams.get('q')?.trim() || ''` ile alınan arama/arama sorgusu filtresi
  - `preset` — `url.searchParams.get('preset')?.trim() || ''` ile alınan hazır filtre adı (ör. `'pendingShipments'`)
  - `limitParam` — `Math.min(Math.max(parseInt(url.searchParams.get('_limit') || '50', 10) || 50, 1), 100)` ile hesaplanan sayfa başına kayıt limiti (1-100 arası, varsayılan 50)
  - `pageParam` — `Math.max(parseInt(url.searchParams.get('page') || '1', 10) || 1, 1)` ile parse edilen sayfa numarası (min 1)
  - `offset` — `(pageParam - 1) * limitParam` ile hesaplanan SQL offset değeri, pagination için kullanılır
  - `params` — `new URLSearchParams()` ile oluşturulan PostgREST sorgu parametreleri nesnesi, `select`, `order`, `status`, `created_at`, `or`, `order_number` etc. anahtarları set edilir
  - `isPendingShipments` — `preset === 'pendingShipments'` kontrolünden dönen boolean, bekleyen sevkiyat filtresinin aktif olup olmadığını belirler
  - `normalizeDateStart` — iç fonksiyon bildirimi, tarih stringini ISO gün başı formatına dönüştürür (`YYYY-MM-DD` → `YYYY-MM-DDT00:00:00Z`)
  - `normalizeDateEnd` — iç fonksiyon bildirimi, tarih stringini ISO gün sonu formatına dönüştürür (`YYYY-MM-DD` → `YYYY-MM-DDT23:59:59Z`)
  - `requestUrl` — `` `${supabaseUrl}/rest/v1/venthub_orders?${params.toString()}` `` ile oluşturulan PostgREST API tam istek URL'i
  - `resp` — `fetch(requestUrl, { headers: ... })` ile yapılan HTTP isteminin Response sonucu, `Prefer: _count=exact` ve `Range` header'ları ile sayfalama desteklenir
  - `rows` — `await resp.json().catch(() => [])` ile parse edilen sipariş satırları dizisi, hata durumunda boş dizi döner
  - `contentRange` — `resp.headers.get('content-range') || '0-0/0'` ile alınan content-range header değeri, toplam kayıt sayısını barındırır
  - `total` — `Number(contentRange.split('/')[1] || '0') || 0` ile content-range'den parse edilen toplam sipariş sayısı
  - `isUuid` — query `q` parametresinin UUID formatında olup olmadığını kontrol eden regex test sonucu boolean
  - `like` — `` `*${q}*` `` ile oluşturulan PostgREST ilike arama kalıbı, `order_number` sütununda kısmi eşleşme için kullanılır
  - `_e` — catch bloğu yakalama değişkeni, hata nesnesi (Error instance veya bilinmeyen değer)
- **Dönüş**: `Response` — Başarı durumunda `{ total, page, _limit, rows }` JSON gövdesi ve 200 status; hata durumlarında `{ error: string }` JSON gövdesi ve uygun HTTP status kodu (401, 403, 405, 500)

---

### [N2_NASIL] AST Pointer: supabase/functions/admin-orders-latest/index.ts::normalizeDateStart
- **params**: `(d: string)` — YYYY-MM-DD veya ISO formatında tarih stringi
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: `string` — YYYY-MM-DD formatındaysa `${d}T00:00:00Z` olarak gün başı ISO string; aksi halde girdi olduğu gibi döner

---

### [N3_NASIL] AST Pointer: supabase/functions/admin-orders-latest/index.ts::normalizeDateEnd
- **params**: `(d: string)` — YYYY-MM-DD veya ISO formatında tarih stringi
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: `string` — YYYY-MM-DD formatındaysa `${d}T23:59:59Z` olarak gün sonu ISO string; aksi halde girdi olduğu gibi döner

---

## NODE ID STANDARD

  file: supabase\functions\admin-orders-latest\index.ts
  function: supabase\functions\admin-orders-latest\index.ts::admin-orders-latest_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-orders-latest_handler