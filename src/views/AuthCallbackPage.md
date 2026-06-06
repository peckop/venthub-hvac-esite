---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: 7c8d9ccf38721fe4
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: b34c2160d04ee913
  style_tokens: 404ab1f16440192d
generated_at: 2026-06-06T21:58:25Z
---

## Genel Bakış
Bu modül, kimlik doğrulama akışının tamamlandığı geri dönüş (callback) sayfasıdır. Harici kimlik sağlayıcılarından (OAuth, SSO vb.) gelen yetkilendirme verilerini (token, code vb.) tarayıcı URL'sinden alarak kullanıcı oturumunu başlatır ve ana uygulamaya yönlendirme yapar. Tek bileşenli yapısı, tüm geri dönüş mantığını izole bir noktada toplayarak uygulama giriş sürecinin son adımı olarak görev yapar.

## Fonksiyon Grupları
### Ana Kimlik Doğrulama Bileşeni
Kimlik doğrulama geri dönüş sürecinin tüm yaşam döngüsünü yöneten bileşendir. URL parametrelerini analiz eder, oturum verilerini işler, kullanıcıya bekleme arayüzü gösterir ve oluşabilecek hataları yakalayarak anlamlı bir geri bildirim verir.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmadığından, kod analizinden türetilebilecek mimari varsayımlar belirlenememiştir.

**Not:** `AuthCallbackPage()` fonksiyon imzası仅有olup parametre almamaktadır. Fonksiyon gövdesi mevcut olmadığı için modülün çalışma zamanı bağımlılıkları, veri akışı gereksinimleri veya hata senaryoları hakkında kesin aksiyomlar üretilemez.

---

---

## FONKSİYON DETAYLARI

### AuthCallbackPage
**Ne yapar**: VentHub HVAC projesinin kimlik doğrulama akışının geri dönüş (callback) adımını yöneten React tabanlı bir sayfa bileşenidir. Üçüncü taraf kimlik doğrulama sağlayıcısından kullanıcının platforma tekrar yönlendirildiği durumda devreye girer, oturum açma sürecinin başarılı bir şekilde sonlandırılmasını sağlar. Projenin görünüm (view) katmanında özel bir rota üzerinden çalışan, kimlik doğrulama süreçleri için ayrılmış özel bir sayfa bileşenidir.
**Nasıl yapar**: React ekosistem standartlarına uygun olarak fonksiyonel bir bileşen olarak tanımlanmıştır. Kaynak kodunun `src/views` dizininde yer alması, projenin katmanlı mimarisine uygun olarak yalnızca sayfa düzeyinde işlevsellik sunduğunu teyit eder. Kimlik doğrulama sağlayıcısından gelen yönlendirme isteğini yakalar, süreci tamamlamak için gerekli kimlik doğrulama verilerini alır, kullanıcı oturumunun oluşturulması için ilgili arka plan işlemlerini tetikler.
**Parametreler**: Tanımında herhangi bir giriş parametresi bulunmamaktadır, dışarıdan herhangi bir değer almaz.
**Dönüş**: React.FC tipinde geçerli bir React fonksiyonel bileşen döndürür. Bu döndürülen bileşen, tarayıcıda auth callback sayfasının tüm arayüz ve işlevselliklerini son kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `status` — useState hook'u ile tanımlanan state değişkeni, sayfanın mevcut durumunu (loading/success/error) tutar
  - `message` — useState hook'u ile tanımlanan state değişkeni, kullanıcıya gösterilecek mesajı tutar
  - `router` — useRouter() hook'u ile elde edilen Next.js router nesnesi, sayfa yönlendirmeleri için kullanılır
- **Dönüş**: JSX element (React bileşeni)

### [N2_NASIL] AuthCallbackPage.tsx::handleAuthCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `hashFragment` — window.location.hash değerini tutar, URL'deki hash fragment bilgisini içerir
  - `data` — supabase.auth.getSession() çağrısının response data değeri, mevcut oturum bilgisini içerir
  - `error` — supabase.auth.getSession() çağrısının response error değeri, hata bilgisini içerir
  - `sessionError` — supabase.auth.exchangeCodeForSession() çağrısının error değeri, token alışverişi hatalarını tutar
  - `newData` — ikinci supabase.auth.getSession() çağrısının response data değeri, güncellenmiş oturum bilgisini içerir
  - `newError` — ikinci supabase.auth.getSession() çağrısının response error değeri, güncelleme hatalarını tutar
- **Dönüş**: void (return ile erken çıkış)

### [N3_NASIL] AuthCallbackPage.tsx::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımlaması yok)
- **Dönüş**: void

### [N4_NASIL] AuthCallbackPage.tsx::successRedirectHome
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

### [N5_NASIL] AuthCallbackPage.tsx::errorRedirectLogin
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

### [N6_NASIL] AuthCallbackPage.tsx::successRedirectHomeSecond
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

### [N7_NASIL] AuthCallbackPage.tsx::invalidLinkRedirect
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

### [N8_NASIL] AuthCallbackPage.tsx::catchRedirectLogin
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

### [N9_NASIL] AuthCallbackPage.tsx::buttonOnClickRedirect
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde değişken tanımı yok, sadece router.push çağrısı)
- **Dönüş**: void

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