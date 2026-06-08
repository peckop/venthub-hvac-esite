---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\StickyHeader.tsx
skeleton_hash: 6fde2756a85bfc0b
entity_hashes:
  overview: 172915ba3cbcf418
  style_tokens: 55949ae1f3201280
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
VentHub HVAC platformunda sayfaların üst kısmında sabit kalan, kaydırma (scroll) hareketine otomatik olarak yanıt vererek gizlenen/gösterilen bir React başlık bileşenidir. Kullanıcı giriş durumu ve alışveriş sepeti bilgisini ilgili özel hook'lardan alarak üst çubukta durum simgelerini görüntüler; ayrıca arama çubuğu, mega menü ve kategori navigasyonunu açılır pencereler (overlay'ler) aracılığıyla yöneterek tüm üst menü işlevselliğini merkezi olarak kontrol eder. Modül, `localStorage`'dan son görüntülenen ürünler listesini okuyarak kişiselleştirilmiş bir deneyim sunar ve performans için `React.lazy` ile yüklenebilir alt bileşenler kullanır.

## Fonksiyon Grupları
Bu dosyada tanımlı herhangi bir fonksiyon veya metot bulunmamaktadır. Modül, bir React bileşen tanımı ile bir dizi hook çağrısından, alt bileşen yerleşimlerinden ve modül seviyesindeki yardımcı kodlardan oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: `StickyHeader.tsx::loadRecentProducts`
- **params**: () — anonim arrow fonksiyon
- **ic_degiskenler**:
  - `raw` — `window.localStorage.getItem('recentProducts')` sonucu, ham JSON string
- **Dönüş**: yok (side-effect: `setRecentProducts` çağırır, state'i günceller)

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