---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\layout\MainLayout.tsx
skeleton_hash: 8d5c103c400f9b19
entity_hashes:
  func:MainLayout: 7607152681e8475f
  overview: b51c14c938afce8b
  style_tokens: 57ab2fa7fdc3ea42
generated_at: 2026-08-27T13:22:12Z
---

## Genel Bakış

Bu modül, uygulamanın tüm sayfalarına tutarlı bir görünüm kazandıran ana React layout bileşenini içerir. URL yoluna bağlı olarak yönetim paneli veya genel site düzeni sunarak sayfa içeriklerini ortak bir iskelet içinde sarar. Bildirim, sepet bildirimi, WhatsApp iletişim butonu gibi küresel arayüz elemanlarını merkezi olarak yönetir.

## Fonksiyon Grupları

### Sayfa Düzeni ve Yerleşim

Uygulamanın temel görsel yapısını ve sayfa yerleşimini belirleyen ana layout bileşenini içerir. Rota bazlı olarak farklı düzen varyantlarını (yönetim paneli veya genel site) render ederek `children` içeriğini sarar ve üst bilgi çubuğu, alt bilgi çubuğu, geri yukarı butonu, WhatsApp butonu, dil seçici, toast bildirimleri ve ödeme izleyicisi gibi global bileşenleri yönetir.

- MainLayout

## Bağımlılıklar

**İç Bağımlılıklar**: `children` prop'u aracılığıyla alt bileşenleri alır.

**Dış Bağımlılıklar**: Toaster, AddToCartToast, WhatsAppFloat gibi ek bileşenleri dışarıdan render ederek uygulama genelinde arayüz tutarlılığını sağlar.

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa, layout iskeleti içinde alt bileşen içeriği olmadan render edilir; sayfa içerikleri sarılamaz.

[Aksiyom 2]: Eğer `MainLayoutProps` tipi tanımlı değilse, bileşen TypeScript derleme hatası verir ve render edilemez.

[Aksiyom 3]: Eğer `Toaster` bileşeni erişilemez (import edilmemiş veya tanımsız) ise, bildirim sistemi render edilmez.

[Aksiyom 4]: Eğer `AddToCartToast` bileşeni erişilemez ise, sepet bildirim arayüzü render edilmez.

[Aksiyom 5]: Eğer `WhatsAppFloat` bileşeni erişilemez ise, WhatsApp iletişim butonu render edilmez.

---

## FONKSİYON DETAYLARI

### MainLayout
**Ne yapar**: Uygulamanın ana sayfa düzenini (layout) oluşturan bir React fonksiyonel bileşenidir. Admin sayfaları için farklı, normal sayfalar için farklı bir kabuk yapısı sunar. Admin sayfalarında herhangi bir sarmalama yapmadan çocuk bileşenleri doğrudan döndürür; normal sayfalarda ise yapışkan üst bilgi, alt bilgi, gezinme butonları ve çeşitli overlay bileşenlerini içeren tam bir sayfa düzeni sağlar.

**Nasıl yapar**: Bileşen önce mevcut URL yolunu `usePathname` ile alır ve yolun `/admin` ile başlayıp başlamadığını kontrol eder. `useScrollThrottle` özel kancası ile sayfanın kaydırma durumunu belirli eşik değerlerine göre takip eder (100 pikselde göster, 60 pikselde gizle, 16ms throttle, 180ms başlangıç gecikmesi). İki adet tembel yükleme (lazy loading) mekanizması kurar: birincisi kullanıcı etkileşimi (fare tıklaması veya tuş basımı) gerçekleştiğinde `enableToaster` durumunu aktif eder ve bildirim bileşenlerinin yüklenmesini tetikler; ikincisi sayfa kaydırma olayı gerçekleştiğinde `enableWhatsApp` durumunu aktif eder ve WhatsApp iletişim bileşeninin yüklenmesini tetikler. Her iki mekanizma da `useEffect` içinde `once: true` seçeneğiyle olay dinleyicileri ekler ve bileşen kaldırıldığında temizler. Admin sayfası tespit edildiğinde, `AdminLayout` bileşeninin tek ve tam kabuk olduğunu belirten yoruma uygun olarak, hiçbir ek sarmalama yapmadan `<>{children}</>` döndürür. Normal sayfalarda ise `min-h-screen` yüksekliğinde, dikey flex düzeninde bir kapsayıcı oluşturur; bu kapsayıcı içinde `ScrollToTop`, `StickyHeader` (kaydırma durumuna göre), ana içerik alanı, sabit konumlu gezinme butonları (`BackToTopButton`, `WhatsAppFloat`, `LanguageSwitcher`), `PaymentWatcher`, `Footer` ve koşullu olarak `AddToCartToast` ile `Toaster` bileşenlerini render eder.

