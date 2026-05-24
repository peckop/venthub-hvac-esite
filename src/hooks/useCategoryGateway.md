---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: cc44fbfa26137de0
generated_at: 2026-05-23T22:29:52Z
---

## Genel Bakış
Venthub HVAC projesinde yer alan bu React hook modülü, uygulama genelindeki kategori yönetimi ihtiyaçlarını karşılamak üzere tasarlanmıştır. Başlangıçta sağlanan ana kategori, ilişkili ürünler ve alt kategorileri temel alarak, kategori verilerine erişimi ve yönetimini merkezi bir noktadan soyutlar. Bileşenlerin tekrarlayan kategori veri yönetimi kodları yazmadan bu verilere tutarlı bir şekilde erişmesini sağlar.

## Fonksiyon Grupları
### Merkezi Kategori Erişim ve Yönetim Hook'u
Modülün ana ve tek bileşeni olarak, kategori verileriyle ilgili tüm işlevleri üstlenir, başlangıç parametreleriyle gelen verileri işleyerek hook'u kullanan bileşenlere kullanıma sunar.
- useCategoryGateway

---

## AXIOMS – Mimari Varsayımlar
Bu kategori yönetimi hook'u, sağlanan başlangıç kategori, ürün ve alt kategori verileriyle kategori-ürün ilişkilerini yönetmek üzere tasarlanmıştır; tüm işlevlerinin sorunsuz çalışması, tanımlı girdi tiplerinin ve modül sabitlerinin mevcudiyetine bağlıdır.

[Aksiyom 1]: Eğer initialCategory parametresi DomainCategory tipinde, null ya da undefined haricinde bir değer olarak gönderilirse, hook'un temel kategori yönetimi işlevi bozulur.
[Aksiyom 2]: Eğer initialProducts parametresi Product tipinde elemanlar içeren bir dizi ya da undefined haricinde bir değer olarak gönderilirse, ürünlerin kategoriye bağlanması işlemi gerçekleştirilemez.
[Aksiyom 3]: Eğer initialSubCategories parametresi DomainCategory tipinde elemanlar içeren bir dizi ya da undefined haricinde bir değer olarak gönderilirse, kategori hiyerarşisi yapılandırılamaz.
[Aksiyom 4]: Eğer modülle ilişkili DEFAULT_FILTERS sabit nesnesi proje kapsamında tanımlı olmazsa, hook'un tüm filtreleme işlevleri çalışmaz, filtreleme gerektiren tüm işlemler hata verir.

---

## FONKSIYON DETAYLARI

### useCategoryGateway
**Ne yapar**: Kategori odaklı verileri yöneten saf bir veri ağ geçidi (gateway) React hook'udur. Sadece Supabase veya uygulama içi depodan veri çekme, URL durum senkronizasyonu, ilgili kategoriye ait ürünlerin ham filtreleme ve sıralama işlemlerinden sorumludur. Başlangıçta sağlanan kategori, ürün ve alt kategori değerlerini temel alarak uygulama genelinde kullanılacak tüm kategori ile ilgili state değerlerini tek bir merkezden sunar.
**Nasıl yapar**: İçerisinde oluşturduğu state yapısını başlangıçta gönderilen opsiyonel parametrelerle başlatır. Harici veri kaynağından veri çekerken yükleme durumunu takip eden loading state'ini aktifleştirir, tüm durum bilgilerini sürekli olarak tarayıcı URL'si ile senkronize tutarak sayfa yenileme veya doğrudan link paylaşımı gibi senaryolarda durumun korunmasını sağlar. Ürünler üzerinde uygulanan filtreleme ve sıralama işlemlerini saf bir şekilde gerçekleştirir, hiçbir yan etki yaratmadan yalnızca tanımlı sorumluluklarını yerine getirir.
**Parametreler**:
- initialCategory: DomainCategory | null | undefined — Hook'un çalışmaya başladığında temel alacağı ana kategori nesnesidir, değer sağlanmazsa null başlangıç değeri ile çalışır
- initialProducts: Product[] | undefined — İlgili kategoriye ait başlangıç ürün listesidir, hiçbir değer gönderilmezse boş dizi ile initialize edilir
- initialSubCategories: DomainCategory[] | undefined — Mevcut ana kategoriye ait başlangıç alt kategori listesidir, değer sağlanmazsa boş dizi olarak başlatılır
**Dönüş**: Kategori yönetimi için gerekli tüm state ve yapılandırma değerlerini içeren bir nesne döndürür. Döndürülen nesnenin alanları şu şekildedir: category olarak mevcut aktif ana kategori nesnesi (null değeri henüz bir kategori seçilmediğini belirtir), parentCategory olarak mevcut aktif kategorinin üst kategorisi (yalnızca alt kategoriler için geçerli üst kategori verisini barındırır), subCategories olarak mevcut aktif kategoriye ait tüm alt kategorileri içeren dizi, products olarak filtreleme ve sıralama işlemleri uygulanmış ilgili kategoriye ait ürün listesi, loading olarak veri çekme işleminin aktif olup olmadığını gösteren boolean değer (true ise yükleme süreci devam eder anlamına gelir) ve filters olarak ürünler üzerinde uygulanan tüm filtreleme kriterlerini tutan nesne.

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

