---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\CalculatorLayout.tsx
skeleton_hash: bd03e80c5b75e201
entity_hashes:
  func:CalculatorLayout: 992031a52a171585
  overview: 1653d259eecd0578
  style_tokens: 8b0a8e4795cce63b
generated_at: 2026-06-14T19:43:54Z
---

## Genel Bakış
Bu modül, tüm HVAC hesaplayıcı sayfalarına ortak bir görünüm ve yapı kazandırmak için tasarlanmış bir layout (yerleşim) şablonudur. Tek bileşeni olan CalculatorLayout, başlık, açıklama ve ikon gibi tekrarlanabilir UI öğelerini alarak sayfa düzenini standardize eder ve içeriği child bileşenlere yer açar. Varsayılan değerler ve aksiyomlarla, bileşenin farklı durumlarda nasıl davranacağı belirlenmiştir.

## Fonksiyon Grupları
### UI Şablonu ve Yerleşimi
Bu grup, hesaplayıcı sayfalarının üst başlık bölümünü ve içerik konteynırını oluşturan temel layout bileşenini barındırır.
- CalculatorLayout

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/routes::Routes
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
- **params**: (`title`, `description`, `icon`, `backLink = '/products'`, `backLabel`, `infoText`, `warningText`, `children`)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, metinleri çoklu dilde göstermek için kullanılır
- **Dönüş**: JSX Elemanı (Sayfa düzenini oluşturan React bileşeni)

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