---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\ColumnsMenu.tsx
skeleton_hash: 8e6ac07df5b78228
entity_hashes:
  func:ColumnsMenu: acb58bb1e295bcab
  overview: e3dc8c1ebce8d947
  style_tokens: f68608c28260c039
generated_at: 2026-05-28T22:35:32Z
---

## Genel Bakış
`ColumnsMenu` bileşeni, yönetim panelindeki tablolarda sütunların görünürlüğünü ve satır yoğunluğunu yönetmeye yarayan bir menü bileşenidir. Dışarıdan aldığı sütun listesini ve yoğunluk ayarını kullanarak, kullanıcının bu tercihleri kolayca değiştirimesine olanak tanır.

## Fonksiyon Grupları
### Menü ve Kontrol Mantığı
Bu grup, menünün kullanıcıya sunulması, sütun açma/kapama denetimlerinin listelenmesi ve yoğunluk değişikliklerinin üst bileşene iletilmesinden sorumludur.
- ColumnsMenu

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, fonksiyon imzası ve bileşenin tablo yapılandırması menüsü rolü temel alınarak belirlenmiştir.

**[Aksiyom 1]**: Eğer `columns` parametresi dizisi boş veya tanımsızsa, menüde sütun denetimleri oluşturulamaz ve kullanıcı hiçbir sütunu açıp kapatamaz.

**[Aksiyom 2]**: Eğer `onDensityChange` callback fonksiyonu sağlanmamışsa, kullanıcı yoğunluk değiştirdiğinde üst bileşene bildirim yapılamaz ve yoğunluk değişikliği uygulanamaz.

**[Aksiyom 3]**: Eğer `density` parametresi geçerli bir yoğunluk değeri (örn: `compact`, `normal`, `comfortable`) içermiyorsa, yoğunluk seçim durumu doğru görüntülenemez.

**[Aksiyom 4]**: Eğer `buttonLabel` parametresi sağlanmamışsa, menü tetikleme düğmesinde varsayılan bir etiket yoksa boş veya anlamsız bir düğme görüntülense bile bileşen render edilmeye devam eder.

**[Aksiyom 5]**: Eğer `columns` dizisi içindeki herhangi bir sütun nesnesi gerekli alanları (örn: `id`, görünürlük durumu) içermiyorsa, o sütun için denetim düzgün oluşturulamaz.

---

## FONKSİYON DETAYLARI

### ColumnsMenu

**Ne yapar**: Tablo sütunlarının görünürlüğünü ve tablo yoğunluğunu (density) yöneten bir açılır menü bileşenidir. Kullanıcının tablodaki hangi sütunların gösterileceğini seçmesine ve satır aralığı yoğunluğunu ayarlamasına olanak tanır.

**Nasıl yapar**: Bileşen, verilen `columns` dizisini kullanarak her bir sütun için bir toggle ( açma/kapama ) kontrolü oluşturur. `density` prop'u ile mevcut yoğunluk durumunu okur ve `onDensityChange` callback'i aracılığıyla yoğunluk değişikliklerini üst bileşene iletir. `buttonLabel` prop'u sağlanmışsa, menüyü tetikleyen butonda özel bir etiket kullanılır; aksi halde varsayılan bir etiket gösterir.

**Parametreler**:
- `columns`: `ColumnToggle[]` — Tablodaki sütunların tanımını ve görünürlük durumlarını içeren dizi. Her bir öğe, bir sütunun adını ve açma/kapama durumunu temsil eder.
- `density`: `Density` — Tablonun mevcut yoğunluk modunu belirten değer. Satır yüksekliği ve iç boşlukları kontrol eder.
- `onDensityChange`: `(d: Density) => void` — Kullanıcı yoğunluk değiştirdiğinde çağrılan geri çağırma fonksiyonu. Yeni yoğunluk değerini üst bileşene iletir.
- `buttonLabel`: `string | undefined` — Opsiyonel. Menüyü açan buton üzerinde görüntülenecek özel etiket metni. Sağlanmadığında varsayılan metin kullanılır.

