---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FeaturedCommercialBlocks.tsx
skeleton_hash: adc9bd4df4fca87e
entity_hashes:
  func:FeaturedCommercialBlocks: 1889811721e866db
  overview: cdfdca949aa78f1f
  style_tokens: 0fba0ab3cddfc2f6
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, ana sayfada öne çıkan ticari ürünleri (örneğin klima, havalandırma üniteleri gibi) görselleri ve temel bilgileriyle birlikte sergileyen bir React bileşenidir. Gelen ürün verisini işleyerek, eksik veya geçerli görsel adreslerini temizleyen yardımcı bir işlev ile birlikte kullanıcıya düzgün bir görünüm sunar.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Verilen başlangıç ürün listesine göre öne çıkan ticari ürün bloklarını düzenler ve kullanıcıya sunar; veri sağlanmazsa boş bir liste ile çalışarak bileşenin stabil kalmasını sağlar.
- FeaturedCommercialBlocks

### Görsel İşleme Yardımcıları
Ürün nesnelerindeki görsel URL adreslerini kontrol eder; boş, eksik veya geçerli olmayan değerleri temizleyerek bileşenin kullanabileceği standart ve güvenli bir URL formatı üretir.
- normalizeImageUrl

---

## AXIOMS – Mimari Varsayımlar

Bu modül, girdi olarak verilen `initialProducts` değerinin bir dizi (Array) yapısında olmasını ve her elemanın ürün nesnesi (object) formatında olmasını bekler.

[Aksiyom 1]: Eğer `initialProducts` parametresi bir dizi (Array) değilse, bileşen render sürecinde hata verir veya TypeError ile karşılaşır.

[Aksiyom 2]: Eğer `initialProducts` boş dizi (`[]`) olarak sağlanırsa bileşen stabil kalır ve boş/hiç ürün içermeyen bir görünüm render eder.

[Aksiyom 3]: Eğer `initialProducts` içindeki ürün nesnelerinin görsel alanı (`image`/`imageURL` gibi bir alan) geçerli bir URL içermiyorsa veya hiç yoksa, bileşen varsayılan/bos bir görsel gösterir veya görseli atlar; bileşenin çökmesine yol açmaz.

---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: `src/components/home/FeaturedCommercialBlocks.tsx`::FeaturedCommercialBlocks
- **params**: `{ initialProducts = [] }` — destructured prop, `initialProducts` başlangıç ürün listesi, boş dizi fallback'li
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan dönen çeviri fonksiyonu, `t('home.featuredCommercial.eyebrow')` gibi anahtarlarla string çevirisi yapar
  - `activeTab` — `useState<CommercialTab>` state değişkeni, şu anki aktif sekmeyi tutar, varsayılan `'featured'`
  - `setActiveTab` — `activeTab` state'ini güncelleyen setter fonksiyonu, tab butonlarının `onClick` handler'ında çağrılır
  - `productsByTab` — `useMemo` ile hesaplanan nesne, `{ featured, newArrivals, bestSellers }` anahtarlarına sahip Product dizilerini barındırır, `[initialProducts]` bağımlılığıyla yeniden hesaplanır
  - `activeProducts` — `productsByTab[activeTab]` erişimiyle elde edilen Product dizisi, mevcut sekmedeki ürünleri temsil eder; hem ürün kartları grid'inde `.map()` ile hem de sidebar'da `activeProducts[0]?.image_url` ve `activeProducts[0]?.name` erişimiyle kullanılır
- **Dönüş**: JSX — `<section>` wrapper'ı içinde header, tab butonları, ürün grid'i ve sidebar barındıran React elementi

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
- **Yardımcı Sınıflar:** `$`, `:`, `===`, `active:scale-95`, `activeTab`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-light`, `grayscale`