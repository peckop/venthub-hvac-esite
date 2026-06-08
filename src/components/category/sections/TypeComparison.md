---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\TypeComparison.tsx
skeleton_hash: af1d682b269e3679
entity_hashes:
  func:TypeComparison: 4dc351c7c18b2642
  overview: 54025c31ff520977
  style_tokens: ef09d8c28bb43bb7
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, farklı ürün türlerini (örneğin elektrikli ve ortam havalı sistemleri) görsel olarak karşılaştırmak için kullanılan bir React bileşenidir. Kullanıcıya tercih ettiği türü seçme veya kararsız kaldığında daha fazla yardım almak için bir sihirbazı başlatma olanağı sunar.

## Fonksiyon Grupları
### Karşılaştırma ve Seçim Bileşeni
Kullanıcıya farklı türleri yan yana göstererek karşılaştırma yapmasını sağlar; seçim yapıldığında veya yardıma ihtiyaç duyulduğunda ilgili işlemleri tetikler.
- TypeComparison

---

## AXIOMS – Mimari Varsayımlar
Bu bileşen, `onOpenWizard` ve `onSelectType` prop'larının varlığına ve doğru kullanımına bağlıdır.

[Aksiyom 1]: Eğer `onOpenWizard` prop'u (bir fonksiyon) yoksa, bileşen "kararsız kalındığında sihirbazı aç" işlevini tetikleyemez ve bu durum kullanıcı deneyimini olumsuz etkiler.
[Aksiyom 2]: Eğer `onSelectType` prop'u (bir fonksiyon) yoksa, bileşen kullanıcı bir sistem türü seçtiğinde bu seçimi üst bileşene bildiremez ve seçim eylemi sonuçsuz kalır.
[Aksiyom 3]: Eğer `onOpenWizard` veya `onSelectType` prop'ları, bileşen içinden çağrıldıklarında beklenen formatta (örneğin, gerekli parametrelerle) çağrılmazlarsa, üst bileşende hatalara veya beklenmeyen davranışlara yol açar.

---

## FONKSİYON DETAYLARI

### TypeComparison
**Ne yapar**: Elektrikli sistemler ile ortam havalı sistemlerini yan yana göstererek kullanıcıların fayda, maliyet ve verimlilik açısından karşılaştırmasını sağlar; ayrıca karşılaştırma sonucunda hâlâ kararsız kalan kullanıcılar için bir sihirbaz (wizard) açarak daha detaylı yönlendirme yapar.  
**Nasıl yapar**: Bileşen, `onSelectType` fonksiyonunu kullanarak kullanıcının bir sistem türü seçtiğinde bu seçimi üst componente iletir; `onOpenWizard` fonksiyonu ise kullanıcı henüz bir karar veremediyse sihirbazı tetiklemek için çağrılır. Görsel karşılaştırma kartları, fayda tabloları ve bir “Wizard aç” butonu üzerinden bu akış gerçekleştirilir.  
**Parametreler**:
- onOpenWizard: kullanıcı henüz bir sistem türü seçmediğinde sihirbazı açmak için çağrılan callback fonksiyonu  
- onSelectType: kullanıcı bir sistem türü (elektrikli veya ortam havalı) seçtiğinde bu seçimi üst componente iletmek için kullanılan callback fonksiyonu  
**Dönüş**: `React.FC<TypeComparisonProps>` – bir React fonksiyon bileşeni olarak, JSX döndürerek karşılaştırma arayüzünü ve gerekli etkileşimleri render eder.

---

## INTERFACES