### [N1_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway
- **params**: initialCategory?: DomainCategory | null, initialProducts?: Product[], initialSubCategories?: DomainCategory[]
- **ic_degiskenler**:
  - `isMounted` — useIsMounted() hook'undan dönen, bileşenin mount durumunu kontrol eden boolean değer
  - `params` — useParams() Next.js hook'undan dönen route parametreleri nesnesi
  - `router` — useRouter() Next.js hook'undan dönen yönlendirme işlemleri için kullanılan nesne
  - `pathname` — usePathname() Next.js hook'undan dönen mevcut sayfanın yolunu tutan string
  - `searchParams` — useSearchParams() Next.js hook'undan dönen URL sorgu parametreleri nesnesi
  - `globalCategories` — CategoryContext'ten gelen tüm sistemdeki kategoriler listesi
  - `categoriesLoading` — CategoryContext'ten gelen kategorilerin yüklenme durumunu tutan boolean
  - `slug` — route parametrelerinden çıkarılan mevcut kategori slug'ı, string tipinde
  - `parentSlug` — route parametrelerinden çıkarılan üst kategori slug'ı, string | undefined tipinde
  - `category` — useState ile yönetilen aktif kategori durumu, DomainCategory | null
  - `setCategory` — kategori durumunu güncelleyen state setter fonksiyonu
  - `parentCategory` — useState ile yönetilen aktif kategorinin üst kategorisi durumu, DomainCategory | null
  - `setParentCategory` — üst kategori durumunu güncelleyen state setter fonksiyonu
  - `subCategories` — useState ile yönetilen aktif kategorinin alt kategorileri listesi, DomainCategory[]
  - `setSubCategories` — alt kategoriler durumunu güncelleyen state setter fonksiyonu
  - `products` — useState ile yönetilen aktif kategorideki ürünler listesi, Product[]
  - `setProducts` — ürünler durumunu güncelleyen state setter fonksiyonu
  - `loading` — useState ile yönetilen veri yükleme durumu, boolean
  - `setLoading` — yükleme durumunu güncelleyen state setter fonksiyonu
  - `filters` — useState ile yönetilen kategori filtreleri durumu, CategoryFilters tipinde
  - `setFilters` — filtreler durumunu güncelleyen state setter fonksiyonu
  - `isFirstRender` — useRef ile yönetilen ilk render olup olmadığını takip eden referans, boolean değer tutar
- **Dönüş**: {category, parentCategory, subCategories, products, loading, filters, updateFilters} içeren state ve işlem nesnesi

### [N2_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<ilk_useEffect_anonim>
- **params**: (yok)
- **ic_degiskenler**:
  - `isMounted` — Bileşenin mount durumunu kontrol eden dışarıdan alınan boolean değer
  - `searchParams` — URL sorgu parametrelerini tutan dışarıdan alınan nesne
  - `spBrands` — searchParams'tan çıkarılan marka parametresinin string değeri
  - `viewModeParam` — searchParams'tan çıkarılan görünüm modu parametresinin string değeri
  - `setFilters` — Filtreler state'ini güncellemek için kullanılan dışarıdan alınan setter fonksiyonu
- **Dönüş**: void (erken dönüşlerle işlem sonlandırılır, setFilters ile durum güncellenir)

### [N3_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<updateFilters_useCallback>
- **params**: updates: Partial<CategoryFilters>
- **ic_degiskenler**:
  - `setFilters` — Filtreler state'ini güncellemek için kullanılan dışarıdan alınan setter fonksiyonu
  - `pathname` — Mevcut sayfa yolunu tutan dışarıdan alınan string değer
  - `router` — Yönlendirme işlemleri için kullanılan dışarıdan alınan Next.js router nesnesi
- **Dönüş**: güncellenmiş yeni filtre nesnesi

### [N4_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<updateFilters_setFilters_prev_callback>
- **params**: prev: CategoryFilters
- **ic_degiskenler**:
  - `newFilters` — Mevcut filtreler ile güncellemeler birleştirilerek oluşturulan yeni filtre nesnesi
  - `window` — Tarayıcı pencere nesnesi, client-side kontrolü için kullanılır
  - `urlParams` — URL sorgu parametrelerini yönetmek için oluşturulan URLSearchParams nesnesi
  - `newQueryString` — Oluşturulan yeni sorgu string'i, URL'ye eklenmek üzere hazırlanır
