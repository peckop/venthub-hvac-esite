---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\views\admin\AdminLayout.tsx
skeleton_hash: 55da8cf5b3383522
entity_hashes:
  func:AdminLayout: bbd2f949c1664063
  overview: 6b294d3e492cf313
  style_tokens: 70db08602c5d37ec
generated_at: 2026-08-15T15:11:14Z
---

## Genel Bakış
VentHub projesinin yönetici paneli için temel düzen yapısını sağlayan React bileşenidir. Admin sayfalarının ortak iskeletini oluşturarak, her bir sayfa içeriğini tutarlı bir arayüz çerçevesinde sunar. Bu sayede yönetici panelinin tüm sayfalarında birlik ve düzen korunur.

## Fonksiyon Grupları
### Admin Paneli Düzen Bileşeni
Yönetici panelinin tüm sayfalarında paylaşılan ortak düzen yapısını tanımlar. Çocuk bileşenleri kendi içerisine yerleştirerek sayfalara özgü içerikleri sabit bir iskelet içinde render eder.
- AdminLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin panelinin ortak düzenini sağlamakla tek başına sorumludur; yetkilendirme veya rota yönetimi gibi konulara girmez.

**[Aksiyom 1]:** `children` prop'u sağlanmazsa bileşen, içeriği boş olarak güvenli bir şekilde render eder.

**[Aksiyom 2]:** Bileşen, admin rotaları dışında kullanıldığında kendi başına erişim kontrolü uygulamaz; bu sorumluluk üst katmandadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin panelinin ortak düzen yapısını sağlayan bir React layout bileşenidir.

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa veya `undefined`/`null` gelirse, AdminLayout bileşeni boş bir düzen (header/sidebar alanları görünür ancak içerik bölgesi boş) render eder.

[Aksiyom 2]: Eğer `defaultNavCollapsed` prop'u传递edilmezse, sidebar navigasyonu varsayılan olarak geniş (expanded) durumda (`false`) açılır.

[Aksiyom 3]: Eğer `NAV_COOKIE_MAX_AGE` sabiti hesaplanamazsa veya geçersiz bir değer üretirse, sidebar durumu cookie'de saklanamaz ve her sayfa yüklenmesinde `defaultNavCollapsed` değerine geri dönülür.

[Aksiyom 4]: Eğer cookie tabanlı sidebar durumu okunamazsa (örn: cookie mevcut değilse), `defaultNavCollapsed` parametresi ile belirlenen başlangıç durumu kullanılır.

---

## FONKSİYON DETAYLARI

### AdminLayout
**Ne yapar**: AdminLayout, yönetici panelinin ana iskelet yapısını oluşturan bir React fonksiyonel bileşenidir. Children prop'u aracılığıyla içeriğin render edilmesini sağlar ve navigasyon menüsünün başlangıç durumunu yapılandırır.

**Nasıl yapar**: Bileşen, React.FC generic tipini kullanarak AdminLayoutProps tipindeki prop'ları kabul eder. `children` prop'u ile alt bileşenleri render ederken, `defaultNavCollapsed` prop'u ile sidebar navigasyonunun başlangıçta açılık/kapalı durumunu belirler. Varsayılan olarak navigasyon menüsü geniş (açık) durumda başlar.

**Parametreler**:
- children: React.ReactNode — AdminLayout bileşeninin içinde render edilecek alt React bileşenleri ve içerik elemanları. Sayfa içeriği buraya yerleştirilir.
- defaultNavCollapsed: boolean — Varsayılan değeri `false` olan bu prop, admin paneli sidebar navigasyon menüsünün başlangıç durumunu belirler. `true` değeri verildiğinde menü başlangıçta dar (collapsed) modda açılır.

**Dönüş**: React.FC<AdminLayoutProps> — AdminLayoutProps arayüzünü tanımlayan prop'ları alan bir React fonksiyonel bileşeni döndürür. Bu bileşen, admin panelinin layout yapısını (header, sidebar, main content area) sarmalayan bir wrapper bileşendir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AccessDenied::AccessDenied
- import: ../../components/admin/AdminRealtimeNotifications::AdminRealtimeNotifications
- import: ../../components/admin/CommandPalette::CommandPalette
- import: ../../components/admin/overlay/ConfirmProvider::ConfirmProvider
- import: ../../components/admin/shell/AdminSidebar::AdminMobileNav
- import: ../../components/admin/shell/AdminSidebar::AdminSidebar
- import: ../../components/admin/shell/navCookie::navCookieName
- import: ../../config/admin-resources::buildBreadcrumbTrail
- import: ../../config/admin::isAdminByEmail
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../hooks/useRole::useRole
- import: ../../hooks/useTenant::useTenant
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
- import: lucide-react::ChevronRight
- import: lucide-react::Menu
- import: lucide-react::PanelLeftClose
- import: lucide-react::PanelLeftOpen
- import: next/link::Link
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: next::type { Route }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::Toaster

---

## INTERFACES

### AdminLayoutProps
- `children?: React.ReactNode`
- `defaultNavCollapsed?: boolean`

---

## SABİTLER
- **NAV_COOKIE_MAX_AGE** (binary_expression) — `60 * 60 * 24 * 7`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-wt-admin\src\views\admin\AdminLayout.tsx::AdminLayout
- **params**: (children, defaultNavCollapsed = false)
- **ic_degiskenler**:
  - `pathname` — Mevcut URL yolunu döndüren usePathname hook'unun değeri; breadcrumb oluşturma, yetkilendirme kontrolü ve sidebar/mobil nav'a iletim için kullanılır
  - `user` — useAuth() hook'undan dönen kullanıcı nesnesi; kimlik doğrulama durumu, email ve user_metadata alanlarını içerir
  - `authLoading` — useAuth() hook'undan dönen loading durumu; authentication sürecinin devam edip etmediğini belirtir
  - `canAccess` — useRole() hook'undan dönen erişim kontrol fonksiyonu; pathname tabanlı rol bazlı erişim izni verir
  - `roleLoading` — useRole() hook'undan dönen loading durumu; rol kontrol sürecinin devam edip etmediğini belirtir
  - `router` — useRouter() hook'undan dönen Next.js router nesnesi; programlı navigasyon (router.replace) için kullanılır
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu; labelKey'leri yerelleştirilmiş metinlere dönüştürür
  - `tenant` — useTenant() hook'undan dönen tenant nesnesi; tenant.id çerez isimlendirmesinde kullanılır
  - `localizedRoutes` — useLocalizedRoutes() hook'undan dönen yerelleştirilmiş rota üretici fonksiyonları nesnesi
  - `siteHomeHref` — localizedRoutes.home() çağrısından elde edilen ana sayfa URL'i; "Siteye dön" linkinin href'i
  - `navCollapsed` — useState ile yönetilen boolean değer; masaüstü sidebar'ın daraltılmış/ Genişletilmiş durumunu tutar
  - `setNavCollapsed` — navCollapsed durumunu güncelleyen setter fonksiyonu; toggleNav callback'inde çağrılır
  - `mobileNavOpen` — useState ile yönetilen boolean değer; mobil navigasyon panelinin açık/kapalı durumunu tutar
  - `setMobileNavOpen` — mobileNavOpen durumunu güncelleyen setter fonksiyonu; mobil tetikleyici butona ve AdminMobileNav onOpenChange'e bağlanır
  - `loading` — authLoading veya roleLoading herhangi biri true ise true dönen derived boolean; yükleme ekranının gösterilip gösterilmeyeceğini belirler
  - `isEmailAdmin` — user.email varsa isAdminByEmail() ile hesaplanan boolean; email tabanlı admin kontrolü yapar
  - `breadcrumb` — React.useMemo ile pathname'den üretilen breadcrumb trail dizisi; her item key, labelKey ve route alanlarını içerir
- **Dönüş**: ConfirmProvider wrapper içinde JSX — sticky header, desktop sidebar, main content area, mobile nav, CommandPalette ve Toaster bileşenlerini içeren tam admin layout yapısı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-wt-admin\src\views\admin\AdminLayout.tsx::useEffect callback
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: loading bitip user yoksa router.replace('/' as Route) çağrısı ile ana sayfaya yönlendirme)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-wt-admin\src\views\admin\AdminLayout.tsx::toggleNav
- **params**: ()
- **ic_degiskenler**:
  - `prev` — setNavCollapsed'ın callback parametresi; bir önceki navCollapsed durumu
  - `next` — prev'in tersi olarak hesaplanan boolean; yeni nav durumu
- **Dönüş**: next boolean değeri (setNavCollapsed callback'inin dönüşü); ayrıca document.cookie ile NAV_COOKIE_MAX_AGE ve navCookieName(tenant.id) kullanarak tercihi çereze yazar

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-wt-admin\src\views\admin\AdminLayout.tsx::breadcrumb.map callback
- **params**: (item, index)
- **ic_degiskenler**:
  - `item` — breadcrumb dizisinin mevcut elemanı; key, labelKey ve route alanlarını içerir
  - `item.key` — JSX key olarak kullanılan benzersiz tanımlayıcı
  - `item.labelKey` — t() fonksiyonuna geçirilen çeviri anahtarı
  - `item.route` — Link component'inin href'ine atanan rota değeri (Route tipine cast edilmiş)
  - `index` — döngü indeksi; mevcut elemanın dizideki pozisyonu
  - `isLast` — index === breadcrumb.length - 1 kontrolü ile hesaplanan boolean; son eleman olup olmadığını belirler
- **Dönüş**: JSX li elementi — ChevronRight ikonu ve koşullu olarak span (son eleman) veya Link (diğer elemanlar) içeren breadcrumb öğesi

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
- **Renkler:** `bg-surface-deep`, `bg-surface-deep/95`, `bg-white/5`, `border-b`, `border-b-2`, `border-cyan-400`, `border-t`, `border-white/10`, `focus:bg-cyan-400`, `focus:text-sm`, `focus:text-surface-deep`, `hover:bg-white/10`, `hover:text-white`, `text-base`, `text-cyan-300`
- **Layout:** `backdrop-blur`, `flex`, `flex-1`, `focus:fixed`, `focus:left-4`, `focus:top-4`, `focus:z-toast`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `h-8`, `h-9`, `h-admin-header`
- **Varyant/Responsive:** `focus-visible:`, `focus:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/60`, `focus:font-medium`, `focus:not-sr-only`, `focus:px-4`, `focus:py-2`, `focus:rounded-admin-sm`, `font-medium`, `font-sans`, `font-semibold`, `md:px-4`, `md:px-6`