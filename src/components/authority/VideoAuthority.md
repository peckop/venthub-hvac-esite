---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\VideoAuthority.tsx
skeleton_hash: 8ba1ac187536ac0b
entity_hashes:
  func:VideoAuthority: b3456356a0303fff
  overview: 931e142b761ac254
  style_tokens: ee9eb5151ad04adf
generated_at: 2026-06-14T22:18:04Z
---

## Genel Bakış
VideoAuthority, farklı video sağlayıcılarından gelen içeriklerin tek bir standart arayüzde görüntülenmesini sağlayan merkezi bir bileşendir. Video meta verilerini alarak uygun oynatıcıyı oluşturur ve opsiyonel stil sınıflarıyla dışarıdan gelen görünüm özelleştirmelerini destekler.

## Fonksiyon Grupları
### Video Oluşturma ve Stil Yönetimi
Bu grup, video bileşeninin temel amacını karşılar: gelen meta verileri ayrıştırarak tutarlı bir video oynatıcı arayüzü oluşturmak ve dışarıdan sağlanan CSS sınıflarını uygulamak.
- VideoAuthority

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### VideoAuthority

**Ne yapar**: Merkezi video yönetim bileşenidir. Cloudflare Stream ve YouTube gibi farklı video sağlayıcılarından gelen videoları tek bir standart arayüzde render eder. Bileşen, video oynatıcı, kük önizleme (thumbnail) fallback mekanizması ve hover ile görünen kontroller panelini sunar.

**Nasıl yapar**: Fonksiyon, gelen `metadata.provider` alanına göre bir `switch` yapısıyla (`renderPlayer` iç fonksiyonu) ilgili sağlayıcıya ait iframe URL'sini dinamik olarak oluşturur. Her sağlayıcı için embed URL parametreleri (autoplay, muted, loop, controls) metadata nesnesinden okunarak URL query string'ine dönüştürülür. `useState` hook'ları ile video yüklenme durumu (`isLoaded`) ve sessizlik durumu (`isMuted`) yönetilir. `isLoaded` başlangıçta `false` olduğundan, iframe'in `onLoad` eventi tetiklenene kadar `metadata.thumbnailUrl` değerinden bulanık bir thumbnail gösterilir. `useI18n` hook'u ile yerelleştirilmiş metinler (`t(...)`) kullanılır. Framer Motion kütüphanesinden gelen `motion.div` bileşeni, container'ın giriş animasyonunu (opacity ve scale geçişi) sağlar. `group-hover` Tailwind sınıfı ile fare overldığında kontroller paneli (`opacity-0 → opacity-100`) görünür hale gelir. Sessizlik butonuna tıklandığında `isMuted` state'i tersine çevrilir ve iframe URL'si buna göre yeniden render edilir.

**Parametreler**:

