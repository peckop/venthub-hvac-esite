---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\log-client-error\index.ts
skeleton_hash: 9f88485c49506986
entity_hashes:
  func:log-client-error_handler: cec12c49f3b9435f
  overview: b60c4199e4d653a2
generated_at: 2026-05-28T22:45:26Z
---

## Genel Bakış
Bu modül, istemci tarafında oluşan hataları merkezi bir uç noktada toplamak ve kaydetmek için kullanılan bir Supabase Edge Function'dur. Gelen HTTP isteğindeki hata verisini ayrıştırır, doğrular ve kalıcı depolamaya yazarak uygun HTTP yanıtı döndürür.

## Fonksiyon Grupları
### Hata Kaydı ve HTTP Yanıt Yönetimi
Gelen hata bildirimini işleyen tek bir işleyici; istek gövdesinden veriyi çıkarır, Zod şemasıyla doğrular, kalıcı depolamaya yazar ve CORS başlıkları dahil uygun bir yanıt oluşturur.
- log_client_error_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, istemci hatalarını toplayan bir Supabase Edge Function olup, HTTP istek-tabanlı bir işleyici yapısına sahiptir.

---

**[Aksiyom 1]:** Eğer `req` parametresi geçerli bir `Request` nesnesi olarak sağlanmazsa (null, undefined veya yanlış türde ise), fonksiyon çağrısı çalışma zamanında hata ile başarısız olur.

**[Aksiyom 2]:** Eğer `clientErrorSchema` tarafından istek gövdesi doğrulanamazsa (geçersiz veya eksik alanlar), işlenmemeli ve uygun hata yanıtı döndürülür.

**[Aksiyom 3]:** Eğer Supabase veritabanı bağlantısı kesintiye uğrarsa veya yazma işlemi başarısız olursa, hata kaydı gerçekleşmez ve istemciye hata durumu bildirilir.

**[Aksiyom 4]:** Eğer gelen istek CORS (Cross-Origin Resource Sharing) kurallarını karşılamıyorsa veya uygun başlıklar dahil edilmiyorsa, tarayıcı tabanlı istemci uygulamalarından gelen istekler engellenir.

**[Aksiyom 5]:** Eğer fonksiyon başarılı şekilde çalışırsa, istemciye `2xx` aralığında bir HTTP durum kodu ile yanıt döndürmelidir; aksi halde istemci hatanın kaydedilip kaydedilmediğini bilemez.

**[Aksiyom 6]:** Eğer `log-client-error_handler` fonksiyonu çağrılmazsa (örn. yanlış endpoint), istemci hataları merkezi olarak toplanamaz ve kaybolur.

**[Aksiyom 7]:** Eğer `clientErrorSchema` yapısı değişirse (alan eklenir/çıkarılır), mevcut istemci sürümlerinden gelen eski format hatalar reddedilebilir; bu durum uyumluluk sorunu yaratır.

---

## FONKSİYON DETAYLARI

### log-client-error_handler

**Ne yapar**: Client tarafında oluşan hataların sunucu tarafında loglanmasını sağlayan bir Supabase Edge Function handler'ıdır. HTTP isteklerini alır, hata bilgilerini işler ve uygun HTTP yanıtını döndürür.

**Nasıl yapar**: Bu fonksiyon, bir HTTP Request nesnesini parametre olarak alarak çalışır. Adından anlaşılacağı üzere, client tarafındaki uygulama hatalarını yakalayıp sunucu tarafında merkezi olarak loglamak için kullanılır. Supabase Edge Functions yapısı içerisinde bir request handler olarak tanımlanmıştır.

**Parametreler**:
- `req`: Request — İşlenecek olan HTTP istek nesnesi. Client tarafından gönderilen hata bilgilerini ve gerekli header/body verilerini içerir.

**Dönüş**: `Response` — İşlem sonucuna göre bir HTTP yanıt nesnesi döndürür. Başarılı logging işlemi veya hata durumuna uygun status kodu ve mesaj içerebilir.

---

## SABİTLER
- **clientErrorSchema** (call) — `z.object({
  msg: z.string().default(''),
  stack: z.string().default(''),...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/log-client-error/index.ts::log-client-error_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `requestId` — İstek tanımlayıcısı, crypto.randomUUID veya Date.now'dan üretilen benzersiz ID
  - `cors` — CORS başlık objesi, Access-Control-Allow-Origin ve diğer başlıkları içerir
  - `allowedOrigins` — İzin verilen kökler listesi, ALLOWED_ORIGINS环境変数ından split ile ayrıştırılmış
  - `originHeader` — İstek başlığından alınan origin değeri
  - `originToCheck` — Kontrol edilecek kök, origin header veya referer'den elde edilir
  - `requireAuth` — Auth zorunluluğu flag'i, REQUIRE_AUTH环境変数ından okunur
  - `supabase` — Supabase istemcisi, createClient ile service role key ile oluşturulur
  - `authHeader` — Authorization başlığı değeri
  - `accessToken` — Bearer token'ın kendisi (authHeader.slice(7))
  - `authData` — supabase.auth.getUser sonucundaki data objesi
  - `authErr` — supabase.auth.getUser sonucundaki error objesi
  - `rawBody` — İstek gövdesinden parse edilmiş ham JSON verisi
  - `parsed` — clientErrorSchema.safeParse sonucu {success, data} objesi
  - `payload` — Zod ile doğrulanmış güvenli veri (parsed.data)
  - `mask` — Stringleri gizleyen sanitizer fonksiyonu, email ve uzun token'ları maskeleyen
  - `firstLine` — Stack trace'in ilk satırı, payload.stack.split('\n')[0]
  - `urlObj` — payload.url'den oluşturulmuş URL objesi, try-catch ile
  - `_path` — URL'nin pathname kısmı (urlObj.pathname)
  - `signature` — Hata imzası, message + firstLine + _path kombinasyonunun maskelenmiş hali
  - `groupId` — Hata grubu ID'si, error_groups tablosundan upsert ile elde edilir
  - `groupPayload` — error_groups tablosuna upsert edilecek veri objesi
  - `upsertRow` — error_groups.upsert sonucu dönen satır (id ve _count içerebilir)
  - `q` — error_groups tablosundan signature ile id sorgulama sonucu
  - `dedupSeconds` — Deduplication süresi (saniye), DEDUP_SECONDS环境変数ından
  - `since` — Deduplication zaman damgası, Date.now()-dedupSeconds*1000
  - `recent` — client_errors tablosundan son dedup süresindeki kayıtlar
  - `row` — client_errors tablosuna eklenecek satır objesi
  - `error` — client_errors.insert sonucu hata objesi
  - `msg` — Hatanın message string'i (error.message veya String(error))
  - `level` — payload.level'den alınan hata seviyesi (error, fatal vb.)
  - `env` — payload.env'den alınan ortam bilgisi
  - `notifyEnabled` — Slack bildirimi aktif mi flag'i (SLACK_WEBHOOK_URL tanımlı mı)
  - `isCritical` — Kritik hata seviyesi flag'i (level === 'fatal' || level === 'error')
  - `shortMsg` — payload.msg'nin ilk 200 karakterlik kısaltılmış hali
  - `fields` — Slack bildirimi için alanlar dizisi
  - `_e` — Outer catch bloğu yakalama değişkeni
- **Dönüş**: Response (OK, Bad Request, Unauthorized, Forbidden, veya error JSON)

---

## NODE ID STANDARD

  file: supabase\functions\log-client-error\index.ts
  function: supabase\functions\log-client-error\index.ts::log-client-error_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: log-client-error_handler