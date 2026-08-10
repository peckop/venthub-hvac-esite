---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 8152ed3568ca718b
entity_hashes:
  func:AdminUsersPage: 451e88fd6557b257
  overview: 5d4f94424fb6fbfb
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:49:23Z
---

## Genel Bakış
AdminUsersPage, VentHub HVAC yönetici panelinin kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesini, filtrelemesini ve temel bilgilerini düzenleyebilmesini sağlayan merkezi bir bileşendir. Sayfa, yetkilendirme kontrolü, Suspense sarmalayıcısı ve DataTableKit tabanlı bir arayüz sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcı yönetimi arayüzünü, veri akışını ve yöneticiye özgü işlevsellikleri tek bir bileşen altında toplar.
- AdminUsersPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmamıştır; dolayısıyla fonksiyon gövdesinden çıkarılabilir mimari varsayım üretilememektedir. Aşağıda yalnızca fonksiyon imzasından (```AdminUsersPage() -> React.FC```) güvenle çıkarılabilecek minimal varsayımlar yer almaktadır.

---

**[Aksiyom 1]:** Eğer `AdminUsersPage` bileşeni React dışında bir ortamda (ör. Node.js sunucu tarafı) çağrılacak olursa, React render motoru olmadığından bileşen geçerli bir JSX/React elementi üretemez ve çağrı hata ile sonuçlanır.

**[Aksiyom 2]:** Eğer `AdminUsersPage` bileşeninin dönüş tipi (`React.FC`) ile uyumsuz bir değer (ör. `null`, `undefined`, `string`, `number`) döndürülecek olursa, TypeScript derleme zamanı hatası oluşur veya React çalışma zamanında geçersiz çocuk hatası verir.

**[Aksiyom 3]:** Bileşen parametre almamaktadır (imzada prop tanımı yoktur); eğer bileşen içinden harici veriye ihtiyaç duyulursa, bu veri hooks veya bağlam (context) aracılığıyla temin edilmelidir. Prop aracılığı veri sağlanamaz.

---

> **Not:** `useAuth`, `useRole`, API servis bağımlılıkları, rol filtreleme, kullanıcı listesi yükleme gibi konularda fonksiyon gövdesianaliz edilmediğinden (paylaşılmadığından) aksiyom üretilememiştir. Fonksiyon gövdesi sağlandığında kapsamlı mimari varsayımlar oluşturulabilir.

---

## FONKSİYON DETAYLARI

### AdminUsersPage
**Ne yapar**: Kullanıcı yönetimi sayfasını oluşturur. Bu sayfa, DataTableKit'e göç edilmiş, istemci tarafında (CLIENT-mode) çalışan ve çift sekmeli (DUAL-TAB) bir arayüz sunar.

**Nasıl yapar**: Fonksiyon, sayfa yapısını tanımlar. İçerisinde bir başlık bölümü, yetkilendirme (auth) ve yönlendirme (redirect) kontrolü ile `Suspense` bileşenini barındırır. Sayfanın tüm veri, URL ve sekme state yönetimi, `useAdminTable` hook'unu kullanan `AdminUsersTableBody` bileşenine devredilmiştir. Bu hook, `useSearchParams`'ı tüketir; React 18 ile gelen Suspense ile sarılı kullanım (Kural 5 / K2) uygulanmıştır.

**Parametreler**:
Bu fonksiyon bir React fonksiyonel bileşenidir (`React.FC`) ve herhangi bir parametre almaz.

**Dönüş**: `React.FC` tipinde bir React bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./AdminUsersTableBody::AdminUsersTableBody
- import: next/navigation::useRouter
- import: react::React
- import: react::Suspense
- import: react::useEffect
- import: react::useMemo

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::AdminUsersPage
- **params**: () — parametre yok (React fonksiyonel bileşeni)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook'undan destructured, mevcut oturum açmış kullanıcı nesnesi; kimlik doğrulama durumunu temsil eder
  - `loading` — `useAuth()` hook'undan destructured, kimlik doğrulama durumunun hâlâ yüklenmekte olduğunu belirten boolean bayrak
  - `role` — `useRole()` hook'undan destructured, kullanıcının rol dizesi (ör. `'super_admin'`, `'admin'`, `'user'`)
  - `router` — `useRouter()` ile elde edilen Next.js yönlendirici nesnesi; programlı sayfa geçişleri için kullanılır
  - `t` — `useI18n()` hook'undan destructured, çevirileri döndüren uluslararasılaştırma fonksiyonu
  - `Routes` — `useLocalizedRoutes()` hook'undan elde edilen lokalize rota tanımları nesnesi; `Routes.auth.login(...)` gibi erişimlerle kullanılır
  - `isAdmin` — `useMemo` ile hesaplanan boolean; `role` değerinin `'super_admin'` veya `'admin'` olup olmadığını kontrol eder, `AdminUsersTableBody` bileşenine prop olarak geçilir
- **Dönüş**: JSX — `<div>` sarmalayıcısı içinde `<header>` (başlık + alt başlık) ve `<Suspense>` sarmalı içinde `AdminUsersTableBody` bileşeni döndürülür

### [N2_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::AdminUsersPage/useEffect callback
- **params**: () — parametre yok (arrow function)
- **ic_degiskenler**:
  - `loading` — useEffect closure'undan erişilen üst kapsam değişkeni, auth yükleme durumu
  - `user` — useEffect closure'undan erişilen üst kapsam değişkeni, oturum açmış kullanıcı nesnesi
  - `router` — useEffect closure'undan erişilen üst kapsam değişkeni, Next.js yönlendirici
  - `Routes` — useEffect closure'undan erişilen üst kapsam değişkeni, lokalize rota tanımları
- **Dönüş**: yok — yan etki olarak `router.push(Routes.auth.login('/admin/users'))` çağrısıyla admin kullanıcılar giriş sayfasına yönlendirme yapılır; `loading` false ve `user` falsy olduğunda tetiklenir

---

## NODE ID STANDARD

  file: src\views\admin\AdminUsersPage.tsx
  function: src\views\admin\AdminUsersPage.tsx::AdminUsersPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminUsersPage

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
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`