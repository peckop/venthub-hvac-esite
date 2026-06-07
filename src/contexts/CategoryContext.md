---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: ff5eed69181f5d50
entity_hashes:
  func:CategoryProvider: 664f5248857922aa
  func:useCategories: bc181eebe7b5a618
  overview: a88f952f06e9968e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-07T12:04:21Z
---

## Genel Bakış
CategoryContext modülü, React uygulaması genelinde kategori verilerinin tutarlı bir şekilde paylaşılmasını ve yönetimini sağlayan merkezi bir yapıdır. CategoryProvider bileşeni, kategori verisi ve ilgili durumları alt bileşenlere aktarırken, useCategories hook'u bu verilere kolay erişim imkanı tanır.

## Fonksiyon Grupları
### Kategori Sağlayıcı
Uygulama ağaç yapısının üst seviyelerinde yer alarak, kategori verisi ve durumunu içeren React Context değerini tüm alt bileşenler için hazırlar ve sağlar.
- CategoryProvider

### Kategori Erişim Aracı
Alt bileşenler içinde, CategoryProvider tarafından sağlanan kategori verisine ve ilgili araçlara erişim sağlamak için güvenli ve kullanımı kolay bir React Hook'u sunar.
- useCategories

---



---

## FONKSİYON DETAYLARI

### CategoryProvider
**Ne yapar**: Uygulama genelinde merkezi kategori otoritesi olarak çalışan React Context sağlayıcısıdır, tüm uygulama ağacındaki bileşenlerin paylaşılan kategori hiyerarşisine erişmesini ve bu veriyi tutarlı şekilde yönetmesini sağlar. Tüm uygulama genelinde kategori verisinin tek merkezden yönetilmesini mümkün kılar.
**Nasıl yapar**: React'ın Context API altyapısını kullanarak, kendisi ile sarmalanmış tüm alt bileşenlere kategori state'ini ve ilgili yönetim işlevlerini aktarır. Kategori verisindeki herhangi bir değişikliği tüm tüketici bileşenlere senkronize ederek veride tutarsızlık oluşmasını engeller.
**Parametreler**:
- children: React.ReactNode — CategoryProvider tarafından sarmalanan, uygulamanın tüm alt ağacını oluşturan React çocuk elemanlarıdır, provider tarafından sağlanan kategori verisine erişim hakkı kazanır.
**Dönüş**: React.FC<{ children: React.ReactNode }> türünde, içerisine aldığı children elemanını kategori context sağlayıcısı ile sarmalayarak ekranda render eden bir React bileşeni döndürür.

### useCategories
**Ne yapar**: CategoryProvider tarafından sağlanan merkezi kategori verisine ve yönetim işlevlerine erişim sağlayan özel React hook'udur. Sadece CategoryProvider altında çalışan bileşenler içinde kullanılabilir, uygulamanın herhangi bir noktasından kategori verisine güvenli erişim imkanı sunar.
**Nasıl yapar**: CategoryProvider tarafından oluşturulan özel context nesnesini tüketerek, context içindeki tüm değerleri çağrıldığı bileşene sunar. Eğer yanlışlıkla CategoryProvider dışında çağrılırsa geçerli bir bağlam olmadığı için hata fırlatarak yanlış kullanımı önler.
**Parametreler**: Hiçbir giriş parametresi almaz.
**Dönüş**: Kaynak kodda dönüş tipi açıkça tanımlanmamış, void veya bilinmiyor olarak belirtilmiştir. Çalışma prensibi gereği CategoryProvider tarafından yönetilen kategori hiyerarşisi ve ilgili yönetim işlevlerini içeren bir nesne döndürmesi amaçlanmıştır.

---

## INTERFACES

### CategoryContextType
- `categories: DomainCategory[]`
- `categoryTree: DomainCategory[]`
- `loading: boolean`
- `error: string | null`
- `refresh: () => Promise<void>`
- `getCategoryBySlug: (slug: string) => DomainCategory | undefined`
- `getSubCategories: (_parentId: string) => DomainCategory[]`

---

## SABİTLER
- **CategoryContext** (call) — `createContext<CategoryContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryContext.tsx::CategoryProvider
- **params**: ({ children }) — children: React.ReactNode, provider'ın sarmalayacağı alt bileşenler
- **ic_degiskenler**:
  - `categories` — Kategorilerin listesi, state olarak tutulur (DomainCategory[])
  - `loading` — Kategorilerin yüklenme durumu (boolean)
  - `error` — Hata mesajı varsa tutulur (string | null)
  - `loadCategories` — Kategorileri API'den yükleyen asenkron fonksiyon (useCallback ile memoize)
  - `categoryTree` — Ana kategorileri (parent_id olmayanları) sıralı olarak tutan memoize edilmiş ağaç yapısı
  - `categoriesSlugMap` — Slug bazlı hızlı erişim için Map yapısı (slug -> DomainCategory)
  - `categoriesParentMap` — Parent ID bazlı hızlı erişim için Map yapısı (parent_id -> DomainCategory[])
  - `getCategoryBySlug` — Slug ile kategori getiren memoize fonksiyon
  - `getSubCategories` — Parent ID ile alt kategorileri getiren memoize fonksiyon
  - `value` — Context değerini oluşturan memoize obje
- **Dönüş**: React.FC<{ children: React.ReactNode }> — CategoryContext.Provider ile sarmalanmış children

### [N2_NASIL] AST Pointer: CategoryContext.tsx::useCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — CategoryContext'ten alınan değer, useCategories hook'u
- **Dönüş**: CategoryContext tipinde context değeri (eğer provider dışındaysa hata fırlatır)

---

## NODE ID STANDARD

  file: src\contexts\CategoryContext.tsx
  function: src\contexts\CategoryContext.tsx::CategoryProvider
  function: src\contexts\CategoryContext.tsx::useCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryProvider
  export: useCategories

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