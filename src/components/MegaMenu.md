---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\MegaMenu.tsx
skeleton_hash: c7652019346c384d
entity_hashes:
  func:MegaMenu: 73d16c7403c0be73
  overview: 0b44495d3aab4c57
  style_tokens: 607cd2b8b83a451b
generated_at: 2026-05-28T22:36:26Z
---

## Genel Bakış
MegaMenu modülü, web sitesinin üst navigasyon bölümünde yer alan mega menü bileşenini tanımlar. Bileşen, `isOpen` ve `onClose` prop'ları aracılığıyla menünün açılıp kapanmasını dış bileşenlerden kontrol eder ve kullanıcılara geniş kapsamlı navigasyon seçenekleri sunar.

## Fonksiyon Grupları
### Ana Bileşen
Mega menünün görsel yapısını oluşturur ve görünürlük durumunu yönetir. Kullanıcı menüyü kapatmak istediğinde `onClose` callback'ini tetikleyerek üst bileşene bildirim gönderir.
- MegaMenu

---

## AXIOMS – Mimari Varsayımlar
MegaMenu component'inin doğru çalışması için `isOpen` durum kontrolü ve `onClose` işlevinin sağlanması gerekir.

[Aksiyom 1]: Eğer `isOpen` prop'u boolean değer olarak sağlanmazsa, menünün açık/kapalı durumu belirsiz olur ve component düzgün render edilemez.
[Aksiyom 2]: Eğer `onClose` prop'u fonksiyon olarak sağlanmazsa, kullanıcı menüyü kapatmak için herhangi bir yol bulamaz ve menü sürekli açık kalır.

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

## INTERFACES

### MegaMenuProps
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/MegaMenu.tsx::MegaMenu
- **params**: `isOpen` — MegaMenu'ün açılıp açılmadığını belirten boolean, `onClose` — menüyü kapatmak için çağrılan fonksiyon
- **ic_degiskenler**:
  - `categories` — useCategories hook'undan gelen kategoriler dizisi, mega menüde gösterilecek olan kategori verileri
  - `loading` — useCategories hook'undan gelen yükleme durumu boolean'ı, kategoriler yüklenirken true olur
  - `isMounted` — bileşenin mount edilip edilmediğini takip eden state boolean'ı, client-side rendering için kullanılır
  - `setIsMounted` — isMounted state'ini güncellemek için kullanılan setter fonksiyonu
- **Dönüş**: React.ReactNode (null veya JSX)

### [N2_NASIL] AST Pointer: src/components/MegaMenu.tsx::MegaMenu/useEffect callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsMounted` — useState hook'undan gelen setter fonksiyonu, useEffect içinde true olarak çağrılır
- **Dönüş**: yok (side effect)

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