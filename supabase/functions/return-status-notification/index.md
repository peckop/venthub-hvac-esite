---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts
skeleton_hash: 23ba0ccb2f46a67a
generated_at: 2026-05-24T10:46:31Z
---

## Genel Bakış
Bu modül, ürün iadelerindeki durum değişikliklerini ele alan ve bildirim akışını yöneten bir Supabase fonksiyonudur. Gelen HTTP isteklerini karşılayarak iade detaylarını işler, CORS yapılandırmasını uygular ve uygun bir yanıt döner.

## Fonksiyon Grupları
### İstek İşleme
Bu grup, dış sistemlerden gelen iade durum bildirimlerini kabul etmek, gerekli başlık ayarlarını yönetmek ve yanıt üretmekten sorumludur.
- return-status-notification_handler

---

## AXIOMS – Mimari Varsayımlar
Bu modül, işlevin doğru çalışabilmesi için bir HTTP isteği nesnesi (`req`) sağlanmasını varsayar.

[Aksiyom 1]: Eğer `req` parametresi fonksiyona geçirilmezse veya `undefined`/`null` ise, fonksiyon içindeki `req` üzerindeki özellik erişimleri hata (örneğin `TypeError: Cannot read property ... of undefined`) verebilir.  
[Aksiyom 2]: Eğer `req` bir obje değilse (örneğin string, sayı, boolean), fonksiyonun `req` üzerindeki özellik okuma işlemleri çalışma zamanında hata fırlatabilir.

---

## FONKSIYON DETAYLARI

### return-status-notification_handler
**Ne yapar**:  
Bu fonksiyon, `return-status-notification` Supabase Edge Function'ına gelen HTTP isteklerini işleyen ana işleyicidir. İstek içeriğine bağlı olarak ilgili mantığı çalıştırır ve uygun bir HTTP yanıtı döndürür. Fonksiyon, dönüş durumu bildirimleriyle ilgili süreçleri yönetmek üzere tasarlanmıştır.

**Nasıl yapar**:  
İşlev, bir istek nesnesi (`Request`) alarak başlar. Bu isteği ayrıştırır, gerekli doğrulamaları yapar ve iş mantığını yürütür. Ardından, işlemin sonucuna göre bir `Response` nesnesi oluşturup geri döndürür. Detaylı uygulama içeriği bu dokümantasyon kapsamında sağlanmamıştır.

**Parametreler**:  
- **req**: Request — Gelen HTTP isteğini temsil eden standart Request nesnesi. İsteğin gövdesi, başlıkları ve diğer özelliklerine erişim sağlar.

