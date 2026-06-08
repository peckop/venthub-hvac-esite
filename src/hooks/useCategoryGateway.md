---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: f7fb006be0a43495
entity_hashes:
  func:useCategoryGateway: 7b8285c822bab503
  overview: 129d55f8e47e2bd2
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış
Bu modül, bir React hook'u olan `useCategoryGateway`'i tanımlar. Hook, kategori sayfaları için gerekli olan kategori verisi, ilişkili ürünler ve alt kategoriler gibi bilgileri başlangıç parametrelerinden alarak, tüm veri yönetimini ve durumunu merkezi bir noktadan soyutlar. Bileşenlerin tekrarlayan veri yönetimi kodları yazmadan, dinamik ve filtrelenmiş kategori verilerine erişimini sağlar.

## Fonksiyon Grupları
### Kategori Verisi Yönetimi ve Sayfa Durumu
Bu grup, kategori sayfasının tüm yaşam döngüsünü yöneten tek bir merkezi hook içerir. Hook, başlangıç verilerini alır, ilişkili ürünleri ve alt kategorileri yönetir, yükleme durumunu takip eder ve muhtemelen URL tabanlı filtreleme senkronizasyonunu sağlar.
- `useCategoryGateway`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori sayfası veri akışını merkezi olarak yöneten bir React hook'u olup, başlangıç verilerini parametre olarak alır ve filtreleme durumunu yönetir.

---

## FONKSİYON DETAYLARI

### useCategoryGateway

**Ne yapar**:ategori sayfaları için bir veri geçit (gateway) hook'udur. Kategori, üst kategori, alt kategoriler, ürünler, yükleme durumu ve filtreler gibi tüm veri Yönetimini tek bir merkezden yönetir. Bu hook, verileri Supabase'den getirme, URL durumu ile filtre senkronizasyonu ve ürünlerin ham filtreleme/sıralama işlemlerini gerçekleştirir.

**Nasıl yapar**: İlk olarak Next.js'in `useParams`, `useRouter`, `usePathname` ve `useSearchParams` hook'ları ile mevcut URL yapısını analiz eder. URL'den `slug` ve `parentSlug` değerlerini çıkarır. `useCategories` hook'undan gelen globally kategorileri, arama hızını artırmak için birden fazla `Map` yapısına dönüştürerek indeksler (byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId). `slug` değerine göre ilgili kategoriyi ve üst kategoriyi bu haritalardan bulur. Alt kategoriler varsa bunları metadata içindeki `sort_order` alanına göre sıralar. Ürünleri, SSR hydration sırasında ilk render'da `initialProducts` parametresini kullanarak API isteğini atlar; sonraki istemci taraflı navigasyonlarda ise `getProductsEnriched` fonksiyonu ile Supabase'den product verisini çeker. Filtre durumunu URL search params ile iki yönlü senkronize eder: URL değiştiğinde filtreleri okur, filtreler değiştiğinde URL'i `router.replace` ile günceller.

**Parametreler**:

- `initialCategory`: `DomainCategory | null | undefined` — SSR hydration sırasında önceden hazırlanmış kategori nesnesi. Sağlanırsa ilk yüklemede veritabanına gereksiz istek yapılmasını engeller. Undefined veya null ise hook slug'a göre kendi verisini çeker.
- `initialProducts`: `Product[] | undefined` — SSR hydration sırasında önceden hazırlanmış ürün listesi. İlk render'da API isteği atlanır ve bu veri doğrudan kullanılır. Ürünlerin maksimum fiyatı hesaplanarak fiyat aralığı filtresinin üst sınırı güncellenir.
- `initialSubCategories`: `DomainCategory[] | undefined` — SSR hydration sırasında önceden hazırlanmış alt kategori listesi. Sağlanırsa ilk render'da bu değer state'e yerleştirilir; aksi takdirde kategori haritasından hesaplanır.

**Dönüş**:

Nesne yapısı döndürür:

