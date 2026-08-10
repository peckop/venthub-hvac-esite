---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 57f57f8691d6baa3
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: 56739bf2be524198
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
ProjectProvider, VentHub HVAC projesinde proje verilerinin uygulama genelinde paylaşılmasını sağlayan temel bir React Context sağlayıcı bileşenidir. Bu bileşen, uygulama ağaçının üst katmanlarında yer alarak tüm alt bileşenlere prop drilling (prop iletmek) ihtiyacını ortadan kaldırır ve veriye merkezi bir erişim noktası sunar.

## Fonksiyon Grupları
### Bağlam Sağlayıcı
Uygulama genelinde kullanılacak proje verisi ve işlevselliğini tanımlayan bir React bağlamını (context) oluşturarak, tüm alt bileşenlere tutarlı ve erişilebilir bir veri katmanı sağlar.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar

ProjectProvider, React Context kullanarak proje verilerini alt bileşenlere ileten bir sağlayıcı bileşendir. Aşağıdaki varsayımlar fonksiyon imzası ve modül sabitlerine dayanmaktadır.

[Aksiyom 1]: Eğer `children` prop'u sağlanmazsa, sağlayıcı içeriği render etmeyeceği için alt bileşenler Proje bağlamına erişemez ve uygulama alanı boş kalır.

[Aksiyom 2]: Eğer `ProjectContext` çağrılmazsa (useContext içinde kullanılmazsa), alt bileşenler sağlanan proje verilerine erişemez.

[Aksiyom 3]: Eğer ProjectProvider bileşen hiyerarşisinde üst seviyede yer almazsa, alt bileşenlerin `ProjectContext` tüketimi başarısız olur veya varsayılan değer döner.

[Aksiyom 4]: Eğer ProjectProvider aynı anda birden fazla kez iç içe kullanılırsa, içteki sağlayıcı dıştakini geçersiz kılabilir (context override davranışı).

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

## İTHALATLAR (IMPORTS)
- import: ../hooks/useAuth::useAuth
- import: @/providers/SupabaseProvider::useSupabaseClient
- import: @/types/ui-models::type { ProjectItem,UserProject }
- import: react::React
- import: react::createContext
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState
- import: sonner::toast

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
- **params**: `{ children }` — React children prop
- **ic_degiskenler**:
  - `supabase` — useSupabaseClient() hook'undan alınan Supabase client instance, veritabanı işlemleri için kullanılır
  - `projects` — useState ile tanımlı state, kullanıcının projelerini tutan UserProject[] dizisi
  - `setProjects` — projects state'ini güncellemek için setter fonksiyonu
  - `loading` — useState ile tanımlı state, projelerin yüklenme durumunu belirten boolean
  - `setLoading` — loading state'ini güncellemek için setter fonksiyonu
  - `user` — useAuth() hook'undan alınan mevcut kullanıcının bilgileri
  - `refreshProjects` — projeleri yenileyen useCallback fonksiyonu
  - `addProject` — yeni proje ekleyen useCallback fonksiyonu
  - `removeProject` — proje silen useCallback fonksiyonu
  - `addItem` — projeye ürün ekleyen useCallback fonksiyonu
  - `removeItem` - projeden ürün çıkaran useCallback fonksiyonu
  - `getProjectItems` — projenin ürünlerini getiren useCallback fonksiyonu
  - `value` — useMemo ile memoize edilmiş context value nesnesi
- **Dönüş**: `<ProjectContext.Provider value={value}>` JSX elementi

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: yok
- **ic_degiskenler**:
  - `data` — listUserProjects(supabase) çağrısının sonucu, kullanıcının projeleri
- **Dönüş**: void (setProjects ile state günceller)

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffectCallback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: void (yan etki: refreshProjects çağırır veya state'i sıfırlar)

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `(name: string, description?: string)` — proje adı ve opsiyonel açıklama
- **ic_degiskenler**:
  - `newProject` — createProject() çağrısının sonucu, newly created project objesi
- **Dönüş**: UserProject objesi veya null

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `(id: string)` — silinecek projenin ID'si
- **ic_degiskenler**: yok
- **Dönüş**: void (setProjects ile state günceller)

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItem
- **params**: `(projectId: string, _productId: string, quantity: number = 1)` — proje ID, ürün ID, miktar
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItem
- **params**: `(projectId: string, _productId: string)` — proje ID, ürün ID
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `(projectId: string)` — ürünlerin getirileceği projenin ID'si
- **ic_degiskenler**:
  - `items` — listProjectItems(supabase, projectId) çağrısının sonucu, projenin ürünleri
- **Dönüş**: ProjectItem[] dizisi

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useMemoCallback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: context value nesnesi (`{ projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems }`)

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