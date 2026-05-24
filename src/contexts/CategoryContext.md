---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: 68788c4cd2c40323
generated_at: 2026-05-23T22:29:05Z
---

## Genel Bakış
React tabanlı HVAC yönetim projesi içerisinde yer alan bu modül, uygulama genelinde kategori verilerini tüm alt bileşenlerle güvenli bir şekilde paylaşmak için geliştirilmiş React Context modülüdür. Kategori yönetimi state'ini merkezi hale getirerek her bileşenin tekrar state tanımlamasına gerek kalmadan kategorilere erişmesini sağlar.

## Fonksiyon Grupları
### Context Sağlayıcısı
Uygulama içindeki tüm alt bileşenleri sarmalayarak kategori state ve ilgili işlevlerine erişim imkanı sunan ana sağlayıcı işlevi içerir.
- CategoryProvider

### Context Erişim Hook'u
Tanımlanan kategori context'ine herhangi bir bileşenden kolayca ve güvenli bir şekilde erişmek için kullanılan özel React hook'unu barındırır.
- useCategories

---

## AXIOMS – Mimari Varsayımlar
Bu React Context modülü, uygulama genelindeki kategori verilerini tüm alt bileşenlere paylaştırmak için tasarlanmıştır, doğru çalışması yalnızca modülün kurulum ve çalışma zamanı koşullarına tam uyulmasıyla mümkündür.

[Aksiyom 1]: Eğer CategoryProvider bileşeni, useCategories() hook'unu çağıran tüm bileşenleri içeren bir üst ağaçta konumlanmamışsa, useCategories() çağrısı çalışma zamanı hatası fırlatır, kategori verilerine erişim sağlanamaz.
[Aksiyom 2]: Eğer CategoryProvider bileşenine zorunlu children prop'u geçirilmezse, provider tarafından sarmalanması gereken hiçbir alt bileşen çalışmaz, ekrana ilgili içerik yansıtılamaz.
[Aksiyom 3]: Eğer CategoryContext nesnesi çalışma zamanında tanımsız veya bozuk kalırsa, provider ile alt bileşenler arasındaki durum aktarımı tamamen kesilir, tüm kategori ile ilgili işlemler başarısız olur.
[Aksiyom 4]: Eğer uygulama çalışma zamanı React Context API ve hook mekanizmalarını desteklemiyorsa, modülün hiçbir bileşeni çalışmaz, kategori durum paylaşımı hiçbir şekilde gerçekleştirilemez.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider
- **params**: children: React.ReactNode
- **ic_degiskenler**:
  - `categories` — DomainCategory tipinde tüm kategori listesini tutan React state'i
  - `setCategories` — categories state'ini güncellemek için kullanılan state setter fonksiyonu
  - `loading` — Kategori yükleme işleminin durumunu tutan boolean state, true iken yükleme devam ediyor
  - `setLoading` — loading state'ini güncellemek için kullanılan state setter fonksiyonu
  - `error` - Yükleme sırasında oluşan hataları tutan string | null state'i
  - `setError` — error state'ini güncellemek için kullanılan state setter fonksiyonu
  - `loadCategories` — Kategorileri veritabanından çekip state'leri güncelleyen useCallback ile sarmalanmış async fonksiyon
  - `categoryTree` — Ana kategorileri (parent_id'si olmayan) içeren sıralanmış ağaç yapısı, useMemo ile önbelleğe alınmış
  - `categoriesSlugMap` - Slug üzerinden kategoriye O(1) erişim sağlayan Map nesnesi, useMemo ile önbelleğe alınmış
  - `categoriesParentMap` - Üst kategori ID'si üzerinden alt kategorilere erişim sağlayan Map nesnesi, useMemo ile önbelleğe alınmış
  - `getCategoryBySlug` - Slug ile kategori sorgulayan useCallback ile sarmalanmış yardımcı fonksiyon
  - `getSubCategories` - Üst kategori ID'si ile alt kategorileri sorgulayan useCallback ile sarmalanmış yardımcı fonksiyon
  - `value` - Context sağlayıcısı tarafından paylaşılan tüm state ve fonksiyonları içeren nesne, useMemo ile önbelleğe alınmış
- **Dönüş**: <CategoryContext.Provider> ile sarmalanmış JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::loadCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — Supabase'den çekilen ham kategori verisi
  - `domainCats` — Ham verinin domain tipine dönüştürülmüş kategori listesi
  - `err` - Try-catch bloğunda yakalanan yükleme hatası nesnesi
- **Dönüş**: Promise<void>

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.useEffect_callback
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.categoryTree_memo_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `mainCats` - parent_id'si olmayan ana kategorilerin filtrelendiği geçici liste
  - `orderA` - Sıralama için a kategorisinin sort_order metadata değeri
  - `orderB` - Sıralama için b kategorisinin sort_order metadata değeri
- **Dönüş**: Sıralanmış ana kategori listesi (DomainCategory[])

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.categoryTree_sort_callback
- **params**: a: DomainCategory, b: DomainCategory
- **ic_degiskenler**:
  - `orderA` - a kategorisinin sıralama için kullanılan sort_order metadata değeri
  - `orderB` - b kategorisinin sıralama için kullanılan sort_order metadata değeri
- **Dönüş**: Sıralama farkını belirten number

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.categoriesSlugMap_memo_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `map` - Slug ile kategori eşleştirmesi yapan yeni Map nesnesi
  - `c` - Dizi döngüsünde işlenen geçici kategori nesnesi
- **Dönüş**: Slug üzerinden erişim sağlayan Map<string, DomainCategory>

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.categoriesParentMap_memo_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `map` - Üst kategori ID'si ile alt kategori listelerini eşleştiren yeni Map nesnesi
  - `c` - İlk döngüde işlenen geçici kategori nesnesi
  - `siblings` - Aynı üst kategoriye sahip alt kategorilerin geçici listesi
  - `a` - Alt kategori sıralamasında işlenen ilk kategori nesnesi
  - `b` - Alt kategori sıralamasında işlenen ikinci kategori nesnesi
- **Dönüş**: Üst kategori ID'si üzerinden alt kategorilere erişim sağlayan Map<string, DomainCategory[]>

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::CategoryProvider.value_memo_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `categories` - Tüm kategori listesi
  - `categoryTree` - Sıralanmış ana kategori ağacı
  - `loading` - Yükleme durumu
  - `error` - Yükleme hatası
  - `refresh` - Yeniden yükleme için kullanılan loadCategories referansı
  - `getCategoryBySlug` - Slug ile kategori sorgulama fonksiyonu
  - `getSubCategories` - Üst ID ile alt kategori sorgulama fonksiyonu
- **Dönüş**: Context tarafından paylaşılan tüm değerleri içeren nesne

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx::useCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `context` - useContext ile çekilen CategoryContext değeri
- **Dönüş**: CategoryContext nesnesi

---

## NODE ID STANDARD

  file: src\contexts\CategoryContext.tsx
  function: src\contexts\CategoryContext.tsx::CategoryProvider
  function: src\contexts\CategoryContext.tsx::useCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryProvider
  export: useCategories