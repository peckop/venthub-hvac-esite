---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsDiscoveryView.tsx
skeleton_hash: 66b42e91163e0f88
entity_hashes:
  func:ProductsDiscoveryView: 7a88740fc2125f5b
  overview: 76bae810c86fe269
  style_tokens: 8ab4f603b12ea696
generated_at: 2026-08-13T08:56:46Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunda ürün keşif deneyimini sunan üst düzey React görünüm bileşenidir. Dış kaynaklardan gelen ürün aileleri listesini, toplam sayıyı ve yükleme durumunu props olarak alarak kullanıcıya dinamik bir arayüz sunar. Bileşen, verinin durumuna göre yükleme göstergesi veya ürün listesi gibi farklı arayüz katmanlarını yönetmekle sorumludur.

## Fonksiyon Grupları
### Ürün Keşif Görünümü
Modülün tek ve temel bileşenini tanımlar. Aldığı props verilerine bağlı olarak yükleme, boş durum veya ürün listesi arayüzlerinden uygun olanını render eder.
- ProductsDiscoveryView

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React fonksiyonel bileşeni olup dışarıdan prop'lar aracılığıyla veri alır. Aşağıdaki varsayımlar fonksiyon imzasından çıkarılmıştır.

[Aksiyom 1]: Eğer `total` parametresi sağlanmazsa, modülün davranışı tanımsızdır (default değeri yoktur ve bileşen içeriği `families` dizisini `total` ile eşleştirmek üzere tasarlanmış olabilir).

[Aksiyom 2]: Eğer `families` boş dizi (`[]`) olarak kalırsa ve `isLoading` `false` ise, bileşenin boş durum (empty state) arayüzü göstermesi beklenir — ancak boş durum mesajının içeriği bilinmiyor.

[Aksiyom 3]: Eğer `isLoading` `true` ise, modülün `families` ve `total` değerlerinden bağımsız olarak bir yükleme göstergesi (skeleton/spinner) render etmesi beklenir.

[Aksiyom 4]: Eğer `isLoading` `false` ve `families` dolu ise, modülün `CategoryOrbitCarousel` bileşenini çağırarak ürün ailelerini göstermesi beklenir.

[Aksiyom 5]: Eğer `total` bir sayısal değer olarak verilmezse veya `undefined` kalırsa, `families.length` ile `total` arasındaki tutarsızlık bileşenin doğru çalışmasını engelleyebilir — `total`'in `families` uzunluğuyla uyumlu olması beklenir ancak bu uyumun zorunluluğu bilinmiyor.

[Aksiyom 6]: Eğer `families` bir dizi (`Array`) dışındaki bir tipte gelirse, `CategoryOrbitCarousel` bileşeninin hata vermesi olasıdır — `families`'in her elemanının `CategoryOrbitCarousel` tarafından beklenen shape'e uygun olması gerekir ancak bu shape bilinmiyor.

[Aksiyom 7]: Modül, `total` parametresinin `families.length`'den büyük, eşit veya farklı olabileceğini varsayabilir (sayfalama/toplam ayrımı olabilir) — ancak hangi durumda hangi değerin geçerli olduğu bilinmiyor.

---

## FONKSİYON DETAYLARI

### ProductsDiscoveryView

**Ne yapar**: Ürün keşif ve araştırma sayfasını görüntüleyen ana React bileşenidir. Kullanıcılara ürün ailelerini filtreleme, arama ve keşfetme imkanı sunar. Bu bileşen, ürünlerin listelendiği ve toplam sayının gösterildiği bir arayüz sağlar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır ve `ProductsDiscoveryViewProps` arayüzünden türetilmiş props'ları kabul eder. `families` dizisi varsayılan olarak boş bir dizi ile başlar, bu sayede ürün aileleri henüz yüklenmemiş olsa bile bileşen hataya düşmeden render edilebilir. `isLoading` parametresinin `false` varsayılan değeri sayesinde, yükleme durumu olmadığında bileşen normal görünümünü korur. Bileşen, iç mantığında ürün verilerini işleyerek kullanıcıya sunar.

