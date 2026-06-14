---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryShowcaseView.tsx
skeleton_hash: 4a86ea3614b86a02
entity_hashes:
  func:CategoryShowcase: 29e2e90462204c33
  func:handleSubSelect: 0b68330f2c8fdb75
  overview: 170bc607329172b4
  style_tokens: 3074af738c3c5317
generated_at: 2026-06-14T20:13:41Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda bir kategorinin vitrin bölümünü oluşturan React bileşenini tanımlar. Kategori ve alt kategori bilgilerini alarak kullanıcı arayüzünde sunar ve kullanıcı etkileşimlerini üst bileşene iletir.

## Fonksiyon Grupları
### Ana Bileşen Tanımı
Kategori ve alt kategori verilerini alarak vitrin görünümünün temel yapısını ve gerekli girdileri tanımlayan bileşen yapısı.
- CategoryShowcase

### Kullanıcı Etkileşimi İşleyicisi
Kullanıcının bir alt kategori seçimi yapması durumunda tetiklenen ve seçilen alt kategorinin tanımlayıcısını üst bileşene bildiren olay yönetim mekanizması.
- handleSubSelect

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom

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
- import: ../../lib/type-converters::DomainCategory
- import: ../../utils/getCategoryIcon::getCategoryIcon
- import: ../../utils/routes::Routes
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
- **params**: `(category, subCategories, onSubcategorySelect)`
  - `category` — ana kategori nesnesi, `slug`, `name`, `metadata`, `image_url` alanlarını içerir
  - `subCategories` — alt kategoriler dizisi, her eleman `id` ve `slug` içerir
  - `onSubcategorySelect` — opsiyonel callback, alt kategori seçildiğinde çağrılır
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen Next.js yönlendirici nesnesi, `router.push()` ile sayfa geçişi yapılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, string anahtarlarından çevrilmiş metin döner
  - `dict` — `useI18n()` hook'undan dönen sözlük objesi, `dict.category.showcase.*` yoluyla erişilir
  - `wrapCategory` — `useCategoryViewModel()` hook'undan dönen fonksiyon, kategori nesnesini view model'e sarar
  - `wizardOpen` — `useState(false)` ile oluşturulan boolean state, NeedWizard panelinin açık olup olmadığını tutar
  - `setWizardOpen` — `wizardOpen` state'ini güncelleyen setter fonksiyonu
  - `vm` — `wrapCategory(category)` çağrısıyla elde edilen view model, `vm?.displayName` ve `vm?.description` erişimleri yapılır
  - `isAirCurtain` — `category.slug.includes('hava-perde')` ifadesinden türetilen boolean, hava-perde kategorisi olup olmadığını belirler
  - `breadcrumbRef` — breadcrumb div'i için React ref nesnesi, scroll animasyon hedefi olarak kullanılır
  - `breadcrumbVisible` — breadcrumb'ın viewport'a girip girmediğini tutan boolean, `scrollAnimationClasses.fadeUp()` argümanı olarak kullanılır
  - `heroBadgeRef` — hero badge div'i için React ref nesnesi
  - `heroBadgeVisible` — hero badge görünürlük durumu boolean
  - `heroTitleRef` — hero h1 başlığı için React ref nesnesi
  - `heroTitleVisible` — hero başlık görünürlük durumu boolean
  - `heroTextRef` — hero açıklama paragrafı için React ref nesnesi
  - `heroTextVisible` — hero metin görünürlük durumu boolean
  - `airCurtainBtnRef` — hava perde butonu için React ref nesnesi
  - `airCurtainBtnVisible` — hava perde butonu görünürlük durumu boolean
  - `handleSubSelect` — inner fonksiyon, `subSlug` alıp `onSubcategorySelect` çağırır veya `router.push` yapar
  - `breadcrumbItems` — breadcrumb için `{label, href}` elemanlarından oluşan dizi, iki elemanlı: home ve kategori linki
  - `metadata` — `category.metadata`'nın `CategoryMetadataExtended` tipine cast edilmiş hali, `showcase_images` alanı erişilir
  - `showcaseImages` — `metadata?.showcase_images` erişiminden elde edilen görsel dizisi
  - `heroImage` — hero bölümünde kullanılacak görsel URL'i, sırasıyla `showcaseImages?.[0]?.desktop`, `category.image_url`, fallback path denenir
- **Dönüş**: JSX — React elementi (tüm sayfa JSX'i döner)

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