---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\checkout\SecurePaymentOverlay.tsx
skeleton_hash: cc3a2247b73d603d
entity_hashes:
  func:SecurePaymentOverlay: 2034f9e5c072e96b
  overview: abfd0850fbcc2e8a
  style_tokens: 5b40eb77343c895c
generated_at: 2026-08-25T07:31:50Z
---

## Genel Bakış

SecurePaymentOverlay modülü, ödeme süreci sırasında kullanıcıya gösterilen güvenli ödeme katmanını (overlay) oluşturan bir React bileşenidir. Bileşen, ödeme adımını, ilerleme yüzdesini ve görünürlük durumunu dışarıdan aldığı proplar aracılığıyla kontrol eder. Uluslararasılaştırma desteği sağlanmış olup `t` fonksiyonu aracılığıyla metinlerin çevrilmesine olanak tanır.

## Fonksiyon Grupları

### Bileşen

Tek bir bileşenden oluşan modül, ödeme akışı sırasında ekrana binen overlay katmanını yönetir. Görünürlük durumu, mevcut ödeme adımı ve yüzdeler bazlı ilerleme bilgisi gibi dışsal durumları props olarak alır ve buna göre kullanıcı arayüzünü render eder.

- SecurePaymentOverlay

## Bağımlılıklar

Modül, dışsal bir bağımlılık listesi verilmemiştir. Ancak `t` prop'u uluslararasılaştırma (i18n) katmanına işaret ettiğinden, üst bileşenin bir çeviri sağlayıcısından beslenmesi beklenir. Bileşenin kendisi durumsuz (stateless) görünmektedir; tüm durum bilgisi dışarıdan props aracılığıyla gelir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir; yalnızca fonksiyon imzası mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesindeki mantıksal bağımlılıklardan türetilebilir. Props tanımları tek başına bir bileşenin iç davranışını belirlemez.

---

## FONKSİYON DETAYLARI

### SecurePaymentOverlay
**Ne yapar**: Güvenli ödeme işlemini gösteren bir React bileşeni oluşturur. Bileşen, ödeme sürecinin görünürlüğünü, mevcut adımını, ilerleme yüzdesini ve çeviri fonksiyonunu props olarak alır ve buna uygun bir ödeme arayüzü render eder.

**Nasıl yapar**: Fonksiyon, props parametrelerini destructuring yöntemiyle ayırır ve `React.FC<SecurePaymentOverlayProps>` tipinde bir fonksiyonel bileşen döndürür. Bileşen, `overlayVisible` prop'u ile kontrol edilen bir overlay (katman) yapısı kullanarak ödeme sürecinin farklı adımlarını ve ilerleme durumunu kullanıcıya sunar. `overlayStep` mevcut ödeme adımını, `overlayPercent` ise işlemin tamamlanma yüzdesini belirtir. `t` fonksiyonu aracılığıyla çoklu dil desteği sağlanır.

**Parametreler**:
- overlayVisible: bilinmiyor — Ödeme overlay'inin görünür olup olmadığını kontrol eden değer
- overlayStep: bilinmiyor — Ödeme sürecinin mevcut adımını belirten değer
- overlayPercent: bilinmiyor — Ödeme işleminin tamamlanma yüzdesini gösteren değer
- t: bilinmiyor — Çoklu dil desteği için çeviri fonksiyonu

**Dönüş**: `React.FC<SecurePaymentOverlayProps>` — SecurePaymentOverlayProps tipinde props alan bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: lucide-react::Lock
- import: react::React

---

## INTERFACES

### SecurePaymentOverlayProps
- `overlayVisible: boolean`
- `overlayStep: number`
- `overlayPercent: number`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/checkout/SecurePaymentOverlay.tsx::SecurePaymentOverlay
- **params**:
  - `overlayVisible` — overlay'in gösterilip gösterilmeyeceğini belirten boolean değer
  - `overlayStep` — ödeme aşamasını gösteren sayı (1, 2 veya 3 değerleriyle koşullu render yapılır)
  - `overlayPercent` — ilerleme çubuğunun yüzde genişliği olarak kullanılan sayısal değer
  - `t` — çeviri fonksiyonu, `t('checkout.overlay.dialogLabel')` gibi anahtarlarla metinleri getirir
- **ic_degiskenler**:
  - `overlayVisible` — `if (!overlayVisible) return null` koşulunda kontrol edilir; false ise fonksiyon null döner
  - `overlayStep` — header kısmında `overlayStep === 1`, `overlayStep === 2`, `overlayStep === 3` koşullarıyla durum metni seçilir; body kısmında `overlayStep >= 1`, `overlayStep >= 2`, `overlayStep >= 3` koşullarıyla aşama göstergelerinin stili belirlenir
  - `overlayPercent` — `style={{ width: \`${overlayPercent}%\` }}` ifadesinde ilerleme çubuğunun genişliği olarak kullanılır
  - `t` — `t('checkout.overlay.dialogLabel')`, `t('checkout.overlay.header')`, `t('checkout.overlay.starting')`, `t('checkout.overlay.secureForm')`, `t('checkout.overlay.bank3d')`, `t('checkout.securePayment.brand')`, `t('checkout.securePayment.iyzicoSecure')`, `t('checkout.overlay.stageInit')`, `t('checkout.overlay.stageForm')`, `t('checkout.overlay.stageBank')`, `t('checkout.overlay.dontClose')` çağrılarıyla çeviri metinleri alınır
  - `Lock` — `lucide-react`'ten import edilen ikon bileşeni; header içinde `<Lock className="text-primary-navy" size={18} />` olarak render edilir
- **Dönüş**: `overlayVisible` false ise `null`, aksi halde tam sayfa overlay JSX yapısı (dialog bileşeni, spinner, ilerleme çubuğu ve aşama göstergeleri içerir)

---

## NODE ID STANDARD

  file: SecurePaymentOverlay.tsx
  function: SecurePaymentOverlay.tsx::SecurePaymentOverlay

---

## DISA AKTARILANLAR (EXPORTS)
  export: SecurePaymentOverlay

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/35`, `bg-gradient-to-r`, `bg-light-gray/70`, `bg-primary-navy/10`, `bg-white/80`, `bg-white/85`, `bg-white/90`, `border-2`, `border-b`, `border-light-gray/60`, `border-primary-navy`, `border-t-transparent`, `border-white/60`, `from-primary-navy`, `text-center`
- **Layout:** `backdrop-saturate-150`, `fixed`, `flex`, `from-primary-navy`, `gap-3`, `grid`, `grid-cols-3`, `h-12`, `h-2`, `h-9`, `h-full`, `items-center`, `justify-between`, `justify-center`, `max-w-xl`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${overlayStep`, `1`, `2`, `3`, `:`, `>=`, `animate-spin`, `border`, `duration-500`, `font-medium`, `font-semibold`, `inset-0`, `md:px-8`, `mt-3`, `mt-4`