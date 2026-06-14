---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\MainLayout.tsx
skeleton_hash: d7fee17040961632
entity_hashes:
  func:MainLayout: 7d14ab9d717a82fb
  overview: f38b891811e26fb3
  style_tokens: c300b80e9d38560c
generated_at: 2026-06-14T22:18:29Z
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

**Ne yapar**: Uygulamanın ana layout (yerleşim) bileşenidir. Admin paneli ile genel site olmak üzere iki farklı yerleşim şemasını koşullu olarak render eder. Sayfa içeriğini (`children`) sararak üst bilgi çubuğu (header), alt bilgi çubuğu (footer), geri yukarı butonu, WhatsApp butonu, dil seçici, toast bildirimleri ve ödeme izleyicisi gibi globallyel bileşenleri yönetir.

**Nasıl yapar**:
- `useI18n()` hook'u ile çoklu dil desteği (i18n) sağlar ve çevirileri `t()` fonksiyonuyla sunar.
- `usePathname()` hook'u ile mevcut URL yolunu okur. Eğer yol `/admin` ile başlıyorsa `isAdmin` flag'ini `true` yaparak yöneticilere özel minimal bir layout render eder; aksi halde genel site layout'unu render eder.
- `useScrollThrottle` özel hook'unu kullanarak sayfanın kaydırma (scroll) durumunu throttled (kesikli/aralıklı) şekilde takip eder. `showAt: 100` parametresi ile 100px kaydırma eşiğinde başlık çubuğunun "scrolled" moduna geçmesini sağlar, `hideBelow: 60` ile 60px altında başlığın tekrar görünür olmasını, `syncKey: pathname` ile her sayfa geçişinde scroll durumunun sıfırlanmasını tetikler.
- `useState` ve `useEffect` ile iki adet lazy-enable (gecikmeli etkinleştirme) mekanizması kurar: `enableToaster` state'i kullanıcı ilk kez pointer (fare/parmak) bastığında veya tuşa bastığında etkinleşir (`{ once: true }` ile sadece bir kez dinlenir); `enableWhatsApp` state'i ise kullanıcı ilk kez kaydırma yaptığında (`passive: true` ile tarayıcı engeli olmadan) etkinleşir. Bu sayede above-the-fold performansı korunur.
- Admin layout'unda koyu arka planlı bir üst çubuk ve geri dönüş linki ile basit bir content alanı sunar.
- Genel site layout'unda `ScrollToTop` (sayfa geçişlerinde yukarı kaydırma), `StickyHeader` (kaydırma durumuna göre yapışkan/sabit başlık), `BackToTopButton`, `WhatsAppFloat`, `LanguageSwitcher`, `PaymentWatcher`, `Footer`, `AddToCartToast` ve `Toaster` gibi bileşenleri stratejik olarak konumlandırır.
- `Suspense` ile sarmalanan `WhatsAppFloat` ve `AddToCartToaster` bileşenleri, code-splitting (kod ayırma) ile asenkron yüklenir; `fallback={null}` sayesinde yüklenme sırasında boş render yapılır.

**Parametreler**:
- `children: React.ReactNode` — Layout tarafından sarılacak (wrap edilecek) alt sayfa bileşenleri. Sayfa içeriği bu prop aracılığıyla layout'un orta bölgesine yerleştirilir.

**Dönüş**: `JSX.Element` — Render edilen layout yapısı. Admin rotası için minimal bir yönetim paneli yerleşimi, genel rotalar için tam donanımlı site yerleşimi (header, main, footer ve global overlay bileşenleri) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useScrollThrottle::useScrollThrottle
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
- import: ../BackToTopButton::BackToTopButton
- import: ../Footer::Footer
- import: ../LanguageSwitcher::LanguageSwitcher
- import: ../PaymentWatcher::PaymentWatcher
- import: ../ScrollToTop::ScrollToTop
- import: ../StickyHeader::StickyHeader
- import: next/link::Link
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

