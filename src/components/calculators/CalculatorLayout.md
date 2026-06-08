---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\CalculatorLayout.tsx
skeleton_hash: 52ce63f0ee907c88
entity_hashes:
  func:CalculatorLayout: 992031a52a171585
  overview: 03346310f255f2df
  style_tokens: 8b0a8e4795cce63b
generated_at: 2026-06-08T10:08:47Z
---

## Genel Bakış
`CalculatorLayout` bileşeni, HVAC hesaplayıcı sayfalarının ortak görünümünü ve davranışını tanımlayan bir şablon/sarmalayıcıdır. Başlık, açıklama, ikon ve geri dönüş linki gibi temel UI öğelerini alarak, içerik alanını çocuk bileşenlere bırakır ve sayfa tutarlılığını sağlayarak tekrarlanabilir bir düzen sunar.

## Fonksiyon Grupları
### UI Şablonu ve Yerleşimi
Sayfanın üst kısmındaki başlık, açıklama, ikon ve geri‑link gibi öğeleri oluşturur ve içerik bölgesi için bir konteyner sağlayarak tutarlı bir sayfa yapısı sunar.
- CalculatorLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir layout şablonu olarak çocuk bileşenleri sarmalayan bir wrapper bileşenidir.

[Aksiyom 1]: Eğer `title` prop'u verilmezse, sayfa başlık alanı boş/tanımsız render edilir — bileşen alternatif bir başlık sunmaz.

[Aksiyom 2]: Eğer `description` prop'u verilmezse, açıklama alanı render edilmez veya boş kalır — bileşen varsayılan bir açıklama metni üretmez.

[Aksiyom 3]: Eğer `icon` prop'u verilmezse, ikon alanı gösterilmez veya boş kalır — bileşen otomatik bir ikon atamaz.

[Aksiyom 4]: Eğer `backLink` prop'u verilmezse, geri dönüş linki varsayılan olarak `/products` yolunu hedefler.

[Aksiyom 5]: Fonksiyon imzası sonunda `bac` olarak kesik/tanımsız bir parametre bulunmaktadır — bu durum ya imza hatalıdır ya da eksik bilgi mevcuttur, dolayısıyla bu parametrenin davranışı bilinmiyor.

[Aksiyom 6]: Bu bir layout bileşeni olduğundan,孩子(children) prop'u beklenir — eğer children verilmezse içerik alanı boş render edilir.

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
- **params**: `title` — sayfanın başlık metni, `<h1>` içinde ve `<Seo>` title'ında kullanılır; `description` — sayfa açıklama metni, alt başlık ve SEO meta description olarak kullanılır; `icon` — header'daki ikon bileşeni, `<Calculator>` fallback'i ile birlikte render edilir; `backLink` — geri dönüş linkinin href değeri, `<Link>` href prop'una bağlanır, varsayılan `'/products'`; `backLabel` — geri dönüş bağlantısının görünen metni, `<Link>` içeriğinde render edilir, varsayılan `'Ürünlere Dön'`; `infoText` — bilgi banner'ı metni, varsa `<Info>` ikonlu mavi banner'da gösterilir; `warningText` — uyarı banner'ı metni, varsa `<AlertTriangle>` ikonlu turuncu banner'da gösterilir; `children` — ana içerik area'sının içeriği, hesaplayıcı formu/bileşenleri burada render edilir
- **ic_degiskenler**: (fonksiyon gövdesinde harici değişken tanımlanmamıştır, tüm props doğrudan JSX içinde kullanılmıştır)
- **Dönüş**: JSX elemanı — sayfa düzeni (layout) bileşeni; başlık banner'ı, info/warning banner'ları, ana içerik alanı (`children`) ve alt not bölgesinden oluşan tam sayfa düzenini döndürür

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