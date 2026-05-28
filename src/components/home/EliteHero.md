---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\EliteHero.tsx
skeleton_hash: 1fde267fee8312c8
entity_hashes:
  func:EliteHero: e0bd1a87424057a7
  overview: 2efd54222abb5308
  style_tokens: af9832004cc66ef7
generated_at: 2026-05-28T22:36:00Z
---

## Genel Bakış
EliteHero, web sitesinin ana sayfasındaki öne çıkan kahraman bölümünü render eden bir React bileşenidir. Temel amacı, kullanıcılara profesyonel bir HVAC hizmeti tanıtımı sunmak ve bir teklif alma butonu aracılığıyla potansiyel müşterileri etkileşimde bulundurmaktır.

## Fonksiyon Grupları
### Ana Sayfa Hero Bileşeni
Bileşen, ana sayfanın görsel ve etkileşimsel odak noktasını oluşturur. Kullanıcıya marka mesajı ve bir eylem çağrısı (teklif alma butonu) sunarak dönüşüm hunisine ilk adımı atmasını sağlar.
- EliteHero

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasından türetilebilen varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `onQuoteClick` prop'u işlev (function) olarak sağlanmazsa, bileşenin ilgili buton tıklama olayında çalışma zamanı hatası (TypeError) oluşur.

[Aksiyom 2]: Eğer `onQuoteClick` prop'u `undefined` olarak kalırsa (sağlanmazsa), bileşen prop'u yok sayarak render olur ancak buton tıklaması herhangi bir harici işlevi tetiklemez.

---

## FONKSİYON DETAYLARI

### EliteHero

**Ne yapar**: VentHub HVAC web uygulamasının ana sayfasında yer alan premium/elite seviye bir hero bileşenidir. Kullanıcılara etkileyici bir karşılama bölümü sunar ve teklif talep etme işlemi için bir eylem çağrısı (CTA) sunar.

**Nasıl yapar**: Fonksiyonel React bileşeni olarak yapılandırılmıştır. `EliteHeroProps` arayüzünden türetilen prop'ları kabul eder. Bileşen, hero bölümünü render eder ve teklif alma butonuna tıklandığında `onQuoteClick` callback fonksiyonunu tetikleyerek üst bileşene bildirimde bulunur. Bu sayede teklif formu gibi ilişkili UI bileşenlerinin açılması veya ilgili sayfaya yönlendirme yapılması sağlanır.

**Parametreler**:
- `onQuoteClick`: `() => void` — Kullanıcı teklif butonuna tıkladığında çağrılacak callback fonksiyonu. Teklif talep sürecininitiatorytetmek için kullanılır. Parametre almaz ve herhangi bir değer döndürmez.

**Dönüş**: `React.FC<EliteHeroProps>` — JSX elementi döndürür. Sayfanın üst kısmında konumlanan, görsel ve metin bileşenlerinden oluşan interaktif bir hero bölümü render eder.

---

## INTERFACES

### EliteHeroProps
- `onQuoteClick: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/EliteHero.tsx::EliteHero
- **params**: `{ onQuoteClick }` — üst bileşenden gelen, ikincil CTA butonuna tıklandığında tetiklenen callback fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('home.hero.visualAlt')`, `t('home.hero.eyebrow')`, `t('home.hero.title')`, `t('home.hero.subtitle')`, `t('home.hero.primaryCta')`, `t('home.hero.secondaryCta')` çağrılırarak çeviri metinleri alınır
- **Dönüş**: JSX (`<section>` — hero banner bölümü; arka plan görseli, başlık, alt başlık, iki CTA butonu ve scroll indicator içerir)

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
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-24`, `tracking-hvac-relaxed`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-gradient-to-t`, `bg-slate-950`, `bg-white`, `bg-white/10`, `bg-white/5`, `border-white/20`, `border-white/30`, `from-cyan-400`, `from-slate-950/80`, `from-slate-950/95`, `hover:bg-cyan-400`, `hover:bg-white/10`
- **Layout:** `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-10`, `flex`, `flex-col`, `from-cyan-400`, `from-slate-950/80`, `from-slate-950/95`, `gap-2`, `gap-3`, `gap-5`, `h-12`, `h-16`, `h-2`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `animate-pulse`, `border`, `brightness-60`, `duration-500`, `font-bold`, `font-light`, `font-semibold`, `hover:scale-105`, `inset-0`, `leading-hvac-105`, `leading-relaxed`, `lg:px-8`, `mb-8`, `mt-12`