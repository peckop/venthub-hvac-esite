---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: 4db0fbb44a4efb44
entity_hashes:
  func:CategoryProvider: 664f5248857922aa
  func:useCategories: bc181eebe7b5a618
  overview: b7214bc7e9cfb3ac
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T13:59:03Z
---

## Genel Bakış
CategoryContext modülü, React uygulaması genelinde kategori verilerinin tutarlı bir şekilde paylaşılmasını ve yönetimini sağlayan merkezi bir yapıdır. CategoryProvider bileşeni, kategori verisi ve ilgili durumları alt bileşenlere aktarırken, useCategories hook'u bu verilere kolay erişim imkanı tanır.

## Fonksiyon Grupları
### Kategori Sağlayıcı
Uygulama ağaç yapısının üst seviyelerinde yer alarak, kategori verisi ve durumunu içeren React Context değerini tüm alt bileşenler için hazırlar ve sağlar.
- CategoryProvider

### Kategori Erişim Aracı
Alt bileşenler içinde, CategoryProvider tarafından sağlanan kategori verisine ve ilgili araçlara erişim sağlamak için güvenli ve kullanımı kolay bir React Hook'u sunar.
- useCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül için gerekli mimari varsayımlar, fonksiyon imzalarından çıkarılmaktadır.

---

[Aksiyom 1]: Eğer `useCategories()` bir `CategoryProvider` üst bileşeninin alt ağacı içinde çağrılmazsa, context değeri (`undefined`) olarak döner ve bileşen hata verir veya boş veri ile çalışır.

**Etkilediği durumlar:**
- `useCategories()` çağrısının component tree'de yukarıda `CategoryProvider` olmasını gerektirir
- Provider dışında kullanım, runtime hatası veya `undefined` context sonucunu doğurur

---

[Aksiyom 2]: Eğer `CategoryProvider` bileşeni `children` almadan kullanılırsa, React component tree'de render edilecek alt bileşen olmadığı için Context hiçbir alt bileşene değer iletmez.

**Etkilediği durumlar:**
- Provider'ın component hierarchy'de wrap (sarmalama) amaçlı kullanılması zorunludur
- `children` olmadan provider'ın işlevsel anlamı kalmaz

---

[Aksiyom 3]: `useCategories()` hook'u parametsiz (`()`) olarak tanımlıdır; bu nedenle hangi kategori verisinin istendiği, filtreleme kriterleri veya opsiyonel yapılandırma parametre ile belirlenemez — tüm kategori verisi veya varsayılan bir alt küme döner.

**Etkilediği durumlar:**
- Hook'un esnek filtreleme veya parametrik sorgu desteği yoktur
- Filtreleme ihtiyacı varsa, hook'u çağıran bileşen tarafında yapılmalıdır

---

[Aksiyom 4]: `CategoryProvider` ve `useCategories()` aynı namespace/modül (`CategoryContext`) içindedir; bu nedenle `useCategories()` inner implementation'da `CategoryContext`'i tüketir. Eğer `CategoryContext`'in `Provider`'ı ayrı bir modüle taşınırsa, `useCategories()` kırılır.

**Etkilediği durumlar:**
- Modülün iç bağımlılık bütünlüğü korunmalıdır
- `CategoryContext` export'u ile `useCategories()` arasında güçlü bağ vardır

---

## FONKSİYON DETAYLARI

### CategoryProvider
**Ne yapar**: Uygulama genelinde merkezi kategori otoritesi olarak çalışan React Context sağlayıcısıdır, tüm uygulama ağacındaki bileşenlerin paylaşılan kategori hiyerarşisine erişmesini ve bu veriyi tutarlı şekilde yönetmesini sağlar. Tüm uygulama genelinde kategori verisinin tek merkezden yönetilmesini mümkün kılar.
**Nasıl yapar**: React'ın Context API altyapısını kullanarak, kendisi ile sarmalanmış tüm alt bileşenlere kategori state'ini ve ilgili yönetim işlevlerini aktarır. Kategori verisindeki herhangi bir değişikliği tüm tüketici bileşenlere senkronize ederek veride tutarsızlık oluşmasını engeller.
**Parametreler**:
- children: React.ReactNode — CategoryProvider tarafından sarmalanan, uygulamanın tüm alt ağacını oluşturan React çocuk elemanlarıdır, provider tarafından sağlanan kategori verisine erişim hakkı kazanır.
**Dönüş**: React.FC<{ children: React.ReactNode }> türünde, içerisine aldığı children elemanını kategori context sağlayıcısı ile sarmalayarak ekranda render eden bir React bileşeni döndürür.

