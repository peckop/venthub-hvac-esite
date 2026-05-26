---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\EliteHero.tsx
skeleton_hash: 1fde267fee8312c8
generated_at: 2026-05-23T22:04:36Z
---

## Genel Bakış
EliteHero, uygulamanın ana sayfasındaki öne görsel bölümü olan bir React bileşenidir. Kullanıcıya bir teklif alma butonu sunar ve bu butona tıklandığında dışarıdan gelen `onQuoteClick` fonksiyonunu tetikler.

## Fonksiyon Grupları
### Ana Bileşen Mantığı
Bu grup, EliteHero bileşeninin temel render ve etkileşim mantığını içerir.
- EliteHero

---

## AXIOMS – Mimari Varsayımlar
EliteHero bileşeni, onQuoteClick prop'ı üzerinden bir işlev alarak quote butonuna tıklama olayını yönetir.

[Aksiyom 1]: Eğer onQuoteClick prop'ı sağlanmazsa, quote butonuna tıklandığında hiçbir işlev çağrılmaz olur.  
[Aksiyom 2]: Eğer onQuoteClick prop'ı bir işlev değilse, quote butonuna tıklandığında çalışma zamanı hatası (TypeError) olur.

---

## FONKSIYON DETAYLARI

### EliteHero
**Ne yapar**: EliteHero bileşeni, web sitesinin ana sayfasındaki öne çıkan kahraman bölümünü renderlar.  
**Nasıl yapar**: Bileşen, `onQuoteClick` prop olarak alınan fonksiyonu bir düğme veya bağlantıya bağlayarak kullanıcı etkileşimini yönetir; diğer statik görsel ve metin öğelerini JSX ile döndürür.  
**Parametreler**:  
- onQuoteClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void — Kullanıcı alıntı isteği düğmesine tıkladığında çağrılan geri çağırım fonksiyonu.  
**Dönüş**: React.FC<EliteHeroProps> — EliteHero bileşeninin kendisi, JSX içinde `<EliteHero onQuoteClick={handler} />` şeklinde kullanılabilir.

---

## INTERFACES

### EliteHeroProps
- `onQuoteClick: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/EliteHero.tsx::EliteHero
- **params**: onQuoteClick — click handler for the secondary CTA button
- **ic_degiskenler**: 
  - `t` — translation function returned by `useI18n()`, used to fetch localized strings for the hero section (visualAlt, eyebrow, title, subtitle, primaryCta, secondaryCta)
- **Dönüş**: React.FC<EliteHeroProps> — returns the JSX representing the hero section (including background image, content, CTAs, and scroll indicator)

---

## NODE ID STANDARD

  file: src\components\home\EliteHero.tsx
  function: src\components\home\EliteHero.tsx::EliteHero

---

## DISA AKTARILANLAR (EXPORTS)
  export: EliteHero

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** `h-[100vh]`, `min-h-[700px]`
- **width:** `w-[1px]`
- **spacing:** (yok)
- **diğer:** `brightness-[0.6]`, `leading-[1.05]`, `lg:text-[5.5rem]`, `saturate-[1.1]`, `tracking-[0.24em]`, `tracking-[0.3em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-gradient-to-t`, `bg-slate-950`, `bg-white`, `bg-white/10`, `bg-white/5`, `border-white/20`, `border-white/30`, `from-cyan-400`, `from-slate-950/80`, `from-slate-950/95`, `sm:text-2xl`, `sm:text-6xl`
- **Layout:** `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-10`, `flex`, `flex-col`, `from-cyan-400`, `from-slate-950/80`, `from-slate-950/95`, `gap-2`, `gap-3`, `gap-5`, `h-12`, `h-16`, `h-2`
- **Responsive:** `lg:`, `sm:` prefix kullanımları
