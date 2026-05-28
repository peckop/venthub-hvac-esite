---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx
skeleton_hash: 85f4afbf3aec26ee
entity_hashes:
  func:renderWithProviders: 836f0c3bce4ec02c
  overview: 8400c9916e1ce4f6
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının hesap güvenliği sayfasının test süreçlerini destekleyen bir test dosyasıdır. Tüm testlerde tutarlı, standartlaştırılmış bir çalışma ortamı sağlamak amacıyla testlere özel yardımcı fonksiyonlar barındırır.

## Fonksiyon Grupları
### Test Ortamı Yardımcı Fonksiyonları
React arayüz elemanlarını testlerde kullanılan sistem sağlayıcılarıyla birlikte sunan, test kullanıcısı için varsayılan iletişim bilgileri tanımlayarak tekrarlayan test ayarlarını ortadan kaldıran yardımcıları barındırır.
- renderWithProviders

---

## AXIOMS – Mimari Varsayımlar
Bu React test modülü, AccountSecurityPage hesap güvenliği sayfasının test ortamında doğru şekilde renderlanması, çalıştırılması ve test edilmesi için test altyapısının, tanımlı mock kullanıcı verisinin ve tüm gerekli uygulama provider yapılandırmalarının erişilebilir olmasını varsayar.

[Aksiyom 1]: Eğer renderWithProviders fonksiyonunun çalışması için gereken tüm React uygulama providerları (yetkilendirme kontexti, state yönetimi vb.) ve test bağımlılıkları yoksa, AccountSecurityPage bileşeni testlerde hiçbir şekilde render edilemez ve tüm testler başarısız olur.
[Aksiyom 2]: Eğer varsayılan test kullanıcısı email'i 'u@example.com' test ortamındaki mock servisler veya test veritabanında kayıtlı, yetkili bir hesaba ait değilse, hesap güvenliği verileri çekilemez ve güvenlik odaklı tüm testler başarısız olur.
[Aksiyom 3]: Eğer projenin test çalıştırma altyapısı (Jest, TypeScript derleyicisi, React Testing Library vb.) .tsx uzantılı test dosyalarını işleyecek şekilde yapılandırılmamışsa, bu test modülü hiç çalıştırılamaz.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_0
- **params**: (yok)
- **ic_degiskenler**:
  - `useRouter().push` — Next.js router push metodu mock'u
  - `useRouter().replace` — Next.js router replace metodu mock'u
  - `useRouter().prefetch` — Next.js router prefetch metodu mock'u
  - `useSearchParams()` — URLSearchParams nesnesi döndüren mock
  - `usePathname()` — '/' pathini döndüren mock
- **Dönüş**: useRouter, useSearchParams, usePathname metotlarını içeren Next.js router mock nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_1
- **params**: (yok)
- **ic_degiskenler**:
  - `push` — Router push metodu mock'u
  - `replace` — Router replace metodu mock'u
  - `prefetch` — Router prefetch metodu mock'u
- **Dönüş**: router metotlarını içeren mock nesnesi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_2
- **params**: (yok)
- **ic_degiskenler**:
  - `toastFn` — Temel toast ana fonksiyonu olarak vi.fn() ile oluşturulmuş mock
  - `toastFn.error` — Hata mesajı göstermek için mocklanmış toast error metodu
  - `toastFn.success` — Başarı mesajı göstermek için mocklanmış toast success metodu
- **Dönüş**: default olarak toast mock nesnesini içeren obje

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_3
- **params**: (yok)
- **ic_degiskenler**:
  - `supabase.auth.signInWithPassword` — Supabase şifre ile giriş metodu mock'u
  - `supabase.auth.updateUser` — Supabase kullanıcı bilgisi güncelleme metodu mock'u
- **Dönüş**: mocklanmış supabase nesnesini içeren obje

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_4
- **params**: (yok)
- **ic_degiskenler**:
  - `hibpPwnedCount` — HIBP servisinin ihlal sayısını döndüren, 0 değerini resolve eden mock fonksiyon
- **Dönüş**: hibpPwnedCount mock'unu içeren obje

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::renderWithProviders
- **params**: ui, userEmail
- **ic_degiskenler**:
  - `authValue.user` — Mock kullanıcı nesnesi, email ve id değerleri atanmış
  - `authValue.session` — Oturum nesnesi, null olarak ayarlanmış
  - `authValue.role` — Kullanıcı rolü, null olarak ayarlanmış
  - `authValue.loading` — Auth yükleme durumu, false olarak ayarlanmış
  - `authValue.roleLoading` — Rol yükleme durumu, false olarak ayarlanmış
  - `authValue.signIn` — Giriş metodu mock'u
  - `authValue.signUp` — Kayıt metodu mock'u
  - `authValue.signOut` — Çıkış metodu mock'u
  - `authValue.resetPassword` — Şifre sıfırlama metodu mock'u
  - `authValue.refreshSession` — Oturum yenileme metodu mock'u
