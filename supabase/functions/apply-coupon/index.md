---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts
skeleton_hash: c8d35825cdb738d5
entity_hashes:
  func:apply-coupon_handler: a399f5149250ae7f
  func:buildCors: 317be5b9cff201e9
  overview: fb96f807c58d5b28
generated_at: 2026-05-29T11:42:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi için bir Supabase Edge Fonksiyonu olup, HTTP istekleriyle gelen kupon kodlarının doğrulanması ve uygulanması süreçlerini merkezi olarak yönetir. Cross-origin (çapraz köken) erişim güvenliğini sağlamak için tarayıcı politikalarına uygun CORS başlıklarını otomatik olarak yapılandırır ve kupon işleminin tüm iş akışını (doğrulama, uygulama ve yanıt oluşturma) koordine eder.

## Fonksiyon Grupları
### CORS Yapılandırma
HTTP istekleri arasındaki çapraz köken erişimlerini güvenli bir şekilde sağlamak için gerekli HTTP başlıklarını ve izin parametrelerini dinamik olarak üretir.
- buildCors

### Kupon İşleme İş Akışı
Gelen HTTP isteklerini analiz ederek kupon kodunu doğrular, ilgili iş mantığını yürütür, CORS yapılandırmasını entegre eder ve işlemin success veya hata durumuna göre uygun HTTP yanıtını oluşturup döndürür.
- apply-coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HTTP istekleri üzerinden kupon kodu doğrulama ve uygulama işlevselliği sağlayan bir Supabase Edge Fonksiyonudur. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `buildCors` fonksiyonu çağrılmaz veya geçerli bir `Request` nesnesi sağlanmazsa, yanıtın HTTP başlıklarında `Access-Control-Allow-Origin` gibi Cross-OriginResource-Sharing (CORS) başlıkları oluşturulamaz ve tarayıcı politikalarına uygunluk sağlanamaz; bu durumda istek tarayıcı tarafından engellenir.

[Aksiyom 2]: Eğer `apply-coupon_handler` fonksiyonuna geçerli bir `Request` nesnesi (örneğin, `method`, `url`, `headers` ve geçerli bir `body` içeren) ulaşmazsa, kupon kodu doğrulama ve uygulama iş akışı başlatılamaz ve istek geçersiz yanıt (örn: 400/405) ile sonuçlanır.

[Aksiyom 3]: Eğer istek, kupon kodunu içeren bir `body` veya doğru query parametreleri (örn: `code`, `cartId`) içermiyorsa veya bu veriler hatalıysa, kupon

---

## FONKSİYON DETAYLARI

### buildCors

**Ne yapar**: HTTP isteğinin origin (köken) adresini doğrular ve Cross-Origin Resource Sharing (CORS) politikasına uygun yanıt header'larını oluşturur. Fonksiyon, istek yapan kaynağın izin verilen origin listesinde yer alıp olmadığını kontrol ederek hem header'ları hem de doğrulama sonucunu birlikte döndürür.

**Nasıl yapar**: Fonksiyon首先 istek nesnesinden `origin` header'ını okur. Ardından `ALLOWED_ORIGINS` ortam değişkenini virgülle ayırarak izin verilen origin listesini oluşturur. Eğer izin verilen origin listesi boşsa veya istek gelen origin bu listede yer alıyorsa `ok` değeri `true` olur. Son olarak CORS header'ları; izin durumuna göre `Access-Control-Allow-Origin` değerini origin olarak veya `'null'` olarak ayarlayarak oluşturur.

**Parametreler**:
- `req`: Request — CORS kontrolü yapılacak olan HTTP isteği nesnesi. Bu nesneden `origin` header'ı çıkarılarak istemcinin kaynak adresi alınır.

**Dönüş**: `{ headers: Record<string, string>, ok: boolean }` — `headers` alanı, yanıtta kullanılacak CORS header'larını içerir (`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`). `ok` alanı ise origin doğrulamasının başarılı olup olmadığını belirtir; `true` ise istek izin verilen kaynaktan geliyor demektir.

**Notlar**:
- `Access-Control-Allow-Origin` header'ı, izin verilmeyen kaynaklarda `'null'` değerini alır ve bu durumda tarayıcı isteği engelleyecektir.
- `Access-Control-Allow-Headers` alanı `authorization`, `x-client-info`, `apikey` ve `content-type` header'larının istek içerisinde gönderilmesine izin verir.
- `Access-Control-Allow-Methods` alanı sadece `POST` ve `OPTIONS` (preflight) HTTP metodlarına izin verir.
- Eğer `ALLOWED_ORIGINS` ortam değişkeni tanımlı değilse veya boşsa, tüm origin'lere izin verilir (`allowed.length === 0` kontrolü).

