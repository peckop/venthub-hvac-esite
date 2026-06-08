---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\HomePage.tsx
skeleton_hash: 8133bd5494f0eeb3
entity_hashes:
  func:HomePage: d01f85b0c3ad40a6
  overview: 3d3bfd209a0def0b
  style_tokens: 481a957f2fef5bcd
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ana sayfa görünümünü oluşturan React bileşenini tanımlar. Önceden hazırlanmış kategori ve ürün listelerini giriş olarak alarak ana sayfa arayüzünü kullanıcıya sunar.

## Fonksiyon Grupları
### Ana Sayfa Görünümü
Ana sayfa arayüzünün oluşturulmasından sorumlu temel bileşendir. Kategori ve ürün verilerini alarak sayfanın render edilmesini sağlar.
- HomePage

---

## AXIOMS – Mimari Varsayımlar
Bu modülün, ana sayfa arayüzünü doğru bir şekilde oluşturabilmesi için temel veri akışı ve bileşen yapısına ilişkin aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `initialCategories` ve `rawCategories` her ikisi de boş dizi ise, ana sayfa kategori navigasyonu veya içeriği kullanıcıya sunulamaz.

[Aksiyom 2]: Eğer `initialProducts` boş dizi ise, ana sayfa ürün vitrini veya listeleme bölümü kullanıcıya sunulamaz.

---

## FONKSİYON DETAYLARI

### HomePage

**Ne yapar**: HomePage, VentHub HVAC uygulamasının ana sayfa görünümünü render eden üst düzey React bileşenidir. Kullanıcılara kategoriler ve ürünler gibi temel verileri sunarak uygulamanın giriş noktasını oluşturur.

**Nasıl yapar**: Fonksiyon, sunucu tarafında hazırlanmış (SSR/SSG) başlangıç verilerini alır ve bu verileri kullanarak ana sayfa düzenini oluşturur. React.FC<HomePageProps> generic tipi ile tip güvenliği sağlar ve prop'ların hiçbiri zorunlu değildir; tümü varsayılan olarak boş diziler ile gelir.

**Parametreler**:
- `initialCategories`: `Category[]` (varsayılan: `[]`) — Sayfa yüklendiğinde önceden işlenmiş ve formatlanmış kategori listesi. Sayfada gösterilecek ana kategorileri temsil eder.
- `rawCategories`: `Category[]` (varsayılan: `[]`) — Ham formattaki kategori verileri. Ekstra dönüşüm veya filtreleme gerektiren durumlarda kullanılmak üzere bileşene iletilir.
- `initialProducts`: `Product[]` (varsayılan: `[]`) — Ana sayfada gösterilecek başlangıç ürün listesi. Öne çıkan veya varsayılan olarak sergilenecek ürünleri içerir.

**Dönüş**: `React.FC<HomePageProps>` — JSX element döndüren bir React fonksiyonel bileşeni. Bileşen, ana sayfa düzenini (layout) ve ilgili alt bileşenleri render eder.

---

## INTERFACES

### HomePageProps
- `initialCategories?: CategoryViewModelLite[]`
- `rawCategories?: DomainCategory[]`
- `initialProducts?: Product[]`
- `dictionary: typeof import('../i18n/dictionaries/tr').tr.home`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: HomePage.tsx::HomePage
- **params**: `(initialCategories = [], rawCategories = [], initialProducts = [], dictionary)` — Sayfa açılışında sunucudan gelen başlangıç verileri ve sözlük nesnesi
- **ic_degiskenler**: lokal değişken yok — tüm veri doğrudan parametrelerden JSX'e aktarılır
- **Prop Erişimleri (govde icinde)**:
  - `initialCategories` — Başlangıç kategorileri listesi, `GuidedCategoryDiscovery` bileşenine `displayCategories` olarak iletilir
  - `rawCategories` — Ham kategori listesi, `FeaturedCommercialBlocks` bileşenine `initialCategories` olarak iletilir
  - `initialProducts` — Başlangıç ürün listesi, `FeaturedCommercialBlocks` bileşenine `initialProducts` olarak iletilir
  - `dictionary.applicationSolutions` — Uygulama çözümleri sözlük alt nesnesi, `ApplicationSolutions` bileşenine `dictionary` olarak iletilir
  - `dictionary.trustProof` — Güven kanıtı sözlük alt nesnesi, `TrustProofSection` bileşenine `dictionary` olarak iletilir
  - `dictionary.hero.trustStrip` — Hero bölümünden gelen güven şeridi sözlüğü, `TrustProofSection` bileşenine `trustStripDict` olarak iletilir
  - `dictionary.strategicBrands` — Stratejik markalar sözlük alt nesnesi, `StrategicBrands` bileşenine `dictionary` olarak iletilir
  - `dictionary.knowledge` — Bilgi bloğu sözlük alt nesnesi, `KnowledgeBlock` bileşenine `dictionary` olarak iletilir
  - `dictionary.finalCta` — Son eylem çağrısı sözlük alt nesnesi, `KnowledgeBlock` bileşenine `finalCtaDict` olarak iletilir
  - `dictionary.stats?.yearsExperience` — Deneyim yılı istatistiği (optional chaining ile güvenli erişim), `|| ''` ile boş string fallback'i, `KnowledgeBlock` bileşenine `statsExperience` olarak iletilir
- **Dönüş**: JSX element ağacı (`<div>` kök elemanı — tüm ana sayfa bileşenlerini sıralı olarak render eden React bileşeni)

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