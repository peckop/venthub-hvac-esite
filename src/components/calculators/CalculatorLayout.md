---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\calculators\CalculatorLayout.tsx
skeleton_hash: 951eb72957153f9e
entity_hashes:
  func:CalculatorLayout: 992031a52a171585
  overview: ce819e8c92e08794
  style_tokens: 8b0a8e4795cce63b
generated_at: 2026-08-27T08:26:27Z
---

## Genel Bakış
Bu modül, tüm HVAC hesaplayıcı sayfalarına ortak bir görünüm ve yapı kazandırmak için tasarlanmış bir layout şablonu bileşeni sunar. Tek bileşeni olan CalculatorLayout, başlık, açıklama, ikon ve geri dönüş linki gibi tekrarlanabilir UI öğelerini alarak sayfa düzenini standardize eder ve içeriği child bileşenler için bir konteynıra yerleştirir. Modül davranışsal mantık içermez; salt görsel yerleşim ve yapısal şablonlama sorumluluğuna sahiptir.

## Fonksiyon Grupları
### UI Şablonu ve Yerleşimi
Bu grup, hesaplayıcı sayfalarının üst başlık bölümünü ve içerik konteynırını oluşturan temel layout bileşenini barındırır. Bileşen, sayfa başlığı, açıklama, ikon ve breadcrumb navigasyonu gibi öğeleri bir araya getirerek tutarlı bir sayfa yapısı oluşturur.
- CalculatorLayout

## Bağımlılıklar ve Mimari Notlar
- Modül dış bağımlılıkları kaynak kodda açıkça belirtilmemiştir; bilinmiyor.
- Modül, tüketici bileşenler tarafından bir wrapper olarak kullanılır ve kendisi alt bileşen çağırmaz.
- Aksiyom 1: Modülün dışa açtığı prop yapısı bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- Aksiyom 2: Prop listesine bir öğe ekleme veya çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca fonksiyon imzasından görünen varsayımlar belirtilebilir.

[Aksiyom 1]: Eğer `backLink` parametresi çağrıda belirtilmezse, varsayılan olarak

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
  - `title` — sayfa başlığı, hem `<h1>` etiketinde hem de `<Seo>` bileşeninin `title` prop'unda kullanılır
  - `description` — sayfa açıklaması, `<Seo>` bileşeninin `description` prop'unda ve başlığın altında paragraf olarak gösterilir
  - `icon` — header alanında gösterilecek ikon bileşeni; verilmezse varsayılan olarak `<Calculator size={32} />` kullanılır
  - `backLink` — geri dönüş linki, varsayılan değeri `'/products'`; `<Link>` bileşeninin `href` prop'una `as import('next').Route` tip dönüşümüyle atanır
  - `backLabel` — geri dönüş linkinin etiketi; verilmezse `t('calculators.layout.backLabel')` çeviri anahtarıyla fallback yapılır (nullish coalescing `??` operatörü)
  - `infoText` — bilgi banner'ı metni; truthy ise `<Info>` ikonlu mavi bilgi kutusu render edilir
  - `warningText` — uyarı banner'ı metni; truthy ise `<AlertTriangle>` ikonlu turuncu uyarı kutusu render edilir
  - `children` — ana içerik alanı, `<div className="max-w-5xl ...">` içinde render edilir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; footer disclaimer, iletişim yönlendirmesi, iletişim linki ve backLabel fallback'inde kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rotalar objesi; footer'daki iletişim linkinin `href` değeri için `Routes.contact()` çağrısında kullanılır
- **Dönüş**: JSX elementi — `CalculatorLayoutProps` tipinde bir React fonksiyonel bileşen (`React.FC<CalculatorLayoutProps>`) döndürür. Bileşen; breadcrumb'lı header, opsiyonel info/warning banner'ları, children içerik alanı ve disclaimer/footer içeren tam sayfa düzeni render eder.

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