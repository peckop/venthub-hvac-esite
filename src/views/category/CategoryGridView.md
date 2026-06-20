---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\category\CategoryGridView.tsx
skeleton_hash: 32abbfdef3326d64
entity_hashes:
  func:CategoryGridView: 7b1f2c5723260534
  overview: bbed19dee4115a19
  style_tokens: 9b61cf001b5ee023
generated_at: 2026-06-19T20:50:11Z
---

## Genel Bakış
Bu modül, bir kategori sayfasının ana ızgara görünümünü oluşturan tek bir React bileşenidir. Dışarıdan aldığı kategori, alt kategoriler ve marka bilgilerini kullanarak sayfanın temel yapısını ve içeriğini render eder.

## Fonksiyon Grupları
### Ana Bileşen
Sayfanın tüm ızgara düzenini ve temel yapısını oluşturan merkezi bileşendir. Kullanıcıya kategori bilgilerini, alt kategorileri ve mevcut markaları görsel olarak sunar.
- CategoryGridView

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir kategori ızgara görünümü sunan bir React bileşenidir ve dışarıdan prop olarak veri bekler.

[Aksiyom 1]: Eğer `category` prop'u sağlanmazsa, kategori başlığı ve temel kategori bilgileri render edilemez, bileşen boş veya hatalı bir durumda kalır.

[Aksiyom 2]: Eğer `subCategories` prop'u sağlanmazsa veya boş bir dizi ise, alt kategori grid'i oluşturulamaz ve alt kategoriler bölümü görünmez olur.

[Aksiyom 3]: Eğer `availableBrands` prop'u sağlanmazsa veya boş bir dizi ise, marka filtreleme veya marka gösterim alanı render edilmez.

[Aksiyom 4]: Eğer `parentCategory` prop'u sağlanmazsa, üst kategori referansı bilinmiyor durumda olur ve bileşen üst kategoriye ait herhangi bir bilgi gösteremez.

[Aksiyom 5]: Eğer `pro` prop'u sağlanmazsa, pro kullanıcılara yönelik ek özellik veya fiyatlandırma bilgisi gösterilemez.

---

## FONKSİYON DETAYLARI

### CategoryGridView
**Ne yapar**: Bu React Fonksiyonel Bileşeni, VentHub HVAC platformundaki kategori sayfaları için grid tabanlı arayüz sunar. Almış olduğu kategori, alt kategori, marka ve pro abonelik verilerini kullanarak kullanıcıların kategorileri gezmesi, filtrelemesi ve ilgili ürünlere erişmesi için gerekli UI öğelerini oluşturur. Kullanıcı deneyimini iyileştirmek için dinamik içerik gösterimi ve filtreleme seçenekleri sunar.
**Nasıl yapar**: Bileşen, dışarıdan iletilen tüm propsları alır ve bu verileri kullanarak grid yapısını dinamik olarak oluşturur. Öncelikle ana kategori bilgilerini başlık olarak gösterir, ardından alt kategorileri kartlar halinde sıralar, mevcut markaları filtre seçenekleri olarak ekler ve pro kullanıcıları için özel içeriklerin erişilebilirliğini kontrol eder. Tüm veri akışını props üzerinden sağlayarak bağımsız, test edilebilir ve yeniden kullanılabilir bir yapı sunar.
**Parametreler**:
- category: Category — Mevcut aktif kategori ile ilgili tüm meta verileri içeren nesne, kategori kimliği, adı, tanımı ve görsel bilgileri gibi temel verileri barındırır.
- parentCategory: Category | undefined — Mevcut kategorinin üst kategorisi ile ilgili bilgileri içeren opsiyonel nesne, eğer mevcut kategori ana seviye bir kategori ise bu değer tanımlanmayabilir.
- subCategories: Category[] — Mevcut kategorinin altındaki tüm alt kategorileri içeren dizi, grid görünümünde her bir alt kategori için ayrı kart öğeleri oluşturmak için kullanılır.
- availableBrands: Brand[] — Mevcut kategori ile ilişkili tüm markaları içeren dizi, kullanıcıların marka bazında filtreleme yapması için seçenekler sunar.
- pro: boolean — Mevcut kullanıcının pro abonelik durumunu belirten mantıksal değer, pro özel indirimler veya içeriklerin gösterilip gösterilmeyeceğine karar vermek için kullanılır.
**Dönüş**: React.FC<CategoryGridViewProps> türünde bir React bileşeni döndürür. Bu döndürülen bileşen, alınan tüm propsları kullanarak render edilmiş grid arayüzünü sunar ve kategori gezintisi, alt kategori listeleme, marka filtreleme ve pro içerik erişimi gibi temel işlevleri barındırır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/ProductCard::ProductCard
- import: ../../components/category/CategoryFilters::CategoryFiltersComponent
- import: ../../components/layout/PageShell::PageShell
- import: ../../hooks/useCategoryGateway::type { CategoryFilters }
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/type-converters::type { DomainCategory }
- import: @/types/ui-models::type { Product }
- import: lucide-react::Grid
- import: lucide-react::List
- import: react::React

---

## INTERFACES

### CategoryGridViewProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `products: Product[]`
- `filters: CategoryFilters`
- `onUpdateFilters: (updates: Partial<CategoryFilters>) => void`
- `loading?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryGridView.tsx::CategoryGridView
- **params**: `{ category, parentCategory, subCategories, availableBrands, products, filters, onUpdateFilters, loading }`
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, UI metinlerini uluslararasılaştırmak için kullanılır
- **Dönüş**: JSX (`<PageShell>` ile sarılmış category sayfası görünümü)

---

## NODE ID STANDARD

  file: src\views\category\CategoryGridView.tsx
  function: src\views\category\CategoryGridView.tsx::CategoryGridView

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryGridView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `hover:text-slate-600`, `text-center`, `text-slate-400`, `text-slate-500`, `text-slate-700`, `text-slate-900`, `text-sm`, `text-white`
- **Layout:** `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `gap-12`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `lg:flex-row`, `lg:w-80`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${filters.viewMode`, `:`, `===`, `border`, `focus-visible:ring-primary-ocean/20`, `font-bold`, `font-medium`, `list`, `mb-10`, `pb-6`, `pl-4`, `pr-10`, `py-2.5`, `py-32`, `rounded-lg`