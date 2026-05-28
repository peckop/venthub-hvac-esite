---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx
skeleton_hash: 43e21e1befc50fa8
entity_hashes:
  func:BrandsPage: 7fe8abffb7e6dbf9
  overview: c25537bcc3b6bee2
  style_tokens: 583cff7322941abd
generated_at: 2026-05-28T22:39:40Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesindeki markaları listeleyen tek sayfa bileşenini içermektedir. Kullanıcılara platformda bulunan tüm HVAC markalarını sunan bu görünüm, temel bir gezinme rotası olarak işlev görür. Bileşenin doğru çalışması için yönlendirme, veri sağlama ve ortak UI altyapısına bağımlıdır.

## Fonksiyon Grupları
### Marka Listesi Görünümü
Modülün tek ve temel sorumluluğu, tüm markaların listelendiği ana sayfa bileşenini oluşturmaktır.
- BrandsPage

---



---

## FONKSİYON DETAYLARI

### BrandsPage
**Ne yapar**: BrandsPage, uygulamanın premium seviyede tasarlanmış "Markalar" sayfasını render eden bir React bileşenidir. Bu sayfa, kullanıcıya markaları görsel ve interaktif bir biçimde sunar. Bileşen, modern web standartlarına uygun olarak uluslararasılaştırma (i18n), erişilebilirlik (A11y) ve performans optimizasyonları ile donatılmıştır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni (FC) olarak tanımlanmıştır. Bileşen, marka verilerini ve sayfa düzenini oluşturarak JSX olarak döndürür. Dahili mantığı, i18n modülleri ile çoklu dil desteği, A11y standartları ile ekran okuyucu ve klavye navigasyonu uyumluluğu ve performans optimizasyon techniques ile hızlı yükleme ve akıcı kullanıcı deneyimi sağlamak üzere yapılandırılmıştır.

**Parametreler**:
- Fonksiyona ait açıkça belirtilmiş herhangi bir parametre yoktur. Bileşen, props almayan veya varsayılan değerlerle çalışan bağımsız bir sayfa yapısıdır.

**Dönüş**: `React.FC` — Bileşen, React'ın Functional Component tipinde bir JSX yapısı döndürür. Bu yapı, Markalar sayfasının tamamını temsil eden kullanıcı arayüzünü içerir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/BrandsPage.tsx`::BrandsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, sayfadaki tüm metinlerin çevirisini sağlamak için kullanılır (örn. `t('brands.pageTitle')`, `t('brands.seoDesc')`, `t('brands.sectionTitle')`, `t('brands.eyebrow')`, `t('brands.pageSubtitle')`, `t('brands.aboutBrand')`, `t('brands.exploreBrand')`, `t('brands.trust.eyebrow')`, `t('brands.trust.title')`, `t('brands.trust.description')`, `t('brands.trust.original')`, `t('brands.trust.standard')`)
  - `brands` — `HVAC_BRANDS` sabitinin bir kopyası, tüm HVAC markalarının dizisi; `.map()` ile dönülerek her marka kartı oluşturulur
  - `heroBadgeRef` — `useScrollAnimation<HTMLDivElement>` hook'undan dönen React ref, hero bölümü rozetinin DOM referansını tutar, `{ threshold: 0.2 }` ile scroll tetikleme eşiği ayarlanmıştır
  - `heroBadgeVisible` — `useScrollAnimation` hook'undan dönen boolean, hero rozetinin scroll animasyonunun tetiklenip tetiklenmediğini belirtir; `scrollAnimationClasses.fadeUp(heroBadgeVisible)` içinde CSS sınıfı olarak kullanılır
  - `brandsGridRef` — `useScrollAnimation<HTMLDivElement>` hook'undan dönen React ref, markalar gridinin DOM referansını tutar, `{ threshold: 0.05 }` ile scroll tetikleme eşiği ayarlanmıştır
  - `brandsGridVisible` — `useScrollAnimation` hook'undan dönen boolean, marka gridinin scroll animasyonunun tetiklenip tetiklenmediğini belirtir; `scrollAnimationClasses.fadeUp(brandsGridVisible)` ve `scrollAnimationClasses.staggerChild(index)` içinde kullanılır
- **Dönüş**: JSX — sayfa genelinde 4 ana section'dan oluşan React bileşeni: Seo bileşeni, Hero bölümü, Brands Grid bölümü (marka kartları ile), Trust & Network bölümü

### [N2_NASIL] AST Pointer: `src/views/BrandsPage.tsx`::(word, i)
- **params**: `(word, i)`
  - `word` — `t('brands.eyebrow').split(' ')` dizisinden gelen tek bir kelime string'i
  - `i` — kelimenin dizi içindeki indeksi
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: `React.Fragment` — `i === 2` ise kelime `<span className="font-medium text-slate-950 italic">` ile sarılır; diğer kelimeler olduğu gibi döner (sonuna boşluk eklenerek)

### [N3_NASIL] AST Pointer: `src/views/BrandsPage.tsx`::(brand, index)
- **params**: `(brand, index)`
  - `brand` — `HVAC_BRANDS` dizisindeki tek bir marka nesnesi; erişilen özellikleri: `brand.slug` (URL slug'ı, link href ve key için), `brand.name` (marka adı, BrandIcon prop'u ve aria-label için), `brand.country` (ülke bilgisi), `brand.specialty` (uzmanlık alanı), `brand.description` (açıklama metni)
  - `index` — markanın dizi içindeki indeksi, `scrollAnimationClasses.staggerChild(index)` ile kademeli animasyon gecikmesi hesaplanır
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: JSX `<div>` — `key={brand.slug}`, animasyon class'ları ile sarılmış bir `<Link>` kartı; içinde `BrandIcon` (logo), marka adı, ülke, uzmanlık alanı, açıklama ve keşfetme oku bulunur; `Routes.brand(brand.slug)` href'ine bağlanır

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