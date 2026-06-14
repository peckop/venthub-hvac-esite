---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryOrbitCarousel.tsx
skeleton_hash: 9a571c9bfe021fd1
entity_hashes:
  func:CategoryOrbitCarousel: f55930f20c5ff8c5
  func:getModelTypeForCategory: d5b53316e0d1f0a0
  overview: df42b4715b1e78f0
  style_tokens: 47138b5b4fa0854f
generated_at: 2026-06-14T22:51:53Z
---

## Genel Bakış
Ürün kategorilerini interaktif dairesel karusel formatında görüntüleyen bir React bileşeni modülüdür. Kullanıcıların alt kategorilere tıklayarak ilgili ürünlere erişmesini sağlar ve hem standart hem de kompakt olmak üzere iki farklı görünüm modunu destekler. Modül, kategori kimliklerini model tiplerine dönüştüren yardımcı fonksiyon aracılığıyla karuselin içerik yapısını dinamik olarak belirler.

## Fonksiyon Grupları

### Kategori-Dönüşüm Yardımcısı
Kategori benzersiz adres değerini alarak uygun model tipini belirleyen yardımcı fonksiyondur. Ana bileşenin içerik yükleme ve sınıflandırma mantığını destekler.
- getModelTypeForCategory

### Ana Karusel Bileşeni
Kullanıcı etkileşimlerini yöneten, görünüm modunu uygulayan ve alt kategori seçimlerini üst bileşene bildiren ana React bileşenidir.
- CategoryOrbitCarousel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori karuseli bileşeninin çalışması için aşağıdaki mimari varsayımlara dayanır:

[Aksiyom 1]: Eğer `onSubcategorySelect` prop'u sağlanmazsa veya geçerli bir fonksiyon değilse, kullanıcı alt kategorilere tıklayamaz ve navigasyon işlevselliği çalışmaz.

[Aksiyom 2]: Eğer `slug` parametresi `getModelTypeForCategory` için tanımsız (undefined) gelirse, uygun model tipi belirlenemez ve karusel içeriği varsayılan veya boş duruma düşer.

[Aksiyom 3]: Eğer `compact` prop'u `false` olarak başlamazsa (örn: invalid değer gelirse), karuselin standart görünüm modu yanlış render edilir.

[Aksiyom 4]: Eğer `OrbitalProductsShowcase` modülde çağrılmazsa, karousel bileşeni ürünleri gösteremez.

[Aksiyom 5]: Eğer `CategoryOrbitCarouselProps` yapısında `onSubcategorySelect` alanı zorunlu olarak tanımlanmamışsa, bileşen alt kategori seçim olayını tetikleyemez.

---

## FONKSİYON DETAYLARI

### getModelTypeForCategory
**Ne yapar**: İsteğe bağlı olarak gelen kategori slug değerine göre uygun ürün model tipini eşleştirip döndürür, kategori bazlı ürün sınıflandırması işlemini gerçekleştirir. Sadece tanımlı ve geçerli slug değerleri için geçerli bir model tipi sonucu üretir.
**Nasıl yapar**: Gelen slug parametresini önceden tanımlanmış kategori-model eşleşmeleri ile karşılaştırır, eşleşme bulunduğunda ilgili model tipini iletir. Eğer slug tanımsız ise veya hiçbir eşleşme sağlanamaz ise tanımsız değerini döndürür.
**Parametreler**:
- slug: string | undefined — İşlem yapılacak kategorinin benzersiz, URL yapısına uygun kısa kimliği, isteğe bağlı olarak tanımlanabilir
**Dönüş**: string | undefined — Geçerli ve eşleşen slug durumunda ilgili ürün model tipini, geçersiz veya tanımsız slug durumunda undefined değerini döndürür

