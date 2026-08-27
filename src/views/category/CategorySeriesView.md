---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\views\category\CategorySeriesView.tsx
skeleton_hash: 078dd79540d30eeb
entity_hashes:
  func:CategorySeriesView: dbe49211dde9a885
  overview: 1ed6fd4e6398c43f
  style_tokens: 886ea79af95dd54c
generated_at: 2026-08-27T07:36:47Z
---

## Genel Bakış
CategorySeriesView modülü, VentHub HVAC platformunda kategori sayfalarında ürün serilerini görüntülemek için tasarlanmış bir React bileşenidir. Kategori, üst kategori ve aile listesi bilgilerini alarak kullanıcılara kategori serisi arayüzünü sunar. Modül tek bir bileşen fonksiyonundan oluşur.

## Fonksiyon Grupları
### Ana Görünüm Bileşeni
Kategori metadatasını, üst kategori bilgisini ve ürün ailesi listesini birleştirerek kategori serisi görünümünü render eder. Modülün tek giriş noktası olup tüm sorumluluk bu bileşende toplanmıştır.
- CategorySeriesView

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `category`, `parentCategory` ve `families` prop'larının üçünü de aldığı varsayımıyla çalışır.

[Aksiyom 1]: Eğer `category` prop'u sağlanmazsa, bileşen hangi kategoriye ait serileri görüntüleyeceğini bilemez ve kategori başlığı/metadata gösterimi eksik veya hatalı olur.

[Aksiyom 2]: Eğer `parentCategory` prop'u sağlanmazsa, üst kategori navigasyonu veya breadcrumb gösterimi gerçekleştirilemez.

[Aksiyom 3]: Eğer `families` prop'u sağlanmazsa, görüntülenecek ürün serisi listesi boş kalır ve bileşen seriler arayüzünü sunamaz.

---

## FONKSİYON DETAYLARI

### CategorySeriesView
**Ne yapar**: Kategori sayfasında seri bazlı ürün görünümünü sağlayan bir React bileşenidir. Kategori bilgisi, üst kategori bilgisi ve aile verilerini alarak kategori-seri ilişkili arayüzü render eder. F5-B W2.1 notuna göre, daha önceki `groupProductsBySeries` heuristiği (`name.split(' ')[0]`) ve seri-matris tablosu bu bileşenden SİLİNMİŞTİR. Aile gerçeği artık veritabanından (`product_families`) gelir; varyant karşılaştırma matrisi ise PDP'ye taşınmıştır (W2.2).

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (`React.FC<CategorySeriesViewProps>`) olarak tanımlanmıştır. Props parametresini destructure ederek `category`, `parentCategory` ve `families` değerlerini alır. Önceki sürümlerde bulunan `groupProductsBySeries` heuristiği kaldırılmıştır; artık ürün aileleri doğrudan veritabanından gelen `families` prop'u üzerinden sağlanır. Seri-matris tablosu bu bileşende yer almaz; varyant karşılaştırma işlevi PDP (Product Detail Page) bileşenine taşınmıştır.

**Parametreler**:
- `category`: object — Görüntülenecek kategori bilgisini içerir. Kategori sayfasının ana veri kaynağıdır.
- `parentCategory`: object — Mevcut kategorinin üst kategori bilgisini taşır. Kategori hiyerarşisinde yukarı doğru navigasyon veya bağlam sağlamak için kullanılır.
- `families`: array — Ürün ailelerini içeren veri koleksiyonudur. Veritabanındaki `product_families` tablosundan gelen gerçek aile verisini temsil eder. Önceki `groupProductsBySeries` heuristiğinin yerini almıştır.

**Dönüş**: `React.FC<CategorySeriesViewProps>` — `CategorySeriesViewProps` tipinde props alan bir React fonksiyonel bileşeni döndürür. Bileşen, kategori-seri görünümünün arayüz çıktısını üretir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::DomainCategory
- import: ../../utils/categoryHelpers::getLocalizedCategorySlug
- import: @/components/navigation/Breadcrumb::Breadcrumb
- import: @/components/products/FamilyCard::FamilyCard
- import: @/types/ui-models::type { FamilyListItem }
- import: framer-motion::motion
- import: lucide-react::Activity
- import: lucide-react::Wind
- import: lucide-react::Zap
- import: react::React

---

## INTERFACES

### CategorySeriesViewProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `families: FamilyListItem[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/category/CategorySeriesView.tsx::CategorySeriesView
- **params**: `category`, `parentCategory`, `families`
- **ic_degiskenler**:
  - `lang` — `useI18n()` hook'undan gelen mevcut dil kodu; breadcrumb ve kategori slug'ı için kullanılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; metinlerin yerelleştirilmesinde kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen rota oluşturma yardımcıları; kategori bağlantıları için kullanılır
  - `wrapCategory` — `useCategoryViewModel()` hook'undan gelen fonksiyon; ham kategori verisini görünüm modeline dönüştürür
  - `vm` — `wrapCategory(category)` çağrısının dönüşü; mevcut kategorinin görünüm modeli (`displayName`, `description` alanlarına erişilir)
  - `parentVm` — `wrapCategory(parentCategory)` çağrısının dönüşü; üst kategorinin görünüm modeli (`displayName`, `raw` alanlarına erişilir); varsa breadcrumb'a eklenir
  - `breadcrumbItems` — breadcrumb navigasyon öğeleri dizisi; her eleman `label` ve `href` alanlarından oluşur, `Breadcrumb` bileşenine prop olarak geçilir
- **Dönüş**: JSX elementi — hero bölümü (başlık, açıklama, breadcrumb), aile listesi grid'i (`FamilyCard` bileşenleri) ve güven strip'i içeren tam sayfa düzeni

---

## NODE ID STANDARD

  file: src\views\category\CategorySeriesView.tsx
  function: src\views\category\CategorySeriesView.tsx::CategorySeriesView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategorySeriesView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `tracking-hvac-loose`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-secondary-blue`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `border-b`, `border-cyan-500/20`, `border-dashed`, `border-slate-100`, `border-slate-200`, `lg:text-8xl`, `md:text-5xl`, `text-4xl`, `text-5xl`
- **Layout:** `flex`, `flex-col`, `gap-16`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-1`, `h-2`, `h-px`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `lg:flex-row`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `content-auto`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `italic`, `leading-hvac-11`, `leading-relaxed`, `lg:px-8`, `mb-10`, `mb-12`, `mb-4`