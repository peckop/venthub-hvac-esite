---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 58fcf7c654a51a80
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: 71feeb2615451519
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T13:59:21Z
---

## Genel Bakış
ProjectProvider, VentHub HVAC projesinde proje verilerinin uygulama genelinde paylaşılmasını sağlayan bir React Context sağlayıcı bileşenidir. Bileşen ağacının üst katmanlarında konumlandırılarak, prop drilling ihtiyacını ortadan kaldırır ve tüm alt bileşenlere tutarlı veri erişimi sunar.

## Fonksiyon Grupları
### Bağlam Sağlayıcı
Uygulama içindeki proje verilerini ve ilgili işlevsellikleri merkezi bir noktadan yöneterek alt bileşenlere iletir.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar

ProjectProvider modülü, bir React Context sağlayıcısı olarak proje verilerini alt bileşenlere iletmek için tasarlanmıştır. Aşağıdaki mimari varsayımlar, fonksiyon imzası ve modül sabitlerine dayanmaktadır:

[Aksiyom 1]: Eğer `children` parametresi geçilmezse veya `undefined`/`null` olursa, provider bileşeni geçerli bir React node render edemez ve bileşen ağacında hata oluşur.

[Aksiyom 2]: Eğer `ProjectContext` modül seviyesinde doğru tanımlanmamış veya dışa aktarılmamışsa, provider'ın sağlayacağı bağlam değeri alt bileşenlere ulaştırılamaz ve `useContext(ProjectContext)` kullanan tüm alt bileşenler `undefined` değer alır.

[Aksiyom 3]: Eğer `children` JSX elementi içermiyorsa (boş fragment veya empty array), provider geçerli birReact ağacı oluşturur ancak hiçbir alt bileşene bağlam sağlamaz.

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
- **params**: `{ children }` — React bileşen çocukları
- **ic_degiskenler**:
  - `supabase` — Supabase istemcisi, `useSupabaseClient()` hook'undan alınır, tüm API çağrılarında kullanılır
  - `projects` — `useState<UserProject[]>([])` ile oluşturulan proje listesi state'i
  - `loading` — `useState(true)` ile oluşturulan yükleme durumu flag'i
  - `user` — `useAuth()` hook'undan alınan mevcut oturum açmış kullanıcı nesnesi
  - `refreshProjects` — useCallback ile sarılmış, projeleri API'den çekip state'i güncelleyen fonksiyon
  - `addProject` — useCallback ile sarılmış, yeni proje oluşturan fonksiyon
  - `removeProject` — useCallback ile sarılmış, proje silen fonksiyon
  - `addItem` — useCallback ile sarılmış, projeye ürün ekleyen fonksiyon
  - `removeItem` — useCallback ile sarılmış, projeden ürün çıkaran fonksiyon
  - `getProjectItems` — useCallback ile sarılmış, projenin ürünlerini getiren fonksiyon
  - `value` — `useMemo` ile oluşturulan, context'e verilen değer nesnesi
- **Dönüş**: `<ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>` JSX

---

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: yok
- **ic_degiskenler**:
  - `data` — `await listUserProjects(supabase)` çağrısının dönüş değeri, proje listesi
- **Dönüş**: `void` (async, return değeri yok)

---

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffect (projeleri yükleme efekti)
- **params**: yok (anonim arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: yok (side-effect: `refreshProjects()` çağırır veya `projects`/`loading` state'lerini sıfırlar)

---

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `name: string`, `description?: string` (opsiyonel)
- **ic_degiskenler**:
  - `newProject` — `await createProject(supabase, { name, description, user_id: user.id })` çağrısının dönüşü, newly created proje nesnesi
- **Dönüş**: `Promise<UserProject | null>` — başarıysa `newProject`, hata/sebep yoksa `null`

---

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `id: string` — silinecek projenin ID'si
- **ic_degiskenler**: yok
- **Dönüş**: `Promise<void>` (return yok)

---

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItem
- **params**: `projectId: string`, `_productId: string`, `quantity: number = 1`
- **ic_degiskenler**: yok
- **Dönüş**: `Promise<void>` (return yok)

---

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItem
- **params**: `projectId: string`, `_productId: string`
- **ic_degiskenler**: yok
- **Dönüş**: `Promise<void>` (return yok)

---

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `projectId: string`
- **ic_degiskenler**:
  - `items` — `await listProjectItems(supabase, projectId)` çağrısının dönüşü, proje ürünleri listesi
- **Dönüş**: `Promise<ProjectItem[]>` — başarıysa `items`, hata ise boş dizi `[]`

---

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::value (useMemo callback)
- **params**: yok (anonim arrow function)
- **ic_degiskenler**: yok (dışarıdaki `projects`, `loading`, `refreshProjects`, `addProject`, `removeProject`, `addItem`, `removeItem`, `getProjectItems` değişkenlerini doğrudan referans olarak döndürür)
- **Dönüş**: nesne — `{ projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems }`

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