---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: cc44fbfa26137de0
entity_hashes:
  func:useCategoryGateway: 29cfd4eee9e628a7
  overview: 3563589181e3d64d
generated_at: 2026-05-28T22:37:54Z
---

## Genel Bakış
Venthub HVAC projesindeki bu React hook modülü, kategori yönetimi süreçlerini merkezi ve tutarlı bir şekilde sağlamak amacıyla oluşturulmuştur. Başlangıçta verilen ana kategori, ilişkili ürünler ve alt kategori verilerini işleyerek, kategori verilerine erişim ve yönetim işlevlerini soyutlayan bir arayüz sunar. Bileşenlerin tekrarlayan veri yönetimi kodları yazmadan, kategori yapısını ve ilişkili ürünlerini dinamik olarak kullanmasını olanak tanır.

## Fonksiyon Grupları
### Kategori Verisi Yönetimi Hook'u
Modülün temel ve tek fonksiyonu olan bu hook, başlangıç parametreleriyle aldığı kategori, ürün ve alt kategori verilerini işleyerek, kategori hiyerarşisi ve ilişkili ürünlerle ilgili tüm state yönetimi ve iş mantığını yürütür.
- useCategoryGateway

---

## AXIOMS – Mimari Varsayımlar

Bu kategori yönetimi hook'u, başlangıç verilerinin opsiyonel olarak sağlanmasına ve filtreleme mekanizmasına dayalı mimari varsayımlarla çalışır.

**[Aksiyom 1]**: Eğer `initialCategory` parametresi `null` veya `undefined` olarak sağlanmamışsa, hook geçerli bir varsayılan (boş/none) kategori durumu ile başlatılır ve bileşenin kategori olmadan render edilmesine izin verilir.

**[Aksiyom 2]**: Eğer `initialProducts` parametresi sağlanmamışsa, başlangıçta ilişkili ürün listesi boş dizi (`[]`) olarak kabul edilir ve ürün filtreleme işlemleri bu boş küme üzerinde çalışır.

**[Aksiyom 3]**: Eğer `initialSubCategories` parametresi sağlanmamışsa, alt kategori hiyerarşisi boş dizi (`[]`) olarak başlatılır.

**[Aksiyom 4]**: Eğer `DEFAULT_FILTERS` sabiti tanımlı değilse veya erişilemez durumdaysa, kategori filtreleme işlemleri tanımsız davranır; dolayısıyla `DEFAULT_FILTERS`'un her zaman geçerli bir `object` olarak modül yüklenmesinde mevcut olması gerekir.

**[Aksiyom 5]**: Eğer hook birden fazla kez aynı bağımlılık setiyle (initialCategory, initialProducts, initialSubCategories) çağrılıyorsa, her çağrı instance'ı birbirinden bağımsız ve izole olmalıdır; aksi halde kategori durumları arasında veri sızıntısı oluşur.

**[Aksiyom 6]**: Eğer `initialCategory` `DomainCategory` tipinde bir nesne olarak sağlanıyorsa, bu nesnenin en azından kategori identification alanlarını içermesi beklenir; aksi halde ilişkili products ve subCategories verileriyle eşleştirme yapılamaz.

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