### apply-coupon_handler
**Ne yapar**: Bu fonksiyon, kupon kodu uygulama işlemini yöneten ana istek işleyicisidir ve gelen istekleri işleyerek ilgili mantığı uygular.
**Nasıl yapar**: İstek içeriğinden kupon kodunu ve kullanıcı bağlamını ayıklar, kuponun geçerliliğini kontrol eder ve işlemin sonucuna göre başarılı veya hatalı bir HTTP yanıtı oluşturur.
**Parametreler**:
- req: Request — Kupon bilgilerini ve oturum verilerini içeren yükü barındıran gelen HTTP isteği nesnesi.
**Dönüş**: Response — Kupon uygulama işleminin sonucunu, durum kodlarını ve gerekli JSON verilerini içeren HTTP yanıt nesnesi.

---

## TYPE ALIASES

### CouponRow
```typescript
type CouponRow = {
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_order_amount: number | null
  valid_from: string | null
  valid_until: string | null
  is_acti
```

### ApplyCouponReq
```typescript
type ApplyCouponReq = {
  code: string
  subtotal: number
}
```

### ApplyCouponResp
```typescript
type ApplyCouponResp = {
  val_id: boolean
  reason?: string
  discount_amount?: number
  final_total?: number
  normalized_code?: string
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/apply-coupon/index.ts::buildCors
- **params**: (req: Request)
- **ic_degiskenler**:
  - `origin` — HTTP isteğinin origin başlığını alır, boş ise boş string kullanılır
  - `allowed` — Ortam değişkeninden ALLOWED_ORIGINS değerini alır, virgülle ayırıp temizlenmiş dizine dönüştürür
  - `ok` — Origin'in izin verilen listesinde olup olmadığını kontrol eder (allowed boşsa true kabul eder)
  - `headers` — CORS başlıklarını içeren nesne (Access-Control-Allow-Origin, Allow-Headers, Allow-Methods)
- **Dönüş**: { headers: Record<string,string>, ok: boolean } nesnesi

### [N2_NASIL] AST Pointer: supabase/functions/apply-coupon/index.ts::apply-coupon_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders() çağrısından dönen CORS başlıkları nesnesi
  - `cors` — corsHeaders ile aynı değer (yeniden atama)
  - `requestId` — Benzersiz istek kimliği (crypto.randomUUID() veya Date.now())
  - `ct` — İstek başlığındaki content-type değeri (lowercase)
  - `max` — Maksimum gövde boyutu (byte cinsinden, MAX_BODY_KB ortam değişkeninden hesaplanır)
  - `cl` — İstek başlığındaki content-length değeri
  - `SUPABASE_URL` — Supabase servis URL'i ortam değişkeni
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase servis rolü anahtarı ortam değişkeni
  - `supabase` — createClient() ile oluşturulan Supabase istemcisi
  - `forwarded` — x-forwarded-for başlığı değeri (proxy durumları için)
  - `ip` — İstemci IP adresi (birden fazla başlıktan denenerek alınır)
  - `key` — Rate limit anahtarı (coupon:ip formatında)
  - `result` — checkRateLimit() sonucu (allowed, remaining, resetAt değerleri)
  - `rl` — Rate limit başlık nesnesi
  - `body` — JSON gövdesi (ApplyCouponReq tipinde)
  - `code` — body.code değerinden alınan temizlenmiş kupon kodu
  - `subtotal` — body.subtotal değerinden alınan ara toplam tutarı
  - `_data` — Supabase sorgusundan dönen veri (CouponRow tipinde)
  - `error` — Supabase sorgu hatası
  - `row` — _data cast edilmiş CouponRow nesnesi veya null
  - `now` — Şu anki zaman damgası (Date.now())
  - `startsOk` — Kuponun başlangıç tarihi kontrolü
  - `endsOk` — Kuponun bitiş tarihi kontrolü
  - `activeOk` — Kuponun aktif olup olmadığı kontrolü
  - `limitOk` — Kullanım limiti kontrolü (used_count < usage_limit)
  - `minOk` — Minimum sipariş tutarı kontrolü (subtotal >= minimum_order_amount)
  - `discount` — Hesaplanan indirim tutarı
  - `finalTotal` — İndirim uygulanmış nihai toplam tutar
  - `resp` — Yanıt nesnesi (ApplyCouponResp tipinde)
- **Dönüş**: Response (JSON içeriği ile HTTP yanıtı)

---

## NODE ID STANDARD

  file: supabase\functions\apply-coupon\index.ts
  function: supabase\functions\apply-coupon\index.ts::buildCors
  function: supabase\functions\apply-coupon\index.ts::apply-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: apply-coupon_handler
  export: buildCors