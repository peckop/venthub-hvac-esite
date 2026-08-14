---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandDetailPage.tsx
skeleton_hash: ad47a1f826995eb0
entity_hashes:
  func:BrandDetailPage: 658e62bc6ce56cad
  overview: 83474bb2d24aa7c3
  style_tokens: 7d26806290344037
generated_at: 2026-08-13T08:55:59Z
---

## Genel Bakış
BrandDetailPage modülü, VentHub HVAC platformunda belirli bir markanın detay sayfasını sunan React bileşenidir. Prop olarak aldığı `initialBrandSlug` değerini kullanarak ilgili markanın bilgilerini, modül içinde tanımlı `BRAND_DETAILS` sabit objesinden çeker ve sayfa içeriğini render eder. Bileşen, sunucu tarafı render (SSR) ile uyumlu olacak şekilde yapılandırılmıştır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Marka detay sayfasının ana görünümünü ve sunum mantığını yöneten React bileşenini içerir.
- BrandDetailPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React sayfa bileşeni olup props ve sabit obje bağımlılıkları üzerinden çalışır. Aşağıdaki mimari varsayımlar fonksiyon imzası ve modül sabitlerinden türetilmiştir.

---

**[Aksiyom 1]:** Eğer `initialBrandSlug` prop'u sağlanmazsa veya `undefined`/`null` ise, `BrandDetailPage` bileşeni ilgili markayı `BRAND_DETAILS` objesinden bulamaz ve bileşenin beklenen içeriği render edilemez.

**[Aksiyom 2]:** Eğer `BRAND_DETAILS` sabit objesi tanımlı değilse veya boş (`{}`) ise, `initialBrandSlug` değeri ne olursa olsun bileşen herhangi bir marka verisi gösteremez.

**[Aksiyom 3]:** Eğer `initialBrandSlug` değeri `BRAND_DETAILS` objesindeki herhangi bir anahtar (key) ile eşleşmiyorsa, bileşen geçerli bir marka bulamaz ve alternatif bir durum (örn: 404 / "marka bulunamadı") göstermesi beklenir.

**[Aksiyom 4]:** `BRAND_DETAILS` objesindeki her bir marka kaydının, `initialBrandSlug` ile eşleşebilen bir slug/anahtar alanına sahip olması gerekir; aksi takdirde bileşen veri eşleştirmesi yapamaz.

**[Aksiyom 5]:** Bileşen, sunucu tarafı render (SSR) ortamında çalıştırılacaksa, `initialBrandSlug` prop'unun SSR girişinde sağlanması zorunludur; aksi takdirde sunucu tarafı renderda boş veya hatalı içerik üretilir.

---

## FONKSİYON DETAYLARI

### BrandDetailPage

**Ne yapar**: Bu bileşen, belirli bir markanın detay sayfasını render eden üst düzey React görünüm bileşenidir. Verilen marka slug'ı kullanarak marka bilgilerini göstermek üzere tasarlanmıştır.

**Nasıl yapar**: `initialBrandSlug` prop'unu alarak başlangıç marka tanımlayıcısını işler. Bu değer sunucu tarafında render (SSR) veya başlangıç verisi olarak kullanılmak üzere bileşene iletilir. Bileşen, bu slug değerini kullanarak ilgili markanın detaylarını yükler ve sayfada görüntüler.

**Parametreler**:
- `initialBrandSlug`: `string` — Sayfa yüklendiğinde görüntülenecek markanın başlangıç slug değerini (URL dostu tanımlayıcı) taşır. Bu değer genellikle sunucu tarafı yönlendirmelerden veya URL parametrelerinden gelir.

**Dönüş**: `React.FC<BrandDetailPageProps>` — BrandDetailPageProps arabirimini implemente eden bir React fonksiyonel bileşeni döndürür. Bileşen, marka detay sayfasının tüm içeriğini render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/Seo::Seo
- import: ../components/navigation/Breadcrumb::Breadcrumb
- import: ../components/products/FamilyCard::FamilyCard
- import: ../data/brands::HVAC_BRANDS
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../hooks/useScrollAnimation::useScrollAnimation
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/services/family.service::getFamiliesEnriched
- import: ../types/ui-models::type { FamilyListItem }
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::ArrowRight
- import: lucide-react::ExternalLink
- import: lucide-react::Package
- import: next/image::Image
- import: next/link::Link
- import: next/navigation::useParams
- import: react::React
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### BrandDetailPageProps
- `initialBrandSlug?: string`