- `metadata`: `VideoAuthorityProps['metadata']` — Video meta bilgilerini içeren nesne. `provider` (sağlayıcı tipi: `'cloudflare' | 'youtube'`), `id` (video kimliği), `title` (video başlığı), `thumbnailUrl` (önizleme görseli URL'i), `aspectRatio` (en-boy oranı: `'vertical'` veya diğer), ve `options` (opsiyonel: `autoPlay`, `muted`, `loop`, `controls` boolean değerleri) alanlarını barındırır.
- `className`: `string` — Bileşenin kök `motion.div` elemanına eklenecek ek CSS sınıf isimleri. Varsayılan değeri boş stringdir (`''`).

**Dönüş**: `JSX.Element` — Render edilmiş video bileşeninin JSX yapısı. Bileşenin return tipi React fonksiyonel bileşen standartlarına göre JSX döndürür; `motion.div` sarmalayıcısı içinde thumbnail fallback, iframe video player ve overlay kontroller bölümünü içerir.

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

### [N1_NASIL] AST Pointer: components/authority/VideoAuthority.tsx::VideoAuthority
- **params**: `{ metadata, className = '' }` — VideoAuthorityProps tipinde video metadata bilgisi ve opsiyonel CSS class adı
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu, UI metinlerini lokalize eder (örn: `t('pdp.videoAuthority.unsupportedProvider')`)
  - `isLoaded` — useState ile yönetilen boolean, videonun iframe içinde yüklenip yüklenmediğini takip eder; true olduğunda thumbnail fallback gizlenir
  - `isMuted` — useState ile yönetilen boolean, videonun sessiz olup olmadığını tutar; `metadata.options?.muted ?? true` ile başlangıç değeri alınır, ses butonu ile toggle edilir
  - `renderPlayer` — iç fonksiyon, `metadata.provider` değerine göre ('cloudflare', 'youtube' veya diğer) uygun iframe player JSX'ini döndürür
- **Dönüş**: JSX — `<motion.div>` ile animasyonlu video container'ı; thumbnail fallback, renderPlayer() çıktıları ve overlay kontrolleri (başlık, ses butonu) döndürülür

### [N2_NASIL] AST Pointer: components/authority/VideoAuthority.tsx::renderPlayer (iç fonksiyon)
- **params**: (parametre yok — üst kapsam闭包 ile erişir)
- **ic_degiskenler**:
  - `metadata.provider` — switch/ifadesi tarafından kontrol edilen string; 'cloudflare', 'youtube' veya default dal seçimi yapar
  - `metadata.id` — iframe src URL'inde video yolu olarak kullanılan identifier
  - `metadata.title` — iframe title attribute'unda fallback ile birlikte kullanılır
  - `metadata.options?.autoPlay` — boolean, autoplay parametresini URL'ye bağlamak için kullanılır
  - `metadata.options?.loop` — boolean, sadece youtube dalında loop parametresi olarak kullanılır
  - `metadata.options?.controls` — boolean, sadece youtube dalında controls parametresi olarak kullanılır
  - `isMuted` — üst kapsamdan闭包 ile erişilen boolean, muted parametresini URL'ye bağlamak için kullanılır
  - `setIsLoaded` — üst kapsamdan闭包 ile erişilen state setter'ı; onLoad callback'inde tetiklenir
  - `process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN` — cloudflare dalında iframe src domain'i; fallback `'customer-XXXXX.cloudflarestream.com'`
  - `t` — üst kapsamdan闭包 ile erişilen çeviri fonksiyonu; default dalında desteklenmeyen provider mesajını localize eder
- **Dönüş**: JSX — provider'a göre Cloudflare/YouTube iframe'i veya fallback mesaj div'i; her iframe onLoad ile `setIsLoaded(true)` çağrısı yapar

### [N3_NASIL] AST Pointer: components/authority/VideoAuthority.tsx::() => setIsLoaded(true) (onLoad callback, cloudflare)
- **params**: (parametre yok — SyntheticEvent alınır ama kullanılmaz)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `setIsLoaded(true)` ile `isLoaded` state'ini true yapar; thumbnail fallback Image bileşenini devre dışı bırakır

### [N4_NASIL] AST Pointer: components/authority/VideoAuthority.tsx::() => setIsLoaded(true) (onLoad callback, youtube)
- **params**: (parametre yok — SyntheticEvent alınır ama kullanılmaz)
- **ic_degiskenler**: (yok)
- **Dönüş**: void — `setIsLoaded(true)` ile `isLoaded` state'ini true yapar; thumbnail fallback Image bileşenini devre dışı bırakır

### [N5_NASIL] AST Pointer: components/authority/VideoAuthority.tsx::() => setIsMuted(!isMuted) (onClick callback, ses butonu)
- **params**: (parametre yok — MouseEvent alınır ama kullanılmaz)
- **ic_degiskenler**:
  - `isMuted` — üst kapsamdan闭包 ile erişilen boolean mevcut ses durumunu tutar
  - `setIsMuted` — üst kapsamdan闭包 ile erişilen state setter'ı
- **Dönüş**: void — ses durumunu toggle eder; iframe URL'lerindeki muted parametresi yeniden hesaplanır, ses ikonu `VolumeX` ↔ `Volume2` arasında geçiş yapar

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