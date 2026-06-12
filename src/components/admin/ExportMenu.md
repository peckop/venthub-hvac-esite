---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ExportMenu.tsx
skeleton_hash: a10b677ea8364439
entity_hashes:
  func:ExportMenu: 9e536638b7cdf449
  overview: fcef70276d80a8c4
  style_tokens: 7659c3683121a964
generated_at: 2026-06-08T10:08:36Z
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
- `rounded-hvac-lg`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-emerald-500/10`, `border-white/10`, `hover:bg-white/5`, `hover:text-white`, `text-emerald-400`, `text-slate-300`, `text-slate-500`, `text-xs`
- **Layout:** `flex`, `gap-2`, `gap-3`, `h-12`, `h-8`, `items-center`, `justify-center`, `min-w-140px`, `min-w-200px`, `p-2`, `shadow-elevation-5`, `w-8`, `z-50`, `zoom-in-95`
- **Varyant/Responsive:** `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-in`, `border`, `cursor-pointer`, `duration-200`, `fade-in`, `font-black`, `font-bold`, `glass-strong`, `italic`, `mb-1`, `outline-none`, `pb-2`, `pt-2`, `px-3`, `px-4`