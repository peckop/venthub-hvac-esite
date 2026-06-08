---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminToolbar.tsx
skeleton_hash: dc29fcff3f4f6059
entity_hashes:
  func:AdminToolbar: af143a8f279e1c1e
  overview: 8e2c297879e66d13
  style_tokens: f914d27adccfd567
generated_at: 2026-06-08T10:08:36Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim paneli için tasarlanmış çok amaçlı bir araç çubuğu bileşenidir. Arama, çoklu seçim, etiket tabanlı filtreleme ve durum anahtarı gibi kontrolleri tek bir üst banner'da birleştirerek kullanıcıların verilerini hızlıca filtrelemesini ve yönetmesini sağlar.

## Fonksiyon Grupları
### Yönetim Paneli Araç Çubuğu
Yönetim arayüzünün üst kısmında konumlanan, arama kutusu, seçim dropdown'ı, aktif filtre çipleri, durum toggle'ları, temizleme butonu ve kayıt sayacı gibi tüm filtreleme ve durum bileşenlerini bir arada sunan kapsamlı bir React bileşenidir.
- AdminToolbar

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yönetim paneli araç çubuğu filtre ve durum bileşenidir. Aşağıda props yapılarına dayalı mimari varsayımlar listelenmektedir.

**[Aksiyom 1]**: Eğer `search` prop'u verilmezse, arama input alanı render edilmez ve kullanıcı metin tabanlı filtreleme yapamaz.

**[Aksiyom 2]**: Eğer `select` prop'u verilmezse, seçim dropdown/listesi render edilmez ve çoklu seçim filtresi devre dışı kalır.

**[Aksiyom 3]**: Eğer `chips` prop'u verilmezse, aktif filtre etiketleri (chip bileşenleri) gösterilmez ve filtre durumu görsel olarak sunulmaz.

**[Aksiyom 4]**: Eğer `toggles` prop'u verilmezse, açma/kapama (toggle) kontrolleri render edilmez ve Boolean türündeki filtreler değiştirilemez.

**[Aksiyom 5]**: Eğer `onClear` callback'i verilmezse, "Filtreleri Temizle" butonu gösterilmez; çünkü tetiklenecek bir işlev mevcut değildir.

**[Aksiyom 6]**: Eğer `recordCount` prop'u verilmezse, toplam/kalan kayıt sayısı bilgisi araç çubuğunda gösterilmez.

**[Aksiyom 7]**: `rig` prop'u için varsayılan değer belirsizdir — eğer bu prop zorunlu bir yapıya sahipse ve verilmezse, bileşen hata üretir veya beklenmedik davranış gösterir.

> **Not**: Fonksiyon imzasında default değer tanımları bulunmamaktadır; bu nedenle tüm prop'lar opsiyonel mi yoksa zorunlu mu oldukları kesin olarak belirlenememiştir. Çalışma zamanı davranışı uygulama tarafında tanımlıdır.

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

### [N1_NASIL] AST Pointer: AdminToolbar.tsx::useEffectKeydown
- **params**: ()
- **ic_degiskenler**:
  - `handleKeyDown` — "/" tuşuna basıldığında search inputuna odaklanmayı sağlayan event handler fonksiyonu
  - `search` — search prop'unun varlığını kontrol eder, yoksa fonksiyon erken döner
  - `inputRef` — search inputuna referans, current?.focus() ile odaklanmayı sağlar
- **Dönüş**: temizleme fonksiyonu (window.removeEventListener ile event listener kaldırır)

### [N2_NASIL] AST Pointer: AdminToolbar.tsx::handleKeyDown
- **params**: (e: KeyboardEvent)
- **ic_degiskenler**:
  - `e.key` — klavye basma olayının tuş değerini tutar, "/" kontrolü yapılır
  - `document.activeElement?.tagName` — aktif elementin tag adı, INPUT veya TEXTAREA olmama kontrolü
  - `inputRef.current` — search input DOM elementi, focus() ile odaklanır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AdminToolbar.tsx::useEffectHydrate
