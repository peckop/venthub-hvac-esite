---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: db654dec89ac12f8
entity_hashes:
  func:useCategoryGateway: 29cfd4eee9e628a7
  overview: 4b5fc3deabd6452f
generated_at: 2026-06-06T21:55:36Z
---

## Genel Bakış
Venthub HVAC projesindeki bu React hook modülü, kategori yönetimi süreçlerini merkezi ve tutarlı bir şekilde sağlamak amacıyla oluşturulmuştur. Başlangıçta verilen ana kategori, ilişkili ürünler ve alt kategori verilerini işleyerek, kategori verilerine erişim ve yönetim işlevlerini soyutlayan bir arayüz sunar. Bileşenlerin tekrarlayan veri yönetimi kodları yazmadan, kategori yapısını ve ilişkili ürünlerini dinamik olarak kullanmasını olanak tanır.

## Fonksiyon Grupları
### Kategori Verisi Yönetimi Hook'u
Modülün temel ve tek fonksiyonu olan bu hook, başlangıç parametreleriyle aldığı kategori, ürün ve alt kategori verilerini işleyerek, kategori hiyerarşisi ve ilişkili ürünlerle ilgili tüm state yönetimi ve iş mantığını yürütür.
- `useCategoryGateway`

---



---

## FONKSİYON DETAYLARI

### useCategoryGateway
**Ne yapar**: Bu React hook'u, bir kategori sayfası için gerekli tüm veri akışını ve durum yönetimini merkezi olarak yönetir. Kategori bilgilerini, alt kategorileri, ürünleri ve filtreleme/sıralama durumunu getirir, senkronize eder ve dışarıya sunar.

**Nasıl yapar**: Hook, URL parametrelerinden (`slug`, `parentSlug`) ve global kategori listesinden hedef kategoriyi belirler. İlk yükleme (SSR) durumunda `initialProducts` verisini kullanarak API isteğini atlar, sonraki isteklerde ise `getProductsEnriched` fonksiyonuyla Supabase veya store'dan ürünleri çeker. Filtre durumunu (`filters`) URL search params ile iki yönlü senkronize eder: URL'deki değişiklikleri state'e, state değişikliklerini URL'e yansıtır. Kategori verileri için optimize edilmiş harita (Map) yapısı oluşturarak hızlı arama sağlar.

**Parametreler**:
- `initialCategory?: DomainCategory | null` — İlk render'da (SSR Hydration) kullanılacak kategori nesnesi. Sunucu tarafında önceden hazırlanmış veriyi taşır.
- `initialProducts?: Product[]` — İlk render'da kullanılacak ürün dizisi. SSR Hydration sırasında API isteğini atlamak için kullanılır.
- `initialSubCategories?: DomainCategory[]` — İlk render'da kullanılacak alt kategoriler dizisi.

**Dönüş**: Aşağıdaki özellikleri içeren bir nesne döndürür:
- `category: DomainCategory | null` — URL'den veya initial değerden belirlenen hedef kategori.
- `parentCategory: DomainCategory | null` — Hedef kategorinin üst kategorisi (varsa).
- `subCategories: DomainCategory[]` — Hedef kategorinin alt kategorileri, sıralanmış olarak.
- `products: Product[]` — İlgili kategoriye ait ürünler dizisi.
- `loading: boolean` — Veri yükleme durumu.
- `filters: CategoryFilters` — Aktif filtre ve sıralama parametreleri.
- `updateFilters: (updates: Partial<CategoryFilters>) => void` — Filtreleri günceller ve URL'i senkronize eder.

---

## INTERFACES

### CategoryFilters
- `sortBy: string`
- `viewMode: 'grid' | 'list'`
- `priceRange: [number, number]`
- `selectedBrands: string[]`
- `airflowMin: string`
- `airflowMax: string`
- `pressureMin: string`
- `pressureMax: string`
- `noiseMax: string`
- `catSearch: string`

---

