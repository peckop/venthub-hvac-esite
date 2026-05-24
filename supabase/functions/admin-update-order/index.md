---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts
skeleton_hash: f52d9153a17ad7ad
generated_at: 2026-05-24T10:44:51Z
---

## Genel Bakış
Bu modül, yönetici (admin) yetkisine sahip bir kullanıcının bir siparişi güncelleme talebini işleyen tek bir HTTP handler fonksiyonunu barındırır. Gelen istek doğrulanır, ilgili sipariş verisi güncellenir ve işlem sonucuna göre uygun bir HTTP yanıtı döndürülür.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Üretimi
Modülün temel sorumluluğu, admin tarafından gönderilen sipariş güncelleme isteğini alıp işlemek, gerekli veri güncellemelerini gerçekleştirmek ve sonucu istemciye HTTP yanıtı olarak iletmektir.  
- admin-update-order_handler

### Yardımcı İşlevler (İç Fonksiyonlar)
Bu yardımcı fonksiyonlar, ana handler içinde tanımlanarak güncelleme işleminin farklı aşamalarını soyutlar: bir siparişin belirli alanlarını yama (patch) işlemiyle güncellemek ve güncellenen siparişin son durumunu elde etmek için en yeni sipariş kaydını listelemek.  
- patch, listRecent

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki koşulların sağlanması gerekir.

**Aksiyom 1**: Eğer `req` parametresi sağlanmazsa, fonksiyon çalıştırılamaz ve bir hata (ör. `TypeError`/`BadRequest`) fırlatılır.  

**Aksiyom 2**: Eğer `req` nesnesi, HTTP isteğiyle ilgili zorunlu özellikleri (ör. `method`, `headers`, `body`) içermiyorsa, fonksiyon istek doğrulamasını geçemez ve uygun bir HTTP 400 (Bad Request) yanıtı döndürür.  

**Aksiyom 3**: Eğer `req.headers` içinde geçerli bir admin kimlik doğrulama tokenı (`Authorization` başlığı) bulunmazsa, fonksiyon yetkilendirme hatası verir ve HTTP 401 (Unauthorized) yanıtı döndürür.  

**Aksiyom 4**: Eğer `req.body` içinde güncellenmesi gereken siparişin kimliği (`orderId`) ve güncellenebilir alanlar (`status`, `details` vb.) eksik ya da geçersiz biçimdeyse, fonksiyon veri doğrulama hatası üretir ve HTTP 422 (Unprocessable Entity) yanıtı döndürür.  

**Aksiyom 5**: Eğer veri katmanı (ör. veritabanı/ Supabase) erişilemez ya da güncelleme işlemi başarısız olursa, fonksiyon bir iç hata (HTTP 500) döndürür.  

**Aksiyom 6**: Eğer tüm doğrulama ve güncelleme adımları başarılı bir şekilde tamamlanırsa, fonksiyon HTTP 200 (OK) ya da uygun bir başarı kodu (ör. 204 No Content) ile güncellenmiş sipariş bilgisini yanıt olarak döndürür.  

**Aksiyom 7**: Eğer `req` nesnesi beklenen `Request` tipinde değilse (ör. farklı bir sınıf ya da yapı), fonksiyon tip uyumsuzluğu nedeniyle çalışamaz ve bir tip hatası (`TypeError`) fırlatır.

---

## FONKSIYON DETAYLARI

