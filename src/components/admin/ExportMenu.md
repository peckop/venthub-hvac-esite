---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\ExportMenu.tsx
skeleton_hash: 952569e6c7605451
entity_hashes:
  func:ExportMenu: 9e536638b7cdf449
  overview: fcef70276d80a8c4
  style_tokens: b6f5e12168df9a4c
generated_at: 2026-08-27T08:00:46Z
---

## Genel Bakış
`ExportMenu` modülü, yönetim panelinde kullanıcının veri dışa aktarma seçeneklerini görüntülemesini ve tetiklemesini sağlayan bir React bileşeni sunar. Bileşen, gelen menü öğelerini listeleyerek her biri için ilgili eylemi çalıştırır ve isteğe bağlı bir buton etiketiyle kullanıcı arayüzünde konumlandırılabilir.

## Fonksiyon Grupları
### ExportMenu Bileşeni
Bu grup, menünün yapısını oluşturma, kullanıcı etkileşimini yönetme ve dışa aktarma işlemlerini başlatma sorumluluğunu üstlenir. Tek bir fonksiyon, tüm bu davranışları birleştirir.
- ExportMenu

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### ExportMenu
**Ne yapar**: Bu bileşen, yönetici arayüzünde dışa aktarma seçenekleri sunan bir menü oluşturur. Kullanıcıya verileri farklı formatlarda dışa aktarma imkanı sağlar.

**Nasıl yapar**: Bileşen, verilen `items` dizisini kullanarak bir menü listesi oluşturur. Her bir item için bir dışa aktarma seçeneği sunar. `buttonLabel` parametresi ile menünün üzerindeki düğme etiketi özelleştirilebilir. Bileşen, tıklanan öğenin bilgilerini bir üst bileşene iletir.

**Parametreler**:
- items: ExportMenuItem[] — Dışa aktarma seçeneklerini içeren dizi. Her bir seçenek, dışa aktarılacak veri kaynağını ve formatını belirtir.
- buttonLabel: string (opsiyonel) — Menüyü açan düğmenin üzerindeki metin. Belirtilmezse varsayılan bir etiket kullanılır.

**Dönüş**: React bileşeni (React.FC) — Oluşturulan dışa aktarma menüsünü render eden bir React bileşeni. Bileşen, ExportMenuItem[] dizisi ve opsiyonel buttonLabel string'i alır.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminButtonSecondaryClass
- import: @radix-ui/react-dropdown-menu
- import: lucide-react::Download
- import: lucide-react::FileDown
- import: lucide-react::Table
- import: react::React

---

## TYPE ALIASES

### ExportMenuItem
```typescript
type ExportMenuItem = {
  key: string
  label: string
  onSelect: () => void
}
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ExportMenu.tsx::ExportMenu
- **params**:
  - `items` — ExportMenuItem[] türünde, dışa aktarma menüsü seçeneklerinin listesi. Her item `key`, `label` ve `onSelect` özelliklerine sahiptir
  - `buttonLabel` — string (optional), menü tetikleyici butonunda gösterilecek özel metin. Tanımlı değilse varsayılan çeviri kullanılır
- **ic_degiskenler**:
  - `_t` — `useI18n()` hookundan elde edilen çeviri fonksiyonu (`t` olarak alınmış, `_t` olarak yeniden adlandırılmış). Menü metinlerinin çok dilli çevirilerini sağlamak için kullanılır
- **Dönüş**: JSX (DropdownMenu.Root bileşeni — dışa aktarma menüsü UI'ı)

---

## NODE ID STANDARD

  file: src\components\admin\ExportMenu.tsx
  function: src\components\admin\ExportMenu.tsx::ExportMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ExportMenu
  export: ExportMenuItem

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-success-weak`, `bg-admin-surface`, `border-admin-border`, `data-[highlighted]:bg-admin-surface-2`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-xs`
- **Layout:** `flex`, `gap-2`, `gap-3`, `h-12`, `h-8`, `items-center`, `justify-center`, `min-w-140px`, `min-w-200px`, `p-2`, `shadow-admin-overlay`, `w-8`, `z-popover`, `zoom-in-95`
- **Varyant/Responsive:** `data-[highlighted]:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `border`, `cursor-pointer`, `data-[highlighted]:ring-2`, `data-[highlighted]:ring-admin-ring`, `data-[highlighted]:ring-inset`, `duration-200`, `fade-in`, `font-semibold`, `italic`, `mb-1`, `outline-none`, `pb-2`, `pt-2`, `px-3`