---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts
skeleton_hash: 16704d3ccdf6ab6d
entity_hashes:
  func:admin-order-inspect_handler: 1ddac70ce14150b4
  overview: 0cc3e3cc63074f53
generated_at: 2026-05-28T22:41:30Z
---

## Genel Bakış
Bu modül, Supabase Edge Function ortamında çalışan bir admin-only sipariş inceleme servisidir. Tek bir HTTP işleyici fonksiyonu aracılığıyla yetkili yöneticilerin sipariş detaylarını güvenli bir şekilde görüntülemesini sağlar — kimlik doğrulama, yetkilendirme ve veri sorgulama adımlarını tek bir akışta yönetir.

## Fonksiyon Grupları
### HTTP İsteğe Bağlı İşleyici
Modülün dış dünyayla tek temas noktası olarak tüm istek akışını yönetir: kimlik doğrulamasını doğrular, sipariş verisini çeker ve sonucu HTTP yanıtı olarak döndürür.
- admin-order-inspect_handler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından türetilebilen minimum aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `req` parametresi (Request nesnesi) sağlanmamış veya `None`/`null`/`undefined` ise, `admin-order-inspect_handler` fonksiyonu düzgün çalışamaz ve istek işlenemez.

---

## FONKSİYON DETAYLARI

### admin-order-inspect_handler
**Ne yapar**: Bu fonksiyon, bir HTTP isteğini alarak bir admin sipariş inceleme işlemini yönetir ve uygun bir HTTP yanıtı döndürür. Genellikle bir web sunucusu veya sunucu tarafı bir çerçeve içinde istekleri yönlendirmek için bir dinleyici (handler) olarak kullanılır.

**Nasıl yapar**: Fonksiyon, gelen `Request` nesnesinden gerekli verileri (örneğin, istek gövdesi, parametreler, başlıklar) çıkarır. Ardından, bir admin siparişinin detaylarını doğrulama, yetkilendirme veya veritabanından getirme gibi bir dizi iş mantığını yürütür. İşlem sonucunda,成功或失败 durumuna uygun bir durum kodu ve gövde içeren bir `Response` nesnesi oluşturarak döndürür.

**Parametreler**:
- `req`: `Request` — Gelen HTTP isteğini temsil eden nesne. İstek metodu, URL, başlıklar ve gövde gibi verileri içerir.

**Dönüş**: `Response` — İşlemin sonucunu içeren HTTP yanıtı. Genellikle bir durum kodu (örneğin, 200 başarılı, 404 bulunamadı, 500 sunucu hatası) ve isteğe bağlı olarak bir JSON gövdesi veya metin içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `cors` — CORS başlıklarını içeren Record, tüm yanıtlara eklenir
  - `supabaseUrl` — Deno ortam değişkeninden okunan Supabase URL adresi
  - `serviceRoleKey` — Deno ortam değişkeninden okunan Supabase servis rol anahtarı
  - `anonKey` — Deno ortam değişkeninden okunan Supabase anonim anahtarı
  - `authHeader` — İstek başlığından okunan Authorization değeri
  - `supabaseUser` — Kullanıcı oturumuyla oluşturulmuş Supabase istemcisi (anonKey + auth header ile)
  - `supabaseAdmin` — Servis rol anahtarıyla oluşturulmuş Supabase admin istemcisi
  - `userRes` — `supabaseUser.auth.getUser()` çağrısının döndüğü data; kullanıcı nesnesini içerir
  - `userErr` — `getUser()` çağrısının hata nesnesi
  - `profile` — `user_profiles` tablosundan sorgulanan kullanıcının rol bilgisi
  - `profErr` — profil sorgusunun hata nesnesi
  - `userRole` — profile?.role'den elde edilen kullanıcının rol stringi (admin/superadmin kontrolü için)
  - `id` — Sorgu parametresinden veya POST body'den alınan sipariş ID değeri
  - `conv` — Sorgu parametresinden veya POST body'den alınan conversation/değerlendirme değeri
  - `url` — `req.url` stringinden oluşturulmuş URL nesnesi (searchParams erişimi için)
  - `body_param` — req.body'den parse edilmiş JSON nesnesi (POST/PUT durumunda id ve conv değerleri için)
  - `rpcUrl` — `fn_admin_get_orders` RPC fonksiyonunun tam URL adresi
  - `body` — RPC çağrısı için gönderilen istek gövdesi (_p_id, p_conv, p_status, p_limit alanları)
  - `resp` — fetch ile yapılan RPC çağrısının Response nesnesi
  - `_text` — RPC yanıtı başarısızsa okunan hata metni
  - `json` — RPC çağrısının başarılıysa döndürülen JSON verisi (dizi beklenir)
  - `row` — json dizisinin ilk elemanı, sipariş satırı verisi
  - `_e` — try-catch bloğunda yakalanan hata nesnesi
  - `msg` — _e Error instance'sa message alanı, değilse 'unknown' stringi
- **Dönüş**: Response — HTTP yanıtı; OPTIONS istekleri için 200 boş Response, yetkilendirme hataları için JSON hata yanıtları, başarılı sorgulamada `{ ok: boolean, rpcUrl: string, row: object | null }` JSON'u

---

## NODE ID STANDARD

  file: supabase\functions\admin-order-inspect\index.ts
  function: supabase\functions\admin-order-inspect\index.ts::admin-order-inspect_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin-order-inspect_handler