---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ProductCard.tsx
skeleton_hash: a9c5f54f770565d8
generated_at: 2026-05-23T22:19:05Z
---

## Genel Bakış
ProductCard.tsx, ürün bilgilerini görsel olarak sunan bir React bileşenidir. Supabase üzerinden gelen Product verisini kullanarak ürün adı, fiyatı, marka simgesi ve görüntüsünü gösterer, useCart hook’u ile sepete ekleme işlemini ve useI18n/formatCurrency ile uluslararasılaştırılmış fiyat formatlamasını entegre eder. Ayrıca, ürün detay sayfasına yönlendirme için Next.js Link bileşeni kullanılır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



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

### [N1_NASIL] AST Pointer: src/components/ProductCard.tsx::handleClick
- **params**: (e: React.MouseEvent)
- **ic_degiskenler**:
  - `e` — React.MouseEvent nesnesi; tıklama olayıdır, preventDefault() ve stopPropagation() çağrılarak varsayılan davranış engellenir ve olay yayılımı durdurulur.
  - `product` — Eklenecek ürün nesnesi (Product tipi); addToCart fonksiyonuna argüman olarak geçirilir.
  - `addToCart` — useCart hookundan alınan fonksiyon; ürünü sepeteklemek için çağrılır.
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\ProductCard.tsx