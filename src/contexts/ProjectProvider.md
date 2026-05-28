---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 6ae7fa1c5d619da2
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: e11e6cdd2715b5f3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde uygulama genelinde proje bağlamını merkezileştiren bir React Context sağlayıcısıdır. Projeyle ilgili paylaşılan durum ve verileri, bu sağlayıcı ile sarmalanmış tüm alt bileşenlere erişilebilir kılarak proje verilerinin yönetimini tek bir noktadan tutarlı hale getirir. Bileşen ağacının üst seviyelerinde konumlanarak tüm tüketici bileşenlere proje kapsamında ortak veri ve işlevler sunar.

## Fonksiyon Grupları
### Ana Bağlam Sağlayıcısı
Uygulama içeriğini sarmalayarak proje bağlamını tüm alt bileşenlere ileten tek bileşendir. Proje verilerinin, durumlarının ve ilgili işlevlerin paylaşıldığı temel erişim noktasıdır.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar

ProjectProvider, React Context API üzerinden proje verilerini alt bileşenlere ileten bir sağlayıcı bileşenidir; doğru çalışması için aşağıdaki mimari varsayımların karşılanması gerekir.

---

**[Aksiyom 1]**: Eğer `ProjectContext` tanımlı değilse veya geçer bir React Context nesnesi içermiyorsa, sağlayıcı bağlam değerlerini alt bileşenlere aktaramaz ve `useProject` gibi tüketici hook'ları `undefined` döner.

**[Aksiyom 2]**: Eğer `children` prop'u verilmezse veya geçer bir ReactNode içermiyorsa, sağlayıcı içinde render edilecek bileşen olmaz ve bağlam hiçbir tüketiciye ulaşmaz.

**[Aksiyom 3]**: Eğer `ProjectProvider`, `ProjectContext`'i tüketen herhangi bir alt bileşenin üst React ağaç yapısında yer almıyorsa, o bileşenler proje verilerine erişemez ve bağımlılık hataları oluşur.

**[Aksiyom 4]**: Eğer `ProjectContext` için sağlanan değer (value) nesnesi, proje verilerini (proje listesi, aktif proje, yükleme durumu vb.) içermiyorsa, alt bileşenler geçersiz veya eksik veri ile çalışır — ancak bu değerlerin içeriği modül imzasından belirlenememektedir.

**[Aksiyom 5]**: Eğer `ProjectProvider` birden fazla kez iç içe kullanılırsa, iç içe geçmiş en içteki sağlayıcının değeri tüm alt bileşenler tarafından görünür olur (React Context override davranışı).

---

## FONKSİYON DETAYLARI

### ProjectProvider
**Ne yapar**: ProjectProvider, React Context API kullanarak proje ile ilgili verileri ve işlevsellikleri alt bileşenlere (children) sağlayan bir Context Provider bileşenidir. Bu bileşen, uygulama genelinde proje verilerinin erişilebilirliğini ve paylaşılmasını kolaylaştırır.

**Nasıl yapar**: React'ın Context Provider desenini uygulayarak, sarmaladığı tüm alt bileşenlere proje bağlamını (context) iletir. children prop'u aracılığıyla içeriye alınan bileşenler, bu sağlayıcı tarafından sunulan değerlere ve fonksiyonlara erişebilir hale gelir.

**Parametreler**:
- `children`: React.ReactNode — Provider bileşeninin içinde sarılacak alt bileşenlerdir. Bu prop, Proje bağlamının erişilebilir olacağı tüm alt bileşenleri kapsar.

**Dönüş**: `React.FC<{ children: React.ReactNode }>` — JSX döndüren bir React Fonksiyonel Bileşeni. Children prop'unu alır ve sağlayıcı sarmalayıcısı içinde render eder.

**Notlar**: Bu bileşen, React Context deseninin temel yapısını izleyerek proje verilerinin bileşen ağacının derinliklerine prop drilling ihtiyacı olmadan iletilmesini sağlar. Tipik olarak React.createContext ile oluşturulan bir Context nesnesinin Provider bileşeni olarak kullanılır.

---

## INTERFACES

