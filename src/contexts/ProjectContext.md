---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx
skeleton_hash: 0ca82cae15ab546c
generated_at: 2026-05-23T22:28:59Z
---

## Genel Bakış
Bu React Context modülü, VentHub HVAC uygulamasında proje ile ilgili tüm verilerin uygulama genelindeki tüm bileşenler tarafından güvenli bir şekilde erişilebilmesini sağlamak amacıyla oluşturulmuştur. Supabase entegrasyonundan gelen kullanıcı projeleri, proje öğeleri ve ürün tiplerini içe aktararak, bu verileri saklamak ve paylaşmak için React'in `createContext` fonksiyonuyla `ProjectContext` bağlamını tanımlar. Modül herhangi bir işlem mantığı veya çalıştırılabilir fonksiyon barındırmaz, sadece uygulama genelinde proje verileri akışını sağlamak için gerekli bağlam altyapısını sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React ekosisteminde proje verilerini uygulamanın tüm ilgili alt bileşenleriyle paylaşmak için kullanılan bağlam nesnesi (ProjectContext) oluşturur, doğru çalışması için React kütüphanesinin ve Context API'nin çalışma zamanında mevcut olması zorunludur.

[Aksiyom 1]: Eğer React kütüphanesi modülün çalıştığı ortamda mevcut değilse, ProjectContext nesnesi oluşturulamaz, modülün kendisi çalışma sırasında başarısız olur.
[Aksiyom 2]: Eğer React Context API için gerekli createContext metodu çalışma zamanında erişilebilir değilse, bağlam nesnesi tanımlanamaz, context'i kullanan tüm bileşenler proje verilerine hiçbir şekilde erişemez.
[Aksiyom 3]: Eğer ProjectContext'i sağlayan (Provider) bir üst bileşen uygulama bileşen hiyerarşisinde mevcut değilse, context'i tüketen tüm alt bileşenler geçersiz/tanımsız veri alır, beklenen şekilde çalışamaz.

---



---

## INTERFACES

### ProjectContextType
- `projects: UserProject[]`
- `loading: boolean`
- `refreshProjects: () => Promise<void>`
- `addProject: (name: string, description?: string) => Promise<UserProject>`
- `removeProject: (projectId: string) => Promise<void>`
- `addItemToProject: (projectId: string, _productId: string, quantity?: number) => Promise<void>`
- `removeItemFromProject: (projectId: string, _productId: string) => Promise<void>`
- `getProjectItems: (projectId: string) => Promise<(ProjectItem & { product: Product })[]>`

---

## SABİTLER
- **ProjectContext** (call) — `createContext<ProjectContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx::ProjectContext oluşturma çağrısı
- **params**: (çağrıya gönderilen parametreler, eksik fonksiyon gövdesi nedeniyle tespit edilemedi)
- **ic_degiskenler**:
  - `ProjectContext` — React'in `createContext` API'si ile oluşturulan, uygulama genelinde projeyle ilgili verileri paylaşmak için kullanılan context nesnesi; ilişkili tipler import edilen `UserProject`, `ProjectItem`, `Product` olarak tanımlı
- **Dönüş**: React Context nesnesi, `createContext` API çağrısından döndürülen değer olarak atanır

---

## NODE ID STANDARD

  file: src\contexts\ProjectContext.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProjectContext
  export: ProjectContextType