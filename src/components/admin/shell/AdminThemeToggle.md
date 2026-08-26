---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\shell\AdminThemeToggle.tsx
skeleton_hash: 9befd2f13575812f
entity_hashes:
  func:AdminThemeToggle: f21b10a6ba1e52f0
  overview: dedcbc8c954b1cae
  style_tokens: 7643397d069ce23f
generated_at: 2026-08-26T07:13:16Z
---

## Genel Bakış
AdminThemeToggle, admin panelinde tema tercihini (açık/koyu mod) yönetmek için kullanılan bir React bileşenidir. Bileşen, dışarıdan gelen mevcut tercihi gösterir ve kullanıcı etkileşimiyle yeni tercihi üst bileşene geri çağırarak tema değişimini tetikler. Salt sunum (pure presentational) bir yapıya sahiptir ve kendi içinde durum tutmaz.

## Fonksiyon Grupları
### Tema Seçimi ve Etkileşim
Mevcut tema durumunu (açık veya koyu) görsel bir arayüz elemanı aracılığıyla sunar ve kullanıcı etkileşimiyle tercih değiştirme işlemini üst bileşene iletir.
- AdminThemeToggle

## Bağımlılıklar ve Mimari Önem
### İç Bağımlılıklar
Modül tek bir bileşenden oluştuğu için iç bağımlılık bulunmamaktadır.

### Dış Bağımlılıklar
Bileşen, React kütüphanesine ve muhtemelen bazı temel UI bileşenlerine (detay verilmemiş) bağlıdır. Ayrıca, çalışması için üst bileşen tarafından sağlanan `preference` ve `onPreferenceChange` prop'larına ihtiyaç duyar.

### Dinamik/Lazy Yüklenen Modüller
Bu modül için dinamik veya lazy yükleme bilgisi bulunmamaktadır.

### Mimari Önem
Admin panelinin kullanıcı deneyimini doğrudan etkileyen tema yönetimini sağlayan temel bir sunum bileşenidir. Salt sunum yapısı sayesinde kolayca test edilebilir ve yeniden kullanılabilir.

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `preference` prop'u sağlanmazsa, bileşen mevcut tema durumunu (açık/koyu) görsel olarak gösteremez; hangi seçeneğin aktif olduğu belirlenemez.

[Aksiyom 2]: Eğer `onPreferenceChange` callback'i sağlanmazsa, kullanıcı bir tema seçeneğine tıkladığında yeni tercih üst bileşene iletilemez; tema değişimi tetiklenemez.

[Aksiyom 3]: Eğer `OPTIONS` sabiti tanımlı değilse, bileşenin sunacağı tema seçenekleri (açık/koyu mod) belirlenemez; render edilecek düğme/anahtar listesi oluşturulamaz.

---

## FONKSİYON DETAYLARI

### AdminThemeToggle
**Ne yapar**: Bu fonksiyon, yönetici arayüzünde tema (örneğin koyu veya açık mod) tercihini değiştirmek için kullanılan bir React bileşeni tanımlar. Bileşen, mevcut tema tercihini görüntüler ve kullanıcının bu tercihi değiştirmesine olanak tanır.

**Nasıl yapar**: Fonksiyon, bir React fonksiyonel bileşeni olarak çalışır. Bileşen, `preference` prop'u aracılığıyla mevcut tema tercihini alır ve `onPreferenceChange` prop'u aracılığıyla tercih değişikliklerini üst bileşene bildirir. Bileşenin iç mantığı ve kullanıcı arayüzü detayları kaynak kodda belirtilmemiştir.

**Parametreler**:
- preference: bilinmiyor — Bileşenin görüntüleyeceği ve kullanıcının değiştirebileceği mevcut tema tercihini temsil eder. Tip bilgisi verilmemiştir.
- onPreferenceChange: bilinmiyor — Kullanıcı tema tercihini değiştirdiğinde çağrılacak olan geri çağırma (callback) fonksiyonudur. Tip bilgisi verilmemiştir.

**Dönüş**: `React.FC<AdminThemeToggleProps>` — Fonksiyon, `AdminThemeToggleProps` arayüzünü (interface) kullanan bir React fonksiyonel bileşeni döndürür. Bu arayüzün yapısı kaynakta tanımlanmamıştır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../i18n/I18nProvider::useI18n
- import: ./themeCookie::type { AdminThemePreference }
- import: @radix-ui/react-dropdown-menu
- import: lucide-react::Check
- import: lucide-react::Laptop
- import: lucide-react::Moon
- import: lucide-react::Sun
- import: react::React

