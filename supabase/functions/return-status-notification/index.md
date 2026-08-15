---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\return-status-notification\index.ts
skeleton_hash: 340203669ee1476f
entity_hashes:
  func:callerFailure: 86e71a59bf4b25a1
  func:return-status-notification_handler: 7d2592fd30deaf05
  overview: 270876d5561f5a24
generated_at: 2026-08-15T09:03:31Z
---

## Genel Bakış
Supabase Edge Function olarak çalışan bu modül, iade (return) süreçlerindeki durum değişikliklerini dışarıdan gelen HTTP istekleriyle bildirmek üzere tasarlanmış tek amaçlı bir servistir. İstek doğrulama, CORS yönetimi ve hata ele alma mekanizmalarını içeren modül, basit bir istek-yanıt döngüsüyle çalışır.

## Fonksiyon Grupları
### Ana İstek İşleyici
Gelen HTTP isteklerini yöneten merkezi işleyicidir. CORS doğrulaması yapar, istek metodunu kontrol eder, gövdeyi parse eder ve durum bildirimini işleyerek uygun HTTP yanıt kodunu döndürür.

- return-status-notification_handler

### Hata Yönetimi
İşlem sırasında oluşan hataları yakalayan ve standart bir hata yanıt nesnesi üreten yardımcı fonksiyondur. Ana işleyici tarafından hata senaryolarında çağrılarak tutarlı hata formatı sağlar.

- callerFailure

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir Supabase Edge Function olarak iade durum bildirimlerini işleyen bir HTTP servisidir.

[Aksiyom 1]: Eğer `req` parametresi geçerli bir HTTP istek nesnesi (method, header, body içeren) değilse, `return-status-notification_handler` tanımsız davranış gösterir veya hata fırlatır.

[Aksiyom 2]: Eğer istek metodu POST değilse (örn. GET, PUT, DELETE), modül 405 (Method Not Allowed) yanıtı döndürür.

[Aksiyom 3]: Eğer istek gövdesi (body) geçerli bir JSON içermiyorsa veya iade durum bilgisi gerekli alanları eksik/biçimsizse, modül 400 (Bad Request) yanıtı döndürür.

