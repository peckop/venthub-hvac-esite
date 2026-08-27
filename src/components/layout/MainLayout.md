---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\layout\MainLayout.tsx
skeleton_hash: 7433144502143f99
entity_hashes:
  func:MainLayout: 7607152681e8475f
  overview: b51c14c938afce8b
  style_tokens: 57ab2fa7fdc3ea42
generated_at: 2026-08-27T08:30:36Z
---

## Genel Bakış
Bu modül, uygulamanın tüm sayfalarına tutarlı bir görünüm kazandıran ana React layout bileşenidir. URL yoluna bağlı olarak yönetim paneli veya genel site düzeni sunarak sayfa içeriklerini ortak bir iskelet içinde sarar ve bildirim, sepet bildirimi, WhatsApp iletişim butonu gibi küresel arayüz elemanlarını merkezi olarak yönetir. İç bağımlılıkları olarak children prop'u aracılığıyla alt bileşenleri alır ve dışarıdan Toaster, AddToCartToast, WhatsAppFloat gibi ek bileşenleri render ederek uygulama genelinde arayüz tutarlılığını sağlar.

## Fonksiyon Grupları
### Sayfa Düzeni ve Yerleşim
Uygulamanın temel görsel yapısını ve sayfa yerleşimini belirleyen ana layout bileşenini içerir. Rota bazlı olarak farklı düzen varyantlarını (yönetim paneli veya genel site) render ederek children içeriğini sarar.
- MainLayout

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### MainLayout

**Ne yapar**: Uygulamanın ana sayfa düzenini (layout) oluşturan React bileşenidir. Admin sayfaları için minimal bir sarma (sadece `children`), normal sayfalar için ise üstbilgi, altbilgi, gezinme butonları ve global katmanlardan (toaster, WhatsApp, dil değiştirici) oluşan tam bir sayfa iskeleti sunar.

**Nasıl yapar**: Bileşen önce mevcut URL yolunu `usePathname` ile alır ve `/admin` ile başlayıp başlamadığını kontrol eder. Admin yolu tespit edilirse, hiçbir ek kabuk sarmalamadan yalnızca `children` döndürülür; bu sayede `AdminLayout` bileşeninin tek tam ekran katman olarak çalışması sağlanır ve çifte scrollbar, üst üste marka çubuğu gibi sorunlar önlenir. Normal sayfalarda ise `useScrollThrottle` ile sayfanın kaydırma durumu izlenir; bu hook, belirtilen piksel eşiklerine göre yapışkan başlığın (StickyHeader) görünürlüğünü yönetir ve `pathname`'e bağlı bir `syncKey` ile senkronize çalışır. Toaster ve WhatsAppFloat bileşenleri, performans amacıyla kullanıcı etkileşimi gerçekleşene kadar yüklenmez; `pointerdown` veya `keydown` olayları Toaster'ı, `scroll` olayı ise WhatsAppFloat'ı aktifleştirir. Her iki durumda da olay dinleyicileri `{ once: true }` ile yalnızca bir kez tetiklenir ve bileşen kaldırıldığında temizlenir. Sayfa geçiş animasyonu kapatılmıştır; bu, belirtilen sorun kaynağının kendisidir. Admin dışı sayfalarda `ScrollToTop`, `BackToTopButton`, `LanguageSwitcher`, `PaymentWatcher` ve `Footer` bileşenleri sabit olarak; `WhatsAppFloat`, `AddToCartToast` ve `Toaster` ise koşullu olarak render edilir.

**Parametreler**:
- `children`: `MainLayoutProps` tipinden destruct edilen özellik — Bileşenin içeriğini oluşturan alt bileşenler. `MainLayoutProps` tipi bu dosyada tanımlı olup `children` alanını içerir; kesin tip tanımı verilen kaynakta belirtilmemiştir.

**Dönüş**: JSX döndüren bir React fonksiyon bileşenidir. Admin sayfalarında `<>{children}</>` fragment'ı, normal sayfalarda ise `className="relative min-h-screen bg-white flex flex-col"` özellikli bir `div` kapsayıcısı içinde düzenlenmiş bileşen ağacı döndürülür. Kesin dönüş tipi verilen kaynakta belirtilmemiştir.

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
- **params**: `children` — `MainLayoutProps` tipinde, sarmalanacak alt bileşenler
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL yolu
  - `isAdmin` — `pathname?.startsWith('/admin')` ile hesaplanan boolean; admin sayfasında olup olmadığını belirler
  - `isScrolled` — `useScrollThrottle` hook'undan dönen kaydırma durumu; `{ showAt: 100, hideBelow: 60, throttleMs: 16, initialDelayMs: 180, syncKey: pathname || '' }` parametreleriyle yapılandırılır
  - `enableToaster` — `useState(false)` ile tanımlanan boolean; Toaster ve AddToCartToast bileşenlerinin gösterilip gösterilmeyeceğini kontrol eder
  - `setEnableToaster` — `enableToaster` durumunu güncelleyen setter fonksiyonu
  - `enableWhatsApp` — `useState(false)` ile tanımlanan boolean; WhatsAppFloat bileşeninin gösterilip gösterilmeyeceğini kontrol eder
  - `setEnableWhatsApp` — `enableWhatsApp` durumunu güncelleyen setter fonksiyonu
  - `enable` (ilk useEffect) — `setEnableToaster(true)` çağıran fonksiyon; `pointerdown` ve `keydown` olaylarına `{ once: true }` ile bağlanır
  - `enable` (ikinci useEffect) — `setEnableWhatsApp(true)` çağıran fonksiyon; `scroll` olayına `{ once: true, passive: true }` ile bağlanır
- **Dönüş**: JSX.Element — `isAdmin` true ise `<>{children}</>` döner; aksi halde `ScrollToTop`, `StickyHeader`, `main` (children içerir), `BackToTopButton`, koşullu `WhatsAppFloat` (Suspense ile), `LanguageSwitcher`, `PaymentWatcher`, `Footer` ve koşullu `AddToCartToast` + `Toaster` (Suspense ile) içeren bir `<div>` döner

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