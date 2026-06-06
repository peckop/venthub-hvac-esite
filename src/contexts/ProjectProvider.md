---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: f2ea064a0c459f86
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: fd3dc605fff4d3d0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:55:18Z
---

## Genel Bakış
ProjectProvider modülü, VentHub HVAC projesinde proje verilerini ve ilgili durumları uygulama genelinde yönetmek için kullanılan bir React Context sağlayıcısıdır. Bileşen ağacının üst seviyelerinde yer alarak tüm alt bileşenlere proje kapsamında tutarlı veri erişimi sunar.

## Fonksiyon Grupları
### Bağlam Sağlayıcı
Uygulamanın üst seviye bileşenlerinden birini temsil eder; çocuk bileşenleri sarmalayarak proje bağlamını tüm alt bileşenlere iletir.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesine dayalı çıkarılabilecek spesifik mimari varsayımlar sınırlıdır. Aşağıdakiler imzadan türetilebilen temel gereksinimlerdir:

**[Aksiyom 1]**: Eğer `children` prop'u sağlanmazsa, `ProjectProvider` bileşeni içerik render etmez ve alt bileşenlere bağlam sunulmaz.

**[Aksiyom 2]**: Eğer `ProjectContext` doğru oluşturulmaz veya dışa aktarılmazsa, tüketiciler proje verilerine erişemez.

---

**Not**: Bu modül minimal bir React Context Provider yapısındadır. Fonksiyon gövdesi detayları paylaşılmadığı için, bağlam değerinin içeriği, başlatma mantığı veya state yönetimi gibi konularda aksiyom üretilememektedir. Daha ayrıntılı aksiyomlar için `ProjectProvider` fonksiyon gövdesinin tamamı gereklidir.

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

### [N1_NASIL] AST Pointer: ProjectProvider.tsx::ProjectProvider
- **params**: ({ children }) — React.ReactNode, React context provider'ın içeriği
- **ic_degiskenler**:
  - `projects` — useState ile tutulan proje listesi, UserProject[] türünde, tüm projeleri depolar
  - `loading` — useState ile tutulan boolean, verilerin yüklenme durumunu gösterir
  - `user` — useAuth() hook'undan dönen authenticated kullanıcı nesnesi
  - `refreshProjects` — useCallback ile sarılmış, projeleri yeniden yükleyen fonksiyon
  - `addProject` — useCallback ile sarılmış, yeni proje oluşturan fonksiyon
  - `removeProject` — useCallback ile sarılmış, proje silen fonksiyon
  - `addItem` — useCallback ile sarılmış, projeye ürün ekleyen fonksiyon
  - `removeItem` — useCallback ile sarılmış, projeden ürün çıkaran fonksiyon
  - `getProjectItems` — useCallback ile sarılmış, projenin ürünlerini getiren fonksiyon
  - `value` — useMemo ile oluşturulan context value nesnesi, tüm state ve fonksiyonları içerir
- **Dönüş**: JSX (ProjectContext.Provider bileşeni)

### [N2_NASIL] AST Pointer: ProjectProvider.tsx::refreshProjects
- **params**: (yok) — useCallback içinde, bağımlılık: [user]
- **ic_degiskenler**:
  - `data` — listUserProjects() API çağrısından dönen proje listesi verisi
- **Dönüş**: void (async, return yok)

### [N3_NASIL] AST Pointer: ProjectProvider.tsx::useEffect_callback
- **params**: (yok) — useEffect hook'u içinde çalışır
- **ic_degiskenler**: yok
- **Dönüş**: void

### [N4_NASIL] AST Pointer: ProjectProvider.tsx::addProject
- **params**: (name: string, description?: string) — proje adı ve opsiyonel açıklama
- **ic_degiskenler**:
  - `newProject` — createProject() API çağrısından dönen yeni oluşturulmuş proje nesnesi
- **Dönüş**: Promise<UserProject | null> — başarılsızsa null, başarırsa UserProject

### [N5_NASIL] AST Pointer: ProjectProvider.tsx::removeProject
- **params**: (id: string) — silinecek projenin ID'si
- **ic_degiskenler**: yok
- **Dönüş**: void (async, return yok)

### [N6_NASIL] AST Pointer: ProjectProvider.tsx::addItem
- **params**: (projectId: string, _productId: string, quantity: number = 1) — proje ID, ürün ID, miktar
- **ic_degiskenler**: yok
- **Dönüş**: void (async, return yok)

### [N7_NASIL] AST Pointer: ProjectProvider.tsx::removeItem
- **params**: (projectId: string, _productId: string) — proje ID ve ürün ID
- **ic_degiskenler**: yok
- **Dönüş**: void (async, return yok)

### [N8_NASIL] AST Pointer: ProjectProvider.tsx::getProjectItems
- **params**: (projectId: string) — ürünlerin alınacağı projenin ID'si
- **ic_degiskenler**:
  - `items` — listProjectItems() API çağrısından dönen ürün listesi verisi
- **Dönüş**: Promise<ProjectItem[]> — proje öğeleri dizisi

### [N9_NASIL] AST Pointer: ProjectProvider.tsx::useMemo_value
- **params**: (yok) — useMemo hook'u içinde çalışır
- **ic_degiskenler**: yok (mevcut değişkenleri bir araya getirir)
- **Dönüş**: nesne — { projects, loading, refreshProjects, addProject, removeProject, addItem, removeItem, getProjectItems }

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