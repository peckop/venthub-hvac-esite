---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryShowcaseView.tsx
skeleton_hash: c0bd4c29939c2c7e
entity_hashes:
  func:CategoryShowcase: 29e2e90462204c33
  func:handleSubSelect: 0b68330f2c8fdb75
  overview: 3c10a23ad8576bac
  style_tokens: 3074af738c3c5317
generated_at: 2026-05-28T22:40:06Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda bir kategorinin ve ilgili alt kategorilerinin vitrin görünümünü oluşturan bir React bileşenini tanımlar. Modül, kategori verilerini alıp kullanıcı arayüzünde sunar ve kullanıcıların alt kategori seçimlerini üst bileşene bildirmek için bir etkileşim akışı yönetir.

## Fonksiyon Grupları
### Ana Bileşen Tanımı
Vitrin görünümünün temel yapısını ve gerekli girdileri tanımlar. Kategori bilgileri ve alt kategori listesiyle birlikte, bir seçim tetikleyici fonksiyonu da alarak bileşenin dış bağımlılıklarını belirler.
- CategoryShowcase

### Kullanıcı Etkileşimi İşleyicisi
Kullanıcının bir alt kategoriye tıklaması durumunda tetiklenen bir olay yönetim fonksiyonudur. Seçilen alt kategorinin benzersiz tanımlayıcısını alarak, üst bileşende tanımlanmış olan genel seçim işleme fonksiyonuna iletir.
- handleSubSelect

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React bileşeni olup, dışarıdan sağlanan props'larla çalışır ve kullanıcı etkileşimini yukarı iletir.

[Aksiyom 1]: Eğer `category` prop'u sağlanmazsa veya geçersizse, `CategoryShowcase` bileşeni ana kategori bilgisini görüntüleyemez ve vitrin bölümü eksik veya hatalı çalışır.

[Aksiyom 2]: Eğer `subCategories` prop'u sağlanmazsa veya boş/null bir değerse, bileşen alt kategori listesini render edemez; bu durumda vitrinde alt kategori seçeneği gösterilmez.

[Aksiyom 3]: Eğer `onSubcategorySelect` callback prop'u sağlanmazsa (undefined/null), `handleSubSelect` fonksiyonu çağrıldığında bu callback'i tetiklemeye çalışırken runtime hatası oluşur.

[Aksiyom 4]: `handleSubSelect` fonksiyonu sadece geçerli bir string (`subSlug`) parametresi alır; eğer boş string, null veya undefined değer gönderirse, `onSubcategorySelect` fonksiyonuna geçersiz veri iletilir ve üst bileşende beklenmeyen davranışlara yol açabilir.

[Aksiyom 5]: `subCategories` dizisindeki her bir elemanın `slug` alanı zorunludur; eğer bu alan eksikse, `handleSubSelect` aracılığıyla iletilen değer tutarsız olur ve üst bileşen tarafında eşleşme sorunları yaşanabilir.

