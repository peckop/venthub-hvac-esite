---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\StickyHeader.tsx
skeleton_hash: 01238508f4af3cc3
entity_hashes:
  overview: 66f525d6ccd8cb73
  style_tokens: 55949ae1f3201280
generated_at: 2026-05-28T22:37:16Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformundaki sayfalarda sabit bir üst menü (sticky header) olarak görev yapan ana React bileşenidir. Sayfa kaydırma hareketine göre otomatik gizleme/gösterme davranışı, kullanıcı kimlik doğrulama durumu ve alışveriş sepeti bilgisi gibi temel durumları ilgili özel hook'lardan alarak yönetir. Arama, mega menü ve kategori navigasyonu için gerekli açılır pencereleri (overlay) kendi içinde render ederek tüm üst başlık işlevselliğini merkezi olarak sunar.

## Fonksiyon Grupları
Bu dosyada herhangi bir fonksiyon veya metot tanımlı değildir. Kod yapısı, bir React bileşen tanımı ve bir dizi hook çağrısı ile alt bileşen yerleşiminden oluşmaktadır.

---

## AXIOMS – Mimari Varsayım

Bu modül için fonksiyon gövdesi verilmemiş olup, yalnızca modül sabitlerinden (import edilen bileşenler) üretilen temel bağımlılık aksiyomları tanımlanmıştır.

[Aksiyom 1]: Eğer `SearchOverlay` bileşeni modülde tanımlı veya import edilmiş değilse, StickyHeader bileşeni derleme zamanında hata verir.

[Aksiyom 2]: Eğer `MegaMenu` bileşeni modülde tanımlı veya import edilmiş değilse, StickyHeader bileşeni derleme zamanında hata verir.

[Aksiyom 3]: Eğer `CategoryHubOverlay` bileşeni modülde tanımlı veya import edilmiş değilse, StickyHeader bileşeni derleme zamanında hata verir.

---

**Not:** Bu modül için fonksiyon imzası, parametre, default değer veya çalış zamanı koşulları içeren bir gövde verilmemiştir. Dolayısıyla; çalış zamanı (runtime) koşulları, hook bağımlılıkları, scroll davranışı eşik değerleri veya props zorunlulukları gibi aksiyomlar **fonksiyon gövdesinden üretilememiştir** ve uydurulmamıştır. Söz konusu detaylar fonksiyon gövdesi temin edildiğinde çıkarılabilir.

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

### [N1_NASIL] AST Pointer: src/components/StickyHeader.tsx::loadRecentProducts
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem('recentProducts')` sonucunu tutan string, parse edilmemis haliyle
- **Dönüş**: yok (yan etki: `setRecentProducts` state güncelleme)

### [N2_NASIL] AST Pointer: src/components/StickyHeader.tsx::useEffectForClickOutside
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleClickOutside` — Mousedown olayinda menu disinda tiklanip tiklanmadigini kontrol eden fonksiyon
- **Dönüş**: cleanup fonksiyonu (event listener kaldırma)

### [N3_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleClickOutside
- **params**: `(event: MouseEvent)`
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `closeUserMenu` çağrısı)

### [N4_NASIL] AST Pointer: src/components/StickyHeader.tsx::roleLabel
- **params**: `(role: string)`
- **ic_degiskenler**: (yok, sadece parametre ve switch)
- **Dönüş**: `string` — rol için yerelleştirilmiş etiket

### [N5_NASIL] AST Pointer: src/components/StickyHeader.tsx::useEffectForScrollProgress
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ticking` — requestAnimationFrame kuyruğunu kontrol eden bayrak
  - `handleScroll` — Kaydırma olayını işleyen ve `%` hesaplayan fonksiyon
- **Dönüş**: cleanup fonksiyonu (scroll listener kaldırma)

### [N6_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleScrollRequestFrame
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `winScroll` — `document.documentElement.scrollTop` ile elde edilen mevcut dikey kaydırma miktarı
  - `height` — Kaydırılabilir toplam sayfa yüksekliği (`scrollHeight - clientHeight`)
  - `scrolled` — Kaydırma ilerleme yüzdesi (`(winScroll / height) * 100`)
- **Dönüş**: yok (yan etki: `setScrollProgress` state güncelleme)

### [N7_NASIL] AST Pointer: src/components/StickyHeader.tsx::calculateScrolled
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `winScroll` — Mevcut dikey kaydırma miktarı
  - `height` — Toplam kaydırılabilir yükseklik
  - `scrolled` — Hesaplanmış yüzdelik ilerleme
- **Dönüş**: yok (yan etki: `setScrollProgress` çağrısı)

### [N8_NASIL] AST Pointer: src/components/StickyHeader.tsx::useEffectForGlobalSearch
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleGlobalKeyDown` — Klavye olayını işleyen ve arama overlay'ını açan fonksiyon
- **Dönüş**: cleanup fonksiyonu (keydown listener kaldırma)

### [N9_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleGlobalKeyDown
- **params**: `(event: KeyboardEvent)`
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `openSearchOverlay` çağrısı)

### [N10_NASIL] AST Pointer: src/components/StickyHeader.tsx::openCategories
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etkiler: `trackEvent`, `openCategoryHub` çağrıları)

### [N11_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleSignOut
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void> (async fonksiyon)

### [N12_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleItemHover
- **params**: `(itemId: string)`
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: `prefetchProductsPage` koşullu çağrısı)

### [N13_NASIL] AST Pointer: src/components/StickyHeader.tsx::renderUserSection
- **params**: (parametre yok)
- **ic_degiskenler**: (yok, JSX döndürür)
- **Dönüş**: `ReactElement` — Kullanıcı oturum durumuna göre login/register butonları veya kullanıcı menüsü JSX'i

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