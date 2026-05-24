---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\MainLayout.tsx
skeleton_hash: 9565e774eeff6c35
generated_at: 2026-05-23T22:11:24Z
---

## Genel Bakış
Bu modül, uygulamanın ana düzenini tanımlayan bir React bileşeni sağlar. Sayfa içeriğini tutarlı bir başlık, menü ve alt bölüm içinde sarmalayarak, tüm sayfalar için ortak bir yapı sunar.

## Fonksiyon Grupları
### Düzen Renderlama
Bu grup, uygulamanın genel görünümünü ve yapısını yöneten işlevleri içerir.
- MainLayout

---

## AXIOMS – Mimari Varsayımlar
MainLayout işlevinin doğru çalışması için `children` propunun sağlanması ve belirli alt bileşenlerin (Toaster, AddToCartToast, WhatsAppFloat) mevcut olması gerekir.

[Aksiyom 1]: Eğer `children` propu sağlanmazsa, MainLayout içeriği boş görünebilir (sadece wrapper elementi render edilir).  
[Aksiyom 2]: Eğer `Toaster` bileşeni import edilmez veya kullanılmazsa, toast bildirimleri gösterilemez.  
[Aksiyom 3]: Eğer `AddToCartToast` bileşeni import edilmez veya kullanılmazsa, sepete ekleme işlemi sonrası kullanıcıya geri bildirim toast'i görünmez.  
[Aksiyom 4]: Eğer `WhatsAppFloat` bileşeni import edilmez veya kullanılmazsa, sayfada floating WhatsApp butonu gösterilmez.

---

## FONKSIYON DETAYLARI

### MainLayout
**Ne yapar**: MainLayout bileşeni, gelen `children` propunu alarak JSX döndüren bir React fonksiyonel bileşendir.  
**Nasıl yapar**: `MainLayoutProps` türünden bir nesne parametresi alır, bu nesnenin `children` özelliğini yapılandırma ile çıkarır ve bu `children`'ı render eder (fonksiyonun dönüş tipi JSX/void olarak kabul edilir).  
**Parametreler**:
- children: React.ReactNode — Bileşene yerleştirilecek alt öğeler (children) propu.  
**Dönüş**: JSX elementi (void) — Bileşenin render çıktısı.

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

### [N1_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::MainLayout
- **params**: children: MainLayoutProps
- **ic_degiskenler**: 
  - `pathname` — current route pathname returned by `usePathname()`
  - `isAdmin` — boolean, true when `pathname` starts with '/admin' (used to render admin‑specific layout)
  - `isScrolled` — boolean from `useScrollThrottle` indicating whether the page has been scrolled past the threshold
  - `enableToaster` — state flag that controls whether the `Toaster` and `AddToCartToast` overlays are rendered
  - `setEnableToaster` — setter function to turn `enableToaster` on (called by the pointerdown/keydown useEffect)
  - `enableWhatsApp` — state flag that controls whether the `WhatsAppFloat` button is rendered
  - `setEnableWhatsApp` — setter function to turn `enableWhatsApp` on (called by the scroll useEffect)
- **Dönüş**: JSX.Element (returns the layout JSX)

### [N2_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::useEffect_enableToaster_callback
- **params**: (yok)
- **ic_degiskenler**: 
  - `enable` — helper function that calls `setEnableToaster(true)`; registered as a one‑time listener for `pointerdown` and `keydown` events to activate the toast overlay
- **Dönüş**: cleanup function (returns an arrow function that removes the `pointerdown` and `keydown` listeners)

### [N3_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::useEffect_enableToaster_cleanup
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::useEffect_enableWhatsApp_callback
- **params**: (yok)
- **ic_degiskenler**: 
  - `enable` — helper function that calls `setEnableWhatsApp(true)`; registered as a one‑time, passive `scroll` listener to show the WhatsApp float button
- **Dönüş**: cleanup function (returns an arrow function that removes the `scroll` listener)

### [N5_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::useEffect_enableWhatsApp_cleanup
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\layout\MainLayout.tsx
  function: src\components\layout\MainLayout.tsx::MainLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: MainLayout