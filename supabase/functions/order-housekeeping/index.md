---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-housekeeping\index.ts
skeleton_hash: ef1bd632b4cee85c
entity_hashes:
  func:order-housekeeping_handler: e38889ac24217d85
  overview: 193b5e166e5f1ee7
generated_at: 2026-05-28T22:46:55Z
---

## Genel Bakış
Bu modül, siparişlerle ilgili temizlik ve idame (order housekeeping) işlemlerini yöneten bir Supabase Edge Function'dur. Tek bir HTTP istek işleyicisi aracılığıyla, gelen istekleri alıp işleyerek sipariş temizliği ile ilgili tüm sunucu tarafı görevleri (CORS yönetimi, kimlik doğrulama, Supabase entegrasyonu vb.) merkezi bir noktadan koordine eder ve uygun HTTP yanıtlarını döndürür.

## Fonksiyon Grupları
### Sipariş Temizlik İşleyici
Modülün tek sorumluluğu, gelen HTTP isteklerini işleyerek sipariş temizliği ile ilgili tüm yönetimsel ve operasyonel görevleri yerine getirmektir.
- order-housekeeping_handler

---

## AXIOMS – Mimari Varsayımlar
[order-housekeeping_handler fonksiyonu, HTTP isteklerini işleyerek sipariş temizliği işlemlerini yöneten bir Supabase sunucu fonksiyonudur.]

[Aksiyom 1]: Eğer req parametresi geçerli bir HTTP Request nesnesi yoksa, fonksiyon isteği işleyemez ve uygun hata yanıtı dönmelidir.

[Aksiyom 2]: Eğer Supabase servis anahtarı yapılandırması eksikse, veritabanı bağlantısı kurulamaz ve fonksiyon Supabase ile entegrasyon sağlayamaz.

[Aksiyom 3]: Eğer istek için geçerli kimlik bilgileri yoksa veya kimlik doğrulama başarısız olursa, kullanıcı yetkilendirilmemiş olarak değerlendirilmeli ve 401/403 hatası döndürülmelidir.

[Aksiyom 4]: Eğer istek farklı bir origin'den geliyorsa ve CORS politikası buna izin vermiyorsa, tarayıcı isteği engeller ve fonksiyon yanıtı istemciye ulaşamaz.

---

**Not:** Bu modül için elde mevcut olan bilgiler sadece fonksiyon imzası ve eski dokümandır. Fonksiyon gövdesi verilmediği için, yukarıdaki aksiyomlar fonksiyonun temel HTTP handler yapısına ve eski dokümandaki açıklamalara (CORS yönetimi, kimlik doğrulama, Supabase entegrasyonu) dayanarak çıkarılmıştır. Fonksiyon gövdesi mevcut olsaydı, daha spesifik ve doğrulanabilir aksiyomlar üretilebilirdi.

---

## FONKSİYON DETAYLARI

### order-housekeeping_handler
**Ne yapar**: Bu fonksiyon, HTTP isteklerini alarak sipariş ev işleri (order housekeeping) işlemlerini yönetir. Ana işlevi, gelen isteği işleyip uygun bir Response nesnesi döndürmektir. Fonksiyon, bir Edge Function'ın giriş noktası olarak çalışır ve istek verilerini işleyerek sistemdeki siparişle ilgili ev işleri operasyonlarını tetikler.

**Nasıl yapar**: Fonksiyon, bir Request nesnesi alır ve bu isteği işler. İç mantığı, isteğin metodunu (GET, POST, vb.) ve gövdesini analiz ederek uygun bir iş akışı başlatır. İşlem sonucunda bir HTTP durum kodu ve mesajı içeren bir Response nesnesi oluşturur ve döndürür. Hata durumlarında uygun hata kodları ve mesajları ile yanıt verir.

**Parametreler**:
- req: Request — İşlenecek HTTP istek nesnesi. İstek metodunu, başlıklarını ve gövdesini içerir.

**Dönüş**: Response — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı durumlarda 200 OK, hata durumlarında uygun HTTP durum kodlarıyla birlikte JSON formatında bir mesaj veya veri döner.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `supabase/functions/order-housekeeping/index.ts`::order-housekeeping_handler
- **params**:
  - `req` — Edge Function'a gelen HTTP isteği nesnesi (Deno standard Request)