## SABİTLER
- **DEFAULT_FILTERS** (object) — `{
  sortBy: 'name',
  viewMode: 'grid',
  priceRange: [0, 1000000],
  sel...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway
- **params**: `initialCategory?: DomainCategory | null`, `initialProducts?: Product[]`, `initialSubCategories?: DomainCategory[]`
- **ic_degiskenler**:
  - `isMounted` — `useIsMounted()` hook'unun döndürdüğü ref, bileşenin mount olup olmadığını takip eder
  - `params` — `useParams()` ile alınan URL parametreleri (slug, subCategorySlug, categorySlug, parentSlug değerleri içerir)
  - `router` — `useRouter()` ile alınan Next.js router nesnesi, URL navigasyonu ve replace işlemleri için kullanılır
  - `pathname` — `usePathname()` ile alınan mevcut URL yolu, filtreleri URL'e yazarken kullanılır
  - `searchParams` — `useSearchParams()` ile alınan URL arama parametreleri, filtre değerlerini URL'den okumak için kullanılır
  - `globalCategories` — `useCategories()` context'inden alınan tüm kategori listesi, kategori haritalarını oluşturmak ve veri çekmek için kullanılır
  - `categoriesLoading` — `useCategories()` context'inden alınan yükleme durumu, kategorilerin hâlâ yüklenip yüklenmediğini belirtir
  - `slug` — URL'den çıkarılan kategori slug'ı, `params.slug || params.subCategorySlug || params.categorySlug` değerinden türetilir; kategori bulma mantığının anahtarıdır
  - `parentSlug` — URL'den çıkarılan üst kategori slug'ı, `params.parentSlug` veya `params.subCategorySlug` varsa `params.categorySlug` değerinden türetilir
  - `category` — `useState` ile tutulan mevcut `DomainCategory` nesnesi, başlangıç değeri `initialCategory` veya `null`'dır
  - `parentCategory` — `useState` ile tutulan üst kategori `DomainCategory` nesnesi, `null` ile başlar
  - `subCategories` — `useState` ile tutulan alt kategoriler dizisi `DomainCategory[]`, başlangıç değeri `initialSubCategories` veya boş dizi
  - `products` — `useState` ile tutulan ürün listesi `Product[]`, başlangıç değeri `initialProducts` veya boş dizi
  - `loading` — `useState` ile tutulan boolean, veri çekilme durumunu belirtir; `!!slug && !initialCategory` ile başlar
  - `filters` — `useState` ile tutulan `CategoryFilters` nesnesi, sıralama, görünüm modu, fiyat aralığı, seçili markalar, hava debisi, basınç, gürültü ve arama filtrelerini içerir
  - `isFirstRender` — `useRef(true)` ile tutulan ref, SSR hydration sırasında ilk render'da `initialProducts` kullanılıp kullanılmayacağını kontrol eder
- **Dönüş**: `{ category, parentCategory, subCategories, products, loading, filters, updateFilters }` nesnesi

---

### [N2_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → useEffect[0] callback
- **params**: yok
- **ic_degiskenler**:
  - `spBrands` — `searchParams.get('brands')` ile alınan virgülle ayrılmış marka listesi string'i, `null` olabilir
  - `viewModeParam` — `searchParams.get('viewMode')` ile alınan görünüm modu parametresi string'i
  - (setFilters içinde inline oluşturulan nesne):
    - `sortBy` — `searchParams.get('sortBy')` || `'name'` — sıralama kriteri
    - `viewMode` — `viewModeParam`'ın `'grid'` veya `'list'` olup olmadığına göre belirlenen görünüm modu
    - `priceRange` — `[Number(searchParams.get('priceMin')) || 0, Number(searchParams.get('priceMax')) || 1000000]` fiyat aralığı tuple'ı
    - `selectedBrands` — `spBrands` varsa `spBrands.split(',')` ile ayrıştırılmış marka dizisi, yoksa boş dizi
    - `airflowMin` — `searchParams.get('airflowMin')` || `''` — minimum hava debisi filtresi
    - `airflowMax` — `searchParams.get('airflowMax')` || `''` — maksimum hava debisi filtresi
    - `pressureMin` — `searchParams.get('pressureMin')` || `''` — minimum basınç filtresi
    - `pressureMax` — `searchParams.get('pressureMax')` || `''` — maksimum basınç filtresi
    - `noiseMax` — `searchParams.get('noiseMax')` || `''` — maksimum gürültü filtresi
    - `catSearch` — `searchParams.get('catSearch')` || `''` — kategori arama filtresi
- **Dönüş**: yok (yan etki: `setFilters` çağrısı ile filtreleri günceller)

---

### [N3_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → updateFilters
- **params**: `updates: Partial<CategoryFilters>`
- **ic_degiskenler**:
  - (setFilters callback içinde):
    - `prev` — `setFilters`'ın önceki filters state değeri
    - `newFilters` — `{ ...prev, ...updates }` ile oluşturulmuş güncellenmiş filtreler nesnesi
    - `urlParams` — `new URLSearchParams(window.location.search)` ile mevcut URL arama parametrelerinden oluşturulan URLSearchParams nesnesi
    - `newQueryString` — `urlParams.toString()` ile oluşturulan güncellenmiş URL sorgu string'i
- **Dönüş**: yok (yan etki: `setFilters` ve `router.replace` çağrısı ile filtreleri günceller ve URL'i değiştirir)

---

### [N4_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → useMemo[categoryMaps] callback
- **params**: yok (useMemo callback)
- **ic_degiskenler**:
  - `byId` — `new Map<string, DomainCategory>()` — kategori ID'sinden DomainCategory eşlemesi
  - `bySlug` — `new Map<string, DomainCategory>()` — kategori slug'ından DomainCategory eşlemesi
  - `rootBySlug` — `new Map<string, DomainCategory>()` — parent_id olmayan (kök) kategorilerin slug eşlemesi
  - `bySlugAndParent` — `new Map<string, DomainCategory>()` — `"slug|parent_id"` key'inden DomainCategory eşlemesi
  - `childrenByParentId` — `new Map<string, DomainCategory[]>()` — parent_id'den alt kategori dizilerine eşleme
  - `c` — `globalCategories` dizisindeki her bir `DomainCategory` öğesi (for döngüsü)
  - `key` — `${c.slug}|${c.parent_id}` formatında oluşturulmuş string, `bySlugAndParent` map'inin anahtarıdır
  - `children` — `childrenByParentId.get(c.parent_id)` veya boş dizi, mevcut kategorinin kardeşleri
- **Dönüş**: `{ byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId }` nesnesi

---

### [N5_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → useEffect[1] callback
- **params**: yok
- **ic_degiskenler**:
  - (iç fonksiyon `fetchData` içinde):
    - `targetCategory` — `DomainCategory | null` tipinde, slug'dan bulunan hedef kategori; `null` ile başlar
    - `targetParentCategory` — `DomainCategory | null` tipinde, slug'dan bulunan üst kategori; `null` ile başlar
    - `subs` — `DomainCategory[]` tipinde, hedef kategorinin alt kategorileri dizisi; boş dizi ile başlar
    - `orderA` — `Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)` — sıralama için birinci kategorinin sıralama değeri
    - `orderB` — `Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)` — sıralama için ikinci kategorinin sıralama değeri
    - `categoryIds` — kategori ID'leri dizisi; kök kategori ve alt kategorilerin ID'lerini veya sadece hedef kategorinin ID'sini içerir
    - `p` — `initialProducts[i].price` veya `productsData[i].price` — döngü içindeki ürünün fiyat değeri
    - `maxPrice` — `-Infinity` ile başlayan, ürünler arasındaki maksimum fiyatı tutar
    - `ceilMax` — `Math.ceil(maxPrice)` ile yukarı yuvarlanmış maksimum fiyat
    - `productsData` — `await getProductsEnriched(...)` ile API'den çekilen ürün verisi dizisi
- **Dönüş**: yok (yan etki: `setCategory`, `setParentCategory`, `setSubCategories`, `setProducts`, `setFilters`, `setLoading` çağrısı)

---

### [N6_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → useEffect[1] callback → fetchData
- **params**: yok
- **ic_degiskenler**:
  - `targetCategory` — `DomainCategory | null`, slug ve parentSlug kullanılarak `categoryMaps` haritalarından bulunan hedef kategori
  - `targetParentCategory` — `DomainCategory | null`, slug ve parentSlug kullanılarak bulunan üst kategori
  - `subs` — `DomainCategory[]`, hedef kategorinin sıralanmış alt kategorileri dizisi
  - `orderA` — `(a, b)` sort comparator callback'indeki birinci sıralama değeri, `a.metadata.sort_order`'dan sayısal olarak alınır
  - `orderB` — `(a, b)` sort comparator callback'indeki ikinci sıralama değeri, `b.metadata.sort_order`'dan sayısal olarak alınır
  - `categoryIds` — `number[]` veya `string[]`, API isteğine gönderilecek kategori ID'leri dizisi
  - `maxPrice` — `-Infinity` ile başlayan, fiyat döngüsü sonunda ürün koleksiyonundaki en yüksek fiyatı tutar
  - `p` — döngü içindeki ürünün `price` değeri, `null` ve `NaN` kontrolünden geçirilir
  - `ceilMax` — `Math.ceil(maxPrice)`, maksimum fiyatın yukarı yuvarlanmış hali
  - `productsData` — `await getProductsEnriched()` ile çekilmiş `Product[]` dizisi
  - `error` — `catch` bloğundaki yakalanan hata nesnesi
- **Dönüş**: yok (yan etki: state setter'ları ve `console.error` çağrısı)

---

### [N7_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway → useEffect[1] callback → fetchData → sort comparator
- **params**: `a: DomainCategory`, `b: DomainCategory`
- **ic_degiskenler**:
  - `orderA` — `Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)` — birinci kategorinin metadata'dan alınan sıralama değeri, yoksa 0
  - `orderB` — `Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)` — ikinci kategorinin metadata'dan alınan sıralama değeri, yoksa 0
- **Dönüş**: `number` — sıralama farkı: sıralama değerleri farklıysa `orderA - orderB`, aynıysa `a.name.localeCompare(b.name)` ile alfabetik sıralama

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway