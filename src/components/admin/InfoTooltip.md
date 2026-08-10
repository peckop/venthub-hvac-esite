---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InfoTooltip.tsx
skeleton_hash: 979bd18efdbbfccc
entity_hashes:
  func:InfoTooltip: 183c7d447a0090ba
  overview: aa0bb37988421fc0
  style_tokens: 15a027a0bab7a2ef
generated_at: 2026-06-19T20:47:00Z
---

## Genel Bakış
`InfoTooltip` bileşeni, yönetim panelindeki metin öğelerine ek bilgi sağlamak amacıyla kullanılan bir tooltip (ipucu) komponentidir. Verilen metni ve isteğe bağlı boyut ve stil parametrelerini alarak, kullanıcı fareyi üzerine getirdiğinde açıklayıcı bir balon gösterir.

## Fonksiyon Grupları
### Tooltip Render ve Konfigürasyon
Bu grup, tooltip’in içeriğini ve görünümünü oluşturup, dışarıdan gelen `text`, `size` ve `className` prop’larını işleyerek React elementini döndürür.
- InfoTooltip

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### InfoTooltip
**Ne yapar**: Kullanıcıya bilgilendirici bir tooltip (yardım ipucu) gösteren React bileşenidir. Belirli bir metni, hover (üzerine gelme) sırasında küçük bir baloncuk içinde kullanıcıya sunar.

**Nasıl yapar**: Bileşen, verilen text parametresini bir tooltip içinde render eder. size parametresi ile ikonun veya tetikleyicinin boyutu, className ile ek stillendirme seçenekleri özelleştirilebilir. Tooltip, genellikle bir bilgi ikonu (ℹ️) ile tetiklenir ve üzerine gelindiğinde veya tıklandığında bilgilendirici metni gösterir.

**Parametreler**:
- text: string — Tooltip içinde görüntülenecek bilgilendirici metin
- size: number (varsayılan: 14) — Tooltip tetikleyicisinin (ikon) piksel cinsinden boyutu
- className: string (varsayılan: '') — Bileşene eklenecek ek CSS sınıfları

**Dönüş**: React.FC<InfoTooltipProps> — Bileşen, InfoTooltipProps arayüzünü kullanan bir React fonksiyonel bileşeni olarak döner.

---

## İTHALATLAR (IMPORTS)
- import: lucide-react::Info
- import: react::React

---

## INTERFACES

### InfoTooltipProps
- `text: string`
- `size?: number`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InfoTooltip.tsx::InfoTooltip
- **params**: ({ text, size = 14, className = '' })
- **ic_degiskenler**:
  - (Fonksiyon gövdesinde tanımlanmış değişken yok)
- **Dönüş**: JSX elementi (React bileşeni). Fonksiyon, `text` parametresini tooltip içeriği olarak gösteren ve üzerine gelindiğinde (Tailwind `group-hover` ile) görünür olan, `Info` ikonu ve tooltip kutusu içeren bir React bileşeni döndürür. Parametre olarak `text`, `size` ve `className` kullanılır.

---

## NODE ID STANDARD

  file: src\components\admin\InfoTooltip.tsx
  function: src\components\admin\InfoTooltip.tsx::InfoTooltip

---

## DISA AKTARILANLAR (EXPORTS)
  export: InfoTooltip

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-800`, `border-4`, `border-t-slate-800`, `border-transparent`, `hover:text-primary-navy`, `text-left`, `text-slate-400`, `text-white`, `text-xs`
- **Layout:** `absolute`, `bottom-full`, `inline-flex`, `items-center`, `justify-center`, `left-1/2`, `relative`, `shadow-xl`, `top-full`, `w-64`, `z-50`
- **Varyant/Responsive:** `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `-translate-x-1/2`, `align-middle`, `cursor-help`, `duration-200`, `font-normal`, `group`, `group-hover:opacity-100`, `group-hover:visible`, `invisible`, `leading-relaxed`, `mb-2`, `ml-1`, `normal-case`, `opacity-0`