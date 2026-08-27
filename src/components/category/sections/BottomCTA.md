---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\category\sections\BottomCTA.tsx
skeleton_hash: ee0ecdd618709b74
entity_hashes:
  func:BottomCTA: c122a8232d826ce8
  func:scrollToTop: 40a3c590b7862492
  overview: 4fe5c32b1ae48c03
  style_tokens: 0b28756a678eed77
generated_at: 2026-08-27T07:00:10Z
---

## Genel Bakış
Bu modül, kategori sayfalarının alt kısmında kullanıcıya belirli aksiyonlar (sihirbaz başlatma veya ürün listesi görüntüleme) sunan bir "Çağrı-Eylemi" (CTA) bileşeni ve sayfayı hızlıca en üste kaydıran bir yardımcı fonksiyon içerir. Bileşen, dışarıdan sağlanan geri çağırma fonksiyonları ve koşullu gösterim mantığıyla çalışır.

## Fonksiyon Grupları
### Kullanıcı Eylem Bileşeni
Kullanıcıya sayfa sonunda aksiyon seçenekleri sunan ve tıklama olaylarını dışarıdan sağlanan geri çağırma fonksiyonlarına ileten ana arayüz bileşenini tanımlar. Bileşen, `showWizard` prop'una bağlı olarak sihirbaz ile ilgili arayüz elemanlarını koşullu olarak gösterir.
- BottomCTA

### Sayfa İçi Navigasyon Yardımcısı
Sayfanın görünüm alanının en üstüne kaydırılmasını sağlayan temel bir yardımcı fonksiyonu içerir. Bu fonksiyon, kullanıcı deneyimini iyileştirmek için kullanılır.
- scrollToTop

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori sayfasının alt kısmında kullanıcıyı sihirbaz başlatmaya veya ürün listelemeye yönlendiren bir çağrı-eylemi bileşeni sunar ve sayfa üstüne dönme yardımcısı sağlar.

[Aksiyom 1]: Eğer `onOpenWizard` callback'i sağlanmazsa, sihirbaz başlatma eylemi tetiklenemez.

[Aksiyom 2]: Eğer `onShowProducts` callback'i sağlanmazsa, ürün listeleme eylemi tetiklenemez.

[Aksiyom 3]: Eğer `showWizard` parametresi `false` olarak geçilirse, sihirbaz ile ilgili UI öğesi gösterilmez. Varsayılan değeri `true` olduğundan parametre verilmediğinde sihirbaz öğesi görünür durumdadır.

[Aksiyom 4]: Eğer `scrollToTop` fonksiyonu çağrılmazsa, kullanıcı sayfanın en üstüne dönemez.

---

## FONKSİYON DETAYLARI

### BottomCTA
**Ne yapar**: Sayfa sonu CTA (Çağrı Eylemi) bölümünü renderlar ve kullanıcıya belirli aksiyonlar sunar: modelleri inceleme, bana uygun olanı bulma (wizard), uzman desteği alma ve sayfanın başına dönme.  
**Nasıl yapar**: Prop olarak alınan callback fonksiyonları (`onOpenWizard`, `onShowProducts`) ile butonların tıklama olaylarını bağlar; `showWizard` prop'una göre wizardı gösterip gizler; `categoryN` değerini gerekli yerlerde kullanarak içerik veya filtrelemeyi ayarlar.  
**Parametreler**:
- onOpenWizard: type not specified — Wizardı açmak için çağrılacak fonksiyon  
- onShowProducts: type not specified — Ürün listesini göstermek için çağrılacak fonksiyon  
- showWizard: boolean — Wizardın görünürlüğünü kontrol eder; varsayılan değer `true`  
- categoryN: type not specified — Bileşenin bağlamında kullanılan kategori tanımlayıcısı (örnek: kimlik veya isim)  
**Dönüş**: React.FC<BottomCTAProps> — Bileşenin props tipine uygun bir React fonksiyon bileşeni döner

### scrollToTop
**Ne yapar**: Sayfanın en üstüne kaydırma yapar.  
**Nasıl yapar**: Tarayıcının veya içeriğin kaydırma konumunu sıfırlayarak kullanıcıyı sayfa başına taşır; genellikle `window.scrollTo(0, 0)` veya benzeri bir yöntemle gerçekleştirilir.  
**Parametreler**: Yok  
**Dönüş**: void — Fonksiyon bir değer döndürmez (veya dönüş tipi belirtilmemiş)

---

## İTHALATLAR (IMPORTS)
- import: ../../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::ArrowUp
- import: lucide-react::MessageSquare
- import: lucide-react::Package
- import: lucide-react::ThermometerSun
- import: next/link::Link
- import: react::React

---

## INTERFACES

### BottomCTAProps
- `onOpenWizard?: () => void`
- `onShowProducts?: () => void`
- `showWizard?: boolean`
- `categoryName?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/BottomCTA.tsx::BottomCTA
- **params**:
  - `onOpenWizard` — sihirbazı açan callback fonksiyonu
  - `onShowProducts` — ürünleri gösteren callback fonksiyonu
  - `showWizard` — sihirbaz butonunun gösterilip gösterilmeyeceğini belirten boolean (varsayılan: `true`)
  - `categoryName` — kategori adı, çeviri metinlerinde kullanılır (varsayılan: `'Ürünler'`)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('category.bottomCta.nextStep')`, `t('category.bottomCta.helpText', { category: categoryName.toLowerCase() })`, `t('category.inspectModels')`, `t('category.bottomCta.viewAllProducts')`, `t('category.bottomCta.findFit')`, `t('category.bottomCta.findFitDesc')`, `t('category.bottomCta.expertSupport')`, `t('category.bottomCta.expertSupportDesc')`, `t('category.bottomCta.backToTop')` çağrılarıyla metinleri yerelleştirir
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; `Routes.contact('consulting')` ile iletişim/consulting sayfasının URL'ini üretir
  - `scrollToTop` — inner fonksiyon; `typeof window !== 'undefined'` kontrolü yaparak tarayıcı ortamında `window.scrollTo({ top: 0, behavior: 'smooth' })` çağırır, sayfayı yukarı kaydırır
  - `categoryName.toLowerCase()` — `categoryName` parametresinin küçük harfe çevrilmiş hali, `t('category.bottomCta.helpText', { category: ... })` çağrısında dinamik kategori adı olarak kullanılır
  - `showWizard` koşulu — grid sınıfını `grid-cols-1 md:grid-cols-3` veya `grid-cols-1 md:grid-cols-2` olarak belirler; ayrıca sihirbaz butonunun render edilip edilmeyeceğini kontrol eder
  - `onShowProducts` koşulu — "Modelleri İncele" butonunun render edilip edilmeyeceğini kontrol eder
  - `onOpenWizard` koşulu — sihirbaz butonunun render edilip edilmeyeceğini kontrol eder (`showWizard && onOpenWizard`)
- **Dönüş**: JSX (React.FC) — CTA kartları içeren `<section>` elementi; arka plan gradient deseni, başlık, açıklama metni, koşullu butonlar (ürünleri incele, sihirbaz, uzman desteği linki) ve sayfa başına dön butonu içerir

### [N2_NASIL] AST Pointer: src/components/category/sections/BottomCTA.tsx::scrollToTop
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `typeof window !== 'undefined'` — sunucu tarafı render'da `window` nesnesinin varlığını kontrol eden güvenlik kontrolü
  - `window.scrollTo({ top: 0, behavior: 'smooth' })` — tarayıcı penceresini sayfanın en üstüne `smooth` animasyonla kaydıran API çağrısı
- **Dönüş**: yok (void) — yan etki olarak sayfayı yukarı kaydırır

---

## NODE ID STANDARD

  file: src\components\category\sections\BottomCTA.tsx
  function: src\components\category\sections\BottomCTA.tsx::BottomCTA
  function: src\components\category\sections\BottomCTA.tsx::scrollToTop

---

## DISA AKTARILANLAR (EXPORTS)
  export: BottomCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-400`, `bg-emerald-500`, `bg-gradient-to-br`, `bg-secondary-blue`, `bg-white/10`, `bg-white/20`, `border-blue-400/30`, `border-white/20`, `from-primary-navy`, `from-secondary-blue`, `group-hover:bg-white/30`, `hover:bg-white/20`, `hover:border-white/40`, `hover:text-white`, `md:text-4xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-col`, `from-primary-navy`, `from-secondary-blue`, `gap-2`, `gap-4`, `grid`, `grid-cols-1`, `h-14`, `h-96`, `items-center`, `justify-center`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${showWizard`, `-translate-x-1/2`, `-translate-y-1/2`, `:`, `blur-3xl`, `border`, `focus-ring`, `font-bold`, `group`, `group-hover:-translate-y-1`, `group-hover:scale-110`, `hover:scale-105`, `inset-0`, `lg:px-8`, `mb-1`