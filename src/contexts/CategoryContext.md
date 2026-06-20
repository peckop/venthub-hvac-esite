---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: 71f3f2d0cbdb978b
entity_hashes:
  func:CategoryProvider: 664f5248857922aa
  func:useCategories: bc181eebe7b5a618
  overview: 0e5af7c9035631ab
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
CategoryContext modülü, React uygulaması genelinde kategori verilerinin tutarlı bir şekilde paylaşılmasını ve yönetimini sağlayan merkezi bir yapıdır. `CategoryProvider` bileşeni, kategori verisi ve ilgili durumları alt bileşenlere aktarırken, `useCategories` hook'u bu verilere kolay erişim imkanı tanır.

## Fonksiyon Grupları
### Kategori Sağlayıcı
Uygulama ağaç yapısının üst seviyelerinde yer alarak, kategori verisi ve durumunu içeren React Context değerini tüm alt bileşenler için hazırlar ve sağlar.
- CategoryProvider

### Kategori Erişim Aracı
Alt bileşenler içinde, `CategoryProvider` tarafından sağlanan kategori verisine ve ilgili araçlara erişim sağlamak için güvenli ve kullanımı kolay bir React Hook'u sunar.
- useCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React Context yapısına dayalı bir kategori veri paylaşım mekanizmasıdır. Aşağıdaki mimari varsayımlar, fonksiyon imzaları ve modül sabitlerinden çıkarılmıştır.

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

## İTHALATLAR (IMPORTS)
- import: ../lib/type-converters::DomainCategory
- import: ../lib/type-converters::toUICategoryList
- import: ../types/db-rows::type { CategoryMetadata }
- import: @/lib/services/category.service::getCategories
- import: @/providers/SupabaseProvider::useSupabaseClient
- import: react::React
- import: react::createContext
- import: react::useCallback
- import: react::useContext
- import: react::useEffect
- import: react::useMemo
- import: react::useState

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

### [N1_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::CategoryProvider
- **params**: `children` — React child bileşenleri, provider içerisinde render edilecek olan JSX
- **ic_degiskenler**:
  - `supabase` — `useSupabaseClient()` hook'undan elde edilen Supabase istemci nesnesi, servis çağrıları için kullanılır
  - `categories` / `setCategories` — `useState<DomainCategory[]>([])` state'i, yüklenen tüm kategorileri tutar; başlangıç değeri boş dizi
  - `loading` / `setLoading` — `useState(true)` state'i, veri yükleme durumunu belirtir; başlangıç değeri `true`
  - `error` / `setError` — `useState<string | null>(null)` state'i, hata mesajını tutar; başlangıç değeri `null`
  - `loadCategories` — `useCallback` ile sarılmış async fonksiyon, kategorileri yükler ve state'leri günceller
  - `categoryTree` — `useMemo` ile hesaplanan, `parent_id`'si olmayan ana kategorilerin `sort_order`'a göre sıralanmış dizisi
  - `categoriesSlugMap` — `useMemo` ile hesaplanan `Map<string, DomainCategory>`, slug anahtarlarıyla O(1) erişim sağlar
  - `categoriesParentMap` — `useMemo` ile hesaplanan `Map<string, DomainCategory[]>`, parent_id anahtarlarıyla alt kategorileri gruplar ve sıralar
  - `getCategoryBySlug` — `useCallback` ile sarılmış fonksiyon, slug ile tek bir kategoriyi `categoriesSlugMap`'ten getirir
  - `getSubCategories` — `useCallback` ile sarılmış fonksiyon, parentId ile alt kategorileri `categoriesParentMap`'ten getirir; bulunamazsa boş dizi döner
  - `value` — `useMemo` ile hesaplanan context value nesnesi, tüm state ve fonksiyonları birleştirir
- **Dönüş**: `JSX.Element` — `<CategoryContext.Provider value={value}>` ile sarılmış `{children}` döner

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