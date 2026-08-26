---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryGateway.ts
skeleton_hash: 1b375a757561a4d1
entity_hashes:
  func:useCategoryGateway: 8e95a6f39bff69fd
  overview: d663518b19af5432
generated_at: 2026-08-24T11:53:27Z
---

## Genel Bakış
Bu modül, kategori sayfalarının tüm veri yönetimini merkezileştiren tek bir React hook'u tanımlar. Hook, başlangıç kategori verilerini parametre olarak alır; kategori, alt kategoriler, ürünler, yükleme durumu ve filtre gibi bileşenler arası tekrarlanan veri yönetim kodunu ortadan kaldırır. Supabase üzerinden veri çekme, URL tabanlı filtre senkronizasyonu ve ürün sıralama/filtreleme gibi işlemleri soyutlayarak bileşenlerin yalnızca sunuma odaklanmasını sağlar.

## Fonksiyon Grupları
### Kategori Sayfası Veri Geçidi
Bu grup, kategori sayfasının tüm yaşam döngüsünü tek bir hook üzerinden yönetir. Next.js'in `useParams`, `useRouter`, `usePathname` ve `useSearchParams` hook'larını kullanarak URL'den `slug` ve `parentSlug` bilgilerini çıkarır; `useCategories` hook'undan gelen global kategori listesini arama hızını artırmak için indeksli yapılara dönüştürür; Supabase'den ürün ve alt kategori verilerini getirir; yükleme durumunu takip eder ve URL ile filtre durumunu senkronize eder.
- useCategoryGateway

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### useCategoryGateway
**Ne yapar**: Kategori navigasyonu ve filtreleme işlemlerini yöneten bir React custom hook'udur. Kategori hiyerarşisini (üst kategori, alt kategoriler) çözümleyerek görünüm bileşenlerine sunar; aynı zamanda URL arama parametreleriyle senkronize edilen sıralama, görünüm modu, marka filtresi ve arama tercihlerini durum (state) olarak korur. SSR uyumluluğu için `useSearchParams` yerine doğrudan `window.location.search` kullanır.

