---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx
skeleton_hash: 575f4d7bd4a1e049
entity_hashes:
  func:renderWithProviders: 836f0c3bce4ec02c
  overview: c2cb0ff270a47d92
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının Hesap Güvenliği sayfası için yazılmış test dosyasıdır. Temel amacı, test senaryolarının çalıştırılacağı ortamı hazırlamak ve her testin tutarlı, izole bir bağlamda çalışmasını sağlamaktır. Tek bir yardımcı fonksiyon içerir; bu fonksiyon test edilen bileşeni uygulamanın gerçek üretimbenzerti koşullarına yakın bir ortamda render eder.

## Fonksiyon Grupları
### Test Ortamı Hazırlığı
Testler çalıştırılmadan önce gerekli tüm sağlayıcıları (I18nProvider, AuthContext.Provider vb.) merkezi bir şekilde yapılandırarak test bileşeninin etrafını sarar. Bu sayede her test senaryosu kimlik doğrulama, uluslararasılaştırma gibi temel uygulama bağlamlarıyla donatılmış izole bir ortamda çalışır.
- renderWithProviders

---

## AXIOMS – Mimari Varsayımlar
Bu modül, testler için bir ortam hazırlayan yardımcı bir fonksiyon içerir. Doğru çalışması için aşağıdaki varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `renderWithProviders` fonksiyonunun çağrıldığı test ortamı, React test yardımcılarını (örn: `@testing-library/react`) içermiyorsa, bileşen düzgün bir şekilde render edilemez ve test başarısız olur.

[Aksiyom 2]: Eğer `renderWithProviders` fonksiyonunun sarmaladığı (`wrapper`) `React.ReactElement` (`ui` parametresi) için gerekli bağımlılık sağlayıcıları (örn: `AuthProvider`, `ThemeProvider`, `MemoryRouter`) eksik veya hatalı yapılandırılmışsa, test edilen bileşen (`AccountSecurityPage`) bağlamdan yoksun kalır ve beklenmeyen davranışlar sergiler veya hata fırlatır.

[Aksiyom 3]: Eğer `userEmail` parametresi bir değer olarak sağlanmazsa, fonksiyon varsayılan olarak `'u@example.com'` değerini kullanır. Bu varsayılan değerin, test senaryosunun beklentilerini karşılamadığı durumlarda, test düzgün çalışmayabilir.

---

## FONKSİYON DETAYLARI

### renderWithProviders
**Ne yapar**: Test ortamlarında React bileşenlerini uygulamanın gerçek çalışma bağlamına uygun şekilde render etmek için geliştirilmiş test yardımcı fonksiyonudur. Özellikle AccountSecurityPage testlerinde kullanılan bu fonksiyon, test edilen bileşenin ihtiyaç duyduğu tüm temel bağlamları sağlayarak güvenilir test sonuçları elde edilmesini sağlar.
**Nasıl yapar**: Gelen React elemanını evvela uluslararasılaştırma işlemlerini yöneten I18nProvider, ardından kimlik doğrulama verilerini tüm alt bileşenlere aktaran AuthContext.Provider bileşenleri ile sarmalar. Testler için varsayılan bir kullanıcı e-postası atayarak kimlik doğrulama bağlam değerini yapılandırır, son olarak sarmalanmış bileşeni React'in yerel render fonksiyonu ile ekrana yansıtır.
**Parametreler**:
- name: ui, type: React.ReactElement — Test ortamında render edilmesi gereken asıl React bileşeni, genellikle test edilen hesap güvenliği sayfası gibi ana bileşendir
- name: userEmail, type: string — Kimlik doğrulama bağlamında kullanılacak test kullanıcısının e-posta adresi, varsayılan olarak 'u@example.com' değerine sahiptir, özel test senaryoları için bu değer üzerine yazılabilir
**Dönüş**: React'in yerel render fonksiyonunun döndürdüğü sonuç nesnesini döndürür. Bu nesne üzerinden testlerde DOM elemanlarına erişim, varlık kontrolü, kullanıcı etkileşimleri simülasyonu gibi tüm test işlemleri sorunsuz şekilde gerçekleştirilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AccountSecurityPage.test.tsx::useRouterMock
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ useRouter, useSearchParams, usePathname }` — Next.js hook'larının mock tanımları

### [N2_NASIL] AST Pointer: AccountSecurityPage.test.tsx::routerMethodsMock
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ push, replace, prefetch }` — Router metodlarının vi.fn() mock'ları

### [N3_NASIL] AST Pointer: AccountSecurityPage.test.tsx::toastMock
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ toast: { error, success } }` — Sonner toast mock'ları

### [N4_NASIL] AST Pointer: AccountSecurityPage.test.tsx::supabaseMock
- **params**: yok
- **ic_degiskenler**:
  - `mockClient` — Supabase browser client mock'u, auth metodlarını (getUser, signInWithPassword, updateUser, unlinkIdentity, linkIdentity) barındırır
- **Dönüş**: `{ supabaseBrowserClient: mockClient }` — Mock supabase client'ı

### [N5_NASIL] AST Pointer: AccountSecurityPage.test.tsx::hibpMock
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ hibpPwnedCount }` — HIBP pwned count mock fonksiyonu (0 döner)