[Aksiyom 6]: Bu modül, kendi içinde state yönetimi içermediği için (sadece `handleSubSelect` callback'i var), tüm durum yönetimi üst bileşen tarafından yapılmalıdır;否则 `onSubcategorySelect` çağrısı bileşen içi durumu doğrudan etkilemez.

---

## FONKSİYON DETAYLARI

### CategoryShowcase
**Ne yapar**: Kategori ve alt kategorileri görsel olarak sergileyen bir React bileşenidir. Kullanıcının alt kategori seçimini üst bileşene iletir.

**Nasıl yapar**: Gelen `category` ve `subCategories` verilerini alarak bir vitray/showcase düzeninde sunar. Her bir alt kategori için seçim tetikleyicisi oluşturur ve `onSubcategorySelect` callback'ini tetikler.

**Parametreler**:
- `category`: bilinmeyen tip — Sergilenecek ana kategori nesnesi
- `subCategories`: bilinmeyen tip — Ana kategoriye ait alt kategori dizisi
- `onSubcategorySelect`: bilinmeyen tip — Alt kategori seçildiğinde çağrılacak callback fonksiyonu

**Dönüş**: `React.FC<CategoryShowcaseProps>` — JSX bileşenini döndürür

### handleSubSelect
**Ne yapar**: CategoryShowcase bileşeni içinde çalışan, alt kategori seçim sürecini yöneten yardımcı işlemci fonksiyonudur. Kullanıcının seçtiği alt kategorinin benzersiz slug değerini alarak, ana bileşene prop olarak iletilen üst düzey geri çağırım fonksiyonunun tetiklenmesini sağlar. Sadece seçim olayının iletim sorumluluğunu üstlenerek ana bileşenin iş yükünü azaltır.
**Nasıl yapar**: Parametre olarak kendisine iletilen alt kategori slug değerini doğrudan CategoryShowcase propu olarak alınan onSubcategorySelect fonksiyonuna ileterek, seçim olayının üst bileşenlere ulaşmasını sağlar. Ekstra bir veri dönüşümü veya filtreleme yapmadan, aldığı değeri olduğu gibi ilgili geri çağırım fonksiyonuna iletir.
**Parametreler**:
- subSlug: string — Kullanıcı tarafından seçilen alt kategorinin benzersiz kısa tanımlayıcısı (slug) değeridir, adresleme ve tanımlama işlemlerinde kullanılan benzersiz etikettir
**Dönüş**: Herhangi bir değer döndürmez, sadece seçim olayını iletmek amacıyla çalıştığından return tipi void niteliğindedir, belirtilen tanıma göre ek bir dönüş değeri tanımlanmamıştır.

---

## INTERFACES

### CategoryShowcaseProps
- `category: DomainCategory`
- `subCategories: DomainCategory[]`
- `onSubcategorySelect?: (slug: string) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::CategoryShowcase
- **params**: `category` — kategori nesnesi (slug, name, metadata, image_url içerir), `subCategories` — alt kategoriler dizisi, `onSubcategorySelect` — opsiyonel, alt kategori seçim callback fonksiyonu
- **ic_degiskenler**:
  - `router` — `useRouter()` ile alınan Next.js router nesnesi, sayfa yönlendirmeleri için kullanılır
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu
  - `wrapCategory` — `useCategoryViewModel()` hook'undan alınan, kategori nesnesini view model'e saran fonksiyon
  - `wizardOpen` — `useState(false)` ile oluşturulan boolean state, EnhancedNeedsWizard bileşeninin açık/kapalı durumunu tutar
  - `setWizardOpen` — wizardOpen state'ini güncelleyen setter fonksiyonu
  - `vm` — `wrapCategory(category)` çağrısı ile elde edilen kategori view model nesnesi (displayName, description alanları içerir)
  - `isAirCurtain` — `category.slug.includes('hava-perde')` ile hesaplanan boolean, kategorinin hava perde olup olmadığını belirler
  - `breadcrumbRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })` ile elde edilen breadcrumb bölümünün DOM referansı
  - `breadcrumbVisible` — breadcrumb bölümünün scroll animasyonu ile görünür olup olmadığını belirten boolean
  - `heroBadgeRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })` ile elde edilen hero badge'in DOM referansı
  - `heroBadgeVisible` — hero badge'in scroll animasyonu ile görünür olup olmadığını belirten boolean
  - `heroTitleRef` — `useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })` ile elde edilen hero başlığının DOM referansı
  - `heroTitleVisible` — hero başlığının scroll animasyonu ile görünür olup olmadığını belirten boolean
  - `heroTextRef` — `useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 })` ile elde edilen hero açıklama metninin DOM referansı
  - `heroTextVisible` — hero metninin scroll animasyonu ile görünür olup olmadığını belirten boolean
  - `airCurtainBtnRef` — `useScrollAnimation<HTMLButtonElement>({ threshold: 0.2 })` ile elde edilen hava perde butonunun DOM referansı
  - `airCurtainBtnVisible` — hava perde butonunun scroll animasyonu ile görünür olup olmadığını belirten boolean
  - `handleSubSelect` — alt kategori seçimini işleyen inner fonksiyon; `onSubcategorySelect` prop'u varsa onu çağırır, yoksa `router.push(Routes.category(category.slug, subSlug))` ile rotaya yönlendirir
  - `breadcrumbItems` — breadcrumb bileşenine geçirilen öge dizisi; `{ label: 'Ana Sayfa', href: '/' }` ve `{ label: vm?.displayName || category.name, href: Routes.category(category.slug) }`
  - `metadata` — `category.metadata as CategoryMetadataExtended | null` ile type-cast edilmiş metadata nesnesi (showcase_images alanını içerir)
  - `showcaseImages` — `metadata?.showcase_images` erişiminden elde edilen görseller dizisi
  - `heroImage` — hero bölümünde kullanılacak görsel URL'si; sırasıyla `showcaseImages?.[0]?.desktop`, `category.image_url`, `/images/industrial_HVAC_air_handling_unit_warehouse.jpg` fallback değerini alır
- **Dönüş**: JSX elementi (React functional component; kategori sayfasının tam hero, alt kategori grid, garanti bölümü ve BottomCTA/EnhancedNeedsWizard yapılarını render eder)

### [N2_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::handleSubSelect
- **params**: `subSlug: string` — seçilen alt kategorinin slug değeri
- **ic_degiskenler**:
  - (ekstra iç değişken yok; params ve closure'daki `onSubcategorySelect`, `router`, `category.slug` doğrudan kullanılır)
- **Dönüş**: yok (void; `onSubcategorySelect(subSlug)` çağırır veya `router.push(Routes.category(category.slug, subSlug))` ile sayfa yönlendirir)

### [N3_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::subCategories.map callback
- **params**: `sub` — tek bir alt kategori nesnesi (id, slug alanları içerir)
- **ic_degiskenler**:
  - `subVm` — `wrapCategory(sub)` çağrısı ile elde edilen alt kategori view model nesnesi (displayName, description alanları içerir)
- **Dönüş**: JSX elementi (her alt kategori için tıklanabilir buton bileşeni; icon, başlık, açıklama ve serileri keşfet linki içerir)

### [N4_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::features.map callback
- **params**: `item` — `{ icon: LucideIcon, title: string, desc: string }` yapısındaki özellik nesnesi, `i` — dizi indeksi (React key olarak kullanılır)
- **ic_degiskenler**:
  - (ekstra iç değişken yok; `item.icon`, `item.title`, `item.desc` ve `i` doğrudan JSX'te kullanılır)
- **Dönüş**: JSX elementi (özellik kartı; icon, başlık ve açıklama içeren flex düzenli kart)

---

## NODE ID STANDARD

  file: src\views\category\CategoryShowcaseView.tsx
  function: src\views\category\CategoryShowcaseView.tsx::CategoryShowcase
  function: src\views\category\CategoryShowcaseView.tsx::handleSubSelect

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcase

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-cyan-500/20`, `border-slate-100`, `border-white/10`, `from-transparent`, `group-hover:bg-cyan-500`, `group-hover:text-cyan-600`, `group-hover:text-white`
- **Layout:** `absolute`, `block`, `bottom-8`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-2`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `group-hover:w-12`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `animate-bounce`, `animate-pulse`, `aspect-square`, `border`, `brightness-50`, `cursor-pointer`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`