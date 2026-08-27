---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\authority\VideoAuthority.tsx
skeleton_hash: bcadf1275c56c367
entity_hashes:
  func:VideoAuthority: b42d8a27d95a4ea9
  overview: 931e142b761ac254
  style_tokens: ee9eb5151ad04adf
generated_at: 2026-08-27T08:25:41Z
---

## Genel Bakış

VideoAuthority, video içeriğine ilişkin yetki bilgisini görüntülemek için kullanılan bir React bileşenidir. `metadata` ve `className` olmak üzere iki prop alır; `className` varsayılan olarak boş string değerine sahiptir. Bileşen, `src/components/authority/` klasörü altında konumlanmıştır.

## Fonksiyon Grupları

### Ana Bileşen

Tek bileşenden oluşan bu modülde, video yetki bilgisinin sunumunu üstlenen bir React bileşeni yer alır. Bileşen, aldığı metadata verisine göre yetki görselleştirmesini gerçekleştirir.

- VideoAuthority

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Modül yalnızca fonksiyon imzası (`VideoAuthority({ metadata, className = '' })`) düzeyinde bilgi içermekte olup, fonksiyon gövdesi sağlanmadığı için davranışsal çıkarım yapılamamıştır.

---

## FONKSİYON DETAYLARI

### VideoAuthority
**Ne yapar**: Farklı video sağlayıcılarından (Cloudflare, YouTube) gelen videoları tek bir standartta render eden merkezi video yönetim bileşenidir. P01-012 kapsamında tanımlanmıştır. Sağlayıcıya göre uygun iframe'i oluşturur, yükleme durumunu takip eder, thumbnail fallback gösterir ve standartlaştırılmış overlay kontrolleri sunar.

**Nasıl yapar**: Bileşen, `useI18n` hook'u ile uluslararasılaştırma desteği alır ve iki durum yönetir: videonun yüklenip yüklenmediğini (`isLoaded`) ve sesin açık/kapalı olduğunu (`isMuted`). `metadata.provider` değerine göre bir `switch` yapısı ile `renderPlayer` fonksiyonu çalıştırılır; `cloudflare` durumunda Cloudflare Stream iframe'i, `youtube` durumunda YouTube embed iframe'i, diğer durumlarda ise desteklenmeyen sağlayıcı uyarısı gösterilir. Her iframe'in `onLoad` olayı `isLoaded` durumunu `true` yapar. Dış sarmalayıcı `motion.div` ile başlangıçta opaklığı 0 ve ölçeği 0.98 olan bir animasyonla açılır. `isLoaded` false iken ve `metadata.thumbnailUrl` mevcutken, bulanık ve yarı saydam bir thumbnail resmi (`Image` bileşeni) gösterilir. Video container'ının üzerine, fare üzerine geldiğinde (`group-hover:opacity-100`) görünen bir overlay katmanı eklenir; bu katmanda video başlığı, play ikonu ve ses açma/kapama butonu bulunur. Container'ın en-boy oranı `metadata.aspectRatio` değerine göre `9/16` (dikey) veya `16/9` (varsayılan/yatay) olarak ayarlanır.

