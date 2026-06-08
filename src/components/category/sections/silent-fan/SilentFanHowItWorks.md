---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanHowItWorks.tsx
skeleton_hash: 6738c8a7974ea430
entity_hashes:
  func:SilentFanHowItWorks: 1d9f7bbf01c39f23
  func:tr: b282b53f03d688a5
  overview: 8afe080395065c81
  style_tokens: b11a600d5d7c65a7
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
`SilentFanHowItWorks` modülü, sessiz fanların çalışma prensiplerini açıklayan bir React bileşenidir. Bileşen, farklı dil destekleri için çeviri fonksiyonu kullanarak kullanıcıya çoklu dilde içerik sunar.

## Fonksiyon Grupları
### Bileşen Renderlama
Sessiz fanların nasıl çalıştığını anlatan görsel ve metinsel içeriği kullanıcı arayüzüne dönüştüren ana React bileşeni.
- SilentFanHowItWorks

### Çeviri Desteği
Bileşen içindeki metinlerin farklı dillere çevrilmesini sağlayan yardımcı fonksiyon.
- tr

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar, React bileşen yapısı ve çeviri sistemi üzerinedir.

[Axiom 1]: Eğer `tr` fonksiyonu `SilentFanHowItWorks` bileşeninin çalıştığı kapsamda tanımlı veya import edilmemişse, bileşen içindeki tüm çeviri anahtarları (key) işlenemez ve bileşen render edilemez.

[Axiom 2]: Eğer `tr` fonksiyonu geçerli bir dizi veya çeviri sözlüğü ile beslenmemişse, bileşen içindeki metin alanları boş/çevrilmemiş kalır veya `undefined` değerleri gösterir.

[Axiom 3]: Eğer `SilentFanHowItWorks` bileşeni React Component yapısının dışında (örn: düz bir fonksiyon olarak) çağrılırsa, JSX döndürülmez ve bileşen düzgün render edilemez.

[Axiom 4]: Eğer `tr` fonksiyonu, `SilentFanHowItWorks` içinde kullanılan herhangi

---

## FONKSİYON DETAYLARI

### SilentFanHowItWorks
**Ne yapar**: Silent fan'ın çalışma prensibini açıklayan bir React bileşeni render eder.  
**Nasıl yapar**: Bileşen, JSX ile fanın sessiz çalışma mekanizmasını gösteren metin, görsel veya animasyon içeriği döndürür; dışarıdan prop almaz ve varsayılan olarak export edilir.  
**Parametreler**: (yok)  
**Dönüş**: React.FC türünde bir fonksiyon döndürür; bu fonksiyon render edildiğinde JSX elementi üretir.

### tr
**Ne yapar**: Verilen çeviri anahtarına karşılık gelen metni bulup uygulama içinde kullanmaya hazırlar (örneğin i18n fonksiyonu).  
**Nasıl yapar**: Anahtar string'i alır, çeviri dosyalarında veya context'te arar ve eşleşen değeri bulursa ilgili UI elemanına inject eder; dönüş tipi belirsiz olduğu için net bir değer döndürüp döndürmediği belirtilmez.  
**Parametreler**:  
- key: string — çevrilecek metnin anahtar kimliği  
**Dönüş**: Belirtilmemiş (void veya bilinmeyen tip); fonksiyonun bir değer döndürüp döndürmediği net değil.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanHowItWorks.tsx::SilentFanHowItWorks
- **params**: []
- **ic_degiskenler**:
    - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, genel çeviri anahtarıyla kullanılır
    - `dict` — `useI18n()` hook'undan dönen sözlük nesnesi, `dict.categorySilentFan.howItWorks.steps` yoluyla adım verilerine erişilir
    - `sectionRef` — `useScrollAnimation()` hook'undan dönen referans, section DOM elemanına atanır
    - `isVisible` — `useScrollAnimation()` hook'undan dönen boolean, animasyon tetikleme durumunu tutar
    - `tr` — Yardımcı fonksiyon, `t()` fonksiyonunu `categorySilentFan.howItWorks.` prefix'le sarar
    - `icons` — `[Microscope, Wind, ShieldCheck]` dizisi, adımların yanına yerleştirilecek ikonları tutar
    - `steps` — `dict.categorySilentFan.howItWorks.steps` değerinden gelen adım nesneleri dizisi, `|| []` ile boş dizi fallback'i alınır
- **Dönüş**: JSX elementi (section) — sessiz fan teknolojisinin nasıl çalıştığını görsel ve metin olarak gösteren bileşen

### [N2_NASIL] AST Pointer: src/components/category/sections/silent-fan/SilentFanHowItWorks.tsx::mapCallback(step, index)
- **params**: (`step`: adım nesnesi, `index`: number)
- **ic_degiskenler**:
    - `Icon` — `icons[index % icons.length]` ile döngüsel olarak seçilen ikon bileşeni (Microscope, Wind veya ShieldCheck)
- **Dönüş**: JSX elementi (div) — her adım için ikon, başlık ve açıklama içeren bir kart

---

## NODE ID STANDARD

  file: src\components\category\sections\silent-fan\SilentFanHowItWorks.tsx
  function: src\components\category\sections\silent-fan\SilentFanHowItWorks.tsx::SilentFanHowItWorks
  function: src\components\category\sections\silent-fan\SilentFanHowItWorks.tsx::tr

---

## DISA AKTARILANLAR (EXPORTS)
  export: SilentFanHowItWorks

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-500/10`, `bg-gradient-to-r`, `bg-slate-800`, `bg-slate-900`, `border-blue-500/20`, `border-white/5`, `from-blue-500`, `group-hover:bg-blue-500/20`, `group-hover:text-blue-300`, `md:text-5xl`, `sm:text-4xl`, `text-3xl`, `text-blue-400`, `text-lg`, `text-slate-400`
- **Layout:** `absolute`, `block`, `flex`, `flex-shrink-0`, `from-blue-500`, `gap-12`, `gap-5`, `grid`, `h-12`, `h-auto`, `items-center`, `justify-center`, `lg:grid-cols-2`, `max-w-7xl`, `max-w-xl`
- **Varyant/Responsive:** `group-hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${scrollAnimationClasses.slideRight(isVisible`, `-inset-0.5`, `blur-xl`, `border`, `font-bold`, `group`, `group-hover:opacity-30`, `inset-0`, `leading-relaxed`, `leading-tight`, `lg:px-8`, `mb-10`, `mb-2`, `mb-3`, `mb-6`