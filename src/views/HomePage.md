---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\HomePage.tsx
skeleton_hash: 6c0011202735a2cd
entity_hashes:
  func:HomePage: 942e6678a2c90194
  overview: c60416d7c16e0ad1
  style_tokens: 481a957f2fef5bcd
generated_at: 2026-06-15T17:05:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ana sayfa görünümünü oluşturan üst düzey React bileşenini tanımlar. Sayfa, sunucu tarafında hazırlanmış kategori ve ürün verilerini giriş olarak alarak kullanıcıya dinamik ve veriye dayalı bir arayüz sunar. Genel olarak, uygulamanın giriş noktasını ve temel navigasyon ile vitrin bölümlerini yapılandırmaktan sorumludur.

## Fonksiyon Grupları
### Ana Sayfa Görünümü
Ana sayfa arayüzünün tüm bileşenlerini ve düzenini oluşturmaktan sorumlu temel fonksiyon grubudur. Veri akışını yöneterek kategori ve ürün bölümlerinin doğru şekilde render edilmesini sağlar.
- HomePage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### HomePage

**Ne yapar**: Ana sayfa bileşenidir. E-ticaret veya ürün kataloğu uygulamasının ilk kullanıcıya gösterilen sayfasını render eder. Kategorileri ve ürünleri alarak ana sayfa düzenini oluşturur.

**Nasıl yapar**: Bir React fonksiyonel bileşeni (React.FC) olarak tanımlanmıştır. Üç props alır ve her biri için boş dizi (`[]`) varsayılan değerleri tanımlanmıştır. Bu sayede props传递 yapılmadığında bile bileşen hata vermeden çalışabilir. `initialCategories` işlenmiş kategori listesini, `rawCategories` ham kategori verisini (muhtemelen mehrarbeit veya dönüşüm bekleyen veri), `initialProducts` ise başlangıç ürün listesini kabul eder. Bileşen bu verileri kullanarak ana sayfa düzenini oluşturur.

**Parametreler**:
- `initialCategories` — `Category[]` (varsayılan: `[]`) — Daha önce işlenmiş ve formatlanmış kategori nesnelerinden oluşan dizi. Kategori filtreleme, navigasyon veya kart gösterimi için kullanılır.
- `rawCategories` — `RawCategory[]` (varsayılan: `[]`) — Ham biçimdeki kategori verisi. Dönüştürme işlemi henüz uygulanmamış, işlenmemiş kategori bilgilerini içerir. Bileşen içinde ayrıca işleme tabi tutulabilir.
- `initialProducts` — `Product[]` (varsayılan: `[]`) — Ana sayfada gösterilecek başlangıç ürün listesi. Popüler, öne çıkan veya varsayılan filtreyle gelen ürünleri barındırır.

**Dönüş**: `React.FC<HomePageProps>` — React fonksiyonel bileşeni döndürür. JSX yapısı ile ana sayfa arayüzünü render eder.

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

### [N1_NASIL] AST Pointer: `src/views/HomePage.tsx`::HomePage
- **params**:
  - `initialCategories` — Sunucu tarafında hazırlanmış hafif kategori listesi, varsayılan `[]`; `GuidedCategoryDiscovery` bileşenine `displayCategories` olarak aktarılır
  - `rawCategories` — Ham kategori verisi, varsayılan `[]`; `FeaturedCommercialBlocks` bileşenine `initialCategories` prop'u olarak aktarılır
  - `initialProducts` — Sunucu tarafında hazırlanmış ürün listesi, varsayılan `[]`; `FeaturedCommercialBlocks` bileşenine `initialProducts` olarak aktarılır
  - `dictionary` — Sayfa için çok dilli sözlük nesnesi; alt bileşenlere parça parça aktarılır
  - `lang` — Aktif dil kodu; `ApplicationSolutions` ve `KnowledgeBlock` bileşenlerine iletilir
- **ic_degiskenler**: (fonksiyon gövdesinde `const`/`let`/`var` ile tanımlanmış değişken yoktur — doğrudan JSX döner)
- **Prop erişimleri (dictionary alt yolları)**:
  - `dictionary.applicationSolutions` — `ApplicationSolutions` bileşenine sözlük olarak verilir
  - `dictionary.trustProof` — `TrustProofSection` bileşenine sözlük olarak verilir
  - `dictionary.hero.trustStrip` — `TrustProofSection` bileşenine `trustStripDict` olarak verilir
  - `dictionary.strategicBrands` — `StrategicBrands` bileşenine sözlük olarak verilir
  - `dictionary.knowledge` — `KnowledgeBlock` bileşenine sözlük olarak verilir
  - `dictionary.finalCta` — `KnowledgeBlock` bileşenine `finalCtaDict` olarak verilir
  - `dictionary.stats?.yearsExperience` — `KnowledgeBlock` bileşenine `statsExperience` olarak verilir, değer tanımsızsa boş string (`''`) fallback kullanılır
- **Kullanılan alt bileşenler**: `ScrollObserver`, `HomePageClientWrapper`, `HomeSinevizyon`, `GuidedCategoryDiscovery`, `CinematicProductShowcase`, `ApplicationSolutions`, `TrustProofSection`, `FeaturedCommercialBlocks`, `StrategicBrands`, `KnowledgeBlock`, `RevealSection`
- **Dönüş**: JSX — tam sayfa düzeni içeren React element ağacı (`<div className="min-h-screen ...">` kök elementi)

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