**Parametreler**:
- children: MainLayoutProps — Bileşenin içine yerleştirilecek alt bileşenler. `MainLayoutProps` tipi verilen kaynak kodda tanımlı olup `children` özelliğini içerir.

**Dönüş**: Bilinmiyor — kaynak kodda dönüş tipi açıkça belirtilmemiştir. JSX yapısı döndüren bir React fonksiyonel bileşeni olduğu anlaşılmaktadır; admin sayfalarında Fragment (`<>{children}</>`), normal sayfalarda ise bir `div` kapsayıcı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useScrollThrottle::useScrollThrottle
- import: ../BackToTopButton::BackToTopButton
- import: ../Footer::Footer
- import: ../LanguageSwitcher::LanguageSwitcher
- import: ../PaymentWatcher::PaymentWatcher
- import: ../ScrollToTop::ScrollToTop
- import: ../StickyHeader::StickyHeader
- import: next/navigation::usePathname
- import: react::React
- import: react::Suspense
- import: react::lazy
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### MainLayoutProps
- `children: React.ReactNode`

---

## SABİTLER
- **Toaster** (call) — `lazy(() => import('sonner').then(m => ({ default: m.Toaster })))`
- **AddToCartToast** (call) — `lazy(() => import('../AddToCartToast'))`
- **WhatsAppFloat** (call) — `lazy(() => import('../WhatsAppFloat'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::MainLayout
- **params**: `{ children }` — MainLayoutProps tipinde, sarmalanacak alt bileşenler
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL yolu; admin kontrolü ve `useScrollThrottle`'ın `syncKey` parametresi için kullanılır
  - `isAdmin` — `pathname?.startsWith('/admin')` ifadesinden türeyen boolean; true ise admin kabuğu atlanır ve yalnızca `children` döndürülür
  - `isScrolled` — `useScrollThrottle({ showAt: 100, hideBelow: 60, throttleMs: 16, initialDelayMs: 180, syncKey: pathname || '' })` çağrısından dönen kaydırma durumu; `StickyHeader` bileşenine `isScrolled` prop'u olarak iletilir
  - `enableToaster` — `useState(false)` ile tanımlanan boolean state; Toaster ve AddToCartToast bileşenlerinin gösterilip gösterilmeyeceğini kontrol eder
  - `setEnableToaster` — `enableToaster` state'ini güncelleyen setter fonksiyonu; `pointerdown` veya `keydown` olayında `true` yapılır
  - `enableWhatsApp` — `useState(false)` ile tanımlanan boolean state; WhatsAppFloat bileşeninin gösterilip gösterilmeyeceğini kontrol eder
  - `setEnableWhatsApp` — `enableWhatsApp` state'ini güncelleyen setter fonksiyonu; `scroll` olayında `true` yapılır
  - `enable` (ilk useEffect içinde) — `setEnableToaster(true)` çağıran fonksiyon; `window.addEventListener('pointerdown', enable, { once: true })` ve `window.addEventListener('keydown', enable, { once: true })` ile tek seferlik dinleyici olarak eklenir; cleanup'ta her iki olaydan kaldırılır
  - `enable` (ikinci useEffect içinde) — `setEnableWhatsApp(true)` çağıran fonksiyon; `window.addEventListener('scroll', enable, { once: true, passive: true })` ile tek seferlik dinleyici olarak eklenir; cleanup'ta `scroll` olayından kaldırılır
- **Dönüş**: JSX (React.ReactNode) — `isAdmin` true ise `<>{children}</>` döndürür; false ise `<div className="relative min-h-screen bg-white flex flex-col">` içinde `ScrollToTop`, `StickyHeader`, `main` (children ile), `BackToTopButton`, koşullu `WhatsAppFloat` (Suspense ile), `LanguageSwitcher`, `PaymentWatcher`, `Footer` ve koşullu `AddToCartToast` + `Toaster` (Suspense ile) bileşenlerini içeren tam layout yapısı döndürür

---

## NODE ID STANDARD

  file: src\components\layout\MainLayout.tsx
  function: src\components\layout\MainLayout.tsx::MainLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: MainLayout

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`
- **Layout:** `bottom-6`, `fixed`, `flex`, `flex-col`, `flex-grow`, `gap-3`, `items-end`, `min-h-screen`, `relative`, `right-6`, `z-toast`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `duration-300`, `pointer-events-auto`, `pointer-events-none`, `transition-colors`