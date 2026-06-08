---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLayout.tsx
skeleton_hash: 22caa40e7a23907b
entity_hashes:
  func:AdminLayout: f3d3a8a9833ef080
  overview: 877e95444b1fd98a
  style_tokens: dab87eff3332d515
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici (admin) arayüzünün temel düzen yapısını tanımlayan bir React bileşeni içerir. AdminLayout bileşeni, tüm admin sayfalarında ortak olarak kullanılan düzeni sağlayarak, her sayfaya ait içerikleri bu düzenin içerisinde sunar. Böylece, yönetici panelinde tutarlı ve merkezi bir görünüm elde edilir.

## Fonksiyon Grupları
### Ana Admin Düzen Bileşeni
Yönetici paneli tüm sayfaları için ortak ana düzen yapısını oluşturan tek sorumlu grup, içerik olarak iletilen alt sayfa bileşenlerini bu ortak düzenin içine yerleştirerek çalışır.
- AdminLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC yönetici panelinin ortak düzen (layout) yapısını sağlayan React bileşenidir.

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa veya `null`/`undefined` değer alırsa, düzen bileşeni içeriği boş olarak render edilir.

[Aksiyom 2]: Eğer `AdminLayout` bileşeni, admin paneli dışı bir sayfada kullanılmak üzere çağrılırsa, bileşen kendi başına yetkilendirme kontrolü yapmadığından erişim kısıtlaması uygulanmaz.

---

## FONKSİYON DETAYLARI

### AdminLayout
**Ne yapar**: VentHub HVAC projesinin admin paneli için tüm admin sayfalarında ortak olarak kullanılan temel düzen (layout) bileşenidir. Admin arayüzünün paylaşılan iskeletini oluşturur, kendisine iletilen sayfaya özel içerikleri bu düzenin içerisinde render ederek tüm admin sayfaları için tutarlı bir görünüm ve kullanıcı deneyimi sunar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak çalışır, kendisine prop olarak iletilen çocuk içeriklerini kendi sabit düzen yapısının içerisine yerleştirir. Tüm admin rotaları altında değişmeyen ortak arayüz öğelerini kendi bünyesinde barındırarak her admin sayfasında bu öğelerin ayrı ayrı tanımlanmasını gereksiz kılar, kod tekrarını önler.
**Parametreler**:
- name: children, type: React.ReactNode | opsiyonel — AdminLayout tarafından sağlanan ortak düzenin içerisine yerleştirilecek olan, her admin sayfasına özel React tarafından işlenebilen her türlü içerik (bileşen, metin, DOM elementleri vb.)
**Dönüş**: React tarafından DOM'a eklenmeye uygun bir JSX elementi döndürür. Bu dönen değer, admin paneli için tasarlanmış tüm ortak düzen öğelerini ve kendisine iletilen children prop'undaki sayfaya özel içeriği bir arada barındırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::AdminLayout
- **params**: `children` — React child component'ler, layout içinde render edilen sayfa içeriği
- **ic_degiskenler**:
  - `sidebarOpen` — boolean state, sidebar'ın açık/kapalı durumunu tutar
  - `setSidebarOpen` — sidebarOpen state'ini güncelleyen setter fonksiyonu
  - `pathname` — usePathname() hook'undan gelen mevcut URL yolu, aktif menü vurgulaması ve erişim kontrolünde kullanılır
  - `user` — useAuth() hook'undan gelen kimlik doğrulanmış kullanıcı nesnesi, email fallback ve avatar initial için kullanılır
  - `authLoading` — useAuth() hook'undan gelen yükleme durumu, useLoading'den yeniden adlandırılmış
  - `role` — useRole() hook'undan gelen kullanıcının rol bilgisi, erişim kontrolünde kullanılır
  - `canAccess` — useRole() hook'undan gelen fonksiyon, verilen path için rol tabanlı erişim kontrolü yapar
  - `roleLoading` — useRole() hook'undan gelen yükleme durumu
  - `router` — useRouter() hook'undan gelen Next.js router, yönlendirme işlemleri için
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, menü etiketlerinin uluslararasılaştırılması için
  - `loading` — authLoading veya roleLoading true ise true olan birleşik yükleme durumu
  - `isEmailAdmin` — isAdminByEmail(user.email) çağrısının boolean sonucu, email tabanlı admin bypass kontrolü
  - `navGroups` — menü yapısını tanımlayan array, her biri label ve items içeren grup nesneleri
- **Dönüş**: React JSX (admin layout UI — header, sidebar, ana içerik area'sı, CommandPalette)

---

## NODE ID STANDARD

  file: src\views\admin\AdminLayout.tsx
  function: src\views\admin\AdminLayout.tsx::AdminLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminLayout

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400/10`, `bg-gradient-to-br`, `bg-primary-navy/20`, `bg-secondary-blue/10`, `bg-surface-deep`, `bg-surface-deep/60`, `bg-white/2`, `bg-white/5`, `border-b`, `border-b-2`, `border-cyan-400`, `border-cyan-400/20`, `border-r`, `border-t`, `border-white/10`
- **Layout:** `-left-10%`, `-right-10%`, `-top-10%`, `absolute`, `backdrop-blur-xl`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-none`, `from-cyan-500/20`, `gap-3`, `gap-4`, `h-1/2`
- **Varyant/Responsive:** `:`, `active:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${sidebarOpen`, `-translate-x-full`, `:`, `===`, `active:scale-95`, `animate-spin`, `blur-100`, `blur-120`, `border`, `duration-300`, `ease-in-out`, `font-black`, `font-bold`, `font-sans`