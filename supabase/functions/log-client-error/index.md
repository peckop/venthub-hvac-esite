---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\log-client-error\index.ts
skeleton_hash: d40202c9d638d96f
entity_hashes:
  func:log-client-error_handler: cec12c49f3b9435f
  overview: 38ce599da378ec18
generated_at: 2026-08-15T07:33:59Z
---

## Genel Bakış
Bu modül, istemci tarafı uygulamalarda oluşan hataların merkezi olarak toplanmasını ve kaydedilmesini sağlayan bir Supabase Edge Function'dır. Gelen HTTP istekleri aracılığıyla hata verisini alır, doğrular ve veritabanına kalıcı olarak yazarak hata izleme ve teşhis süreçlerini destekler.

## Fonksiyon Grupları
### Hata Kayıt İşleyicisi
Gelen hata raporu isteklerini işleyen ve yanıt oluşturan tek sorumlu bileşen; istek gövdesinden hata verisini çıkarıp doğrular, Supabase veritabanına yazar ve istemciye durum bildirimi döndürür.
- log_client_error_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, istemci hatalarını almak için bir HTTP endpoint'idir ve `clientErrorSchema` kullanarak gelen veriyi doğrular.

[Aksiyom 1]: Eğer istek gövdesi (`req.body`) JSON formatında ayrıştırılamıyorsa, istek reddedilir (HTTP 400 Bad Request).

[Aksiyom 2]: Eğer istek gövdesi `clientErrorSchema` ile doğrulanamıyorsa, istek reddedilir (HTTP 400 Bad Request).

[Aksiyom 3]: Eğer istek yöntemi (`req.method`) POST değilse, istek reddedilir (HTTP 405 Method Not Allowed).

[Aksiyom 4]: Eğer veritabanına yazma işlemi başarısız olursa, sunucu hatası yanıtı dönülür (HTTP 500 Internal Server Error).

[Aksiyom 5]: Eğer `clientErrorSchema` tanımı (çağrısı) başarısız olursa veya geçerli bir doğrulama şeması sağlanamıyorsa, modül herhangi bir isteği başarıyla işleyemez.

[Aksiyom 6]: Eğer istek gövdesindeki veri `clientErrorSchema` tarafından tanımlanan alanları içermiyorsa (eksik alanlar), istek reddedilir (HTTP 400 Bad Request).

---

## FONKSİYON DETAYLARI

### log-client-error_handler

**Ne yapar**: Client tarafında oluşan hataların sunucu tarafında loglanmasını sağlayan bir Supabase Edge Function handler'ıdır. HTTP isteklerini alır, hata bilgilerini işler ve uygun HTTP yanıtını döndürür.

**Nasıl yapar**: Bu fonksiyon, bir HTTP Request nesnesini parametre olarak alarak çalışır. Adından anlaşılacağı üzere, client tarafındaki uygulama hatalarını yakalayıp sunucu tarafında merkezi olarak loglamak için kullanılır. Supabase Edge Functions yapısı içerisinde bir request handler olarak tanımlanmıştır.

**Parametreler**:
- `req`: Request — İşlenecek olan HTTP istek nesnesi. Client tarafından gönderilen hata bilgilerini ve gerekli header/body verilerini içerir.

**Dönüş**: `Response` — İşlem sonucuna göre bir HTTP yanıt nesnesi döndürür. Başarılı logging işlemi veya hata durumuna uygun status kodu ve mesaj içerebilir.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient
- import: https://esm.sh/zod@3.23.8::z

---

