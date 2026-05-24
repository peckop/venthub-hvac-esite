---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\CalculatorLayout.tsx
skeleton_hash: 0b512e351d9a2af9
generated_at: 2026-05-23T21:56:07Z
---

## Genel Bakış
`CalculatorLayout` bileşeni, HVAC hesaplayıcı sayfalarının ortak görünümünü ve davranışını tanımlayan bir şablondur. Başlık, açıklama, ikon ve geri dönüş linki gibi temel UI öğelerini alarak, içerik alanını çocuk bileşenlere bırakır ve sayfa tutarlılığını sağlayarak tekrarlanabilir bir düzen sunar.

## Fonksiyon Grupları
### UI Şablonu ve Yerleşimi
Bu grup, sayfanın üst kısmındaki başlık, açıklama, ikon ve geri‑link gibi öğeleri oluşturur ve içerik bölgesi için bir konteyner sağlar.  
- CalculatorLayout

---

## AXIOMS – Mimari Varsayımlar
Eğer `title` prop'u verilmezse, bileşenin başlık bölümü boş veya tanımsız olur.  
Eğer `description` prop'u verilmezse, bileşenin açıklama bölümü boş veya tanımsız olur.  
Eğer `icon` prop'u verilmezse, bileşenin ikon bölümü boş veya tanımsız olur.  
Eğer `backLink` prop'u verilmezse, varsayılan değer `'/products'` kullanılır.  
*(`bac` parametresi fonksiyon imzasında net olmayan bir değer olduğu için bu parametreye dair varsayım üretilemez.)*

---

## FONKSIYON DETAYLARI

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
- **params**: title, description, icon, backLink, backLabel, infoText, warningText, children
- **ic_degiskenler**:
  - `title` — sayfa başlığı, SEO bileşeni ve h1 başlığında kullanılır
  - `description` — sayfa açıklaması, SEO bileşeni ve h1 altında gösterilir
  - `icon` — sol üstte gösterilecek ikon; prop verilmezse varsayılan `<Calculator />` ikonu kullanılır
  - `backLink` — geri link hedefi; varsayılan '/props' yerine '/products'; `<Link href={...}>` özelliğine atanır (type cast ile `import('next').Route` olarak kullanılır)
  - `backLabel` — geri link metni; varsayılan 'Ürünlere Dön'; `<Link>` içeriğinde görüntülenir
  - `infoText` — bilgilendirme banner metni; tanımlıysa mavi arkaplanlı bilgi kutusunda `<Info>` ikonu ve birlikte gösterilir
  - `warningText` — uyarı banner metni; tanımlıysa turuncu arkaplanlı uyarı kutusunda `<AlertTriangle>` ikonu ve birlikte gösterilir
  - `children` — bileşenin ana içeriği; `<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">` içinde render edilir
- **Dönüş**: React.FC<CalculatorLayoutProps> (React fonksiyonel bileşeni, JSX döndürür)

---

## NODE ID STANDARD

  file: src\components\calculators\CalculatorLayout.tsx
  function: src\components\calculators\CalculatorLayout.tsx::CalculatorLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: CalculatorLayout