- **Dönüş**: URL senkronize edilmiş yeni filtre nesnesi

### [N5_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<categoryMaps_useMemo>
- **params**: (yok)
- **ic_degiskenler**:
  - `globalCategories` — Tüm kategoriler listesi, dışarıdan alınan DomainCategory[]
  - `byId` — Kategorileri id'ye göre eşleyen Map<string, DomainCategory> nesnesi
  - `bySlug` — Kategorileri slug'a göre eşleyen Map<string, DomainCategory> nesnesi
  - `rootBySlug` - Üst kategorisi olmayan kök kategorileri slug'a göre eşleyen Map nesnesi
  - `bySlugAndParent` — Alt kategorileri slug ve üst kategori id ile eşleyen Map nesnesi
  - `childrenByParentId` — Üst kategori id'sine göre alt kategorileri gruplayan Map<string, DomainCategory[]> nesnesi
  - `c` — for döngüsünde işlenen her bir kategori nesnesi, DomainCategory tipinde
- **Dönüş**: Tüm kategori eşlemelerini içeren {byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId} nesnesi

### [N6_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<ikinci_useEffect_anonim>
- **params**: (yok)
- **ic_degiskenler**:
  - `slug` — Mevcut kategori slug'ı, dışarıdan alınan string
  - `parentSlug` — Üst kategori slug'ı, dışarıdan alınan string | undefined
  - `initialCategory` — Fonksiyona parametre olarak gelen başlangıç kategori değeri
  - `initialProducts` — Fonksiyona parametre olarak gelen başlangıç ürün listesi
  - `globalCategories` — Tüm sistem kategorileri, dışarıdan alınan DomainCategory[]
  - `categoryMaps` — Kategori eşlemelerini içeren useMemo ile oluşturulan nesne
  - `categoriesLoading` — Kategorilerin yüklenme durumu, dışarıdan alınan boolean
  - `fetchData` — İçeride tanımlanan async veri çekme fonksiyonu
- **Dönüş**: void (içinde fetchData çağrılır, veri yükleme işlemi tetiklenir)

### [N7_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<fetchData_async>
- **params**: (yok)
- **ic_degiskenler**:
  - `categoriesLoading` — Kategorilerin yüklenme durumu, erken dönüş için kontrol edilir
  - `globalCategories` — Kategoriler listesi, boş olması durumunda erken dönüş yapılır
  - `targetCategory` — İşlenecek hedef kategori, bulunana kadar null olarak tutulur
  - `targetParentCategory` — Hedef kategorinin üst kategorisi, bulunana kadar null olarak tutulur
  - `categoryMaps` — Kategori eşlemeleri, hedef kategorileri bulmak için kullanılır
  - `subs` — Hedef kategorinin alt kategorileri listesi, sıralanıp state'e kaydedilir
  - `categoryIds` — Ürünleri çekeceğimiz kategori id'leri listesi, API'ye gönderilmek üzere hazırlanır
  - `isFirstRender` — İlk render olup olmadığını kontrol eden referans, SSR verisi kullanımı için
  - `initialProducts` — İlk renderda kullanılacak başlangıç ürün listesi
  - `maxPrice` — Ürünlerdeki maksimum fiyat, fiyat aralığını güncellemek için hesaplanır
  - `i` — for döngüsü sayacı, ürünler üzerinde gezinmek için kullanılır
  - `p` — Döngüde işlenen ürünün fiyat değeri
  - `ceilMax` — Yuvarlanmış maksimum fiyat, state'e kaydedilmek üzere hazırlanır
  - `getProductsEnriched` — Supabase'den ürün çeken API fonksiyonu, async olarak çağrılır
  - `productsData` — API'den dönen ürün listesi, state'e kaydedilir
  - `error` — Try-catch bloğunda yakalanan hata nesnesi, loglanır
- **Dönüş**: void (Tüm veri yükleme işlemleri tamamlandıktan sonra loading durumu kapatılır)

### [N8_NASIL] AST Pointer: src\hooks\useCategoryGateway.ts::useCategoryGateway::<subcategories_sort_callback>
- **params**: a: DomainCategory, b: DomainCategory
- **ic_degiskenler**:
  - `orderA` — a kategorisinin sıralama değeri, metadata'dan çıkarılır
  - `orderB` — b kategorisinin sıralama değeri, metadata'dan çıkarılır
- **Dönüş**: Sıralama için kullanılan sayısal değer, isimlere göre localeCompare ile sıralama yapılır

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway