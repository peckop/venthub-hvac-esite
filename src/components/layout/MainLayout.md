---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\MainLayout.tsx
skeleton_hash: 470234bc83b49681
entity_hashes:
  func:MainLayout: 51353f0c7669626b
  overview: 4609ebe9b2a4256c
  style_tokens: c300b80e9d38560c
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
Bu modül, uygulamanın tüm sayfalarına tutarlı bir görünüm kazandıran ana layout bileşenidir. URL yoluna bağlı olarak yönetim paneli veya genel site düzeni sunarak sayfa içeriklerini ortak bir iskelet içinde sarar. Ayrıca bildirim, sepet bildirimi ve WhatsApp iletişim butonu gibi küresel arayüz elemanlarını merkezi olarak yönetir.

## Fonksiyon Grupları
### Sayfa Düzeni ve Yerleşim
Uygulamanın temel görsel yapısını ve sayfa yerleşimini belirleyen ana layout bileşenini içerir. Rota bazlı olarak farklı düzen varyantlarını (yönetim paneli veya genel site) render eder.
- MainLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, uygulamanın ana sayfa düzenini sağlayan React layout bileşenidir ve içeriği (`children`) ile birlikte ek bileşenleri (Toaster, AddToCartToast, WhatsAppFloat) render eder.

[Aksiyom 1]: Eğer `children` propu geçerli bir React elementi değilse (null, undefined veya geçersiz JSX), layout yapısı (header, menü, footer) yalnız render edilir ancak ana içerik alanı boş kalır.

[Aksiyom 2]: Eğer `Toaster` bileşeni modül bağlamında tanımlı veya import edilmemişse, bildirim toastları kullanıcıya gösterilmez.

[Aksiyom 3]: Eğer `AddToCartToast` bileşeni modül bağlamında tanımlı veya import edilmemişse, sepete ekleme bildirimi kullanıcıya gösterilmez.

[Aksiyom 4]: Eğer `WhatsAppFloat` bileşeni modül bağlamında tanımlı veya import edilmemişse, WhatsApp iletişim butonu sayfada görünmez.

[Aksiyom 5]: Eğer `MainLayoutProps` tipi `children` alanını içermiyorsa veya Children tipi uyumsuzsa, TypeScript derleme hatası oluşur ve modül render edilemez.

---

## FONKSİYON DETAYLARI

### MainLayout
**Ne yapar**: MainLayout, uygulamanın ana görünüm yapısını ve düzenini sağlayan üst düzey bir React bileşenidir. Sayfanın mevcut yoluna göre (yönetim paneli veya genel site) farklı düzenler sunar ve küresel arayüz elemanlarını (başlık, alt bilgi, bildirimler vb.) yönetir.

**Nasıl yapar**: Fonksiyon, `usePathname` kancasıyla mevcut URL yolunu alır ve bunun `/admin` ile başlayıp başlamadığını kontrol ederek iki ana render dalına ayrılır. Yönetici rotası için minimal, koyu temalı bir düzen; genel site için `StickyHeader`, `Footer`, ve various floating buttons (WhatsApp, dil seçici, yukarı çık) içeren daha zengin bir düzen döndürür. Kullanıcı etkileşimine (pointer olayı, tuş basma veya kaydırma) bağlı olarak `Toaster` ve `WhatsAppFloat` bileşenleri etkinleştirilerek performans optimizasyonu yapılır. `ScrollToTop` ve `PaymentWatcher` gibi bileşenler sayfa geçişlerini ve arka plan işlemlerini yönetir.

**Parametreler**:
- `props`: `MainLayoutProps` — Bileşenin alacağı özellikler objesi.
  - `children`: `React.ReactNode` — Düzenin içine render edilecek olan alt bileşenler veya sayfa içeriği. Bu, layouts pattern kullanılarak sayfalar arasındaki ortak yapıyı sağlayan zorunlu bir özelliktir.

**Dönüş**: `JSX.Element` — Seçilen düzene (yönetici veya genel site) göre yapılandırılmış React JSX elemanı.

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

### [N1_NASIL] AST Pointer: MainLayout.tsx::MainLayout
- **params**: (children: React.ReactNode)
- **ic_degiskenler**: 
  - `pathname` — usePathname() hookundan alınan mevcut sayfa yolu
  - `isAdmin` — pathname'in '/admin' ile başlayıp başlamadığını kontrol eden boolean
  - `isScrolled` — useScrollThrottle hook'undan dönen scroll pozisyonu durumu
  - `enableToaster` — Toaster ve AddToCartToast bileşenlerinin etkinleştirilip etkinleştirilmeyeceğini kontrol eden state
  - `setEnableToaster` — enableToaster state'ini güncellemek için setter fonksiyonu
  - `enableWhatsApp` — WhatsAppFloat bileşeninin etkinleştirilip etkinleştirilmeyeceğini kontrol eden state
  - `setEnableWhatsApp` — enableWhatsApp state'ini güncellemek için setter fonksiyonu
- **Dönüş**: React JSX element (JSX return)

### [N2_NASIL] AST Pointer: MainLayout.tsx::useEffectCallbackForEnableToaster
- **params**: (yok)
- **ic_degiskenler**: 
  - `enable` — setEnableToaster(true) çağıran arrow fonksiyon
- **Dönüş**: Cleanup fonksiyonu (arrow fonksiyon)

### [N3_NASIL] AST Pointer: MainLayout.tsx::cleanupEffectForEnableToaster
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: MainLayout.tsx::useEffectCallbackForEnableWhatsApp
- **params**: (yok)
- **ic_degiskenler**: 
  - `enable` — setEnableWhatsApp(true) çağıran arrow fonksiyon
- **Dönüş**: Cleanup fonksiyonu (arrow fonksiyon)

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