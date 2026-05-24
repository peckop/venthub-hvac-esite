---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\order-housekeeping\index.ts
skeleton_hash: ef1bd632b4cee85c
generated_at: 2026-05-24T10:45:43Z
---

## Genel Bakış
Bu modül, Supabase üzerinde çalışan bir sunucu fonksiyonu olarak siparişlerle ilgili temizlik/idame (order housekeeping) işlemlerini yöneten tek giriş noktası sağlar. Gelen HTTP isteklerini alır, CORS yönetimi, kimlik doğrulama ve Supabase ile entegrasyon gibi gerekli adımları tamamlayıp uygun bir yanıt döndürür.

## Fonksiyon Grupları
### Sipariş Temizlik İşleyici
Modülün tek sorumluluğu, gelen HTTP isteklerini işleyip sipariş temizliğiyle ilgili işlemleri (CORS başlıkları yönetimi, Supabase servis anahtarları ile entegrasyon, kimlik doğrulama kontrolü gibi) gerçekleştirmektir.
- order-housekeeping_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### order-housekeeping_handler
**Ne yapar**: Bu fonksiyon, Supabase Edge Function olarak dağıtılan sipariş temizliği işlevinin ana işleyicisidir. Gelen HTTP isteklerini alır, sipariş temizliği ile ilgili tüm yönetimsel ve operasyonel görevleri yürütmek için gerekli adımları başlatır ve sonucunda uygun bir HTTP yanıtı döndürür.
**Nasıl yapar**: Öncelikle gelen istek nesnesini alır, isteğin geçerliliğini, yetkilendirme durumunu ve istenen işlem türünü doğrular. Ardından tanımlanmış sipariş temizliği prosedürlerini çalıştırarak gereken temizlik işlemlerini gerçekleştirir. İşlem sonucuna göre başarılı veya hata durumlarını belirten bir HTTP yanıtı formatlar ve istemciye iletir.
**Parametreler**:
- req: Request — Fonksiyona iletilen standart HTTP isteği nesnesi, isteğin HTTP yöntemi, başlıkları, gövdesi ve yol bilgilerini içerir.
**Dönüş**: Response — İşlem sonucunu temsil eden standart HTTP yanıt nesnesi. Başarılı işlemler için genellikle 200 aralığında durum kodları ve işlem detayları içeren bir gövde döndürür, hata durumlarında ise 400 veya 500 aralığında durum kodları ve ilgili hata açıklamaları içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\order-housekeeping\index.ts::order-housekeeping_handler
- **params**: (req)
- **ic_degiskenler**:
  - `cors` — CORS başlıklarını içeren sabit nesne, tüm yanıtlar için kullanılacak.
  - `req.method` — Gelen isteğin HTTP metodunu belirler; `OPTIONS` ise erken dönen yanıt.
  - `supabaseUrl` — `SUPABASE_URL` ortam değişkeninden alınan Supabase URL’si; yoksa boş string.
  - `serviceRoleKey` — `SUPABASE_SERVICE_ROLE_KEY` ortam değişkeninden alınan servis rolü anahtarı; yoksa boş string.
  - `anonKey` — `SUPABASE_ANON_KEY` ortam değişkeninden alınan anonim anahtar; yoksa boş string.
  - `authHeader` — İstek başlıklarından `Authorization` değeri; yoksa 401 yanıtı döner.
  - `authClient` — `createClient` ile oluşturulan Supabase istemcisi, anonim anahtar ve gelen auth header ile yapılandırılmış.
  - `data.user` — `authClient.auth.getUser()` çağrısının döndürdüğü kullanıcı nesnesi.
  - `authErr` — `authClient.auth.getUser()` çağrısının hatası.
  - `roleCheck` — Kullanıcının rolünü sorgulayan `fetch` isteğinin yanıt nesnesi.
  - `arr` — `roleCheck.json()` ile elde edilen dizi; rol bilgisi içerir.
  - `role` — `arr[0]?.role` ifadesiyle elde edilen kullanıcı rolü.
  - `now` — `Date.now()` ile elde edilen milisaniye cinsinden zaman damgası.
  - `th30` — 30 dakika öncesi ISO stringi; `cancelResp` için filtre.
  - `th15` — 15 dakika öncesi ISO stringi; `listResp` için filtre.
  - `cancelResp` — 30 dk önce oluşturulmuş ve tokeni olmayan pending siparişleri `cancelled` olarak işaretleyen `fetch` isteğinin yanıtı.
  - `cancelled` — `cancelResp.ok` ise JSON olarak parse edilen dizi; aksi halde boş dizi.
  - `listResp` — 15 dk önce oluşturulmuş ve tokeni olan pending siparişlerin listesi için `fetch` isteğinin yanıtı.
  - `pendWithToken` — `listResp.ok` ise JSON olarak parse edilen dizi; aksi halde boş dizi.
  - `fnHost` — `supabaseUrl`’dan türetilen fonksiyon host URL’si; hatalı URL durumunda boş string.
  - `reconciled` — Başarılı olarak reconcile edilen sipariş ID’lerini tutan dizi.
  - `failed` — Başarısız veya hatalı olarak işaretlenen sipariş ID’lerini tutan dizi.
  - `o` — `pendWithToken` dizisindeki her sipariş nesnesi; `id` alanı kullanılır.
  - `cb` — `fnHost/iyzico-callback`’a yapılan POST isteğinin yanıtı.
  - `body` — `cb.json()` ile parse edilen nesne; `status` alanı kontrol edilir.
  - `_e` — `try...catch` bloğunda yakalanan hata nesnesi.
  - `msg` — `_e`’nin mesajı veya string temsili; hata yanıtında kullanılır.
- **Dönüş**: `Response` nesnesi; başarılı ise `{ ok: true, cancelled_count, reconciled, failed }`, hata durumunda `{ ok: false, error: msg }`.

---

## NODE ID STANDARD

  file: supabase\functions\order-housekeeping\index.ts
  function: supabase\functions\order-housekeeping\index.ts::order-housekeeping_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: order-housekeeping_handler