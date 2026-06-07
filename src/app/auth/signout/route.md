---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\auth\signout\route.ts
skeleton_hash: 8f8c0ed1663a8c1f
entity_hashes:
  func:POST: 64d075521efbff72
  overview: 4873bbe8c1491a43
generated_at: 2026-06-07T11:00:21Z
---

## Genel Bakış
Bu modül, kullanıcı oturumunu sonlandırmak için bir API endpoint'i sağlar. Next.js App Router yapısında POST isteklerini işleyerek kullanıcı çıkış işlemini gerçekleştirir.

## Fonksiyon Grupları
### Yetkilendirme İşlemleri
Kullanıcı oturumunu sonlandırma ve çıkış işlemlerini yönetir.
- POST

---



---

## FONKSİYON DETAYLARI

### POST
**Ne yapar**: Bu fonksiyon, kullanıcı oturumunu sonlandırır ve kullanıcıyı oturum açma sayfasına yönlendirir. Bir HTTP POST isteği geldiğinde, Supabase üzerinden kimlik doğrulama oturumunu sonlandırır, uygulama düzenini yeniden doğrular ve istemciyi yerel ayara (lang) göre uygun login sayfasına 302 yönlendirme kodu ile aktarır.

**Nasıl yapar**: Fonksiyon öncelikle bir Supabase istemcisi oluşturur. Ardından, mevcut kullanıcının (`claims`) olup olmadığını kontrol eder; eğer varsa, `supabase.auth.signOut()` metoduyla oturumu sonlandırır. Oturum sonlandırma işlemi sonrasında, tüm sayfaların ve layout'un önbelleğini temizlemek için `revalidatePath` metodunu kullanır. Son olarak, isteğin URL'sinden mevcut origin'i (kök adresi) alır, tarayıcı çerezlerinden `NEXT_LOCALE` değerini okur (yoksa varsayılan olarak 'tr' kullanır) ve bu dil kodunu kullanarak kullanıcıyı login sayfasına yönlendirir.

**Parametreler**:
- `request`: `Request` — Gelen HTTP isteğini temsil eden standart bir Request nesnesi. Bu nesne, isteğin URL'sine erişmek ve yönlendirme için origin bilgisini almak amacıyla kullanılır.

**Dönüş**: `NextResponse` — Kullanıcıyı `/{dil}/auth/login` adresine 302 durum kodu ile yönlendiren bir NextResponse nesnesi döndürür. Dil kodu, tarayıcı çerezlerindeki `NEXT_LOCALE` değerinden okunur veya 'tr' olarak varsayılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/app/auth/signout/route.ts`::POST
- **params**: `request: Request` — Next.js tarafından otomatik olarak gelen HTTP istek nesnesi
- **ic_degiskenler**:
  - `supabase` — `createSupabaseServerClient()` ile oluşturulan Supabase sunucu istemcisi; auth işlemleri (getClaims, signOut) için kullanılır
  - `data` — `supabase.auth.getClaims()` yanıtından `{ data }` destructuring ile çıkarılan claims verisi; kullanıcının auth bilgilerini içerir
  - `requestUrl` — `new URL(request.url)` ile oluşturulan URL nesnesi; redirect yapılacak origin adresini almak için kullanılır (`requestUrl.origin`)
  - `cookieStore` — `await cookies()` ile elde edilen Next.js cookie deposu; tarayıcı çerezlerine erişim sağlar
  - `lang` — `cookieStore.get('NEXT_LOCALE')?.value || 'tr'` ifadesinden elde edilen dil kodu; cookie'den `NEXT_LOCALE` okunur, yoksa `'tr'` varsayılır; redirect URL'inde dil öneki olarak kullanılır
- **Dönüş**: `NextResponse.redirect(...)` — kullanıcıyı `/${lang}/auth/login` adresine HTTP 302 ile yönlendirir; fonksiyon imzasında `yok` görünse de aslında bir `NextResponse` (Response) döner

**Yan etkiler**:
- `supabase.auth.signOut()` çağrısı ile kullanıcı oturumu kapatılır (eğer `data?.claims` mevcutsa)
- `revalidatePath('/', 'layout')` ile kök layout'un Next.js cache'i temizlenir

---

## NODE ID STANDARD

  file: src\app\auth\signout\route.ts
  function: src\app\auth\signout\route.ts::POST

---

## DISA AKTARILANLAR (EXPORTS)
  export: POST