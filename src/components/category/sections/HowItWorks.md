---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\HowItWorks.tsx
skeleton_hash: 2c3b664bd6729ee2
entity_hashes:
  func:HowItWorks: 796882dbc75a0b9a
  overview: 543fb3742a61781d
  style_tokens: 86e780eada6c1862
generated_at: 2026-06-14T21:00:10Z
---

## Genel Bakış
Bu modül, bir hava perdesi ürününün çalışma prensibini interaktif ve adım adım anlatan bir React bileşenini tanımlar. Modül, “Nasıl Çalışır” adlı bölümün tüm görsel ve işlevsel yapısını, adım bazlı animasyonlu içerik gösterimiyle birlikte oluşturur.

## Fonksiyon Grupları
### Bileşen Yapılandırması ve State Yönetimi
Temel bileşenin yapısını, bağımlılıklarını ve iç durumunu (örneğin aktif adım, görünürlük) yöneten merkezi işlev grubudur.
- HowItWorks, sectionRef, isVisible, activeStep, setActiveStep

### Adım Bazlı İçerik Sunumu
Ürünün çalışma adımlarını (ikon, başlık, açıklama) bir dizi yapısında tutarak, kullanıcının etkileşimine göre açılıp kapanan dinamik arayüz oluşturur.
- steps, activeStep, setActiveStep

### Animasyon ve Etkileşim Tetikleme
Bölümün görünür olmasını izleyerek kaydırma animasyonlarını tetikler ve kullanıcı arayüzündeki geçişleri kontrol eder.
- sectionRef, isVisible, activeStep

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon imzası `HowItWorks()` olarak tanımlanmış olup parametre almamaktadır. Modül sabitleri de bulunmamaktadır. Bu nedenle, fonksiyon gövdesinden türetilebilecek herhangi bir mimari koşul (bağımlılık, girdi-çıktı zorunluluğu, eşik değeri vb.) belirlenememiştir.

---

## FONKSİYON DETAYLARI

### HowItWorks
**Ne yapar**: İnteraktif bir “Nasıl Çalışır” bölümü oluşturarak hava perdesinin çalışma prensibini görselleştirir.  
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır; içeriğinde görseller, açıklama metinleri ve gerekli durum yönetimi (state) kullanılarak kullanıcı etkileşimine yanıt veren animasyon veya açıklama kartları render edilir.  
**Parametreler**: Yok  
**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen; JSX döndürerek “Nasıl Çalışır” bölümünün tamamını render eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../../../hooks/useScrollAnimation::useScrollAnimation
- import: @/components/ui/VentImage::VentImage
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::ArrowDown
- import: lucide-react::ChevronDown
- import: lucide-react::ChevronUp
- import: lucide-react::Shield
- import: lucide-react::Thermometer
- import: lucide-react::Wind
- import: react::React
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/category/sections/HowItWorks.tsx::anonymous_component
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `dict` — `useI18n()` hook'undan dönen sözlük nesnesi; çeviri metinlerine erişim sağlar
  - `sectionRef` — `useScrollAnimation<HTMLElement>()` hook'undan dönen ref; section DOM elementine bağlanarak scroll animasyonu tetiklenmesini sağlar
  - `isVisible` — `useScrollAnimation<HTMLElement>()` hook'undan dönen boolean; section'ın viewport'a girip girmediğini belirler
  - `activeStep` — `useState(0)` ile oluşturulan state; şu an hangi adımın açık (aktif) olduğunu tutar (0-3 arası index veya -1 = hepsi kapalı)
  - `setActiveStep` — `useState` setter fonksiyonu; tıklanan adımın index'ini veya -1 değerini alarak activeStep state'ini günceller
  - `stepIcons` — `[Wind, ArrowDown, Shield, Thermometer]` sabit dizisi; her adım için lucide-react icon bileşeni referansı tutar
  - `stepsData` — `dict.category.howItWorksAirCurtain.steps` erişimi; sözlükten gelen adım verileri (title, description, detail) dizisi
  - `steps` — `stepIcons.map()` ile oluşturulan nesne dizisi; her eleman `{ icon, title, description, detail }` yapısındadır
  - `titleVal` — `dict.category.howItWorksAirCurtain.title` erişimi; bölüm başlık metni (h2 içinde render edilir)
  - `subtitleVal` — `dict.category.howItWorksAirCurtain.subtitle` erişimi; bölüm alt başlık/description metni
  - `diagramAltVal` — `dict.category.howItWorksAirCurtain.diagramAlt` erişimi; VentImage bileşeninin alt metin değeri
- **Dönüş**: JSX element (React.FC) — `<section>` wrapper içinde header, teknik diyagram görseli (VentImage) ve adım butonları (steps.map) içeren tam sayfa bölümü

---

## NODE ID STANDARD

  file: src\components\category\sections\HowItWorks.tsx
  function: src\components\category\sections\HowItWorks.tsx::HowItWorks

---

## DISA AKTARILANLAR (EXPORTS)
  export: HowItWorks

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-blue-500`, `bg-gray-100`, `bg-white`, `border-2`, `border-blue-500`, `border-gray-200`, `hover:border-blue-300`, `md:text-4xl`, `sm:text-3xl`, `sm:text-lg`, `text-2xl`, `text-base`, `text-blue-600`, `text-blue-700`
- **Layout:** `flex`, `flex-1`, `gap-4`, `gap-8`, `grid`, `h-auto`, `items-center`, `items-start`, `justify-between`, `lg:gap-12`, `lg:grid-cols-2`, `max-h-0`, `max-h-24`, `max-w-2xl`, `max-w-7xl`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isActive`, `${scrollAnimationClasses.fadeUp(isVisible`, `${scrollAnimationClasses.scaleIn(isVisible`, `:`, `animate-fade-in`, `cursor-pointer`, `duration-300`, `ease-in-out`, `focus-ring`, `font-bold`, `lg:px-8`, `mb-4`, `mb-8`, `mt-0`, `mt-1`