- `category`: `DomainCategory | null` — Mevcut URL'deki slug'a karşılık gelen kategori nesnesi. Bulunamazsa null döner.
- `parentCategory`: `DomainCategory | null` — Üst kategori nesnesi. Alt kategori rotasındaysa (`parentSlug` mevcutsa) root kategoriyi, değilse mevcut kategorinin `parent_id` alanından üst kategoriyi çözer.
- `subCategories`: `DomainCategory[]` — Mevcut kategorinin alt kategorileri. Yalnızca root kategoriler için doldurulur, `sort_order` metadata alanına göre sıralanır.
- `products`: `Product[]` — İlgili kategoriye ait ürün listesi. Kategori ID'leri toplanarak tek seferde sorgulanır.
- `loading`: `boolean` — Veri çekme işleminin devam edip etmediğini gösterir. Slug yoksa başlangıçta `false`, slug varsa `true` olarak başlar.
- `filters`: `CategoryFilters` — Mevcut filtre durumu. Sıralama, görünüm modu, fiyat aralığı, seçili markalar ve teknik özellik filtrelerini içerir.
- `updateFilters`: `(updates: Partial<CategoryFilters>) => void` — Filtreleri kısmen günceller. Güncelleme sonrasında URL search parametrelerini senkronize eder. Varsayılan değerlere eşit olan filtreler URL'den temizlenir (temiz URL politikası).

**İç Mantık Detayları**:

- **SSR Hydration Guard**: `isFirstRender` ref'i kullanılarak, `initialProducts` yalnızca ilk render'da geçerli olur. Client-side navigasyonlarda bu koruma devre dışı kalır ve her zaman taze veri çekilir.
- **Category Maps İndeksleme**: `useMemo` ile global kategoriler beş ayrı Map yapısına indekslenir. Bu, O(1) zaman karmaşıklığında kategori aramalarını mümkün kılar ve her render'da tekrar hesaplama maliyetini ortadan kaldırır.
- **Alt Kategori Sıralaması**: Alt kategoriler `metadata.sort_order` alanına göre artan sırada, eşitlik durumunda alfabetik sıraya göre sıralanır.
- **Ürün Fiyat Aralığı Hesaplama**: Hem initial hem fetch edilen ürünlerden maksimum fiyat bulunur ve `priceRange` filtresinin üst sınırı, mevcut değerden büyükse güncellenir.
- **URL Senkronizasyonu**: `updateFilters` fonksiyonu, varsayılan değerlere sahip filtreleri URL'den kaldırarak temiz URL politikası uygular. Varsayılan değerler: `sortBy: 'name'`, `viewMode: 'grid'`, `priceRange: [0, 1000000]`.

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
- **params**: `(initialCategory?: DomainCategory | null, initialProducts?: Product[], initialSubCategories?: DomainCategory[])`
- **ic_degiskenler**:
  - `isMounted` — useIsMounted() hook'undan gelen, bileşenin mounted olup olmadığını gösteren boolean
  - `params` — useParams() hook'undan gelen URL parametreleri objesi
  - `router` — useRouter() hook'undan gelen Next.js yönlendirici
  - `pathname` — usePathname() hook'undan gelen mevcut URL yolu
  - `searchParams` — useSearchParams() hook'undan gelen URL search parametreleri
  - `globalCategories` — useCategories() hook'undan gelen tüm kategoriler dizisi
  - `categoriesLoading` — useCategories() hook'undan gelen yükleme durumu boolean
  - `slug` — URL'den çıkarılan kategori slug'ı (params?.slug || params?.subCategorySlug || params?.categorySlug)
  - `parentSlug` — URL'den çıkarılan üst kategori slug'ı (params?.parentSlug veya categorySlug)
  - `category` — Mevcut kategori state'i
  - `setCategory` — category state'ini güncelleyen setter fonksiyonu
  - `parentCategory` — Üst kategori state'i
  - `setParentCategory` — parentCategory state'ini güncelleyen setter fonksiyonu
  - `subCategories` — Alt kategoriler dizisi state'i
  - `setSubCategories` — subCategories state'ini güncelleyen setter fonksiyonu
  - `products` — Ürünler dizisi state'i
  - `setProducts` — products state'ini güncelleyen setter fonksiyonu
  - `loading` — Yükleme durumu boolean state'i
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `filters` — Filtreler state'i (CategoryFilters tipinde)
  - `setFilters` — filters state'ini güncelleyen setter fonksiyonu
  - `isFirstRender` — useRef ile oluşturulan, ilk render olup olmadığını takip eden boolean ref
  - `updateFilters` — useCallback ile memoize edilmiş, filtreleri güncelleyen ve URL'yi senkronize eden fonksiyon
  - `categoryMaps` — useMemo ile hesaplanmış kategori haritaları nesnesi (byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId)
