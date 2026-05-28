---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\MainLayout.tsx
skeleton_hash: 9565e774eeff6c35
entity_hashes:
  func:MainLayout: 0453d85d148de011
  overview: 7e72cc7b6a87bed6
  style_tokens: bc0163b5a04f2512
generated_at: 2026-05-28T22:36:12Z
---

## Genel Bakış
Bu modül, uygulamanın temel ve tutarlı sayfa yapısını oluşturan ana React bileşenidir. Sayfa içeriklerini (`children`) alarak, ortak bir düzen içinde (başlık, menü, alt bilgi) sarmalar ve tüm sayfaların görünümünü standartlaştırır.

## Fonksiyon Grupları
### Düzen Renderlama
Uygulamanın genel görsel iskeletini ve sayfa yerleşimini yöneten temel bileşeni içerir.
- MainLayout

---

## AXIOMS – Mimari Varsayımlar
Bu modül, ana sayfa düzenini sağlayan bir layout bileşenidir ve孩子.children prop'u ile alt içerikleri sarar.

[Aksiyom 1]: Eğer `children` propu sağlanmazsa, modül sadece outer wrapper (header, menü, footer alanlarını içeren yapı) render edilir, orta içerik bölgesi boş kalır.

[Aksiyom 2]: Eğer `Toaster` bileşeni (veya modüldeki karşılığı) render edilmezse, uygulama genelinde toast bildirimleri gösterilemez.

[Aksiyom 3]: Eğer `AddToCartToast` bileşeni render edilmezse, sepete ekleme işlemleri sonrası kullanıcıya bildirim gösterilmez.

[Aksiyom 4]: Eğer `WhatsAppFloat` bileşeni render edilmezse, sağ alt köşedeki sabit WhatsApp iletişim butonu görünmez olur.

---

## FONKSİYON DETAYLARI

### MainLayout

**Ne yapar**: Uygulamanın ana layout yapısını oluşturur. Mevcut sayfanın rotasına (pathname) göre admin paneli veya normal site layout'unu render eder. Sticky header, footer, WhatsApp butonu, toast bildirimleri ve scroll-to-top gibi global bileşenleri yönetir.

**Nasıl yapar**: 
- `usePathname` hook'u ile mevcut sayfa rotasını alır ve `/admin` ile başlayıp başlamadığını kontrol eder
- Admin sayfasındaysa minimal bir layout (siyah header + çocuk bileşenler) döner
- Normal sayfalarda `useScrollThrottle` hook'u ile scroll pozisyonunu takip ederek sticky header'ın gösterilip gizlenmesini kontrol eder
- Toast ve WhatsApp butonları için performans odaklı lazy loading uygular: Toast, kullanıcı ilk kez tıkladığında veya tuşa bastığında; WhatsApp butonu ise ilk scroll hareketinde etkinleşir
- `Suspense` ile sarılmış bileşenlerle async loading yönetimi yapar

**Parametreler**:
- `children` : `React.ReactNode` — Layout içinde render edilecek sayfa içeriği. MainLayout bileşeninin ana prop'u olup, tüm alt sayfa bileşenleri bu parametre aracılığıyla layout içine yerleştirilir

**Dönüş**: `JSX.Element` — Admin sayfası için basit bir `<div>` yapısı, normal sayfalar için sticky header, ana içerik alanı, WhatsApp butonu, footer ve toast sistemi dahil tam bir sayfa layout'u döner

---

## INTERFACES

### MainLayoutProps
- `children: React.ReactNode`

---

## SABİTLER
- **Toaster** (call) — `lazy(() => import('react-hot-toast').then(m => ({ default: m.Toaster })))`
- **AddToCartToast** (call) — `lazy(() => import('../AddToCartToast'))`
- **WhatsAppFloat** (call) — `lazy(() => import('../WhatsAppFloat'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/layout/MainLayout.tsx::MainLayout`
- **params**: `{ children }` — `MainLayoutProps` tipinde, sarmalanan sayfa içeriği
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan gelen mevcut URL yolu (string | null)
  - `isAdmin` — `pathname?.startsWith('/admin')` ile hesaplanan boolean; admin sayfasında olup olmadığının kontrolü
  - `isScrolled` — `useScrollThrottle({ showAt: 100, hideBelow: 60, throttleMs: 16, initialDelayMs: 180, syncKey: pathname || '' })` ile dönen boolean; sayfanın belirli px kadar scroll edilip edilmediğini belirtir
  - `enableToaster` — `useState(false)` ile oluşturulan state; Toaster ve AddToCartToast bileşenlerinin etkinleşip etkinleşmeyeceğini tutar
  - `setEnableToaster` — `enableToaster` state'ini güncelleyen setter fonksiyonu; useEffect içinde ilk pointerdown veya keydown'da `true` yapılır
  - `enableWhatsApp` — `useState(false)` ile oluşturulan state; WhatsAppFloat bileşeninin etkinleşip etkinleşmeyeceğini tutar
  - `setEnableWhatsApp` — `enableWhatsApp` state'ini güncelleyen setter fonksiyonu; useEffect içinde ilk scroll'da `true` yapılır
- **Dönüş**: JSX — `isAdmin` true ise admin paneli layout'u (minimal sarmalayıcı), false ise ana site layout'u (StickyHeader, main content, BackToTopButton, WhatsAppFloat, PaymentWatcher, LanguageSwitcher, Footer, Toaster, AddToCartToast dahil tam sayfa yapısı)

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
- **Layout:** `bottom-6`, `fixed`, `flex`, `flex-col`, `flex-grow`, `gap-3`, `items-center`, `justify-between`, `min-h-screen`, `overflow-auto`, `relative`, `right-6`, `z-50`, `z-modal`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `duration-300`, `font-bold`, `px-3`, `px-6`, `py-1`, `py-3`, `rounded-full`, `shrink-0`, `tracking-tighter`, `tracking-widest`, `transition-colors`, `uppercase`