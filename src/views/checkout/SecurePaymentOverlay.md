---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\checkout\SecurePaymentOverlay.tsx
skeleton_hash: 85f100f9701faee6
entity_hashes:
  func:SecurePaymentOverlay: 2034f9e5c072e96b
  overview: abfd0850fbcc2e8a
  style_tokens: 5b40eb77343c895c
generated_at: 2026-06-14T17:51:42Z
---

## Genel Bakış
VentHub HVAC ödeme akışında kullanılan güvenli ödeme kaplama bileşenidir. Ödeme işlemi sırasında kullanıcıya geçici bir ekran sunarak sürecin görünürlüğünü, hangi adımda olduğunu ve tamamlanma oranını gösterir.Uluslararasılaştırma desteği ile çok dilli arayüz sağlar.

## Fonksiyon Grupları
### Ödeme Kaplama Bileşeni
Ödeme süreci boyunca kullanıcıya sunulan kaplama ekranının tüm durumlarını ve görünümünü yöneten ana React bileşenidir.
- SecurePaymentOverlay

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı güvenli ödeme kaplama bileşeni, üst bileşen tarafından传递 edilen prop'ların geçerliliğine ve tutarlılığına bağlıdır. Eğer prop'lar eksik, null/undefined veya beklenmeyen türde ise, bileşenin render edilmesi veya doğru çalışması garanti edilemez.

[Aksiyom 1]: Eğer `overlayVisible` prop'u verilmemiş veya geçerli bir boolean (true/false) değilse, bileşenin görünürlüğü kontrol

---

## FONKSİYON DETAYLARI

### SecurePaymentOverlay

**Ne yapar**: Güvenli ödeme sürecinde kullanıcıya adım adım ilerleyen bir overlay (yer kaplayan üst panel) bileşenidir. Ödeme işleminin farklı aşamalarında (hazırlık, doğrulama, sonuç) kullanıcıya görsel geri bildirim sunar.

**Nasıl yapar**: Bileşen, `overlayVisible` durumuna göre ekranda görünür olup olmadığını kontrol eder. `overlayStep` prop'u ile mevcut ödeme adımını belirler ve her adıma karşılık gelen farklı içeriği render eder. `overlayPercent` değeri ile işlem ilerleme yüzdesini gösteren bir progress bar sunar. `t` fonksiyonu ile çok dilli çeviri desteği sağlar, böylece farklı dil kullanıcılarına yerelleştirilmiş mesajlar gösterir.

**Parametreler**:
- `overlayVisible` — `boolean` — Overlay'ın ekranda görünüp görünmeyeceğini kontrol eden mantıksal değer. `true` olduğunda overlay aktif olarak gösterilir, `false` olduğunda gizlenir.
- `overlayStep` — `string | number` — Mevcut ödeme işleminin hangi aşamada olduğunu belirtir. Bu değere bağlı olarak overlay içinde farklı içerik ve mesajlar render edilir.
- `overlayPercent` — `number` — Ödeme işleminin tamamlanma yüzdesini (0-100 aralığında) temsil eder. Genellikle bir ilerleme çubuğu (progress bar) bileşenine bağlanarak görsel geri bildirim sağlar.
- `t` — `(key: string) => string` — Çeviri fonksiyonu. Bileşen içindeki tüm kullanıcıya dönük metinlerin, bu fonksiyon aracılığıyla ilgili dil dosyasından çekilmesini sağlar. Örneğin `t('payment.processing')` çağrısı ile o anki dile göre "İşleniyor..." gibi bir metin döner.

**Dönüş**: `React.FC<SecurePaymentOverlayProps>` — Bileşen, JSX elementi döndüren bir React fonksiyonel bileşenidir. Verilen prop değerlerine göre koşullu olarak overlay arayüzünü render eder veya `null` döner.

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

### [N1_NASIL] AST Pointer: SecurePaymentOverlay.tsx::SecurePaymentOverlay
- **params**: (overlayVisible, overlayStep, overlayPercent, t)
- **ic_degiskenler**: 
  - `overlayVisible` — Ödeme overlay'ının görünür olup olmadığını belirler (boolean), false ise null döner
  - `overlayStep` — Overlay'ın hangi adımda olduğunu belirler (1, 2, 3), başlık ve adım renklerini kontrol eder
  - `overlayPercent` — İlerleme çubuğunun yüzdesini belirler, CSS width stilinde kullanılır
  - `t` — Çeviri fonksiyonu, tüm UI metinlerini lokalize etmek için kullanılır (checkout.overlay.* key'leri)
- **Dönüş**: JSX.Element | null (overlayVisible false ise null, değilse React bileşeni)

---

## NODE ID STANDARD

  file: src\views\checkout\SecurePaymentOverlay.tsx
  function: src\views\checkout\SecurePaymentOverlay.tsx::SecurePaymentOverlay

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