### useCategories
**Ne yapar**: CategoryProvider tarafından sağlanan merkezi kategori verisine ve yönetim işlevlerine erişim sağlayan özel React hook'udur. Sadece CategoryProvider altında çalışan bileşenler içinde kullanılabilir, uygulamanın herhangi bir noktasından kategori verisine güvenli erişim imkanı sunar.
**Nasıl yapar**: CategoryProvider tarafından oluşturulan özel context nesnesini tüketerek, context içindeki tüm değerleri çağrıldığı bileşene sunar. Eğer yanlışlıkla CategoryProvider dışında çağrılırsa geçerli bir bağlam olmadığı için hata fırlatarak yanlış kullanımı önler.
**Parametreler**: Hiçbir giriş parametresi almaz.
**Dönüş**: Kaynak kodda dönüş tipi açıkça tanımlanmamış, void veya bilinmiyor olarak belirtilmiştir. Çalışma prensibi gereği CategoryProvider tarafından yönetilen kategori hiyerarşisi ve ilgili yönetim işlevlerini içeren bir nesne döndürmesi amaçlanmıştır.

---

## INTERFACES

### CategoryContextType
- `categories: DomainCategory[]`
- `categoryTree: DomainCategory[]`
- `loading: boolean`
- `error: string | null`
- `refresh: () => Promise<void>`
- `getCategoryBySlug: (slug: string) => DomainCategory | undefined`
- `getSubCategories: (_parentId: string) => DomainCategory[]`

---

