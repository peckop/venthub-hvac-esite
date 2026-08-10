---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\AdminToolbar.tsx
skeleton_hash: ce976823bc22f126
entity_hashes:
  func:AdminToolbar: af143a8f279e1c1e
  overview: f526ba131742fbc5
  style_tokens: f914d27adccfd567
generated_at: 2026-06-19T20:47:20Z
---

## Genel Bakış
VentHub HVAC yönetim paneli için tasarlanmış çok bileşenli bir araç çubuğu React bileşenidir. Arama, seçim, filtre çipleri, toggle kontrolleri ve temizleme gibi çeşitli kontrol mekanizmalarını tek bir entegre banner'da birleştirerek yöneticilerin verilerini verimli bir şekilde filtrelemesini ve izlemesini sağlar.

## Fonksiyon Grupları
### Yönetim Araç Çubuğu Bileşeni
Yönetim panelinin üst bölgesinde konumlanan, kullanıcının arama yapmasına, filtre uygulamasına ve mevcut durumu görsel olarak takip etmesine olanak tanıyan ana bileşendir. Tüm kontrol parametreleri opsiyonel olup, verilen prop'lara göre dinamik olarak render edilir.
- AdminToolbar

---

## AXIOMS – Mimari Varsayımlar

Bu modül, prop'ları aracılığıyla filtreleme ve durum gösterimi yapan bir React bileşenidir.

[Aksiyom 1]: Eğer `onClear` callback fonksiyonu sağlanmazsa, temizleme butonu işlevsiz kalır veya bileşen hata verir.

[Aksiyom 2]: Eğer `recordCount` sayısal bir değer olarak sağlanmazsa, kayıt sayacı gösterimi tutarsız veya boş kalır.

[Aksiyom 3]: Eğer `search` prop'u sağlanmazsa, arama kutusu bileşende görünmez veya devre dışı kalır.

[Aksiyom 4]: Eğer `select` prop'u sağlanmazsa, seçim dropdown'ı bileşende görünmez veya devre dışı kalır.

[Aksiyom 5]: Eğer `chips` prop'u sağlanmazsa, etiket tabanlı filtreleme çipleri bileşende görünmez.

[Aksiyom 6]: Eğer `toggles` prop'u sağlanmazsa, durum anahtarı (toggle) kontrolleri bileşende görünmez.

[Aksiyom 7]: Eğer `rig` prop'u sağlanmazsa, bileşen hangi yapılandırma veya bağlamda çalıştığını bilemez.

[Aksiyom 8]: Eğer hiçbir prop sağlanmazsa, bileşen boş veya işlevsiz bir araç çubuğu render eder (tüm kontroller gizli kalır).

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

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/format::formatNumber
- import: ../../utils/adminUi::adminSelectClass
- import: ../../utils/adminUi::adminSelectStyle
- import: @radix-ui/react-switch
- import: lucide-react::Search
- import: lucide-react::SlidersHorizontal
- import: react::React
- import: react::useEffect
- import: react::useRef
- import: react::useState

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

### [N1_NASIL] AST Pointer: AdminToolbar.tsx::useEffect_cleanup_handler
- **params**: ()
- **ic_degiskenler**:
  - `handleKeyDown` — '/' tuşuna basıldığında search input'a odaklanan klavye olay handler'ı
- **Dönüş**: Temizlik fonksiyonu (window.removeEventListener)

### [N2_NASIL] AST Pointer: AdminToolbar.tsx::handleKeyDown
- **params**: (e: KeyboardEvent)
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: AdminToolbar.tsx::hydrationEffect
- **params**: ()
- **ic_degiskenler**:
  - `enable` — persist ayarlarına göre hangi bileşenlerin localStorage'dan okunacağını belirleyen nesne
  - `raw` — localStorage'dan okunan ham JSON string
  - `saved` — parse edilmiş localStorage verisi (search, select, chips, toggles durumları)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: AdminToolbar.tsx::chipsHydrationCallback
- **params**: (ch)
- **ic_degiskenler**:
  - `want` — saved.chips[ch.key] değerinden gelen boolean, chip'in beklenen aktif durumu
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: AdminToolbar.tsx::togglesHydrationCallback
- **params**: (t)
- **ic_degiskenler**:
  - `want` — saved.toggles[t.key] değerinden gelen boolean, toggle'ın beklenen checked durumu
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: AdminToolbar.tsx::persistenceEffect
- **params**: ()
- **ic_degiskenler**:
  - `enable` — persist ayarlarına göre hangi bileşenlerin localStorage'a kaydedileceğini belirleyen nesne
  - `payload` — localStorage'a kaydedilecek veri yapısı (search, select, chips, toggles durumları)
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: AdminToolbar.tsx::renderDesktopSelectOption
- **params**: (opt)
- **ic_degiskenler**: yok
- **Dönüş**: React option elementi (value ve label ile)

### [N8_NASIL] AST Pointer: AdminToolbar.tsx::renderDesktopToggle
- **params**: (tog)
- **ic_degiskenler**: yok
- **Dönüş**: React Switch.Root ve Switch.Thumb elementlerini içeren div

### [N9_NASIL] AST Pointer: AdminToolbar.tsx::renderDesktopChip
- **params**: (ch)
- **ic_degiskenler**: yok
- **Dönüş**: React button elementi (onToggle handler ile)

### [N10_NASIL] AST Pointer: AdminToolbar.tsx::renderMobileSelectOption
- **params**: (opt)
- **ic_degiskenler**: yok
- **Dönüş**: React option elementi (value ve label ile)

### [N11_NASIL] AST Pointer: AdminToolbar.tsx::renderMobileToggle
- **params**: (tog)
- **ic_degiskenler**: yok
- **Dönüş**: React Switch.Root ve Switch.Thumb elementlerini içeren div

### [N12_NASIL] AST Pointer: AdminToolbar.tsx::renderMobileChip
- **params**: (ch)
- **ic_degiskenler**: yok
- **Dönüş**: React button elementi (onToggle handler ile)

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