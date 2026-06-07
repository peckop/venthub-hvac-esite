---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: 2cef58f62566c2e0
entity_hashes:
  func:useCategoryGateway: 7b8285c822bab503
  overview: 10ada5bfa92152db
generated_at: 2026-06-07T12:05:26Z
---

## Genel Bakış
Bu modül, kategori yönetimi süreçlerini merkezi ve tutarlı bir şekilde sağlamak için tasarlanmış bir React hook'u sunar. Kategori, ilişkili ürünler ve alt kategori verilerini başlangıç parametrelerinden alarak, kategori yapısına ve filtreleme durumuna erişimi soyutlayan bir arayüz oluşturur. Bileşenlerin tekrarlayan veri yönetimi kodları yazmadan dinamik kategori verilerini kullanmasını olanak tanır.

## Fonksiyon Grupları
### Kategori Sayfası Veri Akışı Yönetimi
Hook, bir kategori sayfası için gerekli tüm veri akışını ve durum yönetimini merkezi olarak yönetir. Kategori bilgiler

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, verilen fonksiyon gövdesine dayalı olarak kesin ve somut mimari varsayımlar üretilememektedir. Modülün çalışma mantığı ve bağımlılıkları fonksiyon gövdesindeki kod ile tanımlanır. Mevcut sadece fonksiyon imzası ve sabit isimleriyle, fonksiyonun nasıl davranacağına dair doğru ve ispatlanabilir aksiyomlar çıkarılamaz.

Eğer modülün işlevselliği için zorunlu olan koşullar (örn: `initialCategory` parametresinin null olmaması, `initialProducts` ve `initialSubCategories` array'lerinin geçerli yapıda olması) belirlenecekse, `useCategoryGateway` fonksiyonunun **gövdesi (body)** incelenmelidir.

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
- **params**: (initialCategory?: DomainCategory | null, initialProducts?: Product[], initialSubCategories?: DomainCategory[])
- **ic_degiskenler**:
  - `isMounted` — Component mount durumunu takip eden boolean, useIsMounted hook'undan gelir
  - `params` — Next.js useParams hook'undan gelen URL parametreleri (slug, subCategorySlug, categorySlug vb.)
  - `router` — Next.js useRouter hook'undan gelen router nesnesi, sayfa yönlendirmeleri için
  - `pathname` — Next.js usePathname hook'undan gelen mevcut URL yolu
  - `searchParams` — Next.js useSearchParams hook'undan gelen URL arama parametreleri
  - `globalCategories` — CategoryContext'ten gelen tüm kategorilerin listesi
  - `categoriesLoading` — CategoryContext'ten gelen yükleme durumu
  - `slug` — params'tan çıkarılan geçerli kategorinin slug'ı (params.slug, params.subCategorySlug veya params.categorySlug)
  - `parentSlug` — params'tan çıkarılan üst kategorinin slug'ı (params.parentSlug veya params.categorySlug)
  - `category` — State, mevcut kategoriyi tutar (initialCategory veya null)
  - `parentCategory` — State, üst kategoriyi tutar
  - `subCategories` — State, alt kategorilerin listesini tutar
  - `products` — State, ürün listesini tutar (initialProducts veya boş dizi)
  - `loading` — State, yükleme durumunu tutar (slug varsa ve initialCategory yoksa true)
  - `filters` — State, filtre parametrelerini tutar (DEFAULT_FILTERS)
  - `isFirstRender` — useRef, ilk render'ı takip eder (SSR hydration için)
  - `categoryMaps` — useMemo, kategorileri farklı açılardan erişilebilir kılan haritalar (byId, bySlug, rootBySlug, bySlugAndParent, childrenByParentId)
- **Dönüş**: { category: DomainCategory | null, parentCategory: DomainCategory | null, subCategories: DomainCategory[], products: Product[], loading: boolean, filters: CategoryFilters, updateFilters: (updates: Partial<CategoryFilters>) => void }

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway