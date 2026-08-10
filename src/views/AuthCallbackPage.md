---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: ebef8175645dcf55
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: a386b5017e2597f0
  style_tokens: 404ab1f16440192d
generated_at: 2026-06-19T20:50:36Z
---

## Genel Bakış
AuthCallbackPage, kimlik doğrulama süreçlerinin ardından kullanıcıyı karşılayan ve oturum başlatma işlemini tamamlayan bir React bileşenidir. Harici kimlik sağlayıcılardan (OAuth, SSO vb.) dönen yetkilendirme bilgilerini URL parametrelerinden çıkararak kullanıcı oturumunu başlatır ve uygun yönlendirmeyi sağlar.

## Fonksiyon Grupları
### Kimlik Doğrulama Callback Bileşeni
Kimlik doğrulama akışının son aşamasında yer alan, callback verilerini işleyerek oturum yönetimi yapan izole sayfa bileşeni.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari aksiyom üretilememektedir. Nedenleri:

1. **Fonksiyon gövdesi mevcut değil**: Verilen bilgilerde bileşenin gerçek uygulama kodu (function body) yer almamaktadır. Sadece imza bilgisi (`AuthCallbackPage() -> React.FC`) verilmiştir.

2. **Kurallar gereği**: Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir; docstring, yorum satırları veya değişken isimlerinden bilgi çıkarılamaz. Eski dokümanda yer alan "OAuth callback", "URL parametreleri", "oturum başlatma" gibi ifadeler aksiyon üretimi için kullanılamaz.

3. **Varsayılan değer yok**: Fonksiyon imzasında herhangi bir parametre veya default değer bulunmamaktadır.

---

**Sonuç:** Fonksiyon gövdesi (implementasyon) paylaşıldığında, aşağıdaki potansiyel alanlardan aksiyomlar çıkarılabilecektir:

- URL parametrelerinin varlık/zorunluluk koşulları
- Token/alma kodu işleme koşulları
- Başarısız durum yönetimi gereksinimleri
- Yönlendirme (redirect) koşulları
- Hata gösterimi koşulları

> 📌 **Not**: Mimari hakem olarak, **gerçek uygulama kodu olmadan tahmini aksiyon üretmem uygun değildir.** Fonksiyon gövdesi eklendiğinde analiz yapılabilir.

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
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (yok — React.FC, props almaz)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, tüm UI metinleri bu ile sağlanır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen lokalize rota builder nesnesi, `Routes.home()`, `Routes.auth.login()` gibi metodlar barındırır
  - `status` — `useState<'loading' | 'success' | 'error'>('loading')` ile oluşturulan durum state'i, auth callback sürecinin aşamasını tutar
  - `setStatus` — `status` state'ini güncelleyen setter fonksiyonu
  - `message` — `useState('')` ile oluşturulan mesaj state'i, kullanıcıya gösterilecek metni tutar
  - `setMessage` — `message` state'ini güncelleyen setter fonksiyonu
  - `router` — `useRouter()` hook'undan dönen Next.js yönlendirme nesnesi, `router.push()` ile sayfa yönlendirmesi yapar
- **Dönüş**: JSX — loading/success/error durumuna göre farklı UI render eden React bileşeni JSX'i döner. `useEffect` içinde `handleAuthCallback` çağrılır, `toast.success()` ile bildirim gösterilir, `setTimeout` ile yönlendirme yapılır.

---

### [N2_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::useEffect_callback
- **params**: (yok — arrow function, deps: `[router, t, Routes]`)
- **ic_degiskenler**:
  - `handleAuthCallback` — `async function` olarak tanımlanmış, auth callback mantığını yürüten iç fonksiyon, useEffect içinde tanımlanıp hemen çağrılmıştır
- **Dönüş**: yok — useEffect side-effect callback'idir, `handleAuthCallback()` çağrısı ile auth akışını başlatır

---

### [N3_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::handleAuthCallback
- **params**: (yok — async inner function)
- **ic_degiskenler**:
  - `hashFragment` — `window.location.hash` değerinden alınan URL hash fragment'i, OAuth callback tokenlarının burada bulunup bulunmadığını kontrol eder
  - `data` — `supabase.auth.getSession()` destructured sonucu `{ data, error }` — mevcut oturum bilgisini tutar, `data.session` varlığı kontrol edilir
  - `error` — `supabase.auth.getSession()` destructured sonucu `{ data, error }` — oturum alma hatasını tutar
  - `sessionError` — `supabase.auth.exchangeCodeForSession(window.location.href)` sonucu `{ error: sessionError }` destructured — kod değiştirme (token exchange) hatasını tutar
  - `newData` — `supabase.auth.getSession()` ikinci çağrısından dönen `{ data: newData, error: newError }` destructured — token exchange sonrası güncel oturum bilgisini tutar
  - `newError` — `supabase.auth.getSession()` ikinci çağrısından dönen `{ data: newData, error: newError }` destructured — ikinci oturum alma hatasını tutar, varsa `throw` ile fırlatılır
- **Dönüş**: yok — tüm akış yan etkiler üzerindendir: `setStatus()`, `setMessage()`, `toast.success()`, `router.push(Routes.home())`, `router.push(Routes.auth.login())`
- **API Çağrıları**: `supabase.auth.getSession()`, `supabase.auth.exchangeCodeForSession(window.location.href)`, `console.error()`, `window.location.hash`, `window.location.href`
- **Yakalama**: `catch (error: unknown)` bloğu — tüm hataları yakalar, `setStatus('error')` ve `router.push(Routes.auth.login())` ile hata yönetimi yapar

---

### [N4_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::setTimeout_redirect_home_1
- **params**: (yok — arrow function)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setTimeout` callback'idir, 2000ms sonra `router.push(Routes.home())` çağrısı ile anasayfaya yönlendirme yapar; `newData.session` başarılı olduğunda tetiklenir

---

### [N5_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::setTimeout_redirect_login_error
- **params**: (yok — arrow function)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setTimeout` callback'idir, 3000ms sonra `router.push(Routes.auth.login(undefined, error.message))` çağrısı ile hata mesajı ile birlikte giriş sayfasına yönlendirme yapar

---

### [N6_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::setTimeout_redirect_home_2
- **params**: (yok — arrow function)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setTimeout` callback'idir, 2000ms sonra `router.push(Routes.home())` çağrısı ile anasayfaya yönlendirme yapar; ilk `data.session` başarılı olduğunda tetiklenir

---

### [N7_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::setTimeout_redirect_login_nosession
- **params**: (yok — arrow function)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setTimeout` callback'idir, 3000ms sonra `router.push(Routes.auth.login(undefined, 'No session found'))` çağrısı ile 'No session found' mesajı ile giriş sayfasına yönlendirme yapar; hash fragment mevcut olmayıp hiçbir oturum bulunamadığında tetiklenir

---

### [N8_NASIL] AST Pointer: src\views\AuthCallbackPage.tsx::setTimeout_redirect_login_catch
- **params**: (yok — arrow function)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `setTimeout` callback'idir, 3000ms sonra `router.push(Routes.auth.login())` çağrısı ile çıkış parametresiz giriş sayfasına yönlendirme yapar; `catch` bloğu içinde yakalanan beklenmedik hatalarda tetiklenir

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