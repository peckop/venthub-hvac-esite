---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ProductCard.tsx
skeleton_hash: d29f558e350cd40d
entity_hashes:
  overview: 9d2b069c54b1d8b3
  style_tokens: f04c95b84c1173dc
generated_at: 2026-08-15T06:31:57Z
---

## Genel Bakış

`ProductCard.tsx`, HVAC ürünlerini kart bileşeni olarak render eden bir React bileşenidir. `Product` tipindeki verileri (görsel, marka, fiyat) alarak yerelleştirilmiş fiyat gösterimi sunar, sepete ekleme işlemini `useCart` hook'u ile yönetir ve `next/link` kullanarak ürün detay sayfasına yönlendirme sağlar. Bileşen `grid` ve `list` olmak üzere iki farklı düzen modunu destekler; `priority`, `compact`, `hidePrice` ve `highlightFeatured` gibi opsiyonel prop'larla görsel ve işlevsel özelleştirmelere olanak tanır.

**Dış Bağımlılıklar:** `resolveProductImageUrl` (görsel URL çözümleme), `formatCurrency` (para birimi formatlama), `useLocalizedRoutes` (yerelleştirilmiş rotalar) ve `Product` / `WithDisplayPrice` tipleri.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyom tanımlanamamıştır. Fonksiyon gövdesi (implementation) verilmemiş olup, yalnızca dosya yolu ve modül sabiti (ProductCard) mevcuttur. Mimari varsayımların üretilebilmesi için fonksiyon gövdesine erişim gereklidir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/format::formatCurrency
- import: ./HVACIcons::BrandIcon
- import: ./ui/VentImage::VentImage
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/lib/services/displayPrice.service::type { WithDisplayPrice }
- import: @/types/ui-models::type { Product }
- import: next/link::Link
- import: react::React

---

## INTERFACES

### ProductCardProps
- `product: StorefrontProduct`
- `onQuickView?: (product: StorefrontProduct) => void`
- `highlightFeatured?: boolean`
- `layout?: 'grid' | 'list'`
- `priority?: boolean`
- `hidePrice?: boolean`
- `compact?: boolean`

---

## TYPE ALIASES

### StorefrontProduct
W4b · Kartın fiyat kaynağı MOTORDUR (`displayPrice`), ham `products.price` DEĞİL — o kolon Kademe-2'de emekli edildi (INV-PRICE-1, cetvel §1). Alanlar bilinçli olarak OPSİYONEL: fiyat köprüsü henüz bağlanmamış çağıranlar (ör. ana sayfa blokları) derlenmeye devam etsin, ama fiyat yerine "Teklif İste"
```typescript
type StorefrontProduct = Product &
  Partial<Pick<WithDisplayPrice<Product>, 'displayPrice' | 'displayPriceTaxIncluded'>>
```

---

## SABİTLER
- **ProductCard** (call) — `React.memo(function ProductCard({
  product,
  layout = 'grid',
  priority...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/ProductCard.tsx::(onClick Handler - anonim arrow function)
- **params**: `(e: React.MouseEvent)` — tıklama olayı nesnesi
- **ic_degiskenler**:
  - `e` — React fare olayı nesnesi; `preventDefault()` ve `stopPropagation()` çağrıları için kullanılır
  - `quoteMode` — mantıksal değer (closure'dan yakalanır); `true` ise fonksiyon erken döner, sepete ekleme yapılmaz
  - `addToCart` — sepete ürün ekleyen fonksiyon (closure'dan yakalanır, `useCart` hook'undan gelir)
  - `product` — eklenecek ürün nesnesi (closure'dan yakalanır, bileşen prop'undan gelir); `addToCart`'a argüman olarak verilir
- **Dönüş**: `void` — yan etki tabanlıdır; varsayılan tıklama davranışını iptal eder, üst bileşen yayılmasını engeller ve koşula göre sepete ürün ekler

---

**Not**: Fonksiyonda erken dönüş (`if (quoteMode) return`) mevcuttur; bu durumda `addToCart(product)` çağrısı çalışmaz. Fonksiyonun tüm amacı: tıklama olayını yutmak ve `quoteMode` dışı senaryolarda ürünü sepete eklemektir.

---

## NODE ID STANDARD

  file: src\components\ProductCard.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: StorefrontProduct

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gold-accent`, `bg-light-gray/30`, `bg-light-gray/50`, `bg-primary-navy`, `bg-white`, `bg-white/90`, `border-light-gray`, `border-t`, `disabled:hover:bg-primary-navy`, `group-hover:bg-light-gray/50`, `group-hover:text-primary-navy`, `hover:bg-secondary-blue`, `sm:text-lg`, `text-base`, `text-industrial-gray`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-3`, `h-11`, `h-28`, `h-9`, `h-full`, `hover:shadow-hvac-lg`, `hover:shadow-lg`, `items-baseline`
- **Varyant/Responsive:** `:`, `active:`, `disabled:`, `focus-visible:`, `group-hover:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${compact`, `:`, `active:scale-95`, `aspect-square`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `duration-300`, `duration-500`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`