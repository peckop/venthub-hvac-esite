---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\home\GuidedCategoryDiscovery.tsx
skeleton_hash: a29752dab9d07955
entity_hashes:
  func:GuidedCategoryDiscovery: 3b7f2bdef4872624
  overview: 45ef6f3b2def2985
  style_tokens: ba1e7efd5f41a7fe
generated_at: 2026-08-27T13:20:31Z
---

## Genel Bakış
Bu modül, ana sayfada kullanıcılara yönelik rehberli bir kategori keşfi deneyimi sunan tek bir React bileşeninden oluşur. Bileşen, dışarıdan beslenen bir kategori listesini alır ve bu listeyi kullanarak ürünleri görsel ve metin tabanlı bir arayüzde sunarak kullanıcıları bilgilendirir. Modülün yapısı basit olup, yalnızca bir bileşen fonksiyonu içerir.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve merkezi birimini oluşturarak, verilen kategori verisini kullanıcıya sunulan interaktif ve yönlendirici bir arayüze dönüştürür.
- GuidedCategoryDiscovery

## Dış Bağımlılıklar ve Mimari Notlar
Bileşen, `useI18n` ile uluslararasılaştırma, `Routes` ile yönlendirme, `normalizeImageUrl` ile görsel URL normalizasyonu ve `Image` ile optimize edilmiş görsel gösterimi gibi harici modülleri kullanır. Ayrıca `n` modülüne bağımlıdır. Dinamik veya lazy yüklenen bir modül bilgisi bulunmamaktadır. Mimari açıdan, kullanıcı etkileşimini doğrudan etkileyen bir sunum katmanı bileşenidir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesine dayalı aksiyom üretilememektedir.

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
- **params**: `displayCategories` — kategori listesi, varsayılan değer boş dizi `[]`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('home.guidedDiscovery.eyebrowLabel')`, `t('home.guidedDiscovery.heading')`, `t('home.guidedDiscovery.intro')`, `t('home.guidedDiscovery.cardFallback')` key'leriyle metinleri çözümlemek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota yardımcı nesnesi; `Routes.category(category.slug)` ile kategori bağlantılarını oluşturmak için kullanılır
  - `category` — `displayCategories.map()` iterasyonundaki her bir kategori nesnesi; `.id`, `.image_url`, `.displayName`, `.slug`, `.description` alanlarına erişilir
  - `idx` — `displayCategories.map()` iterasyonundaki mevcut elemanın indeks numarası; `idx % 4` işlemiyle gecikme sınıfı seçmek için kullanılır
  - `finalSrc` — `normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images')` çağrısının dönüşü; `<Image>` bileşeninin `src` prop'una atanır
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4]` ifadesiyle hesaplanan animasyon gecikme sınıfı; her kartın fade-up animasyonunun zamanlamasını belirler
- **Dönüş**: JSX — `<section>` kök elemanı içeren React bileşeni

### [N2_NASIL] AST Pointer: src/components/home/GuidedCategoryDiscovery.tsx::(category, idx) => (map callback)
- **params**: `category` — kategori nesnesi, `idx` — dizi indeksi
- **ic_degiskenler**:
  - `finalSrc` — `normalizeImageUrl(category.image_url, FALLBACK_CATEGORY_IMAGE, 'category-images')` çağrısının dönüşü; kategori kartının arka plan resmi URL'si olarak kullanılır
  - `delayClass` — `['delay-0', 'delay-100', 'delay-200', 'delay-300'][idx % 4]` ifadesiyle hesaplanan Tailwind gecikme sınıfı; animasyon zamanlamasını `idx`'e göre ayarlar
  - `category.id` — `<div>` elemanının `key` prop'una atanır
  - `category.slug` — `Routes.category(category.slug)` ile `<Link>` bileşeninin `href` prop'una atanır
  - `category.displayName` — `<Image>` bileşeninin `alt` prop'una ve `<h3>` içeriğine atanır
  - `category.description` — kart açıklaması; tanımlı değilse `t('home.guidedDiscovery.cardFallback')` ile yedek metin gösterilir
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