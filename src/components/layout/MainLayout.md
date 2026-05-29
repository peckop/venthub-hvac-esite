---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\layout\MainLayout.tsx
skeleton_hash: 4aa70162bd38d961
entity_hashes:
  func:MainLayout: 51353f0c7669626b
  overview: 7e72cc7b6a87bed6
  style_tokens: c300b80e9d38560c
generated_at: 2026-05-29T18:46:10Z
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

### [N1_NASIL] AST Pointer: src/components/layout/MainLayout.tsx::MainLayout
- **params**: `{ children }: MainLayoutProps`
- **ic_degiskenler**:
  - `pathname` — `usePathname()` hook'undan alınan mevcut sayfa rotası, admin kontrolü ve `useScrollThrottle` parametresi olarak kullanılır
  - `isAdmin` — `pathname`'in `/admin` ile başlayıp başlamadığını kontrol eden boolean, admin layout dalını tetikler
  - `isScrolled` — `useScrollThrottle` hook'undan dönen boolean, sayfanın kaydırma durumunu belirtir, `StickyHeader`'a aktarılır
  - `enableToaster` — `useState(false)` ile tanımlanan state, ilk etkileşim (`pointerdown`/`keydown`) sonrası `true` olur; `Toaster` ve `AddToCartToast`'ın render edilmesini kontrol eder
  - `setEnableToaster` — `enableToaster` state'ini `true` yapan setter fonksiyonu, `useEffect` içindeki event listener callback'inde çağrılır
  - `enableWhatsApp` — `useState(false)` ile tanımlanan state, ilk `scroll` olayı sonrası `true` olur; `WhatsAppFloat`'ın render edilmesini kontrol eder
  - `setEnableWhatsApp` — `enableWhatsApp` state'ini `true` yapan setter fonksiyonu, `useEffect` içindeki `scroll` event listener callback'inde çağrılır
- **Dönüş**: JSX element (`React.ReactNode`) — `isAdmin` true ise basit admin layout, değilse tam site layout'u (header, main, footer, overlay'ler dahil) döner

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