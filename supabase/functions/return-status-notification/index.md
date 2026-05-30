---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts
skeleton_hash: 70775c6410a3ad58
entity_hashes:
  func:return-status-notification_handler: 7d2592fd30deaf05
  overview: 2f67488397ccb15e
generated_at: 2026-05-30T21:16:46Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak iade (return) durum değişikliklerini yöneten HTTP tabanlı bir bildirim servisidir. Dış sistemlerden gelen POST isteklerini kabul ederek, iade süreçlerindeki durum güncellemelerini işler, CORS politikalarını uygular ve uygun HTTP yanıt kodlarıyla operasyonun sonucunu döndürür.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Yönetimi
Modülün tek ve temel işleyicisi olan bu fonksiyon, gelen HTTP isteklerini doğrular, CORS kurallarını uygular, istek gövdesindeki iade durum bilgisini işler ve başarılı ya da hata durumuna göre uygun HTTP yanıtını (200, 400, 403, 404, 405) üretir.
- return-status-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase Edge Function runtime ortamında HTTP istekleriyle iade durum bildirimlerini işleyen bir servistir.

**[Aksiyom 1]**: Eğer `req` parametresi geçerli bir HTTP request nesnesi değilse, istek işlenemez ve hata yanıtı döndürülmesi gerekir.

**[Aksiyom 2]**: Eğer HTTP response nesnesi oluşturulamazsa (headers, body gibi), istemci tarafında iletişim kopukluğu oluşur.

**[Aksiyom 3]**: Eğer istek methodu POST以外 (GET, DELETE vb.) ise, işlenemeyen metod için uygun HTTP 405 (Method Not Allowed) yanıtı döndürülmesi gerekir.

**[Aksiyom 4]**: Eğer istek gövdesi (request body) geçerli JSON formatında değilse, parsing hatası oluşur ve 400 Bad Request yanıtı döndürülmesi gerekir.

**[Aksiyom 5]**: Eğer CORS origin başlıkları doğrulanamazsa, tarayıcı tabanlı istekler engellenebilir (CORS policy violation).

**[Aksiyom 6]**: Eğer modül Supabase Edge Function runtime ortamında (Deno) çalıştırılmazsa, runtime-specific API'ler (Deno.fetch, Edge Function context) kullanılamaz ve fonksiyon başarısız olur.

---

## FONKSİYON DETAYLARI

### return-status-notification_handler

**Ne yapar**: Return (iade) durum değişikliklerini bildirim olarak işleyen bir HTTP istek yöneticisi fonksiyonudur. Supabase Edge Function yapısında çalışarak, iade taleplerinin durum güncelleme işlemlerini tetikleyen bildirimleri yönetir.

**Nasıl yapar**: Fonksiyon, gelen HTTP isteğini (`req` parametresi) alır ve bu istek içindeki iade durum bilgilerini işler. Edge Function mimarisi içinde çalışarak, istemci tarafından gönderilen iade durum değişikliğini alır, gerekli bildirim mantığını uygular ve bir `Response` nesnesi döndürerek işlem sonucunu iletir.

