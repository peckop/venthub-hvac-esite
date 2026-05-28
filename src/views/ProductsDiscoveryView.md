---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: 350fc3508bede109
entity_hashes:
  func:ProductsDiscoveryView: 6785edea688433d2
  overview: 494d008ee0e13f8f
  style_tokens: 17792abc2680c491
generated_at: 2026-05-28T22:40:25Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun ürün keşif bölümünü yöneten React görünüm bileşenidir. Kullanıcıların platformdaki tüm ürünleri keşfetmesini sağlayan arayüz katmanını oluşturur, dışarıdan iletilen ürün listesi ve yükleme durumu verileriyle görünümü dinamik olarak çalıştırır.

## Fonksiyon Grupları
### Ana Ürün Keşif Arayüz Bileşeni
Modülün tüm temel sorumluluğunu yerine getiren, ürün keşif görünümünü oluşturan ana React bileşenidir. Dışarıdan alınan girdilerle arayüzün gerektiği gibi görüntülenmesini sağlar.
- ProductsDiscoveryView

---



---

## FONKSİYON DETAYLARI

### ProductsDiscoveryView
**Ne yapar**: Bu fonksiyon, ürünlerin keşfedilmesi için kullanılan bir React bileşenidir. Kullanıcıya ürün listesini sunar ve veri yüklenme durumunu gösterir.

**Nasıl yapar**: Fonksiyon, gelen products ve isLoading parametrelerini kullanarak bir ürün keşif arayüzü render eder. isLoading true olduğunda yükleme göstergesi sunar, products dizisi dolu olduğunda ise ürünleri listeleyerek kullanıcıya sunar. Bileşen, varsayılan olarak boş bir dizi ve false yükleme durumu ile başlatılabilir.

**Parametreler**:
- products: object[] — Görüntülenecek ürünlerin dizisi. Her bir ürün nesnesi ürün bilgilerini içerir. Varsayılan olarak boş bir dizi kullanılır.
- isLoading: boolean — Verinin yüklenip yüklenmediğini belirten durum bayrağı. true olduğunda yükleme animasyonu gösterilir. Varsayılan olarak false değerini alır.

**Dönüş**: React.FC<ProductsDiscoveryViewProps> — React fonksiyonel bileşeni olarak products dizisini ve isLoading durumunu işleyen bir arayüz bileşeni döndürür.

---

## INTERFACES

### ProductsDiscoveryViewProps
- `initialCategories?: DomainCategory[]`
- `products?: Product[]`
- `isLoading?: boolean`

---

## TYPE ALIASES

### ViewMode
```typescript
type ViewMode = 'grid' | 'list'
```

---

## SABİTLER
- **CategoryOrbitCarousel** (call) — `dynamic(
    () => import('../components/products/CategoryOrbitCarousel'),
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\ProductsDiscoveryView.tsx::(yüklenme_gösterimi)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (iç değişken yok — sadece JSX döndürür)
- **Dönüş**: JSX element (yüklenme animasyonu için nebula glow placeholder div)

### [N2_NASIL] AST Pointer: src\views\ProductsDiscoveryView.tsx::ProductsDiscoveryView
- **params**: ({ products = [], isLoading = false })
- **ic_degiskenler**:
  - `router` — sayfa yönlendirme için useRouter hook'undan gelen yönlendirici nesnesi
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu (i18n metinleri için)
  - `viewMode` — görünüm modunu (grid/list) tutan state, `useState<ViewMode>('grid')` ile başlatılır
  - `productsRef` — ürün grid section'ına referans veren ref nesnesi (`useRef<HTMLDivElement>(null)`)
  - `handleSubcategorySelect` — alt kategori seçildiğinde çağrılan callback fonksiyonu (useCallback ile sarılmış)
- **Dönüş**: JSX (ürün keşif sayfası ana yapısı — kategori carousel, ürün grid, görünüm araç çubukları, animasyonlu ürün kartları)

### [N3_NASIL] AST Pointer: src\views\ProductsDiscoveryView.tsx::handleSubcategorySelect
- **params**: (categorySlug: string, subcategorySlug?: string)
- **ic_degiskenler**:
  - (iç değişken yok — doğrudan parametreleri ve router'ı kullanır)
- **Dönüş**: yok (sadece yan etki: router.push ile sayfa yönlendirmesi yapar)

### [N4_NASIL] AST Pointer: src\views\ProductsDiscoveryView.tsx::(ürün_haritalama_fonksiyonu)
- **params**: (product: Product, index: number)
- **ic_degiskenler**:
  - `ESTIMATED_3D_ITEMS` — 3D animasyon beklenecek tahmini ürün sayısı sabiti (8)
  - `TOTAL_3D_DURATION` — 3D animasyonun toplam süresi (ESTIMATED_3D_ITEMS * 0.18 + 1.2)
  - `GRID_ENTRY_DELAY` — grid giriş animasyonu gecikmesi (TOTAL_3D_DURATION * 0.6)
  - `isInitialView` — ürünün ilk ekran Görünümünde olup olmadığını belirleyen boolean (index < 12)
- **Dönüş**: JSX (motion.div içinde ProductCard bileşeni, animasyonlu geçiş efektleri ile)

---

## NODE ID STANDARD

  file: src\views\ProductsDiscoveryView.tsx
  function: src\views\ProductsDiscoveryView.tsx::ProductsDiscoveryView

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsDiscoveryView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-section`, `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/5`, `bg-slate-50`, `bg-slate-50/50`, `bg-surface-darker`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-white/5`, `hover:text-slate-600`, `md:text-4xl`, `text-3xl`, `text-center`
- **Layout:** `flex`, `flex-col`, `flex-wrap`, `gap-3`, `gap-6`, `grid`, `grid-cols-1`, `h-16`, `h-300px`, `h-8`, `items-center`, `items-start`, `justify-between`, `justify-center`, `lg:grid-cols-3`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `$`, `${isLoading`, `${viewMode`, `:`, `===`, `animate-pulse`, `blur-100`, `border`, `capitalize`, `duration-300`, `duration-700`, `ease-hvac-ease`, `font-bold`, `font-extrabold`, `font-medium`