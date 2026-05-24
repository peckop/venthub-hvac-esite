---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 6ae7fa1c5d619da2
generated_at: 2026-05-23T22:29:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde uygulama genelinde proje bağlamını merkezileştiren bir React Context sağlayıcısıdır. Projeyle ilgili paylaşılan state ve verileri, bu sağlayıcı ile sarmalanmış tüm alt bileşenlere erişilebilir kılar, proje verileri yönetimini tek bir merkezden toplar.

## Fonksiyon Grupları
### Ana Bağlam Sağlayıcısı
Proje bağlamını uygulama içindeki tüm alt React bileşenlerine ileten tek root giriş noktasıdır. Sarmaladığı bileşenlerin proje verilerine ortak olarak erişmesini sağlayan temel sağlayıcı görevini üstlenir.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar
ProjectProvider, React Context API üzerinden proje kapsamındaki alt bileşenlere paylaşılabilir proje bağlamı verileri sunan bir React sağlayıcı bileşenidir, doğru çalışması için React Context altyapısının ve iletilen children prop'unun geçerli olmasına bağlıdır.

[Aksiyom 1]: Eğer ProjectProvider'a iletilen children prop'u geçerli React alt node'lerini içermiyorsa, sağlayıcı tarafından sarmalanan hiçbir bileşen ekrana işlenemez.
[Aksiyom 2]: Eğer modül tarafından kullanılan ProjectContext nesnesi tanımlı ve erişilebilir değilse, hiçbir alt bileşen provider tarafından paylaşılan proje bağlamı verilerine erişemez.
[Aksiyom 3]: Eğer ProjectProvider, proje bağlamını tüketen tüm React bileşenlerinden uygulama ağacında daha alt seviyede konumlanmışsa, tüketici bileşenler bağlam değerlerine erişemez, bağlam tüketimi sırasında hata oluşur.

---

## FONKSIYON DETAYLARI

### ProjectProvider
**Ne yapar**: Uygulama genelinde proje ile ilgili tüm verileri, durumları ve işlevleri alt React bileşenleriyle paylaşan React context tabanlı bir sağlayıcı bileşenidir. Proje bağlamına ihtiyaç duyan tüm alt elemanların, bu sağlayıcı aracılığıyla ortak proje verilerine güvenli bir şekilde erişmesini sağlar.
**Nasıl yapar**: React'in Context API altyapısını kullanarak çalışan bir sarmalayıcı bileşen olarak görev görür, aldığı çocuk elemanları bağlam sağlayıcısı içine alarak içindeki tüm alt bileşenlere proje bağlamındaki değerleri iletir. Tüm proje ile ilgili verilerin tek bir merkezden yönetilmesini ve aynı değerlerin tüm ilgili bileşenlere ulaştırılmasını garanti eder.
**Parametreler**:
- children: React.ReactNode — ProjectProvider bileşeni tarafından sarmalanan, proje bağlamına erişmesi gereken tüm alt React elemanlarıdır. Uygulamanın bu sağlayıcı kapsamında kalan, proje verilerini kullanması gereken tüm bölümlerini temsil eder.
**Dönüş**: Props olarak aldığı children elemanını kendi bağlam sağlayıcısı içinde sarmalayarak render eden React.FC tipi bir bileşen döndürür. Döndürdüğü bu bileşen, uygulama içinde proje bağlamının etkin olduğu çalışma alanını tanımlar ve altındaki tüm bileşenlerin bağlam üzerinden proje verilerine erişmesine izin verir.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::ProjectProvider
- **params**: [children]
- **ic_degiskenler**:
  - `projects` — Kullanıcının sahip olduğu projeleri saklayan state dizisi, UserProject[] tipinde
  - `setProjects` — projects state'ini güncellemek için kullanılan state setter fonksiyonu
  - `loading` — Proje verileri yüklenirken durumunu saklayan boolean state
  - `setLoading` — loading state'ini güncellemek için kullanılan state setter fonksiyonu
  - `user` — useAuth hook'undan alınan oturum açmış kullanıcı nesnesi
  - `refreshProjects` — Kullanıcının projelerini yeniden yüklemek için tanımlanan useCallback fonksiyonu
  - `addProject` — Yeni proje oluşturmak için tanımlanan useCallback fonksiyonu
  - `removeProject` — Mevcut projeyi silmek için tanımlanan useCallback fonksiyonu
  - `addItem` — Projeye ürün eklemek için tanımlanan useCallback fonksiyonu
  - `removeItem` — Projeden ürün çıkarmak için tanımlanan useCallback fonksiyonu
  - `getProjectItems` — Belirli bir projenin ürünlerini listelemek için tanımlanan useCallback fonksiyonu
  - `value` — useMemo ile sarmalanan, context tarafından paylaşılan tüm değerleri içeren nesne
