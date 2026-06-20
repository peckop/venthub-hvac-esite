---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\auth\signout\route.ts
skeleton_hash: be6286006ba44974
entity_hashes:
  func:POST: c85301a22b3fe20e
  overview: fa888e32d3000f25
generated_at: 2026-06-19T20:46:34Z
---

## Genel Bakış
Bu modül, kullanıcı oturumunu sonlandırmak için bir API endpoint'i içerir. Next.js App Router yapısında POST isteklerini işleyerek, Supabase kimlik doğrulama oturumunu sonlandırır, uygulama önbelleğini temizler ve kullanıcıyı dil ayarına göre giriş sayfasına yönlendirir.

## Fonksiyon Grupları
### Oturum Kapatma
Kullanıcı oturumunu sonlandırma ve çıkış işlemini yönetir.
- POST

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcı oturumunu sonlandıran bir API endpoint'idir.

[Aksiyom 1]: Eğer POST metoduyla bir istek gelmezse, bu fonksiyon çağrılmaz.
[Aksiyom 2]: Eğer geçerli bir `Request` nesnesi (request parametresi) sağlanmazsa, fonksiyon çalıştırılamaz.
[Aksiyom 3]: Eğer oturum sonlandırma işlemi (örn. Supabase oturumu) başarısız olursa, beklenmeyen bir hata oluşur veya kullanıcı oturum açık kalır.
[Aksiyom 4]: Eğer yönlendirme (redirect) işlemi başarısız olursa, istemci düzgün bir yanıt almaz.

---

## FONKSİYON DETAYLARI

### POST

**Ne yapar**: Kullanıcının oturumunu sonlandırır (sign-out) ve login sayfasına yönlendirme yapar. Bu fonksiyon, bir HTTP POST isteği geldiğinde tetiklenen bir Next.js App Router rotasıdır.

**Nasıl yapar**: Önce Supabase sunucu istemcisi oluşturarak kullanıcının mevcut oturum claims'lerini kontrol eder. Eğer geçerli claims'ler varsa `signOut()` metodunu çağırarak oturumu sonlandırır. Ardından tüm sayfa önbelleğini temizlemek için `revalidatePath` ile layout seviyesinde revalidation yapar. Kullanıcının tercih ettiği dil bilgisini (`NEXT_LOCALE` cookie'sinden) okur ve bu dile göre login sayfasına 302 yönlendirmesi oluşturur. Son olarak claims cache cookie'sini temizleyerek önbellekteki yetkilendirme verilerinin kalıcı olarak silinmesini sağlar.

**Parametreler**:
- `request`: Request — Next.js tarafından sağlanan HTTP istek nesnesi, isteğin URL bilgisini ve diğer header verilerini içerir

**Dönüş**: `NextResponse` — Kullanıcıyı `/{lang}/auth/login` adresine yönlendiren 302 HTTP yanıt döner. Yanıt aynı zamanda claims cache cookie'sini temizleme işlemini de içerir.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/supabase/server::createSupabaseServerClient
- import: @/utils/router::clearClaimsCacheCookie
- import: next/cache::revalidatePath
- import: next/headers::cookies
- import: next/server::NextResponse

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/auth/signout/route.ts::POST
- **params**: `(request: Request)`
- **ic_degiskenler**:
  - `supabase` — `createSupabaseServerClient()` ile oluşturulan Supabase istemcisi; auth işlemleri (getClaims, signOut) için kullanılır
  - `data` — `supabase.auth.getClaims()` çağrısından dönen `{ data }` destructuring ile elde edilen claims nesnesi; mevcut claim'lerin olup olmadığını kontrol eder
  - `requestUrl` — `request.url` string'inden `new URL()` ile oluşturulan URL nesnesi; redirect için `origin` bilgisini sağlamak üzere kullanılır
  - `cookieStore` — `cookies()` ile elde edilen cookie deposu; tarayıcıdaki `NEXT_LOCALE` cookie'sine erişim sağlar
  - `lang` — `cookieStore.get('NEXT_LOCALE')?.value || 'tr'` ifadesinden elde edilen dil kodu; login yönlendirme URL'inde path olarak kullanılır (`/${lang}/auth/login`); cookie yoksa `'tr'` varsayılır
  - `response` — `NextResponse.redirect()` ile oluşturulan 302 redirect yanıtı; login sayfasına yönlendirme yapar ve `clearClaimsCacheCookie` ile temizlenip döndürülür
- **Dönüş**: `NextResponse` — login sayfasına (`/${lang}/auth/login`) 302 redirect yanıtı döndürür; yan etkileri: supabase auth signOut çağırır, revalidatePath ile layout cache'ini temizler, claims cache cookie'sini siler

---

## NODE ID STANDARD

  file: src\app\auth\signout\route.ts
  function: src\app\auth\signout\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST