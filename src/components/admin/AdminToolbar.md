---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminToolbar.tsx
skeleton_hash: 9fd39e890d43433c
entity_hashes:
  func:AdminToolbar: af143a8f279e1c1e
  overview: abe2ed456058d747
  style_tokens: f914d27adccfd567
generated_at: 2026-05-28T22:35:21Z
---

## Genel Bakış
Bu modül, bir yönetim panelinde kullanılan araç çubuğu bileşenini tanımlar. Kullanıcıya arama, seçim, etiket (chip) ve açma/kapama (toggle) gibi filtreleme kontrollerini bir arada sunar; ayrıca kayıt sayısını gösterir ve filtreleri temizleme imkânı sağlar.

## Fonksiyon Grupları
### Admin Toolbar Bileşeni
Yönetim arayüzünde üst kısımda yer alan, birden çok filtre türünü ve durum bilgisini içeren bir araç çubuğu oluşturur.
- AdminToolbar

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `search` yoksa, arama kutusu gösterilmez ve kullanıcı arama yapamaz.

**Aksiyom 2**: Eğer `select` yoksa, seçim (dropdown) kontrolü render edilmez; kullanıcı birden çok öğe seçemez.

**Aksiyom 3**: Eğer `chips` yoksa, aktif filtre çipleri gösterilmez; mevcut filtrelerin görsel temsili eksik olur.

**Aksiyom 4**: Eğer `toggles` yoksa, durum (on/off) anahtarları gösterilmez; kullanıcı ilgili özellikleri açıp kapatamaz.

**Aksiyom 5**: Eğer `onClear` yoksa, “Temizle” (clear) butonu işlevsiz kalır; kullanıcı tüm seçimleri ve filtreleri sıfırlayamaz.

**Aksiyom 6**: Eğer `recordCount` yoksa, kayıt sayısı bilgisi gösterilmez; kullanıcı mevcut veri setinin büyüklüğünü göremez.

**Aksiyom 7**: Eğer `rig` yoksa, toolbar’ın stil ve konumlandırma (layout) ayarları eksik olur; varsayılan (fallback) stil uygulanır.

---

## FONKSİYON DETAYLARI

### AdminToolbar
**Ne yapar**: Bu React Fonksiyonel Bileşeni, VentHub HVAC sisteminin admin paneli için tasarlanmış araç çubuğunu oluşturur. Kullanıcıların arama, seçim, filtre yönetimi ve kayıt sayısı görüntüleme gibi yönetimsel işlemlerini yapabileceği tüm kullanıcı arayüzü öğelerini bir araya getirir.
**Nasıl yapar**: Bileşen, iletilen tüm props parametrelerini alır ve her bir prop ile ilişkili UI elemanlarını sıralı olarak render eder. Tüm etkileşim olayları için gerekli geri çağırma fonksiyonlarını üst bileşenlere iletir, özellikle `onClear` fonksiyonu ile tüm filtre ve arama ayarlarını sıfırlama işlemini gerçekleştirir. Ek olarak `rig` prop'u ile bileşenin özel yapılandırılmasını destekler.
**Parametreler**:
- search: unknown — Araç çubuğundaki arama bileşeni ile ilgili yapılandırma, sorgu değeri ve etkileşim olaylarını içeren veri paketi
- select: unknown — Seçim işlemleri için kullanılan açılır menüler, seçenekler ve ilgili olay dinleyicilerini içeren yapılandırma
- chips: unknown — Aktif filtreleri temsil eden çip bileşenleri, silme olayları ve görüntüleme ayarları içeren liste verisi
- toggles: unknown — Geçiş tuşları, toggle butonları ve ilgili durum yönetimi verilerini barındıran yapılandırma paketi
- onClear: (() => void) — Tüm arama, seçim ve filtre ayarlarını sıfırlamak için tetiklenen geri çağırma fonksiyonu
- recordCount: number — Mevcut listede gösterilen toplam kayıt sayısını temsil eden sayısal değer
- rig: unknown — Bileşenin özel stillendirme, ek özellikler veya özel yapılandırmaları için kullanılan ayar paketi
**Dönüş**: React.ReactElement — Admin araç çubuğunun tam kullanıcı arayüzünü temsil eden React JSX elemanı. Bileşen, tüm verilen props'lara dayalı olarak dinamik olarak içerik ve davranışını değiştirir.

---

## TYPE ALIASES

### AdminToolbarChip
```typescript
type AdminToolbarChip = {
  key: string
  label: string
  active: boolean
  onToggle: () => void
  classOn?: string
  classOff?: string
  title?: string
}
```

