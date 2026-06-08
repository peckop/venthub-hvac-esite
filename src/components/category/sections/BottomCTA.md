---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\BottomCTA.tsx
skeleton_hash: 32687a28e8d73f76
entity_hashes:
  func:BottomCTA: c122a8232d826ce8
  func:scrollToTop: 40a3c590b7862492
  overview: d7baf241fd518005
  style_tokens: 0b28756a678eed77
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, bir kategori sayfasının alt kısmında yer alarak kullanıcıları belirli aksiyonlara yönlendiren bir CTA (Çağrı‑Eylemi) bileşenini ve sayfanın en üstüne hızlıca dönme işlevini barındırır. Bileşen, sihirbazı açma veya ürünleri gösterme gibi etkileşimleri tetiklerken, yardımcı fonksiyon sayfa gezinme deneyimini iyileştirir.

## Fonksiyon Grupları
### Kullanıcı Arayüzü ve Etkileşim
Kategori sayfasının sonunda, kullanıcıya eylem teşvik eden görsel bir bileşen sunar; bu bileşen, harici callback fonksiyonları aracılığıyla ana uygulama mantığıyla entegre olarak sihirbaz açma veya ürün listeleme gibi görevleri tetikler.
- BottomCTA

### Sayfa Navigasyonu
Sayfayı en üste kaydırarak kullanıcının üst menülere veya başlangıç noktasına kolayca erişmesini sağlayan temel bir gezinme yardımcı işlevini içerir.
- scrollToTop

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için temel olarak harici callback fonksiyonlarının sağlanması ve tarayıcı ortamı gereklidir.

**[Aksiyom 1]:** Eğer `onOpenWizard` callback fonksiyonu sağlanmazsa, ilgili butona tıklandığında sihirbaz açılamaz ve kullanıcı etkileşimi hedeflenen aksiyona ulaşamaz.

**[Aksiyom 2]:** Eğer `onShowProducts` callback fonksiyonu sağlanmazsa, ilgili butona tıklandığında ürün listesi görüntülenemez.

**[Aksiyom 3]:** Eğer `scrollToTop` fonksiyonu, tarayıcı ortamında (`window.scrollTo`) çalıştırılamaz bir bağlamda çağrılırsa, sayfanın en üstüne kaydırma işlemi başarısız olur.

**[Aksiyom 4]:** Eğer `showWizard` parametresi `false` olarak ayarlanırsa, sihirbazı açmaya yönelik arayüz bileşenleri (buton, container) gösterilmez; ancak componentin genel yapısal varlığı devam eder.

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

## INTERFACES

### BottomCTAProps
- `onOpenWizard?: () => void`
- `onShowProducts?: () => void`
- `showWizard?: boolean`
- `categoryName?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BottomCTA.tsx::BottomCTA
- **params**: `{ onOpenWizard, onShowProducts, showWizard = true, categoryName = 'Ürünler' }`
- **ic_degiskenler**: 内部变量，仅在函数体（返回的 JSX）中实际使用。
  - `categoryName` — 从 props 接收的分类名称字符串，用在页眉文本中（通过 `.toLowerCase()` 显示）。
  - `showWizard` — 布尔值，控制布局（网格列数）和“Wizard”按钮的渲染。
  - `onOpenWizard` — 回调函数，作为“Bana Uygun Olanı Bul”按钮的 `onClick` 处理器。
  - `onShowProducts` — 回调函数，作为“Modelleri İncele”按钮的 `onClick` 处理器。
  - `scrollToTop` — 在函数体内定义的内部函数，用于滚动到页面顶部。作为“Başa Dön”按钮的 `onClick` 处理器。
- **Dönüş**: React 元素（JSX 代码）。

### [N2_NASIL] AST Pointer: BottomCTA.tsx::scrollToTop
- **params**: (parametre yok)
- **ic_degiskenler**: Bu fonksiyon gövdesinde herhangi bir değişken tanımlanmaz veya kullanılmaz. `window` nesnesi doğrudan koşullu olarak erişilir.
- **Dönüş**: yok (undefined). Yan etkisi: Sayfayı yumuşak bir şekilde yukarı kaydırır.

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