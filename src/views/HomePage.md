---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\HomePage.tsx
skeleton_hash: 6f4e642dc8c1fb54
entity_hashes:
  func:HomePage: 942e6678a2c90194
  overview: c60416d7c16e0ad1
  style_tokens: 481a957f2fef5bcd
generated_at: 2026-08-27T07:09:01Z
---

## Genel Bakış

Bu modül, uygulamanın ana sayfasını oluşturan bir React bileşenidir. Bileşen, dışarıdan sağlanan kategori ve ürün verilerini alarak ana sayfa görünümünü render eder. Üç adet varsayılan değere sahip prop ile çalışır: `initialCategories`, `rawCategories` ve `initialProducts`.

## Fonksiyon Grupları

### Ana Sayfa Bileşeni
Ana sayfanın tüm görünümünden ve içeriğinden sorumludur. Dışarıdan sağlanan kategori listeleri ve ürün verilerini kullanarak sayfa düzenini oluşturur.
- HomePage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından çıkarım yapılabilir.

[Aksiyom 1]: Eğer `initialCategories` prop'u sağlanmazsa, boş bir dizi (`[]`) kullanılır.
[Aksiyom 2]: Eğer `rawCategories` prop'u sağlanmazsa, boş bir dizi (`[]`) kullanılır.
[Aksiyom 3]: Eğer `initialProducts` prop'u sağlanmazsa, boş bir dizi (`[]`) kullanılır.

**Not:** Fonksiyon gövdesi verilmediği için, bu props'ların bileşen içinde nasıl kullanıldığı, hangi alt bileşenlere aktarıldığı veya hangi iş mantığını tetiklediğine dair aksiyom üretilememiştir. Üç props da varsayılan değerlerle opsiyonel olarak tanımlanmıştır; bu nedenle bileşen eksik prop ile çağrıldığında hata vermez, boş veri setleriyle çalışır.

---

## FONKSİYON DETAYLARI

### HomePage
**Ne yapar**: HomePage, bir React fonksiyon bileşenidir. Adından anlaşılacağı üzere ana sayfa (home page) bileşeni olarak görev yapar. Varsayılan olarak boş dizilerle başlatılan kategori ve ürün verilerini alarak ana sayfa görünümünü oluşturur.

**Nasıl yapar**: Fonksiyon, destructuring yöntemiyle aldığı üç parametre ile çalışır. initialCategories, rawCategories ve initialProducts parametrelerinin her biri varsayılan olarak boş dizi (`[]`) değerine sahiptir. Fonksiyon, `React.FC<HomePageProps>` tipinde bir bileşen döndürür; bu, HomePageProps arayüzüne uygun props alan bir React fonksiyon bileşeni olduğunu gösterir. Docstring belirtilmediğinden iç mantık detayları bilinmemektedir.

**Parametreler**:
- initialCategories: `[]` (varsayılan) — Başlangıç kategorilerini içeren dizi. Tip bilgisi verilmemiştir, varsayılan değer boş dizi olarak atanmıştır.
- rawCategories: `[]` (varsayılan) — Ham kategori verilerini içeren dizi. Tip bilgisi verilmemiştir, varsayılan değer boş dizi olarak atanmıştır.
- initialProducts: `[]` (varsayılan) — Başlangıç ürünlerini içeren dizi. Tip bilgisi verilmemiştir, varsayılan değer boş dizi olarak atanmıştır.

