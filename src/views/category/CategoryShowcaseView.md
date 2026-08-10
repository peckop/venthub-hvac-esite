---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryShowcaseView.tsx
skeleton_hash: 4a86ea3614b86a02
entity_hashes:
  func:CategoryShowcase: 29e2e90462204c33
  func:handleSubSelect: 0b68330f2c8fdb75
  overview: 11de88618c455505
  style_tokens: 3074af738c3c5317
generated_at: 2026-06-19T20:50:49Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda bir kategorinin vitrin bölümünü sunan React bileşenini tanımlar. Kategori ve alt kategori verilerini alarak kullanıcı arayüzünde görsel bir sergi oluşturur ve alt kategori seçimlerini üst bileşene iletir.

## Fonksiyon Grupları
### Ana Bileşen
Kategori ve alt kategori bilgilerini alarak vitrin görünümünü oluşturan ve kullanıcı etkileşimlerini üst bileşene yönlendiren React bileşeni.
- CategoryShowcase

### Kullanıcı Etkileşim İşleyicisi
Bir alt kategori seçildiğinde tetiklenen ve seçilen alt kategorinin tanımlayıcısını üst bileşene bildiren olay yönetim mekanizması.
- handleSubSelect

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, React bileşeninin doğru render edilmesi ve kullanıcı etkileşimlerinin düzgün işlenmesi aşağıdaki dışsal koşullara bağlıdır.

**[Aksiyom 1]:** Eğer `category` prop'u (`{}` veya `undefined`/`null` olmayan bir nesne) sağlanmazsa, bileşen geçerli bir kategori gösterimi yapamaz ve muhtemelen boş/hatalı bir vitrin bölümü render eder.
**[Aksiyom 2]:** Eğer `subCategories` prop'u bir dizi (`Array`) formatında veya `undefined`/`null` olmayan iterable bir yapıda sağlanmazsa, bileşen alt kategori listesini oluşturamaz ve vitrin bölümünde alt kategori butonları/erişimleri eksik kalır.
**[Aksiyom 3]:** Eğer `onSubcategorySelect` prop'u çağrılabilir bir fonksiyon (`Function` tipinde) olarak sağlanmazsa, `handleSubSelect` tetiklendiğinde üst bileşene herhangi bir seçim olayı iletilemez ve kullanıcı etkileşimi (`onClick` vb.) sonuçsuz kalır.
**[Aksiyom 4]:** `handleSubSelect` fonksiyonu çağrıldığında, eğer `subSlug` parametresi geçerli bir string değer (`string` tipinde, boş string `""` hariç) olarak sağlanmazsa, üst bileşene geçersiz veya anlamsız bir alt kategori tanımlayıcısı iletilebilir; bu durum üst bileşenin filtreleme/yonlendirme mantığında beklenmedik sonuçlara yol açabilir.

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

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../lib/type-converters::DomainCategory
- import: ../../utils/getCategoryIcon::getCategoryIcon
- import: @/components/category/EnhancedNeedsWizard::EnhancedNeedsWizard
- import: @/components/category/sections::BottomCTA
- import: @/components/navigation/Breadcrumb::Breadcrumb
- import: @/components/ui/VentImage::VentImage
- import: @/hooks/useScrollAnimation::scrollAnimationClasses
- import: @/hooks/useScrollAnimation::useScrollAnimation
- import: @/i18n/I18nProvider::useI18n
- import: next/navigation::useRouter
- import: react::React
- import: react::useState

---

## INTERFACES

