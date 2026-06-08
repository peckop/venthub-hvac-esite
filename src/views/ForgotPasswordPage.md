---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ForgotPasswordPage.tsx
skeleton_hash: b223d64b36d7551e
entity_hashes:
  func:ForgotPasswordPage: 40bcbdf4b0d8dfc1
  func:handleSubmit: 460293fdfa9263b6
  overview: b6edcf7438326096
  style_tokens: 90202b3fc6cca016
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, kullanıcıların şifre sıfırlama talebini iletmek için kullanılan tek sayfalık bir React bileşenidir. Kullanıcıya e-posta adresi girişi sunarak, gizli bir servisi aracılığıyla şifre yenileme sürecini başlatır.

## Fonksiyon Grupları
### Sayfa Yapısı ve Görünüm
Modülün ana bileşenini tanımlar; sayfa düzenini, form elemanlarını ve kullanıcı arayüzünü oluşturarak şifre sıfırlama akışının görsel çerçevesini sağlar.
- ForgotPasswordPage

### Form Veri İşleme ve Etkileşim
Kullanıcının formu gönderme eylemini yakalar, varsayılan tarayıcı davranışını engeller ve toplanan verileri (e-posta) şifre sıfırlama servisine asenkron olarak iletir.
- handleSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu modül, kullanıcının şifre sıfırlama talebini iletmek için bir form sunar ve bu sürecin doğru işleyişi için aşağıdaki varsayımlar gereklidir.

[Aksiyom 1]: Eğer form gönderme olayı (`e`) doğru şekilde engellenmezse (örn. `e.preventDefault()` çağrılmazsa), tarayıcının varsayılan form gönderme davranışı tetiklenir ve sayfa yeniden yüklenerek istek gönderilemez.

[Aksiyom 2]: Eğer kullanıcının girdiği e-posta adresi sunucu tarafında geçerli ve kayıtlı bir kullanıcıya ait değilse, şifre sıfırlama isteği sunucu tarafından reddedilir (hata mesajı döner).

[Aksiyom 3]: Eğer modülün çalıştığı ortamda ağ bağlantısı (internet) yoksa, şifre sıfırlama isteği sunucuya iletilemez ve istek başarısız olur.

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
  - `email` — useState hook'u ile oluşturulmuş state değişkeni, kullanıcının girdiği e-posta adresini tutar
  - `setEmail` — email state'ini güncellemek için kullanılan setter fonksiyonu
  - `loading` — useState hook'u ile oluşturulmuş state değişkeni, yükleme durumunu (true/false) tutar
  - `setLoading` — loading state'ini güncellemek için kullanılan setter fonksiyonu
  - `emailSent` — useState hook'u ile oluşturulmuş state değişkeni, şifre sıfırlama e-postasının gönderilip gönderilmediğini tutar
  - `setEmailSent` — emailSent state'ini güncellemek için kullanılan setter fonksiyonu
  - `resetPassword` — useAuth hook'undan gelen, şifre sıfırlama işlemini yapan asenkron fonksiyon
  - `t` — useI18n hook'undan gelen, çeviri yapmak için kullanılan fonksiyon
  - `handleSubmit` — form gönderildiğinde çalışan asenkron olay işleyici fonksiyon
- **Dönüş**: JSX elementi (React FC bileşeni)

### [N2_NASIL] AST Pointer: src/views/ForgotPasswordPage.tsx::handleSubmit
- **params**: (e: React.FormEvent — form submit olayı)
- **ic_degiskenler**:
  - `e` — React form olayı nesnesi, preventDefault() ile varsayılan davranışı engellenir
  - `email` — ForgotPasswordPage kapsamından gelen e-posta state'i, sıfırlama isteği için kullanılır
  - `resetPassword` — ForgotPasswordPage kapsamından gelen, şifre sıfırlama API'sini çağıran fonksiyon
  - `t` — ForgotPasswordPage kapsamından gelen çeviri fonksiyonu, hata/success mesajlarını çevirir
  - `error` — resetPassword() çağrısından dönen hata nesnesi (try bloğunda)
  - `error` — catch bloğunda yakalanan beklenmedik hata nesnesi
- **Dönüş**: void (asenkron fonksiyon, promise döner)

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