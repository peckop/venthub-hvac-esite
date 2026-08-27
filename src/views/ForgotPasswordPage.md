---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx
skeleton_hash: 6ea6012ad0441c18
entity_hashes:
  func:ForgotPasswordPage: 40bcbdf4b0d8dfc1
  func:handleSubmit: 460293fdfa9263b6
  overview: 68b3d66ebfb335b8
  style_tokens: 90202b3fc6cca016
generated_at: 2026-06-19T20:50:42Z
---

## Genel Bakış
Bu modül, kullanıcıların şifrelerini sıfırlamaları için bir e-posta adresi girmelerini gerektiren tek sayfalık bir React bileşenidir. Kullanıcı formu gönderdiğinde, e-posta adresi sunucudaki şifre sıfırlama servisine asenkron olarak iletilerek süreç başlatılır.

## Fonksiyon Grupları
### Sayfa Yapısı ve Görünüm
Modülün ana React bileşenini tanımlar; sayfa düzenini, form elemanlarını ve kullanıcı arayüzünü oluşturarak şifre sıfırlama akışının görsel çerçevesini sağlar.
- ForgotPasswordPage

### Form Veri İşleme ve Etkileşim
Kullanıcının formu gönderme eylemini yakalar, varsayılan tarayıcı davranışını engeller ve toplanan e-posta verisini şifre sıfırlama servisine asenkron olarak iletir.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen bilgiler (fonksiyon imzaları) çok sınırlıdır; fonksiyon gövdesi mevcut olmadığından çıkarılabilecek mimari varsayımlar kısıtlıdır.

[Aksiyom 1]: Eğer React çalışma ortamı (runtime) yoksa, ForgotPasswordPage bileşeni render edilemez ve uygulama çalışması başarısız olur.

[Aksiyom 2]: Eğer handleSubmit fonksiyonu bir form SubmitEvent ile çağrılmazsa (örn. doğrudan çağrı veya geçersiz event objesi), form gönderme işlemi beklenmeyen şekilde davranır.

[Aksiyom 3]: Eğer handleSubmit içerisinde yapılan asenkron işlem (muhtemelen API çağrısı) zaman aşımına uğrar veya network bağlantısı yoksa, kullanıcıya uygun bir hata bildirimi yapılması beklenir ancak bu davranış fonksiyon imzasından doğrulanamaz.

[Aksiyom 4]: Eğer handleSubmit successful bir yanıt aldıktan sonra kullanıcıyı yönlendirecek bir navigasyon mekanizması (örn. useNavigate, window.location) mevcut değilse, kullanıcı şifre sıfırlama sonrası sayfada takılı kalır.

---

**Not:** Bu modül için eksiksiz aksiyon üretmek üzere fonksiyon gövdelerinin (`ForgotPasswordPage` ve `handleSubmit` için) tam koduna ihtiyaç vardır. Mevcut çıktı yalnızca fonksiyon imzalarından çıkarılabilecek minimum varsayımları içermektedir.

---

## FONKSİYON DETAYLARI

### ForgotPasswordPage
**Ne yapar**: Bu fonksiyon, uygulamanın "Şifremi Unuttum" sayfasını temsil eden ana React bileşenini tanımlar. Kullanıcıların şifrelerini sıfırlamak için gerekli arayüzü sunar ve form durumunu yönetir.
**Nasıl yapar**: React fonksiyonel bileşeni (FC) yapısını kullanarak JSX ile sayfa düzenini oluşturur. Form girdilerini takip etmek için durum yönetimi (state) mekanizmalarını kullanır ve kullanıcı etkileşimlerini `handleSubmit` gibi fonksiyonlara bağlar.
**Parametreler**: Yok
**Dönüş**: React.FC — Bir React fonksiyonel bileşeni döner.