**Parametreler**:
- families: `ProductFamily[]` — Görüntülenecek ürün ailelerinin dizisi. Varsayılan değeri boş dizi (`[]`) olup, ürün kategorilerini ve ailelerini temsil eder.
- total: `number` — Toplam ürün sayısını belirtir. Bulunan veya görüntülenen ürünlerin toplam sayısını gösterir.
- isLoading: `boolean` — Verilerin yüklenme durumunu belirtir. `true` olduğunda yükleniyor göstergesi gösterilir, `false` ise normal içerik görüntülenir. Varsayılan değeri `false`'dur.

**Dönüş**: `React.FC<ProductsDiscoveryViewProps>` — React fonksiyonel bileşeni olarak ürün keşif arayüzünü render eder. `ProductsDiscoveryViewProps` tipindeki props'ları kullanarak JSX içeriği döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../components/products/FamilyCard::FamilyCard
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/type-converters::type { DomainCategory }
- import: @/types/ui-models::type { FamilyListItem }
- import: framer-motion::AnimatePresence
- import: framer-motion::motion
- import: lucide-react::LayoutGrid
- import: lucide-react::List
- import: next/dynamic::dynamic
- import: next/navigation::useRouter
- import: react::React
- import: react::Suspense
- import: react::useCallback
- import: react::useRef
- import: react::useState

---

## INTERFACES

### ProductsDiscoveryViewProps
- `initialCategories?: DomainCategory[]`
- `families?: FamilyListItem[]`
- `total?: number`
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

### [N1_NASIL] AST Pointer: ProductsDiscoveryView.tsx::Placeholder
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `N/A` — Yükleme placeholder'ı, harici değişken kullanmaz
- **Dönüş**: JSX (Loading nebula animasyonu)

### [N2_NASIL] AST Pointer: ProductsDiscoveryView.tsx::ProductsDiscoveryView
- **params**: `{ families = [], total, isLoading = false }`
- **ic_degiskenler**:
  - `router` — useRouter() hook'undan yönlendirme nesnesi, sayfa geçişleri için kullanılır
  - `t` — useI18n() hook'undan çeviri fonksiyonu, metinleri lokalize eder
  - `Routes` — useLocalizedRoutes() hook'undan lokalize URL yapısı
  - `viewMode` — useState ile yönetilen görünüm modu ('grid' veya 'list'), ürün yerleşimini belirler
  - `productsRef` — useRef ile products grid bölümüne referans, scroll/animasyon için kullanılır
  - `handleSubcategorySelect` — useCallback ile tanımlanan alt kategori seçim işleyicisi
- **Dönüş**: JSX (Ürün keşif sayfası, CategoryOrbitCarousel, animasyonlu ürün grid'i)

### [N3_NASIL] AST Pointer: ProductsDiscoveryView.tsx::handleSubcategorySelect
- **params**: `(categorySlug: string, subcategorySlug?: string)`
- **ic_degiskenler**:
  - `router` — outer scope'tan closure ile erişilen yönlendirme nesnesi
  - `Routes` — outer scope'tan closure ile erişilen lokalize URL yapısı
- **Dönüş**: yok (yan etki: router.push ile yönlendirme yapar)

### [N4_NASIL] AST Pointer: ProductsDiscoveryView.tsx::FamilyCardMapper
- **params**: `(family, index)`
- **ic_degiskenler**:
  - `ESTIMATED_3D_ITEMS` — 3D animasyon beklenen ürün sayısı sabiti (8)
  - `TOTAL_3D_DURATION` — toplam 3D animasyon süresi (sabitlerden hesaplanır)
  - `GRID_ENTRY_DELAY` — grid giriş gecikme süresi (3D süresinin %60'ı)
  - `isInitialView` — ilk ekran görünümü kontrolü (index < 12)
- **Dönüş**: JSX (motion.div ile FamilyCard animasyonlu sarımı)

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