---

## INTERFACES

### AdminThemeToggleProps
TEMA SEÇİCİ — açık / koyu / sistem Neden üç seçenek ve neden açılır menü: - İki durumlu bir düğme "sistem"i ifade edemez; kullanıcının işletim sistemi tercihine uyma isteği ayrı bir niyettir, açık/koyu ile aynı eksende değildir. - Üç durumlu bir düğmeyi TIKLAYARAK DÖNDÜRMEK (cycle) erişilebilir deği
- `preference: AdminThemePreference`
- `onPreferenceChange: (next: AdminThemePreference) => void`

---

## SABİTLER
- **OPTIONS** (array) — `[
  { value: 'light', labelKey: 'admin.theme.light', Icon: Sun },
  { value...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/AdminThemeToggle.tsx::AdminThemeToggle
- **params**:
  - `preference` — mevcut tema tercihi (`AdminThemePreference` tipinde); hangi ikonun aktif gösterileceğini ve radyo grubunda hangi seçeneğin seçili olacağını belirler
  - `onPreferenceChange` — tema tercihi değiştiğinde çağrılan geri çağırma fonksiyonu; `DropdownMenu.RadioGroup`'un `onValueChange` içinde `v as AdminThemePreference` ile tür dönüşümü yapılarak çağrılır
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `aria-label` ve menü öğesi etiketlerini yerelleştirmek için kullanılır
  - `ActiveIcon` — `OPTIONS` dizisinde `o.value === preference` koşulunu sağlayan öğenin `Icon` özelliği; eşleşme bulunamazsa `Sun` ikonuna düşer (nullish coalescing `??`); düğme içinde `<ActiveIcon size={18} />` olarak render edilir
- **Dönüş**: JSX — `DropdownMenu.Root` ile sarılmış bir dropdown menü ağacı; tetikleyici olarak `data-testid="admin-theme-toggle"` ve `aria-label` taşıyan bir `<button>`, içerik olarak `OPTIONS` dizisi üzerinde `.map()` ile üretilmiş radyo öğeleri listesi

---

### [N2_NASIL] AST Pointer: src/components/admin/shell/AdminThemeToggle.tsx::OPTIONS.map callback
- **params**:
  - `value` — `OPTIONS` dizisindeki bir öğenin tema değeri; `DropdownMenu.RadioItem`'ın `key` ve `value` prop'larına atanır
  - `labelKey` — `OPTIONS` dizisindeki bir öğenin çeviri anahtarı; `t(labelKey)` ile yerelleştirilmiş etiket metni elde edilir
  - `Icon` — `OPTIONS` dizisindeki bir öğenin lucide-react ikon bileşeni; `<Icon size={15} />` olarak render edilir
- **ic_degiskenler**: yok — fonksiyon gövdesinde yalnızca JSX üretimi yapılır, ek değişken tanımlanmaz
- **Dönüş**: JSX — tek bir `DropdownMenu.RadioItem` öğesi; içinde ikon (`Icon`), yerelleştirilmiş etiket (`t(labelKey)`) ve seçili durum göstergesi (`DropdownMenu.ItemIndicator` içinde `Check` ikonu) barındırır

---

## NODE ID STANDARD

  file: src\components\admin\shell\AdminThemeToggle.tsx
  function: src\components\admin\shell\AdminThemeToggle.tsx::AdminThemeToggle

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminThemeToggle

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `border-admin-border`, `data-[highlighted]:bg-admin-surface-2`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-sm`
- **Layout:** `flex`, `flex-1`, `gap-2`, `h-9`, `inline-flex`, `items-center`, `justify-center`, `min-w-admin-menu`, `p-1`, `shadow-admin-overlay`, `w-9`, `z-popover`
- **Varyant/Responsive:** `data-[highlighted]:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `border`, `cursor-pointer`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-ring`, `focus-visible:ring-offset-2`, `focus-visible:ring-offset-admin-surface`, `outline-none`, `px-2`, `py-1.5`, `rounded-admin-md`, `rounded-admin-sm`, `select-none`, `transition-colors`