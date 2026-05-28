---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-iyzico-reconcile\index.ts
skeleton_hash: a45e063ea3065638
entity_hashes:
  func:admin-iyzico-reconcile_handler: e8970eccf3f1fb90
  overview: 76aa63321a7612fe
generated_at: 2026-05-28T22:41:21Z
---

## Genel Bakış
Bu modül, Supabase Edge Functions üzerinde çalışan bir admin API uç noktasıdır. Yetkilendirilmiş yöneticilerin Iyzico ödeme sistemi ile sistemdeki yerel kayıt arasındaki veri tutarlılığını denetlemesini sağlar. Güvenlik doğrulamasından sonra mutabakat işlemini koordine eder ve sonuçları istemciye döndürür.

## Fonksiyon Grupları
### Güvenlik ve Uzlaştırma Orkestrasyonu
Gelen HTTP isteklerinin güvenli bir şekilde işlenmesini sağlar. Kimlik doğrulama, yetkilendirme, CORS yönetimi ve Iyzico ile yerel sistem arasındaki veri eşleştirme işlemlerini merkezi olarak yönetir.
- admin-iyzico-reconcile_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediği için mimari aksiyomlar üretilememektedir.

---

## FONKSİYON DETAYLARI

### admin-iyzico-reconcile_handler

**Ne yapar**: Bu fonksiyon, iyzico ödeme platformu ile yapılan işlemlerin mutabakatını (reconciliation) gerçekleştirmek üzere tasarlanmış bir Supabase Edge Function handler'ıdır. Admin düzeyinde ödeme uzlaşma işlemlerini yönetir ve HTTP isteklerini işleyerek uygun yanıtları döndürür.

**Nasıl yapar**: Fonksiyon, gelen HTTP isteğini (`req`) alarak iyzico ödeme sistemi ile ilgili mutabakat işlemlerini yürütür. Bu tür fonksiyonlar genellikle iyzico API'sinden ödeme verilerini çeker, mevcut sistemdeki kayıtlarla karşılaştırır ve tutarsızlık durumlarında düzeltme veya raporlama yapar. Supabase Edge Function yapısı gereği, istek metodunu (GET, POST vb.) kontrol ederek ilgili mantığı çalıştırır.

