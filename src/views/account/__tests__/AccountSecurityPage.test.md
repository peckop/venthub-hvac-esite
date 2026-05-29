---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx
skeleton_hash: 85f4afbf3aec26ee
entity_hashes:
  func:renderWithProviders: 836f0c3bce4ec02c
  overview: c381a7567f61eaba
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-29T18:55:12Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının hesap güvenliği sayfasının test süreçlerini destekleyen bir test dosyasıdır. Tüm testlerde tutarlı, standartlaştırılmış bir çalışma ortamı sağlamak amacıyla testlere özel yardımcı fonksiyonlar barındırır.

## Fonksiyon Grupları
### Test Ortamı Yardımcı Fonksiyonları
React arayüz elemanlarını testlerde kullanılan sistem sağlayıcılarıyla birlikte sunan, test kullanıcısı için varsayılan iletişim bilgileri tanımlayarak tekrarlayan test ayarlarını ortadan kaldıran yardımcıları barındırır.
- renderWithProviders

---



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

### [N1_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockU useRouter
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: `{ useRouter: () => { push, replace, prefetch } }` — Next.js useRouter mock'unu döner, push/replace/prefetch vi.fn() ile stublanmış

---

### [N2_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockU useSearchParams
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: `() => new URLSearchParams()` — boş URLSearchParams instance'ı döner

---

### [N3_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockU usePathname
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: `() => '/'` — kök path döner

---

### [N4_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockToast
- **params**: () — parametresiz
- **ic_degiskenler**:
  - `toastFn` — vi.fn() ile oluşturulmuş mock fonksiyon; `Object.assign` ile `error` ve `success` yöntemleri eklenir, böylece hem `toast()` hem `toast.error()` hem `toast.success()` çağrılabilir
- **Dönüş**: `{ default: toastFn }` — sonner toast modülünün default export'unu taklit eder

---

### [N5_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockSupabase
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: `{ supabase: { auth: { signInWithPassword, updateUser } } }` — supabase auth modülünü taklit eder; signInWithPassword ve updateUser vi.fn() ile stublanmış

---

### [N6_NASIL] AST Pointer: AccountSecurityPage.test.tsx::mockHibp
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: `{ hibpPwnedCount: vi.fn().mockResolvedValue(0) }` — Have I Been Pwned kontrol fonksiyonunu taklit eder, 0 sızıntı ile resolve eder

---

### [N7_NASIL] AST Pointer: AccountSecurityPage.test.tsx::renderWithProviders
- **params**: `(ui: React.ReactElement, { userEmail = 'u@example.com' } = {})` — test edilecek bileşen ve opsiyonel kullanıcı e-postası
- **ic_degiskenler**:
  - `authValue` — `AuthContext` tipinde nesne; `user`, `session`, `role`, `loading`, `roleLoading`, `signIn`, `signUp`, `signOut`, `resetPassword`, `refreshSession` alanlarını içerir; test ortamı için sahte auth bağlamı sağlar
  - `authValue.user` — `Object.assign` ile `{}` üzerine `email: userEmail` ve `id: '123'` atanmış Supabase User nesnesi; `as import('@supabase/supabase-js').User` ile tip ataması yapılır
  - `authValue.session` — `null` değerinde; oturum olmadığını belirtir
  - `authValue.role` — `null` değerinde; rol bilgisi olmadığını belirtir
  - `authValue.loading` — `false` değerinde; yükleme tamamlanmış durumda
  - `authValue.roleLoading` — `false` değerinde; rol yüklemesi tamamlanmış durumda
  - `authValue.signIn` — `vi.fn()` ile stublanmış giriş fonksiyonu
  - `authValue.signUp` — `vi.fn()` ile stublanmış kayıt fonksiyonu
  - `authValue.signOut` — `vi.fn()` ile stublanmış çıkış fonksiyonu
  - `authValue.resetPassword` — `vi.fn()` ile stublanmış şifre sıfırlama fonksiyonu
  - `authValue.refreshSession` — `vi.fn()` ile stublanmış oturum yenileme fonksiyonu
- **Dönüş**: `render(...)` çağırısının dönüşü; `I18nProvider > AuthContext.Provider > ui` sarmalayıcılarıyla sarılmış React bileşenini render eder

---

### [N8_NASIL] AST Pointer: AccountSecurityPage.test.tsx::beforeEachHandler
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: yok; `vi.clearAllMocks()` çağırarak tüm mock çağrı geçmişini temizler

---

### [N9_NASIL] AST Pointer: AccountSecurityPage.test.tsx::afterEachHandler
- **params**: () — parametresiz
- **ic_degiskenler**:
  - yok