- **Dönüş**: İçinde children prop'unu barındıran ProjectContext.Provider bileşeni

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::refreshProjects
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — Bağımlılığı olan oturumlu kullanıcı nesnesi, varlığı öncelikle kontrol edilir
  - `setLoading` — Yükleme durumunu açıp kapatmak için kullanılan state setter
  - `listUserProjects` — Kullanıcının projelerini getirmek için çağrılan API fonksiyonu
  - `data` — listUserProjects çağrısından dönen ham veri, UserProject[] tipine cast edilir
  - `setProjects` — Proje listesini güncellemek için kullanılan state setter
  - `console.error` — Hata durumunda konsola hata mesajı yazdırmak için kullanılır
- **Dönüş**: Kullanıcı yoksa erken return, aksi halde void, sadece state güncellemeleri yapar

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` — Bağımlılığı olan kullanıcı nesnesi, varlığı kontrol edilir
  - `refreshProjects` — Kullanıcı varsa çağrılan proje yenileme fonksiyonu
  - `setProjects` — Kullanıcı yoksa proje listesini boşaltmak için kullanılan state setter
  - `setLoading` — Yükleme durumunu false yapmak için kullanılan state setter
- **Dönüş**: void, sadece state güncellemeleri yapar

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::addProject
- **params**: [name, description?]
- **ic_degiskenler**:
  - `user?.id` — Kullanıcının kimlik numarası, varlığı öncelikle kontrol edilir
  - `toast.error` — Hata veya yetkisiz durumunda bildirim göstermek için kullanılan fonksiyon
  - `createProject` — Yeni proje oluşturmak için çağrılan API fonksiyonu, name, description, user_id parametrelerini alır
  - `newProject` — createProject çağrısından dönen yeni oluşturulan proje nesnesi
  - `setProjects` — Proje listesinin başına yeni projeyi eklemek için önceki state'i alan setter
  - `toast.success` — Başarılı işlem sonrası bildirim göstermek için kullanılan fonksiyon
- **Dönüş**: Hata veya kullanıcı yoksa null, başarılı olursa newProject nesnesi döner

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::removeProject
- **params**: [id]
- **ic_degiskenler**:
  - `deleteProject` — Silinecek proje kimliği ile çağrılan proje silme API fonksiyonu
  - `setProjects` — Silinen projeyi listeden çıkarmak için önceki state'i filtreleyen setter
  - `toast.success` — Başarılı silme işlemi sonrası bildirim gösterir
  - `toast.error` — Hata durumunda hata bildirimi gösterir
- **Dönüş**: void, sadece API ve state işlemleri yapar

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::addItem
- **params**: [projectId, _productId, quantity=1]
- **ic_degiskenler**:
  - `addProductToProject` — Projeye ürün eklemek için çağrılan API fonksiyonu, proje kimliği, ürün kimliği ve miktar alır
  - `toast.success` — Ürün başarıyla eklendiğinde bildirim gösterir
  - `toast.error` — Ekleme işlemi başarısız olursa hata bildirimi gösterir
- **Dönüş**: void, sadece API işlemleri ve bildirimler yapar

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::removeItem
- **params**: [projectId, _productId]
- **ic_degiskenler**:
  - `removeProductFromProject` — Projeden ürün çıkarmak için çağrılan API fonksiyonu, proje ve ürün kimliklerini alır
  - `toast.success` — Ürün başarıyla çıkarıldığında bildirim gösterir
  - `toast.error` — Çıkarma işlemi başarısız olursa hata bildirimi gösterir
- **Dönüş**: void, sadece API işlemleri ve bildirimler yapar

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::getProjectItems
- **params**: [projectId]
- **ic_degiskenler**:
  - `listProjectItems` — Belirli projenin ürünlerini listelemek için çağrılan API fonksiyonu
  - `items` — API'den dönen ürün listesi, ProjectItem[] tipine cast edilir
  - `console.error` — Hata durumunda konsola hata mesajı yazdırır
- **Dönüş**: Başarılı olursa ProjectItem[] tipinde ürün listesi, hata durumunda boş dizi döner

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx::useMemo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `projects` — Context tarafından paylaşılacak proje listesi
  - `loading` — Context tarafından paylaşılacak yükleme durumu
  - `refreshProjects` — Context tarafından paylaşılacak proje yenileme fonksiyonu
  - `addProject` — Context tarafından paylaşılacak proje ekleme fonksiyonu
  - `removeProject` — Context tarafından paylaşılacak proje silme fonksiyonu
  - `addItem` — Context tarafından paylaşılacak projeye ürün ekleme fonksiyonu
  - `removeItem` — Context tarafından paylaşılacak projeden ürün çıkarma fonksiyonu
  - `getProjectItems` — Context tarafından paylaşılacak proje ürünlerini listeleme fonksiyonu
- **Dönüş**: Tüm context değerlerini içeren nesne, ProjectContext.Provider tarafından value olarak kullanılır

---

## NODE ID STANDARD

  file: src\contexts\ProjectProvider.tsx
  function: src\contexts\ProjectProvider.tsx::ProjectProvider

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProjectProvider