---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryHero.tsx
skeleton_hash: 918b4e19ffd9da91
entity_hashes:
  func:CategoryHero: e691a6ccb1379798
  func:handleBack: 7a67af4e5dfa77e4
  overview: 4b47da32e01e754d
  style_tokens: 6910b683995fc9aa
generated_at: 2026-06-19T20:47:06Z
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

## FONKSİYON DETAYLARI

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

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::type { DomainCategory }
- import: ../../utils/categoryHelpers::getCategoryDisplayName
- import: ../../utils/getCategoryIcon::getCategoryIcon
- import: ../ui/VentImage::VentImage
- import: @/hooks/useScrollAnimation::scrollAnimationClasses
- import: @/hooks/useScrollAnimation::useScrollAnimation
- import: @/lib/utils::cn
- import: lucide-react::ArrowLeft
- import: lucide-react::Layers
- import: lucide-react::ShieldCheck
- import: lucide-react::Zap
- import: next/navigation::useRouter
- import: react::React

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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500/10`, `bg-indigo-600/10`, `bg-slate-50`, `bg-slate-900`, `bg-white`, `bg-white/10`, `bg-white/5`, `border-b`, `border-slate-100`, `border-white/10`, `border-white/5`, `hover:text-primary-navy`, `hover:text-white`, `lg:text-5xl`, `lg:text-8xl`
- **Layout:** `absolute`, `block`, `bottom-0`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-2`, `gap-4`, `gap-8`, `h-12`, `h-24`, `h-300px`, `h-32`, `h-4`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-mb-32`, `-ml-32`, `-mr-64`, `-mt-64`, `animate-pulse`, `blur-3xl`, `border`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-medium`, `group`, `group-hover:-translate-x-1`, `inset-0`