---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryHero.tsx
skeleton_hash: 2839fbcf97470680
generated_at: 2026-05-23T21:58:13Z
---

## Genel Bakış
Bu modül, bir kategori sayfasının başlık bölümünü gösteren bir React bileşenidir. Kategori bilgileri, üst kategori, ürün sayısı ve yükleme durumu gibi verileri alarak kullanıcıya görsel bir başlık sunar ve geri dönüş işlevi için bir işleyici sağlar.

## Fonksiyon Grupları
### Render ve UI
Kullanıcıya kategori başlığını, üst kategori bağlantısını ve ürün sayısını görsel olarak düzenleyen bileşeni oluşturur.
- CategoryHero

### Etkileşim Mantığı
Kullanıcının üst kategoriye veya önceki sayfaya dönmesini sağlayan basit bir geri dönüş işleyicisini tanımlar.
- handleBack

---

## AXIOMS – Mimari Varsayımlar
CategoryHero bileşeninin render edilmesi ve `handleBack()` fonksiyonunun çağrılması için aşağıdaki koşullar sağlanmalıdır.

[Aksiyom 1]: Eğer `category` prop'u tanımlı değilse, bileşen kategori bilgisi gösteremeyecek ve boş veya hata durumu ortaya çıkabilir.  
[Aksiyom 2]: Eğer `parentCategory` prop'u tanımlı değilse, üst kategori bağlantısı gösterilmeyecek veya varsayılan olarak kök kategori kabul edilebilir.  
[Aksiyom 3]: Eğer `productCount` prop'u sayısal bir değer değilse, ürün sayısı gösterimi beklenen formatta olmayabilir (örneğin NaN veya metin olarak görünebilir).  
[Aksiyom 4]: Eğer `loading` prop'u boolean tipinde değilse, yükleme durumu kontrolü yanlış çalışabilir ve içerik prematurely gösterilebilir veya gizlenebilir.  
[Aksiyom 5]: Eğer `handleBack()` fonksiyonu bir navigasyon context'i (örneğin React Router'ın `useNavigate` veya `history`) içerisinde çağrılmazsa, geri dönüş işlemi başarısız olacak ve sayfa değişmeyecektir.

---

## FONKSIYON DETAYLARI

### CategoryHero
**Ne yapar**: Verilen kategori bilgilerini görselleştirerek kullanıcıya kategori sayfasının başlık bölümünü render eder.  
**Nasıl yapar**: `CategoryHeroProps` üzerinden gelen `category`, `parentCategory`, `productCount` ve `loading` değerlerini alır; yüklenme durumu gösterilirken bir yükleme göstergesi sunar, aksi takdirde kategori adı, üst kategori (varsa) ve ürün sayısını içeren bir başlık bileşeni döndürür.  

**Parametreler**:
- category: CategoryHeroProps.category — Gösterilecek ana kategori nesnesi  
- parentCategory: CategoryHeroProps.parentCategory — Üst kategori bilgisi (yoksa null veya undefined olabilir)  
- productCount: CategoryHeroProps.productCount — Bu kategorideki ürün adedi (sayısal değer)  
- loading: CategoryHeroProps.loading — Veri yükleme durumunu gösteren bayrak (true/false)  

**Dönüş**: React.FC türünde bir işlev döndürür; bu işlev JSX ile kategori başlık bölümünü render eder.  

### handleBack
**Ne yapar**: Kullanıcının önceki sayfaya veya üst kategoriye dönmesini sağlayan geri dönüş işlevini tanımlar.  
**Nasıl yapar**: Parametre almaz; çağrıldığında geçmişteki bir adım geri gitmek için tarayıcı geçmişi API'si veya uygulama içi yönlendirme mekanizması tetiklenir (gerçek implementasyon dışarıda tanımlanmıştır).  

**Parametreler**: (yok)  

**Dönüş**: Geriye bir değer döndürmez; dönüş tipi `void` olarak kabul edilir.

---

## INTERFACES

### CategoryHeroProps
- `category: DomainCategory | null`
- `parentCategory?: DomainCategory | null`
- `productCount?: number`
- `loading?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/CategoryHero.tsx::CategoryHero
- **params**: category, parentCategory, productCount, loading
- **ic_degiskenler**:
  - `t` — translation function from useI18n
  - `navigate` — router instance from useRouter for programmatic navigation
  - `backBtnRef` — ref for back button element used with useScrollAnimation
  - `backBtnVisible` — boolean indicating visibility of back button from scroll animation
  - `imageRef` — ref for image container element
  - `imageVisible` — boolean indicating visibility of image from scroll animation
  - `textRef` — ref for text container element
  - `textVisible` — boolean indicating visibility of text from scroll animation
  - `handleBack` — inner function handling back navigation
  - `categoryImageUrl` — computed Supabase storage URL for category image or null
  - `isMainCategory` — boolean true if category has no parent_id
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/category/CategoryHero.tsx::handleBack
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `stack` — array of strings storing navigation history from sessionStorage
  - `prevPath` — string representing the previous path to navigate to
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\category\CategoryHero.tsx
  function: src\components\category\CategoryHero.tsx::CategoryHero
  function: src\components\category\CategoryHero.tsx::handleBack

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryHero