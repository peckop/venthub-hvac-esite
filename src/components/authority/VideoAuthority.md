---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\VideoAuthority.tsx
skeleton_hash: 5da7532bc10b8800
entity_hashes:
  func:VideoAuthority: e820e802f63e86c2
  overview: 6991295f943a61c1
  style_tokens: ee9eb5151ad04adf
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
`VideoAuthority` bileşeni, video içeriğiyle ilişkili meta verileri alarak uygun video oynatıcı öğesini oluşturur ve isteğe bağlı stil sınıflarını ekleyerek kullanıcı arayüzünde gösterir. Tek bir fonksiyon üzerinden çalışır ve dışarıdan gelen `metadata` ve opsiyonel `className` prop'larını işler.

## Fonksiyon Grupları
### Render ve Veri İşleme
Bu grup, bileşenin aldığı video meta verilerini UI elemanlarına dönüştürmek ve ekstra CSS sınıflarını uygulamaktan sorumludur.
- VideoAuthority

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `metadata` undefined veya null ise, component render sırasında özellik erişimi yapmaya çalıştığı için çalışma zamanında hata oluşur.  
[Aksiyom 2]: Eğer `metadata` nesnesi, component tarafından render sırasında kullanılan gerekli alanları (örn. `id`, `title`, `url` vb.) içermiyorsa, bu alanlar `undefined` olarak görüntülenerek UI’da eksik veya hatalı veri gösterilir.  
[Aksiyom 3]: Eğer `className` prop’u string olmayan bir değer (sayı, obje, vb.) olarak geçirilirse, JSX’te `className` özelliği beklenmeyen türde bir değer alır ve stil uygulanamayabilir; varsayılan `''` string değeri bu riski azaltır.  
[Aksiyom 4]: Eğer `className` prop’u hiç geçirilmezse, varsayılan boş string (`''`) kullanılır ve ek bir stil sınıfı uygulanmaz; bu durumda yalnızca kendi iç stilleri veya diğer stiller etkili olur.

---

## FONKSİYON DETAYLARI

### VideoAuthority
**Ne yapar**: P01-012: VideoAuthority Merkezi video yönetim bileşeni. Farklı sağlayıcılardan (Cloudflare, YouTube) gelen videoları tek bir standartta render eder.  
**Nasıl yapar**: `metadata` prop'undan video kaynağı ve sağlayıcı bilgilerini okur, sağlayıcıya göre uygun video gömme yöntemini (iframe, embed vb.) seçer ve `className` prop'unu kök elemana uygular.  
**Parametreler**:
- metadata: VideoAuthorityProps — Video kaynağı, sağlayıcı tipi ve ek ayarları içeren nesne  
- className: string — Bileşenin kök elemanına ek CSS sınıfı eklemek için kullanılır, varsayılan boş string  
**Dönüş**: Belirtilmemiş (React bileşeni olarak JSX elementi döner)

---

## INTERFACES

### VideoAuthorityProps
- `metadata: VideoMetadata`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/VideoAuthority.tsx::VideoAuthority
- **params**: metadata: VideoMetadata, className: string = ''
- **ic_degiskenler**:
  - `isLoaded` — boolean state indicating whether the video iframe has finished loading; used to conditionally render thumbnail fallback and to set via `setIsLoaded(true)` on iframe `onLoad`.
  - `setIsLoaded` — setter function for `isLoaded` state; called when the iframe loads to update the loading state.
  - `isMuted` — boolean state reflecting whether the video is muted; initialized from `metadata.options?.muted ?? true`; used to control the `muted` query parameter in the iframe `src` and toggled by the mute/unmute button.
  - `setIsMuted` — setter for `isMuted` state; toggled by the button `onClick` to mute or unmute the video.
  - `renderPlayer` — function that returns the appropriate iframe JSX based on `metadata.provider`; encapsulates provider‑specific logic for Cloudflare and YouTube.
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/authority/VideoAuthority.tsx::renderPlayer
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

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