- **Dönüş**: `{ category, parentCategory, subCategories, products, loading, filters, updateFilters }` nesnesi

### [N2_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::useEffect[syncFilters]
- **params**: `(/* anonim arrow fonksiyon */)`
- **ic_degiskenler**:
  - `spBrands` — searchParams.get('brands') ile alınan virgülle ayrılmış marka listesi string'i
  - `viewModeParam` — searchParams.get('viewMode') ile alınan görünüm modu parametresi
- **Dönüş**: yok (yan etki: filters state'ini günceller)

### [N3_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::updateFilters
- **params**: `(updates: Partial<CategoryFilters>)`
- **ic_degiskenler**:
  - `prev` — setFilters callback'indeki önceki filters state'i
  - `newFilters` — { ...prev, ...updates } ile birleştirilmiş yeni filtreler objesi
  - `urlParams` — new URLSearchParams(window.location.search) ile oluşturulan URL parametreleri
  - `newQueryString` — urlParams.toString() ile oluşturulmuş URL query string'i
- **Dönüş**: yok (yan etki: filters state'ini ve URL'yi günceller)

### [N4_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::useMemo[categoryMaps]
- **params**: `(/* anonim arrow fonksiyon */)`
- **ic_degiskenler**:
  - `byId` — Kategorileri ID'lerine göre eşleştiren Map<string, DomainCategory>
  - `bySlug` — Kategorileri slug'larına göre eşleştiren Map<string, DomainCategory>
  - `rootBySlug` — Ana kategorileri (parent_id olmayan) slug'larına göre eşleştiren Map<string, DomainCategory>
  - `bySlugAndParent` — Kategorileri slug|parent_id kombinasyonuna göre eşleştiren Map<string, DomainCategory>
  - `childrenByParentId` — Her ana kategorinin alt kategorilerini tutan Map<string, DomainCategory[]>
  - `c` — for döngüsündeki her bir kategori objesi
  - `key` — `${c.slug}|${c.parent_id}` formatında bySlugAndParent Map'i için anahtar
  - `children` — childrenByParentId Map'inden alınan mevcut children dizisi
- **Dönüş**: `{ byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId }` nesnesi

### [N5_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::useEffect[fetchData]
- **params**: `(/* anonim arrow fonksiyon */)`
- **ic_degiskenler**:
  - `fetchData` — Asenkron veri çekme fonksiyonu tanımı
- **Dönüş**: yok (yan etki: fetchData fonksiyonunu çağırır)

### [N6_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::useEffect[fetchData]::fetchData
- **params**: `(/* parametre yok */)`
- **ic_degiskenler**:
  - `targetCategory` — Bulunan hedef kategori (DomainCategory | null)
  - `targetParentCategory` — Bulunan üst kategori (DomainCategory | null)
  - `subs` — Alt kategoriler dizisi (DomainCategory[])
  - `categoryIds` — İstek için kullanılacak kategori ID'leri dizisi
  - `productsData` — getProductsEnriched() API çağrısından dönen ürün verisi
  - `maxPrice` — Ürünler arasındaki maksimum fiyat değeri
  - `ceilMax` — ceil() ile yukarı yuvarlanmış maksimum fiyat
  - `p` — Döngüdeki her bir ürünün price değeri
  - `orderA` — a.metadata.sort_order'dan sayısal sıralama değeri
  - `orderB` -- b.metadata.sort_order'dan sayısal sıralama değeri
- **Dönüş**: yok (yan etki: category, parentCategory, subCategories, products, loading, filters state'lerini günceller)

### [N7_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway::useEffect[fetchData]::fetchData::sortFunction
- **params**: `(a: DomainCategory, b: DomainCategory)`
- **ic_degiskenler**:
  - `orderA` — a.metadata.sort_order değerini number'a çevirip 0 default ile
  - `orderB` — b.metadata.sort_order değerini number'a çevirip 0 default ile
- **Dönüş**: `number` (a'nın b'den önce gelip gelmeyeceğini belirleyen sıralama değeri)

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway