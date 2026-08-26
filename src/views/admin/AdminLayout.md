---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\AdminLayout.tsx
skeleton_hash: 1808d3b25055cd3a
entity_hashes:
  func:AdminLayout: 3672368aae604677
  overview: 17bc6946654c7feb
  style_tokens: 56cdd112a4e87a83
generated_at: 2026-08-25T07:29:55Z
---

## Genel Bakış
AdminLayout, admin panelinin ana sayfa düzenini sağlayan bir React bileşenidir. Bileşen, alt bileşenleri (children) sarmalayarak yönetici arayüzüne çerçeve ve yapı kazandırır. Navigasyon durumu ve tema tercihi gibi ayarlar varsayılan değerlerle başlatılabilir.

## Fonksiyon Grupları

### Ana Düzen Bileşeni
Admin panelinin genel sayfa yapısını oluşturur ve alt bileşenleri bu yapı içinde konumlandırır. Navigasyon panelinin daraltılmış durumu ve tema tercihi gibi yönetici arayüzü ayarlarını varsayılan değerlerle alır.

- AdminLayout

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `defaultNavCollapsed` parametresi sağlanmazsa, navigasyon varsayılan olarak açık (collapsed değil) durumda başlatılır.

[Aksiyom 2]: Eğer `defaultThemePreference` parametresi sağlanmazsa, tema tercihi `ADMIN` değeriyle başlatılır.

[Aksiyom 3]: Eğer `NAV_COOKIE_MAX_AGE` sabiti tanımlı değilse, navigasyon durumu (collapsed/open) için çerez süresi bilinmiyor — sabitin değeri bir binary expression olarak tanımlanmış ancak kesin değer kaynakta belirtilmemiştir.

---

## FONKSİYON DETAYLARI

### AdminLayout
**Ne yapar**: Admin paneli için ana düzen (layout) bileşenidir. Bu bileşen, admin arayüzünün genel yapısını oluşturur; navigasyon paneli, tema ayarları ve içerik alanı gibi bölümleri bir araya getirerek alt bileşenlere (`children`) yapılandırılmış bir görünüm sağlar.

**Nasıl yapar**: Bileşen, aldığı `defaultNavCollapsed` ve `defaultThemePreference` parametrelerini kullanarak navigasyon panelinin varsayılan daraltılmış durumunu ve tema tercihini belirler. `children` prop'u aracılığıyla alt bileşenleri render eder. `ADMIN` sabiti, varsayılan tema tercihi olarak kullanılır. Bileşen, `AdminLayoutProps` arayüzüne uygun şekilde tip tanımlaması yapılmış bir React fonksiyon bileşeni (`React.FC`) olarak tanımlanmıştır.

**Parametreler**:
- `children`: `React.ReactNode` — Admin layout içinde gösterilecek alt bileşenlerdir. Admin sayfasının asıl içeriğini temsil eder.
- `defaultNavCollapsed`: `boolean` — Navigasyon panelinin varsayılan olarak daraltılmış (collapsed) olup olmayacağını belirler. Varsayılan değeri `false`'dur; yani panel başlangıçta açık konumdadır.
- `defaultThemePreference`: `ADMIN` — Admin panelinin varsayılan tema tercihini belirler. Varsayılan değeri `ADMIN` sabitidir.

**Dönüş**: `React.FC<AdminLayoutProps>` — `AdminLayoutProps` arayüzünde tanımlı propları alan bir React fonksiyon bileşeni döndürür. Bu bileşen, admin düzeninin tamamını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AccessDenied::AccessDenied
- import: ../../components/admin/AdminRealtimeNotifications::AdminRealtimeNotifications
- import: ../../components/admin/CommandPalette::CommandPalette
- import: ../../components/admin/overlay/ConfirmProvider::ConfirmProvider
- import: ../../components/admin/shell/AdminSidebar::AdminMobileNav
- import: ../../components/admin/shell/AdminSidebar::AdminSidebar
- import: ../../components/admin/shell/AdminThemeToggle::AdminThemeToggle
- import: ../../components/admin/shell/navCookie::navCookieName
- import: ../../components/admin/shell/useAdminThemeBodyScope::useAdminThemeBodyScope
- import: ../../config/admin-resources::buildBreadcrumbTrail
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../hooks/useRole::useRole
- import: ../../hooks/useTenant::useTenant
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/case::localeUpper
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
- `defaultThemePreference?: AdminThemePreference`
- `defaultThemeResolved?: AdminThemeResolved`

---

## SABİTLER
- **NAV_COOKIE_MAX_AGE** (binary_expression) — `60 * 60 * 24 * 7`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — useEffect guard)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` — yükleme durumunu gösteren boolean; true ise fonksiyon erken döner
  - `user` — oturum açmış kullanıcı nesnesi; yoksa (falsy) ana sayfaya yönlendirme yapılır
  - `router` — Next.js useRouter sonucu; `replace` ile `'/'` rotasına yönlendirme yapar
- **Dönüş**: yok (void)

### [N2_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — nav toggle handler)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setNavCollapsed` — React state setter; boolean değer alır, yan panelin açık/kapalı durumunu günceller
  - `prev` — setter callback parametresi; mevcut navCollapsed boolean değeri
  - `next` — `!prev` ile hesaplanan ters boolean; yeni navCollapsed durumu
  - `document` — tarayıcı document nesnesi; typeof kontrolü ile SSR güvenliği sağlanır
  - `navCookieName` — fonksiyon; `tenant.id` parametresiyle cookie adı üretir
  - `tenant` — kiracı nesnesi; `tenant.id` ile cookie adı oluşturulur
  - `NAV_COOKIE_MAX_AGE` — sabit; cookie'nin yaşam süresi (saniye)
