---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: 26708e127e1d653d
entity_hashes:
  func:CategoryProvider: 664f5248857922aa
  func:useCategories: bc181eebe7b5a618
  overview: fe0862ea34c377d1
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:55:27Z
---

## Genel Bakış
Bu modül, React uygulaması genelinde kategori verilerinin yönetimini ve paylaşımını merkezi olarak sağlayan bir Context yapısıdır. Tüm alt bileşenlerin kategori listesine ve ilgili durumlarına tutarlı bir şekilde erişmesini amaçlar.

## Fonksiyon Grupları
### Kategori Sağlayıcı
Uygulamanın üst seviyelerinde yer alarak, kategori verisi ve durumunu içeren React Context değerini tüm alt bileşenler için hazırlanır ve sağlar.
- CategoryProvider

### Kategori Erişim Aracı
Bileşenler içinde, `CategoryProvider` tarafından sağlanan kategori verisine ve ilgili araçlara güvenli ve kolay erişim imkanı tanıyan bir React Hook'u sunar.
- useCategories

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React Context yapısını temel alan kategori veri paylaşım servisidir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `CategoryProvider` bileşeni, uygulama ağaç yapısında `useCategories()` hook'unu kullanan tüm bileşenlerin üstünde yer almıyorsa, o bileşenler kategori verilerine erişemez.

[Aksiyom 2]: Eğer `CategoryProvider` bileşeninin `children` prop'u tanımlı bir React düğüm içermiyorsa (boş veya geçersizse), uygulama içinde kategori verisi gerektiren hiçbir alt bileşen render edilemez.

[Aksiyom 3]: Eğer `CategoryContext` çağrısı yapılmamışsa (veya `CategoryProvider` içinde sağlanmamışsa), `useCategories()` hook'u `undefined` veya geçersiz bir değer döndürür.

[Aksiyom 4]: Eğer `useCategories()` hook'u `CategoryProvider` sarmalama alanı dışında kullanılırsa, kategori verisine erişim başarısız olur ve muhtemelen runtime hatası verir.

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
- **params**: `{ children }` — React child bileşenleri, provider içine render edilecek
- **ic_degiskenler**:
  - `categories` — DomainCategory[] tipinde state, yüklenen kategorilerin listesi
  - `loading` — boolean state, kategorilerin yükleme durumunu takip eder
  - `error` — string | null state, hata mesajını saklar
  - `loadCategories` — useCallback ile memoize edilmiş async fonksiyon, kategorileri getCategories API'sinden yükler
  - `categoryTree` — useMemo ile hesaplanmış, parent_id'si olmayan ana kategorilerin sıralı listesi
  - `categoriesSlugMap` — useMemo ile hesaplanmış, slug ile DomainCategory eşleştiren Map lookup tablosu
  - `categoriesParentMap` — useMemo ile hesaplenmiş, parent_id ile alt kategorilerin listesini eşleştiren Map lookup tablosu
  - `getCategoryBySlug` — useCallback ile memoize edilmiş, slug ile kategori getiren fonksiyon
  - `getSubCategories` — useCallback ile memoize edilmiş, parent_id ile alt kategorileri getiren fonksiyon
  - `value` — useMemo ile hesaplanmış, context değerini oluşturan obje
- **Dönüş**: `<CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>` (JSX elementi)

### [N2_NASIL] AST Pointer: CategoryContext.tsx::loadCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — getCategories API çağrısından dönen ham kategori verisi
  - `domainCats` — toUICategoryList(data) çağrısı ile dönüştürülmüş DomainCategory listesi
  - `err` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (state setter'ları çağırarak yan etki yapar: setCategories, setError, setLoading)

### [N3_NASIL] AST Pointer: CategoryContext.tsx::useEffect callback
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (loadCategories() çağırarak yan etki yapar)

### [N4_NASIL] AST Pointer: CategoryContext.tsx::categoryTree useMemo callback
- **params**: (yok)
- **ic_degiskenler**:
  - `mainCats` — categories.filter(c => !c.parent_id) ile elde edilen, parent_id'si olmayan ana kategoriler
  - `a`, `b` — sort karşılaştırma fonksiyonu parametreleri, sıralanacak kategoriler
  - `orderA` — (a.metadata as CategoryMetadata | null)?.sort_order ?? 0 ile elde edilen birinci kategorinin sıralama değeri
  - `orderB` — (b.metadata as CategoryMetadata | null)?.sort_order ?? 0 ile elde edilen ikinci kategorinin sıralama değeri
- **Dönüş**: mainCats.sort(...) ile sıralanmış ana kategoriler listesi

### [N5_NASIL] AST Pointer: CategoryContext.tsx::categoryTree sort callback
- **params**: `(a, b)` — sıralanacak iki DomainCategory nesnesi
- **ic_degiskenler**:
  - `orderA` — a.metadata cast edilerek CategoryMetadata tipine dönüştürüldükten sonra sort_order değeri, 0 default
  - `orderB` — b.metadata cast edilerek CategoryMetadata tipine dönüştürüldükten sonra sort_order değeri, 0 default
- **Dönüş**: orderA - orderB (numerik sıralama için fark değeri)

### [N6_NASIL] AST Pointer: CategoryContext.tsx::categoriesSlugMap useMemo callback
- **params**: (yok)
- **ic_degiskenler**:
  - `map` — new Map<string, DomainCategory>() ile oluşturulmuş boş harita
  - `c` — for döngüsündeki her bir kategori nesnesi
- **Dönüş**: slug ile DomainCategory eşleştiren dolu Map nesnesi

### [N7_NASIL] AST Pointer: CategoryContext.tsx::categoriesParentMap useMemo callback
- **params**: (yok)
- **ic_degiskenler**:
  - `map` — new Map<string, DomainCategory[]>() ile oluşturulmuş boş harita
  - `c` — for döngüsündeki her bir kategori nesnesi
  - `siblings` — belirli bir parent_id'ye sahip alt kategorilerin listesi
  - `a`, `b` — ikinci for döngüsünde sıralama yapılacak kategoriler
- **Dönüş**: parent_id ile alt kategori listelerini eşleştiren ve sıralanmış dolu Map nesnesi

### [N8_NASIL] AST Pointer: CategoryContext.tsx::value useMemo callback
- **params**: (yok)
- **ic_degiskenler**: (yok, sadece dış değişkenlere referans)
- **Dönüş**: `{ categories, categoryTree, loading, error, refresh: loadCategories, getCategoryBySlug, getSubCategories }` objesi

### [N9_NASIL] AST Pointer: CategoryContext.tsx::useCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `context` — useContext(CategoryContext) çağrısı ile elde edilen context değeri
- **Dönüş**: context (CategoryContext tipinde obje) veya hata fırlatır

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