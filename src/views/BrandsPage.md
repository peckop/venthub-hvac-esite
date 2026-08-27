---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\BrandsPage.tsx
skeleton_hash: ec4c93cfd61888e3
entity_hashes:
  func:BrandsPage: 7fe8abffb7e6dbf9
  overview: 3003d757bf1d8636
  style_tokens: 583cff7322941abd
generated_at: 2026-08-27T07:08:52Z
---

## Genel Bakış

BrandsPage, `src/views` klasöründe yer alan bir React sayfa bileşenidir. Modül, tek bir dışa aktarılan bileşen içerir ve markalarla ilgili bir görünüm sayfası olarak tanımlanmıştır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Bu modülün tek bileşeni olan BrandsPage, markalar sayfasının görünümünü ve davranışını tanımlar. React fonksiyonel bileşeni olarak dışa aktarılır.
- BrandsPage

## Bağımlılıklar ve Mimari Notlar

- Modülde yalnızca tek bir fonksiyon (bileşen) bulunduğu için iç fonksiyon çağrı ilişkisi bulunmamaktadır.
- `src/views` klasöründe konumlanması, bu bileşenin uygulamanın üst düzey sayfa bileşenlerinden biri olduğunu gösterir.
- Dış bağımlılıklar ve alt bileşen kullanımı hakkında verilen listede bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `BrandsPage` fonksiyonunun gövdesi verilmemiştir. Fonksiyon imzası yalnızca parametre almayan ve `React.FC` döndüren bir bileşen olduğunu gösterir. Modül sabitleri ve eski doküman da bulunmadığından, fonksiyon gövdesi olmadan bu bileşenin doğru çalışması için hangi koşulların var olması gerektiğine dair bilgi çıkarılamaz.

---

## FONKSİYON DETAYLARI

### BrandsPage
**Ne yapar**: Premium "Markalar" sayfasını oluşturan bir React bileşenidir. Bileşen, i18n (çoklu dil desteği), A11y (erişilebilirlik) ve performans optimizasyonları ile modernize edilmiştir.

**Nasıl yapar**: `BrandsPage` adlı fonksiyon, herhangi bir parametre almadan çağrılır ve bir React fonksiyon bileşeni (`React.FC`) döndürür. Docstring bilgisine göre bileşen, uluslararasılaştırma (i18n), erişilebilirlik standartları (A11y) ve performans iyileştirmeleri uygulanmış şekilde tasarlanmıştır. Fonksiyonun iç mantığı ve hangi alt bileşenleri veya hook'ları kullandığı verilen kaynakta belirtilmemiştir.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `React.FC` — React fonksiyon bileşeni döndürür. Bu, JSX elementi üreten ve bir sayfa bileşeni olarak render edilebilen bir bileşendir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/Seo::Seo
- import: ../data/brands::HVAC_BRANDS
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../hooks/useScrollAnimation::useScrollAnimation
- import: ../i18n/I18nProvider::useI18n
- import: next/image::Image
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/BrandsPage.tsx::BrandsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destruct edilen çeviri fonksiyonu; sayfa içindeki tüm metinleri (`brands.pageTitle`, `brands.seoDesc`, `brands.sectionTitle`, `brands.eyebrow`, `brands.pageSubtitle`, `brands.aboutBrand`, `brands.exploreBrand`, `brands.trust.eyebrow`, `brands.trust.title`, `brands.trust.description`, `brands.trust.original`, `brands.trust.standard`, `brands.trust.imageAlt`, `brands.page.statGlobal`) yerelleştirmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rotalar nesnesi; `Routes.brand(brand.slug)` çağrısıyla her markanın detay sayfasına yönlendirme URL'i üretmek için kullanılır
  - `brands` — `HVAC_BRANDS` sabitinden atanan marka dizisi; `.map()` ile dönülerek her marka için kart bileşeni oluşturulur. Her eleman `brand.slug`, `brand.name`, `brand.country`, `brand.specialty`, `brand.description` alanlarına sahiptir
  - `heroBadgeRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.2 })` hook'undan dönen ref; hero bölümündeki badge `<div>` öğesine `ref` prop'u olarak atanır, kaydırma animasyonu tetikleme noktasını belirler
  - `heroBadgeVisible` — `useScrollAnimation` hook'undan dönen boolean; hero badge'in görünür olup olmadığını belirtir, `scrollAnimationClasses.fadeUp(heroBadgeVisible)` ile CSS sınıfı seçiminde kullanılır
  - `brandsGridRef` — `useScrollAnimation<HTMLDivElement>({ threshold: 0.05 })` hook'undan dönen ref; markalar grid'inin `<div>` öğesine `ref` prop'u olarak atanır
  - `brandsGridVisible` — `useScrollAnimation` hook'undan dönen boolean; markalar grid'inin görünür olup olmadığını belirtir, `scrollAnimationClasses.fadeUp(brandsGridVisible)` ile CSS sınıfı seçiminde kullanılır
  - `brand` — `brands.map()` içindeki her marka nesnesi; `brand.slug` (Link href ve key), `brand.name` (BrandIcon ve h2 başlık), `brand.country` (ülke etiketi), `brand.specialty` (uzmanlık alanı), `brand.description` (açıklama paragrafı) alanlarına erişilir
  - `index` — `brands.map()` içindeki döngü indeksi; `scrollAnimationClasses.staggerChild(index)` çağrısında gecikmeli animasyon stili hesaplamak için kullanılır
  - `word` — `t('brands.eyebrow').split(' ').map()` içindeki her kelime; üçüncü kelime (i === 2) kalın italik stil ile, diğerleri normal metin olarak render edilir
  - `i` — `t('brands.eyebrow').split(' ').map()` içindeki kelime indeksi; `i === 2` kontrolüyle üçüncü kelimeye özel stil uygulanır, ayrıca `React.Fragment`'a `key` prop'u olarak atanır
- **Dönüş**: JSX elementi — `<div className="min-h-screen bg-white">` kök elemanı içinde `<Seo>`, hero bölümü, markalar grid bölümü ve güven/ağ bölümü olmak üzere dört ana bölüm render eder

---

## NODE ID STANDARD

  file: src\views\BrandsPage.tsx
  function: src\views\BrandsPage.tsx::BrandsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-normal`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-cyan-500/20`, `bg-gradient-to-t`, `bg-slate-100`, `bg-slate-200`, `bg-slate-50/50`, `bg-slate-950`, `bg-white`, `border-b`, `border-cyan-500/20`, `border-l`, `border-slate-100`, `border-white/10`, `border-white/5`
- **Layout:** `absolute`, `block`, `flex`, `flex-1`, `from-slate-950`, `gap-20`, `gap-3`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `group-hover:w-12`, `h-2`, `h-24`, `h-full`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `aspect-3/2`, `aspect-square`, `blur-3xl`, `border`, `brightness-50`, `duration-500`, `duration-700`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`