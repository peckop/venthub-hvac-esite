---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts
skeleton_hash: 23ba0ccb2f46a67a
entity_hashes:
  func:return-status-notification_handler: 7d2592fd30deaf05
  overview: 54a0239dcbdbb346
generated_at: 2026-05-28T22:48:43Z
---

## Genel Bakış
Bu modül, ürün iadelerindeki durum değişikliklerini izleyen bir Supabase Edge Function'dır. Dış sistemlerden gelen HTTP isteklerini karşılayarak iade bildirim akışını yönetir, CORS politikalarını uygular ve işlemlerin sonucuna göre uygun HTTP yanıtları üretir.

## Fonksiyon Grupları
### İstek İşleme ve Yanıt Oluşturma
Dış sistemlerden gelen iade durum bildirimlerini kabul eder, istek doğrulamalarını ve CORS yapılandırmalarını yöneterek HTTP yanıtını üretir.
- return-status-notification_handler

---



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

### [N1_NASIL] AST Pointer: supabase/functions/return-status-notification/index.ts::return-status-notification_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `corsHeaders` — CORS başlık nesnesi, izin verilen origins, headers ve methods tanımlar
  - `body` — Request JSON gövdesinden parse edilmiş ReturnStatusNotificationRequest tipinde veri
  - `return_id` — body.return_id'den alınan iade talebi ID'si
  - `old_status` — body.old_status'ten alınan önceki durum
  - `new_status` — body.new_status'ten alınan yeni durum
  - `reason` — body.reason'dan alınan iade sebebi
  - `description` — body.description'dan alınan iade açıklaması (opsiyonel)
  - `order_id` — body.order_id'den alınan sipariş ID'si (sonradan güncellenebilir)
  - `order_number` — body.order_number'dan alınan sipariş numarası (sonradan güncellenebilir)
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile alınan Supabase URL'i
  - `serviceKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile alınan servis rolü anahtarı
  - `authHeader` — req.headers.get('Authorization') ile alınan yetkilendirme başlığı
  - `isAuthorized` — Yetkilendirme durumunu tutan boolean bayrak
  - `anonKey` — Deno.env.get('SUPABASE_ANON_KEY') ile alınan anonim anahtar (yalnızca auth fallback'de kullanılır)
  - `authClient` — Supabase istemcisi, anonim anahtar ile oluşturulur
  - `user` — authClient.auth.getUser() sonucu elde edilen kullanıcı nesnesi
  - `roleCheck` — Kullanıcı rolünü kontrol etmek için yapılan fetch isteği sonucu
  - `arr` — roleCheck yanıtının JSON array'i
  - `role` — arr[0]?.role ile alınan kullanıcı rolü
  - `customer_email` — Müşteri e-posta adresi, çeşitli kaynaklardan güncellenebilir
  - `customer_name` — Müşteri adı, çeşitli kaynaklardan güncellenebilir
  - `user_id` — Kullanıcı ID'si, çeşitli kaynaklardan güncellenebilir
  - `retRes` — venthub_returns tablosundan iade bilgisi sorgulama isteği sonucu
  - `retArr` — retRes yanıtının JSON array'i
  - `ret` — retArr dizisinin ilk elemanı veya null
  - `ordRes` — venthub_orders tablosundan sipariş bilgisi sorgulama isteği sonucu
  - `ordArr` — ordRes yanıtının JSON array'i
  - `ord` — ordArr dizisinin ilk elemanı veya null
  - `authRes` — auth/v1/admin/users API'sinden kullanıcı bilgisi alma isteği sonucu
  - `u` — authRes yanıtının JSON nesnesi veya null
  - `meta` — u.user_metadata nesnesi, full_name veya name alanlarını içerir
  - `getStatusLabel` — Durum kodunu Türkçe etikete dönüştüren iç fonksiyon
  - `statusLabel` — getStatusLabel(new_status) ile elde edilen durum etiketi
  - `subject` — E-posta konusu, sipariş numarası ile formatlanmış
  - `resendApiKey` — Deno.env.get('RESEND_API_KEY') ile alınan Resend API anahtarı
  - `emailFrom` — Deno.env.get('EMAIL_FROM') ile alınan e-posta gönderici adresi
  - `emailResponse` — Resend API'ye e-posta gönderme isteği sonucu
  - `errorText` — emailResponse başarısız olduğunda alınan hata metni
  - `msg` — Yakalanan hata nesnesinin message özelliği
- **Dönüş**: Response (JSON içinde success: true ve return_id, new_status alanları) veya hata Response'ları

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: return-status-notification_handler