## SABİTLER
- **clientErrorSchema** (call) — `z.object({
  msg: z.string().default(''),
  stack: z.string().default(''),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/log-client-error/index.ts::log-client-error_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) çağrısıyla elde edilen CORS başlıkları
  - `cors` — corsHeaders değişkeninin takma adı (alias)
  - `requestId` — crypto.randomUUID() veya Date.now() ile üretilen benzersiz istek tanımlayıcısı
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile okunan Supabase servis URL'i
  - `serviceRoleKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile okunan servis rol anahtarı
  - `allowedOrigins` — Deno.env.get('ALLOWED_ORIGINS') virgülle ayrılmış izin verilen origin listesi, split/map/filter ile temizlenmiş
  - `originHeader` — req.headers.get('origin') ile gelen Origin başlığı
  - `originToCheck` — kontrol edilecek origin; originHeader yoksa referer'dan URL.parse ile türetilir
  - `ref` — req.headers.get('referer') ile gelen referer başlığı
  - `requireAuth` — Deno.env.get('REQUIRE_AUTH') değerinden türetilen boolean; true ise yetkilendirme zorunlu
  - `supabase` — createClient(supabaseUrl, serviceRoleKey) ile oluşturulan Supabase istemcisi
  - `authHeader` — req.headers.get('authorization') veya req.headers.get('Authorization') ile gelen yetkilendirme başlığı
  - `accessToken` — authHeader içinden 'Bearer ' ön ekini atarak çıkarılan token
  - `authData` — supabase.auth.getUser(accessToken) sonucundaki data nesnesi
  - `authErr` — supabase.auth.getUser(accessToken) sonucundaki hata nesnesi
  - `rawBody` — req.json() ile okunan ham istek gövdesi, parse edilemezse null
  - `parsed` — clientErrorSchema.safeParse(rawBody) ile Zod doğrulama sonucu
  - `payload` — parsed.data; Zod doğrulamasından geçmiş güvenli veri nesnesi
  - `mask` — inline arrow fonksiyon; stringleri 4000 karakterle kısaltıp email ve uzun token'ları maskeleyen sanitizasyon fonksiyonu
  - `firstLine` — payload.stack değerinin ilk satırı (stack trace'in ilk çizgisi)
  - `urlObj` — payload.url değerinden URL nesnesi oluşturulmaya çalışılır, başarısızsa null
  - `_path` — urlObj.pathname veya boş string; hata imzası için URL yolu
  - `signature` — msg + firstLine + _path bileşenlerinden maskelenmiş ve birleştirilmiş hata imzası (error_groups tablosunda onConflict anahtarı)
  - `groupId` — upsert veya select ile bulunan error_groups tablosu satır ID'si; bulunamazsa null
  - `groupPayload` — error_groups tablosuna upsert edilecek nesne (signature, level, last_message, url_sample, env, release, last_seen alanları)
  - `upsertRow` — error_groups tablosuna upsert sonrası select('id') ile dönen satır
  - `q` — groupId bulunamadığda signature ile error_groups tablosundan select('id') sorgu sonucu
  - `dedupSeconds` — Deno.env.get('DEDUP_SECONDS') değerinden parseInt ile okunan dedup pencere süresi (saniye cinsinden)
  - `since` — dedup kontrolü için Date.now() - dedupSeconds*1000 hesaplanmış ISO zaman damgası
  - `recent` — client_errors tablosundan group_id ve at filtresiyle son dedup süresi içindeki kayıtlar (id, at alanları)
  - `row` — client_errors tablosuna insert edilecek tüm alanları içeren kayıt nesnesi (at, url, message, stack, user_agent, release, env, level, extra, opsiyonel group_id)
  - `error` — supabase.from('client_errors').insert(row) sonucundaki hata nesnesi
  - `msg` — insert hatasından veya outer catch'ten türetilen hata mesajı stringi
  - `level` — payload.level değerinden türetilen küçük harfli hata seviyesi
  - `env` — payload.env değerinden türetilen ortam bilgisi stringi
  - `notifyEnabled` — SLACK_WEBHOOK_URL env var'ının boş olup olmadığına göre boolean
  - `isCritical` — level değerinin 'fatal' veya 'error' olup olmadığına göre boolean
  - `shortMsg` — payload.msg değerinden 200 karaktere kısaltılmış mesaj
  - `fields` — slackNotify fonksiyonuna aktarılacak alanlar dizisi (Signature, Level, Env, URL, Request-Id)
  - `_e` — outer try-catch bloğunda yakalanan hata nesnesi
- **Dinamik import**: `../_shared/notify.ts` → `slackNotify` fonksiyonu (Slack webhook ile bildirim gönderir, sadece kritik seviyelerde ve notifyEnabled ise çağrılır; ayrıca outer catch bloğunda hata bildirimi için de import edilir)
- **Yan etkiler**: Supabase veritabanına `error_groups` tablosuna upsert, `client_errors` tablosuna insert, `increment_error_group_count` RPC çağrısı; opsiyonel Slack webhook bildirimi
- **Dönüş**: `Response` — başarı durumunda 200 'ok', hata durumlarında 400/401/403/405/500 ile JSON hata mesajı

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler