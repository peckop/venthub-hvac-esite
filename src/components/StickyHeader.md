---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\StickyHeader.tsx
skeleton_hash: 85566afc0d785f1c
entity_hashes:
  overview: 6861442481f6e3f8
  style_tokens: 55949ae1f3201280
generated_at: 2026-06-07T11:01:42Z
---

## Genel Bakış
Bu modül, VentHub HVAC web platformunda sayfaların üst kısmında sabit bir başlık (sticky header) olarak çalışan React bileşenidir. Kullanıcı kaydırma (scroll) hareketine yanıt olarak otomatik olarak gizlenip gösterilir, kullanıcı giriş durumu ve alışveriş sepeti bilgilerini ilgili özel hook'lardan alarak üst çubukta durum bilgisini ve simgeleri görüntüler. Ayrıca arama çubuğu, mega menü ve kategori navigasyonu için gerekli olan açılır pencereleri (overlay'leri) kendi içinde barındırarak tüm üst menü işlevselliğini merkezi bir noktadan yönetir.

## Fonksiyon Grupları
Bu dosyada tanımlı herhangi bir fonksiyon veya metot bulunmamaktadır. Modül, bir React bileşen tanımı ile bir dizi hook çağrısından ve alt bileşen yerleşiminden oluşmaktadır.

---



---

## FONKSİYON DETAYLARI

---

## INTERFACES

### StickyHeaderProps
- `isScrolled: boolean`

---

## SABİTLER
- **SearchOverlay** (call) — `React.lazy(() => import('./SearchOverlay'))`
- **MegaMenu** (call) — `React.lazy(() => import('./MegaMenu'))`
- **CategoryHubOverlay** (call) — `React.lazy(() => import('./navigation/CategoryHubOverlay'))`
- **StickyHeader** (call) — `React.memo(function StickyHeader({ isScrolled }) {
  const { t, lang } = use...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: StickyHeader.tsx::loadRecentProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — localStorage'dan alınan ham JSON string verisi
- **Dönüş**: yok (yan etki: `setRecentProducts` ile state güncelleme)

### [N2_NASIL] AST Pointer: StickyHeader.tsx::useClickOutsideSetup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleClickOutside` — Dışarı tıklama olayını yöneten iç fonksiyon
- **Dönüş**: cleanup fonksiyonu (event listener kaldırma)

### [N3_NASIL] AST Pointer: StickyHeader.tsx::handleClickOutside
- **params**: (event: MouseEvent)
- **ic_degiskenler**: (sadece parametre kullanılıyor)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: StickyHeader.tsx::roleLabel
- **params**: (role: string)
- **ic_degiskenler**: (sadece parametre kullanılıyor)
- **Dönüş**: string (yerelleştirilmiş rol etiketi)

### [N5_NASIL] AST Pointer: StickyHeader.tsx::useScrollProgress
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ticking` — requestAnimationFrame tekrar çağrılmasını önleyen bayrak
  - `handleScroll` — Scroll olayını yöneten iç fonksiyon
- **Dönüş**: cleanup fonksiyonu (scroll event listener kaldırma)

### [N6_NASIL] AST Pointer: StickyHeader.tsx::handleScrollAnimationFrame
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `winScroll` — Dikey kaydırma miktarı
  - `height` — Sayfanın toplam kaydırılabilir yüksekliği
  - `scrolled` — Yüzde olarak kaydırma ilerlemesi
- **Dönüş**: yok (yan etki: `setScrollProgress` ile state güncelleme)

### [N7_NASIL] AST Pointer: StickyHeader.tsx::scrollCalculation
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `winScroll` — Dikey kaydırma miktarı
  - `height` — Sayfanın toplam kaydırılabilir yüksekliği
  - `scrolled` — Yüzde olarak kaydırma ilerlemesi
- **Dönüş**: yok (yan etki: `setScrollProgress` ile state güncelleme)

### [N8_NASIL] AST Pointer: StickyHeader.tsx::useGlobalKeydownSetup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleGlobalKeyDown` — Global tuş basma olayını yöneten iç fonksiyon
- **Dönüş**: cleanup fonksiyonu (event listener kaldırma)

### [N9_NASIL] AST Pointer: StickyHeader.tsx::handleGlobalKeyDown
- **params**: (event: KeyboardEvent)
- **ic_degiskenler**: (sadece parametre kullanılıyor)
- **Dönüş**: yok (yan etki: `openSearchOverlay` çağrısı)

### [N10_NASIL] AST Pointer: StickyHeader.tsx::handleCategoryClick
- **params**: (parametre yok)
- **ic_degiskenler**: (dışarıdan gelen `mode` parametresi kullanılıyor)
- **Dönüş**: yok (yan etki: `trackEvent` ve `openCategoryHub` çağrıları)

### [N11_NASIL] AST Pointer: StickyHeader.tsx::handleSignOut
- **params**: (parametre yok)
- **ic_degiskenler**: (dışarıdan gelen fonksiyonlar kullanılıyor)
- **Dönüş**: Promise<void> (async fonksiyon)

### [N12_NASIL] AST Pointer: StickyHeader.tsx::handleItemHover
- **params**: (itemId: string)
- **ic_degiskenler**: (sadece parametre kullanılıyor)
- **Dönüş**: yok (yan etki: `prefetchProductsPage` çağrısı)

### [N13_NASIL] AST Pointer: StickyHeader.tsx::renderUserMenu
- **params**: (parametre yok)
- **ic_degiskenler**: (dışarıdan gelen değişkenler kullanılıyor: user, isDevBypass, t, userMenuRef, finalUserDisplayName, finalHasPrivilegedRole, userRole, finalIsAdmin, closeUserMenu, handleSignOut, Routes)
- **Dönüş**: JSX elementi (React component)

---

## NODE ID STANDARD

  file: src\components\StickyHeader.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-white/95`, `border-b`, `border-slate-100`, `border-slate-200`, `from-primary-navy`, `hover:bg-air-blue/20`, `hover:bg-air-blue/25`, `hover:bg-red-50`, `hover:text-primary-navy`, `hover:text-red-600`, `text-left`, `text-slate-900`, `text-sm`, `text-steel-gray`
- **Layout:** `-right-2`, `-top-2`, `absolute`, `backdrop-blur-md`, `block`, `flex`, `flex-1`, `from-primary-navy`, `gap-1.5`, `gap-2.5`, `gap-3`, `h-16`, `h-5`, `h-8`, `hidden`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${isUserMenuOpen`, `:`, `border`, `duration-300`, `font-bold`, `font-medium`, `font-semibold`, `group`, `hover:-translate-y-0.5`, `md:px-4`, `mt-3`, `opacity-100`, `px-2`, `px-3`, `px-3.5`