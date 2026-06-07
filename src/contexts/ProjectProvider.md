---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 6383d4f1d0d1af7c
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: 7b19cf98c513be4c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T12:04:50Z
---

## Genel Bakış
ProjectProvider modülü, VentHub HVAC projesinde proje verilerini ve ilgili durumları uygulama genelinde yönetmek için kullanılan bir React Context sağlayıcısıdır. Bileşen ağacının üst seviyelerinde yer alarak tüm alt bileşenlere proje kapsamında tutarlı veri erişimi sunar.

## Fonksiyon Grupları
### Bağlam Sağlayıcı
Uygulamanın üst seviye bileşenlerinden birini temsil eder; çocuk bileşenleri sarmalayarak proje bağlamını tüm alt bileşenlere iletir.
- ProjectProvider

---



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
- **params**: `children` — React child bileşenleri, provider içinde render edilir
- **ic_degiskenler**:
  - `projects` — Kullanıcının projelerini tutan state, `UserProject[]` tipinde, başlangıçta boş dizi
  - `loading` — Proje yükleme durumunu belirten boolean state, başlangıçta `true`
  - `user` — `useAuth()` hook'undan gelen mevcut kullanıcı nesnesi
  - `refreshProjects` — Projeleri API'den yeniden yükleyen memoized callback fonksiyon
  - `addProject` — Yeni proje oluşturan memoized callback fonksiyon
  - `removeProject` — Proje silen memoized callback fonksiyon
  - `addItem` — Projeye ürün ekleyen memoized callback fonksiyon
  - `removeItem` — Projeden ürün çıkaran memoized callback fonksiyon
  - `getProjectItems` — Proje ürünlerini getiren memoized callback fonksiyon
  - `value` — Context değerini oluşturan memoized nesne, tüm state ve fonksiyonları içerir
- **Dönüş**: `<ProjectContext.Provider>` bileşeni, value prop'u ile children'ı sarar

---

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: yok
- **ic_degiskenler**:
  - `data` — `listUserProjects(supabaseBrowserClient)` çağrısından dönen proje listesi, `UserProject[]` tipine cast edilir
- **Dönüş**: yok (void)

---

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffect_callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok (void) — `user` varsa `refreshProjects()` çağırır, yoksa `projects`'i boşaltır ve `loading`'i `false` yapar

---

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `name` (string — proje adı), `description` (string, optional — proje açıklaması)
- **ic_degiskenler**:
  - `newProject` — `createProject(supabaseBrowserClient, { name, description, user_id: user.id })` çağrısından dönen yeni oluşturulan proje nesnesi
- **Dönüş**: `newProject` (başarılıysa) veya `null` (hata olursa veya kullanıcı giriş yapmamışsa)

---

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `id` (string — silinecek projenin ID'si)
- **ic_degiskenler**: yok
- **Dönüş**: yok (void) — `deleteProject(supabaseBrowserClient, id)` çağırır ve `projects` state'inden filter ile çıkarır

---

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItem
- **params**: `projectId` (string — ürün eklenecek projenin ID'si), `_productId` (string — eklenecek ürünün ID'si), `quantity` (number, default 1 — ürün miktarı)
- **ic_degiskenler**: yok
- **Dönüş**: yok (void) — `addProductToProject(supabaseBrowserClient, projectId, _productId, quantity)` çağırır

---

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItem
- **params**: `projectId` (string — projeden ürün çıkarılacak projenin ID'si), `_productId` (string — çıkarılacak ürünün ID'si)
- **ic_degiskenler**: yok
- **Dönüş**: yok (void) — `removeProductFromProject(supabaseBrowserClient, projectId, _productId)` çağırır

---

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `projectId` (string — ürünleri getirilecek projenin ID'si)
- **ic_degiskenler**:
  - `items` — `listProjectItems(supabaseBrowserClient, projectId)` çağrısından dönen proje ürün listesi, `ProjectItem[]` tipine cast edilir
- **Dönüş**: `Promise<ProjectItem[]>` — başarıyla `items` döner, hata olursa boş dizi `[]` döner

---

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::value_memo
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems }` — Context'e verilen değer nesnesi

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