---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\calculators\CalculatorLayout.tsx
skeleton_hash: 4e57c9bdde5e6398
entity_hashes:
  func:CalculatorLayout: 992031a52a171585
  overview: ce819e8c92e08794
  style_tokens: 8b0a8e4795cce63b
generated_at: 2026-08-27T13:20:00Z
---

## Genel Bakış
Bu modül, HVAC hesaplayıcı sayfaları için ortak bir layout şablonu sağlar. Tek bileşeni olan CalculatorLayout, sayfa başlığı, açıklama, ikon ve geri dönüş linki gibi özellikleri alarak sayfa düzenini standardize eder. Modül, davranışsal mantık içermez ve dışa açtığı yapı bir sözleşme niteliğindedir.

## Fonksiyon Grupları
### UI Şablonu ve Yerleşimi
Bu grup, hesaplayıcı sayfalarının üst başlık bölümünü ve içerik konteynırını oluşturan temel layout bileşenini barındırır.
- CalculatorLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, gövdeden türetilen mimari aksiyom üretilememektedir.

---

## FONKSİYON DETAYLARI

### CalculatorLayout
**Ne yapar**: Ortak hesap makinesi layout wrapper componentudur; premium görünüm, SEO ve breadcrumb sağlar.  
**Nasıl yapar**: Prop olarak alınan `title`, `description`, `icon`, `backLink` ve `bac` (olası children) değerlerini kullanarak içeriği sarmalar, gerekli meta etiketlerini ve navigasyon öğelerini ekleyerek tutarlı bir sayfa yapısı oluşturur.  

**Parametreler**:
- title: type not specified — Sayfa başlığı  
- description: type not specified — Sayfa açıklaması (SEO için)  
- icon: type not specified — Başlıkta gösterilecek simge  
- backLink: type not specified — Geri dönüş linki, varsayılan değer `'/products'`  
- bac: type not specified — Muhtemelen `children` prop'u, içeriği taşır  

**Dönüş**: `React.FC<CalculatorLayoutProps>` — Bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../Seo::Seo
- import: lucide-react::AlertTriangle
- import: lucide-react::ArrowLeft
- import: lucide-react::Calculator
- import: lucide-react::Info
- import: next/link::Link
- import: react::React

---

## INTERFACES

### CalculatorLayoutProps
- `title: string`
- `description: string`
- `icon?: React.ReactNode`
- `backLink?: string`
- `backLabel?: string`
- `infoText?: string`
- `warningText?: string`
- `children: React.ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/calculators/CalculatorLayout.tsx::CalculatorLayout
- **params**:
  - `title` — sayfa başlığı, hem görünümde hem SEO meta etiketinde kullanılır
  - `description` — açıklama metni, hem görünümde hem SEO meta etiketinde kullanılır
  - `icon` — opsiyonel ikon bileşeni; verilmezse varsayılan `Calculator` ikonu gösterilir
  - `backLink` — geri dönüş bağlantısı URL'i; varsayılan değeri `'/products'`
  - `backLabel` — geri dönüş bağlantısı etiketi; verilmezse `t('calculators.layout.backLabel')` çeviri anahtarından alınır
  - `infoText` — bilgi banner metni; varsa `Info` ikonuyla birlikte gösterilir
  - `warningText` — uyarı banner metni; varsa `AlertTriangle` ikonuyla birlikte gösterilir
  - `children` — ana içerik alanı, layout'un ortasına yerleştirilir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; footer metinleri ve varsayılan etiketler için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen lokalize rota nesnesi; footer'daki iletişim bağlantısı için `Routes.contact()` çağrılır
- **Dönüş**: JSX — tam sayfa calculator layout'u; `Seo` bileşeni, breadcrumb navigasyonlu header (başlık + açıklama + ikon), opsiyonel info/warning banner'ları, `children` ana içerik alanı ve disclaimer/iletişim footer'ı içerir

---

## NODE ID STANDARD

  file: src\components\calculators\CalculatorLayout.tsx
  function: src\components\calculators\CalculatorLayout.tsx::CalculatorLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: CalculatorLayout

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-primary-navy`, `bg-secondary-blue/10`, `bg-warning-orange/10`, `bg-white/10`, `border-light-gray`, `border-secondary-blue/20`, `border-t`, `border-warning-orange/20`, `from-light-gray`, `hover:text-white`, `md:text-3xl`, `text-2xl`, `text-center`, `text-industrial-gray`
- **Layout:** `flex`, `flex-shrink-0`, `from-light-gray`, `gap-2`, `gap-3`, `gap-4`, `inline-flex`, `items-center`, `items-start`, `max-w-5xl`, `min-h-screen`, `p-3`, `p-4`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `hover:underline`, `lg:px-8`, `mb-4`, `mt-0.5`, `mt-1`, `mt-6`, `mx-auto`, `pb-12`, `pt-6`, `px-4`, `py-8`, `rounded-xl`, `sm:px-6`