---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx
skeleton_hash: b54e4633f0082cc9
entity_hashes:
  func:ForgotPasswordPage: 40bcbdf4b0d8dfc1
  func:handleSubmit: 460293fdfa9263b6
  overview: 279129df493eb1f6
  style_tokens: 90202b3fc6cca016
generated_at: 2026-05-29T18:49:37Z
---

## Genel Bakış
Bu modül, kullanıcıların şifre sıfırlama talebini başlatmalarını sağlayan tek sayfalık bir React bileşenidir. E-posta adresi girişi formunu sunarak, kullanıcının şifre yenileme işlemi için kimlik doğrulama servisine istek gönderir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Sayfanın genel yapısını, form düzenini ve kullanıcı arayüzünü tanımlayan ana React bileşenidir.
- ForgotPasswordPage

### Form İşlemleri
Kullanıcının formu gönderdiğinde tetiklenen, varsayılan tarayıcı davranışını engelleyerek şifre sıfırlama isteğini asenkron olarak yöneten olay处理leyicidir.
- handleSubmit

---



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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/ForgotPasswordPage.tsx::ForgotPasswordPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `email` — `useState('')` hook'undan dönen state, kullanıcının girdiği e-posta adresini tutar
  - `setEmail` — `useState('')` hook'undan dönen setter, email state'ini günceller
  - `loading` — `useState(false)` hook'undan dönen state, form gönderim süresince true olur, submit butonunu disabled yapar
  - `setLoading` — `useState(false)` hook'undan dönen setter, loading state'ini günceller
  - `emailSent` — `useState(false)` hook'undan dönen state, sıfırlama e-postası başarıyla gönderildiğinde true olur, sayfayı teşekkür ekranına çevirir
  - `setEmailSent` — `useState(false)` hook'undan dönen setter, emailSent state'ini günceller
  - `resetPassword` — `useAuth()` hook'undan destructure edilen fonksiyon, Supabase'e şifre sıfırlama isteği gönderir
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu, çok dilli metinleri getirir
- **Dönüş**: JSX — `emailSent` false ise şifre sıfırlama formu, true ise "e-posta gönderildi" teşekkür ekranı render eder

---

### [N2_NASIL] AST Pointer: src/views/ForgotPasswordPage.tsx::handleSubmit
- **params**: `e: React.FormEvent` — form submit olay nesnesi, `e.preventDefault()` ile varsayılan submit engellenir
- **ic_degiskenler**:
  - `email` — outer scope'tan closure ile erişilen state, sıfırlanacak kullanıcının e-posta adresi; boşsa toast hatası verip return eder
  - `setLoading` — outer scope'tan closure ile erişilen setter, fonksiyon başında `true`, finally bloğunda `false` olarak ayarlanır
  - `resetPassword` — outer scope'tan closure ile erişilen auth fonksiyonu, `email` parametresiyle `await resetPassword(email)` olarak çağrılır; `{ error }` destructuring ile sonucu ayrıştırılır
  - `t` — outer scope'tan closure ile erişilen çeviri fonksiyonu, toast mesajlarında kullanılır (`auth.email`, `auth.required`, `auth.userNotFound`, `auth.resetError`, `auth.resetEmailSent`, `auth.unexpectedError`)
  - `error` (try bloğu) — `resetPassword` dönüşünden destructuring ile elde edilen hata nesnesi; `error.message` içinde `'User not found'` aranır, farklıysa raw message gösterilir
  - `error` (catch bloğu) — yakalanan beklenmedik hata nesnesi, `console.error` ile loglanır ve `auth.unexpectedError` toast gösterilir
  - `setEmailSent` — outer scope'tan closure ile erişilen setter, hata yoksa `true` olarak ayarlanır ve teşekkür ekranına geçiş yapar
- **Dönüş**: yok (void) — yan etkiler: toast bildirimleri gösterir, state'leri günceller

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