### handleSubmit
**Ne yapar**: Şifre sıfırlama formunun gönderilme anını yakalayan olay yöneticisidir (event handler). Kullanıcının girdiği verileri alarak şifre sıfırlama sürecini başlatır.
**Nasıl yapar**: Tarayıcının varsayılan form gönderme davranışını (sayfa yenileme) `e.preventDefault()` ile engeller. Form içindeki verileri (genellikle e-posta) toplar, doğrular ve kimlik doğrulama servisine istek gönderir.
**Parametreler**:
- e: React.FormEvent — Form gönderildiğinde oluşan olay nesnesi.
**Dönüş**: void — Herhangi bir değer döndürmez, sadece yan etkiler gerçekleştirir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useAuth::useAuth
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: lucide-react::ArrowLeft
- import: lucide-react::CheckCircle
- import: lucide-react::Mail
- import: next/link::Link
- import: react::React
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ForgotPasswordPage.tsx::ForgotPasswordPage
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `email` — useState ile oluşturulan state, kullanıcının girdiği e-posta adresini tutar
  - `setEmail` — email state'inin setter'ı, input değişimlerinde çağrılır
  - `loading` — useState ile oluşturulan state, şifre sıfırlama isteği sırasında true olur
  - `setLoading` — loading state'inin setter'ı, istek başlamasında ve bitmesinde çağrılır
  - `emailSent` — useState ile oluşturulan state, sıfırlama e-postası başarıyla gönderildiğinde true olur
  - `setEmailSent` — emailSent state'inin setter'ı, başarılı gönderimde true yapılır
  - `resetPassword` — useAuth() hook'undan destructured, Supabase auth ile şifre sıfırlama e-postası gönderen async fonksiyon
  - `t` — useI18n() hook'undan destructured, çevirileri getiren fonksiyon
  - `Routes` — useLocalizedRoutes() hook'undan alınan, lokalize edilmiş rota nesnesi; `Routes.auth.login()` çağrısı ile login sayfası URL'i üretilir
  - `handleSubmit` — inner async fonksiyon, form submit olayını yönetir
- **Dönüş**: JSX element — `emailSent` true ise başarı ekranını, false ise form ekranını render eder

---

### [N2_NASIL] AST Pointer: ForgotPasswordPage.tsx::handleSubmit
- **params**: `(e: React.FormEvent)` — form submit olay nesnesi
- **ic_degiskenler**:
  - `email` — closure'dan gelen input değeri; boşsa toast hatası ile fonksiyon erken döner
  - `t` — closure'dan gelen çeviri fonksiyonu; hata ve başarı mesajlarını lokalize eder
  - `resetPassword` — closure'dan gelen şifre sıfırlama fonksiyonu; `await resetPassword(email)` ile çağrılır
  - `setLoading` — closure'dan gelen state setter'ı; istek öncesi `true`, finally bloğunda `false` yapılır
  - `setEmailSent` — closure'dan gelen state setter'ı; hata yoksa `true` yapılır
  - `error` (try bloğu) — `resetPassword` çağrısından dönen `{ error }` destructured nesne; `error.message` içinde hata açıklaması bulunur
  - `error` (catch bloğu) — try-catch ile yakalanan beklenmeyen hata nesnesi; `console.error` ile loglanır
  - `toast` — import edilen sonner toast API'si; `toast.error()`, `toast.success()` ile bildirim gösterir
- **Dönüş**: yok (void) — yan etkiler: toast bildirimleri gösterir, emailSent ve loading state'lerini değiştirir

---

## NODE ID STANDARD

  file: src\views\ForgotPasswordPage.tsx
  function: src\views\ForgotPasswordPage.tsx::ForgotPasswordPage
  function: src\views\ForgotPasswordPage.tsx::handleSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: ForgotPasswordPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/20`, `bg-gradient-to-br`, `bg-primary-navy`, `bg-repeat`, `bg-success-green`, `bg-white/90`, `border-2`, `border-b-2`, `border-light-gray`, `border-primary-navy`, `border-white`, `border-white/20`, `focus-visible:border-transparent`, `from-air-blue`, `hover:bg-primary-navy`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `from-air-blue`, `h-16`, `h-5`, `inline-flex`, `items-center`, `justify-center`, `left-3`, `max-w-md`, `min-h-screen`, `p-4`, `p-8`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `inset-0`, `leading-relaxed`, `mb-2`, `mb-4`, `mb-6`