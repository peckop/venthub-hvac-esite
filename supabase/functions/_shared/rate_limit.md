---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\rate_limit.ts
skeleton_hash: d2e039f95972e4b1
generated_at: 2026-05-24T07:21:10Z
---

## Genel Bakış
Bu modül, bir hizmet üzerinden gelen isteklerin belirli bir zaman dilimi içinde izin verilen sınırı aşmaması için temel bir hız sınırlama (rate‑limit) mekanizması sağlar. İstemciye özgü bir anahtar ve isteğin yapıldığı temel URL üzerinden sınır kontrolü yapılır ve sonuç, istemciye dönük HTTP başlıkları olarak formatlanır.

## Fonksiyon Grupları
### Hız Sınırı Kontrolü
Bu grup, bir isteğin izin verilen sınır içinde olup olmadığını değerlendirir. Anahtar, hizmet adresi ve opsiyonel sınır/pencere parametreleri kullanılarak güncel kullanım sayısı sorgulanır ve sınır aşımına karar verilir.
- checkRateLimit

### Yanıt Başlıkları Oluşturma
Bu grup, hız sınırı bilgilerini istemciye iletmek için uygun HTTP başlıklarını hazırlar. Kalan hak, sıfırlanma zamanı ve toplam sınır gibi verileri alarak istemci tarafından kolayca okunabilecek bir biçimde döndürür.
- rateLimitHeaders

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `key` boş bir string ise, `checkRateLimit` işlevi geçerli bir istemci kimliği sağlayamadığı için sınır kontrolü yapılamaz.  
[Aksiyom 2]: Eğer `fetchBase` boş bir string ise, Supabase endpointine ulaşılmadığı için istek gönderilemez ve fonksiyon hataya yol açar.  
[Aksiyom 3]: Eğer `serviceRoleKey` boş bir string ise, Supabase servisiyle yetkisiz erişim denemesi yapıldığı için işlem yetkisiz reddedilir.  
[Aksiyom 4]: Eğer `opts` nesnesi sağlanıyorsa ve `opts.limit` tanımlıysa, bu değer sıfır veya negatif bir sayı ise, sınırlama mantığı anlamını yitirir ve geçersiz bir sınır değeri kabul edilir.  
[Aksiyom 5]: Eğer `opts` nesnesi sağlanıyorsa ve `opts.windowSec` tanımlıysa, bu değer sıfır veya negatif bir sayı ise, zaman penceresinin geçerli bir süre olmadığı için sınırlama kontrolü doğru çalışmaz.  
[Aksiyom 6]: Eğer `rateLimitHeaders` fonksiyonuna `limit` parametresi negatif bir sayı geçerse, başlıkta bildirilen izin verilen istek sayısı anlamsız olur.  
[Aksiyom 7]: Eğer `rateLimitHeaders` fonksiyonuna `remaining` parametresi negatif bir sayı geçerse, kalan hak değeri mantıksız olur ve istemciye yanlış bilgi iletilir.  
[Aksiyom 8]: Eğer `rateLimitHeaders` fonksiyonuna `resetAt` parametresi geçerli bir tarih‑saat stringi (ISO 8601 vb.) değilse, başlıkta sıfırlanma zamanı bilgisi istemci tarafından çözülemez.  
[Aksiyom 9]: Eğer `rateLimitHeaders` fonksiyonuna `remaining` değeri `limit` değerinden büyükse, kalan hak izin verilen sınırı aşmış olur; bu durum sistem tutarsızlığını gösterir ve başlık bilgisi güvenilir değildir.

---

## FONKSIYON DETAYLARI

