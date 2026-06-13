---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminUsersPage.tsx
skeleton_hash: 3f2c51cde3b926c8
entity_hashes:
  func:AdminUsersPage: 451e88fd6557b257
  overview: f04a0cbe1268cde5
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-13T18:56:35Z
---

## Genel Bakış
AdminUsersPage, VentHub HVAC yönetici panelinin kullanıcı yönetimi sayfasını oluşturan ana React bileşenidir. Yetkili yöneticilerin platformdaki tüm kullanıcı hesaplarını görüntülemesini, filtrelemesini ve temel bilgilerini düzenleyebilmesini sağlayan merkezi bir bileşendir. Bileşen, oturum ve yetki doğrulama için useAuth ve useRole hook'larına bağımlıdır ve kullanıcı listesi ile rol güncelleme işlemleri için arka plan API servisleriyle doğrudan etkileşime girer.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcı yönetimi arayüzünü, veri akışını ve yöneticiye özgü işlevsellikleri tek bir bileşen altında toplar.
- AdminUsersPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca fonksiyon gövdesinden üretilmelidir. Ancak fonksiyon gövdesi verilmemiştir; bu nedenle güvenilir bir aksiyom çıkarılamamaktadır.

[Aksiyom 1]: Eğer AdminUsersPage fonksiyon gövdesinde kullanıcı verilerini sağlayan bir kaynak (API servisi, Context, hook veya global state) çağrılmıyorsa, bileşen kullanıcı verisi olmadan render olur ve yönetici panelinde boş veya hatalı bir sayfa görüntülenir.

---

## FONKSİYON DETAYLARI

### AdminUsersPage
**Ne yapar**: Kullanıcı yönetimi sayfasını oluşturur. Bu sayfa, DataTableKit'e göç edilmiş, istemci tarafında (CLIENT-mode) çalışan ve çift sekmeli (DUAL-TAB) bir arayüz sunar.

**Nasıl yapar**: Fonksiyon, sayfa yapısını tanımlar. İçerisinde bir başlık bölümü, yetkilendirme (auth) ve yönlendirme (redirect) kontrolü ile `Suspense` bileşenini barındırır. Sayfanın tüm veri, URL ve sekme state yönetimi, `useAdminTable` hook'unu kullanan `AdminUsersTableBody` bileşenine devredilmiştir. Bu hook, `useSearchParams`'ı tüketir; React 18 ile gelen Suspense ile sarılı kullanım (Kural 5 / K2) uygulanmıştır.

**Parametreler**:
Bu fonksiyon bir React fonksiyonel bileşenidir (`React.FC`) ve herhangi bir parametre almaz.

**Dönüş**: `React.FC` tipinde bir React bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::AdminUsersPage
- **params**: (parametre yok — React arrow component, `() => { ... }`)
- **ic_degiskenler**:
  - `{ user, loading }` — `useAuth()` hook'unun destructured sonucu; `user` oturumdaki mevcut kullanıcı objesi, `user` null ise çıkış sayfasına yönlendirme tetikler; `loading` auth durumunun henüz yüklenmekte olup olmadığını belirtir, true iken render engellenir
  - `{ role }` — `useRole()` hook'unun destructured sonucu; kullanıcının rol stringi (`'super_admin'`, `'admin'` veya diğer); `isAdmin` hesaplamasında kullanılır
  - `router` — `useRouter()` hook'unun返回值; Next.js navigasyon nesnesi; `useEffect` içinde `router.push()` ile `/admin/users` login sayfasına yönlendirme yapılır
  - `{ t }` — `useI18n()` hook'unun destructured sonucu; çeviri fonksiyonu; header içinde `t('admin.titles.users')` ve `t('admin.users.subtitle')` çağrılarıyla localized metin üretir
  - `isAdmin` — `useMemo` ile hesaplanan boolean; `!!role && (role === 'super_admin' || role === 'admin')` ifadesinden türetilir; `role` değiştiğinde yeniden hesaplanır; `AdminUsersTableBody` componentine prop olarak iletilir
- **Dönüş**: `JSX.Element` — `<div className="space-y-6 pb-20">` sarmalayan; `<header>` (başlık + alt başlık) ve `<Suspense>` sarmalı içinde `<AdminUsersTableBody>` içeren React node
- **Yan etkiler (useEffect)**: `loading === false` VE `user === null` ise `router.push(Routes.auth.login('/admin/users'))` çağrısıyla admin kullanıcılar sayfasına erişimi olmayan kullanıcıları login sayfasına yönlendirir

---

### [N2_NASIL] AST Pointer: src/views/admin/AdminUsersPage.tsx::useEffect callback (yönlendirme efekti)
- **params**: (parametre yok — useEffect callback)
- **ic_degiskenler**:
  - `loading` — closure'dan gelen auth yükleme durumu; `false` olduğunda kontrol tetiklenir
  - `user` — closure'dan gelen kullanıcı objesi; `null` olduğunda yönlendirme yapılır
  - `router` — closure'dan gelen Next.js router nesnesi; `router.push()` ile navigasyon tetiklenir
  - `Routes.auth.login('/admin/users')` — login sayfası URL'sini üreten fonksiyon çağrısı; parametre olarak yönlendirme sonrası geri dönüş URL'i verilir
- **Dönüş**: yok (useEffect side-effect callback)
- **Yan etkiler**: Koşul sağlanırsa `router.push(...)` çağrısı ile tarayıcı navigasyonu tetiklenir

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