- **Dönüş**: @testing-library/react render fonksiyonunun sonucu, sarmalanmış providerlarla bileşen render edilir

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_5
- **params**: (yok)
- **ic_degiskenler**:
  - `vi.clearAllMocks` — Tüm vitest mocklarını sıfırlayan fonksiyon
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_6
- **params**: (yok)
- **ic_degiskenler**:
  - `cleanup` - @testing-library/react temizleme fonksiyonu, test sonrası DOM'u temizler
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_7
- **params**: (yok)
- **ic_degiskenler**: Tüm test senaryolarını tanımlayan 6 adet `it` bloğu, her biri ayrı şifre güncelleme senaryosunu test eder
- **Dönüş**: yok

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_8
- **params**: (yok)
- **ic_degiskenler**:
  - `getByPlaceholderText` — renderWithProviders'ten dönen placeholder ile element bulma metodu
  - `getByRole` — renderWithProviders'ten dönen rol ile element bulma metodu
  - `newInput` — "New password" placeholder'ına sahip şifre input elementi
  - `confirmInput` — "New password (confirm)" placeholder'ına sahip şifre tekrar input elementi
  - `saveBtn` — "Save" isimli buton elementi
  - `userEvent.type` — Kullanıcı inputunu simüle eden testing-library metodu
  - `userEvent.click` — Kullanıcı tıklamasını simüle eden testing-library metodu
  - `expect` — Vitest assertion metodu
- **Dönüş**: yok, boş current password senaryosunu test eder

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_9
- **params**: (yok)
- **ic_degiskenler**:
  - `getByPlaceholderText` — Element bulma metodu
  - `getByRole` — Element bulma metodu
  - `screen.getAllByPlaceholderText` — screen nesnesinden tüm eşleşen placeholder elementlerini bulma metodu
  - `currentInput[0]` — İlk "Current password" input elementi, HTMLInputElement olarak cast edilmiş
  - `newInput` — Yeni şifre input elementi
  - `confirmInput` — Yeni şifre tekrar input elementi
  - `saveBtn` — Kaydet butonu
  - `userEvent` — Kullanıcı etkileşimi simülasyon metotları
- **Dönüş**: yok, kısa yeni şifre senaryosunu test eder

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_10
- **params**: (yok)
- **ic_degiskenler**:
  - `currentInput[0]` — Mevcut şifre input elementi
  - `newInput` — Yeni şifre input
  - `confirmInput` — Yeni şifre tekrar input
  - `saveBtn` — Kaydet butonu
  - `userEvent` — Kullanıcı etkileşimi metotları
  - `expect` — Assertion metodu
- **Dönüş**: yok, eşleşmeyen şifreler senaryosunu test eder

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_11
- **params**: (yok)
- **ic_degiskenler**:
  - `vi.mocked` — Vitest mock sarmalama metodu
  - `supabase.auth.signInWithPassword.mockImplementationOnce` — Giriş metodu için tek kullanımlık implementasyon atama
  - `currentInput[0]` — Mevcut şifre input
  - `newInput` — Yeni şifre input
  - `confirmInput` — Yeni şifre tekrar input
  - `saveBtn` — Kaydet butonu
- **Dönüş**: yok, yanlış mevcut şifre senaryosunu test eder

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_12
- **params**: (yok)
- **ic_degiskenler**:
  - `data.user` — Giriş başarısızlığında null kullanıcı nesnesi
  - `data.session` — Giriş başarısızlığında null oturum nesnesi
  - `error` — AuthError tipi hata nesnesi, geçersiz giriş bilgisi mesajı içerir
- **Dönüş**: Hata içeren promise nesnesi, kimlik doğrulama hatasını simüle eder

### [N15_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_13
- **params**: (yok)
- **ic_degiskenler**:
  - `vi.mocked(supabase.auth.signInWithPassword)` — Mocklanmış giriş metodu
  - `vi.mocked(supabase.auth.updateUser)` — Mocklanmış kullanıcı güncelleme metodu
  - `currentInput[0]` — Mevcut şifre input
  - `newInput` — Yeni şifre input
  - `confirmInput` — Yeni şifre tekrar input
  - `saveBtn` — Kaydet butonu
- **Dönüş**: yok, başarılı şifre güncelleme senaryosunu test eder

### [N16_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_14
- **params**: (yok)
- **ic_degiskenler**:
  - `data.user` — Başarılı giriş sonrası dolu kullanıcı nesnesi
  - `data.session` — Başarılı giriş sonrası dolu oturum nesnesi
  - `error` — null hata değeri
- **Dönüş**: Başarılı giriş verisini içeren resolved promise

### [N17_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_15
- **params**: (yok)
- **ic_degiskenler**:
  - `data.user` — Başarılı güncelleme sonrası dolu kullanıcı nesnesi
  - `error` — null hata değeri
- **Dönüş**: Başarılı güncelleme verisini içeren resolved promise

### [N18_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_16
- **params**: (yok)
- **ic_degiskenler**:
  - `vi.mocked(supabase.auth.signInWithPassword)` — Mocklanmış giriş metodu
  - `vi.mocked(supabase.auth.updateUser)` — Mocklanmış kullanıcı güncelleme metodu
  - `currentInput[0]` — Mevcut şifre input
  - `newInput` — Yeni şifre input
  - `confirmInput` — Yeni şifre tekrar input
  - `saveBtn` — Kaydet butonu
- **Dönüş**: yok, güncelleme başarısızlığı senaryosunu test eder

### [N19_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_17
- **params**: (yok)
- **ic_degiskenler**:
  - `data.user` — Başarılı ön doğrulama sonrası dolu kullanıcı nesnesi
  - `data.session` — Başarılı ön doğrulama sonrası dolu oturum nesnesi
  - `error` — null hata değeri
- **Dönüş**: Ön doğrulama başarılı verisini içeren resolved promise

### [N20_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\__tests__\AccountSecurityPage.test.tsx::anon_18
- **params**: (yok)
- **ic_degiskenler**:
  - `data.user` — Güncelleme başarısızlığında null kullanıcı nesnesi
  - `error` — Güncelleme hatasını içeren AuthError nesnesi
- **Dönüş**: Güncelleme hatası içeren resolved promise

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