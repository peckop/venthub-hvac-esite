---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\AuthCallbackPage.tsx
skeleton_hash: ffd02b4bb0002d84
generated_at: 2026-05-23T22:39:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kimlik doğrulama akışında, harici kimlik sağlayıcısından geri dönüş yapılan özel React sayfa bileşenini barındırır. Kimlik doğrulama işlemi sonrası kullanıcının oturum süreçlerini yönetip ana uygulamaya yönlendirmek üzere tasarlanmış tek sorumluluklu bir görsel modüldür.

## Fonksiyon Grupları
### Ana Giriş Noktası Bileşeni
Modülün tek dışa aktarılan ana bileşeni olarak, kimlik doğrulama geri dönüş sürecinin tüm işleyişini yönetir, kullanıcıya yönlendirme ve bekleme durumu arayüzünü sunar.
- AuthCallbackPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, platform kimlik doğrulama sürecinin son adımı olan kimlik sağlayıcısı geri dönüş işlemini yönetir, çalışması için kimlik doğrulama altyapısı, rota yapılandırması ve API entegrasyonunun eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer uygulama genelinde tanımlı kimlik doğrulama sağlayıcısının bu sayfaya yönlendirme yapmasını sağlayacak rota eşleştirmesi yoksa, kimlik sağlayıcısından geri dönen kullanıcı bu sayfaya ulaşamaz ve oturum açma süreci tamamen başarısız olur.
[Aksiyom 2]: Eğer kimlik doğrulama akışı sırasında oluşturulan güvenlik state parametresiyle eşleşen oturum verisi kullanıcının tarayıcısında mevcut değilse, CSRF koruması tetiklenerek erişim reddedilir ve kullanıcı oturumu açılamaz.
[Aksiyom 3]: Eğer bu modülün kimlik sağlayıcısından gelen yetkilendirme kodunu sunucu tarafına ileterek erişim/yenileme tokenleri almasını sağlayacak API istemcisi entegrasyonu yoksa, kullanıcı için geçerli oturum oluşturulamaz.
[Aksiyom 4]: Eğer oturum açma işlemi sonrası kullanıcıyı platformun ana sayfasına veya girişten önce erişmek istediği özel sayfaya yönlendirecek uygulama içi yönlendirme altyapısı yoksa, kullanıcı oturum açsa bile platformun kullanılabilir kısımlarına erişemez.
[Aksiyom 5]: Eğer geri dönüş sürecinde oluşan hataları (geçersiz kod, süre aşımı vb.) kullanıcıya iletecek bildirim altyapısı yoksa, oluşan sorunlar hakkında kullanıcı bilgilendirilemez ve sorun giderme süreci imkansız hale gelir.

---

## FONKSIYON DETAYLARI

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