- **Dönüş**: yok (void)

### [N3_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — nav setter callback)
- **params**:
  - `prev` — mevcut boolean durum (navCollapsed)
- **ic_degiskenler**:
  - `next` — `!prev` ile hesaplanan ters boolean değer
  - `document` — typeof kontrolü ile SSR güvenliği sağlanır; cookie yazımı için kullanılır
  - `navCookieName` — fonksiyon; `tenant.id` ile cookie adı döndürür
  - `tenant` — kiracı nesnesi; `tenant.id` erişimi yapılır
  - `NAV_COOKIE_MAX_AGE` — sabit; cookie max-age değeri
- **Dönüş**: boolean (`next` — yeni navCollapsed durumu)

### [N4_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — tema useEffect)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `media` — `window.matchMedia('(prefers-color-scheme: dark)')` sonucu; sistem tema tercihini dinler
  - `apply` — iç fonksiyon; tema çözümlemesi yapar, state günceller, cookie yazar
  - `themePreference` — `'system'` | `'dark'` | `'light'`; kullanıcının tema tercihi
  - `setThemeResolved` — React state setter; çözümlenmiş tema değerini (`AdminThemeResolved`) günceller
  - `adminThemeCookieName` — fonksiyon; `tenant.id` ile tema cookie adı üretir
  - `tenant` — kiracı nesnesi; `tenant.id` erişimi yapılır
  - `serializeAdminTheme` — fonksiyon; `themePreference` ve `resolved` değerlerini cookie string'ine dönüştürür
  - `ADMIN_THEME_COOKIE_MAX_AGE` — sabit; tema cookie'sinin yaşam süresi
- **Dönüş**: cleanup function (`() => media.removeEventListener('change', apply)`) veya undefined (themePreference `'system'` değilse)

### [N5_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — apply tema fonksiyonu)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `resolved` — `AdminThemeResolved` tipinde; themePreference `'system'` ise `media.matches`'e göre `'dark'`/`'light'`, aksi halde themePreference'ın kendisi
  - `themePreference` — tema tercihi; `'system'` kontrolü yapılır
  - `media` — `window.matchMedia` sonucu; `.matches` ile karanlık mod durumu okunur
  - `setThemeResolved` — React state setter; `resolved` değeri ile güncellenir
  - `document` — cookie yazımı için kullanılır
  - `adminThemeCookieName` — fonksiyon; `tenant.id` ile tema cookie adı üretir
  - `tenant` — kiracı nesnesi; `tenant.id` erişimi yapılır
  - `serializeAdminTheme` — fonksiyon; `themePreference` ve `resolved` parametreleriyle cookie değeri üretir
  - `ADMIN_THEME_COOKIE_MAX_AGE` — sabit; cookie max-age değeri
- **Dönüş**: yok (void)

### [N6_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::(anonim — breadcrumb map callback)
- **params**:
  - `item` — breadcrumb öğesi; `.key`, `.labelKey`, `.route` alanlarına erişilir
  - `index` — mevcut öğenin dizindeki sırası (number)
- **ic_degiskenler**:
  - `isLast` — `index === breadcrumb.length - 1` sonucu boolean; son öğe olup olmadığını belirler
  - `breadcrumb` — breadcrumb dizisi; `.length` ile son indeks hesaplanır
  - `t` — çeviri fonksiyonu; `item.labelKey` parametresiyle yerelleştirilmiş metin döndürür
  - `ChevronRight` — lucide-react ikon bileşeni; ayırıcı olarak kullanılır (size=14)
  - `Link` — Next.js Link bileşeni; son öğe değilse `item.route` rotasına bağlantı oluşturur
- **Dönüş**: JSX element (`<li>` — breadcrumb öğesini render eder)

---

## NODE ID STANDARD

  file: AdminLayout.tsx
  function: AdminLayout.tsx::AdminLayout

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
- **Renkler:** `bg-admin-bg`, `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-accent`, `border-admin-border`, `border-b`, `border-b-2`, `border-t`, `focus-visible:bg-admin-accent`, `focus-visible:text-admin-accent-fg`, `focus-visible:text-sm`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-fg`, `text-admin-fg-muted`
- **Layout:** `flex`, `flex-1`, `focus-visible:fixed`, `focus-visible:left-4`, `focus-visible:top-4`, `focus-visible:z-toast`, `gap-1`, `gap-2`, `gap-3`, `gap-4`, `h-10`, `h-8`, `h-9`, `h-admin-header`, `hidden`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `focus-visible:font-medium`, `focus-visible:not-sr-only`, `focus-visible:outline-none`, `focus-visible:px-4`, `focus-visible:py-2`, `focus-visible:ring-2`, `focus-visible:ring-admin-ring`, `focus-visible:rounded-admin-sm`, `font-medium`, `font-sans`, `font-semibold`, `md:px-4`, `md:px-6`