**Nasıl yapar**: Hook, bileşen yaşam döngüsü boyunca çeşitli yerleşik ve özel hook'larla entegre çalışır. `useIsMounted` ile istemci tarafında mount edilip edilmediğini takip eder; `useRouter` ve `usePathname` ile Next.js yönlendirme ve yol bilgisine erişir; `useCategories` ile global kategori listesini ve yükleme durumunu alır; `useI18n` ile aktif dil bilgisini edinir. İlk render'da `useSearchParams` yerine `window.location.search` kullanılarak URL parametreleri (`sortBy`, `viewMode`, `brands`, `catSearch`) okunur ve `setFilters` ile filtrelere yansıtılır — bu tercihin nedeni, `useSearchParams`'ın `CategoryMasterView` kökünde çağrıldığında tüm sayfayı Suspense fallback'e (CSR bailout) düşürerek SSR HTML'ini boşaltmasıdır (Kural 5). `updateFilters` fonksiyonu, filtre güncellemelerini hem state'e hem de URL'e yansıtır; varsayılan değerlerden farklı olan parametreleri URL'e ekler, varsayılan olanları siler ve `router.replace` ile sayfa yenilemeden URL'i günceller. `useManualScrollRestoration` ile kategori yükleme sırasında kaydırma konumunu korur. Global kategorilerden `useMemo` ile iki harita (Map) oluşturulur: `byId` (id'ye göre kategori erişimi) ve `childrenByParentId` (parent_id'ye göre alt kategori listesi). Üst kategori, mevcut kategorinin `parent_id`'si üzerinden `byId` haritasından bulunur. Alt kategoriler ya doğrudan `initialSubCategories` prop'undan alınır ya da `childrenByParentId` haritasından çekilip `metadata.sort_order` alanına göre (sayısal) ve ardından `compareText` ile isme göre sıralanır.

**Parametreler**:
- `initialCategory?: DomainCategory | null` — Bileşenin başlangıçta görüntülemesi istenen kategori nesnesi. `null` veya tanımsız olabilir; bu durumda `category` değeri `null` olarak atanır.
- `initialSubCategories?: DomainCategory[]` — Başlangıç alt kategori listesi. Sağlandığında ve boş olmadığında, hook'un kendi hesapladığı alt kategori listesi yerine bu değer kullanılır.

**Dönüş**: Aşağıdaki alanları içeren bir nesne döndürür:
- `category: DomainCategory | null` — `initialCategory` parametresinin kendisi; tanımsızsa `null`.
- `parentCategory: DomainCategory | null` — Mevcut kategorinin üst kategorisi; `parent_id` yoksa veya eşleşen kategori bulunamazsa `null`.
- `subCategories: DomainCategory[]` — Alt kategori listesi. `initialSubCategories` sağlanmışsa onu kullanır; aksi halde mevcut kategori bir üst kategorinin alt kategorisi ise boş dizi döner, kök kategori ise `childrenByParentId` haritasından alınıp `metadata.sort_order` ve isme göre sıralanmış şekilde döner.
- `loading: false` — Sabit olarak `false` değerindedir; liste sunucudan geldiği için istemci tarafında bekleme durumu yoktur.
- `categoriesLoading: boolean` — Global kategori context'inin (breadcrumb/alt kategori süsleme) yükleme durumu; `useCategories` hook'undan alınır.
- `filters: CategoryFilters` — Mevcut filtre durumu (`sortBy`, `viewMode`, `selectedBrands`, `catSearch` alanlarını içerir).
- `updateFilters: (updates: Partial<CategoryFilters>) => void` — Filtreleri güncelleyen ve değişiklikleri URL'e yansıtan geri çağırma (callback) fonksiyonu. `useCallback` ile sarılmış olup `pathname` ve `router` bağımlılıklarına tepki verir.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/CategoryContext::useCategories
- import: ../hooks/useManualScrollRestoration::useManualScrollRestoration
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/sort::compareText
- import: ../lib/type-converters::DomainCategory
- import: ./useIsMounted::useIsMounted
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## INTERFACES

### CategoryFilters
F5-B W2.1 — Gateway artık VERİ ÇEKMEZ. Liste (aile satırları) sunucuda `getFamiliesEnriched` ile üretilir ve prop olarak iner; istemci aynı listeyi bir daha fetch etmez (SSR/hydration zıplaması + çift sorgu kalktı). Kategori çözümü de sunucudan gelir — bu yüzden eski HAM slug lookup'ı (yerelleştiril
- `sortBy: string`
- `viewMode: 'grid' | 'list'`
- `selectedBrands: string[]`
- `catSearch: string`

---

## SABİTLER
- **DEFAULT_FILTERS** (object) — `{
  sortBy: 'name',
  viewMode: 'grid',
  selectedBrands: [],
  catSearch...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useCategoryGateway
- **params**: `initialCategory?: DomainCategory | null`, `initialSubCategories?: DomainCategory[]`
- **ic_degiskenler**:
  - `isMounted` — `useIsMounted()` hook'undan dönen boolean; bileşenin mount edilip edilmediğini belirtir
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; URL değiştirme işlemleri için kullanılır
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL yolu; URL güncelleme işlemlerinde temel yol olarak kullanılır
  - `globalCategories` — `useCategories()` hook'undan destruct edilen global kategori listesi; tüm kategorileri içerir
  - `categoriesLoading` — `useCategories()` hook'undan destruct edilen yükleme durumu boolean'ı; global kategori context'inin yüklenme durumunu gösterir
  - `lang` — `useI18n()` hook'undan destruct edilen dil kodu string'i; sıralama işlemlerinde metin karşılaştırma için kullanılır
  - `filters` — `useState<CategoryFilters>(DEFAULT_FILTERS)` ile yönetilen mevcut filtre durumu nesnesi; sortBy, viewMode, selectedBrands, catSearch alanlarını içerir
  - `setFilters` — `useState` ile gelen filtre durumu güncelleme fonksiyonu
  - `category` — `initialCategory ?? null` ifadesinden türetilen mevcut kategori; initialCategory varsa onu, yoksa null kullanır
  - `categoryMaps` — `useMemo` ile `globalCategories` bağımlılığından hesaplanan nesne; `byId` (Map<string, DomainCategory>) ve `childrenByParentId` (Map<string, DomainCategory[]>) haritalarını içerir
  - `parentCategory` — `useMemo` ile `category` ve `categoryMaps` bağımlılıklarından hesaplanan üst kategori; `category.parent_id` varsa `categoryMaps.byId`'den getirir, yoksa null döner
  - `subCategories` — `useMemo` ile `initialSubCategories`, `category`, `categoryMaps`, `lang` bağımlılıklarından hesaplanan alt kategori dizisi; initialSubCategories varsa onu kullanır, yoksa `categoryMaps.childrenByParentId`'den alıp sort_order ve isme göre sıralar
- **Dönüş**: `{ category, parentCategory, subCategories, loading: false, categoriesLoading, filters, updateFilters }` nesnesi

### [N2_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useEffect (URLSearchParams okuma)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `isMounted` — dış scope'dan erişilen boolean; bileşenin mount edilip edilmediğini kontrol eder
  - `sp` — `new URLSearchParams(window.location.search)` ile oluşturulan URLSearchParams nesnesi; mevcut URL sorgu parametrelerini temsil eder
  - `spBrands` — `sp.get('brands')` ile URL'den alınan marka parametresi string'i; virgülle ayrılmış marka listesi
  - `viewModeParam` — `sp.get('viewMode')` ile URL'den alınan görünüm modu parametresi string'i; 'grid' veya 'list' olabilir
  - `sortBy` — `sp.get('sortBy') || 'name'` ifadesinden türetilen sıralama kriteri; yoksa 'name' varsayılanı kullanılır
  - `catSearch` — `sp.get('catSearch') || ''` ifadesinden türetilen kategori arama terimi; yoksa boş string kullanılır
- **Dönüş**: yok (yan etki: `setFilters` çağrısı ile filtre durumunu günceller)

### [N3_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::updateFilters
- **params**: `updates: Partial<CategoryFilters>`
- **ic_degiskenler**:
  - `prev` — `setFilters` callback'indeki önceki filtre durumu nesnesi
  - `newFilters` — `{ ...prev, ...updates }` ile oluşturulan birleştirilmiş yeni filtre durumu nesnesi
  - `pathname` — dış scope'dan erişilen mevcut URL yolu string'i
  - `router` — dış scope'dan erişilen Next.js router nesnesi
  - `urlParams` — `new URLSearchParams(window.location.search)` ile oluşturulan URLSearchParams nesnesi; mevcut URL parametrelerini temsil eder
  - `newQueryString` — `urlParams.toString()` ile oluşturulan URL sorgu dizesi string'i
- **Dönüş**: `CategoryFilters` nesnesi (setFilters callback'inin dönüşü; güncellenmiş filtre durumu)

### [N4_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useMemo (categoryMaps)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `globalCategories` — dış scope'dan erişilen global kategori dizisi; döngüde her kategori için işlem yapılır
  - `byId` — `new Map<string, DomainCategory>()` ile oluşturulan harita; kategori id'sinden kategori nesnesine eşleme yapar
  - `childrenByParentId` — `new Map<string, DomainCategory[]>()` ile oluşturulan harita; parent_id'den alt kategori dizisine eşleme yapar
  - `c` — `for...of` döngüsündeki her bir kategori nesnesi
  - `children` — `childrenByParentId.get(c.parent_id) || []` ifadesinden türetilen alt kategori dizisi; mevcut çocukları alır veya boş dizi oluşturur
- **Dönüş**: `{ byId, childrenByParentId }` nesnesi

### [N5_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useMemo (parentCategory)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `category` — dış scope'dan erişilen mevcut kategori nesnesi; `parent_id` alanı kontrol edilir
  - `categoryMaps` — dış scope'dan erişilen kategori haritaları nesnesi; `byId` haritasından üst kategori getirilir
- **Dönüş**: `DomainCategory | null` — üst kategori nesnesi veya null

### [N6_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::useMemo (subCategories)
- **params**: yok (arrow function)
- **ic_degiskenler**:
  - `initialSubCategories` — dış scope'dan erişilen başlangıç alt kategori dizisi; varsa doğrudan kullanılır
  - `category` — dış scope'dan erişilen mevcut kategori nesnesi; `parent_id` ve `id` alanları kontrol edilir
  - `categoryMaps` — dış scope'dan erişilen kategori haritaları nesnesi; `childrenByParentId` haritasından alt kategoriler getirilir
  - `lang` — dış scope'dan erişilen dil kodu string'i; `compareText` fonksiyonuna parametre olarak geçilir
  - `a` — `.sort()` callback'indeki birinci karşılaştırma elemanı (DomainCategory nesnesi)
  - `b` — `.sort()` callback'indeki ikinci karşılaştırma elemanı (DomainCategory nesnesi)
  - `orderA` — `Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)` ifadesinden türetilen birinci elemanın sıralama değeri number'ı
  - `orderB` — `Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)` ifadesinden türetilen ikinci elemanın sıralama değeri number'ı
- **Dönüş**: `DomainCategory[]` — sıralanmış alt kategori dizisi

### [N7_NASIL] AST Pointer: src/hooks/useCategoryGateway.ts::sort callback (subCategories içinde)
- **params**: `a: DomainCategory`, `b: DomainCategory`
- **ic_degiskenler**:
  - `a` — birinci karşılaştırma elemanı; `metadata.sort_order` alanı okunur
  - `b` — ikinci karşılaştırma elemanı; `metadata.sort_order` alanı okunur
  - `orderA` — `Number((a.metadata as Record<string, unknown>)?.sort_order ?? 0)` ifadesinden türetilen birinci elemanın sıralama değeri number'ı
  - `orderB` — `Number((b.metadata as Record<string, unknown>)?.sort_order ?? 0)` ifadesinden türetilen ikinci elemanın sıralama değeri number'ı
  - `lang` — dış scope'dan erişilen dil kodu string'i; `compareText` fonksiyonuna parametre olarak geçilir
- **Dönüş**: `number` — sıralama sonucu (negatif, sıfır veya pozatif)

---

## NODE ID STANDARD

  file: src\hooks\useCategoryGateway.ts
  function: src\hooks\useCategoryGateway.ts::useCategoryGateway

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters
  export: useCategoryGateway