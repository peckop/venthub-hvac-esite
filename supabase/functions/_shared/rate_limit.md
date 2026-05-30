---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\_shared\rate_limit.ts
skeleton_hash: d2e039f95972e4b1
entity_hashes:
  func:checkRateLimit: eb2ddca9002ea24b
  func:rateLimitHeaders: 8e57db019805fbe0
  overview: 2d23853bbec3dccf
generated_at: 2026-05-30T21:17:11Z
---

## Genel Bakış
Bu modül, sunucusuz fonksiyonlara yönelik istekleri belirli bir zaman aralığında izin verilen eşik değerleri dahilinde tutarak kontrolsüz kullanımı önler. Supabase veritabanı üzerinde her istemci anahtarı için bir sayaç tutar ve bu sayaca dayanarak isteğin kabul edilip edilmeyeceğine karar verir. Kontrol sonucunda istemci tarafının anlayabileceği standart HTTP başlıkları üretilir.

## Fonksiyon Grupları
### İstek Kotası Doğrulama
Verilen istemci anahtarı ve servis bilgilerini kullanarak Supabase üzerindeki kota kaydını sorgular. Zaman penceresi içindeki istek sayısını kontrol eder ve limit aşılıp aşılmadığını döndürür.
- checkRateLimit

### Yanıt Başlığı Oluşturma
Kota kontrolü sonrasında elde edilen limit, kalan hak ve sıfırlanma zamanı değerlerini HTTP yanıt başlıklarına dönüştürür. Bu başlıklar istemci tarafında kota durumunu yorumlamak için kullanılır.
- rateLimitHeaders

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır. Modülün doğru çalışması için zorunlu olan tek conditions, fonksiyon imzasında belirtilen parametrelerin geçerli değerler (örn: geçerli bir URL, geçerli bir anahtar, pozitif sayısal değerler) olmasıdır; bu durum genel programlama kuralıdır ve modüle özgü bir aksiyom olarak tanımlanmaz.

---

## FONKSİYON DETAYLARI

### checkRateLimit
**Ne yapar**: Bir anahtar için hız limiti kontrolü yapar, isteklerin izin verilip verilmediğini belirler ve kalan kota ile sıfırlanma zamanını döndürür.

**Nasıl yapar**: Fonksiyon, belirtilen anahtar için veritabanındaki `bump_rate_limit` RPC fonksiyonunu çağırarak mevcut durumu sorgular ve kota sayacını artırır. Varsayılan olarak dakikada 60 istek limiti ve 60 saniyelik pencere süresi kullanılır; bu değerler `opts` parametresiyle veya ortam değişkenleriyle (`RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_WINDOW_SEC`) değiştirilebilir. Sınırlar geçersiz veya negatif olduğunda otomatik olarak 60 değerine geri döner. RPC çağrısı başarısız olursa bir hata fırlatır, veritabanından geçersiz bir yanıt alınırsa varsayılan olarak isteğe izin veren bir sonuç nesnesi oluşturulur.

**Parametreler**:
- key: string — Rate limit kontrolü yapılacak benzersiz anahtar; genellikle bir kullanıcı kimliği, IP adresi veya API anahtarı olabilir
- fetchBase: string — Supabase projesinin taban URL'si (örneğin `https://xyzcompany.supabase.co`); RPC çağrısı bu adres üzerinden yapılır
- serviceRoleKey: string — Supabase service_role anahtarı; yetkilendirme ve API kimlik doğrulama başlıklarında kullanılır
- opts: { limit?: number; windowSec?: number } — Opsiyonel yapılandırma nesnesi; limit dakika başına izin verilen maksimum istek sayısını, windowSec ise pencere süresini saniye cinsinden belirtir

**Dönüş**: `{ result: RateLimitResult, limit: number, windowSec: number }` — result nesnesi `allowed` (boolean, isteğe izin verilip verilmediği), `remaining` (number, pencerede kalan kota sayısı) ve `resetAt` (string, pencerenin sıfırlanacağı ISO 8601 zaman damgası) alanlarını içerir; limit ve windowSec ise hesaplamada kullanılan nihai parametre değerlerini temsil eder.

### rateLimitHeaders
**Ne yapar**: HTTP rate limit yanıtları için standart başlık anahtar-değer çiftlerinden oluşan bir nesne üretir.

**Nasıl yapar**: Verilen limit, kalan kota ve sıfırlanma zamanı değerlerini HTTP rate limit başlık formatına dönüştürür. `RateLimit-Remaining` değeri negatif olmasını engellemek için `Math.max(0, ...)` ile korunur; `RateLimit-Reset` değeri ise mevcut zamandan sıfırlanma zamanına kadar geçen saniye sayısını hesaplar ve minimum 1 saniye olmasını garantiler. Döndürülen nesne `Record<string, string>` tipindedir ve doğrudan HTTP yanıt başlıklarına eklenebilir.

**Parametreler**:
- limit: number — Pencere süresi boyunca izin verilen toplam istek sayısı
- remaining: number — Mevcut pencere süresi içinde hâlâ izin verilen istek sayısı
- resetAt: string — Pencere süresinin sona ereceği zaman; ISO 8601 formatında bir tarih dizesi olarak beklenir

**Dönüş**: `Record<string, string>` — `RateLimit-Limit` (toplam kota), `RateLimit-Remaining` (kalan kota, en az 0) ve `RateLimit-Reset` (sıfırlanmaya kalan saniye, en az 1) başlıklarını içeren anahtar-değer nesnesi.

---

## TYPE ALIASES

### RateLimitResult
```typescript
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/rate_limit.ts::checkRateLimit
- **params**: (key: string, fetchBase: string, serviceRoleKey: string, opts?: { limit?: number; windowSec?: number })
- **ic_degiskenler**:
  - `limit` — uygulanacak istek limiti; opts?.limit'ten, Deno.env['RATE_LIMIT_PER_MINUTE']'den veya varsayılan 60'tan alınır; geçersizse 60'a resetlenir
  - `windowSec` — rate limit penceresi (saniye); opts?.windowSec'ten, Deno.env['RATE_LIMIT_WINDOW_SEC']'den veya varsayılan 60'tan alınır; geçersizse 60'a resetlenir
  - `body` — Supabase RPC'ye gönderilen JSON body; p_key, p_limit, p_window_seconds alanlarını içerir
  - `resp` — fetch() çağrısının döndürdüğü Response nesnesi; ok değilse hata fırlatılır
  - `data` — resp.json() ile parse edilen yanıt; `{ allowed, remaining, reset_at }`物件ları içeren dizi
  - `row` — data[0] mevcutsa ilk satır, aksi halde varsayılan {allowed: true, remaining: limit-1, reset_at: ...} nesnesi
  - `result` — RateLimitResult nesnesi; allowed boolean, remaining number, resetAt string değerlerini tutar
- **Dönüş**: `{ result: RateLimitResult, limit: number, windowSec: number }`

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