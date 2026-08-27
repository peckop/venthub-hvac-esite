---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 651b76018a8f2f7f
entity_hashes:
  func:AdminUsersPage: 451e88fd6557b257
  overview: 59fb62326dee9132
  style_tokens: 5e9d7754f938f018
generated_at: 2026-08-27T07:22:46Z
---

## Genel Bakış
AdminUsersPage, VentHub HVAC yönetici panelinin kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesini, filtrelemesini ve temel bilgilerini düzenleyebilmesini sağlayan merkezi bir bileşendir. Sayfa, yetkilendirme kontrolü, Suspense sarmalayıcısı ve DataTableKit tabanlı bir arayüz sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcı yönetimi arayüzünü, veri akışını ve yöneticiye özgü işlevsellikleri tek bir bileşen altında toplar. Bileşen parametre almaz; veri ihtiyacı hooks veya bağlam (context) aracılığıyla karşılanır.
- AdminUsersPage

## Bağımlılıklar ve Mimari Notlar
- Dış bağımlılıklar: `useAuth`, `useRole` hook'ları ve API servis bağımlılıkları aracılığıyla yetkilendirme ve veri erişimi sağlanır.
- Rol filtreleme işlevselliği içerir.
- DataTableKit tabanlı bir arayüz sunar.
- Bileşen parametre almaz; harici veriye ihtiyaç duyulursa bu veri hooks veya bağlam (context) aracılığıyla temin edilmelidir. Prop aracılığıyla veri sağlanamaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi paylaşılmamıştır; dolayısıyla fonksiyon gövdesinden türetilebilecek mimari varsayımlar belirlenememiştir.

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
- import: ../../components/admin/shell/AdminPageHeader::AdminPageHeader
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ./AdminUsersTableBody::AdminUsersTableBody
- import: next/navigation::useRouter
- import: react::React
- import: react::Suspense
- import: react::useEffect
- import: react::useMemo

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::AdminUsersPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — `useAuth()` hook'undan dönen, kimlik doğrulaması yapılmış kullanıcı nesnesi; giriş yapmamış kullanıcıyı yönlendirmek için kontrol edilir
  - `loading` — `useAuth()` hook'undan dönen, kimlik doğrulama yüklenme durumu; yönlendirme kararında `user` ile birlikte kontrol edilir
  - `role` — `useRole()` hook'undan dönen, kullanıcının rol bilgisi string'i; `isAdmin` hesaplamasında kullanılır
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; yetkisiz kullanıcıyı login sayfasına yönlendirmek için `router.push()` çağrısında kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; sayfa başlığı ve açıklama metinlerini yerelleştirmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen, yerelleştirilmiş rota yollarını içeren nesne; login sayfası yoluna erişmek için `Routes.auth.login()` çağrısında kullanılır
  - `isAdmin` — `useMemo` ile hesaplanan boolean değer; `role` değişkeni `'super_admin'` veya `'admin'` ise `true`, aksi halde `false` olur; bağımlılık dizisi `[role]`
- **Dönüş**: JSX elementi — `className="space-y-6 pb-20"` olan bir `<div>` içinde `AdminPageHeader` ve `Suspense` ile sarılmış `AdminUsersTableBody` bileşenlerini render eder

### [N2_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — dış scope'dan gelen, `useAuth()` hook'undan dönen kimlik doğrulama yüklenme durumu; `false` olduğunda yönlendirme kontrolü yapılır
  - `user` — dış scope'dan gelen, `useAuth()` hook'undan dönen kullanıcı nesnesi; `null`/falsy ise login sayfasına yönlendirme tetiklenir
  - `router` — dış scope'dan gelen Next.js router nesnesi; `router.push()` ile login sayfasına yönlendirme yapılır
  - `Routes` — dış scope'dan gelen yerelleştirilmiş rota nesnesi; `Routes.auth.login('/admin/users')` çağrısıyla login sayfası yolu ve geri dönüş parametresi oluşturulur
- **Dönüş**: yok — yan etki olarak `loading` false ve `user` falsy olduğunda `Routes.auth.login('/admin/users')` yoluna `router.push()` ile yönlendirme yapar

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