### TypeComparisonProps
- `onOpenWizard: () => void`
- `onSelectType: (type: 'elektrikli' | 'ortam') => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::TypeComparison
- **params**: (onOpenWizard, onSelectType) — onOpenWizard: wizard modal'ını açmak için callback fonksiyonu; onSelectType: seçilen tip ('elektrikli' veya 'ortam') ile çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu; i18n çevirileri için kullanılır (ör. `t('category.electricVsAmbientAlt')`)
  - `sectionRef` — useScrollAnimation hook'undan dönen ref nesnesi; section DOM elemanına bağlanarak scroll animasyonu takibi yapılır
  - `isVisible` — useScrollAnimation hook'undan dönen boolean; section'ın viewport'a girip girmediğini belirtir, animasyon sınıflarını aktif/pasif yapar
  - `hoveredType` — useState ile tutulan state; hangi tip kartının üzerine gelindiğini takip eder ('elektrikli', 'ortam' veya null)
  - `setHoveredType` — hoveredType state'ini güncelleyen setter fonksiyonu; mouseenter/mouseleave olaylarında çağrılır
  - `types` — iki elemanlı dizi; her bir hava perdesi tipinin (elektrikli ve ortam) tanım bilgilerini (id, title, subtitle, icon, color, colorClasses, benefits, bestFor, notFor) içerir
- **Dönüş**: JSX — Section bileşenini render eder; başlık, karşılaştırma görseli (VentImage), iki karşılaştırma kartı ve kararsız kullanıcılar için wizard CTA bölümü

### [N2_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::(type) => ...
- **params**: (type) — types dizisinin bir elemanı; id, title, subtitle, icon, color, colorClasses, benefits, bestFor, notFor alanlarını içerir
- **ic_degiskenler**:
  - `Icon` — type.icon değerinden alınan icon bileşeni (Zap veya Wind); kartın header kısmında görsel olarak kullanılır
  - `isHovered` — boolean; hover durumunu kontrol eder (`hoveredType === type.id`); kartın hover durumuna göre CSS sınıflarını belirler
- **Dönüş**: JSX — Tek bir karşılaştırma kartını render eder; header (icon + title + subtitle), benefits listesi, bestFor etiketleri, notFor etiketleri ve tip seçme butonu (CTA)

### [N3_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::(benefit, i) => ...
- **params**: (benefit, i) — benefit: benefits dizisinin bir elemanı (string); i: elemanın indeks numarası
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — Tek bir avantaj maddesini render eder; Check ikonu ve benefit metni

### [N4_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::(item, i) => ... [bestFor]
- **params**: (item, i) — item: bestFor dizisinin bir elemanı (string); i: elemanın indeks numarası
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — Tek bir "en uygun" etiketini render eder; type'a özgü renk sınıfları ile stillendirilmiş span elemanı

### [N5_NASIL] AST Pointer: src/components/category/sections/TypeComparison.tsx::(item, i) => ... [notFor]
- **params**: (item, i) — item: notFor dizisinin bir elemanı (string); i: elemanın indeks numarası
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — Tek bir "tercih edilmez" etiketini render eder; X ikonu ve item metni ile gri tonlarında span elemanı

---

## NODE ID STANDARD

  file: src\components\category\sections\TypeComparison.tsx
  function: src\components\category\sections\TypeComparison.tsx::TypeComparison

---

## DISA AKTARILANLAR (EXPORTS)
  export: TypeComparison

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-gray-100`, `bg-purple-600`, `border-2`, `border-purple-100`, `from-purple-50`, `from-white`, `hover:bg-purple-700`, `md:text-4xl`, `sm:text-3xl`, `sm:text-lg`, `text-2xl`, `text-base`, `text-center`
- **Layout:** `flex`, `flex-shrink-0`, `flex-wrap`, `from-purple-50`, `from-white`, `gap-2`, `gap-4`, `gap-6`, `grid`, `inline`, `inline-flex`, `items-center`, `items-start`, `justify-center`, `max-w-2xl`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isHovered`, `${scrollAnimationClasses.fadeUp(isVisible`, `${scrollAnimationClasses.scaleIn(isVisible`, `${type.colorClasses.bg`, `${type.colorClasses.button`, `${type.colorClasses.text`, `aspect-video`, `border`, `duration-300`, `focus-ring`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-2`