---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts
skeleton_hash: 5362ab7566420ae8
entity_hashes:
  func:return-status-notification_handler: 7d2592fd30deaf05
  overview: e61cf19dcdfa935c
generated_at: 2026-05-29T11:47:40Z
---

## Genel Bakış
Bu modül, bir Supabase Edge Function olarak iade (return) durum değişikliklerini yöneten HTTP tabanlı bir bildirim servisidir. Dış sistemlerden gelen istekleri kabul ederek, iade süreçlerindeki durum güncellemelerini işler ve CORS politikalarını uyguladıktan sonra uygun HTTP yanıtını döndürür.

## Fonksiyon Grupları
### İstek Yönetimi ve Bildirim Akışı
Modülün tek ve temel fonksiyonu olan bu işleyici, gelen HTTP isteklerini doğrulayarak iade durum bilgilerini işler ve operasyonun sonucuna göre bir yanıt üretir.
- return-status-notification_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir Supabase Edge Function olarak iade durum bildirimlerini işleyen HTTP isteklerini karşılar. Doğru çalışması için aşağıdaki temel varsayımlar geçerlidir.

[Aksiyom 1]: Eğer istek HTTP gövdesi (request body) geçerli bir JSON formatında değilse veya zorunlu alanları (örn. return_id, status gibi) içermiyorsa, modül 400 Bad Request hatası ile yanıt verir.

[Aksiyom 2]: Eğer istek, modülün çalıştığı Supabase ortamında tanımlı olmayan bir HTTP metodu (GET, PUT, DELETE vb.) ile yapılıyorsa, modül 405 Method Not Allowed hatası ile yanıt verir.

[Aksiyom 3]: Eğer istek, modülün API rotası dışında bir yola yapılıyorsa, modül 404 Not Found hatası ile yanıt verir.

[Aksiyom 4]: Eğer istek tarayıcı kaynaklıysa (Origin header'ı mevcutsa) ve bu kaynak, modülün yapılandırılmış izinli CORS kaynakları listesinde (ALLOWED_ORIGINS) değilse, modül 403 Forbidden hatası ile yanıt verir.

[Aksiyom 5]: Eğer istek başarılı bir şekilde işlenir (iade durumu güncellenir veya bildirim kaydedilirse), modül 200 OK statüsü ile bir başarı yanıtı döner.

[Aksiyom 6]: Eğer istek işlenirken veritabanı bağlantısı kesilirse veya beklenmeyen bir sunucu iç hatası oluşursa, modül 500 Internal Server Error hatası ile yanıt verir.

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: return-status-notification/index.ts::return-status-notification_handler
- **params**: `(req: Request)` — gelen HTTP isteği
- **ic_degiskenler**:
  - `corsHeaders` — CORS izin header nesnesi, Access-Control-Allow-Headers ve Allow-Methods içerir
  - `body` — istek gövdesinin JSON parse edilmiş hali, `ReturnStatusNotificationRequest` tipinde
  - `return_id` — body'den destructure, iade talebi ID'si
  - `old_status` — body'den destructure, iadenin eski durumu
  - `new_status` — body'den destructure, iadenin yeni durumu
  - `reason` — body'den destructure, durum değişikliği sebebi
  - `description` — body'den destructure, opsiyonel açıklama metni
  - `order_id` — body'den destructure (let), sipariş ID'si; return_id'den resolves edilebilir
  - `order_number` — body'den destructure (let), sipariş numarası; veritabanından güncellenebilir
  - `supabaseUrl` — `Deno.env.get('SUPABASE_URL')` Supabase proje URL'i
  - `serviceKey` — `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` service role anahtarı
  - `authHeader` — `req.headers.get('Authorization')` istekten gelen auth header'ı
  - `isAuthorized` — boolean, kullanıcının yetkili olup olmadığını tutar
  - `anonKey` — `Deno.env.get('SUPABASE_ANON_KEY')` anonim anahtar, auth client oluşturmak için
  - `authClient` — `createClient(...)` ile oluşturulan Supabase istemcisi, JWT ile auth doğrulaması yapar
  - `user` — `authClient.auth.getUser()` sonucundan elde edilen kullanıcı nesnesi
  - `roleCheck` — `fetch()` ile user_profiles tablosundan rol sorgulama yanıtı
  - `arr` — roleCheck JSON response'u, Rol array'i
  - `role` — `arr[0]?.role` kullanıcının rolü (admin/superadmin kontrolü)
  - `customer_email` — müşteri e-posta adresi (let, string|undefined), body veya DB'den çözümlenir
  - `customer_name` — müşteri adı (let, string|undefined), body veya DB'den çözümlenir
  - `user_id` — kullanıcı ID'si (let, string|undefined), return veya order kaydından çözümlenir
  - `retRes` — `fetch()` ile venthub_returns tablosundan iade kaydı sorgulama yanıtı
  - `retArr` — retRes JSON response'u, iade kayıtları array'i
  - `ret` — `retArr[0]` ilk iade kaydı; `ret.order_id` ve `ret.user_id` alanlarını içerir
  - `ordRes` — `fetch()` ile venthub_orders tablosundan sipariş kaydı sorgulama yanıtı
  - `ordArr` — ordRes JSON response'u, sipariş kayıtları array'i
  - `ord` — `ordArr[0]` ilk sipariş kaydı; order_number, customer_name, customer_email, user_id alanları
  - `authRes` — `fetch()` ile Supabase auth/v1/admin/users endpoint'inden kullanıcı bilgisi yanıtı
  - `u` — authRes JSON'undan gelen kullanıcı nesnesi, email ve user_metadata içerir
  - `meta` — `u.user_metadata` tipinde, `full_name` veya `name` alanlarını barındırır
  - `prettyOrderNo` — sipariş numarasının görsel formatlanmış hali (# prefixed, split ile)
  - `statusLabel` — `getStatusLabel(new_status)` çağrısıyla elde edilen Türkçe durum etiketi
  - `subject` — e-posta konu satırı, `İade durumu güncellendi - ${prettyOrderNo}`
  - `resendApiKey` — `Deno.env.get('RESEND_API_KEY')` Resend e-posta servisi API anahtarı
  - `emailFrom` — `Deno.env.get('EMAIL_FROM')` e-posta gönderen adresi
  - `emailResponse` — `fetch('https://api.resend.com/emails', ...)` ile gönderilen e-posta yanıtı
  - `errorText` — `await emailResponse.text()` başarısız e-posta yanıtının hata metni
  - `error` — catch bloğu yakalanan hata nesnesi (unknown)
  - `msg` — `error instanceof Error ? error.message : 'Unknown error'` hata mesajı stringi
- **Dönüş**: `Response` — JSON `{ success: true, return_id, new_status }` veya hata/hata yanıtları

---

### [N2_NASIL] AST Pointer: return-status-notification/index.ts::getStatusLabel
- **params**: `(status: string)` — iade durumu anahtarı (ör. "approved", "rejected")
- **ic_degiskenler**:
  - `labels` — `Record<string, string>` Türkçe durum etiketleri sözlüğü; requested→Talep Alındı, approved→Onaylandı, rejected→Reddedildi, in_transit→Kargoda (İade), received→İade Teslim Alındı, refunded→İade Ücreti Ödendi, cancelled→İptal Edildi
- **Dönüş**: `string` — `labels[status]` eşleşmezse ham status değeri döner

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: return-status-notification_handler