### [N1_NASIL] AST Pointer: `src/components/layout/MainLayout.tsx`::MainLayout
- **params**: `{ children }: MainLayoutProps`
  - `children` — React child elemanları, layout içinde render edilen sayfa içeriği
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructured çeviri fonksiyonu; `t('header.adminBar.brand')` ve `t('header.adminBar.backToSite')` çağrılıyor
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL pathname; admin kontrolü ve scroll senkronizasyonu için kullanılır
  - `isAdmin` — `pathname?.startsWith('/admin')` ifadesinden türetilen boolean; admin sayfasıysa farklı layout döner
  - `isScrolled` — `useScrollThrottle({ showAt: 100, hideBelow: 60, throttleMs: 16, initialDelayMs: 180, syncKey: pathname || '' })` çağrısından dönen scroll durumu; `StickyHeader`'a prop olarak verilir
  - `enableToaster` — `useState(false)` state'i; `pointerdown`/`keydown` event'inde `true` olur, Toaster ve AddToCartToast'ın lazy yüklenmesini tetikler
  - `setEnableToaster` — `enableToaster` state setter'ı
  - `enableWhatsApp` — `useState(false)` state'i; `scroll` event'inde `true` olur, WhatsAppFloat'ın lazy yüklenmesini tetikler
  - `setEnableWhatsApp` — `enableWhatsApp` state setter'ı
  - `enable` (1. useEffect içinde) — arrow callback; `setEnableToaster(true)` çağırır, `pointerdown` ve `keydown` için `{ once: true }` ile event listener ekler, cleanup'ta kaldırır
  - `enable` (2. useEffect içinde) — arrow callback; `setEnableWhatsApp(true)` çağırır, `scroll` için `{ once: true, passive: true }` ile event listener ekler, cleanup'ta kaldırır
- **Return**: JSX — `isAdmin` true ise minimal admin bar layout'u; değilse tam layout (StickyHeader, main content, BackToTopButton, WhatsAppFloat via lazy, LanguageSwitcher, PaymentWatcher, Footer, AddToCartToast via lazy, Toaster via lazy)

---

### [N2_NASIL] AST Pointer: `src/components/layout/MainLayout.tsx`::useEffect_1 (enableToaster)
- **params**: yok
- **ic_degiskenler**:
  - `enable` — arrow fonksiyon; `setEnableToaster(true)` çağırarak Toaster'ı etkinleştirir; `window`'a `pointerdown` ve `keydown` event listener'ları `{ once: true }` ile eklenir
- **Return**: cleanup fonksiyonu — `pointerdown` ve `keydown` listener'larını `removeEventListener` ile kaldırır

---

### [N3_NASIL] AST Pointer: `src/components/layout/MainLayout.tsx`::useEffect_2 (enableWhatsApp)
- **params**: yok
- **ic_degiskenler**:
  - `enable` — arrow fonksiyon; `setEnableWhatsApp(true)` çağırarak WhatsAppFloat'ı etkinleştirir; `window`'a `scroll` event listener'ı `{ once: true, passive: true }` ile eklenir
- **Return**: cleanup fonksiyonu — `scroll` listener'ını `removeEventListener` ile kaldırır

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
- **Renkler:** `bg-gray-50`, `bg-slate-900`, `bg-white`, `bg-white/10`, `hover:bg-white/20`, `text-white`, `text-xs`
- **Layout:** `bottom-6`, `fixed`, `flex`, `flex-col`, `flex-grow`, `gap-3`, `items-center`, `items-end`, `justify-between`, `min-h-screen`, `overflow-auto`, `relative`, `right-6`, `z-modal`, `z-toast`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `duration-300`, `font-bold`, `pointer-events-auto`, `pointer-events-none`, `px-3`, `px-6`, `py-1`, `py-3`, `rounded-full`, `shrink-0`, `tracking-tighter`, `tracking-widest`, `transition-colors`, `uppercase`