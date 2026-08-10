---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx
skeleton_hash: bbdc152371d7327d
entity_hashes:
  func:BrandsPage: 7fe8abffb7e6dbf9
  overview: 3003d757bf1d8636
  style_tokens: 583cff7322941abd
generated_at: 2026-06-19T20:50:29Z
---

## Genel Bakış
BrandsPage, Venthub HVAC platformunda markaları listleyen tek bileşenli bir React sayfa modülüdür. Sayfa, markaları görsel ve interaktif bir arayüzle kullanıcılara sunarak navigasyon ve keşif deneyimini destekler. Uluslararasılaştırma, erişilebilirlik ve performans optimizasyonları gibi modern web standartlarına uygun olarak tasarlanmıştır.

## Fonksiyon Grupları
### Marka Sayfası Görünümü
Modülün tek bileşeni olan BrandsPage, markaların listelendiği premium seviye arayüzü render eder.
- BrandsPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### BrandsPage
**Ne yapar**: BrandsPage, uygulamanın premium seviyede tasarlanmış "Markalar" sayfasını render eden bir React bileşenidir. Bu sayfa, kullanıcıya markaları görsel ve interaktif bir biçimde sunar. Bileşen, modern web standartlarına uygun olarak uluslararasılaştırma (i18n), erişilebilirlik (A11y) ve performans optimizasyonları ile donatılmıştır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (FC) olarak tanımlanmıştır. Bileşen, marka verilerini ve sayfa düzenini oluşturarak JSX olarak döndürür. Dahili mantığı, i18n modülleri ile çoklu dil desteği, A11y standartları ile ekran okuyucu ve klavye navigasyonu uyumluluğu ve performans optimizasyon techniques ile hızlı yükleme ve akıcı kullanıcı deneyimi sağlamak üzere yapılandırılmıştır.

**Parametreler**:
- Fonksiyona ait açıkça belirtilmiş herhangi bir parametre yoktur. Bileşen, props almayan veya varsayılan değerlerle çalışan bağımsız bir sayfa yapısıdır.

**Dönüş**: `React.FC` — Bileşen, React'ın Functional Component tipinde bir JSX yapısı döndürür. Bu yapı, Markalar sayfasının tamamını temsil eden kullanıcı arayüzünü içerir.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::BrandsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; sayfa içindeki tüm metinleri lokalize etmek için kullanılır.
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; marka sayfası URL'lerini lokalize olarak oluşturur (örn. `Routes.brand(brand.slug)`).
  - `brands` — `HVAC_BRANDS` sabitinden atanan, tüm HVAC markalarını içeren dizi; harita içinde dönülerek her marka kartı oluşturulur.
  - `heroBadgeRef` — Hero bölümündeki badge elemanı için React ref; `useScrollAnimation` hook'una bağlanarak scroll animasyonu tetiklemek için kullanılır.
  - `heroBadgeVisible` — Hero badge'in görünürlük durumu布尔; scroll animasyonu için belirlenen eşik değer (0.2) aşıldığında `true` olur ve animasyon sınıflarını tetikler.
  - `brandsGridRef` — Brands grid bölümü için React ref; `useScrollAnimation` hook'una bağlanarak scroll animasyonu tetiklemek için kullanılır.
  - `brandsGridVisible` — Brands grid'in görünürlük durumu布尔; scroll animasyonu için belirlenen eşik değer (0.05) aşıldığında `true` olur ve animasyon sınıflarını tetikler.
- **Dönüş**: JSX elemanı (React.FC); tüm sayfa yapısını (hero, marka gridi, güven bölümü) içeren bir React bileşeni.

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