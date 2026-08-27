---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx
skeleton_hash: 05cfca4fb86aaf84
entity_hashes:
  func:FeaturedCommercialBlocks: 1889811721e866db
  overview: a6f2b84b89640427
  style_tokens: ff89a6880a24812d
generated_at: 2026-08-15T06:32:06Z
---

## Genel Bakış
`FeaturedCommercialBlocks`, ana sayfada öne çıkan ticari HVAC ürünlerini (klima, havalandırma üniteleri vb.) görselleri ve temel bilgileriyle birlikte sergileyen bir React bileşenidir. Verilen ürün listesini işleyerek eksik veya geçersiz görselleri temizler ve kullanıcılara düzenli bir görünüm sunar.

## Fonksiyon Grupları
### Öne Çıkan Ürünler Görünümü
Ana sayfada ticari ürün bloklarını grid veya kart düzeninde listeler; ürün verisi sağlanmazsa boş liste ile çalışarak bileşenin stabil kalmasını sağlar.
- FeaturedCommercialBlocks

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayımlar, fonksiyon imzasından ve bileşenin doğasından türetilmiştir.

[Aksiyom 1]: Eğer `initialProducts` parametresi sağlanmazsa, bileşen boş bir dizi (`[]`) ile çalışır ve gösterilecek ürün bulunmadığında uygun boş durum (empty state) render etmelidir.

[Aksiyom 2]: Eğer `initialProducts` içindeki herhangi bir ürün nesnesi geçerli bir görsel URL'si içermiyorsa, o ürün için görsel temizleme/yardımcı işlev devreye girerek geçersiz görseller filtrelenmeli veya varsayılan bir görsel ile değiştirilmelidir.

[Aksiyom 3]: Eğer `initialProducts` bir dizi değilse (örn: `null`, `undefined`, veya farklı bir tipteyse), bileşen hata vermemeli; fonksiyon imzasındaki varsayılan değer (`[]`) devreye girerek stabil kalmalıdır.

---

**Not:** Bu modül için belirtilen fonksiyon imzası dışında, eşik değerleri veya ek kabul kriterlerine dair sayısal/alan-spesifik bilgi mevcut değildir. Görsel işleme mantığı fonksiyon gövdesinde tanımlı olup, burada yalnızca component seviyesindeki mimari varsayımlar belirtilmiştir.

---

## FONKSİYON DETAYLARI

### FeaturedCommercialBlocks
**Ne yapar**: Başlangıç ürün listesi ile öne çıkan ticari blokları gösteren bir React bileşenidir.  
**Nasıl yapar**: `initialProducts` prop'u üzerinden ürün verisini alır, içeriği render eder; varsayılan olarak boş bir dizi kullanılır.  
**Parametreler**:  
- initialProducts: [] — Gösterilecek ürünlerin listesi; varsayılan değer boş dizidir.  
**Dönüş**: React.FC<FeaturedCommercialBlocksProps> — Özellikleri alarak UI'ı oluşturan fonksiyonel bileşen.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../ProductCard::ProductCard
- import: @/hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/types/ui-models::type { Category, Product }
- import: @/utils/imageUtils::normalizeImageUrl
- import: framer-motion::AnimatePresence
- import: framer-motion::motion
- import: next/image::Image
- import: next/link::Link
- import: react::React
- import: react::useMemo
- import: react::useState

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

### [N1_NASIL] AST Pointer: `FeaturedCommercialBlocks.tsx`::FeaturedCommercialBlocks
- **params**: `{ initialProducts = [] }` — başlangıç ürünleri dizisi, varsayılan olarak boş dizi
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu, `useI18n()` hook'undan alınır, tüm metinler buna bağlıdır
  - `Routes` — lokalize edilmiş rota builder'ları, `useLocalizedRoutes()` hook'undan alınır; `Routes.products()` gibi çağrılar yapar
  - `activeTab` — `useState<CommercialTab>` ile yönetilen aktif sekme durumu, `'featured'` varsayılır; `setActiveTab` ile güncellenir
  - `productsByTab` — `useMemo` ile hesaplanan `{ featured, newArrivals, bestSellers }` objesi; her sekme için ayrı ürün listesi tutar
  - `activeProducts` — `productsByTab[activeTab]` erişimiyle elde edilen mevcut sekmedeki ürünler dizisi; hem kart grid'inde hem sidebar görselinde kullanılır
- **Dönüş**: JSX — bölüm header'ı, sekme navigasyonu, ürün kartı grid'i ve contextual sidebar içeren React section elementi

---

### [N2_NASIL] AST Pointer: `FeaturedCommercialBlocks.tsx`::productsByTab useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `featured` — `initialProducts` dizisinden `p.is_featured` filtresiyle ilk 4 ürün; boşsa `initialProducts.slice(0, 4)` fallback
  - `newArrivals` — `initialProducts` dizisinin kopyası, `created_at` alanına göre azalan sırada sıralanıp ilk 4 ürün
  - `bestSellers` — `initialProducts.slice(4, 8)` ile 5-8. ürünler; boşsa `initialProducts.slice(0, 4)` fallback
- **Dönüş**: `{ featured, newArrivals, bestSellers }` — her sekme için filtrelenmiş/sıralanmış ürün listelerini içeren obje

---

### [N3_NASIL] AST Pointer: `FeaturedCommercialBlocks.tsx`::tabOrder.map callback
- **params**: `tab` — mevcut sekme tanımlayıcı string'i (ör. `'featured'`, `'new'`, `'bestsellers'`)
- **ic_degiskenler**: yok (closure'dan `activeTab`, `t`, `setActiveTab` kullanılır)
- **Dönüş**: JSX — `role="tab"` nitelikli `<button>` elementi; aktif sekme ise `motion.div` ile animasyonlu arka plan glow efekti eklenir

---

### [N4_NASIL] AST Pointer: `FeaturedCommercialBlocks.tsx`::activeProducts.map callback
- **params**: `product` — `Product` tipinde ürün nesnesi; `product.id`, `product.name`, `product.is_featured`, `product.created_at` alanlarına erişilir, `ProductCard`'a geçirilir; `idx` — dizi indeksi, animasyon gecikme hesabında `idx * 0.1` olarak kullanılır
- **ic_degiskenler**: yok (closure'dan `ProductCard`, `motion.div` kullanılır)
- **Dönüş**: JSX — `motion.div` sarmalayıcısı içinde `<ProductCard product={product} compact hidePrice />` component'i; `key={product.id}`, `delay: idx * 0.1` animasyonu ile

---

## NODE ID STANDARD

  file: src\components\home\FeaturedCommercialBlocks.tsx
  function: src\components\home\FeaturedCommercialBlocks.tsx::FeaturedCommercialBlocks

---

## DISA AKTARILANLAR (EXPORTS)
  export: FeaturedCommercialBlocks

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
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `active:scale-95`, `activeTab`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `content-auto-showcase`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-light`