---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\contexts\ProjectProvider.tsx
skeleton_hash: cebb3ba11552a27d
entity_hashes:
  func:ProjectProvider: 48fd4159fdf830c0
  overview: 10389d4143ea4faf
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T06:55:18Z
---

## Genel Bakış
ProjectProvider, VentHub HVAC uygulamasında proje verilerinin alt bileşenlere prop drilling olmadan aktarılmasını sağlayan bir React Context sağlayıcı bileşendir. Uygulama ağaçının üst katmanlarında konumlandırılarak tüm alt bileşenler için merkezi bir veri erişim noktası oluşturur. Bileşen, `children` prop'u aracılığıyla kapsadığı alt bileşen ağacına proje bağlamını (context) iletir.

## Fonksiyon Grupları

### Bağlam Sağlayıcı
Uygulama genelinde kullanılacak proje verisini ve işlevselliğini tanımlayan bir React bağlamını oluşturarak tüm alt bileşenlere tutarlı ve erişilebilir bir veri katmanı sağlar. Bileşen hiyerarşisinde üst seviyede yer alması gerekir; aksi halde alt bileşenlerin bağlam tüketimi başarısız olur veya varsayılan değer döner.
- ProjectProvider

## Bağımlılıklar ve Mimari Notlar

**Dış bağımlılıklar**: React kütüphanesi (Context API, `children` prop yapısı).

**İç bağımlılıklar**: Modül, `ProjectContext` adlı bir bağlam nesnesi tanımlar veya içe aktarır; bu bağlam alt bileşenler tarafından `useContext` ile tüketilir.

**Mimari önem**: Bu bileşen, uygulama genelinde proje verilerinin tekil ve tutarlı bir kaynaktan sağlanmasından sorumludur. Birden fazla iç içe kullanıldığında içteki sağlayıcı dıştakini geçersiz kılabilir (context override davranışı).

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası (`ProjectProvider({ children })`) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden türetilir.

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
- import: ./ProjectContext::ProjectContext
- import: @/i18n/I18nProvider::useI18n
- import: @/providers/SupabaseProvider::useSupabaseClient
- import: @/types/ui-models::type { Product, ProjectItem, UserProject }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::ProjectProvider
- **params**: `children` — React.ReactNode tipinde alt bileşen
- **ic_degiskenler**:
  - `supabase` — useSupabaseClient() hook'undan alınan Supabase istemcisi
  - `t` — useI18n() hook'undan alınan çeviri fonksiyonu
  - `projects` — useState ile tanımlanmış UserProject[] durumu, kullanıcının projelerini tutar
  - `setProjects` — projects durumunu güncelleyen setter fonksiyonu
  - `loading` — useState ile tanımlanmış boolean, veri yükleniyor durumunu gösterir
  - `setLoading` — loading durumunu güncelleyen setter fonksiyonu
  - `user` — useAuth() hook'undan alınan kullanıcı bilgisi
  - `refreshProjects` — useCallback ile sarılmış, projeleri Supabase'den yeniden çeken async fonksiyon
  - `addProject` — useCallback ile sarılmış, yeni proje oluşturan async fonksiyon
  - `removeProject` — useCallback ile sarılmış, proje silen async fonksiyon
  - `addItemToProject` — useCallback ile sarılmış, projeye ürün ekleyen async fonksiyon
  - `removeItemFromProject` — useCallback ile sarılmış, projeden ürün çıkaran async fonksiyon
  - `getProjectItems` — useCallback ile sarılmış, projenin öğelerini getiren async fonksiyon
  - `value` — useMemo ile hesaplanmış, ProjectContext.Provider'a sağlanan context nesnesi
- **Dönüş**: JSX — ProjectContext.Provider ile sarılmış children

### [N2_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::refreshProjects
- **params**: yok
- **ic_degiskenler**:
  - `user` — dış kapsamdan erişilen kullanıcı bilgisi, yoksa fonksiyon erken döner
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `data` — listUserProjects(supabase) çağrısından dönen proje dizisi
- **Dönüş**: yok (async, yan etki: setProjects ve setLoading çağırır)

### [N3_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**:
  - `user` — dış kapsamdan erişilen kullanıcı bilgisi; varsa refreshProjects çağırır, yoksa projeleri boşaltır
- **Dönüş**: yok (yan etki: refreshProjects veya setProjects ve setLoading çağırır)

### [N4_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addProject
- **params**: `name` (string) — proje adı, `description` (string, opsiyonel) — proje açıklaması
- **ic_degiskenler**:
  - `user?.id` — dış kapsamdan erişilen kullanıcı ID'si; yoksa hata fırlatır
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu
  - `newProject` — createProject(supabase, { name, description, user_id: user.id }) çağrısından dönen yeni proje nesnesi
  - `prev` — setProjects callback'indeki önceki proje dizisi
  - `error` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: UserProject (newProject)

### [N5_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeProject
- **params**: `id` (string) — silinecek proje ID'si
- **ic_degiskenler**:
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu
  - `p` — setProjects filter callback'indeki her bir proje öğesi; p.id !== id koşuluyla filtrelenir
- **Dönüş**: yok (async, yan etki: deleteProject, setProjects ve toast çağırır)

### [N6_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::addItemToProject
- **params**: `projectId` (string) — hedef proje ID'si, `productId` (string) — eklenecek ürün ID'si, `quantity` (number, varsayılan 1) — miktar
- **ic_degiskenler**:
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu
  - `error` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: yok (async, yan etki: addProductToProject ve toast çağırır)

### [N7_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::removeItemFromProject
- **params**: `projectId` (string) — hedef proje ID'si, `productId` (string) — çıkarılacak ürün ID'si
- **ic_degiskenler**:
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `t` — dış kapsamdan erişilen çeviri fonksiyonu
- **Dönüş**: yok (async, yan etki: removeProductFromProject ve toast çağırır)

### [N8_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::getProjectItems
- **params**: `projectId` (string) — öğeleri getirilecek proje ID'si
- **ic_degiskenler**:
  - `supabase` — dış kapsamdan erişilen Supabase istemcisi
  - `items` — listProjectItems(supabase, projectId) çağrısından dönen ProjectItem dizisi
  - `i` — filter callback'indeki her bir öğe; i.product varlığı kontrol edilir
- **Dönüş**: `(ProjectItem & { product: Product })[]` — product alanı null olmayan öğeler dizisi; hata durumunda boş dizi

### [N9_NASIL] AST Pointer: src/contexts/ProjectProvider.tsx::useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `projects` — dış kapsamdan erişilen projeler durumu
  - `loading` — dış kapsamdan erişilen yükleme durumu
  - `refreshProjects` — dış kapsamdan erişilen projeleri yenileme fonksiyonu
  - `addProject` — dış kapsamdan erişilen proje ekleme fonksiyonu
  - `removeProject` — dış kapsamdan erişilen proje silme fonksiyonu
  - `addItemToProject` — dış kapsamdan erişilen projeye ürün ekleme fonksiyonu
  - `removeItemFromProject` — dış kapsamdan erişilen projeden ürün çıkarma fonksiyonu
  - `getProjectItems` — dış kapsamdan erişilen proje öğelerini getirme fonksiyonu
- **Dönüş**: object — ProjectContext.Provider'a sağlanan value nesnesi (projects, loading, refreshProjects, addProject, removeProject, addItemToProject, removeItemFromProject, getProjectItems alanlarını içerir)

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