- **ic_degiskenler**:
  - `cors` — Tüm HTTP yanıtlarına eklenecek CORS izin başlıkları sözlüğü
  - `supabaseUrl` — Deno.env ortam değişkeninden alınan Supabase servis URL'i
  - `serviceRoleKey` — Deno.env ortam değişkeninden alınan Supabase service role key (admin erişimi)
  - `anonKey` — Deno.env ortam değişkeninden alınan Supabase anon/public key
  - `authHeader` — `req.headers.get('Authorization')` ile istekten çıkarılan yetkilendirme başlığı
  - `authClient` — `createClient()` ile oluşturulan, istek sahibi kullanıcının token'ını taşıyan Supabase istemcisi
  - `user` — `authClient.auth.getUser()` sonucundan destructure edilen doğrulanmış kullanıcı nesnesi (`data.user`)
  - `authErr` — `authClient.auth.getUser()` sonucundan destructure edilen hata nesnesi (`data.error`)
  - `roleCheck` — Kullanıcının `user_profiles` tablosundaki rolünü sorgulamak için `fetch()` ile yapılan REST API isteği yanıtı
  - `arr` — `roleCheck.json()` sonucu; kullanıcı profil nesnelerini içeren dizi
  - `arr[0]` — `arr` dizisinin ilk elemanı; kullanıcının profil nesnesi (satır bazlı subscript erişimi)
  - `role` — `arr[0]?.role` ifadesinden çıkarılan kullanıcının rolü (`admin` veya `superadmin` olmalı)
  - `now` — `Date.now()` ile alınan mevcut zaman damgası (milisaniye cinsinden)
  - `th30` — 30 dakika öncesinin ISO timestamp stringi; token'ı olmayan siparişler için süre eşik değeri
  - `th15` — 15 dakika öncesinin ISO timestamp stringi; token'ı olan bekleyen siparişler için süre eşik değeri
  - `cancelResp` — Token'ı olmayan (`payment_token is null`) ve 30 dk'dan eski bekleyen siparişleri `cancelled` statüsüne çeken PATCH isteği yanıtı
  - `cancelled` — `cancelResp.json()` sonucu; iptal edilen siparişlerin dizisi (yanıt başarısızsa boş dizi)
  - `listResp` — Token'ı olan (`payment_token not null`) ve 15 dk'dan eski bekleyen siparişleri listeleyen GET isteği yanıtı
  - `pendWithToken` — `listResp.json()` sonucu; token'ı olan bekleyen siparişlerin dizisi (`{id, created_at, payment_token, status}` alanları)
  - `fnHost` — IIFE ile `supabaseUrl`'den türetilen Edge Functions host URL'i (örn: `https://<ref>.functions.supabase.co`)
  - `reconciled` — Reconcile işlemi başarılı olan sipariş ID'lerinin toplandığı string dizisi
  - `failed` — Reconcile işlemi başarısız olup `failed` statüsüne çekilen sipariş ID'lerinin toplandığı string dizisi
  - `o` — `pendWithToken` dizisi üzerindeki `for...of` döngüsünün her iterasyonundaki tekil sipariş nesnesi
  - `cb` — `iyzico-callback` Edge Fonksiyonuna sipariş ID'si ile POST isteği yapan yanıt nesnesi
  - `body` — `cb.json()` sonucu; callback yanıt gövdesi (alan: `status`)
  - `body?.status` — Callback yanıtının `status` alanı; `success` ise reconcile başarılı sayılır (dict erişimi)
  - `o.id` — Döngü içindeki mevcut siparişin benzersiz tanımlayıcısı (dizin alan erişimi)
  - `_e` — Dış `catch` bloğu tarafından yakalanan hata nesnesi
  - `msg` — `_e`'nin `message` özelliği (Error ise) veya string karşılığı; hata mesajı olarak döndürülür
- **Dönüş**: `Response` — JSON gövdeli HTTP yanıtı. Başarılı durumda `{ ok: true, cancelled_count, reconciled, failed }`, hata durumunda `{ ok: false, error }`, yetkilendirme hatalarında `{ error, message }` döner. Tüm yanıtlarda CORS başlıkları ve `Content-Type: application/json` bulunur.

---

## NODE ID STANDARD

  file: supabase\functions\order-housekeeping\index.ts
  function: supabase\functions\order-housekeeping\index.ts::order-housekeeping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-housekeeping_handler