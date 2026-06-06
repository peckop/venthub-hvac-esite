---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ProductCard.tsx
skeleton_hash: 3de726cd21c481ab
entity_hashes:
  overview: 4ebb1c4f22471a6d
  style_tokens: 19c7d9ec430fc71d
generated_at: 2026-06-06T21:55:05Z
---

## Genel Bakış
Bu modül, HVAC ürün kartlarını render eden bir React bileşenidir. `Product` nesnesinden gelen verileri (görsel, marka, fiyat) alır, yerelleştirilmiş fiyat gösterimi ve sepete ekleme işlevselliği sunar. Next.js `Link` ile ürün detay sayfasına yönlendirme sağlar ve `grid`/`list` olmak üzere iki farklı düzen seçeneğini destekler.

Bu bileşen以下 bağımlılıklar kullanır: `Product` türü, `BrandIcon`, `VentImage`, `useCart` hook'u, `useI18n` hook'u ve `formatCurrency` yardımcı fonksiyonu. `onQuickView` prop'u ile hızlı bakış işlevselliği de desteklenir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementation) verilmemiştir. Sağlanan bilgiler仅有 dosya yolu ve modül sabitleri olup, mimari varsayımların türetilmesi için gerekli olan **fonksiyon gövdesi** bulunmamaktadır.

---

**Not:** Mimari varsayımlar (axioms), yalnızca fonksiyon gövdesinden (implementation code) üretilebilir. Dosya yolu, modül adı veya eski doküman içeriği gibi kaynaklardan çıkarım yapılması güvenilir değildir. 

`ProductCard` bileşeninin gerçek implementasyon kodu (React component body) sağlandığında, aşağıdaki alanlarda aksiyomlar çıkarılabilir:

- Props interface zorunlulukları (hangi alanların `undefined` olamayacağı)
- `useCart` hook'unun dönüş yapısı varsayımları
- `formatCurrency` fonksiyonunun giriş koşulları
- `Product` nesnesinin minimum gerekli alanları
- `Link` bileşenine geçilen URL formatı gereksinimleri

**Öneri:** Lütfen `ProductCard.tsx` dosyasının **fonksiyon gövdesini** (component implementation) paylaşın.

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

### [N1_NASIL] AST Pointer: ProductCard.tsx::onClickAddToCart
- **params**: `(e: React.MouseEvent)` — React click event nesnesi, preventDefault ve stopPropagation metotlarını içerir
- **ic_degiskenler**: []
- **Dönüş**: yok (event handler fonksiyonu, return değeri yok)

**Notlar**:
- Fonksiyon `e.preventDefault()` ile varsayılan tarayıcı olayını engeller
- Fonksiyon `e.stopPropagation()` ile olayın yukarı doğru yayılmasını engeller
- Fonksiyon `addToCart(product)` çağrısı ile ürün sepete eklenir
- `addToCart` ve `product` değişkenleri dış scope'dan closure ile gelir (fonksiyon gövdesinde tanımlı değildir)

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