### checkRateLimit
**Ne yapar**: Belirtilen bir anahtar için isteklerin rate limit sınırları içinde olup olmadığını değerlendirir.  
**Nasıl yapar**: `key`, `fetchBase` ve `serviceRoleKey` parametrelerini kullanarak (opsiyonel olarak `limit` ve `windowSec`) mevcut kullanım bilgisini alır ve bu bilgiyi tanımlanan sınırlarla karşılaştırarak `result` (true/false) döndürür; ayrıca kullanılan veya uygulanan `limit` ve `windowSec` değerlerini de döndürür.  
**Parametreler**:
- key: string — Rate limitin uygulanacağı benzersiz tanımlayıcı (örneğin kullanıcı kimliği veya IP adresi).  
- fetchBase: string — Rate limit sorgusu için kullanılacak temel URL veya endpoint.  
- serviceRoleKey: string — Supabase hizmet rolü anahtarı, yetkili istekler için kimlik doğrulama sağlar.  
- opts?: { limit?: number; windowSec?: number } — Opsiyonel sınırlama parametreleri; `limit`: izin verilen istek sayısı, `windowSec`: bu sayının geçerli olduğu zaman penceresi (saniye).  
**Dönüş**: { result: boolean, limit: number, windowSec: number } — `result`: istek izin veriliyorsa true, aksi takdirde false; `limit` ve `windowSec`: kullanılan veya uygulanan sınır değerleri.

### rateLimitHeaders
**Ne yapar**: Rate limit bilgilerini istemciye iletmek için HTTP yanıt başlıklarını hazırlar (veya ayarlar).  
**Nasıl yapar**: `limit`, `remaining` ve `resetAt` değerlerini alarak, genellikle `X-RateLimit-Limit`, `X-RateLimit-Remaining` ve `X-RateLimit-Reset` gibi standart başlıkları oluşturur ve bu başlıkları yanıt nesnesine ekler (veya döndürür).  
**Parametreler**:
- limit: number — İzin verilen maksimum istek sayısı.  
- remaining: number — Mevcut zaman penceresinde kalan istek hakkı.  
- resetAt: string — Rate limit penceresinin sıfırlanacağı zaman damgası (genellikle ISO 8601 formatında veya Unix timestamp).  
**Dönüş**: void (veya bilinmiyor) — Fonksiyon genellikle yanıt nesnesini doğrudan değiştirir ve açık bir değer döndürmez.

---

## TYPE ALIASES

### RateLimitResult
```typescript
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::checkRateLimit
- **params**: key (string), fetchBase (string), serviceRoleKey (string), opts? ({ limit?: number; windowSec?: number })
- **ic_degiskenler**:
  - `limit` — number — effective per‑minute limit, derived from opts?.limit or env var RATE_LIMIT_PER_MINUTE (default 60), clamped to ≥1
  - `windowSec` — number — window size in seconds, derived from opts?.windowSec or env var RATE_LIMIT_WINDOW_SEC (default 60), clamped to ≥1
  - `body` — Record<string, unknown> — payload for the RPC call containing p_key, p_limit, p_window_seconds
  - `resp` — Response — HTTP response from fetch to `${fetchBase}/rest/v1/rpc/bump_rate_limit`
  - `data` — Array<{ allowed: boolean; remaining: number; reset_at: string }> — parsed JSON of the RPC response, defaulted to [] on error
  - `row` — { allowed: boolean; remaining: number; reset_at: string } — first element of data if present, otherwise a fallback assuming allowed true with remaining = limit‑1 and resetAt = now + windowSec seconds
  - `result` — RateLimitResult — shaped output { allowed: boolean, remaining: number, resetAt: string } derived from row
- **Dönüş**: { result: RateLimitResult, limit: number, windowSec: number } — object containing the computed rate‑limit result plus the limit and windowSec used

### [N2_NASIL] AST Pointer: supabase/functions/_shared/rate_limit.ts::rateLimitHeaders
- **params**: limit (number), remaining (number), resetAt (string)
- **ic_degiskenler**: yok
- **Dönüş**: Record<string,string> — object with headers RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset (values as strings, Reset calculated as seconds until resetAt)

---

## NODE ID STANDARD

  file: supabase\functions\_shared\rate_limit.ts
  function: supabase\functions\_shared\rate_limit.ts::checkRateLimit
  function: supabase\functions\_shared\rate_limit.ts::rateLimitHeaders

---

## DISA AKTARILANLAR (EXPORTS)
  export: RateLimitResult
  export: checkRateLimit
  export: rateLimitHeaders