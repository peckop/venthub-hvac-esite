---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts
skeleton_hash: 16704d3ccdf6ab6d
generated_at: 2026-05-24T10:44:45Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde Supabase üzerinde çalışan, yalnızca yetkili yöneticilerin erişebildiği sipariş inceleme servisidir. Gelen HTTP isteklerinden yetkilendirme verilerini ve incelenecek sipariş kimliğini ayrıştırarak tüm güvenlik ve geçerlilik kontrollerini gerçekleştirir. Doğrulama sonrası ilgili siparişin detaylarını başarı yanıtıyla, hata durumlarında ise uygun hata kodları ve mesajları içeren yanıtı istemciye iletir.

## Fonksiyon Grupları
### Ana HTTP İşleyicisi
Modülün tüm dış istekler için tek giriş noktası olarak görev alır, yönetici sipariş inceleme iş akışının tüm aşamalarını yönetir ve nihai HTTP yanıtını üretir.
- admin-order-inspect_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### admin-order-inspect_handler
**Ne yapar**: Bu fonksiyon, Supabase Edge Function ortamında çalışan admin-order-inspect uç noktasının ana HTTP işleyicisidir. Yöneticilerin siparişleri denetlemesine olanak tanıyan işlemleri yürütür.

**Nasıl yapar**: Gelen `Request` nesnesini alır, istek yolunu ve metodunu analiz eder, gerekli kimlik doğrulama ve yetkilendirme kontrollerini gerçekleştirir. Ardından ilgili iş mantığını çalıştırır (örneğin Supabase veritabanından sipariş verilerini sorgulama veya güncelleme) ve sonucu bir `Response` nesnesi olarak döndürür.

**Parametreler**:
- req: `Request` — İstemciden gelen HTTP isteğini temsil eden nesne. İstek başlıkları, sorgu parametreleri, gövde ve kimlik bilgilerini içerir.

**Dönüş**: `Response` — İstemciye gönderilen HTTP yanıtı. Durum kodu, başlıklar ve isteğin sonucuna göre JSON formatında veri ya da hata mesajı içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `cors` — CORS başlıklarını içeren, yanıtların `headers` alanına eklenecek sabit nesne.
  - `supabaseUrl` — Ortam değişkeni `SUPABASE_URL` değerini tutar; Supabase istemcisi ve RPC URL'si oluşturmak için kullanılır.
  - `serviceRoleKey` — Ortam değişkeni `SUPABASE_SERVICE_ROLE_KEY` değerini tutar; yönetici yetkili Supabase istemcisi ve RPC çağrısı yetkilendirmesi için kullanılır.
  - `anonKey` — Ortam değişkeni `SUPABASE_ANON_KEY` değerini tutar; anonim Supabase istemcisi (kullanıcı kimlik doğrulaması) için kullanılır.
  - `authHeader` — Gelen istekten `Authorization` başlığını alır; kullanıcı kimliğini doğrulamak için Supabase istemcisine aktarılır.
  - `supabaseUser` — `createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })` ile oluşturulan anonim Supabase istemcisi; kullanıcı oturumunu sorgulamak için kullanılır.
  - `supabaseAdmin` — `createClient(supabaseUrl, serviceRoleKey)` ile oluşturulan yönetici yetkili Supabase istemcisi; veri tabanı sorguları (ör. `user_profiles`) için kullanılır.
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının başarılı sonucunda dönen veri; içinde `user` nesnesi bulunur.
  - `userErr` — `supabaseUser.auth.getUser()` çağrısının hata nesnesi; hata durumunda yetkisiz yanıt döndürülür.
  - `profile` — `supabaseAdmin.from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()` sorgusunun başarılı sonucunda dönen satır; kullanıcının rolünü içerir.
  - `profErr` — Yukarıdaki sorgunun hata nesnesi; hata durumunda yetkisiz yanıt döndürülür.
  - `userRole` — `profile?.role` değerinin `string | undefined` tipine dönüştürülmüş hali; rol kontrolü için kullanılır.
  - `id` — İstek URL sorgu parametresi `id` veya POST/PUT gövdesinden alınan `id`; sipariş kimliğini temsil eder.
  - `conv` — İstek URL sorgu parametresi `conv` veya POST/PUT gövdesinden alınan `conv`; konuşma kimliğini temsil eder.
  - `url` — `new URL(req.url)` ile oluşturulan URL nesnesi; sorgu parametrelerini okumak için kullanılır.
  - `body` — İstek gövdesi (`await req.json()`) veya RPC çağrısı gövdesi (`{ _p_id: id, p_conv: conv, p_status: null, p_limit: 1 }`); iki farklı bağlamda farklı içerik taşır.
  - `rpcUrl` — Supabase RPC endpoint’i: ``${supabaseUrl}/rest/v1/rpc/fn_admin_get_orders``; siparişleri getirmek için POST istek yapılır.
  - `resp` — `fetch(rpcUrl, {...})` çağrısının döndürdüğü `Response` nesnesi; HTTP durum ve veri kontrolü için kullanılır.
  - `_text` — `resp.text()` sonucundan elde edilen ham metin; RPC hatalı döndüğünde yanıt gövdesi olarak raporlanır.
  - `json` — `resp.json()` sonucundan elde edilen JSON veri; başarılı RPC yanıtı ise dizi/objektif içerik.
  - `row` — `json` bir dizi ise ilk elemanı (`json[0]`), aksi takdirde `null`; istenen sipariş kaydını temsil eder.
- **Dönüş**: `Response` — Fonksiyon, CORS başlıkları eklenmiş JSON içeren bir `Response` nesnesi döndürür; hata, yetki, parametre eksikliği, RPC hatası veya başarılı veri bulunması durumlarına göre farklı HTTP durum kodları ve içerikler üretir.

---

## NODE ID STANDARD

  file: supabase\functions\admin-order-inspect\index.ts
  function: supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-order-inspect_handler