### [N1_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::useCategoryGateway`
- **params**: `(initialCategory?: DomainCategory | null, initialProducts?: Product[], initialSubCategories?: DomainCategory[])`
- **ic_degiskenler**:
  - `isMounted` — useIsMounted hook'unun döndürdüğü ref, component mount durumunu takip eder
  - `params` — useParams() ile alınan URL parametreleri (slug, parentSlug vb.)
  - `router` — useRouter() ile alınan Next.js router instance'ı, navigasyon için kullanılır
  - `pathname` — usePathname() ile alınan mevcut URL path'i, URL güncellemede kullanılır
  - `searchParams` — useSearchParams() ile alınan URL query string parametreleri
  - `globalCategories` — CategoryContext'ten gelen tüm kategoriler dizisi
  - `categoriesLoading` — CategoryContext'ten gelen kategorilerin yüklenme durumu
  - `slug` — URL'den çıkarılan kategori slug'ı (params.slug, params.subCategorySlug veya params.categorySlug'dan)
  - `parentSlug` — URL'den çıkarılan üst kategori slug'ı (params.parentSlug veya params.categorySlug'dan)
  - `category` — mevcut kategori state'i, initialCategory ile başlatılır
  - `parentCategory` — üst kategori state'i, fetch sırasında belirlenir
  - `subCategories` — alt kategoriler state dizisi, initialSubCategories ile başlatılır
  - `products` — ürün listesi state dizisi, initialProducts ile başlatılır
  - `loading` — yükleme durumu flag'i, slug varsa ve initialCategory yoksa true ile başlar
  - `filters` — sıralama, görünüm modu, fiyat aralığı, marka seçimi vb. filtre parametreleri state'i
  - `isFirstRender` — useRef ile tutulan boolean, SSR hydration skip kontrolü yapar
  - `categoryMaps` — useMemo ile hesaplanan kategori haritaları nesnesi (byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId)
  - `updateFilters` — useCallback ile sarılmış filtre güncelleme fonksiyonu, state ve URL'i senkronize eder
- **Dönüş**: `{ category, parentCategory, subCategories, products, loading, filters, updateFilters }` nesnesi

---

### [N2_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::useCategoryGateway useEffect#1 (searchParams sync)`
- **params**: `(isMounted: boolean, searchParams: URLSearchParams | null)`
- **ic_degiskenler**:
  - `spBrands` — URL'den okunan `brands` parametresi, virgülle ayrılmış marka listesi
  - `viewModeParam` — URL'den okunan `viewMode` parametresi, grid veya list değerini alır
- **Dönüş**: yok (yan etki: `setFilters` çağrısı ile filters state'ini günceller)

---

### [N3_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::updateFilters`
- **params**: `(updates: Partial<CategoryFilters>)`
- **ic_degiskenler**:
  - `prev` — setFilters updater içindeki önceki filters state değeri
  - `newFilters` — prev ile updates'in birleştirilmesiyle oluşan yeni filtre nesnesi
  - `urlParams` — mevcut URL query string'inden oluşturulan URLSearchParams instance'ı
  - `newQueryString` — urlParams'tan oluşturulan yeni query string
- **Dönüş**: `newFilters` (setFilters updater'ının return'ü)

---

### [N4_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::useMemo callback (categoryMaps)`
- **params**: `(globalCategories: DomainCategory[])`
- **ic_degiskenler**:
  - `byId` — kategorilerin ID ile erişimini sağlayan Map<id, DomainCategory>
  - `bySlug` — kategorilerin slug ile erişimini sağlayan Map<slug, DomainCategory>
  - `rootBySlug` — sadece üst kategorileri (parent_id olmayan) slug ile erişen Map
  - `bySlugAndParent` — slug|parent_id birleşik key ile erişim sağlayan Map
  - `childrenByParentId` — her üst ID'ye ait alt kategoriler dizisini tutan Map
  - `c` — for döngüsündeki her bir kategori objesi
  - `key` — `${c.slug}|${c.parent_id}` formatında birleşik anahtar stringi
  - `children` — belirli bir parent_id'ye ait mevcut children dizisi veya boş dizi
- **Dönüş**: `{ byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId }` nesnesi

---

### [N5_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::useEffect#2 (fetchData trigger)`
- **params**: `(slug: string, parentSlug: string | undefined, initialCategory, initialProducts, globalCategories, categoryMaps, categoriesLoading)`
- **ic_degiskenler**: yok (sadece fetchData'yı çağırır)
- **Dönüş**: yok (yan etki: fetchData fonksiyonunu çalıştırır)

---

### [N6_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::fetchData`
- **params**: `(parametre yok)`
- **ic_degiskenler**:
  - `targetCategory` — slug'dan bulunan hedef kategori, null ile başlatılır
  - `targetParentCategory` — hedefin üst kategorisi, null ile başlatılır
  - `subs` — alt kategoriler dizisi, targetCategory üst kategoriyse childrenByParentId'den doldurulur
  - `categoryIds` — ürün sorgulanacak kategori ID'leri dizisi (üst + alt kategoriler)
  - `productsData` — getProductsEnriched API çağrısının döndürdüğü ürün dizisi
  - `maxPrice` -Infinity ile başlatılan maksimum fiyat değeri, fiyat aralığı güncellemesi için kullanılır
  - `p` — döngü içindeki ürünün price değeri
  - `ceilMax` — maxPrice'ın üst tam sayıya yuvarlanmış hali
  - `ceilMax` — productsData için hesaplanan üst tam sayı maksimum fiyat
- **Dönüş**: yok (yan etki: setCategory, setParentCategory, setSubCategories, setProducts, setFilters, setLoading çağrıları)

---

### [N7_NASIL] AST Pointer: `src/hooks/useCategoryGateway.ts::sort compare fonksiyonu (subs sıralama)`
- **params**: `(a: DomainCategory, b: DomainCategory)`
- **ic_degiskenler**:
  - `orderA` — a kategorisinin metadata.sort_order değerinden Number ile elde edilen sıralama değeri
  - `orderB` — b kategorisinin metadata.sort_order değerinden Number ile elde edilen sıralama değeri
- **Dönüş**: `number` — orderA ve orderB farklıysa farkı, eşitse a.name.localeCompare(b.name) sonucunu döner

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway