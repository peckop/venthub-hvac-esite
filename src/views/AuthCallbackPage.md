---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: 4a086d6e1c9a46aa
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: eb230ccf44ed425f
  style_tokens: 404ab1f16440192d
generated_at: 2026-06-14T21:38:28Z
---

## Genel Bakış
Kimlik doğrulama akışının son halkası olarak çalışan geri dönüş sayfasıdır. OAuth, SSO gibi harici kimlik sağlayıcılarından dönen yetkilendirme verilerini URL parametreleri üzerinden yakalayarak kullanıcı oturumunu başlatır. Başarılı doğrulama sonrası ana uygulamaya yönlendirme yaparken, hata durumlarında kullanıcıya anlamlı geri bildirim sunarak giriş sürecinin güvenilir biçimde tamamlanmasını sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama Callback Bileşeni
Hariciyet yetkilendirme sağlayıcısından dönen token ve yetkilendirme kodlarını URL üzerinden işleyerek oturum başlangıcını yöneten izole sayfa bileşenidir. Tüm callback mantığını tek noktada toplayarak uygulamanın giriş sürecini sonlandırır.
- AuthCallbackPage

## Mimari Notlar
- **Dış Bağımlılıklar:** React çerçeve kütüphanesine ve uygulama içi oturum yönetim mekanizmasına bağlıdır
- **İç Bağımlılıklar:** Kimlik doğrulama servisi, yönlendirme yardımcıları ve hata işleme altyapısını tüketir
- **Dinamik Yüklenme:** Ham URL parametrelerini (query/fragment) çalışma zamanında çözümleyerek token bilgilerini çıkarır
- **Mimari Önem:** Uygulamanın güvenlik zincirinde kritik bir noktada durur; yetkilendirme akışının güvenli biçimde kapanmasını ve geçerli oturumların başlatılmasını garantiler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, mimari varsayımlar çıkarılamamıştır.

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
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/routes::Routes
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::AlertCircle
- import: lucide-react::CheckCircle
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::AuthCallbackPage
- **params**: ()
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu, UI metinlerini uluslararasılaştırır
  - `status` — `useState<'loading' | 'success' | 'error'>('loading')` ile tanımlı component durum state'i
  - `message` — `useState('')` ile tanımlı durum mesajı, kullanıcıya gösterilecek metni tutar
  - `router` — `useRouter()` hook'undan alınan Next.js router instance'ı, sayfa yönlendirme için kullanılır
  - `hashFragment` — `window.location.hash` değerinden alınan URL hash fragment'i, auth callback token'larını içerir
  - `data` — `supabase.auth.getSession()` yanıtındaki session verisi
  - `error` — `supabase.auth.getSession()` yanıtındaki hata nesnesi
  - `sessionError` — `supabase.auth.exchangeCodeForSession()` yanıtındaki hata nesnesi
  - `newData` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki session verisi
  - `newError` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki hata nesnesi
- **Dönüş**: JSX — loading/success/error durumuna göre farklı UI render eden React functional component

### [N2_NASIL] handleAuthCallback AST Pointer: src\views\AuthCallbackPage.tsx::handleAuthCallback
- **params**: ()
- **ic_degiskenler**:
  - `hashFragment` — `window.location.hash` değerinden alınan URL hash fragment'i, auth callback token'larını içerir
  - `data` — `supabase.auth.getSession()` yanıtındaki session verisi
  - `error` — `supabase.auth.getSession()` yanıtındaki hata nesnesi
  - `sessionError` — `supabase.auth.exchangeCodeForSession()` yanıtındaki hata nesnesi
  - `newData` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki session verisi
  - `newError` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki hata nesnesi
- **Dönüş**: yok — state güncellemeleri ve `router.push()` yönlendirmeleri ile yan etki üretir

### [N3_NASIL] async handleAuthCallback AST Pointer: src\views\AuthCallbackPage.tsx::handleAuthCallback
- **params**: ()
- **ic_degiskenler**:
  - `hashFragment` — `window.location.hash` değerinden alınan URL hash fragment'i, auth callback token'larını içerir
  - `data` — `supabase.auth.getSession()` yanıtındaki session verisi
  - `error` — `supabase.auth.getSession()` yanıtındaki hata nesnesi
  - `sessionError` — `supabase.auth.exchangeCodeForSession()` yanıtındaki hata nesnesi
  - `newData` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki session verisi
  - `newError` — token exchange sonrası tekrar çağrılan `supabase.auth.getSession()` yanıtındaki hata nesnesi
- **Dönüş**: yok — state güncellemeleri ve `router.push()` yönlendirmeleri ile yan etki üretir

### [N4_NASIL] Arrow function (router.push home) AST Pointer: src\views\AuthCallbackPage.tsx::(arrow_router_push_home)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `router.push(Routes.home())` çağrısı ile ana sayfaya yönlendirme yapar

### [N5_NASIL] Arrow function (router.push login with error) AST Pointer: src\views\AuthCallbackPage.tsx::(arrow_router_push_login_error)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `router.push(Routes.auth.login(undefined, error.message))` çağrısı ile hata mesajıyla login sayfasına yönlendirme yapar

### [N6_NASIL] Arrow function (router.push home success) AST Pointer: src\views\AuthCallbackPage.tsx::(arrow_router_push_home_success)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `router.push(Routes.home())` çağrısı ile başarı sonrası ana sayfaya yönlendirme yapar

### [N7_NASIL] Arrow function (router.push login no session) AST Pointer: src\views\AuthCallbackPage.tsx::(arrow_router_push_login_nosession)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `router.push(Routes.auth.login(undefined, 'No session found'))` çağrısı ile session bulunamama durumunda login sayfasına yönlendirme yapar

### [N8_NASIL] Arrow function (router.push login catch) AST Pointer: src\views\AuthCallbackPage.tsx::(arrow_router_push_login_catch)
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `router.push(Routes.auth.login())` çağrısı ile yakalanan genel hata sonrası login sayfasına yönlendirme yapar

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