**Dönüş**: `React.FC<HomePageProps>` — HomePageProps arayüzüne uygun props alan bir React fonksiyon bileşeni döndürür. HomePageProps tipinin yapısı bu kaynakta belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../components/home/ApplicationSolutions::ApplicationSolutions
- import: ../components/home/CinematicProductShowcase::CinematicProductShowcase
- import: ../components/home/FeaturedCommercialBlocks::FeaturedCommercialBlocks
- import: ../components/home/GuidedCategoryDiscovery::CategoryViewModelLite
- import: ../components/home/GuidedCategoryDiscovery::GuidedCategoryDiscovery
- import: ../components/home/HomePageClientWrapper::HomePageClientWrapper
- import: ../components/home/HomeSinevizyon::HomeSinevizyon
- import: ../components/home/KnowledgeBlock::KnowledgeBlock
- import: ../components/home/RevealSection::RevealSection
- import: ../components/home/StrategicBrands::StrategicBrands
- import: ../components/home/TrustProofSection::TrustProofSection
- import: ../components/ui/ScrollObserver::ScrollObserver
- import: ../lib/type-converters::DomainCategory
- import: @/types/ui-models::type { Product }
- import: react::React

---

## INTERFACES

### HomePageProps
- `initialCategories?: CategoryViewModelLite[]`
- `rawCategories?: DomainCategory[]`
- `initialProducts?: Product[]`
- `dictionary: typeof import('../i18n/dictionaries/tr').tr.home`
- `lang: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/HomePage.tsx::HomePage
- **params**:
  - `initialCategories` — varsayılan değeri `[]` olan dizi; `GuidedCategoryDiscovery` bileşenine `displayCategories` prop'u olarak geçilir
  - `rawCategories` — varsayılan değeri `[]` olan dizi; `FeaturedCommercialBlocks` bileşenine `initialCategories` prop'u olarak geçilir
  - `initialProducts` — varsayılan değeri `[]` olan dizi; `FeaturedCommercialBlocks` bileşenine `initialProducts` prop'u olarak geçilir
  - `dictionary` — sözlük nesnesi; alt alanları birden çok bileşene prop olarak dağıtılır
  - `lang` — dil bilgisi; `ApplicationSolutions` ve `KnowledgeBlock` bileşenlerine `lang` prop'u olarak geçilir
- **ic_degiskenler**:
  - `dictionary.applicationSolutions` — `ApplicationSolutions` bileşenine `dictionary` prop'u olarak geçilir
  - `dictionary.trustProof` — `TrustProofSection` bileşenine `dictionary` prop'u olarak geçilir
  - `dictionary.hero.trustStrip` — `TrustProofSection` bileşenine `trustStripDict` prop'u olarak geçilir
  - `dictionary.strategicBrands` — `StrategicBrands` bileşenine `dictionary` prop'u olarak geçilir
  - `dictionary.knowledge` — `KnowledgeBlock` bileşenine `dictionary` prop'u olarak geçilir
  - `dictionary.finalCta` — `KnowledgeBlock` bileşenine `finalCtaDict` prop'u olarak geçilir
  - `dictionary.stats?.yearsExperience` — opsiyonel chaining ile erişilir; mevcutsa `yearsExperience` değeri, aksi halde `''` (boş string) olarak `KnowledgeBlock` bileşenine `statsExperience` prop'u olarak geçilir
- **Dönüş**: JSX elementi — `div` kök elemanı içinde `ScrollObserver`, `HomePageClientWrapper`, `HomeSinevizyon`, `GuidedCategoryDiscovery`, `RevealSection`, `CinematicProductShowcase`, `ApplicationSolutions`, `TrustProofSection`, `FeaturedCommercialBlocks`, `StrategicBrands`, `KnowledgeBlock` bileşenlerini içeren bir React bileşeni (`React.FC<HomePageProps>`)

---

## NODE ID STANDARD

  file: src\views\HomePage.tsx
  function: src\views\HomePage.tsx::HomePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: HomePage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-white`, `from-slate-950`, `selection:bg-cyan-100`, `selection:text-cyan-900`, `text-slate-900`, `to-white`
- **Layout:** `absolute`, `from-slate-950`, `h-32`, `lg:h-64`, `min-h-screen`, `overflow-hidden`, `relative`, `z-10`
- **Varyant/Responsive:** `lg:`, `selection:` önekleri
- **Yardımcı Sınıflar:** `-mt-16`, `inset-0`, `lg:space-y-48`, `opacity-100`, `pb-32`, `space-y-32`