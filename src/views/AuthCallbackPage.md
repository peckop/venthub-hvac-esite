---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: ffd02b4bb0002d84
entity_hashes:
  func:AuthCallbackPage: b8296e20d27a327c
  overview: 4e4abcf032bc136f
  style_tokens: 404ab1f16440192d
generated_at: 2026-05-28T22:39:23Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kimlik doğrulama akışında, harici kimlik sağlayıcısından geri dönüş yapılan özel React sayfa bileşenini barındırır. Kimlik doğrulama sonrası kullanıcının oturum süreçlerini yönetip ana uygulamaya yönlendirmek üzere tasarlanmış tek sorumluluklu bir görsel modüldür.

## Fonksiyon Grupları
### Ana Giriş Noktası Bileşeni
Modülün tek dışa aktarılan ana bileşeni olarak, kimlik doğrulama geri dönüş sürecinin tüm işleyişini yönetir, kullanıcıya yönlendirme ve bekleme durumu arayüzünü sunar.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kimlik doğrulama geri dönüş sayfası olarak çalışır; fonksiyon gövdesi sağlanmadığı için aksiyomlar modülün amacına dayalı minimal varsayımlardır.

[Aksiyom 1]: Eğer kimlik sağlayıcı (OAuth/Identity Provider) yapılandırması yoksa, kimlik doğrulama geri dönüş parametreleri alınamaz ve kullanıcı oturumu başlatılamaz.

[Aksiyom 2]: Eğer uygulama rotaları arasında AuthCallbackPage'e yönlendirme tanımı yoksa, kimlik sağlayıcısı geri dönüş URL'i bu sayfaya ulaşamaz.

[Aksiyom 3]: Eğer tarayıcı URL parametrelerinde (token, code, state vb.) kimlik doğrulama verileri yoksa, oturum oluşumu başarısız olur ve kullanıcı ana uygulamaya yönlendirilemez.

[Aksiyom 4]: Eğer kimlik doğrulama API'si (session/token exchange) erişilebilir değilse, kullanıcı bilgileri sunucu tarafında doğrulanamaz.

[Aksiyom 5]: Eğer istemci tarafı oturum yönetimi mekanizması (localStorage, cookie, context) yoksa, kimlik bilgileri saklanamaz ve uygulama içindeki erişim kontrolü çalışamaz.

---

**Not:** Bu modül için fonksiyon gövdesi (implementasyon kodu) sağlanmamıştır. Bu nedenle aksiyomlar modülün kimlik doğrulama callback sayfası olmasından yola çıkılarak türetilmiştir. Detaylı ve kesin aksiyonlar için `AuthCallbackPage` fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### AuthCallbackPage
**Ne yapar**: VentHub HVAC projesinin kimlik doğrulama akışının geri dönüş (callback) adımını yöneten React tabanlı bir sayfa bileşenidir. Üçüncü taraf kimlik doğrulama sağlayıcısından kullanıcının platforma tekrar yönlendirildiği durumda devreye girer, oturum açma sürecinin başarılı bir şekilde sonlandırılmasını sağlar. Projenin görünüm (view) katmanında özel bir rota üzerinden çalışan, kimlik doğrulama süreçleri için ayrılmış özel bir sayfa bileşenidir.
**Nasıl yapar**: React ekosistem standartlarına uygun olarak fonksiyonel bir bileşen olarak tanımlanmıştır. Kaynak kodunun `src/views` dizininde yer alması, projenin katmanlı mimarisine uygun olarak yalnızca sayfa düzeyinde işlevsellik sunduğunu teyit eder. Kimlik doğrulama sağlayıcısından gelen yönlendirme isteğini yakalar, süreci tamamlamak için gerekli kimlik doğrulama verilerini alır, kullanıcı oturumunun oluşturulması için ilgili arka plan işlemlerini tetikler.
**Parametreler**: Tanımında herhangi bir giriş parametresi bulunmamaktadır, dışarıdan herhangi bir değer almaz.
**Dönüş**: React.FC tipinde geçerli bir React fonksiyonel bileşen döndürür. Bu döndürülen bileşen, tarayıcıda auth callback sayfasının tüm arayüz ve işlevselliklerini son kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::AuthCallbackPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `status` — loading, success, error durumlarını tutan state değişkeni, sayfa içeriğini durumuna göre koşullu renderlamak için kullanılır
  - `setStatus` — status state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `message` — Kullanıcıya gösterilecek durum mesajını tutan state değişkeni, başarı/hata bildirimlerini ekranda göstermek için kullanılır
  - `setMessage` — message state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `router` — Next.js `useRouter` hook'u ile alınan yönlendirme nesnesi, sayfalar arası geçiş işlemleri için kullanılır
  - `useEffect` — Bileşen ilk mount edildiğinde auth callback işlemlerini tetiklemek için kullanılan React hook'u, bağımlılık dizisi `[router]`
