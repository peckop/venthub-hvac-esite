---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\CaseStudySection.tsx
skeleton_hash: 7631420c6a87f664
entity_hashes:
  func:CaseStudySection: 30e263b0ef69a0a4
  func:openLead: 3d89ba2774c36aa2
  overview: 5af9581c1e08259f
  style_tokens: de735ee559e96a8f
generated_at: 2026-06-19T20:47:06Z
---

## Genel Bakış
Bu modül, bir case study (örnek çalışma) bölümünü render eden bir React bileşeni ve bu bölümdeki kullanıcı etkileşimlerini yöneten bir yardımcı fonksiyondan oluşur. Bileşen, ilgili içeriği görüntülerken, kullanıcı bir eylem tetiklediğinde openLead fonksiyonunu çağırarak iş akışını devam ettirir.

## Fonksiyon Grupları
### Görüntüleme ve Yerleşim
Bileşenin ana görevi, case study içeriğini sayfada düzenli bir şekilde göstermek ve kullanıcıya sunmaktır.
- CaseStudySection

### Kullanıcı Etkileşimi
Kullanıcı tarafından başlatılan eylemleri yakalayıp gerekli işlemleri gerçekleştiren fonksiyondur; genellikle bir form açma veya yönlendirme gibi işlemleri içerir.
- openLead

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için React ortamı ve ilgili UI bağımlılıklarının mevcut olması gerekir.

[Aksiyom 1]: Eğer React kütüphanesi yüklü değilse, `CaseStudySection` bileşeni render edilerek hata fırlatır veya boş görüntülenir.  
[Aksiyom 2]: Eğer `CaseStudySection` içindeki case study verileri (örneğin bir context veya prop üzerinden) sağlanmazsa, bileşen boş liste veya hata mesajı gösterir.  
[Aksiyom 3]: Eğer `CaseStudySection` tarafından kullanılan CSS sınıfları veya stiller (module.css, styled-components vb.) bulunamazsa, bileşenin görsel tasarımı bozulur veya eksik görünür.  
[Aksiyom 4]: Eğer `openLead` fonksiyonu çağrıldığında lead modalı veya formunu açacak bir state yönetimi mekanizması (useState, Redux vb.) veya ilgili UI elementi mevcut değilse, fonksiyon hiçbir etkisi üretmez veya çalışma zamanında hata verir.  
[Aksiyom 5]: Eğer `openLead` fonksiyonu tarafından kullanılan dış bağımlılık (örneğin bir modal kütüphanesi veya `window.open` çağrısı) ortamda tanımlı değilse, fonksiyon beklenildiği gibi çalışmaz ve hata fırlatabilir.

---

## FONKSİYON DETAYLARI

### CaseStudySection
**Ne yapar**: Fonksiyonun amacı belgelenmemiştir.  
**Nasıl yapar**: İç mantığı belgelenmemiştir.  
**Parametreler**: Yok  
**Dönüş**: React.FC türünde bir fonksiyonel bileşen döndürür.

### openLead
**Ne yapar**: Fonksiyonun amacı belgelenmemiştir.  
**Nasıl yapar**: İç mantığı belgelenmemiştir.  
**Parametreler**: Yok  
**Dönüş**: Dönüş tipi void veya bilinmiyor; fonksiyon bir değer döndürmez.

---

## İTHALATLAR (IMPORTS)
- import: ../utils/analytics::trackEvent
- import: @/i18n/I18nProvider::useI18n
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/CaseStudySection.tsx::CaseStudySection
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `t` — localization function from `useI18n()`, used to translate UI strings.
  - `items` — array of case study objects; each object contains `title`, `summary`, and `metrics`.
  - `openLead` — inner function that triggers the lead modal when invoked.
- **Dönüş**: React.FC (JSX element representing the section)

### [N2_NASIL] AST Pointer: src/components/CaseStudySection.tsx::openLead
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/components/CaseStudySection.tsx::items.map callback
- **params**: cs
- **ic_degiskenler**: 
  - `cs` — case study object with fields `title` (string), `summary` (string), and `metrics` (array of metric objects).
- **Dönüş**: JSX element (a `<div>` rendering a case study card)

### [N4_NASIL] AST Pointer: src/components/CaseStudySection.tsx::cs.metrics.map callback
- **params**: m
- **ic_degiskenler**: 
  - `m` — metric object with `label` (string) and `value` (string) describing a quantitative result.
- **Dönüş**: JSX element (a `<span>` displaying the metric label and value)

---

## NODE ID STANDARD

  file: src\components\CaseStudySection.tsx
  function: src\components\CaseStudySection.tsx::CaseStudySection
  function: src\components\CaseStudySection.tsx::openLead

---

## DISA AKTARILANLAR (EXPORTS)
  export: CaseStudySection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-light-gray`, `from-gray-50`, `hover:bg-secondary-blue`, `md:text-4xl`, `text-3xl`, `text-center`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-white`, `text-xl`
- **Layout:** `flex`, `flex-wrap`, `from-gray-50`, `gap-2`, `gap-6`, `grid`, `grid-cols-1`, `hover:shadow-md`, `inline-flex`, `items-center`, `justify-center`, `max-w-7xl`, `md:grid-cols-2`, `p-6`, `shadow-sm`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-8`, `mr-1`, `mt-2`, `mt-4`, `mt-6`, `mx-auto`, `px-3`, `px-4`, `px-5`, `py-1`