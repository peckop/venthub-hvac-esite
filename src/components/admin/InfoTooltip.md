---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InfoTooltip.tsx
skeleton_hash: f0ca4c18d6b635f9
entity_hashes:
  func:InfoTooltip: 183c7d447a0090ba
  overview: 7d5fe73182f0a761
  style_tokens: 853d14269b613998
generated_at: 2026-08-27T08:01:21Z
---

## Genel Bakış
`InfoTooltip`, yönetim panelinde kullanılan bir React tooltip bileşenidir. Kullanıcı fareyi üzerine getirdiğinde bilgilendirici bir metin baloncuğu gösterir. Bileşen, `lucide-react` kütüphanesinden aldığı `Info` ikonunu tetikleyici olarak kullanır ve dışarıdan aldığı `text`, `size` ve `className` parametreleriyle yapılandırılır.

## Fonksiyon Grupları
### Tooltip Bileşeni
Bu grup, bilgilendirici tooltip'in render edilmesinden ve görünümünün yapılandırılmasından sorumludur. Verilen metni bir ipucu baloncuğu içinde gösterirken, ikon boyutu ve ek CSS sınıfları gibi özelleştirmelere olanak tanır.
- InfoTooltip

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InfoTooltip
**Ne yapar**: Kullanıcıya bilgilendirici bir tooltip (yardım ipucu) gösteren React bileşenidir. Belirli bir metni, hover (üzerine gelme) sırasında küçük bir baloncuk içinde kullanıcıya sunar.

**Nasıl yapar**: Bileşen, verilen text parametresini bir tooltip içinde render eder. size parametresi ile ikonun veya tetikleyicinin boyutu, className ile ek stillendirme seçenekleri özelleştirilebilir. Tooltip, genellikle bir bilgi ikonu (ℹ️) ile tetiklenir ve üzerine gelindiğinde veya tıklandığında bilgilendirici metni gösterir.

**Parametreler**:
- text: string — Tooltip içinde görüntülenecek bilgilendirici metin
- size: number (varsayılan: 14) — Tooltip tetikleyicisinin (ikon) piksel cinsinden boyutu
- className: string (varsayılan: '') — Bileşene eklenecek ek CSS sınıfları

**Dönüş**: React.FC<InfoTooltipProps> — Bileşen, InfoTooltipProps arayüzünü kullanan bir React fonksiyonel bileşeni olarak döner.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Info
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useId
- import: react::useState

---

## INTERFACES

### InfoTooltipProps
KOLON AÇIKLAMASI (tooltip). `e1018e46` ile tablo başlıklarına eklenmiş, sonraki kit göçünde importer'ı kaybolmuştu; bileşen de sözlükteki `admin.inventory.tooltip.*` anahtarları da yetim kaldı. Geri bağlandı — SİLİNMEDİ, çünkü "Fiziksel / Rezerve / Müsait / Eşik / ABC / Tükenme" kolonları isimlerind
- `text: string`
- `size?: number`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InfoTooltip.tsx::InfoTooltip
- **params**: `text` — tooltip içinde gösterilecek metin; `size` — varsayılan 14, lucide-react `Info` ikonunun piksel boyutu; `className` — varsayılan boş dize, sarmalayıcı `<span>`'e eklenen ek CSS sınıfı
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; butonun `aria-label` değerinde `t('admin.ui.moreInfo')` olarak kullanılır
  - `open` — `useState(false)` ile oluşturulan boolean durum; tooltip'in açık/kapalı olduğunu tutar
  - `setOpen` — `open` durumunu güncelleyen setter fonksiyonu; `show`, `hide`, `onClick` handler'ı ve `onKey` içinde `setOpen(true)`, `setOpen(false)`, `setOpen((v) => !v)` çağrılarıyla kullanılır
  - `tooltipId` — `useId()` ile üretilen benzersiz dize; tooltip `<span>`'inin `id`'si ve butonun `aria-describedby` değeri olarak kullanılır
  - `show` — `useCallback(() => setOpen(true), [])` ile oluşturulan stabilize fonksiyon; sarmalayıcı `<span>`'in `onMouseEnter`'ında ve butonun `onFocus`'unda tetiklenir
  - `hide` — `useCallback(() => setOpen(false), [])` ile oluşturulan stabilize fonksiyon; sarmalayıcı `<span>`'in `onMouseLeave`'inde ve butonun `onBlur`'unda tetiklenir
- **Dönüş**: JSX elementi — `open` true ise tooltip içeriğini (`text`, ok üçgeni) barındıran `role="tooltip"` `<span>`'ini, değilse yalnızca butonu render eden bir `<span>` sarmalayıcı döndürür

### [N2_NASIL] AST Pointer: src/components/admin/InfoTooltip.tsx::InfoTooltip → useEffect callback
- **params**: yok (React useEffect callback'i; bağımlılık dizisi `[open]`)
- **ic_degiskenler**:
  - `onKey` — `(e: KeyboardEvent) => { ... }` imzalı fonksiyon; `e.key === 'Escape'` koşulu sağlandığında `setOpen(false)` çağırarak tooltip'i kapatır; `document.addEventListener('keydown', onKey)` ile eklenir, cleanup'ta `document.removeEventListener('keydown', onKey)` ile kaldırılır
- **Dönüş**: cleanup fonksiyonu — `document.removeEventListener('keydown', onKey)` çağırır; `open` false ise erken return ile hiçbir listener eklenmez ve dönüş yoktur

### [N3_NASIL] AST Pointer: src/components/admin/InfoTooltip.tsx::InfoTooltip → useEffect callback → onKey
- **params**: `e` — `KeyboardEvent` olay nesnesi; `e.key` özelliği Escape tuşu kontrolü için okunur
- **ic_degiskenler**: yok
- **Dönüş**: yok (void) — yan etki olarak `e.key === 'Escape'` koşulu gerçekleşirse `setOpen(false)` çağırır

---

## NODE ID STANDARD

  file: src\components\admin\InfoTooltip.tsx
  function: src\components\admin\InfoTooltip.tsx::InfoTooltip

---

## DISA AKTARILANLAR (EXPORTS)
  export: InfoTooltip

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface-3`, `border-4`, `border-b-admin-surface-3`, `border-transparent`, `hover:text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-left`, `text-xs`
- **Layout:** `absolute`, `bottom-full`, `inline-flex`, `items-center`, `justify-center`, `left-1/2`, `relative`, `shadow-admin-lg`, `top-full`, `w-64`, `z-popover`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `-translate-x-1/2`, `align-middle`, `cursor-help`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-normal`, `group`, `leading-relaxed`, `ml-1`, `mt-2`, `normal-case`, `px-3`, `py-2`