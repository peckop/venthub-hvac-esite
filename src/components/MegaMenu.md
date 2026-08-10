---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\MegaMenu.tsx
skeleton_hash: 94fd26e812855e91
entity_hashes:
  func:MegaMenu: 73d16c7403c0be73
  overview: 7b77f95abaa36af5
  style_tokens: 607cd2b8b83a451b
generated_at: 2026-06-19T20:47:09Z
---

## Genel Bakış
MegaMenu, web sitesinin üst navigasyon çubuğunda yer alan ve kullanıcılara geniş kapsamlı, çok sütunlu bir navigasyon deneyimi sunan bir React bileşenidir. Bileşen, dışarıdan verilen durum ve kontrol fonksiyonları sayesinde açılıp kapanabilir ve üst bileşenlerle tam etkileşim içinde çalışır.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün tamamını temsil eden ana React bileşenidir. Görünür durumunu `isOpen` prop'una göre koşullu olarak renderlar ve kullanıcı menüyü kapatmak istediğinde `onClose` callback'ini tetikleyerek üst bileşene durumu bildirir.
- MegaMenu

---

## AXIOMS – Mimari Varsayımlar

MegaMenu modülü, menünün görünürlük durumunu dışarıdan kontrol eden bir bileşendir ve doğru çalışması için belirli prop'ların sağlanması gerekmektedir.

**[Aksiyom 1]:** Eğer `isOpen` prop'u sağlanmazsa, menünün açılıp kapanma durumu belirsiz olur ve bileşen tutarsız davranabilir.

**[Aksiyom 2]:** Eğer `onClose` callback fonksiyonu sağlanmazsa, menü kapatma işlemi tetiklendiğinde üst bileşene bildirim gönderilemez ve menü kapanma akışı bozulur.

**[Aksiyom 3]:** Eğer bileşen `isOpen: true` durumunda render edilir ve `onClose` geçerli bir fonksiyon değilse, kullanıcı menüyü kapatamaz ve navigasyon işlevsiz kalır.

---

## FONKSİYON DETAYLARI

### MegaMenu

**Ne yapar**: MegaMenu, projenin ana navigasyon menüsünü açılır mega menü formatında sunan bir React bileşenidir. Kullanıcının menü çubuğundaki belirli bir kategori üzerine tıklaması veya hover etmesiyle tetiklenen bu bileşen, çok sütunlu ve genişletilmiş bir navigasyon arayüzü sağlar.

**Nasıl yapar**: Bileşen, isOpen prop'u ile kontrol edilen koşullu renderlama (conditional rendering) mantığı kullanır. isOpen değeri true olduğunda menü içeriği görüntülenir, false olduğunda gizlenir veya unmount edilir. onClose callback fonksiyonu, menünün kapanma talebini üst bileşene iletir — bu genellikle menü dışına tıklama, Escape tuşu basma veya bir bağlantı seçme durumlarında tetiklenir.

**Parametreler**:
- `isOpen`: `boolean` — Mega menünün görüntülenip görüntülenmediğini kontrol eden durum bayrağı. True değerinde menü açılır ve görünür hale gelir.
- `onClose`: `() => void` — Menünün kapatılması gerektiğinde çağrılan geri çağırım (callback) fonksiyonu. Üst bileşende menü durumunu sıfırlamak için kullanılır.

**Dönüş**: `React.FC<MegaMenuProps>` — Render edilmiş mega menü yapısını içeren JSX elementi döndürür. Props tipi olarak MegaMenuProps arayüzünü kullanır.

**Bağlam**: Bu bileşen, `src/components/` dizininde konumlanmış olup projenin genel navigasyon yapısının parçasıdır. HVAC ürün kategorileri ve alt kategorileri için genişletilmiş menü deneyimi sunar.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/CategoryContext::useCategories
- import: ../i18n/I18nProvider::useI18n
- import: ./navigation/EliteMegaMenu::EliteMegaMenu
- import: ./navigation/EliteMegaMenu::MobileMegaMenu
- import: react::React
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### MegaMenuProps
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/MegaMenu.tsx::MegaMenu
- **params**: `{ isOpen, onClose }` — `isOpen`: boolean, mega menünün açık olup olmadığını belirtir; `onClose`: menüyü kapatma callback fonksiyonu
- **ic_degiskenler**:
  - `categories` — `useCategories()` hook'undan gelen kategori listesi, `EliteMegaMenu` ve `MobileMegaMenu` bileşenlerine props olarak geçirilir
  - `loading` — `useCategories()` hook'undan gelen yükleme durumu boolean'ı, true ise spinner gösterilir
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, `t('megamenu.classic.logoInitial')` ve `t('megamenu.classic.title')` çağrılarıyla kullanılır
  - `isMounted` — `useState(false)` ile oluşturulan boolean state, bileşenin client-side olarak mount edilip edilmediğini takip eder (SSR guard)
  - `setIsMounted` — `useState` setter'ı, `useEffect` callback'inde `true` olarak çağrılır
- **Dönüş**: JSX (`null` veya mega menü DOM yapısı döner)
- **Yan etkileri**: `useEffect` ile `isMounted` state'ini `true`'ya çeker; `onClose` callback'i button onClick ve alt bileşenlerin `onNavigate` prop'u aracılığıyla tetiklenir
- **Kullanılan hook'lar**: `useCategories`, `useI18n`, `useState`, `useEffect`
- **Kullanılan alt bileşenler**: `EliteMegaMenu` (`categories`, `onNavigate={onClose}`), `MobileMegaMenu` (`categories`, `onNavigate={onClose}`)
- **Early return**: `!isMounted || !isOpen` koşulunda `null` döner

---

## NODE ID STANDARD

  file: src\components\MegaMenu.tsx
  function: src\components\MegaMenu.tsx::MegaMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: MegaMenu

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50/30`, `bg-white`, `border-4`, `border-b`, `border-primary-navy/20`, `border-slate-100`, `border-t-primary-navy`, `hover:bg-slate-50`, `hover:text-slate-600`, `text-lg`, `text-slate-400`, `text-slate-900`, `text-white`, `text-xs`
- **Layout:** `block`, `custom-scrollbar`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `h-6`, `h-8`, `hidden`, `items-center`, `justify-between`, `justify-center`, `max-w-7xl`, `overflow-hidden`
- **Varyant/Responsive:** `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `animate-spin`, `duration-300`, `fade-in`, `font-bold`, `inset-0`, `mx-auto`, `px-6`, `py-20`, `py-4`, `py-8`, `rounded-full`, `rounded-lg`, `tracking-tight`, `transition-colors`