**Dönüş**: `React.FC` — JSX ile render edilen bir React fonksiyonel bileşeni döndürür. Bileşen, sütun toggle'larını ve yoğunluk seçim kontrolünü içeren bir menü arayüzü sunar.

---

## TYPE ALIASES

### ColumnToggle
```typescript
type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/ColumnsMenu.tsx::ColumnsMenu
- **params**: `{ columns, density, onDensityChange, buttonLabel }`
  - `columns` — `ColumnToggle[]` tipinde, sütunların açma/kapama durumlarını ve etiketlerini içeren dizi; `.map()` ile dönülerek her sütun için checkbox öğesi oluşturulur
  - `density` — `Density` tipinde aktif satır yoğunluk modu (`"comfortable"` veya `"compact"`); radio grubunun seçili değerini belirler ve koşullu CSS sınıfları için kullanılır
  - `onDensityChange` — `(d: Density) => void` tipinde geri çağırma fonksiyonu; kullanıcı yoğunluk seçimini değiştirdiğinde `DropdownMenu.RadioGroup.onValueChange` içinde çağrılır
  - `buttonLabel` — `string | undefined`, opsiyonel buton metni; tanımlıysa kullanılır, aksi halde `_t('admin.common.view')` veya `'Görünüm'` fallback'i gösterilir
- **ic_degiskenler**:
  - `_t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu (`t`); bileşen içindeki tüm kullanıcıya dönük metinlerin uluslararasılaştırılmasını sağlar (`_t('admin.a11y.menu')`, `_t('admin.common.view')`, `_t('admin.inventory.activeColumns')`, `_t('admin.inventory.density')`, `_t('admin.inventory.densityComfortable')`, `_t('admin.inventory.densityCompact')`)
- **col (map callback parametresi)** — `columns.map(col => ...)` içindeki her bir `ColumnToggle` öğesi:
  - `col.key` — benzersiz React listesi anahtarı; `DropdownMenu.CheckboxItem`'a `key` prop'u olarak verilir
  - `col.checked` — `boolean`, sütunun şu anda görünür olup olmadığını belirtir; checkbox'ın `checked` prop'u ve koşullu CSS sınıfları (`bg-cyan-400`) için kullanılır
  - `col.onChange` — `(v: boolean) => void` tipinde sütun durumu değiştirme callback'i; `onCheckedChange` içinde `Boolean(v)` ile çağrılarak sütun açılır/kapanır
  - `col.label` — `string`, sütunun kullanıcıya gösterilen Türkçe/yerel adı; checkbox öğesinin hem metin içeriğinde hem `aria-label`'inde kullanılır
- **Dönüş**: JSX — Radix UI `DropdownMenu` bileşeni; sütun toggle checkbox'larından ve yoğunluk seçim radio butonlarından oluşan bir dropdown menü

---

## NODE ID STANDARD

  file: src\components\admin\ColumnsMenu.tsx
  function: src\components\admin\ColumnsMenu.tsx::ColumnsMenu

---

## DISA AKTARILANLAR (EXPORTS)
  export: ColumnToggle
  export: ColumnsMenu

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `shadow-glow-sm`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-surface-deep`, `bg-white/5`, `border-b`, `border-cyan-400`, `border-white/10`, `border-white/5`, `data-[state=checked]:text-cyan-400`, `hover:bg-white/5`, `hover:text-white`, `stroke-4`, `text-cyan-400`, `text-slate-300`, `text-slate-500`, `text-surface-deep`
- **Layout:** `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `h-1.5`, `h-12`, `h-4`, `h-px`, `items-center`, `justify-between`, `justify-center`, `max-h-300px`, `min-w-140px`, `min-w-240px`, `overflow-y-auto`
- **Varyant/Responsive:** `:`, `data-[state=checked]:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${col.checked`, `${density`, `:`, `===`, `animate-in`, `border`, `comfortable`, `compact`, `cursor-pointer`, `duration-200`, `fade-in`, `font-black`, `font-bold`, `glass-strong`, `group`