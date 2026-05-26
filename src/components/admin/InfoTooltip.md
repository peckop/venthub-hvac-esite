---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InfoTooltip.tsx
skeleton_hash: 4790b84088da2c3b
generated_at: 2026-05-23T21:52:26Z
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

---

## FONKSIYON DETAYLARI

### InfoTooltip
**Ne yapar**:  
Bir bilgi ikonu veya benzer bir UI öğesinin üzerine gelindiğinde (hover) gösterilmek üzere, içerisinde `text` prop’u ile belirtilen mesajı barındıran bir tooltip bileşenidir. Kullanıcıya açıklama veya yardım metni sunmak amacıyla kullanılır.

**Nasıl yapar**:  
Fonksiyonel bir React bileşeni olarak tanımlanmıştır. Gelen `text`, `size` ve `className` prop’larını alarak bir tooltip kutusu render eder. Varsayılan `size` değeri 14’tür (muhtemelen piksel cinsinden yazı boyutu) ve `className` boş dize olarak atanmıştır, böylece dışarıdan özel stiller eklenebilir. Bileşenin iç mantığı, `React.FC<InfoTooltipProps>` tipiyle şekillendirilmiş olup, state veya yan etki (side effect) barındırmayan sade bir görünüm bileşenidir.

**Parametreler**:
- `text`: `string` — Tooltip içinde gösterilecek açıklama metni.
- `size`: `number` — Varsayılan `14`. Tooltip metninin veya ilgili öğenin boyutunu belirler.
- `className`: `string` — Varsayılan `''`. Bileşene eklenecek ek CSS sınıf adları.

**Dönüş**:  
`React.FC<InfoTooltipProps>` — Bir React fonksiyonel bileşeni döndürür. Bileşen, JSX içinde kullanıldığında tooltip arayüzünü render eder.

---

## INTERFACES

### InfoTooltipProps
- `text: string`
- `size?: number`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\InfoTooltip.tsx::InfoTooltip
- **params**: 
  - `text` — tooltip içinde görüntülenecek metin içeriği
  - `size` — (varsayılan 14) Info ikonunun boyutu (piksel cinsinden)
  - `className` — (varsayılan '') üst div'e eklenecek ek CSS sınıfları
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element — fare üzerine gelindiğinde açılan bir tooltip kutusu ve Info ikonu içeren div döndürür

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
- **Renkler:** `bg-slate-800`, `border-4`, `border-t-slate-800`, `border-transparent`, `text-left`, `text-slate-400`, `text-white`, `text-xs`
- **Layout:** `absolute`, `bottom-full`, `group-hover:opacity-100`, `group-hover:visible`, `inline-flex`, `items-center`, `justify-center`, `left-1/2`, `relative`, `shadow-xl`, `top-full`, `w-64`, `z-50`
- **Responsive:** (yok)