- **Dönüş**: JSX element (React.FC olarak auth callback sayfa arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::handleAuthCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `hashFragment` — URL'den alınan hash parçası, auth callback linkinin geçerliliğini kontrol etmek için kullanılır
  - `window.location.hash` — Tarayıcının mevcut URL'sinin hash kısmı, `hashFragment` değişkenine atanır
  - `data` — `supabase.auth.getSession()` çağrısından dönen oturum verisi, aktif oturumun varlığını kontrol etmek için kullanılır
  - `error` — `supabase.auth.getSession()` çağrısından dönen hata nesnesi, oturum alma sırasında oluşan hataları işlemek için kullanılır
  - `sessionError` — `supabase.auth.exchangeCodeForSession()` çağrısından dönen hata nesnesi, kod-oturum değişimi sırasında oluşan hataları konsola loglamak için kullanılır
  - `newData` — Kod değişiminden sonra tekrar alınan oturum verisi, yeni oluşturulan oturumun varlığını kontrol etmek için kullanılır
  - `newError` — İkinci `supabase.auth.getSession()` çağrısından dönen hata nesnesi, tekrar oturum alma sırasında oluşan hataları fırlatmak için kullanılır
  - `supabase.auth.getSession` — Supabase'in aktif kullanıcı oturum bilgilerini alan API çağrısı
  - `supabase.auth.exchangeCodeForSession` — URL'deki auth doğrulama kodunu oturuma dönüştüren Supabase API çağrısı
  - `console.error` — Hata mesajlarını geliştirici konsoluna yazmak için kullanılan fonksiyon
  - `toast.success` — Başarı bildirimi göstermek için kullanılan react-hot-toast fonksiyonu
  - `setTimeout` — Kullanıcıya mesajı göstermek için yönlendirmeyi 2-3 saniye geciktirmek için kullanılan zamanlayıcı
  - `router.push` — Kullanıcıyı hedef rotaya yönlendirmek için kullanılan Next.js router fonksiyonu
  - `Routes.auth.login` — Giriş sayfası rotasını dinamik olarak oluşturan uygulama yardımcı fonksiyonu
- **Dönüş**: void (sadece yan etki bırakır, değer döndürmez)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::<anonymous>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router.push` — Başarılı doğrulama sonrası kullanıcıyı ana sayfa (/) rotasına yönlendirmek için kullanılan Next.js router fonksiyonu
- **Dönüş**: void

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::<anonymous>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router.push` — Doğrulama hatası sonrası kullanıcıyı giriş sayfasına yönlendirmek için kullanılan Next.js router fonksiyonu
  - `Routes.auth.login` — Hata mesajı parametresi ile giriş sayfası rotasını oluşturan yardımcı fonksiyon
  - `error.message` — Oturum alma sırasında oluşan hatanın kullanıcıya gösterilecek mesajı, rotaya parametre olarak geçirilir
- **Dönüş**: void

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::<anonymous>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router.push` — Başarılı oturum oluşturma sonrası kullanıcıyı ana sayfa (/) rotasına yönlendirmek için kullanılan Next.js router fonksiyonu
- **Dönüş**: void

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::<anonymous>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router.push` — Geçersiz/ süresi dolmuş link durumunda kullanıcıyı giriş sayfasına yönlendirmek için kullanılan Next.js router fonksiyonu
  - `Routes.auth.login` — "No session found" hata mesajı ile giriş sayfası rotasını oluşturan yardımcı fonksiyon
- **Dönüş**: void

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx::<anonymous>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router.push` — Beklenmedik hata durumunda kullanıcıyı giriş sayfasına yönlendirmek için kullanılan Next.js router fonksiyonu
  - `Routes.auth.login` — Ekstra parametresiz standart giriş sayfası rotasını oluşturan yardımcı fonksiyon
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