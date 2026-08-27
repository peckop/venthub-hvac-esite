---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\views\category\CategoryShowcaseView.tsx
skeleton_hash: 4f021d7feadfcc9c
entity_hashes:
  func:CategoryShowcase: 29e2e90462204c33
  func:handleSubSelect: 32c9971ae36b2a25
  overview: 4009627a5befdc70
  style_tokens: 6b0428f0cf6702bf
generated_at: 2026-08-27T07:37:45Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda bir kategorinin vitrin bölümünü sunan React bileşenini tanımlar. Kategori ve alt kategori verilerini alarak kullanıcı arayüzünde görsel bir sergi oluşturur ve alt kategori seçimlerini üst bileşene iletir. Bileşen, dışarıdan sağlanan `category`, `subCategories` ve `onSubcategorySelect` prop'larına bağımlıdır.

## Fonksiyon Grupları
### Ana Bileşen
Kategori ve alt kategori bilgilerini alarak vitrin görünümünü oluşturan ve kullanıcı etkileşimlerini üst bileşene yönlendiren React bileşeni. Bu bileşen, `handleSubSelect` fonksiyonunu içerir ve alt kategori seçimlerini yönetir.
- CategoryShowcase

### Kullanıcı Etkileşim İşleyicisi
Bir alt kategori seçildiğinde tetiklenen ve seçilen alt kategorinin tanımlayıcısını (`subSlug`) üst bileşene bildiren olay yönetim mekanizması. Bu fonksiyon, `onSubcategorySelect` prop'unu çağırarak üst bileşene bilgi iletir.
- handleSubSelect

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan aksiyom üretilemez. Özel aksiyom tanımlanmamıştır.

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
**Ne yapar**: Alt kategori seçimini işleyen bir fonksiyondur. Çağrıldığında, bir arrow function döndürür; bu arrow function tetiklendiğinde `getLocalizedCategorySlug` fonksiyonunu çağırarak elde edilen yerelleştirilmiş alt kategori slug değerini tekrar `handleSubSelect` fonksiyonuna aktarır.

**Nasıl yapar**: Fonksiyon gövdesinde `() => handleSubSelect(getLocalizedCategorySlug(sub, lang))` ifadesi yer almaktadır. Bu yapı, fonksiyonun kendisini özyinelemeli (recursive) bir şekilde çağıran bir callback ürettiğini gösterir. `sub` ve `lang` değişkenleri bu fonksiyonun kapsama alanından (closure) gelmektedir. `getLocalizedCategorySlug` fonksiyonu, `sub` ve `lang` parametreleriyle çağrılarak yerelleştirilmiş bir kategori slug'ı üretir ve bu değer `handleSubSelect`'e parametre olarak iletilir.

**Parametreler**:
- `subSlug`: `string` — Alt kategoriyi temsil eden slug değeri. Fonksiyonun gövdesinde doğrudan kullanılmamakta olup, döndürülen arrow function içinde `getLocalizedCategorySlug` aracılığıyla dolaylı olarak işlenmektedir.

**Dönüş**: Bilinmiyor. Kaynakta dönüş tipi açıkça belirtilmemiştir. Gövde yapısı bir arrow function döndürdüğü izlenimini vermektedir ancak kesin dönüş tipi hakkında çıkarım yapılmamıştır.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../lib/type-converters::DomainCategory
- import: ../../utils/categoryHelpers::getLocalizedCategorySlug
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

