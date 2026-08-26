---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\app\admin\layout.tsx
skeleton_hash: 2be9462bf62a55e3
entity_hashes:
  func:Layout: ba5a2fa47c4a3578
  overview: 2c0f6861ff270d4c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:23:24Z
---

## Genel Bakış

Bu modül, admin panelinin kök düzen (layout) bileşenini tanımlar. Next.js'in yerleşik layout mekanizması aracılığıyla çalışır ve admin altındaki tüm sayfaların ortak yapısını belirler. Bileşen, kendisine aktarılan alt bileşenleri (`children`) sararak admin sayfalarına paylaşılan bir çerçeve sağlar.

## Fonksiyon Grupları

### Admin Düzen Bileşeni

Admin bölümünün üst düzey düzen yapısını oluşturur. Bu bileşen, admin altındaki tüm sayfalar tarafından otomatik olarak sarılır ve sayfalara ortak bir konteyner veya navigasyon yapısı kazandırır.

- Layout

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, gövdeden türetilen özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Layout
**Ne yapar**: Admin panelinin kök düzen (layout) bileşenini oluşturur. Sunucu tarafında tenant yapılandırmasını, navigasyon collapse tercihini ve tema ayarını okuyarak bu değerleri alt bileşenlere sağlar. Bu fonksiyon, Next.js'in sunucu bileşeni (server component) olarak çalışır ve çocukların `TenantProvider` ile `LayoutComponent` tarafından sarmalanmasını sağlar.

**Nasıl yapar**: Fonksiyon öncelikle `getTenantConfig()` ile geçerli kiracı yapılandırmasını asenkron olarak alır. Ardından `cookies()` fonksiyonu ile sunucu tarafında çerez deposu okunur — bu okumanın sunucu tarafında yapılması kritiktir; aksi takdirde istemci tarafında çözümlenirse koyu tema seçen kullanıcı her yüklemede bir kare beyaz ekran görürdü. Navigasyon collapse durumu, `navCookieName(tenantConfig.id)` ile elde edilen çerez adından okunur ve `NAV_COLLAPSED_VALUE` değeriyle karşılaştırılarak boolean'a dönüştürülür. Tema bilgisi de aynı şekilde sunucu tarafında okunur; `parseAdminTheme` fonksiyonu bozuk veya eksik çerezleri sessizce varsayılan değere (AÇIK) düşürür. Son olarak JSX döndürülür: `TenantProvider` ile kiracı yapılandırması sağlanır, `LayoutComponent` bileşenine varsayılan navigasyon collapse durumu, tema tercihi ve çözümlenmiş tema değeri prop olarak geçilir, çocuklar bu yapının içine yerleştirilir.

**Parametreler**:
- children: `{ children: React.ReactNode }` — Bu layout bileşeninin içine yerleştirilecek alt bileşenler. Next.js'in layout yapısı gereği, bu parametre alt rotaların veya sayfaların içeriğini temsil eder.

**Dönüş**: JSX.Element — Fonksiyon, `TenantProvider` ve `LayoutComponent` ile sarmalanmış bir JSX ağacı döndürür. Kesin TypeScript dönüş tipi kaynakta belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/shell/navCookie::NAV_COLLAPSED_VALUE
- import: ../../components/admin/shell/navCookie::navCookieName
- import: ../../components/admin/shell/themeCookie::adminThemeCookieName
- import: ../../components/admin/shell/themeCookie::parseAdminTheme
- import: ../../hooks/useTenant::TenantProvider
- import: ../../utils/tenantServer::getTenantConfig
- import: ../../views/admin/AdminLayout::LayoutComponent
- import: next/headers::cookies

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/layout.tsx::Layout
- **params**:
  - `children` — `React.ReactNode` tipinde, alt bileşenleri temsil eder
- **ic_degiskenler**:
  - `tenantConfig` — `await getTenantConfig()` çağrısıyla elde edilen tenant yapılandırması nesnesi; `tenantConfig.id` alanına erişilerek çerez adları oluşturulur ve `TenantProvider`'a `value` prop'u olarak geçilir
  - `cookieStore` — `await cookies()` çağrısıyla elde edilen Next.js sunucu tarafı çerez deposu; `.get()` metoduyla belirli çerezler okunur
  - `navCollapsed` — `cookieStore.get(navCookieName(tenantConfig.id))?.value === NAV_COLLAPSED_VALUE` ifadesiyle hesaplanan boolean değer; sol navigasyon panelinin varsayılan olarak daraltılıp daraltılmadığını belirler
  - `theme` — `parseAdminTheme(cookieStore.get(adminThemeCookieName(tenantConfig.id))?.value)` çağrısıyla elde edilen tema nesnesi; `.preference` ve `.resolved` alt alanlarına erişilir
- **Dönüş**: JSX — `TenantProvider` ile sarılmış `LayoutComponent` bileşeni; `defaultNavCollapsed`, `defaultThemePreference`, `defaultThemeResolved` prop'ları ve `children` geçilir

---

## NODE ID STANDARD

  file: layout.tsx
  function: layout.tsx::Layout

---

## DISA AKTARILANLAR (EXPORTS)
  export: Layout

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