---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CategoryContext.tsx
skeleton_hash: 68788c4cd2c40323
entity_hashes:
  func:CategoryProvider: 664f5248857922aa
  func:useCategories: bc181eebe7b5a618
  overview: b140c4299b34113c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:42Z
---

## Genel Bakış
React tabanlı HVAC yönetim projesi içerisinde yer alan bu modül, uygulama genelinde kategori verilerini tüm alt bileşenlerle güvenli bir şekilde paylaşmak için geliştirilmiş React Context modülüdür. Kategori yönetimi state'ini merkezi hale getirerek her bileşenin tekrar state tanımlamasına gerek kalmadan kategorilere erişmesini sağlar.

## Fonksiyon Grupları
### Context Sağlayıcısı
Uygulama içindeki tüm alt bileşenleri sarmalayarak kategori state ve ilgili işlevlerine erişim imkanı sunan ana sağlayıcı işlevi içerir.
- CategoryProvider

### Context Erişim Hook'u
Tanımlanan kategori context'ine herhangi bir bileşenden kolayca ve güvenli bir şekilde erişmek için kullanılan özel React hook'unu barındırır.
- useCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React Context yapısı üzerine kuruludur ve kategori verilerinin paylaşımını merkezileştirir.

**[Aksiyom 1]:** Eğer `CategoryContext` nesnesi (`React.createContext` ile) oluşturulmamışsa, `CategoryProvider` bileşeni bağlam değerini alt bileşenlere iletemez ve `useCategories` hook'u geçersiz bir bağlam döndürür.

**[Aksiyom 2]:** Eğer `CategoryProvider` bileşeni `children` prop'u olmadan çağrılırsa, hiyerarşide alt bileşen render edilmez; uygulama içinde kategori bağlamına ihtiyaç duyan hiçbir bileşen çalışmaz.

**[Aksiyom 3]:** Eğer `useCategories()` hook'u, `CategoryProvider` sarmalayıcısı dışında bir bileşende çağrılırsa, hook bağlam değerini `undefined` olarak döndürür veya hata fırlatır (React'in `useContext` davranışına bağlı).

**[Aksiyom 4]:** Eğer `CategoryProvider` içeresinde sağlanan bağlam değeri değiştirilirse (örn. kategori listesi güncellenirse), `useCategories()` kullanan tüm abone bileşenler yeniden render edilir.

---

> **Not:** Fonksiyon imzalarında kategori verisinin yapısı, yükleme durumu veya hata yönetimi gibi detaylar açıkça tanımlı değildir; bu nedenle bu alanlarda varsayımda bulunulmamıştır.

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

### [N1_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::CategoryProvider
- **params**: `children` — React.ReactNode, provider bileşeninin içinde render edilen çocuk elemanlar
- **ic_degiskenler**:
  - `categories` — useState ile tanımlanan DomainCategory[] state'i, tüm kategorileri tutar
  - `loading` — useState ile tanımlanan boolean state, veri yükleme durumunu belirtir
  - `error` — useState ile tanımlanan string | null state, hata mesajını tutar
  - `loadCategories` — useCallback ile tanımlanan asenkron fonksiyon, kategorileri getirir ve state'i günceller
  - `categoryTree` — useMemo ile hesaplanan, parent_id olmayan sıralanmış ana kategori listesi
  - `categoriesSlugMap` — useMemo ile hesaplanan Map<string, DomainCategory>, slug ile O(1) erişim sağlar
  - `categoriesParentMap` — useMemo ile hesaplanan Map<string, DomainCategory[]>, parent_id ile alt kategorileri gruplar
  - `getCategoryBySlug` — useCallback ile tanımlanan, slug'a göre kategori döndüren fonksiyon
  - `getSubCategories` — useCallback ile tanımlanan, parentId ile alt kategorileri döndüren fonksiyon
  - `value` — useMemo ile hesaplanan context value nesnesi, sağlanması gereken tüm değer ve fonksiyonları birleştirir
- **Dönüş**: JSX — CategoryContext.Provider bileşeni, value ile children'ı sarar