### [N1_NASIL] AST Pointer: CategoryShowcaseView.tsx::CategoryShowcase
- **params**: `category`, `subCategories`, `onSubcategorySelect`
- **ic_degiskenler**:
  - `router` — `useRouter()` çağrısından dönen Next.js router nesnesi; alt kategori seçildiğinde yönlendirme yapmak için kullanılır
  - `t` — `useI18n()` çağrısından dönen çeviri fonksiyonu; metinlerin dile göre çevrilmesinde kullanılır
  - `dict` — `useI18n()` çağrısından dönen sözlük nesnesi; `dict.category.showcase.features` ve `dict.category.showcase.whyVenthubTitle` gibi doğrudan erişimlerle yapılandırılmış metin verilerine ulaşmak için kullanılır
  - `lang` — `useI18n()` çağrısından dönen dil kodu; `getLocalizedCategorySlug` fonksiyonuna parametre olarak aktarılır
  - `Routes` — `useLocalizedRoutes()` çağrısından dönen rotalar nesnesi; `Routes.category(...)` ile kategori URL'leri üretmek için kullanılır
  - `wrapCategory` — `useCategoryViewModel()` çağrısından dönen fonksiyon; kategori nesnesini görünüm modeline (`vm`) sarmak için kullanılır
  - `wizardOpen` — `useState(false)` ile yönetilen boolean durum; `EnhancedNeedsWizard` bileşeninin açık/kapalı durumunu kontrol eder
  - `setWizardOpen` — `wizardOpen` durumunu güncelleyen setter fonksiyonu; hava perdesi butonuna tıklandığında `true`, sihirbaz kapatıldığında `false` olarak çağrılır
  - `vm` — `wrapCategory(category)` çağrısının sonucu; `vm?.displayName` ve `vm?.description` erişimleriyle kategori görünen adı ve açıklaması alınır
  - `isAirCurtain` — `category.slug.includes('hava-perde')` ifadesinin boolean sonucu; hava perdesi kategorisi olup olmadığını belirler, sihirbaz butonu ve `BottomCTA` bileşeninin koşullu gösterimini kontrol eder
  - `breadcrumbRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.1 })` çağrısından dönen DOM referansı; breadcrumb konteynerine `ref` olarak atanır
  - `breadcrumbVisible` — `useScrollAnimation` çağrısından dönen boolean; breadcrumb'ın görünür olup olmadığını belirler, animasyon sınıfını kontrol eder
  - `heroBadgeRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })` çağrısından dönen DOM referansı; hero rozeti konteynerine `ref` olarak atanır
  - `heroBadgeVisible` — `useScrollAnimation` çağrısından dönen boolean; hero rozeti animasyon durumunu kontrol eder
  - `heroTitleRef` — `useScrollAnimation<HTMLHeadingElement>({ threshold: 0.2 })` çağrısından dönen DOM referansı; hero başlık `h1` elementine `ref` olarak atanır
  - `heroTitleVisible` — `useScrollAnimation` çağrısından dönen boolean; hero başlık animasyon durumunu kontrol eder
  - `heroTextRef` — `useScrollAnimation<HTMLParagraphElement>({ threshold: 0.2 })` çağrısından dönen DOM referansı; hero açıklama paragrafına `ref` olarak atanır
  - `heroTextVisible` — `useScrollAnimation` çağrısından dönen boolean; hero metin animasyon durumunu kontrol eder
  - `airCurtainBtnRef` — `useScrollAnimation<HTMLButtonElement>({ threshold: 0.2 })` çağrısından dönen DOM referansı; hava perdesi model bulma butonuna `ref` olarak atanır
  - `airCurtainBtnVisible` — `useScrollAnimation` çağrısından dönen boolean; hava perdesi butonu animasyon durumunu kontrol eder
  - `handleSubSelect` — alt kategori seçildiğinde çağrılan iç fonksiyon; `onSubcategorySelect` prop'u varsa onu çağırır, yoksa `router.push` ile yönlendirme yapar
  - `breadcrumbItems` — breadcrumb navigasyon öğeleri dizisi; her eleman `label` ve `href` alanlarından oluşur, `Breadcrumb` bileşenine prop olarak aktarılır
  - `metadata` — `category.metadata` değerinin `CategoryMetadataExtended` tipine dönüştürülmüş hali; `showcase_images` alanına erişmek için kullanılır
  - `showcaseImages` — `metadata?.showcase_images` erişimi; vitrin görselleri dizisini tutar
  - `heroImage` — `showcaseImages?.[0]?.desktop` değerinin, bulunamazsa `category.image_url`, o da yoksa varsayılan yolun kullanılmasıyla elde edilen hero görsel URL'si; hem hero bölümündeki hem de alt kısım `VentImage` bileşeninde kullanılır
- **Dönüş**: JSX element (React.FC<CategoryShowcaseProps>)

### [N2_NASIL] AST Pointer: CategoryShowcaseView.tsx::handleSubSelect
- **params**: `subSlug`
- **ic_degiskenler**:
  - *(yok — fonksiyon gövdesinde tanımlı iç değişken bulunmaz; dış scope'daki `onSubcategorySelect`, `router`, `Routes`, `category`, `lang` değişkenlerini kullanır)*
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: CategoryShowcaseView.tsx::subCategories.map anonim fonksiyonu
- **params**: `sub`
- **ic_degiskenler**:
  - `subVm` — `wrapCategory(sub)` çağrısının sonucu; `subVm?.displayName` ve `subVm?.description` erişimleriyle alt kategori görünen adı ve açıklaması alınır
- **Dönüş**: JSX element (button)

### [N4_NASIL] AST Pointer: CategoryShowcaseView.tsx::features.map anonim fonksiyonu
- **params**: `Icon`, `i`
- **ic_degiskenler**:
  - `item` — `dict.category.showcase.features[i]` erişimiyle elde edilen özellik nesnesi; `item.title` ve `item.desc` alanlarıyla başlık ve açıklama metinlerine ulaşılır
- **Dönüş**: JSX element (div)

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
- **Layout:** `absolute`, `block`, `bottom-8`, `flex`, `flex-col`, `from-transparent`, `gap-2`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `group-hover:w-12`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `animate-bounce`, `animate-pulse`, `aspect-square`, `border`, `brightness-50`, `cursor-pointer`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`