**Dönüş**:  
**Response** — HTTP yanıtı olarak döndürülen Response nesnesi. Yanıt, işlemin başarı veya başarısızlık durumuna göre uygun status code ve body ile oluşturulur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts::return-status-notification_handler
- **params**: [req: Request]
- **ic_degiskenler**:
  - `corsHeaders` — CORS izinlerini tanımlayan header objesi, tüm API cevaplarında kullanılır
  - `body` - İstek gövdesinden parse edilen JSON nesnesi, ReturnStatusNotificationRequest tipinde tip dönüşümü yapılmıştır
  - `return_id` - İade kaydının benzersiz kimliği, istek gövdesinden ayrıştırılmıştır
  - `old_status` - İadenin önceki durumu, istek gövdesinden ayrıştırılmıştır
  - `new_status` - İadenin güncellendiği yeni durumu, istek gövdesinden ayrıştırılmıştır
  - `reason` - İade durumu değişikliğinin sebebi, istek gövdesinden ayrıştırılmıştır
  - `description` - İade durumu değişikliği için ek açıklama, istek gövdesinden ayrıştırılmıştır
  - `order_id` - İadenin ait olduğu siparişin kimliği, önce istek gövdesinden alınır, sonradan Supabase'den güncellenir
  - `order_number` - İadenin ait olduğu siparişin numarası, önce istek gövdesinden alınır, sonradan Supabase'den güncellenir
  - `supabaseUrl` - Supabase proje URL'i, ortam değişkeninden alınır
  - `serviceKey` - Supabase servis rolü erişim anahtarı, ortam değişkeninden alınır
  - `authHeader` - İstekten alınan Authorization header değeri, yetki kontrolü için kullanılır
  - `isAuthorized` - İsteği yapan kullanıcının işleme erişim yetkisi olup olmadığını tutan boolean değer
  - `anonKey` - Supabase anon erişim anahtarı, yetki kontrolü sırasında kullanılır
  - `createClient` - Supabase istemci nesnesi oluşturma fonksiyonu, dinamik olarak import edilir
  - `authClient` - Kullanıcı oturumunu doğrulamak için oluşturulan Supabase istemcisi
  - `user` - Oturumu doğrulanmış kullanıcı nesnesi, Supabase auth servisinden alınır
  - `roleCheck` - Kullanıcının admin rolünü sorgulamak için veritabanına yapılan fetch isteği cevabı
  - `arr` - Rol sorgusundan dönen JSON dizisi
  - `role` - Kullanıcının veritabanındaki rolü, yetki kontrolü için kullanılır
  - `err` - Yetki kontrolü sırasında oluşan hatayı tutan değişken
  - `customer_email` - Bildirimin gönderileceği müşterinin email adresi, istek gövdesinden veya Supabase'den alınır
  - `customer_name` - Bildirimin gönderileceği müşterinin adı, istek gövdesinden veya Supabase'den alınır
  - `user_id` - Müşterinin platformdaki kullanıcı kimliği, iade/sipariş kaydından alınır
  - `retRes` - İade kaydını veritabanından çekmek için yapılan fetch isteği cevabı
  - `retArr` - İade sorgusundan dönen JSON dizisi
  - `ret` - İade kaydı nesnesi, sorgu sonucu dönen dizinin ilk elemanı
  - `ordRes` - Sipariş kaydını veritabanından çekmek için yapılan fetch isteği cevabı
  - `ordArr` - Sipariş sorgusundan dönen JSON dizisi
  - `ord` - Sipariş kaydı nesnesi, sorgu sonucu dönen dizinin ilk elemanı
  - `authRes` - Kullanıcı bilgilerini Supabase auth API'den çekmek için yapılan fetch isteği cevabı
  - `u` - Auth API'den dönen kullanıcı nesnesi
  - `meta` - Kullanıcının auth servisindeki metadata'sı, müşteri adını almak için kullanılır
  - `prettyOrderNo` - Kullanıcıya gösterilmek üzere formatlanmış okunabilir sipariş numarası
  - `getStatusLabel` - Statü kodlarını Türkçe etiketlere çeviren tanımlı iç fonksiyon
  - `statusLabel` - Yeni iade durumu için elde edilen insan okunabilir etiket
  - `subject` - Gönderilecek emailin konusu
  - `resendApiKey` - Resend email servisi API anahtarı, ortam değişkeninden alınır
  - `emailFrom` - Bildirim emailinin gönderici adresi, ortam değişkeninden alınır
  - `emailResponse` - Resend API'ye email göndermek için yapılan POST isteği cevabı
  - `errorText` - Email gönderme hatasında API'den dönen hata mesajı
  - `error` - Ana işlem bloğunda oluşan genel hata nesnesi
  - `msg` - Hata nesnesinden çıkarılan okunabilir hata mesajı
- **Dönüş**: Response

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\return-status-notification\index.ts::getStatusLabel
- **params**: [status: string]
- **ic_degiskenler**:
  - `labels` - İade statü kodlarını Türkçe insan okunabilir etiketlere eşleyen sözlük, tüm olası statülerin çevirisini içerir
- **Dönüş**: string

---

## NODE ID STANDARD

  file: supabase\functions\return-status-notification\index.ts
  function: supabase\functions\return-status-notification\index.ts::return-status-notification_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: return-status-notification_handler