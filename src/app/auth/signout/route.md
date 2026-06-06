---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\auth\signout\route.ts
skeleton_hash: e0e2bdaab1f2798b
entity_hashes:
  func:POST: a903ddf8e05f6051
  overview: 4d1b3d1efbd01157
generated_at: 2026-06-06T21:54:17Z
---

## Genel Bakış

Bu modül, kullanıcı oturumunu sonlandırmak için bir API endpoint'i sağlar. Next.js App Router yapısında POST isteklerini işleyerek kullanıcı çıkış işlemini gerçekleştirir.

## Fonksiyon Grupları

### Yetkilendirme İşlemleri
Kullanıcı oturumunu sonlandırma ve çıkış işlemlerini yönetir.
- POST

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### POST

**Ne yapar**: Kullanıcının oturumunu sonlandırır ve giriş sayfasına yönlendirir. Bu fonksiyon, bir Next.js API route handler olarak POST isteklerini karşılar ve Supabase auth servisi üzerinden güvenli çıkış işlemini gerçekleştirir.

**Nasıl yapar**: Öncelikle Supabase server client'ı oluşturur. Ardından mevcut kullanıcının auth claims bilgilerini kontrol eder; eğer claims verisi mevcutsa signOut işlemini tetikler. Çıkış işleminden sonra tüm layout'ları yeniden doğrulayarak önbellek temizliği yapar ve son olarak kullanıcıyı 302 kalıcı olmayan yönlendirme ile /auth/login sayfasına aktarır.

**Parametreler**:
- request: Request — Next.js tarafından otomatik olarak geçirilen HTTP istek nesnesi. İstek URL'si bu nesne üzerinden erişilerek yönlendirme hedefinin kök URL'si dinamik olarak belirlenir.

**Dönüş**: `NextResponse.redirect(new URL('/auth/login', requestUrl.origin), 302)` — Kullanıcıyı giriş sayfasına 302 status kodu ile yönlendiren bir NextResponse nesnesi döndürür. Yönlendirme hedefi, isteğin geldiği origin adresine göre dinamik olarak oluşturulur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/auth/signout/route.ts::POST
- **params**: `(request: Request)` — Next.js tarafından otomatik olarak enjekte edilen HTTP istek nesnesi
- **ic_degiskenler**:
  - `supabase` — `createSupabaseServerClient()` ile oluşturulan Supabase istemcisi, kullanıcının oturumunu yönetmek ve auth işlemleri yapmak için kullanılır
  - `data` — `supabase.auth.getClaims()` çağrısından dönen nesnenin `data` özelliği, destructure edilmiş; kullanıcının claim bilgilerini (yetki/talep) tutar
  - `requestUrl` — `request.url` string'inden `new URL()` ile oluşturulan URL nesnesi, yönlendirme için origin bilgisini almak amacıyla kullanılır
- **Dönüş**: `NextResponse.redirect(new URL('/auth/login', requestUrl.origin), 302)` — Kullanıcı çıkış yaptıktan sonra `/auth/login` sayfasına 302 redirect yanıtı döner

**Yan etkiler**:
- `supabase.auth.signOut()` — Kullanıcı claim'leri varsa oturumu kapatır
- `revalidatePath('/', 'layout')` — Next.js önbelleğindeki tüm layout seviyesindeki yolları yeniden doğrular (cache invalidation)

---

## NODE ID STANDARD

  file: src\app\auth\signout\route.ts
  function: src\app\auth\signout\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST