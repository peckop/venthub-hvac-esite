---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\ProjectProvider.tsx
skeleton_hash: 8d3b3c56d1a49e26
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: 07aebfab05dea5e2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-29T18:47:23Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde uygulama genelinde proje bağlamını merkezileştiren bir React Context sağlayıcısıdır. Projeyle ilgili paylaşılan durum ve verileri, bu sağlayıcı ile sarmalanmış tüm alt bileşenlere erişilebilir kılarak proje verilerinin yönetimini tek bir noktadan tutarlı hale getirir. Bileşen ağacının üst seviyelerinde konumlanarak tüm tüketici bileşenlere proje kapsamında ortak veri ve işlevler sunar.

## Fonksiyon Grupları
### Ana Bağlam Sağlayıcısı
Uygulama içeriğini sarmalayarak proje bağlamını tüm alt bileşenlere ileten tek bileşendir. Proje verilerinin, durumlarının ve ilgili işlevlerin paylaşıldığı temel erişim noktasıdır.
- ProjectProvider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Açıklama:** `ProjectProvider` bileşeni, sadece `children` prop'unu kabul eden ve React Context Provider yapısıyla sarmalama (wrapping)职责 üstlenen bir üst seviye sağlayıcı bileşenidir. Fonksiyon gövdesinde herhangi bir koşul kontrolü, veri doğrulama, eşik değeri veya zorunlu bağımlılık bildirimi bulunmamaktadır. Modülün doğru çalışması için gereken koşullar (örn: `ProjectContext`'in doğru sarmalanmış olması, üst bileşen ağacının yapılandırılması vb.) fonksiyon imzası ve gövdesinde açıkça belirtilmediği için bu durumlar **bilinmiyor** olarak değerlendirilmiştir. Aksiyonlar, modül içeriğinden üretilemediği için tanımlanamamıştır.

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
- **params**: `(children)`
- **ic_degiskenler**:
  - `projects` — Proje listesini tutan state (UserProject[] tipinde, başlangıçta boş dizi)
  - `loading` — Yüklenme durumunu tutan state (boolean, başlangıçta true)
  - `user` — useAuth hook'undan alınan mevcut kullanıcı nesnesi
  - `refreshProjects` — Projeleri yenileyen async fonksiyon (useCallback ile memoize edilmiş)
  - `addProject` — Yeni proje oluşturan async fonksiyon (useCallback ile memoize edilmiş)
  - `removeProject` — Proje silen async fonksiyon (useCallback ile memoize edilmiş)
  - `addItem` — Projeye ürün ekleyen async fonksiyon (useCallback ile memoize edilmiş)
  - `removeItem` — Projeden ürün çıkaran async fonksiyon (useCallback ile memoize edilmiş)
  - `getProjectItems` — Proje ürünlerini getiren async fonksiyon (useCallback ile memoize edilmiş)
  - `value` — Context değerini oluşturan useMemo nesnesi
- **Dönüş**: `<ProjectContext.Provider>` JSX elemanı (children ile sarılmış)

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: `(yok)`
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen mevcut kullanıcı (koşul kontrolü: user varsa devam et)
  - `setLoading` — Yüklenme durumunu güncelleyen state setter
  - `data` — listUserProjects API çağrısının dönüş değeri (UserProject[] dizisi)
  - `setProjects` — Projeleri güncelleyen state setter
- **Dönüş**: Promise<void> (async fonksiyon, return yok)

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffect callback
- **params**: `(yok)`
- **ic_degiskenler**:
  - `user` — useAuth hook'undan gelen mevcut kullanıcı (koşul kontrolü)
  - `refreshProjects` — Projeleri yenileyen fonksiyon (koşulda çağrılır)
  - `setProjects` — Projeleri güncelleyen state setter (user yoksa [] ile çağrılır)
  - `setLoading` — Yüklenme durumunu güncelleyen state setter (user yoksa false ile çağrılır)
- **Dönüş**: yok (effect side-effect için)

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `(name: string, description?: string)`
- **ic_degiskenler**:
  - `user?.id` — Mevcut kullanıcının ID'si (koşul kontrolü: id varsa devam et)
  - `toast` — Bildirim gösteren sonner fonksiyonu
  - `newProject` — createProject API çağrısının dönüş değeri (oluşturulan proje nesnesi)
  - `setProjects` — Projeleri güncelleyen state setter (önceki listeye yeni projeyi ekler)
- **Dönüş**: `UserProject | null` (başarılı olursa proje, olmazsa null)

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `(id: string)`
- **ic_degiskenler**:
  - `id` — Silinecek projenin ID'si
  - `toast` — Bildirim gösteren sonner fonksiyonu
  - `deleteProject` — Proje silme API çağrısı (id parametresi ile)
  - `setProjects` — Projeleri güncelleyen state setter (filtreleme ile silinen projeyi kaldırır)
- **Dönüş**: Promise<void> (async fonksiyon, return yok)

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItem
- **params**: `(projectId: string, _productId: string, quantity: number = 1)`
- **ic_degiskenler**:
  - `projectId` — Ürünün ekleneceği projenin ID'si
  - `_productId` — Eklenecek ürünün ID'si (underscore ile belirtilmiş, doğrudan kullanılmaz)
  - `quantity` — Eklenecek ürün miktarı (varsayılan 1)
  - `toast` — Bildirim gösteren sonner fonksiyonu
  - `addProductToProject` — Ürüne projeye ekleme API çağrısı (projectId, _productId, quantity parametreleri ile)
- **Dönüş**: Promise<void> (async fonksiyon, return yok)

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItem
- **params**: `(projectId: string, _productId: string)`
- **ic_degiskenler**:
  - `projectId` — Ürünün çıkarılacağı projenin ID'si
  - `_productId` — Çıkarılacak ürünün ID'si (underscore ile belirtilmiş)
  - `toast` — Bildirim gösteren sonner fonksiyonu
  - `removeProductFromProject` — Ürünü projeden çıkarma API çağrısı (projectId, _productId parametreleri ile)
- **Dönüş**: Promise<void> (async fonksiyon, return yok)

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `(projectId: string)`
- **ic_degiskenler**:
  - `projectId` — Ürünleri getirilecek projenin ID'si
  - `items` — listProjectItems API çağrısının dönüş değeri (ProjectItem[] dizisi)
- **Dönüş**: `Promise<ProjectItem[]>` (başarılı olursa ürünler dizisi, hata olursa boş dizi)

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::value useMemo
- **params**: `(yok)`
- **ic_degiskenler**:
  - `projects` — Proje listesi state değişkeni
  - `loading` — Yüklenme durumu state değişkeni
  - `refreshProjects` — Projeleri yenileyen fonksiyon
  - `addProject` — Yeni proje oluşturan fonksiyon
  - `removeProject` — Proje silen fonksiyon
  - `addItem` — Projeye ürün ekleyen fonksiyon
  - `removeItem` — Projeden ürün çıkaran fonksiyon
  - `getProjectItems` — Proje ürünlerini getiren fonksiyon
- **Dönüş**: `ProjectContextValue` nesnesi (tüm value özelliklerini içeren)

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