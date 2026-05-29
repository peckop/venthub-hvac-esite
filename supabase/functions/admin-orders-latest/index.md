---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-orders-latest\index.ts
skeleton_hash: 6a020ed8c0cfc54c
entity_hashes:
  func:admin-orders-latest_handler: 9cf0e6c826d5f20e
  overview: 3bb02a7476b8fc62
generated_at: 2026-05-29T11:41:07Z
---

## Genel Bakış
Bu modül, yönetici paneli için son siparişleri getiren bir Supabase Edge Function olarak tasarlanmıştır. Tek bir HTTP endpoint sunarak, yöneticilerin en güncel sipariş verilerine hızlıca erişmesini sağlar.

## Fonksiyon Grupları
### Sipariş Listeleme
Modülün tek ve temel sorumluluğu, yöneticilerin görüntüleyebileceği en güncel sipariş listesini veritabanından çekip HTTP yanıtı olarak sunmaktır.
- admin-orders-latest_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, admin-orders-latest_handler fonksiyonunun doğru çalışması için aşağıdaki zorunlu koşulları gerektirir.

[Aksiyom 1]: Eğer `req` parametresi sağlanmazsa veya geçerli bir HTTP isteği nesnesi (Request) değilse, fonksiyonun çalışması tanımsızdır.

[Aksiyom 2]: Eğer Supabase Edge Function runtime ortamı (Deno) mevcut değilse, fonksiyon hiç başlayamaz.

[Aksiyom 3]: Eğer veritabanı bağlantısı kesik veya erişilemez ise, fonksiyonun siparişleri getirme işlemi başarısız olur.

[Aksiyom 4]: Eğer veritabanında siparişlerle ilgili tablo veya view mevcut değilse, sorgu sonucu boş döner veya hata oluşur.

---

**Not:** Fonksiyon gövdesi (implementation) sağlanmadığı için, bu aksiyomlar yalnızca fonksiyon imzası ve modülün genel amacına dayanarak türetilmiştir. Detaylı mimari varsayımlar için fonksiyon gövdesinin analizi gereklidir.

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

### [N1_NASIL] AST Pointer: `supabase/functions/admin-orders-latest/index.ts::admin-orders-latest_handler`
- **params**: `(req)` — gelen HTTP isteği (Deno Request nesnesi)
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` ile üretilen CORS başlık nesnesi
  - `cors` — `corsHeaders`'a eşitlenen kısaltma; ardından statik CORS başlıklarıyla yeniden tanımlanır (`Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`)
  - `origin` — `req.headers.get('origin')` ile alınan istemci origin değeri; boşsa boş string
  - `allowed` — `Deno.env.get('ALLOWED_ORIGINS')` değerinin virgülle ayırılıp trim edilip filtrelenmiş hali; izin verilen origin listesi
  - `okOrigin` — `allowed` boşsa true, doluysa `origin`'in `allowed` listesinde olup olmadığı boolean kontrolü
  - `requestId` — `crypto.randomUUID()` ile üretilen benzersiz istek kimliği; `crypto.randomUUID` kullanılamazsa `Date.now()` string'e çevrilir
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'i
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan service role anahtarı
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme başlığı
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anon key
  - `supabaseUser` — `createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })` ile kullanıcı token'lı Supabase istemcisi
  - `supabaseAdmin` — `createClient(supabaseUrl, serviceRoleKey)` ile admin yetkili Supabase istemcisi
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının `data` sonucu; kimlik doğrulanmış kullanıcı nesnesi
  - `userErr` — `supabaseUser.auth.getUser()` çağrısının `error` sonucu
  - `profile` — `supabaseAdmin.from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()` ile çekilen profil kaydı
  - `profErr` — profil sorgusunun `error` sonucu
  - `userRole` — `profile?.role` ile alınan kullanıcının rolü (admin/superadmin kontrolü yapılır)
  - `url` — `new URL(req.url)` ile parse edilmiş istek URL'i
  - `status` — `url.searchParams.get('status')` ile alınan sipariş durumu filtresi; trim edilmiş, boşsa boş string
  - `from` — `url.searchParams.get('from')` ile alınan başlangıç tarihi filtresi; trim edilmiş
  - `to` — `url.searchParams.get('to')` ile alınan bitiş tarihi filtresi; trim edilmiş
  - `q` — `url.searchParams.get('q')` ile alınan arama/sorgu parametresi; trim edilmiş
  - `preset` — `url.searchParams.get('preset')` ile alınan hazır filtre adı; trim edilmiş
  - `limitParam` — `url.searchParams.get('_limit')` değerinin parseInt ile 1-100 aralığına sıkıştırılmış hali; varsayılan 50
  - `pageParam` — `url.searchParams.get('page')` değerinin parseInt ile minimum 1'e sıkıştırılmış hali; varsayılan 1
  - `offset` — `(pageParam - 1) * limitParam` ile hesaplanan sayfalama offset'i
  - `params` — `new URLSearchParams()` ile oluşturulan PostgREST sorgu parametreleri nesnesi; `select`, `order` ve filtreler buna eklenir
  - `isPendingShipments` — `preset === 'pendingShipments'` kontrolü; bekleyen sevkiyat filtresi aktif mi
  - `requestUrl` — `${supabaseUrl}/rest/v1/venthub_orders?${params.toString()}` ile oluşturulan PostgREST API çağrı URL'i
  - `resp` — `fetch(requestUrl, ...)` ile yapılan HTTP isteğinin Response nesnesi; service role key ile yetkilendirilmiş
  - `rows` — `resp.json()` ile parse edilen sipariş satırları dizisi; parse hatasında boş dizi
  - `contentRange` — `resp.headers.get('content-range')` ile alınan içerik aralığı header'ı; yoksa `'0-0/0'`
  - `total` — `contentRange.split('/')[1]` parçasının `Number`'a çevrilmiş hali; toplam kayıt sayısı
- **ic_fonksiyonlar**:
  - `normalizeDateStart(d)` — YYYY-MM-DD formatındaki tarih string'ini ISO gün başlangıcı formatına dönüştürür
  - `normalizeDateEnd(d)` — YYYY-MM-DD formatındaki tarih string'ini ISO gün sonu formatına dönüştürür
- **Dönüş**: `Response` — JSON { total, page, _limit, rows } ile 200; hata durumunda JSON { error } ile 401/403/500

---

### [N2_NASIL] AST Pointer: `supabase/functions/admin-orders-latest/index.ts::normalizeDateStart`
- **params**: `(d)` — string, tarih değeri (YYYY-MM-DD veya ISO formatı)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — girilen tarih `YYYY-MM-DD` formatındaysa `YYYY-MM-DDT00:00:00Z` formatında döner; aksi halde girdinin kendisi aynen döner

---

### [N3_NASIL] AST Pointer: `supabase/functions/admin-orders-latest/index.ts::normalizeDateEnd`
- **params**: `(d)` — string, tarih değeri (YYYY-MM-DD veya ISO formatı)
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — girilen tarih `YYYY-MM-DD` formatındaysa `YYYY-MM-DDT23:59:59Z` formatında döner; aksi halde girdinin kendisi aynen döner

---

## NODE ID STANDARD

  file: supabase\functions\admin-orders-latest\index.ts
  function: supabase\functions\admin-orders-latest\index.ts::admin-orders-latest_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-orders-latest_handler