- **Dönüş**: yok; `cleanup()` çağırarak React testBED dom'unu temizler

---

### [N10_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itShowsValidationErrorsForEmptyCurrentPassword
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
- **Dönüş**: yok; mevcut şifre boşken validasyon hatası verildiğini doğrular: `toast.error` ile 'Please enter your current password' çağrılmalı, `supabase.auth.signInWithPassword` çağrılmamalı

---

### [N11_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itShowsValidationErrorForShortNewPassword
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `currentInput` — `screen.getAllByPlaceholderText('Current password')[0]` ile bulunan mevcut şifre input elementi; `as HTMLInputElement` ile tip ataması yapılır
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
- **Dönüş**: yok; kısa şifre için validasyon hatası doğrulanır: `toast.error` ile 'account.security.rulesNotMet' çağrılmalı

---

### [N12_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itShowsValidationErrorWhenPasswordsDoNotMatch
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `currentInput` — `screen.getAllByPlaceholderText('Current password')[0]` ile bulunan mevcut şifre input elementi; `as HTMLInputElement` cast'li
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
- **Dönüş**: yok; eşleşmeyen şifreler için validasyon hatası doğrulanır: `toast.error` ile 'Passwords do not match' çağrılmalı, `supabase.auth.signInWithPassword` çağrılmamalı

---

### [N13_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itHandlesWrongCurrentPassword
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `currentInput` — `screen.getAllByPlaceholderText('Current password')[0]` ile bulunan mevcut şifre input elementi; `as HTMLInputElement` cast'li
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
  - `vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(...)` — signInWithPassword'ın bir kez `{ data: { user: null, session: null }, error: { name: 'AuthError', status: 400, message: 'Invalid login credentials' } }` dönmesini sağlar
- **Dönüş**: yok; yanlış mevcut şifre senaryosunu test eder: `supabase.auth.signInWithPassword` çağrılmış olmalı, `supabase.auth.updateUser` çağrılmamış olmalı, `toast.error` ile 'Current password is incorrect' çağrılmalı

---

### [N14_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itUpdatesPasswordSuccessfully
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `currentInput` — `screen.getAllByPlaceholderText('Current password')[0]` ile bulunan mevcut şifre input elementi; `as HTMLInputElement` cast'li
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
  - `vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(...)` — signInWithPassword başarılı response döner: `{ data: { user: {}, session: {} }, error: null }`
  - `vi.mocked(supabase.auth.updateUser).mockImplementationOnce(...)` — updateUser başarılı response döner: `{ data: { user: {} }, error: null }`
- **Dönüş**: yok; başarılı şifre güncelleme senaryosunu test eder: `supabase.auth.signInWithPassword` çağrılmış olmalı, `supabase.auth.updateUser` `{ password: '12345678aA!' }` argümanıyla çağrılmış olmalı, `toast.success` ile 'Your password has been updated' çağrılmalı

---

### [N15_NASIL] AST Pointer: AccountSecurityPage.test.tsx::itShowsErrorWhenUpdateFails
- **params**: () — parametresiz (async arrow callback)
- **ic_degiskenler**:
  - `getByPlaceholderText` — `renderWithProviders` destructuring dönüşünden alınan; placeholder text'e göre DOM elementi bulan fonksiyon
  - `getByRole` — `renderWithProviders` destructuring dönüşünden alınan; ARIA rolüne göre DOM elementi bulan fonksiyon
  - `currentInput` — `screen.getAllByPlaceholderText('Current password')[0]` ile bulunan mevcut şifre input elementi; `as HTMLInputElement` cast'li
  - `newInput` — `getByPlaceholderText('New password')` ile bulunan yeni şifre input elementi
  - `confirmInput` — `getByPlaceholderText('New password (confirm)')` ile bulunan şifre onay input elementi
  - `saveBtn` — `getByRole('button', { name: 'Save' })` ile bulunan kaydet butonu
  - `vi.mocked(supabase.auth.signInWithPassword).mockImplementationOnce(...)` — signInWithPassword başarılı response döner: `{ data: { user: {}, session: {} }, error: null }`
  - `vi.mocked(supabase.auth.updateUser).mockImplementationOnce(...)` — updateUser hata response döner: `{ data: { user: null }, error: { name: 'AuthError', status: 400, message: 'update failed' } }`
- **Dönüş**: yok; şifre güncelleme başarısızlık senaryosunu test eder: `supabase.auth.signInWithPassword` çağrılmış olmalı, `supabase.auth.updateUser` çağrılmış olmalı, `toast.error` ile 'An error occurred while updating password' çağrılmalı

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