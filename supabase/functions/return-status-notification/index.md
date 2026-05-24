---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts
skeleton_hash: 23ba0ccb2f46a67a
generated_at: 2026-05-24T08:02:54Z
---

## Genel Bakış
Bu modül, bir iade durumu bildirimini işleyen bir Supabase fonksiyonudur. Gelen HTTP isteğini alır, gerekli işlemleri yapar ve uygun bir yanıt döndürür.

## Fonksiyon Grupları
### İstek İşleme
Bu grup, dışarıdan gelen istekleri yakalayıp yanıt üretmekten sorumludur.
- return-status-notification_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `req` parametresi fonksiyona geçirilmezse, JavaScript `undefined` değeriyle çağrılacak ve fonksiyon içindeki `req` üzerindeki özellik erişimleri hata (örneğin `TypeError: Cannot read property ... of undefined`) verebilir.

---

## FONKSIYON DETAYLARI

### return-status-notification_handler
**Ne yapar**: Gelen HTTP isteğini işler ve bir durum bildirimi içeren bir `Response` nesnesi döndürür.  
**Nasıl yapar**: Fonksiyon, `req` parametresi üzerinden isteği okur, gerekli durum bilgilerini hazırlar ve bu bilgileri taşıyan bir `Response` objesi oluşturur.  
**Parametreler**:  
- req: tip belirtilmemiş — İşlenecek HTTP isteği nesnesi  
**Dönüş**: `Response` — İşlem sonucunu ve durum bildirimini taşıyan HTTP yanıtı.

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: return-status-notification/index.ts::return-status-notification_handler
- **params**: req
- **ic_degiskenler**:
  - `corsHeaders` — CORS yanıt başlıklarını tanımlayan nesne; OPTIONS ve POST istekleri için Access-Control-Allow-Origin, Headers ve Methods değerlerini içerir.
  - `body` — İstek JSON gövdesinin ayrıştırılmış hali; ReturnStatusNotificationRequest tipinde, return_id, old_status, new_status, reason, description, order_id, order_number, customer_email, customer_name gibi alanları içerir.
  - `return_id` — İade kaydının benzersiz tanımlayıcısı; body.return_id den gelir.
  - `old_status` — İadenin önceki durumu; body.old_status.
  - `new_status` — İadenin güncel durumu; body.new_status.
  - `reason` — İade durum değişikliği için açıklanan sebep; body.reason.
  - `description` — İade ile ilgili ekstra açıklama; body.description (opsiyonel).
  - `order_id` — Sipariş kimliği; body.order_id den gelir, gerekirse veritabanından doldurulur.
  - `order_number` — Sipariş numarası; body.order_number den gelir, gerekirse veritabanından doldurulur.
  - `supabaseUrl` — Supabase proje URL'si; Deno.env.get('SUPABASE_URL') ile alınır, boş string varsayılan.
  - `serviceKey` — Supabase service_role anahtarı; Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile alınır, boş string varsayılan.
  - `authHeader` — İstekteki Authorization başlığı; req.headers.get('Authorization') ile okunur.
  - `isAuthorized` — İsteğin yetkilendirilip edilmediğini gösteren boolean flag; serviceKey ile doğrudan karşılaştırma veya anon key üzerinden kullanıcı rolü kontrolüyle belirlenir.
  - `customer_email` — Müşterinin e-posta adresi; supabase yapılandırması yoksa body.customer_email, yoksa veritabanı veya auth çağrılarıyla çözümlenir.
  - `customer_name` — Müşterinin adı; benzer şekilde body.customer_name veya veritabanından elde edilir.
  - `user_id` — Supabase auth kullanıcı kimliği; return veya order kayıtlarından elde edilerek, gerekirse kullanıcı bilgileri çekmek için kullanılır.
  - `prettyOrderNo` — Görüntülenecek kısa sipariş numarası; order_number varsa ikinci bölümüyle, yoksa order_id'nin son 8 karakteri büyük harfle oluşturulur.
  - `statusLabel` — new_status değerinin Türkçe karşılığı; getStatusLabel iç fonksiyon tarafından döndürülür.
  - `subject` — E-posta konusu; "İade durumu güncellendi - " ve prettyOrderNo birleştirilerek oluşturulur.
  - `resendApiKey` — Resend e-posta servisi API anahtarı; Deno.env.get('RESEND_API_KEY') ile alınır.
  - `emailFrom` — E-posta gönderici adresi; Deno.env.get('EMAIL_FROM') ile alınır, varsayılan 'VentHub <info@venthub.com>'.
  - `emailResponse` — Resend API'ye yapılan e-posta gönderme isteğinin yanıtı; fetch sonucu.
  - `error` — Yakalanan istisna (catch bloğu); error: unknown tipinde, hata mesajı çıkartmak için kullanılır.
  - `msg` — error nesnesinden çıkarılan hata mesajı string; error instanceof Error kontrolüyle belirlenir.
  - `retRes` — Supabase rest/v1/venthub_returns endpointine yapılan get isteğinin yanıtı; return_id üzerinden order_id ve user_id çekmek için.
  - `retArr` — retRes.json() sonucu; dizi olarak beklenir.
  - `ret` — retArr[0] veya null; dönen return kaydı.
  - `ordRes` — Supabase rest/v1/venthub_orders endpointine yapılan get isteğinin yanıtı; order_id üzerinden sipariş bilgileri.
  - `ordArr` — ordRes.json() sonucu.
  - `ord` — ordArr[0] veya null; dönen order kaydı.
  - `authRes` — Supabase auth v1 admin users endpointine yapılan get isteğinin yanıtı; user_id üzerinden kullanıcı metadata.
  - `u` — authRes.json() sonucu; kullanıcı nesnesi.
  - `meta` — u.user_metadata veya boş obje; full_name veya name alanlarını içerir.
- **Dönüş**: Response

### [N2_NASIL] AST Pointer: return-status-notification/index.ts::getStatusLabel
- **params**: status
- **ic_degiskenler**:
  - `labels` — status kodunun Türkçe etiketini eşleyen harita (Record<string,string>); requested, approved, rejected, in_transit, received, refunded, cancelled gibi değerleri içerir.
- **Dönüş**: string

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: return-status-notification_handler