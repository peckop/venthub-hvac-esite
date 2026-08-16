---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\shell\AdminThemeToggle.tsx
skeleton_hash: e2b2cb0dd23011fc
entity_hashes:
  func:AdminThemeToggle: e27d349beb646303
  overview: 533c54235c34a80a
  style_tokens: 7643397d069ce23f
generated_at: 2026-08-15T19:08:10Z
---

## Genel Bakış
AdminThemeToggle, admin panelinde tema tercihini (açık/koyu mod) yönetmek için kullanılan bir React bileşenidir. Bileşen, dışarıdan gelen mevcut tercihi gösterir ve kullanıcı etkileşimiyle yeni tercihi üst bileşene geri çağırarak tema değişimini tetikler. Salt sunum (pure presentational) bir yapıya sahiptir.

## Fonksiyon Grupları
### Tema Seçimi ve Etkileşim
Mevcut tema durumunu (açık veya koyu) görsel bir anahtar/düğme aracılığıyla sunar ve kullanıcı tıklaması ile tercih değiştirme işlemini üst bileşene iletir.
- AdminThemeToggle

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel aksiyomlar fonksiyon imzasından ve modül sabitlerinden çıkarılmıştır.

[Aksiyom 1]: Eğer `onPreferenceChange` fonksiyonu verilmemiş veya çağrılamıyorsa, kullanıcı tema tercihi değiştirdiğinde üst bileşene bildirim yapılamaz ve tema geçişi gerçekleşmez.

[Aksiyom 2]: Eğer `preference` değeri `OPTIONS` dizisindeki geçerli bir değerle eşleşmiyorsa, bileşen hangi temanın aktif olduğunu bilemez ve tutarsız bir görünüm oluşturulur.

[Aksiyom 3]: Eğer `OPTIONS` dizisi boş veya tanımsızsa, bileşen kullanıcıya sunulacak geçerli tema seçenekleri olmadığından düzgün şekilde render edilemez.

---

## FONKSİYON DETAYLARI

### AdminThemeToggle
**Ne yapar**: Bu bileşen, yöneticilerin kullanım arayüzü temasını (ör. açık, koyu veya sistem tercihi) tercih etmelerini sağlayan bir tema seçici arayüz sunar. Tercihin mevcut durumunu görüntüler ve kullanıcı etkileşimiyle yeni bir tercih seçildiğinde üst bileşene bildirimde bulunur.

**Nasıl yapar**: Bileşen, `preference` prop'undan mevcut tema tercihini okur ve bunu arayüzde (muhtemelen bir açılır menü, radyo butonları veya geçiş anahtarı olarak) görüntüler. Kullanıcı etkileşimi sonucunda (ör. bir butona tıklama) `onPreferenceChange` callback fonksiyonunu çağırarak seçilen yeni tercihi (`'light'`, `'dark'` veya `'system'` gibi bir değer) üst bileşene iletir. Bu, kontrollü (controlled) bir bileşen modeliyle çalışır; bileşen kendi iç durumunu yönetmez, tüm durum üst bileşen tarafından sağlanır ve güncellenir. JSX ile interaktif bir arayüz döndürür.

**Parametreler**:
- preference: `string | undefined` — Bileşenin şu an görüntülemesi gereken aktif tema tercihini belirtir. Geçerli değerler projenin tema yapılandırmasına bağlı olarak genellikle `'light'`, `'dark'` veya `'system'` gibi string'lerdir. Undefined olması, henüz bir tercihin seçilmediği anlamına gelebilir.
- onPreferenceChange: `(preference: string) => void` — Kullanıcı tarafından yeni bir tema tercihi seçildiğinde çağrılan callback fonksiyonu. Fonksiyon, seçilen yeni tercihi (bir string) parametre olarak alır ve bunu üst bileşene iletir. Bu, durumun (state) üst bileşende güncellenmesini sağlar.

**Dönüş**: `React.FC<AdminThemeToggleProps>` — Bu bir React fonksiyonel bileşenidir. Verilen `AdminThemeToggleProps` tipindeki özelliklere (prop) sahip bir JSX yapısı (arayüz) döndürür. Bileşen, tercih gösterimi ve etkileşim için gerekli HTML ve/veya UI kütüphanesi bileşenlerini oluşturur.

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
  { value: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/AdminThemeToggle.tsx::AdminThemeToggle
- **params**:
  - `preference` — mevcut tema tercihi (AdminThemePreference), hangi ikonun aktif olduğunu belirler
  - `onPreferenceChange` — tema tercihi değiştiğinde çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; UI metinlerini lokalize eder (`t('admin.theme.label')`, `t(labelKey)` çağrılarında kullanılır)
  - `ActiveIcon` — `OPTIONS.find()` ile `preference` değerine karşılık gelen `Icon` bileşenini bulur; eşleşme yoksa `Sun` ikonuna fallback yapar; buton içinde render edilir
- **Dönüş**: JSX — `DropdownMenu.Root` içine yerleştirilmiş tam bir dropdown menü yapısı; buton tetikleyici, portal içeriği ve radio group içerir

---

### [N2_NASIL] AST Pointer: src/components/admin/shell/AdminThemeToggle.tsx::(OPTIONS.map callback)
- **params**:
  - `value` — seçeneğin değeri (light/dark/system gibi AdminThemePreference union üyesi); `DropdownMenu.RadioItem`'a `value` olarak bağlanır
  - `labelKey` — çeviriden geçirilecek metin anahtarı; `t(labelKey)` ile ekranda gösterilir
  - `Icon` — seçeneğin ikon bileşeni (Sun/Moon/Laptop); RadioItem içinde 15px boyutla render edilir
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `DropdownMenu.RadioItem`; ikon, çevrilmiş etiket ve aktif işareti (`Check`) içeren tek bir menü satırı

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