[Aksiyom 4]: Eğer istek kaynaklı CORS politikasını ihlal ediyorsa (örn. izin verilmeyen origin'den geliyorsa), modül 403 (Forbidden) yanıtı döndürür.

[Aksiyom 5]: Eğer `callerFailure` fonksiyonu `null` dışındaki bir değer döndürüyorsa, içinde `status` (number) ve `error` (string) alanları bulunan bir nesne olmalıdır; aksi halde üst seviye hata yakalama mekanizması bozulur.

[Aksiyom 6]: Eğer `@serve(serve)` dekoratörü Supabase Edge Function runtime ortamında çalışmıyorsa veya `serve` utility'si sağlanamıyorsa, modül hiç çalışmaz.

[Aksiyom 7]: Eğer istek başarılı şekilde işlenirse (iade durumu geçerli ve tamamlandıysa), modül 200 (OK) yanıtı döndürür.

[Aksiyom 8]: Eğer istek hedeflediğim iade/kaynak bulunamıyorsa, modül 404 (Not Found) yanıtı döndürür.

---

## FONKSİYON DETAYLARI

### callerFailure
**Ne yapar**: Bu fonksiyon, bir hata nesnesini alır ve tanımlı API hata türlerine karşılık gelen HTTP durum kodu ile standart bir hata mesajı içeren bir nesneye dönüştürür. Amaç, farklı hata kaynaklarını (örneğin, yetkilendirme veya yapılandırma hatalarını) tutarlı bir HTTP yanıt formatında dışarıya sunmaktır.

**Nasıl yapar**: Fonksiyon, gelen `error` parametresinin belirli özel hata sınıfları (`TenantMismatchError`, `CallerConfigError`, `CallerLookupError`) ile eşleşip eşleşmediğini `instanceof` operatörü ile kontrol eder. Eşleşme sağlandığında, ilgili HTTP durum kodu ve sembolik hata string'ini içeren bir nesne döndürür. Hiçbir eşleşme bulunamazsa, fonksiyon `null` değeri dönerek hatanın bu fonksiyon tarafından ele alınamayacağını belirtir. Fonksiyon safdır ve yan etkisi yoktur, sadece girdiye göre bir eşleme yapar.

**Parametreler**:
- error: `unknown` — İşlenmek istenen hata nesnesi. Fonksiyon, bu parametrenin çalışma zamanında hangi sınıfa ait olduğunu (`instanceof` kontrolü ile) belirler ve ona göre davranır. `unknown` tipi, herhangi bir türde hata gelebileceğine işaret eder.

**Dönüş**: `{ status: number; error: string } | null` — Eğer gelen hata, desteklenen üç özel hata türünden birine aitse, `status` alanı HTTP durum kodunu (403, 500 veya 503), `error` alanı ise okunabilir veya standart bir hata mesajını ("tenant_mismatch", "CONFIG_MISSING", "profile_lookup_failed") içeren bir nesne döner. Desteklenmeyen bir hata gelirse `null` dönerek çağrıcının hatanın bu düzeyde ele alınamayacağını anlamasını sağlar.

### return-status-notification_handler

**Ne yapar**: Return (iade) durum değişikliklerini bildirim olarak işleyen bir HTTP istek yöneticisi fonksiyonudur. Supabase Edge Function yapısında çalışarak, iade taleplerinin durum güncelleme işlemlerini tetikleyen bildirimleri yönetir.

**Nasıl yapar**: Fonksiyon, gelen HTTP isteğini (`req` parametresi) alır ve bu istek içindeki iade durum bilgilerini işler. Edge Function mimarisi içinde çalışarak, istemci tarafından gönderilen iade durum değişikliğini alır, gerekli bildirim mantığını uygular ve bir `Response` nesnesi döndürerek işlem sonucunu iletir.

**Parametreler**:
- `req`: Request — HTTP istek nesnesi. İade durum bildirimi için gerekli verileri (iade ID'si, yeni durum, kullanıcı bilgileri vb.) içeren istek gövdesi ve meta bilgilerini barındırır.

**Dönüş**: `Response` — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı bildirim gönderiminde onay mesajı, hata durumunda ise hata bilgisi ve uygun HTTP durum kodunu döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../_shared/cors.ts::getCorsHeaders
- import: ../_shared/tenant_config.ts::getTenantBranding
- import: https://deno.land/std@0.168.0/http/server.ts::serve

---

## INTERFACES

### ReturnStatusNotificationRequest
- `return_id: string`
- `order_id?: string`
- `order_number?: string`
- `customer_email?: string`
- `customer_name?: string`
- `old_status: string`
- `new_status: string`
- `reason: string`
- `description?: string | null`
- `tenant_id?: string`

### ResendResult
- `id?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-wt-hotfix\supabase\functions\return-status-notification\index.ts::callerFailure
- **params**: (error: unknown)
- **ic_degiskenler**:
  - (yok — sadece parametre ve return kullanılır)
- **Dönüş**: `{ status: number; error: string } | null`

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-wt-hotfix\supabase\functions\return-status-notification\index.ts::return-status-notification_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — getCorsHeaders(req) ile elde edilen HTTP CORS başlıkları
  - `body` — req.json() ile parse edilen istek gövdesi (ReturnStatusNotificationRequest tipinde)
  - `return_id` — body.return_id, iade ID'si
  - `old_status` — body.old_status, güncellenmeden önceki durum
  - `new_status` — body.new_status, güncellenen yeni durum
  - `reason` — body.reason, iade sebebi
  - `description` — body.description, iade açıklaması
  - `order_id` — body.order_id, sipariş ID'si (sonra API'den güncellenebilir)
  - `order_number` — body.order_number, sipariş numarası (sonra API'den güncellenebilir)
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL'), Supabase proje URL'si
  - `serviceKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), service role anahtarı
  - `ctx` — resolveCaller(req, body) ile elde edilen CallerContext (kimlik bilgileri)
  - `tenantId` — ctx.tenantId, doğrulanmış tenant identifier
  - `branding` — getTenantBranding(tenantId) ile elde edilen tenant branding konfigürasyonu
  - `customer_email` — müşteri e-posta adresi (başlangıçta undefined, API'lerden veya body'den doldurulur)
  - `customer_name` — müşteri adı (aynı şekilde doldurulur)
  - `user_id` — Supabase Auth kullanıcı ID'si (API'lerden doldurulur)
  - `brandName` — branding.brandName, marka adı
  - `brandPrimary` — branding.brandPrimaryColor, marka birincil rengi
  - `brandLogoUrl` — branding.brandLogoUrl, marka logo URL'si
  - `prettyOrderNo` — sipariş numarasının görsel formatlanmış hali (# ile)
  - `statusLabel` — getStatusLabel(new_status) çağrısı ile elde edilen durum etiketi
  - `subject` — e-posta konu satırı (marka adı ve sipariş numarası içerir)
  - `message` — getStatusMessage(new_status).message, müşteriye özel durum mesajı
  - `nextSteps` — getStatusMessage(new_status).nextSteps, sonraki adımlar (opsiyonel)
  - `emailContent` — düz metin e-posta gövdesi (Resend text: alanı için)
  - `html` — HTML formatında e-posta gövdesi
  - `resendApiKey` — Deno.env.get('RESEND_API_KEY'), Resend API anahtarı
  - `emailFrom` — branding.emailFrom, gönderen e-posta adresi
  - `notifyDebug` — Deno.env.get('NOTIFY_DEBUG') === 'true', debug modu flag'i
  - `emailResponse` — Resend API POST yanıt Response nesnesi
  - `result` — emailResponse.json() ile parse edilen Resend sonucu
  - `retArr` — venthub_returns sorgusundan dönen dizi
  - `ret` — retArr[0], venthub_returns tablosundaki ilk kayıt (order_id ve user_id içerir)
  - `ordArr` — venthub_orders sorgusundan dönen dizi
  - `ord` — ordArr[0], venthub_orders tablosundaki ilk kayıt (order_number, customer_email, customer_name, user_id içerir)
  - `u` — Supabase Auth admin/users yanıtından elde edilen kullanıcı objesi
  - `meta` — u.user_metadata, kullanıcının profil metadata'sı (full_name veya name içerir)
  - `missing` — eksik alanların listesi (return_id/new_status kontrolünde)
  - `msg` — catch bloğunda error.message veya 'Unknown error' (hata mesajı)
- **Dönüş**: Response (HTTP yanıtı, JSON payload ile)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-wt-hotfix\supabase\functions\return-status-notification\index.ts::getStatusLabel
- **params**: (status: string)
- **ic_degiskenler**:
  - `labels` — durum kodlarını Türkçe etiketlere eşleyen nesne (Record<string, string>)
- **Dönüş**: string (durum etiketi veya orijinal status)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-wt-hotfix\supabase\functions\return-status-notification\index.ts::getStatusMessage
- **params**: (status: string)
- **ic_degiskenler**:
  - (yok — sadece switch-case ve return)
- **Dönüş**: `{ message: string; nextSteps?: string }` (müşteriye özel mesaj ve opsiyonel sonraki adımlar)

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::callerFailure
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: callerFailure
  export: return-status-notification_handler