### admin-update-order_handler
**Ne yapar**: Bu fonksiyon, VentHub HVAC projesinin Supabase admin-update-order fonksiyonunun ana istek işleyicisidir; gelen HTTP isteğini alarak sipariş güncelleme işlemlerini yönetir ve uygun bir HTTP yanıtı üretir. @ts-nocheck etiketi nedeniyle TypeScript derleyici kontrollerinden muaf tutulur.
**Nasıl yapar**: Fonksiyon, giriş olarak bir HTTP Request nesnesi alır, sipariş güncellemeyle ilgili temel işlemleri (kaynak koddaki spesifik mantık detayları verilmemiş olsa da) yürütür ve sonuç olarak bir Response nesnesi döndürür. TypeScript'in tip güvenliği kontrolleri bu fonksiyon için devre dışıdır.
**Parametreler**:
- name: req — type: Request — Bu, fonksiyona gelen HTTP isteğini temsil eden nesnedir; sipariş güncelleme için gerekli istek gövdesi, başlıklar, kimlik doğrulama bilgileri veya sorgu parametreleri gibi verileri içerebilir.
**Dönüş**: Response türünde bir nesne döndürür; bu, sipariş güncelleme işleminin sonucunu (başarı veya başarısızlık durumu, ilgili mesajlar, güncellenen sipariş verileri vb.) içeren HTTP yanıtını ifade eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts::admin-update-order_handler
- **params**: `req: Request`
- **ic_degiskenler**:
  - `origin` — `req.headers.get('origin')` sonucunu tutar; CORS kontrolü için kullanılır.
  - `allowed` — ortam değişkeni `ALLOWED_ORIGINS`ten virgülle ayrılmış izinli origin listesi.
  - `okOrigin` — gelen `origin` izinli mi yoksa tüm originlere izin veriliyor mu kontrolü.
  - `requestId` — isteği izlemek için oluşturulan benzersiz kimlik; `crypto.randomUUID()` veya zaman damgası.
  - `cors` — CORS yanıt başlıklarını içeren nesne.
  - `ct` — `content-type` başlığının düşük harfli değeri; JSON olup olmadığını kontrol eder.
  - `max` — ortam değişkeni `MAX_BODY_KB` (KB) değerinin byte’a çevrilmiş sınırı.
  - `cl` — `content-length` başlığının sayısal değeri; istek gövdesi boyut kontrolü.
  - `supabaseUrl` — ortam değişkeni `SUPABASE_URL`.
  - `serviceRoleKey` — ortam değişkeni `SUPABASE_SERVICE_ROLE_KEY`.
  - `anonKey` — ortam değişkeni `SUPABASE_ANON_KEY`.
  - `authHeader` — `Authorization` başlığı; kimlik doğrulama için zorunlu.
  - `authClient` — `createClient(supabaseUrl, anonKey, {global:{headers:{Authorization:authHeader}}})` ile oluşturulan Supabase istemcisi.
  - `user` — `authClient.auth.getUser()` çağrısından elde edilen doğrulanmış kullanıcı nesnesi.
  - `authErr` — `authClient.auth.getUser()` çağrısının hata nesnesi.
  - `roleCheck` — Kullanıcının rolünü sorgulamak için yapılan `fetch` isteği.
  - `arr` — `roleCheck.json()` sonucundan elde edilen dizi; boşsa `[]`.
  - `role` — `arr[0]?.role`; kullanıcının rolü.
  - `body` — `await req.json()` sonucu; JSON parse hatası durumunda `{}`.
  - `id` — `body.id`; güncellenecek siparişin tekil kimliği.
  - `conversation_id` — `body.conversation_id`; alternatif kimlik.
  - `status` — `body.status`; yeni durum değeri (varsayılan `'paid'`).
  - `display_code` — `body.display_code`; UI’da gösterilen son 8 hane kodu.
  - `newStatus` — `status` değerinin string temsili; güncelleme için kullanılacak.
  - `resp` — `Response | null`; `patch` fonksiyonundan dönen yanıt.
  - `ok` — `resp && resp.ok`; PATCH isteğinin başarılı olup olmadığını gösterir.
  - `text` — `resp ? await resp.text() : ''`; PATCH yanıtının gövdesi.
- **Dönüş**: `Response` – CORS başlıkları ve `X-Request-Id` içeren JSON yanıt döner; hata durumlarında ilgili HTTP durum kodlarıyla yanıt verir.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts::patch
- **params**: `filter: string`
- **ic_degiskenler**:
  - `supabaseUrl` — dış kapsamdan (ana fonksiyon) alınan Supabase URL.
  - `serviceRoleKey` — dış kapsamdan alınan servis rol anahtarı.
  - `newStatus` — dış kapsamdan alınan güncellenmek istenen sipariş durumu.
- **Dönüş**: `Promise<Response>` – PATCH isteği sonucunda Supabase'den gelen `Response` nesnesi.

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-update-order\index.ts::listRecent
- **params**: `_limit = 100`
- **ic_degiskenler**:
  - `supabaseUrl` — dış kapsamdan alınan Supabase URL.
  - `serviceRoleKey` — dış kapsamdan alınan servis rol anahtarı.
  - `res` — `fetch` ile alınan yanıt nesnesi.
  - `txt` — `res.text()` ile elde edilen yanıt gövdesi (string).
  - `data` — `txt` JSON parse edilerek elde edilen dizi; parse hatası durumunda `[]`.
- **Dönüş**: `Promise<Array<any>>` – Sipariş kayıtlarını içeren dizi; hatalı parse durumunda boş dizi.

---

## NODE ID STANDARD

  file: supabase\functions\admin-update-order\index.ts
  function: supabase\functions\admin-update-order\index.ts::admin-update-order_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-update-order_handler