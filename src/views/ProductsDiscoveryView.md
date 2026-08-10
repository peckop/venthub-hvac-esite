---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: 9208f5b30d054206
entity_hashes:
  func:ProductsDiscoveryView: 6785edea688433d2
  overview: d4f91980915340a3
  style_tokens: 8ab4f603b12ea696
generated_at: 2026-06-19T20:51:24Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunun ana ürün keşif sayfasını oluşturan React görünüm bileşenidir. Temel sorumluluğu, dışarıdan gelen ürün listesini ve yükleme durumunu yöneterek kullanıcıya dinamik bir arayüz sunmaktır. Bileşen, verinin hazır olma durumuna göre yükleme göstergesi, boş durum mesajı veya ürün listesi gibi farklı arayüzleri render eder.

## Fonksiyon Grupları
### Ana Ürün Keşif Arayüzü
Modülün tek ve temel bileşenini oluşturur. Dışarıdan iletilen `products` ve `isLoading` verilerine bağlı olarak, kullanıcıya ürünleri CategoryOrbitCarousel aracılığıyla sunar veya yükleme/boş durum arayüzlerini gösterir.
- ProductsDiscoveryView

### Dış Bağımlılıklar ve Mimari Bağlam
Bileşen, `CategoryOrbitCarousel` iç angebenen bileşene güçlü bir bağımlılık gösterir. Bu, bileşenin veri sunum mantığını ayrı bir görünüme devrettiğini ve modülün kendi içinde veri işlevselliğinden ziyade arayüz orkestasyonuna odaklandığını gösterir. Bileşen, props aracılığıyla dış veriye (ürün listesi) ve durum yönetimine (yükleniyor bayrağı) tamamen açıktır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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

## İTHALATLAR (IMPORTS)
- import: ../components/ProductCard::ProductCard
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/type-converters::type { DomainCategory }
- import: @/types/ui-models::type { Product }
- import: framer-motion::AnimatePresence
- import: framer-motion::motion
- import: lucide-react::LayoutGrid
- import: lucide-react::List
- import: next/dynamic::dynamic
- import: next/navigation::useRouter
- import: react::React
- import: react::useCallback
- import: react::useRef
- import: react::useState

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

### [N1_NASIL] AST Pointer: ProductsDiscoveryView.tsx::LoadingPlaceholder
- **params**: (parametre yok — anonim arrow function)
- **ic_degiskenler**:
  (iç değişken yok — doğrudan JSX döner)
- **Dönüş**: JSX — loading durumunda gösterilen nebula glow placeholder div; spinner yerine animasyonlu blur efekti sunar

---

### [N2_NASIL] AST Pointer: ProductsDiscoveryView.tsx::ProductsDiscoveryView
- **params**: `{ products = [], isLoading = false }` — `products`: Product dizisi, gösterilecek ürün listesi; `isLoading`: boolean, yükleme durumu
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; sayfa yönlendirmeleri için kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('products.allProductsTitle')`, `t('products.systemTotalPrefix')`, `t('products.itemsListed')`, `t('products.emptyTitle')`, `t('products.emptyDesc')`, `t('products.viewGrid')`, `t('products.viewList')` çağrılarında kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen localized route builder nesnesi; `Routes.category(categorySlug, subcategorySlug)` ve `Routes.category(categorySlug)` çağrılarıyla URL üretilir
  - `[viewMode, setViewMode]` — `useState<ViewMode>('grid')` state'i; mevcut görünüm modunu tutar ('grid' veya 'list')
  - `productsRef` — `useRef<HTMLDivElement>(null)` ref'i; `motion.section` elementine bağlanır, ürün grid konteynerine referans tutar
  - `handleSubcategorySelect` — `useCallback` ile tanımlanan callback fonksiyonu; `CategoryOrbitCarousel` bileşenine `onSubcategorySelect` prop'u olarak geçilir
  - `viewMode` — mevcut görünüm modu; `viewMode === 'grid'` koşuluyla grid/list CSS sınıfları ve buton aktiflik durumları belirlenir, `ProductCard` bileşenine `layout` prop'u olarak geçilir
  - `products.length` — ürün sayısını tutar; `products.length === 0 && !isLoading` koşuluyla boş durum gösterilir, `products.length` span içinde kullanıcıya ürün sayısı olarak sunulur
  - `products.map((product, index) => {...})` — ürün dizisi üzerinde döngü; her ürün için `ProductCard` bileşeni oluşturulur
  - `ESTIMATED_3D_ITEMS` — sabit `8`; tahmini 3D animasyonlu ürün sayısı
  - `TOTAL_3D_DURATION` — `ESTIMATED_3D_ITEMS * 0.18 + 1.2`; toplam 3D animasyon süresi (saniye)
  - `GRID_ENTRY_DELAY` — `TOTAL_3D_DURATION * 0.6`; grid giriş animasyonu gecikme süresi
  - `isInitialView` — `index < 12` boolean; ürünün ilk ekranda görünüp görünmediğini belirler, `GRID_ENTRY_DELAY + (index * 0.05)` delay hesaplamasında kullanılır
- **Dönüş**: JSX — tam sayfa ürün keşif görünümü; CategoryOrbitCarousel, başlık, view mode butonları, ürün grid/listesi veya boş durum mesajını render eder

---

### [N3_NASIL] AST Pointer: ProductsDiscoveryView.tsx::handleSubcategorySelect
- **params**: `(categorySlug: string, subcategorySlug?: string)` — `categorySlug`: kategori slug'ı; `subcategorySlug`: opsiyonel alt kategori slug'ı
- **ic_degiskenler**:
  (iç değişken yok — closure içinde `router` ve `Routes` yukarı kapsamdan kullanılır)
- **Dönüş**: yok — `router.push()` ile yan etki olarak sayfa yönlendirmesi yapar; `subcategorySlug` varsa `Routes.category(categorySlug, subcategorySlug)`, yoksa `Routes.category(categorySlug)` URL'ine yönlendirir

---

### [N4_NASIL] AST Pointer: ProductsDiscoveryView.tsx::mapCallback (product, index)
- **params**: `(product, index)` — `product`: Product nesnesi; `index`: ürünün dizideki indeksi
- **ic_degiskenler**:
  - `ESTIMATED_3D_ITEMS` — sabit `8`; tahmini 3D animasyonlu ürün sayısı
  - `TOTAL_3D_DURATION` — `ESTIMATED_3D_ITEMS * 0.18 + 1.2`; toplam 3D animasyon süresi hesaplanır
  - `GRID_ENTRY_DELAY` — `TOTAL_3D_DURATION * 0.6`; grid entry animasyonu için hesaplanan gecikme süresi
  - `isInitialView` — `index < 12` boolean; ürünün ilk ekranda olup olmadığını belirler; `true` ise `GRID_ENTRY_DELAY + (index * 0.05)` delay uygulanır, `false` ise `0` delay ile hemen görünür
- **Dönüş**: `motion.div` JSX — `ProductCard` bileşenini sarmalayan animasyonlu div; `product.id` key, `whileInView` ile viewport'a girince opacity ve y hareketi ile fade-in, `isInitialView` durumuna göre kademeli gecikme ile giriş animasyonu; `ProductCard`'a `product` ve `layout={viewMode}` prop'ları geçilir

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
- **Yardımcı Sınıflar:** `$`, `${isLoading`, `${viewMode`, `:`, `===`, `animate-pulse`, `blur-100`, `border`, `capitalize`, `content-auto`, `duration-300`, `duration-700`, `ease-hvac-ease`, `font-bold`, `font-extrabold`