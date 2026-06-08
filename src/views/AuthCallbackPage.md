---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: 8113ea5de0c1bd17
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: b36bec70832e9398
  style_tokens: 404ab1f16440192d
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
Kimlik doğrulama akışının son adımı olarak çalışan geri dönüş sayfasıdır. Harici kimlik sağlayıcılarından (OAuth, SSO vb.) dönen yetkilendirme verilerini URL üzerinden yakalayarak kullanıcı oturumunu başlatır ve ana uygulamaya yönlendirme yapar. Hata senaryolarında kullanıcıya anlamlı geri bildirim sunarak giriş sürecinin güvenilir bir şekilde tamamlanmasını sağlar.

## Fonksiyon Grupları
### Ana Kimlik Doğrulama Bileşeni
URL parametrelerinden gelen token ve yetkilendirme kodlarını işleyerek oturum başlangıcını yöneten izole sayfa bileşenidir. Tüm callback mantığını tek noktada toplayarak uygulamanın giriş sürecini sonlandırır.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kimlik doğrulama geri dönüş (callback) sayfası olarak URL'deki yetkilendirme parametrelerini işleyip oturum başlatan bir React bileşenidir.

---

## FONKSİYON DETAYLARI

### AuthCallbackPage

**Ne yapar**: Kimlik doğrulama (authentication) süreçlerinden sonra yönlendirilen kullanıcıyı karşılayan React bileşenidir. OAuth veya benzeri bir kimlik doğrulama akışı tamamlandığında, harici yetkilendirme sağlayıcısı kullanıcıyı bu sayfaya yönlendirir ve bileşen ilgili işlemleri yürütür.

**Nasıl yapar**: Bu bir React fonksiyonel bileşenidertil (React.FC). OAuth callback akışında kullanıcıyı karşılayarak, URI fragment'lerinden veya query parametrelerinden token bilgilerini çıkarıp işleyebilir, ardından kullanıcıyı uygulama içinde uygun sayfaya yönlendirir. Bileşen, authentication state yönetimini üstlenir.

**Parametreler**:
Bu bileşen doğrudan prop almamaktadır (parametresiz fonksiyon bileşenidir).

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipini döndürür. Sayfa içeriği olarak kimlik doğrulama callback işlemini yöneten JSX içeriği üretir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (yok — arrow function, React.FC olarak export edilir)
- **ic_degiskenler**:
  - `status` — useState hook'u; auth durumunu tutar (`'loading' | 'success' | 'error'`), JSX'te hangi durum panelinin gösterileceğini belirler
  - `message` — useState hook'u; kullanıcıya gösterilecek mesaj metnini tutar (başarı/hata/bilgi)
  - `router` — `useRouter()` Next.js navigasyon objesi; `router.push()` ile sayfa yönlendirmesi yapılır
- **Dönüş**: JSX — `min-h-screen` wrapper içinde `status` değerine göre loading/success/error UI'ı render eder

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