---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts
skeleton_hash: 9b98a0b5fd98d396
entity_hashes:
  func:apply-coupon_handler: a399f5149250ae7f
  func:buildCors: 9da93e5126db3247
  overview: ffd2f02daad367fc
generated_at: 2026-05-28T22:43:14Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi için bir Supabase Edge Fonksiyonu olarak kupon kodlarının doğrulanması ve uygulanması işlemlerini yönetir. Cross-origin istekleri için gerekli güvenlik başlıklarını yapılandırarak tarayıcı politikalarına uyum sağlar ve kupon işlemlerinin tam akışını yürütür.

## Fonksiyon Grupları
### CORS Yapılandırma Yardımcıları
HTTP istekleri arasındaki çapraz köken erişimlerini güvenli bir şekilde yönetmek için gerekli HTTP başlıklarını ve izin bayraklarını üretir.
- buildCors

### Kupon Uygulama İş Akışı
Gelen HTTP isteklerini alarak kupon doğrulama ve uygulama mantığını yürütür, CORS yapılandırmasını sağlar ve işlem sonucuna göre uygun HTTP yanıtını döndürür.
- apply-coupon_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgiler (fonksiyon imzaları) sınırlıdır. Aşağıdaki aksiyomlar yalnızca fonksiyon imzalarından çıkarılabilir niteliktedir.

[Aksiyom 1]: Eğer `buildCors` fonksiyonuna geçerli bir `Request` nesnesi verilmezse, CORS başlıkları düzgün oluşturulamaz ve cross-origin istekler tarayıcı güvenlik kurallarına uygun yanıt alamaz.

[Aksiyom 2]: Eğer `apply-coupon_handler` fonksiyonuna geçerli bir `Request` nesnesi verilmezse, kupon uygulama iş akışı başlatılamaz.

[Aksiyom 3]: Eğer `Request` nesnesi üzerinde CORS yapılandırması için gerekli header bilgileri (örn: `Origin`) mevcut değilse, `buildCors` fonksiyonu uygun CORS başlıkları üretemeyebilir.

[Aksiyom 4]: Eğer `apply-coupon_handler` tarafından döndürülen yanıt, `buildCors` tarafından üretilen CORS başlıklarını içermiyorsa, tarayıcılar yanıtı engelleyebilir.

---

**Not:** Kupon kodu geçerliliği, süre kontrolü, kullanım limiti gibi iş mantığına ait aksiyomlar fonksiyon gövdeleri görüntülenmeden belirlenememiştir. Mevcut veri yalnızca fonksiyon imzalarını içermektedir.

---

## FONKSİYON DETAYLARI

### buildCors

**Ne yapar**: HTTP isteğinin origin (kaynak) bilgisini kontrol ederek CORS (Cross-Origin Resource Sharing) başlıklarını oluşturur. İzin verilen kaynaklar listesindeki originlere göre erişim izni verip verilmeyeceğini belirler.

**Nasıl yapar**: Fonksiyon, istekten gelen `origin` başlığını okur ve `ALLOWED_ORIGINS` ortam değişkeninden izin verilen kaynakları virgülle ayrılmış liste olarak parse eder. Eğer izin verilen kaynak listesi boşsa tüm kaynaklara izin verir; doluysa istek gelen origin'in bu listede olup olmadığını kontrol eder. Uygun CORS başlıklarını döndürürken, izin yoksa `Access-Control-Allow-Origin` başlığını `'null'` olarak ayarlar.

**Parametreler**:
- `req`: Request — CORS kontrolü yapılacak HTTP isteği nesnesi

**Dönüş**: `{ headers: Record<string, string>, ok: boolean }` — `headers`, yanıt için gereken CORS başlıklarını içerir; `ok`, istek edilen origin'in izin verilenler listesinde olup olmadığını belirtir

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts::buildCors
- **params**: (req: Request)
- **ic_degiskenler**:
  - `origin` — Request header'ından alınan Origin değeri veya boş string
  - `allowed` — ALLOWED_ORIGINS ortam değişkeninden split edilip trim edilen izin verilen originlerin dizisi
  - `ok` — origin'in izin verilenler listesinde olup olmadığını kontrol eden boolean
  - `headers` — CORS header'larını içeren nesne (Access-Control-Allow-Origin, Allow-Headers, Allow-Methods)
- **Dönüş**: `{ headers: Record<string,string>, ok: boolean }`

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts::apply-coupon_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `requestId` — Her istek için benzersiz UUID veya timestamp tabanlı ID
  - `cors` — buildCors fonksiyonundan dönen CORS header'ları ve durum nesnesi
  - `ct` — Request'in Content-Type header'ının küçük harfe çevrilmiş hali
  - `max` — Maksimum gövde boyutu (KB cinsinden MAX_BODY_KB ortam değişkeninden okunur, byte'a çevrilir)
  - `cl` — Request'in Content-Length header'ı (sayıya çevrilmiş, 0 ise 0)
  - `SUPABASE_URL` — Supabase URL'si (ortam değişkeninden)
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role anahtarı (ortam değişkeninden)
  - `supabase` — createClient ile oluşturulan Supabase istemcisi
  - `forwarded` — x-forwarded-for header'ı
  - `ip` — İstemcinin IP adresi (birkaç header'dan denenerek belirlenir, yoksa 'unknown')
  - `key` — Rate limiting için anahtar (format: `coupon:${ip}`)
  - `result` — checkRateLimit fonksiyonundan dönen sonuç nesnesi (allowed, remaining, resetAt içerir)
  - `rl` — rateLimitHeaders fonksiyonu ile oluşturulan rate limit header'ları nesnesi
  - `body` — Request JSON gövdesi (ApplyCouponReq tipinde, parse edilemezse boş nesne)
  - `code` — body.code string'inden trim edilmiş kupon kodu
  - `subtotal` — body.subtotal sayısından parse edilen ara toplam
  - `_data` — Supabase sorgusundan dönen kupon verisi (CouponRow tipinde veya null)
  - `error` — Supabase sorgusu hata nesnesi
  - `row` — _data'nın CouponRow olarak cast edilmiş hali veya null
  - `now` — Mevcut zaman (Date.now())
  - `startsOk` — Kuponun geçerlilik başlangıç tarihinin kontrolü
  - `endsOk` — Kuponun geçerlilik bitiş tarihinin kontrolü
  - `activeOk` — Kuponun aktif olup olmadığının kontrolü
  - `limitOk` — Kupon kullanım limitinin dolup dolmadığının kontrolü
  - `minOk` — Minimum sipariş tutarı kontrolü
  - `discount` — Hesaplanan indirim miktarı
  - `finalTotal` — İndirim sonrası toplam tutar
  - `resp` — Yanıt nesnesi (ApplyCouponResp tipinde)
- **Dönüş**: Response nesnesi (JSON gövde ve HTTP status kodu ile)

---

## NODE ID STANDARD

  file: supabase\functions\apply-coupon\index.ts
  function: supabase\functions\apply-coupon\index.ts::buildCors
  function: supabase\functions\apply-coupon\index.ts::apply-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: apply-coupon_handler
  export: buildCors