### CategoryOrbitCarousel
**Ne yapar**: VentHub HVAC platformu ürünlerini kategorilere göre dairesel yörünge karusel formatında sunan React bileşenidir, kullanıcıların listedeki alt kategoriler arasında gezinmesini ve seçim yapmasını sağlar. Farklı ekran boyutları ve kullanım senaryolarına uygun olarak kompakt modda çalışma desteği sunar.
**Nasıl yapar**: Aldığı yapılandırma parametrelerine göre arayüzünü düzenler, kullanıcı tarafından bir alt kategori seçimi yapıldığında üst bileşene seçim bilgisini iletmek için tanımlanan callback fonksiyonunu tetikler. Varsayılan olarak standart boyutlu düzeni kullanır, compact parametresi true olarak iletildiğinde daha küçük ölçekli arayüzü render eder.
**Parametreler**:
- onSubcategorySelect: CategoryOrbitCarouselProps tipinde tanımlı callback fonksiyonu — Kullanıcı tarafından bir alt kategori seçildiğinde tetiklenir, seçilen kategori bilgilerini üst bileşene iletmek için kullanılır
- compact: boolean — Bileşenin kompakt küçük boyutlu modda çalışmasını sağlayan isteğe bağlı parametre, varsayılan değeri false olarak tanımlanmıştır
**Dönüş**: Void veya bilinmeyen türde değer, React bileşeni olarak ekrana karusel arayüzünü render eder, dönüş tipi açıkça tanımlanmamıştır

---

## İTHALATLAR (IMPORTS)
- import: ../../contexts/CategoryContext::useCategories
- import: ../../hooks/useCategoryViewModel::useCategoryViewModel
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
- import: lucide-react::ArrowLeft
- import: lucide-react::ChevronRight
- import: next/dynamic::dynamic
- import: next/navigation::useRouter
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## INTERFACES

### CategoryOrbitCarouselProps
- `onSubcategorySelect?: (categorySlug: string, subcategorySlug?: string) => void`
- `compact?: boolean`

---

## SABİTLER
- **FADE_IN_DOWN_CSS** (template) — ``@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } t...`
- **FADE_IN_CSS** (template) — ``@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { o...`
- **SCALE_IN_CSS** (template) — ``@keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opaci...`
- **OrbitalProductsShowcase** (call) — `dynamic(() => import('./OrbitalProductsShowcase'), { ssr: false })`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryOrbitCarousel.tsx::getModelTypeForCategory
- **params**: `slug?: string` — kategori slug'u, model tipi belirlemek için kullanılır
- **ic_degiskenler**:
  - `s` — slug'un küçük harfe çevrilmiş hali, keyword eşleştirmeleri için kullanılır
- **Dönüş**: `string | undefined` — slug eşleşmesine göre model tipi dizesi (ör. 'AxialFanModel') veya eşleşme yoksa undefined, hiçbir eşleşme tutmazsa 'AxialFanModel'

---

## NODE ID STANDARD

  file: src\components\products\CategoryOrbitCarousel.tsx
  function: src\components\products\CategoryOrbitCarousel.tsx::getModelTypeForCategory
  function: src\components\products\CategoryOrbitCarousel.tsx::CategoryOrbitCarousel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryOrbitCarousel
  export: getModelTypeForCategory

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `h-hvac-panel`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-orbit-radial-1`, `bg-orbit-radial-2`, `bg-surface-darker`, `bg-white/10`, `border-white/20`, `from-cyan-500`, `hover:bg-white/20`, `md:text-3xl`, `sm:text-sm`, `text-center`, `text-cyan-400`, `text-sm`, `text-white`, `text-white/50`
- **Layout:** `absolute`, `backdrop-blur-md`, `flex`, `flex-col`, `from-cyan-500`, `gap-2`, `gap-3`, `h-4`, `hover:shadow-cyan-500/30`, `hover:shadow-lg`, `items-center`, `justify-between`, `justify-center`, `left-0`, `max-w-150px`
- **Varyant/Responsive:** `:`, `active:`, `group-hover:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${level`, `:`, `===`, `active:scale-98`, `border`, `container`, `duration-1000`, `duration-300`, `ease-in-out`, `font-bold`, `font-medium`, `group`, `group-hover:-translate-x-1`, `hover:scale-102`, `inset-0`