---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\app\auth\signout\route.ts
skeleton_hash: cb5712fc44153c68
entity_hashes:
  func:POST: 9db1e564185a6ae3
  overview: fa888e32d3000f25
generated_at: 2026-08-27T06:56:43Z
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
**Ne yapar**: Kullanıcının mevcut oturumunu sonlandırır ve kullanıcıyı dil tercihine göre login sayfasına yönlendirir. Bu fonksiyon, Next.js App Router yapısında bir API route olarak tanımlanmıştır ve HTTP POST isteklerini işler.

**Nasıl yapar**: Fonksiyon önce `createSupabaseServerClient` ile bir Supabase sunucu istemcisi oluşturur. Ardından `supabase.auth.getClaims()` ile kullanıcının mevcut kimlik bilgilerini (claims) kontrol eder. Eğer `data?.claims` mevcutsa (kullanıcı giriş yapmışsa), `supabase.auth.signOut()` çağrılarak oturum sonlandırılır. Sonrasında `revalidatePath('/', 'layout')` ile kök dizin için layout seviyesindeki veri önbelleği geçersiz kılınır. İstek URL'si parse edilir, çerez deposundan `NEXT_LOCALE` çerezi okunarak dil tercihi belirlenir (bulunamazsa varsayılan olarak `'tr'` kullanılır). Kullanıcı, belirlenen dil önekiyle birlikte `/{lang}/auth/login` yoluna 302 geçici yönlendirme ile gönderilir. Yönlendirme yanıtı oluşturulduktan sonra `clearClaimsCacheCookie` çağrılarak claims önbellek çerezi temizlenir ve yanıt döndürülür.

**Parametreler**:
- request: Request — Gelen HTTP isteğini temsil eden nesne. İsteğin URL bilgisini (`request.url`) içerir ve yönlendirme hedefinin belirlenmesinde kullanılır.

**Dönüş**: NextResponse — 302 durum koduyla birlikte `/{lang}/auth/login` yoluna yönlendirme yapan HTTP yanıt nesnesi döndürür. Yanıt nesnesi, `clearClaimsCacheCookie` fonksiyonu aracılığıyla claims önbellek çerezinin temizlenmesi için kullanılır.

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
- **params**: `request` — `Request` tipinde, gelen HTTP isteğini temsil eder
- **ic_degiskenler**:
  - `supabase` — `createSupabaseServerClient()` ile oluşturulan Supabase sunucu istemcisi; kimlik doğrulama ve oturum işlemleri için kullanılır
  - `data` — `supabase.auth.getClaims()` sonucundan destructuring ile elde edilen nesne; kullanıcının claims bilgisini içerir
  - `data.claims` — `data` nesnesi içindeki claims alanı; varlığı kontrol edilerek kullanıcının oturum açmış olup olmadığı belirlenir
  - `requestUrl` — `request.url` kullanılarak oluşturulan `URL` nesnesi; yönlendirme URL'lerinde origin bilgisi için kullanılır
  - `cookieStore` — `cookies()` ile elde edilen çerez deposu; çerez okuma işlemleri için kullanılır
  - `lang` — `cookieStore.get('NEXT_LOCALE')?.value` ile elde edilen dil değeri; çerez yoksa `'tr'` varsayılan değerini alır
  - `response` — `NextResponse.redirect()` ile oluşturulan 302 yönlendirme yanıtı; `/{lang}/auth/login` adresine yönlendirir
- **Dönüş**: `NextResponse` — `response` değişkeni, 302 durum koduyla login sayfasına yönlendirme yanıtı döndürür

**Yan etkiler**: `supabase.auth.getClaims()` ile claims kontrolü yapılır; claims varsa `supabase.auth.signOut()` ile oturum sonlandırılır. `revalidatePath('/', 'layout')` ile kök yoldaki layout önbelleği geçersiz kılınır. `clearClaimsCacheCookie(response)` ile yanıt üzerindeki claims önbellek çerezi temizlenir.

---

## NODE ID STANDARD

  file: src\app\auth\signout\route.ts
  function: src\app\auth\signout\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST