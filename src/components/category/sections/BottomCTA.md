---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\BottomCTA.tsx
skeleton_hash: e48a9fc413433199
entity_hashes:
  func:BottomCTA: c122a8232d826ce8
  func:scrollToTop: 40a3c590b7862492
  overview: 53563a83f6e89040
  style_tokens: 0b28756a678eed77
generated_at: 2026-06-14T20:12:49Z
---

## Genel Bakış
Bu modül, kategori sayfalarının alt kısmında yer alan ve kullanıcılara sihirbazı başlatma veya ürünleri listeleme gibi belirli aksiyonları teşvik eden bir “Çağrı‑Eylemi” bileşenini barındırır. Modül, sayfanın en üstüne hızlıca dönme yardımcısıyla birlikte, sayfa navigasyon deneyimini tamamlar.

## Fonksiyon Grupları
### Kullanıcı Eylem Bileşeni
Sayfa sonunda kullanıcının ilgisini çeken ve tıklama ile harici uygulama mantığını tetikleyen görsel bir arayüz bileşenini tanımlar. Bu bileşen, parametreler aracılığıyla farklı durumları yönetir ve callback fonksiyonları ile üst düzey uygulama akışıyla entegre olur.
- BottomCTA

### Sayfa İçi Navigasyon Yardımcısı
Sayfayı tarayıcının en üstüne kaydırarak kullanıcının başlangıç noktalarına veya üst menülere kolayca erişmesini sağlayan temel ve izole bir yardımcı işlevi içerir.
- scrollToTop

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir kategori sayfasının alt kısmında yer alan CTA (Çağrı-Eylemi) bileşenidir ve yardımcı scroll fonksiyonu içerir.

**[Aksiyom 1]**: Eğer `showWizard` true ise ve `onOpenWizard` callback'i sağlanmamışsa, kullanıcı sihirbaz tetikleme butonuna tıkladığında "undefined is not a function" hatası oluşur.

**[Aksiyom 2]**: Eğer `showWizard` false ise, bileşen sihirbaz ile ilgili UI elemanlarını (buton/bölüm) render etmez — bu prop koşullu gösterim için kontrol edilir.

**[Aksiyom 3]**: Eğer `onShowProducts` callback'i sağlanmamışsa ve kullanıcı "ürünleri göster" aksiyonunu tetiklerse, çalışma zamanı hatası oluşur.

**[Aksiyom 4]**: `scrollToTop()` fonksiyonu, sayfanın en üstüne kaydırma işlemini tetikler; bu fonksiyon bileşen içinde veya harici navigasyon amaçlı çağrılabilir.

**[Aksiyom 5]**: `categoryN` parametresi optional'dır — eğer sağlanmazsa bileşen alternatif bir gösterim mantığı (örn: varsayılan metin, gizleme) uygulamalıdır; aksi halde hata oluşur.

---

*Not: Bileşenin iç mantığı (hangi HTML/JSX yapısını render ettiği) fonksiyon gövdesinden çıkarılamadığından, button click handler'ların callback'leri doğrudan mı çağırdığına dair kesin aksiyom oluşturulamamıştır.*

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
- import: ../../../utils/routes::Routes
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

### [N1_NASIL] AST Pointer: components/category/sections/BottomCTA.tsx::BottomCTA
- **params**: (`onOpenWizard`, `onShowProducts`, `showWizard` = `true`, `categoryName` = `'Ürünler'`)
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan destructured çeviri fonksiyonu; `t('category.bottomCta.nextStep')`, `t('category.bottomCta.helpText', { category: categoryName.toLowerCase() })`, `t('category.inspectModels')`, `t('category.bottomCta.viewAllProducts')`, `t('category.bottomCta.findFit')`, `t('category.bottomCta.findFitDesc')`, `t('category.bottomCta.expertSupport')`, `t('category.bottomCta.expertSupportDesc')`, `t('category.bottomCta.backToTop')` çağrılıyor
  - `scrollToTop` — pencereyi smooth şekilde sayfanın en üstüne kaydıran inner arrow function; `typeof window !== 'undefined'` kontrolü sonrası `window.scrollTo({ top: 0, behavior: 'smooth' })` çağrısı yapıyor
- **Kullanılan prop/lifecycle bağları**: `onShowProducts` — `onShowProducts && (...)` koşuluyla render ediliyor, button `onClick`'ine bağlanıyor; `onOpenWizard` — `showWizard && onOpenWizard && (...)` koşuluyla render ediliyor, button `onClick`'ine bağlanıyor; `showWizard` — CTA grid'inde `grid-cols-1 md:grid-cols-3` vs `grid-cols-1 md:grid-cols-2` seçimini ve wizard butonunun render koşulunu belirliyor; `categoryName` — `categoryName.toLowerCase()` olarak `t()` çağrı parametresine geçiliyor
- **Statik import kullanımı**: `Routes.contact('consulting')` — Link `href` değerini üretir; `ArrowUp`, `MessageSquare`, `Package`, `ThermometerSun` — lucide-react ikonları JSX içinde render ediliyor; `Link` — next/link'ten import edilen, `/consulting` rotasına yönlendiren bağlantı bileşeni
- **Dönüş**: JSX `<section>` elemanı (BottomCTAProps ile uyumlu React FC dönüşü)

### [N2_NASIL] AST Pointer: components/category/sections/BottomCTA.tsx::scrollToTop
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Yan etki**: `typeof window !== 'undefined'` koşulu sağlanırsa `window.scrollTo({ top: 0, behavior: 'smooth' })` çağrısı ile tarayıcı penceresini sayfanın en üstüne kaydırır
- **Dönüş**: yok (void)

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