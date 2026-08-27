---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\AuthCallbackPage.tsx
skeleton_hash: 2cdff1b97b7c5e8a
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: 9e91c5ec6419b208
  style_tokens: 404ab1f16440192d
generated_at: 2026-08-27T07:43:21Z
---

## Genel Bakış
AuthCallbackPage, kimlik doğrulama akışının son adımı olan callback sayfasını temsil eden bir React bileşenidir. Harici kimlik sağlayıcılardan dönen yetkilendirme bilgilerini işleyerek kullanıcı oturumunu başlatır ve ardından uygun sayfaya yönlendirir.

## Fonksiyon Grupları
### Kimlik Doğrulama Callback Bileşeni
Kimlik doğrulama sürecinin callback aşamasında kullanıcıyı karşılayan ve oturum yönetimini gerçekleştiren bileşendir.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari aksiyom üretilememektedir. Nedeni: fonksiyon gövdesi verilmemiştir; aksiyomlar yalnızca fonksiyon gövdesinden türetilebilir.

---

## FONKSİYON DETAYLARI

### AuthCallbackPage

**Ne yapar**: Kimlik doğrulama (authentication) süreçlerinden sonra yönlendirilen kullanıcıyı karşılayan React bileşenidir. OAuth veya benzeri bir kimlik doğrulama akışı tamamlandığında, harici yetkilendirme sağlayıcısı kullanıcıyı bu sayfaya yönlendirir ve bileşen ilgili işlemleri yürütür.

**Nasıl yapar**: Bu bir React fonksiyonel bileşenidertil (React.FC). OAuth callback akışında kullanıcıyı karşılayarak, URI fragment'lerinden veya query parametrelerinden token bilgilerini çıkarıp işleyebilir, ardından kullanıcıyı uygulama içinde uygun sayfaya yönlendirir. Bileşen, authentication state yönetimini üstlenir.

**Parametreler**:
Bu bileşen doğrudan prop almamaktadır (parametresiz fonksiyon bileşenidir).

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipini döndürür. Sayfa içeriği olarak kimlik doğrulama callback işlemini yöneten JSX içeriği üretir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::AlertCircle
- import: lucide-react::CheckCircle
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; i18n anahtarlarıyla UI metinlerini çözmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota yardımcı objesi; `Routes.home()`, `Routes.auth.login()`, `Routes.auth.resetPassword()` gibi yöntemlerle yönlendirme URL'leri üretir
  - `status` — `useState<'loading' | 'success' | 'error'>('loading')` ile yönetilen durum state'i; sayfanın yükleme, başarılı veya hatalı olduğunu belirtir
  - `setStatus` — `status` state'ini güncelleyen setter fonksiyonu
  - `message` — `useState('')` ile yönetilen mesaj state'i; kullanıcıya gösterilecek durum açıklamasını tutar
  - `setMessage` — `message` state'ini güncelleyen setter fonksiyonu
  - `router` — `useRouter()` hook'undan dönen Next.js router objesi; `router.push()` ile programatik yönlendirme yapmak için kullanılır
  - `searchParams` — `useSearchParams()` hook'undan dönen URL arama parametreleri objesi; opsiyonel olabilir (nullish kontrolü yapılır)
  - `next` — `searchParams?.get('next')` ile URL'den okunan `next` query parametresi değeri; şifre kurtarma akışını belirlemek için kullanılır
- **Dönüş**: JSX elementi (React.FC) — yükleme, başarı ve hata durumlarına göre koşullu render yapan bir kart bileşeni döndürür

### [N2_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleAuthCallback` — useEffect içinde tanımlanan async fonksiyon; Supabase oturum açma callback akışını yürütür
- **Dönüş**: yok — yan etki olarak `handleAuthCallback()` fonksiyonunu çağırır

### [N3_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::handleAuthCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `hashFragment` — `window.location.hash` değerini tutar; implicit akıştaki hash token'ı ve `type=recovery` kontrolü için kullanılır
  - `hasCode` — `new URL(window.location.href).searchParams.has('code')` sonucu boolean; URL'de PKCE `code` parametresi olup olmadığını belirtir
  - `isRecovery` — `next === 'reset-password' || hashFragment.includes('type=recovery')` sonucu boolean; şifre kurtarma dönüşü olup olmadığını belirler
  - `data` — `supabase.auth.getSession()` sonucu destructuring ile alınan veri objesi; `data.session` üzerinden aktif oturum kontrolü yapılır; PKCE ve implicit akış adımlarında tekrar atanır
  - `exchangeError` — `supabase.auth.exchangeCodeForSession(window.location.href)` sonucu destructuring ile alınan hata objesi; PKCE kod değişiminde oluşan hatayı tutar
  - `error` — `catch (error: unknown)` bloğunda yakalanan bilinmeyen türde hata; konsola yazdırılır
- **Dönüş**: yok (void) — yan etkileri: `setStatus()`, `setMessage()` ile state günceller; `router.push()` ile yönlendirme yapar; `toast.success()` ile bildirim gösterir; `console.error()` ile hata loglar

### [N4_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::setTimeout callback (successRedirect)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — yan etki olarak `router.push(Routes.home())` çağırır; 2000ms gecikmeyle ana sayfaya yönlendirir

### [N5_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::setTimeout callback (invalidLink)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — yan etki olarak `router.push(Routes.auth.login(undefined, t('auth.callback.invalidLink')))` çağırır; 3000ms gecikmeyle hata mesajıyla giriş sayfasına yönlendirir

### [N6_NASIL] AST Pointer: src/views/AuthCallbackPage.tsx::setTimeout callback (unexpectedError)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — yan etki olarak `router.push(Routes.auth.login())` çağırır; 3000ms gecikmeyle giriş sayfasına yönlendirir

---

## NODE ID STANDARD

  file: src\views\AuthCallbackPage.tsx
  function: src\views\AuthCallbackPage.tsx::AuthCallbackPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthCallbackPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-error-red`, `bg-gradient-to-br`, `bg-primary-navy`, `bg-success-green`, `bg-white/90`, `border-b-2`, `border-primary-navy`, `border-white/20`, `from-air-blue`, `hover:bg-secondary-blue`, `text-center`, `text-industrial-gray`, `text-steel-gray`, `text-white`, `text-xl`
- **Layout:** `backdrop-blur-sm`, `flex`, `from-air-blue`, `h-12`, `items-center`, `justify-center`, `max-w-md`, `min-h-screen`, `p-8`, `shadow-hvac-lg`, `w-12`, `w-full`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `font-bold`, `font-semibold`, `mb-2`, `mb-4`, `mx-4`, `mx-auto`, `px-4`, `py-2`, `rounded-2xl`, `rounded-full`, `rounded-lg`, `transition-colors`