### [N2_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::loadCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `data` — getCategories() API çağrısından dönen ham kategori verisi
  - `domainCats` — toUICategoryList(data) ile DomainCategory[] formatına dönüştürülmüş kategori listesi
  - `err` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: Promise\<void\> — async fonksiyon, state'leri yan etkilerle günceller (setCategories, setError, setLoading)

### [N3_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::useEffect_callback
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan loadCategories() çağırır)
- **Dönüş**: void — bileşen mounts oldığında loadCategories'i tetikler

### [N4_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::categoryTree
- **params**: (yok)
- **ic_degiskenler**:
  - `mainCats` — categories.filter(c => !c.parent_id) ile elde edilen, kök (ana) kategoriler listesi
  - `a` — sort karşılaştırmasında birinci DomainCategory nesnesi
  - `b` — sort karşılaştırmasında ikinci DomainCategory nesnesi
  - `orderA` — a.metadata?.sort_order ?? 0 ile elde edilen birinci kategorinin sıralama değeri
  - `orderB` — b.metadata?.sort_order ?? 0 ile elde edilen ikinci kategorinin sıralama değeri
- **Dönüş**: DomainCategory[] — sort_order'a göre artan sıralanmış ana kategoriler dizisi

### [N5_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::sort_comparator
- **params**: `a` — DomainCategory, sıralanacak birinci kategori; `b` — DomainCategory, sıralanacak ikinci kategori
- **ic_degiskenler**:
  - `orderA` — (a.metadata as CategoryMetadata | null)?.sort_order ?? 0 — a kategorisinin metadata sort_order değeri, null ise 0
  - `orderB` — (b.metadata as CategoryMetadata | null)?.sort_order ?? 0 — b kategorisinin metadata sort_order değeri, null ise 0
- **Dönüş**: number — orderA - orderB farkı, negatif/sıfır/pozitif

### [N6_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::categoriesSlugMap
- **params**: (yok)
- **ic_degiskenler**:
  - `map` — new Map<string, DomainCategory>(), slug anahtarlı lookup haritası
  - `c` — for döngüsünde gezilen her bir DomainCategory nesnesi
- **Dönüş**: Map<string, DomainCategory> — slug ile O(1) kategori erişimi sağlayan harita

### [N7_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::categoriesParentMap
- **params**: (yok)
- **ic_degiskenler**:
  - `map` — new Map<string, DomainCategory[]>(), parent_id anahtarlı, alt kategorileri gruplayan harita
  - `c` — birinci for döngüsünde gezilen her bir DomainCategory nesnesi
  - `siblings` —同一 parent_id'ye sahip kategorilerin listesi (map.get ile alınır veya oluşturulur)
  - `[key, siblings]` — ikinci for döngüsünde map.entries() ile iterasyon yapılan her entry
  - `a` — inner sort karşılaştırmasında birinci DomainCategory nesnesi
  - `b` — inner sort karşılaştırmasında ikinci DomainCategory nesnesi
- **Dönüş**: Map<string, DomainCategory[]> — parent_id ile alt kategorileri gruplayan ve her grubu sort_order'a göre sıralamış harita

### [N8_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::getCategoryBySlug
- **params**: `slug` — string, aranacak kategorinin slug değeri
- **ic_degiskenler**: (yok — doğrudan categoriesSlugMap.get(slug) çağırır)
- **Dönüş**: DomainCategory | undefined — slug eşleşen kategori veya bulunamazsa undefined

### [N9_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::getSubCategories
- **params**: `parentId` — string, alt kategorileri getirilecek üst kategorinin ID'si
- **ic_degiskenler**: (yok — doğrudan categoriesParentMap.get(parentId) || [] çağırır)
- **Dönüş**: DomainCategory[] — parentId'e ait alt kategoriler dizisi, bulunamazsa boş dizi

### [N10_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::value
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan literal object döndürür)
- **Dönüş**: Object — { categories, categoryTree, loading, error, refresh, getCategoryBySlug, getSubCategories } context value nesnesi

### [N11_NASIL] AST Pointer: src/contexts/CategoryContext.tsx::useCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `context` — useContext(CategoryContext) ile alınan CategoryContext değeri, undefined olabilir
- **Dönüş**: CategoryContextType — context değeri; provider dışında kullanılırsa Error fırlatır

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