---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx
skeleton_hash: cc1ee378f0ab56e9
entity_hashes:
  func:FeaturedCommercialBlocks: 1889811721e866db
  func:normalizeImageUrl: e7ff2d52e57ce97b
  overview: 053f00b1dc0bcc57
  style_tokens: 0fba0ab3cddfc2f6
generated_at: 2026-05-28T22:35:59Z
---

## Genel Bakış
Bu modül, ana sayfada öne çıkan ticari ürünlere ait görsel ve bilgi bloklarını sergileyen bir React bileşenini tanımlar. Görsel URL'lerinin güvenli bir şekilde işlenmesini sağlayan bir yardımcı fonksiyon ile birlikte, ürün listesini alıp kullanıcıya düzenli bir şekilde sunar.

## Fonksiyon Grupları
### Yardımcı İşlevler
Görsel adreslerinin boş veya geçersiz olma durumlarını temizleyerek, kullanıma hazır standart bir URL formatı üretir.
- normalizeImageUrl

### Ana Bileşen
Ürün verisini alarak, öne çıkan ticari ürünleri görsel ve ilgili bilgileriyle birlikte düzenler ve ekranda render eder; başlangıç verisi eksikse varsayılan boş bir liste kullanır.
- FeaturedCommercialBlocks

---

## AXIOMS – Mimari Varsayımlar

Bu modül için doğrulanabilir mimari aksiyomlar, yalnızca fonksiyon imzalarından çıkarılmıştır.

**[Aksiyom 1]**: Eğer `initialProducts` parametresi çağrıda sağlanmazsa, varsayılan olarak boş dizi (`[]`) kullanılır.

**[Aksiyom 2]**: Eğer `normalizeImageUrl` fonksiyonuna `null` veya `undefined` değerinde bir `url` verilirse, fonksiyon bu geçersiz girişi işleyebilmelidir (fonksiyon imzası bu türleri kabul edecek şekilde tanımlıdır).

**[Aksiyom 3]**: Eğer `FeaturedCommercialBlocks` bileşeni hiç argüman olmadan (`FeaturedCommercialBlocks()`) çağrılırsa, `initialProducts` otomatik olarak `[]` olur ve bileşen bu değerle çalışır.

---

## FONKSİYON DETAYLARI

### normalizeImageUrl

**Ne yapar**: Verilen URL değerini standart ve kullanılabilir bir forma dönüştürür. Boş, undefined veya geçersiz URL durumlarında varsayılan bir placeholder görsel döndürerek bileşenlerin hata almasını engeller.

**Nasıl yapar**: Fonksiyon, gelen url parametresinin null veya undefined olup olmadığını kontrol eder. Eğer geçerli bir URL varsa bunu doğrudan döndürür. Boş veya tanımsız durumlarda ise önceden tanımlanmış varsayılan bir görsel yolunu string olarak geri verir.

**Parametreler**:
- `url`: `string | null | undefined` — Normalize edilecek görsel URL'si. Null veya undefined olabilir.

**Dönüş**: `string` — Normalize edilmiş geçerli bir görsel URL'si döndürür.

### FeaturedCommercialBlocks
**Ne yapar**: Başlangıç ürün listesi ile öne çıkan ticari blokları gösteren bir React bileşenidir.  
**Nasıl yapar**: `initialProducts` prop'u üzerinden ürün verisini alır, içeriği render eder; varsayılan olarak boş bir dizi kullanılır.  
**Parametreler**:  
- initialProducts: [] — Gösterilecek ürünlerin listesi; varsayılan değer boş dizidir.  
**Dönüş**: React.FC<FeaturedCommercialBlocksProps> — Özellikleri alarak UI'ı oluşturan fonksiyonel bileşen.

---

## INTERFACES

### FeaturedCommercialBlocksProps
- `initialProducts?: Product[]`
- `initialCategories?: Category[]`

---

## TYPE ALIASES

### CommercialTab
```typescript
type CommercialTab = 'featured' | 'newArrivals' | 'bestSellers'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/FeaturedCommercialBlocks.tsx::normalizeImageUrl
- **params**: (url: string | null | undefined)
- **ic_degiskenler**: 
  - `trimmedUrl` — trimmed version of url after removing whitespace
- **Dönüş**: string

### [N2_NASIL] AST Pointer: src/components/home/FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks
- **params**: ({ initialProducts = [] })
- **ic_degiskenler**: 
  - `t` — translation function from useI18n
  - `activeTab` — currently selected tab key ('featured', 'newArrivals', 'bestSellers')
  - `setActiveTab` — setter function to change activeTab state
  - `productsByTab` — object mapping tab keys to product arrays (featured, newArrivals, bestSellers)
  - `activeProducts` — array of products for the currently active tab
- **Dönüş**: JSX.Element (React component)

### [N3_NASIL] AST Pointer: src/components/home/FeaturedCommercialBlocks.tsx::useMemoCallback
- **params**: ()
- **ic_degiskenler**: 
  - `featured` — array of up to 4 featured products, fallback to first 4 if none flagged
  - `newArrivals` — array of up to 4 products sorted by creation date descending
  - `bestSellers` — array of up to 4 products, fallback to first 4 if slice empty
- **Dönüş**: { featured: Product[], newArrivals: Product[], bestSellers: Product[] }

### [N4_NASIL] AST Pointer: src/components/home/FeaturedCommercialBlocks.tsx::TabButton
- **params**: (tab)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (button element)

### [N5_NASIL] AST Pointer: src/components/home/FeaturedCommercialBlocks.tsx::ProductItem
- **params**: (product, idx)
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element (motion.wrapped ProductCard)

---

## NODE ID STANDARD

  file: src\components\home\FeaturedCommercialBlocks.tsx
  function: src\components\home\FeaturedCommercialBlocks.tsx::normalizeImageUrl
  function: src\components\home\FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks

---

## DISA AKTARILANLAR (EXPORTS)
  export: FeaturedCommercialBlocks
  export: normalizeImageUrl

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/10`, `bg-slate-200/50`, `bg-slate-900`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-cyan-500/10`, `border-slate-200`, `border-white/10`, `border-white/5`, `hover:bg-cyan-400`, `hover:text-slate-900`, `sm:text-6xl`, `text-4xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `gap-1`, `gap-10`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-1.5`, `h-32`
- **Varyant/Responsive:** `:`, `active:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `active:scale-95`, `activeTab`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-light`, `grayscale`