---

## SABİTLER
- **BRAND_DETAILS** (object) — `{
  vortice: {
    founded: 1954,
    headquarters: 'Tribiano, İtalya',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/BrandDetailPage.tsx::BrandDetailPage
- **params**: `({ initialBrandSlug })` — Sayfa yüklenirken dışarıdan gelen marka slug'ı
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, metin çevirileri için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen dil-önekli rota oluşturucu, sayfa linkleri için kullanılır
  - `params` — `useParams()` hook'undan gelen URL parametreleri nesnesi, dinamik route bilgilerini içerir
  - `slug` — `initialBrandSlug` veya `params?.slug`'dan elde edilen normalize edilmiş marka slug'ı
  - `heroIconRef` — Marka ikonu için scroll animasyonu referansı
  - `heroIconVisible` — Marka ikonu scroll animasyonu görünürlük durumu
  - `heroTitleRef` — Marka başlığı için scroll animasyonu referansı
  - `heroTitleVisible` — Marka başlığı scroll animasyonu görünürlük durumu
  - `heroMetaRef` — Marka meta bilgileri için scroll animasyonu referansı
  - `heroMetaVisible` — Marka meta bilgileri scroll animasyonu görünürlük durumu
  - `brand` — `HVAC_BRANDS` dizisinden slug ile eşleşen marka nesnesi
  - `detail` — `BRAND_DETAILS[brand.slug]` ile elde edilen marka detay bilgileri
  - `families` — `useState` ile tanımlı aile listesi state'i
  - `loading` — `useState` ile tanımlı yükleme durumu state'i
  - `breadcrumbItems` — Breadcrumb için etiket ve link listesi
- **Dönüş**: JSX — Marka detay sayfasının React bileşeni

### [N2_NASIL] AST Pointer: src/views/BrandDetailPage.tsx::useEffect(() => {...}, [brand])
- **params**: () — Parametre yok (useEffect callback)
- **ic_degiskenler**:
  - `loadFamilies` — Asenkron olarak marka ailelerini yükleyen fonksiyon
- **Dönüş**: yok — Yan etki olarak `families` ve `loading` state'lerini günceller

### [N3_NASIL] AST Pointer: src/views/BrandDetailPage.tsx::loadFamilies()
- **params**: () — Parametre yok
- **ic_degiskenler**:
  - `items` — `getFamiliesEnriched()` API çağrısından dönen aile listesi
- **Dönüş**: yok — `setFamilies(items)` ile state günceller

### [N4_NASIL] AST Pointer: src/views/BrandDetailPage.tsx::(stat, i) => (...)
- **params**: `(stat, i)` — `stat` istatistik nesnesi, `i` indeks numarası
- **ic_degiskenler**: (yok — sadece parametreler kullanılıyor)
- **Dönüş**: JSX — Tek bir istatistik satırı için React elementi

### [N5_NASIL] AST Pointer: src/views/BrandDetailPage.tsx::(family) => (...)
- **params**: `(family)` — Aile nesnesi (FamilyListItem tipinde)
- **ic_degiskenler**: (yok — sadece parametre kullanılıyor)
- **Dönüş**: JSX — FamilyCard bileşeni ile sarılmış React elementi

---

## NODE ID STANDARD

  file: src\views\BrandDetailPage.tsx
  function: src\views\BrandDetailPage.tsx::BrandDetailPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: BrandDetailPage
  export: BrandDetailPageProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `rounded-hvac-3xl`, `rounded-hvac-xl`, `shadow-glow-sm`, `tracking-hvac-loose`, `tracking-hvac-relaxed`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-brand-detail-radial`, `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `border-b`, `border-dashed`, `border-slate-100`, `border-slate-200`, `border-white/10`, `border-y`, `from-transparent`
- **Layout:** `absolute`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-2`, `gap-24`, `gap-3`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `h-1.5`, `h-32`
- **Varyant/Responsive:** `active:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `active:scale-95`, `animate-pulse`, `aspect-square`, `blur-3xl`, `border`, `brightness-50`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `hover:underline`, `inset-0`, `italic`, `leading-hvac-11`