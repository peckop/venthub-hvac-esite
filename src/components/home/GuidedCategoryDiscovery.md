---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\home\GuidedCategoryDiscovery.tsx
skeleton_hash: 9557640ed0b5b596
entity_hashes:
  func:GuidedCategoryDiscovery: 3b7f2bdef4872624
  overview: 45ef6f3b2def2985
  style_tokens: ba1e7efd5f41a7fe
generated_at: 2026-08-27T08:27:30Z
---

## Genel Bakış
Bu modül, ana sayfada kullanıcılara yönelik rehberli bir kategori keşfi deneyimi sunan tek bir React bileşeninden oluşur. Bileşen,

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, aksiyom üretilememektedir. Fonksiyon gövdesi sağlanmadığı sürece yalnızca imzadan çıkarım yapılması, 0d kuralı gereği spekülasyona gireceğinden yapılmamıştır.

---

## FONKSİYON DETAYLARI

### GuidedCategoryDiscovery
**Ne yapar**: `displayCategories` prop’u ile sağlanan kategori listesini kullanarak, kullanıcıya yönlendirilmiş kategori keşfi arayüzünü render eden bir React bileşenidir.  
**Nasıl yapar**: Bileşen, `displayCategories` prop’unun varsayılan değerini boş bir dizi olarak alır; bu diziyi içeri harita yaparak her kategori için uygun görsel ve metin öğelerini oluşturur ve JSX döndürür. Prop tipi `GuidedCategoryDiscoveryProps` ile tip güvenliği sağlanır.  
**Parametreler**:
- displayCategories: [] — Gösterilecek kategori nesnelerinin dizisi; belirtilmezse boş dizidir.  
**Dönüş**: React.FC<GuidedCategoryDiscoveryProps> — Render edilmesi gereken kullanıcı arayüzünü tanımlayan fonksiyonel bileşen.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: @/utils/imageUtils::normalizeImageUrl
- import: next/image::Image
- import: next/link::Link
- import: react::React

---

## INTERFACES

### CategoryViewModelLite
- `id: string`
- `slug: string`
- `displayName: string`
- `description: string`
- `image_url: string | null`

### GuidedCategoryDiscoveryProps
- `displayCategories?: CategoryViewModelLite[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::GuidedCategoryDiscovery
- **params**: `{ displayCategories = [] }` — props destructuring; `displayCategories` varsayılan boş dizi olan kategori listesi
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; JSX içinde `t('home.guidedDiscovery.eyebrowLabel')`, `t('home.guidedDiscovery.heading')`, `t('home.guidedDiscovery.intro')`, `t('home.guidedDiscovery.cardFallback')` anahtarlarıyla metinleri çözümlemek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; `Routes.category(category.slug)` çağrısıyla kategori bağlantılarını üretmek için kullanılır
  - `category` — `displayCategories.map()` callback parametresi; her bir kategori nesnesi. Erişilen alanları: `category.id`, `category.image_url`, `category.displayName`, `category.slug`, `category.description`
  - `idx` — `displayCategories.map()` callback parametresi; döngü indeksi, animasyon gecikme sınıfı seçmek için `idx % 4` olarak kullanılır
  - `finalSrc` — `normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images')` çağrısının dönüşü; `<Image src={finalSrc}>` içinde kullanılan normalize edilmiş resim URL'si
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4]` ifadesinden elde edilen animasyon gecikme CSS sınıfı; her kartın fade-up animasyonunu geciktirmek için kullanılır
- **Dönüş**: JSX — `<section>` kök elemanı içeren React bileşeni

### [N2_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::(anonymous map callback)
- **params**: `category`, `idx` — `displayCategories.map()` içindeki her eleman ve indeksi
- **ic_degiskenler**:
  - `finalSrc` — `normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images')` çağrısının dönüşü; kategori resminin normalize edilmiş URL'si, `<Image src={finalSrc}>` prop'unda kullanılır
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4]` ifadesinden elde edilen CSS sınıfı; kartın `data-observe="fade-up"` animasyonuna gecikme ekler
  - `category.id` — kart `<div>` elemanının `key` prop'u olarak kullanılır
  - `category.image_url` — `normalizeImageUrl` fonksiyonuna birinci argüman olarak geçilir
  - `category.displayName` — `<Image alt={category.displayName}>` ve `<h3>{category.displayName}</h3>` içinde kullanılır
  - `category.slug` — `Routes.category(category.slug)` çağrısında `<Link href>` prop'u için kullanılır
  - `category.description` — `category.description || t('home.guidedDiscovery.cardFallback')` ifadesinde kullanılır; yoksa çeviri fonksiyonundan fallback metin alınır
- **Dönüş**: JSX — tek bir kategori kartını temsil eden `<div>` elemanı

---

## NODE ID STANDARD

  file: src\components\home\GuidedCategoryDiscovery.tsx
  function: src\components\home\GuidedCategoryDiscovery.tsx::GuidedCategoryDiscovery

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModelLite
  export: GuidedCategoryDiscovery

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-relaxed`, `tracking-hvac-tight`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-slate-100`, `bg-slate-950`, `bg-slate-950/40`, `bg-white`, `bg-white/30`, `border-b`, `border-l`, `border-r`, `border-t`, `border-white/20`, `from-slate-950/80`, `group-hover:bg-cyan-500`, `group-hover:bg-slate-950/20`, `group-hover:border-cyan-500/50`
- **Layout:** `absolute`, `block`, `bottom-8`, `flex`, `flex-col`, `flex-shrink-0`, `from-slate-950/80`, `gap-4`, `gap-6`, `group-hover:max-h-24`, `group-hover:w-24`, `h-4`, `h-full`, `h-px`, `items-center`
- **Varyant/Responsive:** `data-[in-view=true]:`, `group-hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${delayClass`, `-translate-x-4`, `aspect-square`, `data-[in-view=true]:opacity-100`, `data-[in-view=true]:translate-x-0`, `data-[in-view=true]:translate-y-0`, `delay-200`, `delay-300`, `duration-1.5s`, `duration-500`, `duration-700`, `ease-out`, `font-bold`, `font-extralight`, `font-light`