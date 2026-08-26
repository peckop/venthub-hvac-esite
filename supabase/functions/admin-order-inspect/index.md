---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\supabase\functions\admin-order-inspect\index.ts
skeleton_hash: e1c7f65b55cccdfb
entity_hashes:
  func:admin-order-inspect_handler: 1ddac70ce14150b4
  overview: a75dc03846842f5a
generated_at: 2026-08-25T07:33:00Z
---

## Genel Bakış

Bu modül, Supabase Edge Function altyapısı üzerinde çalışan bir HTTP handler içerir. `@serve(Deno.serve)` decorator'ı ile işaretlenmiş tek bir asenkron fonksiyon aracılığıyla gelen HTTP isteklerini işler ve yanıt üretir. Modülün adı, admin kullanıcılarına yönelik sipariş inceleme amaçlı bir uç nokta olduğunu gösterir.

## Fonksiyon Grupları

### Ana HTTP Handler
Gelen HTTP isteklerini karşılayan ve yanıt döndüren tek sorumlu fonksiyon. Supabase'in sunucu tarafı fonksiyon altyapısı (Deno runtime) ile entegre çalışarak istek-yanıt döngüsünü yönetir.
- admin-order-inspect_handler

## Notlar

- Modülde yalnızca tek bir fonksiyon bulunduğu için fonksiyonlar arası çağrı ilişkisi bulunmamaktadır.
- Dış bağımlılıklar ve iç modül yapıları kaynak kodda belirtilmemiştir; bu nedenle bilinmemektedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmediğinden, modülün doğru çalışması için gerekli koşullar tespit edilememektedir. Yalnızca fonksiyon imzası (`admin-order-inspect_handler`) mevcut olup, bu imza yalnızca bir `Request` alıp `Response` döndüren genel bir Supabase Edge Function yapısı göstermektedir. Modüle özgü aksiyom üretilebilmesi için fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### admin-order-inspect_handler
**Ne yapar**: Supabase Edge Function olarak çalışan bir HTTP istek işleyicisidir. Fonksiyon adından yola çıkarak sipariş inceleme/denetleme işlemi gerçekleştirdiği anlaşılmaktadır; ancak docstring boş olduğu için kesin görev tanımı bilinmemektedir.

**Nasıl yapar**: `@serve(Deno.serve)` dekoratörü ile donatılmıştır. Bu dekoratör, fonksiyonun Supabase Edge Functions altyapısı üzerinde bir HTTP uç noktası olarak sunulmasını sağlar; `Deno.serve` kullanarak gelen HTTP isteklerini dinler ve bu fonksiyona yönlendirir. Fonksiyon `async` olarak tanımlanmıştır, bu da asenkron işlemlere (veritabanı sorguları, harici API çağrıları vb.) izin verdiği anlamına gelir. Ancak fonksiyonun iç mantığı hakkında verilen kaynakta herhangi bir bilgi bulunmamaktadır.

**Parametreler**:
- `req`: `Request` — Gelen HTTP isteğini temsil eden nesne. İstek gövdesi, başlıkları, URL bilgisi ve HTTP metodu gibi bilgileri içerir.

**Dönüş**: `Response` — HTTP yanıtını temsil eden nesne. Durum kodu, yanıt başlıkları ve yanıt gövdesi gibi bilgileri içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/admin-order-inspect/index.ts::admin-order-inspect_handler
- **params**:
  - `req` — gelen HTTP isteği (Request nesnesi)
- **ic_degiskenler**:
  - `corsHeaders` — `getCorsHeaders(req)` çağrısından dönen CORS başlık nesnesi; OPTIONS ve tüm yanıtlarda kullanılır
  - `cors` — `corsHeaders` değişkeninin kısaltması; tüm Response nesnelerinin headers alanına aktarılır
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile okunan ortam değişkeni; Supabase proje URL'si
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile okunan ortam değişkeni; yönetici rol anahtarı
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile okunan ortam değişkeni; anonim erişim anahtarı
  - `authHeader` — `req.headers.get('Authorization')` ile alınan yetkilendirme başlık değeri; yoksa 401 döner
  - `supabaseUser` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi; kullanıcı oturumunu doğrulamak için `authHeader` global header olarak eklenir
  - `supabaseAdmin` — `createClient(supabaseUrl, serviceRoleKey)` ile oluşturulan Supabase istemcisi; yönetici yetkisiyle veritabanı sorguları yapar
  - `userRes` — `supabaseUser.auth.getUser(...)` sonucundaki `data` alanı; `userRes.user` ile kullanıcı nesnesine erişilir
  - `userErr` — `supabaseUser.auth.getUser(...)` sonucundaki `error` alanı; hata varsa 401 döner
  - `profile` — `supabaseAdmin.from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()` sorgusundan dönen `data`; kullanıcının profil kaydı
  - `profErr` — profil sorgusundaki `error` alanı; hata varsa 403 döner
  - `userRole` — `profile?.role` değeri `string | undefined` olarak atanır; `['admin', 'super_admin']` dizisinde yoksa 403 döner
  - `id` — URL query parametresi `?id=` ile gelen sipariş kimliği; yoksa POST/PUT body'deki `body?.id`'den alınır
  - `conv` — URL query parametresi `?conv=` ile gelen konuşma kimliği; yoksa POST/PUT body'deki `body?.conv`'den alınır
  - `url` — `new URL(req.url)` ile oluşturulan URL nesnesi; `searchParams.get()` ile `id` ve `conv` okunur
  - `body` — POST veya PUT isteklerinde `req.json().catch(()=>null)` ile parse edilen istek gövdesi; `body?.id` ve `body?.conv` alanlarından değer alınır
  - `rpcUrl` — `` `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders` `` ile oluşturulan Supabase RPC endpoint URL'si
  - `body` (rpc) — RPC fonksiyonuna gönderilen parametre objesi: `{ p_id: id, p_conv: conv, p_status: null, p_limit: 1 }`
  - `resp` — `fetch(rpcUrl, ...)` ile yapılan POST isteğinin Response nesnesi; `resp.ok` durum kontrolü yapılır
  - `_text` — RPC yanıt başarısızsa `resp.text().catch(()=>'' )` ile okunan hata gövdesi; hata yanıtında `body` alanına atanır
  - `json` — `resp.json().catch(()=>[])` ile parse edilen RPC yanıt verisi; dizi olarak beklenir
  - `row` — `Array.isArray(json) ? json[0] : null` ile RPC yanıt dizisinin ilk elemanı; sipariş kaydı
  - `_e` — `catch` bloğundaki yakalanan hata nesnesi (`unknown` tipinde); `console.error` ile loglanır
  - `msg` — `_e instanceof Error ? _e.message : 'unknown'` ile çıkarılan hata mesajı; 500 yanıtında döndürülür
- **Dönüş**: `Response` nesnesi — duruma göre: OPTIONS ise 200 (boş gövde), konfigürasyon eksikse 500 (`CONFIG_MISSING`), yetkilendirme yoksa 401 (`unauthenticated`), yetki yoksa 401 (`unauthorized`) veya 403 (`forbidden`), parametre eksikse 400 (`MISSING_ID_OR_CONV`), RPC başarısızsa 200 (`ok:false` ile hata detayı), başarılıysa 200 (`ok:true` ile `row` verisi), genel hata durumunda 500 (hata mesajı ile)

---

## NODE ID STANDARD

  file: index.ts
  function: index.ts::admin-order-inspect_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-order-inspect_handler