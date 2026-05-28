---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts
skeleton_hash: 9b98a0b5fd98d396
generated_at: 2026-05-24T10:44:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesi için bir Supabase Edge Fonksiyonu olarak kupon uygulama işlemlerini yönetir. Farklı kökenlerden (cross-origin) gelen isteklerin tarayıcı güvenlik kurallarına uygun çalışması için CORS başlıkları yapılandırması yapar ve kupon doğrulama ile uygulama süreçlerini yürütüp uygun yanıtlar döndürür.

## Fonksiyon Grupları
### CORS Yapılandırma Yardımcıları
Farklı kökenlerden gelen HTTP isteklerinin tarayıcı güvenlik kurallarına uygun işlenmesi için gerekli CORS başlıklarını oluşturur ve yapılandırır.
- buildCors

### Kupon Uygulama Ana İş Akışı
Kupon uygulama işleminin temel iş akışını yönetir; gelen HTTP isteğini alır, CORS başlıkları oluşturmak için yardımcı fonksiyonları kullanır, gerekli doğrulama ve işleme adımlarını yürütür ve işlem sonucunu uygun bir yanıt olarak döndürür.
- apply-coupon_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### buildCors
**Ne yapar**: Bu fonksiyon, gelen HTTP isteği için Cross-Origin Resource Sharing (CORS) başlıklarını oluşturur ve tarayıcı güvenlik politikalarını yönetir.
**Nasıl yapar**: Gelen istek nesnesini inceleyerek izin verilen kökenleri (origins) ve HTTP metodlarını belirler, ardından uygun başlık bilgilerini ve bir doğrulama bayrağını içeren bir nesne döndürür.
**Parametreler**:
- req: Request — CORS politikalarının değerlendirilmesi için gerekli meta verilere ve başlıklara sahip gelen HTTP isteği nesnesi.
**Dönüş**: { headers, ok } — CORS başlıklarını ve işlemin başarılı olup olmadığını belirten bir boolean değer içeren nesne.

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
- **params**: `req: Request` — Gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `origin` — İstekten alınan Origin HTTP başlığı, başlık yoksa boş string olarak atanır
  - `allowed` — ALLOWED_ORIGINS ortam değişkeninden ayrıştırılan, virgülle ayrılmış izin verilen origin listesi, her elemanın boşlukları temizlenmiş ve boş stringler filtrelenmiş
  - `ok` — İstek origin'i izin verilen listede ise true, aksi takdirde false; eğer izin listesi boşsa her zaman true
  - `headers` — CORS yanıt başlıklarını içeren Record<string, string> tipinde nesne
- **Dönüş**: `{ headers: Record<string, string>, ok: boolean }` — CORS başlıkları ve izin durumu içeren nesne

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\apply-coupon\index.ts::apply-coupon_handler
- **params**: `req: Request` — Gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `requestId` — Benzersiz istek kimliği, `crypto.randomUUID()` ile üretilir, eğer bu fonksiyon yoksa `Date.now()` string olarak kullanılır
  - `cors` — `buildCors(req)` çağrısından dönen CORS yapılandırma nesnesi
  - `ct` — İstekten alınan `Content-Type` başlığının küçük harfe çevrilmiş hali, başlık yoksa boş string
  - `max` — İzin verilen maksimum istek gövdesi boyutu (bayt cinsinden), `MAX_BODY_KB` ortam değişkeninden alınır, varsayılan değer 100 KB'dir
  - `cl` — İstekten alınan `Content-Length` başlığının tam sayıya çevrilmiş hali, başlık yoksa 0 değeri kullanılır
  - `SUPABASE_URL` — Supabase proje URL'si, `SUPABASE_URL` ortam değişkeninden alınır
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase servis rolü anahtarı, `SUPABASE_SERVICE_ROLE_KEY` ortam değişkeninden alınır
  - `supabase` — `createClient()` fonksiyonu ile başlatılan Supabase istemci nesnesi
  - `forwarded` — İstekten alınan `x-forwarded-for` başlığı, başlık yoksa boş string
  - `ip` — İstemci IP adresi, `x-real-ip`, `cf-connecting-ip` başlıkları veya `x-forwarded-for`'un ilk parçası ile alınır, hiçbiri yoksa `unknown` değeri kullanılır
  - `key` — Hız sınırı kontrolü için kullanılan önbellek anahtarı, `coupon:${ip}` formatında oluşturulur
  - `checkRateLimit` — `../_shared/rate_limit.ts` dosyasından ithal edilen hız sınırı kontrol fonksiyonu
  - `rateLimitHeaders` — `../_shared/rate_limit.ts` dosyasından ithal edilen hız sınırı yanıt başlıkları üreten fonksiyon
  - `result` — Hız sınırı kontrolünün sonucu, izin verildi mi?, kalan istek sayısı ve sıfırlama zamanı bilgilerini içerir
  - `body` — İstekten ayrıştırılan JSON gövdesi, ayrıştırma hatası olursa boş nesne kullanılır
  - `code` — İstek gövdesinden alınan kupon kodu, baştaki ve sondaki boşluklar temizlenmiş, değer yoksa boş string kullanılır
  - `subtotal` — İstek gövdesinden alınan sipariş alt toplamı, değer yoksa 0 değeri kullanılır
  - `_data` — Supabase `coupons` tablosu sorgusundan dönen ham veri
  - `error` — Supabase sorgusundan dönen hata nesnesi
  - `row` — Supabase sorgusundan dönen kupon satırı, `CouponRow` tipi veya `null` değeri
  - `now` — Mevcut Unix zaman damgası (milisaniye cinsinden)
  - `startsOk` — Kuponun geçerlilik başlangıç zamanı kontrol sonucu, kuponun başlangıç tarihi yoksa her zaman true
  - `endsOk` — Kuponun geçerlilik bitiş zamanı kontrol sonucu, kuponun bitiş tarihi yoksa her zaman true
  - `activeOk` — Kuponun aktif durumu kontrol sonucu
  - `limitOk` — Kuponun kullanım limiti kontrol sonucu, limiti tanımlanmamışsa her zaman true
  - `minOk` — Sipariş alt toplamının kuponun minimum sipariş tutarını karşılama kontrol sonucu, minimum tutar tanımlanmamışsa her zaman true
  - `discount` — Hesaplanan indirim miktarı, kupon tipine göre yüzde veya sabit miktar olarak hesaplanır
  - `finalTotal` — İndirim uygulandıktan sonra son sipariş toplamı, iki ondalık basamağa yuvarlanmış
  - `resp` — Kupon doğrulama sonucunu içeren yanıt nesnesi, `ApplyCouponResp` tipi
  - `_e` — Üst seviye `try/catch` bloğunda yakalanan hata nesnesi
  - `msg` — Yakalanan hatanın string olarak çevrilmiş hali, eğer hata bir Error nesnesi ise mesajı, aksi takdirde hatanın kendisini string olarak çevirir
- **Dönüş**: `Response` — HTTP yanıt nesnesi, durum kodu, içerik türü ve CORS başlıkları ile birlikte gönderilir

---

## NODE ID STANDARD

  file: supabase\functions\apply-coupon\index.ts
  function: supabase\functions\apply-coupon\index.ts::buildCors
  function: supabase\functions\apply-coupon\index.ts::apply-coupon_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: apply-coupon_handler
  export: buildCors