## SABİTLER
- **CategoryContext** (call) — `createContext<CategoryContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryContext.tsx::CategoryProvider
- **params**: `({ children })` — React children nodes, provider içinde render edilecek alt bileşenler
- **ic_degiskenler**:
  - `supabase` — `useSupabaseClient()` hook'undan gelen Supabase client instance, API çağrıları için kullanılır
  - `categories` — `useState<DomainCategory[]>([])`, tüm kategorileri tutan state dizisi
  - `loading` — `useState(true)`, yükleme durumunu belirten boolean state
  - `error` — `useState<string | null>(null)`, hata mesajını tutan nullable string state
  - `loadCategories` — `useCallback(async () => {...}, [supabase])`, kategorileri asenkron yükleyen memoized fonksiyon, `refresh` olarak context'e verilir
  - `categoryTree` — `useMemo(() => {...}, [categories])`, parent_id'si olmayan ana kategorilerin metadata.sort_order'a göre sıralanmış hali
  - `categoriesSlugMap` — `useMemo(() => {...}, [categories])`, slug -> DomainCategory eşlemesi yapan Map, O(1) erişim sağlar
  - `categoriesParentMap` — `useMemo(() => {...}, [categories])`, parent_id -> DomainCategory[] eşlemesi yapan Map, alt kategorileri gruplar ve sıralar
  - `getCategoryBySlug` — `useCallback((slug: string) => categoriesSlugMap.get(slug), [categoriesSlugMap])`, slug ile kategori arayan memoized fonksiyon
  - `getSubCategories` — `useCallback((parentId: string) => categoriesParentMap.get(parentId) || [], [categoriesParentMap])`, parentId ile alt kategorileri getiren memoized fonksiyon
  - `value` — `useMemo(() => ({...}), [...])`, Context.Provider'a verilen tüm değerleri içeren memoized nesne
- **Dönüş**: `<CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>` JSX'i döner

---

### [N2_NASIL] AST Pointer: CategoryContext.tsx::loadCategories
- **params**: yok (useCallback ile kapalı闭 closure, `supabase`'i dışarıdan alır)
- **ic_degiskenler**:
  - `data` — `await getCategories(supabase)` çağrısından dönen ham kategori verisi (CategoryMetadata[])
  - `domainCats` — `toUICategoryList(data)` ile ham veriden dönüştürülmüş DomainCategory dizisi
  - `err` — catch bloğundaki hata nesnesi, `console.error` ile loglanır
- **Yan etkiler**: `setLoading(true)` ile başlar, `setCategories(domainCats)` ile state'i günceller, hata olursa `setError('Kategoriler yüklenemedi.')` çağırır, finally'de `setLoading(false)` yapar
- **Dönüş**: void (async, Promise<void>)

---

### [N3_NASIL] AST Pointer: CategoryContext.tsx::useEffect_callback
- **params**: yok
- **ic_degiskenler**: yok
- **Yan etkiler**: `loadCategories()` çağırarak kategorileri yükler; `loadCategories` bağımlılık dizisinde olduğundan supabase değiştiğinde tekrar tetiklenir
- **Dönüş**: yok

---

### [N4_NASIL] AST Pointer: CategoryContext.tsx::categoryTree_memo
- **params**: yok
- **ic_degiskenler**:
  - `mainCats` — `categories.filter(c => !c.parent_id)`, parent_id'si olmayan (üst seviye) kategorileri filtreleyen dizi
- **Dönüş**: `mainCats.sort(...)` sonucu — metadata.sort_order'a göre artan sırada sıralanmış üst seviye kategori dizisi

---

### [N5_NASIL] AST Pointer: CategoryContext.tsx::sort_compare
- **params**: `(a, b)` — sıralanacak iki DomainCategory nesnesi
- **ic_degiskenler**:
  - `orderA` — `(a.metadata as CategoryMetadata | null)?.sort_order ?? 0`, birinci kategorinin sıralama değeri, metadata yoksa 0
  - `orderB` — `(b.metadata as CategoryMetadata | null)?.sort_order ?? 0`, ikinci kategorinin sıralama değeri, metadata yoksa 0
- **Dönüş**: `orderA - orderB` (number), negatif ise a önce, pozitif ise b önce gelir

---

### [N6_NASIL] AST Pointer: CategoryContext.tsx::categoriesSlugMap_memo
- **params**: yok
- **ic_degiskenler**:
  - `map` — `new Map<string, DomainCategory>()`, slug anahtarlı kategori haritası
  - `c` — for-of döngüsünde her bir DomainCategory elemanı
- **Dönüş**: `Map<string, DomainCategory>` — slug ile O(1) kategori erişimi sağlayan harita

---

### [N7_NASIL] AST Pointer: CategoryContext.tsx::categoriesParentMap_memo
- **params**: yok
- **ic_degiskenler**:
  - `map` — `new Map<string, DomainCategory[]>()`, parent_id anahtarlı çocuk kategoriler haritası
  - `c` — birinci for-of döngüsünde her bir DomainCategory elemanı
  - `siblings` — `map.get(c.parent_id)` ile alınan veya oluşturulan, aynı parent'a ait kardeş kategoriler dizisi
  - `siblings` (ikinci döngü) — `map.entries()` destructuring'inden gelen, sort öncesi çocuk kategori dizisi
- **Dönüş**: `Map<string, DomainCategory[]>` — parent_id -> sıralanmış çocuk kategoriler haritası

---

### [N8_NASIL] AST Pointer: CategoryContext.tsx::value_memo
- **params**: yok
- **ic_degiskenler**: yok (dışarıdaki değişkenleri referans alarak nesne oluşturur)
- **Dönüş**: `{ categories, categoryTree, loading, error, refresh, getCategoryBySlug, getSubCategories }` — Context value nesnesi; seven bağımlılık dizisi ile memoize edilir
  - `categories` — tüm kategoriler dizisi
  - `categoryTree` — sıralanmış üst seviye kategoriler
  - `loading` — yükleme durumu boolean
  - `error` — hata mesajı string|null
  - `refresh` — `loadCategories` referansı, manuel yenileme tetikler
  - `getCategoryBySlug` — slug ile kategori arama fonksiyonu
  - `getSubCategories` — parentId ile alt kategorileri getirme fonksiyonu

---

### [N9_NASIL] AST Pointer: CategoryContext.tsx::useCategories
- **params**: yok
- **ic_degiskenler**:
  - `context` — `useContext(CategoryContext)`, CategoryProvider tarafından sağlanan context değeri
- **Hata yönetimi**: `context === undefined` ise `'useCategories must be used within a CategoryProvider'` hata fırlatır
- **Dönüş**: `context` nesnesi (categories, categoryTree, loading, error, refresh, getCategoryBySlug, getSubCategories alanlarını içerir)

---

## NODE ID STANDARD

  file: src\contexts\CategoryContext.tsx
  function: src\contexts\CategoryContext.tsx::CategoryProvider
  function: src\contexts\CategoryContext.tsx::useCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryProvider
  export: useCategories

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)