### CategoryShowcaseProps
- `category: DomainCategory`
- `subCategories: DomainCategory[]`
- `onSubcategorySelect?: (slug: string) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::CategoryShowcase
- **params**: `category` — mevcut kategori nesnesi (slug, name, metadata, image_url içerir); `subCategories` — alt kategori listesi (dizi); `onSubcategorySelect` — opsiyonel, alt kategori seçildiğinde çağrılan callback
- **ic_degiskenler**:
  - `router` — `useRouter()` ile alınan Next.js yönlendirme nesnesi, `router.push()` ile programatik navigasyon yapılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, `t('category.showcase.premiumTitle')` gibi anahtarlarla çeviri üretir
  - `dict` — `useI18n()` hook'undan gelen sözlük nesnesi, `dict.category.showcase.features[i]` ile doğrudan erişim yapılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen lokalize rota oluşturucu, `Routes.category(category.slug, subSlug)` formatında URL üretir
  - `wrapCategory` — `useCategoryViewModel()` hook'undan gelen fonksiyon, kategori nesnesini view model'e sarar
  - `wizardOpen` — boolean, artırılmış ihtiyaç sihirbazının açık/kapalı durumunu tutar
  - `setWizardOpen` — `wizardOpen` durumunu güncelleyen setter fonksiyonu
  - `vm` — `wrapCategory(category)` sonucu, mevcut kategorinin view model nesnesi (`vm?.displayName`, `vm?.description` erişimleri yapılır)
  - `isAirCurtain` — boolean, `category.slug.includes('hava-perde')` ile hesaplanır, hava perde kategorisi için wizard butonunu gösterir
  - `breadcrumbRef` — `useScrollAnimation<HTMLDivElement>()` ile alınan breadcrumb DOM referansı
  - `breadcrumbVisible` — boolean, breadcrumb'ın scroll animasyonu tetiklenip tetiklenmediğini belirler
  - `heroBadgeRef` — `useScrollAnimation<HTMLDivElement>()` ile alınan hero badge DOM referansı
  - `heroBadgeVisible` — boolean, hero badge scroll animasyon durumu
  - `heroTitleRef` — `useScrollAnimation<HTMLHeadingElement>()` ile alınan hero başlık DOM referansı
  - `heroTitleVisible` — boolean, hero başlık scroll animasyon durumu
  - `heroTextRef` — `useScrollAnimation<HTMLParagraphElement>()` ile alınan hero açıklama DOM referansı
  - `heroTextVisible` — boolean, hero açıklama scroll animasyon durumu
  - `airCurtainBtnRef` — `useScrollAnimation<HTMLButtonElement>()` ile alınan hava perde butonu DOM referansı
  - `airCurtainBtnVisible` — boolean, hava perde butonu scroll animasyon durumu
  - `handleSubSelect` — `(subSlug: string) => void` fonksiyonu, alt kategori seçimini `onSubcategorySelect` prop'u veya `router.push()` ile işler
  - `breadcrumbItems` — dizi, `[{ label: t('category.breadcrumbHome'), href: '/' }, { label: vm?.displayName || category.name, href: Routes.category(category.slug) }]` formatında breadcrumb öğeleri tutar
  - `metadata` — `category.metadata` değerinin `CategoryMetadataExtended` tipine cast edilmiş hali, `showcase_images` alanına erişim sağlanır
  - `showcaseImages` — `metadata?.showcase_images` ile alınan vitrin görselleri dizisi
  - `heroImage` — string, hero bölümünde kullanılacak görsel URL'i; `showcaseImages?.[0]?.desktop` → `category.image_url` → `/images/industrial_HVAC_air_handling_unit_warehouse.jpg` fallback zinciri ile belirlenir
- **Dönüş**: JSX — kategori vitrin sayfasının tam HTML yapısı (hero section, breadcrumb, alt kategoriler grid'i, garanti bölümü, BottomCTA ve EnhancedNeedsWizard)

### [N2_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::CategoryShowcase::handleSubSelect
- **params**: `subSlug` — string, seçilen alt kategorinin slug'ı
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `onSubcategorySelect` prop'u varsa onu çağırır, yoksa `router.push(Routes.category(category.slug, subSlug))` ile doğrudan navigasyon yapar

### [N3_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::CategoryShowcase::subCategories.map_callback
- **params**: `sub` — mevcut alt kategori nesnesi (id, slug içerir)
- **ic_degiskenler**:
  - `subVm` — `wrapCategory(sub)` sonucu, alt kategorinin view model nesnesi (`subVm?.displayName`, `subVm?.description` erişimleri yapılır)
- **Dönüş**: JSX — her alt kategori için tıklanabilir buton kartı, `getCategoryIcon(sub.slug, { size: 28 })` ile ikon, başlık ve açıklama içerir

### [N4_NASIL] AST Pointer: src/views/category/CategoryShowcaseView.tsx::CategoryShowcase::features.map_callback
- **params**: `Icon` — lucide-react icon bileşeni (ShieldCheck, Activity veya Zap); `i` — number, dizi indeksi (0, 1 veya 2)
- **ic_degiskenler**:
  - `item` — `dict.category.showcase.features[i]` ile alınan özellik nesnesi, `item.title` ve `item.desc` alanları erişilir
- **Dönüş**: JSX — garanti bölümündeki her bir özellik kartı (ikon, başlık ve açıklama)

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