**Parametreler**:
- `req`: Request (Supabase Request) — Gelen HTTP isteği nesnesi. İyzico mutabakat işlemi için gerekli parametreleri, başlıkları ve yetkilendirme bilgilerini içerir. Fonksiyon bu istek üzerinden admin işlem talimatlarını ve filtre kriterlerini alır.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Mutabakat işleminin başarılı veya başarısız olduğunu belirten durum kodu (status code) ve gerekirse detaylı JSON verisi döndürür. Başarılı işlemlerde mutabakat sonuçları, başarısızlıklarda ise hata açıklamaları içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/admin-iyzico-reconcile/index.ts`::`admin-iyzico-reconcile_handler`

- **params**:
  - `req` — Request nesnesi; HTTP isteği (method, headers, body, url)

- **ic_degiskenler**:
  - `cors` — CORS başlık nesnesi;跨-origin isteklere izin vermek için (`Access-Control-Allow-Origin`, `Allow-Headers`, `Allow-Methods`)
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` ile alınan Supabase proje URL'i
  - `serviceRoleKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` ile alınan servis rolü anahtarı; yetkili API çağrıları için
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` ile alınan anonim anahtar; auth client oluşturma için
  - `authHeader` — `req.headers.get('Authorization')` ile alınan JWT token; kullanıcı doğrulama için
  - `authClient` — `createClient(supabaseUrl, anonKey, ...)` ile oluşturulan Supabase istemcisi; anonKey + Authorization header ile kullanıcı doğrulama yapar
  - `user` — `authClient.auth.getUser()` yanıtından `data.user`; doğrulanmış kullanıcı nesnesi, `user.id` ile rol sorgusu yapılır
  - `authErr` — `authClient.auth.getUser()` yanıtından `error`; auth hatası varsa 401 döner
  - `roleCheck` — `fetch()` ile `user_profiles` tablosundan rol sorgulama yanıtı; admin/superadmin kontrolü için
  - `arr` — `roleCheck.json()` ile parse edilen JSON dizisi; kullanıcı profil verisini tutar
  - `role` — `arr[0]?.role` ile alınan kullanıcı rolü; `'admin'` veya `'superadmin'` değilse 403 döner
  - `_id` — POST body'sinden `body?.id` veya GET query'den `url.searchParams.get('id')` ile alınan sipariş ID filtresi; `null` olabilir
  - `conv` — POST body'sinden `body?.conv` veya GET query'den `url.searchParams.get('conv')` ile alınan conversation ID filtresi; `null` olabilir
  - `body` — `req.json().catch(()=>null)` ile parse edilen POST request body nesnesi; `_id` ve `conv` değerlerini içerir
  - `url` — `new URL(req.url)` ile oluşturulan URL nesnesi; GET isteklerinde query parametrelerini okumak için
  - `_limit` — Sabit `10`; RPC ile çekilecek maksimum sipariş sayısı
  - `rpcListUrl` — `${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders` RPC endpoint URL'i
  - `listBody` — RPC istek gövdesi; `p_id`, `p_conv`, `p_limit`, `p_status` parametrelerini içerir
  - `listResp` — `fetch(rpcListUrl, ...)` ile dönen HTTP yanıtı; sipariş listesini barındırır
  - `text` — `listResp.text()` ile alınan hata metni; RPC başarısız olduğunda hata detayı için
  - `orders` — `listResp.json()` ile parse edilen sipariş dizisi; her eleman `id`, `conversation_id`, `payment_token` vb. alanlara sahiptir
  - `fnHost` — Supabase proje ref'inden türetilen Edge Functions host URL'i; callback endpoint'ini çağırmak için (`https://{ref}.functions.supabase.co`)
  - `results` — `Array<Record<string, unknown>>`; her sipariş için işlenme sonuçlarını toplar (id, status, error bilgisi)
  - `o` — `for...of` döngüsü içindeki mevcut sipariş nesnesi; `o.id`, `o.conversation_id`, `o.payment_token` alanlarına erişilir
  - `token` — `o?.payment_token`; iyzico ödeme token'ı; `null` ise sipariş atlanır
  - `cbUrl` — `${fnHost}/iyzico-callback` callback endpoint URL'i; her sipariş için ödeme durumu doğrulaması yapılır
  - `cbResp` — `fetch(cbUrl, ...)` ile dönen callback HTTP yanıtı
  - `cbJson` — `cbResp.json()` ile parse edilen callback yanıt JSON'u; `cbJson?.status` ödeme durumunu içerir
  - `st` — `cbJson?.status || 'pending'`; callback'ten dönen ödeme durumu
  - `e` — `catch` bloğundaki hata nesnesi (outer try)
  - `msg` — Hatanın `message` özelliği veya `String(e)` ile elde edilen hata metni

- **Dönüş**: `Response` nesnesi
  - OPTIONS istekleri → `200` (CORS preflight)
  - Config eksik → `500` `{ error: 'CONFIG_MISSING' }`
  - Auth header yok → `401` `{ error: 'unauthorized' }`
  - Token geçersiz → `401` `{ error: 'unauthorized' }`
  - Rol yetkisiz → `403` `{ error: 'forbidden' }`
  - Rol kontrolü başarısız → `500` `{ error: 'internal_error' }`
  - RPC başarısız → `200` `{ ok:false, httpStatus, rpcUrl, body }`
  - Sipariş bulunamadı → `200` `{ ok:false, processed:0, message:'no orders found' }`
  - Başarılı → `200` `{ ok:true, processed: number, results: Array }`
  - Hata (outer catch) → `500` `{ error: msg }`

- **Yan Etkiler**:
  - `iyzico-callback` Edge Function'ını her sipariş için `POST` ile çağırarak ödeme durumunu doğrular
  - `user_profiles` tablosundan `service_role_key` ile rol sorgular
  - `fn_admin_get_orders` RPC'si ile veritabanından sipariş listesi çeker

---

## NODE ID STANDARD

  file: supabase\functions\admin-iyzico-reconcile\index.ts
  function: supabase\functions\admin-iyzico-reconcile\index.ts::admin-iyzico-reconcile_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-iyzico-reconcile_handler