### ProjectContextType
- `projects: UserProject[]`
- `loading: boolean`
- `refreshProjects: () => Promise<void>`
- `addProject: (name: string, description?: string) => Promise<UserProject | null>`
- `removeProject: (id: string) => Promise<void>`
- `addItem: (projectId: string, _productId: string, quantity?: number) => Promise<void>`
- `removeItem: (projectId: string, _productId: string) => Promise<void>`
- `getProjectItems: (projectId: string) => Promise<ProjectItem[]>`

---

## SABİTLER
- **ProjectContext** (call) — `createContext<ProjectContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::ProjectProvider
- **params**: `children` — React.ReactNode, Provider içine yerleştirilecek alt bileşenler
- **ic_degiskenler**:
  - `projects` — state, kullanıcının projelerinin listesi (UserProject[])
  - `setProjects` — projects state'ini güncellemek için setter fonksiyonu
  - `loading` — state, proje listesi yüklenirken true olan bayrak
  - `setLoading` — loading state'ini güncellemek için setter fonksiyonu
  - `user` — useAuth() hook'undan dönen oturum açmış kullanıcı nesnesi
  - `refreshProjects` — useCallback ile tanımlanmış, projeleri yeniden yükleyen fonksiyon
  - `addProject` — useCallback ile tanımlanmış, yeni proje ekleyen fonksiyon
  - `removeProject` — useCallback ile tanımlanmış, projeyi silen fonksiyon
  - `addItem` — useCallback ile tanımlanmış, ürüne projeye ekleyen fonksiyon
  - `removeItem` — useCallback ile tanımlanmış, ürünü projeden çıkaran fonksiyon
  - `getProjectItems` — useCallback ile tanımlanmış, projenin ürünlerini getiren fonksiyon
  - `value` — useMemo ile hesaplanmış, tüm value ve fonksiyonları içeren context nesnesi
- **Dönüş**: `<ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>` bileşeni

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — listUserProjects() API çağrısından dönen ve UserProject[] türüne cast edilen proje listesi
- **Dönüş**: void (asenkron, projects state'ini günceller, loading state'ini yönetir)

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffect (initial effect)
- **params**: (yok, arrow function içinde tanımlı)
- **ic_degiskenler**: (yok, doğrudan state'leri ve fonksiyonları kullanır)
- **Dönüş**: void (yan etki: user olduğunda refreshProjects çağırır, olmadığında state'leri sıfırlar)

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `name` (string) — oluşturulacak projenin adı, `description?` (string | undefined) — opsiyonel proje açıklaması
- **ic_degiskenler**:
  - `newProject` — createProject() API çağrısından dönen ve projenin tüm verilerini tutan nesne
- **Dönüş**: UserProject | null (başarılı ise yeni proje nesnesi, değilse null)

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `id` (string) — silinecek projenin benzersiz tanımlayıcısı
- **ic_degiskenler**: (yok)
- **Dönüş**: void (asenkron, projects state'inden projeyi çıkarır)

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItem
- **params**: `projectId` (string) — ürünün ekleneceği projenin ID'si, `_productId` (string) — eklenecek ürünün ID'si, `quantity` (number, varsayılan: 1) — eklenecek ürün miktarı
- **ic_degiskenler**: (yok)
- **Dönüş**: void (asenkron, sadece toast bildirimi gösterir)

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItem
- **params**: `projectId` (string) — ürünün çıkarılacağı projenin ID'si, `_productId` (string) — çıkarılacak ürünün ID'si
- **ic_degiskenler**: (yok)
- **Dönüş**: void (asenkron, sadece toast bildirimi gösterir)

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `projectId` (string) — ürünleri getirilecek projenin ID'si
- **ic_degiskenler**:
  - `items` — listProjectItems() API çağrısından dönen ve ProjectItem[] türüne cast edilen proje ürünleri listesi
- **Dönüş**: Promise<ProjectItem[]> (başarılı ise ürün listesi, hata durumunda boş dizi [])

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::value useMemo
- **params**: (yok, useMemo içindeki arrow function)
- **ic_degiskenler**: (yok, doğrudan state'leri ve tanımlanmış fonksiyonları bir nesne olarak toplar)
- **Dönüş**: Object ({ projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems })

---

## NODE ID STANDARD

  file: src\contexts\ProjectProvider.tsx
  function: src\contexts\ProjectProvider.tsx::ProjectProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProjectProvider

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