**Parametreler**:
- `req`: Request — HTTP istek nesnesi. İade durum bildirimi için gerekli verileri (iade ID'si, yeni durum, kullanıcı bilgileri vb.) içeren istek gövdesi ve meta bilgilerini barındırır.

**Dönüş**: `Response` — İşlem sonucunu içeren HTTP yanıt nesnesi. Başarılı bildirim gönderiminde onay mesajı, hata durumunda ise hata bilgisi ve uygun HTTP durum kodunu döndürür.

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase\functions\return-status-notification\index.ts::return-status-notification_handler
- **params**: `(req)`
- **ic_degiskenler**:
  - `corsHeaders` — CORS ayarlarını içeren nesne, response header'larında kullanılır
  - `body` — Request body'sinden parse edilen JSON verisi (ReturnStatusNotificationRequest tipinde)
  - `return_id` — body'den gelen iade talebi ID'si
  - `old_status` — body'den gelen eski durum kodu
  - `new_status` — body'den gelen yeni durum kodu
  - `reason` — body'den gelen durum değişikliği sebebi
  - `description` — body'den gelen açıklama metni (opsiyonel)
  - `order_id` — body'den gelen veya veritabanından çözülen sipariş ID'si
  - `order_number` — body'den gelen veya veritabanından çözülen sipariş numarası
  - `tenantId` — resolveTenantId() ile belirlenen kiraci ID'si
  - `branding` — getTenantBranding() ile alınan kiraci marka bilgileri
  - `supabaseUrl` — SUPABASE_URL ortam değişkeninden alınan URL
  - `serviceKey` — SUPABASE_SERVICE_ROLE_KEY ortam değişkeninden alınan anahtar
  - `authHeader` — request header'ından alınan Authorization değeri
  - `isAuthorized` — kullanıcının yetkilendirilip yetkilendirilmediğini tutan boolean
  - `anonKey` — SUPABASE_ANON_KEY ortam değişkeninden alınan anonim anahtar
  - `createClient` — dinamik import ile yüklenen Supabase client oluşturucu fonksiyon
  - `authClient` — createClient ile oluşturulan kimlik doğrulama istemcisi
  - `roleCheck` — user_profiles tablosunda rol kontrolü için yapılan fetch isteği
  - `arr` — roleCheck.json() ile parse edilen rol verisi dizisi
  - `arr[0]?.role` — ilk kullanıcının rolü (admin veya superadmin olmalı)
  - `customer_email` — müşteri email adresi (veritabanından veya body'den)
  - `customer_name` — müşteri adı (veritabanından veya body'den)
  - `user_id` — kullanici ID'si (veritabanından)
  - `retRes` — venthub_returns tablosundan iade verisini çeken fetch isteği
  - `retArr` — retRes.json() ile parse edilen iade verisi dizisi
  - `ret` — retArr[0] olarak alınan ilk iade kaydı
  - `ordRes` — venthub_orders tablosundan sipariş verisini çeken fetch isteği
  - `ordArr` — ordRes.json() ile parse edilen sipariş verisi dizisi
  - `ord` — ordArr[0] olarak alınan ilk sipariş kaydı
  - `authRes` — Supabase auth API'sinden kullanıcı bilgilerini çeken fetch isteği
  - `u` — authRes.json() ile parse edilen kullanıcı nesnesi
  - `meta` — u.user_metadata alanından alınan kullanıcı meta verileri
  - `brandName` — branding.brandName değerinden alınan marka adı
  - `brandPrimary` — branding.brandPrimaryColor değerinden alınan ana renk kodu
  - `brandLogoUrl` — branding.brandLogoUrl değerinden alınan logo URL'i
  - `prettyOrderNo` — sipariş numarasının formatlanmış hali (# işareti ile)
  - `getStatusLabel` — durum kodunu Türkçe etikete çeviren iç fonksiyon
  - `statusLabel` — getStatusLabel() ile dönüştürülen Türkçe durum etiketi
  - `subject` — e-posta konu satırı
  - `resendApiKey` — RESEND_API_KEY ortam değişkeninden alınan e-posta servisi anahtarı
  - `emailFrom` — branding.emailFrom değerinden alınan gönderici e-posta adresi
  - `emailResponse` — Resend API'sine yapılan e-posta gönderim isteği
- **Dönüş**: Response (çeşitli durumlarda: success, error, veya disabled yanıtları)

### [N2_NASIL] AST Pointer: supabase\functions\return-status-notification\index.ts::getStatusLabel
- **params**: `(status: string)`
- **ic_degiskenler**:
  - `labels` — durum kodlarını Türkçe etiketlere eşleyen Record nesnesi
- **Dönüş**: string (Türkçe durum etiketi veya orijinal durum kodu)

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: return-status-notification_handler