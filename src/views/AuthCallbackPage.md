---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: c62079cae2908af5
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: 0d7baa0d62a2803d
  style_tokens: 404ab1f16440192d
generated_at: 2026-05-29T18:49:17Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasında kimlik doğrulama akışının son aşamasını yöneten tek bileşenli bir React sayfasıdır. Harici kimlik sağlayıcısından (OAuth, SSO vb.) geri dönüş sonrasında tarayıcı URL'indeki yetkilendirme verilerini işler, kullanıcı oturumunu başlatır ve ana uygulamaya güvenli bir geçiş sağlar. Tek sorumluluklu yapısı sayesinde kimlik doğrulama geri dönüş sürecini izole ve merkezi bir noktadan kontrol eder.

## Fonksiyon Grupları
### Ana Bileşen ve Akış Yönetimi
Modülün tek ve ana bileşeni olarak kimlik doğrulama geri dönüş sürecinin tüm yaşam döngüsünü yönetir; URL parametrelerinden token/code gibi verileri çıkarır, oturum oluşumu tetikler, kullanıcıya bekleme arayüzü sunar ve başarısızlık durumunda hata gösterimi yaparak yönlendirme sağlar.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kimlik doğrulama geri dönüş sayfası olarak çalışır; harici kimlik sağlayıcısından dönen oturum verilerini işleyerek kullanıcıyı uygulamaya yönlendirir.

**[Aksiyom 1]:** Eğer kimlik doğrulama bağlamı (auth context) sağlayıcısı mevcut değilse, kullanıcının oturum durumu güncellenemez ve sayfa geçerli kimlik bilgisiyle başlatılamaz.

**[Aksiyom 2]:** Eğer yönlendirme bağlamı (router context) mevcut değilse, kimlik doğrulama sonrası kullanıcı ana sayfaya veya hedef sayfaya yönlendirilemez ve sonsuz bekleme durumunda kalır.

**[Aksiyom 3]:** Eğer URL sorgu parametreleri (callback query params) kimlik sağlayıcı tarafından sağlanmıyorsa, token/oturum bilgisi çıkarılamaz ve kimlik doğrulama başarısız olur.

**[Aksiyom 4]:** Eğer tarayıcı oturum depolama mekanizması (sessionStorage/localStorage) kullanılamıyorsa, geçici oturum verileri saklanamaz ve sayfa yeniden yüklendiğinde kimlik bilgisi kaybolur.

**[Aksiyom 5]:** Eğer kimlik sağlayıcı yanıtında hata parametresi (error/denied) bulunuyorsa, bileşen hata durumu arayüzü göstermeli ve kullanıcıyı giriş sayfasına yönlendirmelidir.

**[Aksiyom 6]:** Eğer kimlik sağlayıcı yanıtında geçersiz veya süresi dolmuş token dönüyorsa, oturum başlatılamaz ve kullanıcı yeniden kimlik doğrulama akışına yönlendirilmelidir.

---

## FONKSİYON DETAYLARI

### AuthCallbackPage
**Ne yapar**: VentHub HVAC projesinin kimlik doğrulama akışının geri dönüş (callback) adımını yöneten React tabanlı bir sayfa bileşenidir. Üçüncü taraf kimlik doğrulama sağlayıcısından kullanıcının platforma tekrar yönlendirildiği durumda devreye girer, oturum açma sürecinin başarılı bir şekilde sonlandırılmasını sağlar. Projenin görünüm (view) katmanında özel bir rota üzerinden çalışan, kimlik doğrulama süreçleri için ayrılmış özel bir sayfa bileşenidir.
**Nasıl yapar**: React ekosistem standartlarına uygun olarak fonksiyonel bir bileşen olarak tanımlanmıştır. Kaynak kodunun `src/views` dizininde yer alması, projenin katmanlı mimarisine uygun olarak yalnızca sayfa düzeyinde işlevsellik sunduğunu teyit eder. Kimlik doğrulama sağlayıcısından gelen yönlendirme isteğini yakalar, süreci tamamlamak için gerekli kimlik doğrulama verilerini alır, kullanıcı oturumunun oluşturulması için ilgili arka plan işlemlerini tetikler.
**Parametreler**: Tanımında herhangi bir giriş parametresi bulunmamaktadır, dışarıdan herhangi bir değer almaz.
**Dönüş**: React.FC tipinde geçerli bir React fonksiyonel bileşen döndürür. Bu döndürülen bileşen, tarayıcıda auth callback sayfasının tüm arayüz ve işlevselliklerini son kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `status` — useState hook; loading, success veya error durumunu tutar, UI'da hangi içeriğin gösterileceğini belirler
  - `message` — useState hook; kullanıcıya gösterilecek bilgi/hata mesajını tutar
  - `router` — `useRouter()` ile elde edilen Next.js router nesnesi; programlı sayfa yönlendirmeleri için kullanılır
- **Dönüş**: JSX (React.FC) — loading, success veya error durumuna göre koşullu JSX blokları render eder

---

### [N2_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::useEffect → handleAuthCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `hashFragment` — `window.location.hash` değerinden alınır; OAuth callback URL'sindeki hash fragment'ı temsil eder, token verilerini barındırır
  - `data` — `supabase.auth.getSession()` sonucundan elde edilen session nesnesi; mevcut oturum bilgisini içerir
  - `error` — `supabase.auth.getSession()` sonucundan elde edilen hata nesnesi; session alma işlemindeki hataları tutar
  - `sessionError` — `supabase.auth.exchangeCodeForSession(window.location.href)` sonucundaki hata; URL'deki auth kodunun token'a dönüştürme hatası
  - `newData` — Kod değişimi sonrası ikinci kez çağrılan `supabase.auth.getSession()` sonucundaki data; güncellenmiş session bilgisini tutar
  - `newError` — İkinci `getSession()` çağrısındaki hata nesnesi
  - `error` (catch bloğu) — `unknown` tipinde yakalanan beklenmedik hatalar
- **Dönüş**: yok (side-effect: `setStatus`, `setMessage`, `router.push`, `toast.success` çağırır)

---

### [N3_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::arrow (onClick → router.push login fallback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — hata durumunda "Giriş Sayfasına Dön" butonuna tıklandığında `router.push(Routes.auth.login())` çalıştırır

---

### [N4_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::arrow (setTimeout callback → Routes.home success redirect)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — başarılı doğrulama sonrası 2 saniye bekleyip ana sayfaya yönlendirir

---

### [N5_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::arrow (setTimeout callback → Routes.auth.login with error redirect)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — session alınamadığında 3 saniye bekleyip hata mesajıyla giriş sayfasına yönlendirir

---

### [N6_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::arrow (setTimeout callback → Routes.auth.login catch error redirect)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — catch bloğunda yakalanan hatalar sonrası 3 saniye bekleyip giriş sayfasına yönlendirir

---

### [N7_NASIL] AuthCallbackPage AST Pointer: src\views\AuthCallbackPage.tsx::arrow (setTimeout callback → Routes.auth.login No session redirect)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — hash fragment mevcut olup session bulunamadığında 3 saniye bekleyip "No session found" mesajıyla giriş sayfasına yönlendirir

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