### [N6_NASIL] AST Pointer: AccountSecurityPage.test.tsx::renderWithProviders
- **params**: `ui: React.ReactElement`, `{ userEmail = 'u@example.com' } = {}`
- **ic_degiskenler**:
  - `authValue` — AuthContext provider için mock değer, user (email, id), session, role, loading, signIn, signUp, signOut, resetPassword, refreshSession içerir
- **Dönüş**: `render(...)` sonucu — I18nProvider ve AuthContext.Provider ile sarılmış bileşenin render sonucu

### [N7_NASIL] AST Pointer: AccountSecurityPage.test.tsx::beforeEachCleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `vi.clearAllMocks()` çağırarak tüm mock'ları temizler

### [N8_NASIL] AST Pointer: AccountSecurityPage.test.tsx::afterEachCleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `cleanup()` çağırarak unmount edilmemiş bileşenleri temizler

### [N9_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_ShowsValidationErrorsEmptyCurrentPassword
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder text'e göre element bulan query fonksiyonu
  - `getByRole` — Role attribute'a göre element bulan query fonksiyonu
  - `newInput` — 'New password' placeholder'ına sahip input elementi
  - `confirmInput` — 'New password (confirm)' placeholder'ına sahip input elementi
  - `saveBtn` — 'Save' role'üne sahip button elementi
- **Dönüş**: yok — Mevcut şifre boşken toast.error çağrıldığını doğrular

### [N10_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_ShowsValidationErrorShortPassword
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder text'e göre element bulan query fonksiyonu
  - `getByRole` — Role attribute'a göre element bulan query fonksiyonu
  - `currentInput` — İlk 'Current password' placeholder input'u (HTMLInputElement olarak cast)
  - `newInput` — 'New password' placeholder input'u
  - `confirmInput` — 'New password (confirm)' placeholder input'u
  - `saveBtn` — 'Save' role button'u
- **Dönüş**: yok — Kısa şifre için güvenlik kuralı hatası doğrulanır

### [N11_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_ShowsValidationErrorPasswordsDoNotMatch
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder query fonksiyonu
  - `getByRole` — Role query fonksiyonu
  - `currentInput` — İlk 'Current password' input elementi
  - `newInput` — 'New password' input elementi
  - `confirmInput` — 'New password (confirm)' input elementi
  - `saveBtn` — 'Save' button elementi
- **Dönüş**: yok — Şifreler eşleşmediğinde hata mesajı doğrulanır

### [N12_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_HandlesWrongCurrentPassword
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder query fonksiyonu
  - `getByRole` — Role query fonksiyonu
  - `currentInput` — İlk 'Current password' input elementi
  - `newInput` — 'New password' input elementi
  - `confirmInput` — 'New password (confirm)' input elementi
  - `saveBtn` — 'Save' button elementi
- **Dönüş**: yok — Yanlış mevcut şifre ile AuthError fırlatıldığında hatanın ele alındığını doğrular

### [N13_NASIL] AST Pointer: AccountSecurityPage.test.tsx::signInWithPasswordFailureMock
- **params**: yok (arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { user: null, session: null }, error: AuthError }` — signInWithPassword başarısız mock yanıtı

### [N14_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_UpdatesPasswordSuccessfully
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder query fonksiyonu
  - `getByRole` — Role query fonksiyonu
  - `currentInput` — İlk 'Current password' input elementi
  - `newInput` — 'New password' input elementi
  - `confirmInput` — 'New password (confirm)' input elementi
  - `saveBtn` — 'Save' button elementi
- **Dönüş**: yok — Başarılı şifre güncelleme işlemini ve toast.success çağrısını doğrular

### [N15_NASIL] AST Pointer: AccountSecurityPage.test.tsx::signInWithPasswordSuccessMock
- **params**: yok (arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { user, session }, error: null }` — signInWithPassword başarılı mock yanıtı

### [N16_NASIL] AST Pointer: AccountSecurityPage.test.tsx::updateUserSuccessMock
- **params**: yok (arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { user }, error: null }` — updateUser başarılı mock yanıtı

### [N17_NASIL] AST Pointer: AccountSecurityPage.test.tsx::test_ShowsErrorWhenUpdateFails
- **params**: yok (async arrow function)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Placeholder query fonksiyonu
  - `getByRole` — Role query fonksiyonu
  - `currentInput` — İlk 'Current password' input elementi
  - `newInput` — 'New password' input elementi
  - `confirmInput` — 'New password (confirm)' input elementi
  - `saveBtn` — 'Save' button elementi
- **Dönüş**: yok — updateUser başarısız olduğunda toast.error çağrıldığını doğrular

### [N18_NASIL] AST Pointer: AccountSecurityPage.test.tsx::signInWithPasswordSuccessMock2
- **params**: yok (arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { user, session }, error: null }` — signInWithPassword başarılı mock yanıtı

### [N19_NASIL] AST Pointer: AccountSecurityPage.test.tsx::updateUserFailureMock
- **params**: yok (arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { user: null }, error: AuthError }` — updateUser başarısız mock yanıtı

---

## NODE ID STANDARD

  file: src\views\account\__tests__\AccountSecurityPage.test.tsx
  function: src\views\account\__tests__\AccountSecurityPage.test.tsx::renderWithProviders

---

## DISA AKTARILANLAR (EXPORTS)
  export: renderWithProviders

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)