**Parametreler**:
- metadata: VideoAuthorityProps — Video meta bilgilerini içerir. Bu nesne içinde `provider` (sağlayıcı türü: `'cloudflare'` veya `'youtube'`), `id` (video kimliği), `title` (video başlığı), `thumbnailUrl` (thumbnail resim URL'i), `aspectRatio` (en-boy oranı: `'vertical'` veya diğer), `options` (video oynatma seçenekleri: `muted`, `autoPlay`, `loop`, `controls` alanlarını içeren opsiyonel nesne) bulunur.
- className: string — Bileşenin dış sarmalayıcısına ek CSS sınıfı eklemek için kullanılır. Varsayılan değeri boş string `''`dir.

**Dönüş**: JSX elementi döndürür. Dış sarmalayıcı `motion.div` olup içinde thumbnail fallback, video player iframe'i ve overlay kontrolleri katmanları bulunur. Bileşenin dönüş tipi kaynak kodda açıkça belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/media.types::type { VideoMetadata }
- import: @/i18n/I18nProvider::useI18n
- import: framer-motion::motion
- import: lucide-react::Play
- import: lucide-react::Volume2
- import: lucide-react::VolumeX
- import: next/image::Image
- import: react::React
- import: react::useState

---

## INTERFACES

### VideoAuthorityProps
- `metadata: VideoMetadata`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/VideoAuthority.tsx::VideoAuthority
- **params**: `metadata` (VideoMetadata tipinde video meta verisi), `className` (opsiyonel string, varsayılan `''`)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('pdp.videoAuthority.unsupportedProvider')` gibi anahtarlarla yerelleştirilmiş metin almak için kullanılır
  - `isLoaded` — `useState(false)` ile tanımlanan boolean state; videonun iframe'i yüklenip yüklenmediğini takip eder, `false` iken thumbnail fallback gösterilir
  - `setIsLoaded` — `isLoaded` state'ini güncelleyen setter fonksiyonu; iframe'in `onLoad` olayında `true` olarak çağrılır
  - `isMuted` — `useState(metadata.options?.muted ?? true)` ile tanımlanan boolean state; videonun sessiz durumunu tutar, başlangıç değeri `metadata.options?.muted` varsa onu kullanır, yoksa `true`
  - `setIsMuted` — `isMuted` state'ini güncelleyen setter fonksiyonu; overlay'deki ses butonuna tıklandığında `!isMuted` değeriyle çağrılır
  - `renderPlayer` — `metadata.provider` değerine göre uygun video iframe'ini döndüren arrow fonksiyon; `'cloudflare'`, `'youtube'` veya `default` (desteklenmeyen sağlayıcı uyarısı) durumlarını switch ile işler
  - `metadata.provider` — video sağlayıcısını belirten string; `'cloudflare'` veya `'youtube'` olabilir, switch-case ile dallanma sağlar
  - `metadata.title` — video başlığı; iframe `title` özelliğinde ve overlay'de gösterilir, yoksa fallback string kullanılır
  - `metadata.id` — video kimliği; Cloudflare ve YouTube iframe URL'lerinde kullanılır
  - `metadata.options?.autoPlay` — otomatik oynatma seçeneği; Cloudflare'de `'true'`/`'false'`, YouTube'da `1`/`0` olarak URL'e eklenir
  - `metadata.options?.muted` — başlangıç sessiz durumu; `isMuted` state'inin başlangıç değerini belirler
  - `metadata.options?.loop` — döngü seçeneği; sadece YouTube provider'da URL parametresi olarak eklenir
  - `metadata.options?.controls` — kontrol çubuğu gösterme seçeneği; sadece YouTube provider'da URL parametresi olarak eklenir
  - `metadata.thumbnailUrl` — thumbnail resim URL'i; video yüklenene kadar blur ve yarı saydam `Image` bileşeni olarak gösterilir
  - `metadata.aspectRatio` — en-boy oranı; `'vertical'` ise `9/16`, diğer durumlarda `16/9` olarak `style` prop'una uygulanır
  - `process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN` — Cloudflare Stream domain'i; ortam değişkeninden okunur, yoksa `'customer-XXXXX.cloudflarestream.com'` fallback kullanılır
  - `className` — dışarıdan gelen CSS sınıfı; `motion.div`'in className'ine eklenir
- **Dönüş**: JSX elementi (`motion.div`); animasyonlu bir video oynatıcı konteyneri, thumbnail fallback, video iframe'i ve hover'da görünen overlay kontrolleri (Play ikonu, başlık, ses açma/kapama butonu) içerir

### [N2_NASIL] AST Pointer: src/components/authority/VideoAuthority.tsx::renderPlayer
- **params**: yok
- **ic_degiskenler**: yok — dış scope'daki `metadata`, `isMuted`, `setIsLoaded`, `t` değişkenlerini kullanır
- **Dönüş**: JSX elementi; `metadata.provider` değerine göre `'cloudflare'` durumunda Cloudflare Stream iframe'i, `'youtube'` durumunda YouTube embed iframe'i, diğer durumlarda desteklenmeyen sağlayıcı uyarısı (`div` içinde `p` etiketi) döndürür

---

## NODE ID STANDARD

  file: src\components\authority\VideoAuthority.tsx
  function: src\components\authority\VideoAuthority.tsx::VideoAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: VideoAuthority

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `bg-primary-navy/80`, `bg-slate-100`, `bg-slate-900`, `from-black/60`, `hover:text-white`, `text-slate-400`, `text-white`, `text-white/80`, `text-xs`, `to-transparent`
- **Layout:** `absolute`, `backdrop-blur-md`, `flex`, `flex-col`, `from-black/60`, `h-full`, `items-center`, `justify-between`, `justify-center`, `justify-end`, `overflow-hidden`, `p-2`, `p-4`, `relative`, `w-full`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `blur-sm`, `font-black`, `font-bold`, `group`, `group-hover:opacity-100`, `inset-0`, `object-cover`, `opacity-0`, `opacity-50`, `pointer-events-auto`, `pointer-events-none`, `rounded-2xl`, `rounded-full`, `space-x-2`