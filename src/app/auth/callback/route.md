---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\auth\callback\route.ts
skeleton_hash: 18a7638a8c3b289a
entity_hashes:
  func:GET: 87f900e6676c777d
  overview: cceb50975600e00b
generated_at: 2026-08-25T08:43:06Z
---

## Genel Bakış

Bu modül, kimlik doğrulama sağlayıcısından gelen geri çağrıyı (callback) işleyen bir Next.js route handler'dır. `GET` metoduyla gelen istekleri yakalayarak kimlik doğrulama akışını tamamlar. Modül, `src/app/auth/callback/` yolunda tanımlı olup Next.js App Router yapısının route convention'ına uygundur.

## Fonksiyonlar

### Kimlik Doğrulama Geri Çağrı İşleyici
Kimlik doğrulama sağlayıcısından dönen yanıtı alır ve oturum açma sürecini sonuçlandırır. Bu tek fonksiyon, modülün tüm sorumluluğunu üstlenir.

- `GET`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, bu modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca fonksiyon imzası (`GET(request: NextRequest)`) mevcut olup, gövde içeriği bilinmemektedir.

---

## FONKSİYON DETAYLARI

### GET
**Ne yapar**: Locale'siz `/auth/callback` yoluna gelen istekleri, kullanıcının dil tercihine göre locale eklenmiş `/{locale}/auth/callback` yoluna 307 geçici yönlendirme ile gönderir. Supabase redirectTo hedefleri ve Google OAuth dönüşü bu locale'siz yola düşer; middleware bu yolu `isAuthApi` kontrolüyle locale enjeksiyonundan muaf tuttuğu için bu handler olmadan istek 404 hatası alır.

**Nasıl yapar**: Önce `NEXT_LOCALE` cookie'sini okur; değer `tr` veya `en` ise doğrudan kullanır. Cookie geçerli bir locale içermiyorsa `accept-language` HTTP header'ını kontrol eder; header `en` içeriyorsa `en`, aksi halde `tr` olarak varsayılan locale belirler. Ardından `request.nextUrl.clone()` ile mevcut URL'nin bir kopyasını oluşturur, `pathname` alanını `/{locale}/auth/callback` biçiminde günceller ve `NextResponse.redirect` ile 307 durum koduyla bu yeni URL'ye yönlendirme döndürür.

**Parametreler**:
- request: NextRequest — Yönlendirme yapılacak gelen HTTP isteğini temsil eder. Cookie bilgileri (`NEXT_LOCALE`) ve HTTP header'ları (`accept-language`) bu parametre üzerinden okunur.

**Dönüş**: NextResponse.redirect(url, 307) — Kullanıcının dil tercihine göre oluşturulmuş locale'li `/auth/callback` URL'sine 307 geçici yönlendirme yanıtı döndürür. 307 durum kodu, orijinal istek metodunun (burada GET) ve gövdesinin yönlendirme hedefine korunarak iletilmesini sağlar.

---

## İTHALATLAR (IMPORTS)
- import: next/server::NextResponse
- import: next/server::type { NextRequest }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/auth/callback/route.ts::GET
- **params**: `request` — NextRequest tipinde gelen HTTP isteği nesnesi
- **ic_degiskenler**:
  - `cookieLocale` — `request.cookies.get('NEXT_LOCALE')?.value` ile NEXT_LOCALE cookie'sinin değeri okunur; cookie yoksa undefined olur
  - `locale` — cookieLocale değeri `'tr'` veya `'en'` ise doğrudan kullanılır; değilse `request.headers.get('accept-language')` başlığı kontrol edilir, `'en'` içeriyorsa `'en'`, aksi halde `'tr'` atanır
  - `url` — `request.nextUrl.clone()` ile mevcut istek URL'inin değiştirilebilir bir kopyası oluşturulur
  - `url.pathname` — `/${locale}/auth/callback` olarak ayarlanır; locale değerine göre yönlendirme yolu belirlenir
- **Dönüş**: `NextResponse.redirect(url, 307)` — 307 durum koduyla geçici yönlendirme yanıtı döndürülür; hedef URL locale'e göre dinamik oluşturulur

---

## NODE ID STANDARD

  file: src\app\auth\callback\route.ts
  function: src\app\auth\callback\route.ts::GET

---

## DISA AKTARILANLAR (EXPORTS)
  export: GET