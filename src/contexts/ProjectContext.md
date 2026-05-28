---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx
skeleton_hash: 0ca82cae15ab546c
entity_hashes:
  overview: 24280a0c197e7d12
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:26Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasında proje verilerinin uygulama genelinde paylaşılmasını sağlayan React Context tanımıdır. Supabase veritabanından gelen `UserProject`, `ProjectItem` ve `Product` tiplerini içe aktararak, tüm bileşenler tarafından erişilebilir bir `ProjectContext` bağlam nesnesi oluşturur. Dosya herhangi bir iş mantığı veya fonksiyon barındırmaz; sadece proje verileri (projeler, yükleme durumu, ekleme/silme işlemleri) için gerekli bağlam altyapısını tanımlar.

## Modül Yapısı

- **Bağımlılıklar:** React kütüphanesinden `createContext` ve Supabase tipleri (`UserProject`, `ProjectItem`, `Product`) kullanılır
- **Oluşturulan bağlam:** `ProjectContext` nesnesi, uygulama hiyerarşisindeki tüm alt bileşenlere proje verilerini sağlamak için tasarlanmıştır
- **İşlevsellik:** Dosya salt tanım (declaration) içerir; gerçek veri işleme ve API çağrıları bu bağlamı sağlayan (Provider) bileşenlerde gerçekleştirilir

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React uygulama ağacındaki alt bileşenlerin proje verilerine erişebilmesi için zorunlu bir Context (bağlam) sağlayıcısı (Provider) altyapısı tanımlar.

[Aksiyom 1]: Eğer `ProjectContext.Provider` bileşeni, uygulama hiyerarşisinin üst seviyelerinde (`App` veya bir üst düzey layout bileşeni gibi) doğru `value` prop'u ile sarılmamışsa, bu bağlamı kullanan tüm alt bileşenler `undefined` veya varsayılan başlangıç değeri alır ve beklenmeyen davranışlara neden olur.

[Aksiyom 2]: Eğer `ProjectContext`'e sarılan (`Provider` ile çevrelenen) bir bileşen, içinde bulunduğu bağlam nesnesini (`useContext(ProjectContext)`) kullanmıyorsa veya yanlış bir bağlam nesnesi kullanıyorsa, bu bileşen proje verilerine erişemez veya tutarsız veri ile karşılaşır.

[Aksiyom 3]: Eğer `ProjectContext` için tanımlanan başlangıç değeri (initial value) `null`, `undefined` veya geçersiz bir yapıda ise, bağlamı tüketen bileşenlerin ilk render'ında `TypeError` veya “Cannot read property of undefined” gibi hatalar oluşur.

---

## FONKSİYON DETAYLARI

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