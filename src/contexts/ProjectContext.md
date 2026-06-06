---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx
skeleton_hash: d6d5b7190c071445
entity_hashes:
  overview: b4447e01cfb0157f
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:55:08Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasında proje verilerinin tüm bileşenler tarafından erişilebilir olmasını sağlayan React Context (bağlam) altyapısını tanımlar. Dosya, `UserProject`, `ProjectItem` ve `Product` gibi Supabase veritabanı tiplerini içe aktararak `ProjectContext` adında bir bağlam nesnesi oluşturur. Modülde herhangi bir işlevsel fonksiyon veya API çağrısı bulunmaz; sadece veri paylaşımının temelini oluşturan tanım (declaration) katmanıdır.

## Fonksiyon Grupları

Bu dosyada fonksiyon veya metod bulunmamaktadır. Modül, sadece React Context tanımı ve ilgili tiplerin import edilmesinden ibaret olup, gerçek veri işleme ve bileşen mantığı farklı dosyalarda (örneğin Provider bileşeninde) yer almaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir React Context tanımıdır ve fonksiyon gövdesi içermemektedir; yalnızca `createContext` çağrısıyla bir bağlam nesnesi oluşturmaktadır. Aşağıdaki varsayımlar modülün yapısına ve bağlam kullanım modeline dayanmaktadır.

**[Aksiyom 1]:** Eğer `ProjectContext` sağlayan bir Provider bileşeni uygulama bileşen hiyerarşisinde tanımlanmamışsa, `useContext(ProjectContext)` kullanan tüm alt bileşenler `undefined` değer alır ve proje verilerine erişemez.

**[Aksiyom 2]:** Eğer içe aktarılan Supabase tipleri (`UserProject`, `ProjectItem`, `Product`) geçerli bir Supabase şemasıyla eşleşmiyor veya tanımsızsa, TypeScript derleme zamanında tip hatası oluşur; çalışma zamanında veri tutarsızlıkları meydana gelir.

**[Aksiyom 3]:** Eğer `ProjectContext`'e verilen başlangıç değeri (default value) bileşenlerin gerçek kullanım ihtiyacını karşılamıyorsa (örn: `projects` dizisi boş iken bileşenler `map` işlemi yapıyorsa), çalışma zamanında `TypeError` oluşur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx::ProjectContext
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `createContext()` çağrısının sonucu olan bir React.Context nesnesi (UserProject, ProjectItem veya Product tiplerini içerebilir)

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