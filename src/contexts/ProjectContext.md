---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectContext.tsx
skeleton_hash: 27a16878530613c5
entity_hashes:
  overview: f1d38a9d20d9fa96
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış

Bu modül, VentHub HVAC uygulamasında proje verilerinin bileşenler arasında paylaşılmasını sağlayan React Context tanımını oluşturur. `UserProject`, `ProjectItem` ve `Product` gibi Supabase veritabanı tiplerini içe aktararak `ProjectContext` adlı bir bağlam nesnesi tanımlar; gerçek veri işleme ve state yönetimi ise bu bağlamı sağlayan Provider bileşeninde (başka bir dosyada) gerçekleştirilir. Dosya modül seviyesinde herhangi bir fonksiyon veya iş mantığı içermez — yalnızca tip güvenli veri paylaşımının temel taşını koyar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, veri paylaşımı için temel React Context tanımını içerir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer bu context'i sağlayan (Provider) bir üst bileşen (örn. `App.tsx` gibi) uygulamanın kök seviyesinde veya ilgili alt ağaçlarda yer almıyorsa, `ProjectContext`'e erişmeye çalışan tüm alt bileşenler `undefined` bir değer alır ve uygulama hata verir veya veri gösteremez.

[Aksiyom 2]: Eğer `ProjectContext.Provider` bileşeni render edilirken `value` prop'una (`undefined` veya `null` yerine) geçerli bir başlangıç nesnesi (örn. `{ project: null, loading: false }`) atanmıyorsa, consumers bileşenlerde beklenmeyen `null/undefined` referans hataları oluşur.

[Aksiyom 3]: Eğer `ProjectContext`'i tüketen (consume eden) bir bileşen, `useContext` hook'u ile bağlamı alırken, bağlamı sağlayan Provider'ın yukarıdaki hiyerarşide bulunmadığı bir render ağacının parçası ise, bileşen bağlam yerine doğrudan varsayılan değeri alır ve uygulama tutarsız davranış gösterir.

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

Bu dosyada analiz edilecek **fonksiyon gövdesi bulunmamaktadır**.

`ProjectContext.tsx` dosyası yalnızca bir React Context nesnesi tanımlaması içermektedir:

### [N1_NASIL] AST Pointer: src/contexts/ProjectContext.tsx::ProjectContext (context oluşturma)
- **params**: createContext() — parametre yok (veya opsiyonel başlangıç değeri verilmemiş)
- **ic_degiskenler**: yok (fonksiyon gövdesi mevcut değil — doğrudan modül seviyesinde `createContext` çağrısı)
- **Dönüş**: `React.Context<ProjectItem | UserProject | Product | null>` olarak beklenen context nesnesi (tür bilgisi import edilen tiplerden türetilmiş)

**Not:** Dosyada import edilen tipler:
- `Product` — ürün modeli
- `ProjectItem` — proje öğesi modeli
- `UserProject` — kullanıcı projesi modeli

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