### AdminToolbarToggle
```typescript
type AdminToolbarToggle = {
  key: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  title?: string
}
```

### AdminToolbarSelectOption
```typescript
type AdminToolbarSelectOption = { value: string; label: string }
```

### AdminToolbarProps
```typescript
type AdminToolbarProps = {
  search?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    title?: string
    focusShortcut?: string // default '/'
  }
  select?: {
    value: string
  
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_1
- **params**: (none)
- **ic_degiskenler**:
  - `search` — dışarıdan gelen prop, arama alanının varlığını kontrol eder.
  - `inputRef` — `useRef` ile tanımlı, arama girişine odaklanmak için kullanılır.
  - `handleKeyDown` — `KeyboardEvent` dinleyicisi, “/” tuşuna basıldığında arama girişine odaklanır.
- **Dönüş**: `void` (etkinlik dinleyicisini ekler, temizleme fonksiyonu döner).

### [N2_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_2
- **params**: `e` — `KeyboardEvent`
- **ic_degiskenler**:
  - `e.key` — tuş kodunu kontrol eder, “/” ise işlem yapılır.
  - `document.activeElement?.tagName` — odaklanmış elementin tipini kontrol eder.
  - `inputRef.current` — arama girişine odaklanmak için `focus()` çağrısı yapılır.
- **Dönüş**: `void`

### [N3_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_3
- **params**: (none)
- **ic_degiskenler**:
  - `storageKey` — localStorage’da veri saklamak için kullanılan anahtar.
  - `persist` — dışarıdan gelen ayar nesnesi, hangi bölümlerin kalıcı olacağını belirler.
  - `enable` — `persist` değerlerine göre hangi bölümlerin yüklenip uygulanacağını tutan obje.
  - `raw` — `localStorage.getItem(storageKey)` sonucu, ham JSON stringi.
  - `saved` — `JSON.parse(raw)` ile elde edilen nesne; `search`, `select`, `chips`, `toggles` alanlarını içerir.
  - `select` — dışarıdan gelen select kontrolü, `onChange` ile değer güncellenir.
  - `chips` — dışarıdan gelen chip listesi, her chip `key`, `active`, `onToggle` içerir.
  - `toggles` — dışarıdan gelen toggle listesi, her toggle `key`, `checked`, `onChange` içerir.
  - `hydratedRef` — komponentin hydrate edildiğini işaret eden `useRef`.
- **Dönüş**: `void` (state’i hydrate eder, localStorage’dan okur).

### [N4_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_4
- **params**: `ch` — chip öğesi (`{ key, active, onToggle, ... }`)
- **ic_degiskenler**:
  - `saved.chips?.[ch.key]` — localStorage’da saklanan chip durumu.
  - `want` — `saved` içindeki chip’in beklenen boolean değeri.
- **Dönüş**: `void` (chip’in aktifliği farklıysa `onToggle` çağrılır).

### [N5_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_5
- **params**: `t` — toggle öğesi (`{ key, checked, onChange, ... }`)
- **ic_degiskenler**:
  - `saved.toggles?.[t.key]` — localStorage’da saklanan toggle durumu.
  - `want` — `saved` içindeki toggle’ın beklenen boolean değeri.
- **Dönüş**: `void` (toggle’ın durumu farklıysa `onChange` çağrılır).

### [N6_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_6
- **params**: (none)
- **ic_degiskenler**:
  - `storageKey` — localStorage’da veri saklamak için kullanılan anahtar.
  - `hydratedRef.current` — komponentin hydrate olup olmadığını gösterir.
  - `persist` — dışarıdan gelen ayar nesnesi, hangi bölümlerin kaydedileceğini belirler.
  - `enable` — `persist` değerlerine göre hangi bölümlerin payload’a ekleneceğini tutan obje.
  - `payload` — kaydedilecek veri objesi; `select`, `chips`, `toggles` alanlarını içerir.
  - `select` — dışarıdan gelen select kontrolü, `value` özelliği payload’a eklenir.
  - `chips` — dışarıdan gelen chip listesi, `key` ve `active` durumları payload’a eklenir.
  - `toggles` — dışarıdan gelen toggle listesi, `key` ve `checked` durumları payload’a eklenir.
- **Dönüş**: `void` (payload’u JSON.stringify edip localStorage’a yazar).

### [N7_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_7
- **params**: `opt` — option nesnesi (`{ value, label }`)
- **ic_degiskenler**:
  - `opt.value` — `<option>` elementinin `value` attribute’u.
  - `opt.label` — `<option>` elementinin gösterilen metni.
- **Dönüş**: `JSX.Element` (`<option>` elementi döner).

### [N8_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_8
- **params**: `tog` — toggle nesnesi (`{ key, label, checked, onChange, title, ... }`)
- **ic_degiskenler**:
  - `tog.key` — listede `key` attribute’u.
  - `tog.label` — gösterilen metin.
  - `tog.checked` — `Switch.Root`’un `checked` prop’u.
  - `tog.onChange` — toggle değiştiğinde çağrılan fonksiyon.
  - `tog.title` — erişilebilirlik etiketi, yoksa `label` kullanılır.
- **Dönüş**: `JSX.Element` (toggle UI’si döner).

### [N9_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_9
- **params**: `ch` — chip nesnesi (`{ key, label, active, onToggle, classOn, classOff, title, ... }`)
- **ic_degiskenler**:
  - `ch.key` — `key` attribute’u.
  - `ch.label` — buton içindeki metin.
  - `ch.active` — chip’in aktif olup olmadığını gösterir.
  - `ch.onToggle` — tıklandığında çalıştırılan fonksiyon.
  - `ch.classOn` / `ch.classOff` — aktif/pasif durumdaki CSS sınıfları.
  - `defaultChipOn` / `defaultChipOff` — varsayılan sınıflar (bileşen içinde tanımlı).
  - `ch.title` — `title` attribute’u, yoksa `label` kullanılır.
- **Dönüş**: `JSX.Element` (chip butonu döner).

### [N10_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_10
- **params**: `opt` — option nesnesi (`{ value, label }`)
- **ic_degiskenler**:
  - `opt.value` — `<option>` elementinin `value` attribute’u.
  - `opt.label` — `<option>` elementinin gösterilen metni.
- **Dönüş**: `JSX.Element` (basit `<option>` elementi döner).

### [N11_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_11
- **params**: `tog` — toggle nesnesi (`{ key, label, checked, onChange, ... }`)
- **ic_degiskenler**:
  - `tog.key` — `key` attribute’u.
  - `tog.label` — gösterilen metin.
  - `tog.checked` — `Switch.Root`’un `checked` prop’u.
  - `tog.onChange` — toggle değiştiğinde çağrılan fonksiyon.
- **Dönüş**: `JSX.Element` (küçük stilli toggle UI’si döner).

### [N12_NASIL] AST Pointer: src/components/admin/AdminToolbar.tsx::anonymous_12
- **params**: `ch` — chip nesnesi (`{ key, label, active, onToggle, classOn, classOff, ... }`)
- **ic_degiskenler**:
  - `ch.key` — `key` attribute’u.
  - `ch.label` — buton içindeki metin.
  - `ch.active` — chip’in aktif olup olmadığını gösterir.
  - `ch.onToggle` — tıklandığında çalıştırılan fonksiyon.
  - `ch.classOn` / `ch.classOff` — aktif/pasif durumdaki CSS sınıfları.
  - `defaultChipOn` / `defaultChipOff` — varsayılan sınıflar (bileşen içinde tanımlı).
- **Dönüş**: `JSX.Element` (chip butonu döner).

---

## NODE ID STANDARD

  file: src\components\admin\AdminToolbar.tsx
  function: src\components\admin\AdminToolbar.tsx::AdminToolbar

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminToolbar
  export: AdminToolbarChip
  export: AdminToolbarProps
  export: AdminToolbarSelectOption
  export: AdminToolbarToggle

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-rose-500`, `bg-surface-deep`, `bg-surface-deep/20`, `bg-surface-deep/40`, `bg-transparent`, `bg-white`, `bg-white/10`, `bg-white/3`, `bg-white/5`, `border-cyan-400`, `border-l`, `border-surface-deep`, `border-t`, `border-white/10`
- **Layout:** `${sticky`, `-right-1`, `-top-1`, `absolute`, `backdrop-blur-2xl`, `block`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-2`, `gap-2.5`, `gap-3`, `gap-4`, `gap-5`
- **Varyant/Responsive:** `:`, `data-[state=checked]:`, `focus-visible:`, `group-focus-within:`, `hover:`, `lg:`, `md:`, `placeholder:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminSelectClass`, `${ch.active`, `${className`, `-translate-y-1/2`, `:`, `animate-in`, `border`, `ch.classOff`, `ch.classOn`, `cursor-pointer`, `data-[state=checked]:translate-x-3.5`, `data-[state=checked]:translate-x-4.5`, `defaultChipOff`, `defaultChipOn`