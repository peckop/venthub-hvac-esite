---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx
skeleton_hash: 178ee6f967011c3b
entity_hashes:
  func:renderWithProviders: 836f0c3bce4ec02c
  overview: 0112e0bab9ff71b2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:56:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının hesap güvenliği sayfası için tasarlanmış bir test dosyasıdır. Amaç, testlerin tekrarlanabilir ve tutarlı bir ortamda çalışmasını sağlamaktır. Modül, test processlerini hızlandırmak ve standartlaştırmak için gerekli yardımcı araçları içerir.

## Fonksiyon Grupları
### Test Ortamı Hazırlığı
Test senaryoları çalıştırılmadan önce gerekli olan tüm bağlam (context) ve sağlayıcı (provider) bileşenlerini test edilen ana bileşenin etrafında sarmalayarak gerçekçi bir çalışma ortamı yaratır. Bu sayede her test kendi içinde tutarlı bir yapıya sahip olur.
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

### [N1_NASIL] AST Pointer: AccountSecurityPage.test.tsx::useRouterMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: useRouter mock objesi (push, replace, prefetch metodları)

### [N2_NASIL] AST Pointer: AccountSecurityPage.test.tsx::useSearchParamsMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: Boş URLSearchParams nesnesi

### [N3_NASIL] AST Pointer: AccountSecurityPage.test.tsx::usePathnameMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: '/' karakter dizisi

### [N4_NASIL] AST Pointer: AccountSecurityPage.test.tsx::toastMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: toast mock objesi (error ve success metodları)

### [N5_NASIL] AST Pointer: AccountSecurityPage.test.tsx::supabaseMock
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `mockClient` — Supabase client mock nesnesi, auth metodlarını (getUser, signInWithPassword, updateUser, unlinkIdentity, linkIdentity) mock eder
- **Dönüş**: supabaseBrowserClient mock objesi

### [N6_NASIL] AST Pointer: AccountSecurityPage.test.tsx::hibpMock
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: hibpPwnedCount mock fonksiyonu

### [N7_NASIL] AST Pointer: AccountSecurityPage.test.tsx::renderWithProviders
- **params**: (ui: React.ReactElement, options: { userEmail?: string })
- **ic_degiskenler**: 
  - `authValue` — AuthContext provider için mock değer, kullanıcı oturumunu simüle eder
- **Dönüş**: render sonucu (React testing library)

### [N8_NASIL] AST Pointer: AccountSecurityPage.test.tsx::clearAllMocks
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: AccountSecurityPage.test.tsx::cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N10_NASIL] AST Pointer: AccountSecurityPage.test.tsx::shows validation errors for empty current password
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

### [N11_NASIL] AST Pointer: AccountSecurityPage.test.tsx::shows validation error for short new password
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `currentInput` — Mevcut şifre input elementi (HTMLInputElement olarak cast edilmiş)
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

### [N12_NASIL] AST Pointer: AccountSecurityPage.test.tsx::shows validation error when passwords do not match
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `currentInput` — Mevcut şifre input elementi (HTMLInputElement olarak cast edilmiş)
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

### [N13_NASIL] AST Pointer: AccountSecurityPage.test.tsx::handles wrong current password
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `currentInput` — Mevcut şifre input elementi (HTMLInputElement olarak cast edilmiş)
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: AccountSecurityPage.test.tsx::updates password successfully
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `currentInput` — Mevcut şifre input elementi (HTMLInputElement olarak cast edilmiş)
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

### [N15_NASIL] AST Pointer: AccountSecurityPage.test.tsx::shows error when update fails
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `getByPlaceholderText` — Render sonucundan placeholder文本 ile element bulan fonksiyon
  - `getByRole` — Render sonucundan ARIA rolü ile element bulan fonksiyon
  - `currentInput` — Mevcut şifre input elementi (HTMLInputElement olarak cast edilmiş)
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Şifre onay input elementi
  - `saveBtn` — Kaydet butonu elementi
- **Dönüş**: yok

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