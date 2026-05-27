---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ProductCard.tsx
skeleton_hash: a9c5f54f770565d8
entity_hashes:
  overview: f6fc01dbf8632730
  style_tokens: 19c7d9ec430fc71d
generated_at: 2026-05-27T18:09:15Z
---

## Genel Bakış
Bu modül, HVAC ürünlerini görsel olarak sunan ve kullanıcı etkileşimini yöneten bir React bileşenidir. Supabase veri yapısındaki `Product` nesnesini kullanarak ürün görselini, marka ikonunu ve `formatCurrency` ile yerelleştirilmiş fiyatı gösterir; ayrıca `useCart` hook'u aracılığıyla sepete ekleme işlevselliği sunar. Next.js `Link` bileşeni ile ürün detay sayfasına yönlendirme sağlarken, grid veya liste gibi farklı düzen seçeneklerini destekler.

---



---

## FONKSİYON DETAYLARI

---

## INTERFACES

### ProductCardProps
- `product: Product`
- `onQuickView?: (product: Product) => void`
- `highlightFeatured?: boolean`
- `layout?: 'grid' | 'list'`
- `priority?: boolean`
- `hidePrice?: boolean`
- `compact?: boolean`

---

## SABİTLER
- **ProductCard** (call) — `React.memo(function ProductCard({
  product,
  layout = 'grid',
  priority...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ProductCard.tsx::(e) => { ... }
- **params**: e — `React.MouseEvent` nesnesi, tıklama olayını temsil eder
- **ic_degiskenler**:
  - `e` — olay nesnesi; `preventDefault()` ve `stopPropagation()` metodlarıyla varsayılan davranış ve olay yayılımı durdurulur
  - `product` — dışarıdan kapalı (closure) olarak gelen `Product` nesnesi; `addToCart` fonksiyonuna eklenmek üzere gönderilir
  - `addToCart` — `useCart` hookundan alınan fonksiyon; verilen `product`ı alışveriş sepetine ekler
- **Dönüş**: yok (fonksiyon yan etki olarak `addToCart` çağrısı yapar)

---

## NODE ID STANDARD

  file: src\components\ProductCard.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gold-accent`, `bg-light-gray/30`, `bg-light-gray/50`, `bg-primary-navy`, `bg-white`, `bg-white/90`, `border-light-gray`, `border-t`, `group-hover:bg-light-gray/50`, `group-hover:text-primary-navy`, `hover:bg-secondary-blue`, `sm:text-lg`, `text-base`, `text-industrial-gray`, `text-lg`
- **Layout:** `absolute`, `backdrop-blur-sm`, `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-3`, `h-11`, `h-28`, `h-9`, `h-full`, `hover:shadow-hvac-lg`, `hover:shadow-lg`, `items-baseline`
- **Varyant/Responsive:** `:`, `active:`, `focus-visible:`, `group-hover:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${compact`, `:`, `active:scale-95`, `aspect-square`, `border`, `duration-300`, `duration-500`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `group`