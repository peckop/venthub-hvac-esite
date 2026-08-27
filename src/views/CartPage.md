---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\CartPage.tsx
skeleton_hash: f750f8daaedb1cc0
entity_hashes:
  func:CartPage: 47b501309afc6903
  overview: 6afbfcbb29c27c31
  style_tokens: 089647e604d32b73
generated_at: 2026-08-27T07:08:54Z
---

## Genel Bakış
CartPage.tsx modülü, alışveriş sepeti sayfasını temsil eden bir React bileşeni içerir. `CartPage` fonksiyonu bir React fonksiyon bileşeni olarak tanımlanmıştır. Modül, sepet sayfasının kullanıcı arayüzünü sunmaktan sorumludur.

## Fonksiyon Grupları
### Sayfa Bileşeni
Alışveriş sepeti sayfasının ana bileşenini tanımlar ve render eder.
- `CartPage`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modüle ait yalnızca fonksiyon imzası (`CartPage() -> React.FC`) mevcuttur. Fonksiyon gövdesi, iç mantık, bağımlılıklar veya kontrol akışı hakkında bilgi bulunmadığından, modülün doğru çalışması için hangi koşulların varolması gerektiğine dair güvenilir bir çıkarım yapılamaz. Bilinmeyen hakkında hüküm vermek, hüküm vermemekten daha zararlıdır.

---

## FONKSİYON DETAYLARI

### CartPage
**Ne yapar**: React fonksiyonel bileşeni olarak tanımlanmış bir sayfa bileşenidir. Fonksiyon adı, bir alışveriş sepeti (cart) sayfası olduğunu göstermektedir ancak docstring boş bırakıldığı için kesin görev tanımı belirtilmemiştir.

**Nasıl yapar**: Fonksiyon, herhangi bir parametre almaz ve `React.FC` (React Functional Component) tipinde bir bileşen döndürür. İç mantığı hakkında verilen kaynakta bilgi bulunmamaktadır.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipinde bir değer döndürür. Bu, JSX elementi üreten ve React bileşen ağacında kullanılabilen bir fonksiyonel bileşen anlamına gelir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/SecurityRibbon::SecurityRibbon
- import: ../components/quotes/QuoteRequestButton::QuoteRequestButton
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/format::formatCurrency
- import: lucide-react::ArrowLeft
- import: lucide-react::Minus
- import: lucide-react::Plus
- import: lucide-react::ShoppingBag
- import: lucide-react::Trash2
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` — `useCart()` hook'undan dönen sepet kalemleri dizisi; `items.length` ile boşluk kontrolü yapılır, `.some()` ile fiyat kontrolü yapılır, `.map()` ile kalem bileşenleri oluşturulur, `.filter()` ile fiyatlandırılmamış kalemler süzülür
  - `updateQuantity` — `useCart()` hook'undan gelen fonksiyon; `item.product.id` ve yeni miktar (`item.quantity - 1` veya `item.quantity + 1`) parametreleriyle çağrılır
  - `removeFromCart` — `useCart()` hook'undan gelen fonksiyon; `item.product.id` parametresiyle çağrılır, ürünü sepetten kaldırır
  - `clearCart` — `useCart()` hook'undan gelen fonksiyon; parametre almadan çağrılır, sepeti tamamen boşaltır
  - `getCartTotal` — `useCart()` hook'undan gelen fonksiyon; parametre almadan çağrılır, sepet toplam fiyatını sayı olarak döndürür; alt toplam, KDV hesabı ve toplam gösteriminde kullanılır
  - `getCartCount` — `useCart()` hook'undan gelen fonksiyon; parametre almadan çağrılır, sepet kalem sayısını döndürür; `t('cart.countLabel', { count: getCartCount() })` içinde kullanılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; `t('cart.emptyTitle')`, `t('cart.emptyDesc')`, `t('cart.startShopping')`, `t('cart.title')`, `t('cart.countLabel', ...)`, `t('common.requestQuote')`, `t('cart.itemTotal')`, `t('cart.decreaseQty')`, `t('cart.increaseQty')`, `t('cart.removeItem')`, `t('cart.clearCart')`, `t('cart.summary')`, `t('cart.subtotal')`, `t('cart.shipping')`, `t('cart.free')`, `t('cart.vatIncluded')`, `t('cart.total')`, `t('cart.quoteItemsNotice')`, `t('cart.checkout')`, `t('cart.continueShopping')`, `t('cart.securePayment')` anahtarlarıyla çağrılır
  - `lang` — `useI18n()` hook'undan gelen mevcut dil kodu; `formatCurrency` çağrılarında birinci argüman olarak kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen rotalar nesnesi; `Routes.home()`, `Routes.product(item.product.slug!)`, `Routes.checkout()` metotlarıyla çağrılır
  - `hasUnpricedItems` — `items.some((item) => typeof item.unitPrice !== 'number' || !Number.isFinite(item.unitPrice))` ifadesiyle hesaplanan boolean; fiyatlandırılmamış (unitPrice sayı olmayan veya sonlu olmayan) kalem varsa `true` olur; boş sepet ekranı dışında koşullu render'da, uyarı mesajında, `QuoteRequestButton` gösteriminde ve ödeme butonunun devre dışı bırakılmasında kullanılır
- **Dönüş**: JSX elementi (React.ReactNode); `items.length === 0` ise boş sepet ekranı, aksi takdirde dolu sepet ekranı döndürür

---

## NODE ID STANDARD

  file: src\views\CartPage.tsx
  function: src\views\CartPage.tsx::CartPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue`, `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-2`, `border-light-gray`, `border-primary-navy`, `from-air-blue`, `hover:bg-light-gray`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-primary-navy`, `hover:text-red-500`, `hover:text-white`
- **Layout:** `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `from-air-blue`, `gap-2`, `gap-8`, `grid`, `grid-cols-1`, `h-20`, `h-24`, `inline-flex`, `items-center`, `items-start`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `cursor-not-allowed`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/50`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mb-8`, `mr-2`