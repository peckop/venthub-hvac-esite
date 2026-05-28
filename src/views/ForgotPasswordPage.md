---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx
skeleton_hash: 28f5aaf598269af6
entity_hashes:
  func:ForgotPasswordPage: 40bcbdf4b0d8dfc1
  func:handleSubmit: 460293fdfa9263b6
  overview: 230126d511311554
  style_tokens: 90202b3fc6cca016
generated_at: 2026-05-28T22:40:06Z
---

## Genel Bakış
Bu modül, kullanıcıların şifremi unuttum işlemini gerçekleştirebilecekleri bir sayfa bileşeni sunar. Sayfa, e-posta adresi girişi ve gönderim işlemini yöneterek şifre sıfırlama talebini başlatır.

## Fonksiyon Grupları
### Bileşen Tanımı
Sayfanın görsel yapısını ve temel render mantığını tanımlar.
- ForgotPasswordPage

### Form Gönderimi
Kullanıcının girdiği e-posta adresini alır, form gönderimini yönetir ve ilgili işlemi asenkron olarak gerçekleştirir.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx::ForgotPasswordPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `email` — kullanıcı tarafından girilen e‑posta adresini tutan state.
  - `setEmail` — `email` state'ini güncelleyen setter fonksiyonu.
  - `loading` — form gönderimi sırasında bekleme durumunu gösteren boolean state.
  - `setLoading` — `loading` state'ini güncelleyen setter fonksiyonu.
  - `emailSent` — şifre sıfırlama e‑postası gönderildikten sonra gösterilecek UI durumunu belirten boolean state.
  - `setEmailSent` — `emailSent` state'ini güncelleyen setter fonksiyonu.
  - `resetPassword` — `useAuth` hook'undan alınan, verilen e‑posta ile şifre sıfırlama isteği yapan fonksiyon.
  - `t` — i18n çeviri fonksiyonu, metinleri yerelleştirir.
  - `handleSubmit` — form gönderildiğinde çalıştırılan async fonksiyon (aşağıda ayrı olarak tanımlanmıştır).
- **Dönüş**: React.ReactElement (JSX)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx::handleSubmit
- **params**: e — React.FormEvent nesnesi, form submit olayını temsil eder.
- **ic_degiskenler**:
  - `e` — form submit olayını durdurmak için `preventDefault` çağrısı yapılan event nesnesi.
  - `email` — dış scope'tan alınan state, gönderilecek e‑posta adresi.
  - `setLoading` — loading durumunu true/false olarak ayarlayan setter.
  - `resetPassword` — e‑posta ile şifre sıfırlama isteği yapan async fonksiyon.
  - `error` — `resetPassword` çağrısından dönen nesneden ayrıştırılan hata nesnesi (try bloğu içinde).
  - `setEmailSent` — başarılı işlemde `emailSent` state'ini true yapan setter.
  - `toast` — kullanıcıya bildirim göstermek için kullanılan toast kütüphanesi.
  - `t` — i18n çeviri fonksiyonu, hata ve başarı mesajlarını yerelleştirir.
  - `error` — catch bloğunda yakalanan istisna nesnesi (hata durumunda toast ve console.error yapılır).
- **Dönüş**: yok (fonksiyon yan etkiler üretir, UI state ve toast bildirimi günceller)

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