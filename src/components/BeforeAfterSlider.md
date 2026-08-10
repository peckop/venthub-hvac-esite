---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\BeforeAfterSlider.tsx
skeleton_hash: 7acc7874dafc0574
entity_hashes:
  func:BeforeAfterSlider: f6df4a2541ee7895
  overview: 0e8c7c405d8bc050
  style_tokens: ae3c52abb33abdfe
generated_at: 2026-06-19T20:47:06Z
---

## Genel Bakış
`BeforeAfterSlider`, iki görseli (önce ve sonra) yan yana konumlandırarak kullanıcıya etkileşimli bir kaydırıcı aracılığıyla görsel karşılaştırma imkânı sunan React bileşenidir. Kullanıcı kaydırıcıyı sürükleyerek her iki görüntünün görünür alanını dinamik olarak ayarlayabilir; bu sayede özellikle HVAC proje görsellerindeki dönüşümler (tadilat öncesi/sonrası vb.) interaktif biçimde sunulur.

## Fonksiyon Grupları
### Görsel Karşılaştırma ve Etkileşim
Bileşen, before/after kaynak görsellerini bir konteyner içinde yerleştirir, üst üste bindirerek bir tutamaç (handle) aracılığıyla kullanıcının sürüklemesine olanak tanır ve her harekette iki görüntünün görünür kısımlarını buna göre günceller.
- BeforeAfterSlider

---

## AXIOMS – Mimari Varsayımlar

Bu modül için sadece fonksiyon imzasından çıkarılabilecek minimal mimari varsayımlar tanımlanmıştır. Fonksiyon gövdesi verilmediğinden, çalıştırma davranışına ilişkin aksiyomlar belirlenememiştir.

[Aksiyom 1]: Eğer `beforeSrc` parametresi sağlanmazsa, bileşen hata ile karşılaşır veya beklenmeyen davranış gösterir (React bileşeni olarak zorunlu prop'tur, default değeri yoktur).

[Aksiyom 2]: Eğer `afterSrc` parametresi sağlanmazsa, bileşen hata ile karşılaşır veya beklenmeyen davranış gösterir (React bileşeni olarak zorunlu prop'tur, default değeri yoktur).

[Aksiyom 3]: Eğer `alt` parametresi sağlanmazsa, `alt` özelliği otomatik olarak `'before-after'` değerini alır.

---

## FONKSİYON DETAYLARI

### BeforeAfterSlider
**Ne yapar**: İki görseli (önce ve sonra) yan yana göstererek kullanıcıya sürükleyebileceği bir bölücüyle karşılaştırma imkanı sunar.  
**Nasıl yapar**: `beforeSrc` ve `afterSrc` ile sağlanan görselleri bir konteyner `<div>` içinde yerleştirir, üstte bir tutamaç (handle) ekleyerek kullanıcının sürükleyerek bir görselin diğerinin üzerindeki kısmını göstermesini sağlar; `alt` özelliği her iki görsele de erişilebilirlik metni olarak uygulanır.  
**Parametreler**:
- beforeSrc: string — Gösterilecek "önce" görselinin URL veya yerel yol.  
- afterSrc: string — Gösterilecek "sonra" görselinin URL veya yerel yol.  
- alt: string — Her iki görsele de varsayılan olarak 'before-after' olan erişilebilirlik açıklaması; kullanıcı tarafından özelleştirilebilir.  
**Dönüş**: React.FC<BeforeAfterSliderProps> türünde bir fonksiyon bileşeni; JSX elementi olarak render edilir ve bir önce/sonra karşılaştırma sliderı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: @/components/ui/VentImage::VentImage
- import: react::React
- import: react::useState

---

## INTERFACES

### BeforeAfterSliderProps
- `beforeSrc: string`
- `afterSrc: string`
- `alt?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BeforeAfterSlider.tsx::BeforeAfterSlider
- **params**: `beforeSrc`, `afterSrc`, `alt = 'before-after'`
- **ic_degiskenler**:
  - `pos` — Slider'ın mevcut yüzdelik konumunu tutan React state'i (useState(50)). Kullanıcı aralığı değiştirdiğinde güncellenir.
  - `t` — `useI18n` hook'undan dönen çeviri fonksiyonu. `beforeAfterSlider.title`, `beforeAfterSlider.subtitle`, `beforeAfterSlider.ariaLabel`, `beforeAfterSlider.rangeAriaLabel` anahtarlarıyla çevirileri getirir.
- **Dönüş**: JSX yapısı (React elementi). Bölüm (`section`) içinde, öncesi ve sonrası görsellerini yan yana veya üst üste gösteren, aralıklı kaydırıcı (`range input`) ile kontrol edilen bir bileşen render eder.

---

## NODE ID STANDARD

  file: src\components\BeforeAfterSlider.tsx
  function: src\components\BeforeAfterSlider.tsx::BeforeAfterSlider

---

## DISA AKTARILANLAR (EXPORTS)
  export: BeforeAfterSlider

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `accent-primary-navy`, `bg-white`, `border-light-gray`, `md:text-3xl`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-steel-gray`
- **Layout:** `absolute`, `bottom-3`, `h-56`, `h-full`, `left-1/2`, `lg:h-80`, `max-w-7xl`, `overflow-hidden`, `relative`, `sm:h-72`, `top-0`, `w-1`, `w-3/4`, `w-full`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-ml-0.5`, `-translate-x-1/2`, `border`, `font-bold`, `inset-0`, `lg:px-8`, `mb-4`, `mx-auto`, `object-center`, `object-cover`, `px-4`, `py-10`, `rounded-2xl`, `shadow`, `sm:px-6`