- **params**: ()
- **ic_degiskenler**:
  - `storageKey` — localStorage'da kullanılacak benzersiz depolama anahtarı
  - `persist` — hangi özelliklerin kalıcı olacağını belirten obje (search, select, chips, toggles)
  - `enable` — persist ayarlarından türetilen aktif özellikler objesi
  - `raw` — localStorage'dan okunan ham JSON string
  - `saved` — raw string'in parse edilmiş hali, search/select/chips/toggles değerlerini içerir
  - `hydratedRef.current` — hydration process'in tamamlanma durumu flag'i
  - `select` — select prop'u, value ve onChange metodunu içerir
  - `chips` — chips prop dizisi, her chip'in key, active, onToggle metodlarını içerir
  - `toggles` — toggles prop dizisi, her toggle'ın key, checked, onChange metodlarını içerir
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AdminToolbar.tsx::hydrateChipsCallback
- **params**: (ch)
- **ic_degiskenler**:
  - `ch.key` — chip'in benzersiz tanımlayıcısı
  - `saved.chips` — kaydedilmiş chip durumları objesi, key -> boolean değer eşlemesi
  - `want` — kaydedilmiş chip durumu (true/false veya undefined)
  - `ch.active` - chip'in mevcut aktif durumu
  - `ch.onToggle` — chip'in durumunu değiştiren callback fonksiyon
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AdminToolbar.tsx::hydrateTogglesCallback
- **params**: (t)
- **ic_degiskenler**:
  - `t.key` — toggle'ın benzersiz tanımlayıcısı
  - `saved.toggles` — kaydedilmiş toggle durumları objesi, key -> boolean değer eşlemesi
  - `want` — kaydedilmiş toggle durumu (true/false veya undefined)
  - `t.checked` — toggle'ın mevcut checked durumu
  - `t.onChange` — toggle'ın durumunu değiştiren callback fonksiyon
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: AdminToolbar.tsx::useEffectPersist
- **params**: ()
- **ic_degiskenler**:
  - `storageKey` — localStorage'da kullanılacak benzersiz depolama anahtarı
  - `hydratedRef.current` — hydration tamamlanmadıysa persist etmez
  - `persist` — hangi özelliklerin kalıcı olacağını belirten obje
  - `enable` — persist ayarlarından türetilen aktif özellikler objesi
  - `payload` — localStorage'a kaydedilecek veri objesi
  - `select` — select prop'u, value değeri payload'a eklenir
  - `chips` — chips prop dizisi, Object.fromEntries ile key->active eşlemesine dönüştürülür
  - `toggles` — toggles prop dizisi, Object.fromEntries ile key->checked eşlemesine dönüştürülür
  - `localStorage.setItem` — localStorage'a JSON string olarak kaydeder
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AdminToolbar.tsx::renderOptionDesktop
- **params**: (opt)
- **ic_degiskenler**:
  - `opt.value` — option elementinin value değeri
  - `opt.label` — option elementinin görünen metin değeri
- **Dönüş**: JSX option elementi (bg-surface-deep, text-white, font-medium sınıflarıyla)

### [N8_NASIL] AST Pointer: AdminToolbar.tsx::renderToggleDesktop
- **params**: (tog)
- **ic_degiskenler**:
  - `tog.key` — toggle'ın benzersiz tanımlayıcısı, React key olarak kullanılır
  - `tog.label` — toggle'ın görünen etiket metni
  - `tog.checked` — toggle'ın checked durumu, Switch.Root bileşenine aktarılır
  - `tog.onChange` — toggle durumu değiştiğinde çağrılan callback
  - `tog.title` — opsiyonel title attribute'u, aria-label olarak kullanılır
- **Dönüş**: JSX div elementi (Switch bileşenini içeren toggle kontrolü)

### [N9_NASIL] AST Pointer: AdminToolbar.tsx::renderChipDesktop
- **params**: (ch)
- **ic_degiskenler**:
  - `ch.key` — chip'in benzersiz tanımlayıcısı, React key olarak kullanılır
  - `ch.label` — chip'in görünen metin değeri
  - `ch.active` — chip'in aktif durumu, CSS sınıflarını belirler
  - `ch.onToggle` — chip'e tıklandığında çağrılan callback
  - `ch.classOn` — aktif durum için özel CSS sınıfı
  - `ch.classOff` — inaktif durum için özel CSS sınıfı
  - `ch.title` — opsiyonel title attribute'u
  - `defaultChipOn` — aktif durum için varsayılan CSS sınıfı
  - `defaultChipOff` — inaktif durum için varsayılan CSS sınıfı
- **Dönüş**: JSX button elementi (chip kontrolü)

### [N10_NASIL] AST Pointer: AdminToolbar.tsx::renderOptionMobile
- **params**: (opt)
- **ic_degiskenler**:
  - `opt.value` — option elementinin value değeri
  - `opt.label` — option elementinin görünen metin değeri
- **Dönüş**: JSX option elementi (bg-surface-deep sınıfıyla)

### [N11_NASIL] AST Pointer: AdminToolbar.tsx::renderToggleMobile
- **params**: (tog)
- **ic_degiskenler**:
  - `tog.key` — toggle'ın benzersiz tanımlayıcısı, React key olarak kullanılır
  - `tog.label` — toggle'ın görünen etiket metni
  - `tog.checked` — toggle'ın checked durumu, Switch.Root bileşenine aktarılır
  - `tog.onChange` — toggle durumu değiştiğinde çağrılan callback
- **Dönüş**: JSX div elementi (Switch bileşenini içeren mobil toggle kontrolü)

### [N12_NASIL] AST Pointer: AdminToolbar.tsx::renderChipMobile
- **params**: (ch)
- **ic_degiskenler**:
  - `ch.key` — chip'in benzersiz tanımlayıcısı, React key olarak kullanılır
  - `ch.label` — chip'in görünen metin değeri
  - `ch.active` — chip'in aktif durumu, CSS sınıflarını belirler
  - `ch.onToggle` — chip'e tıklandığında çağrılan callback
  - `ch.classOn` — aktif durum için özel CSS sınıfı
  - `ch.classOff` — inaktif durum için özel CSS sınıfı
  - `defaultChipOn` — aktif durum için varsayılan CSS sınıfı
  - `defaultChipOff` — inaktif durum için varsayılan CSS sınıfı
- **Dönüş**: JSX button elementi (mobil chip kontrolü)

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