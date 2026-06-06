---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx
skeleton_hash: e9428ec466777b04
entity_hashes:
  func:BrandsPage: 7fe8abffb7e6dbf9
  overview: f92b067f7968b22a
  style_tokens: 583cff7322941abd
generated_at: 2026-06-06T21:58:26Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformundaki tüm markaları listeleyen ve kullanıcıya sunan tek bir React sayfası bileşenini içermektedir. Temel bir gezinme noktası olarak işlev görerek, markaları görsel ve interaktif bir arayüzle sergiler. Bileşen, i18n, erişilebilirlik ve performans optimizasyonları ile donatılmıştır.

## Fonksiyon Grupları
### Marka Sayfası Görünümü
Modülün tek ve temel sorumluluğu, ana sayfa bileşenini oluşturarak markaların listelendiği arayüzü sunmaktır.
- BrandsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir React sayfa bileşeni olup, doğru çalışması için belirli harici bağımlılıklara ve veri koşullarına ihtiyaç duyar.

[Aksiyom 1]: Eğer React uygulama ortamı (DOM ve React kütüphanesi) yoksa, bileşen render edilemez olur.
[Aksiyom 2]: Eğer yönlendirme (routing) altyapısı (React Router veya benzeri) yapılandırılmamışsa, bu bileşen harici bir rotaya (örn: `/brands`) atanamaz ve URL üzerinden erişilemez olur.
[Aksiyom 3]: Eğer marka verilerini sağlayan bir veri kaynağı (API, statik veri, vb.) veya bu verileri işleyen bir üst bileşen/context (örn: `BrandsProvider`) mevcut değilse, bileşen içinde marka listesi görüntülenemez olur.
[Aksiyom 4]: Eğer bileşenin bağımlı olduğu ortak UI bileşenleri (örn: `Card`, `Layout`, `LoadingSpinner`) veya stil tanımları (CSS/SCSS) içe aktarılmamışsa, arayüz bozuk veya eksik render olur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::BrandsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan alınan çeviri fonksiyonu, sayfa içindeki tüm metinleri çevirir
  - `brands` — HVAC_BRANDS sabitinin referansı, marka listesini tutar
  - `heroBadgeRef` — useScrollAnimation hookundan dönen ref, hero badge bölümü için scroll animasyonu reference'ı
  - `heroBadgeVisible` — useScrollAnimation hookundan dönen boolean, hero badge bölümünün görünür olup olmadığını tutar
  - `brandsGridRef` — useScrollAnimation hookundan dönen ref, markalar grid bölümü için scroll animasyonu reference'ı
  - `brandsGridVisible` — useScrollAnimation hookundan dönen boolean, markalar grid bölümünün görünür olup olmadığını tutar
- **Dönüş**: JSX elementi (React.FC) - tüm sayfa yapısını içeren React componenti

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::splitMapCallback
- **params**: (word, i) — split() ile bölünmüş her kelime ve index
- **ic_degiskenler**:
  - `word` — t('brands.eyebrow') metninin split() ile bölünmüş her bir kelimesi
  - `i` — kelimenin index numarası, 2. kelimeyi special styling için kontrol eder
- **Dönüş**: React.Fragment elementi, kelimeyi conditional olarak stillendirir

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\BrandsPage.tsx::brandsMapCallback
- **params**: (brand, index) — brands.map() içindeki her marka objesi ve index
- **ic_degiskenler**:
  - `brand` — brands array'inden gelen tek bir marka objesi (slug, name, country, specialty, description properties)
  - `index` — markanın index numarası, staggerChild animasyonu için kullanılır
- **Dönüş**: JSX div elementi - marka kartını oluşturan React componenti

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