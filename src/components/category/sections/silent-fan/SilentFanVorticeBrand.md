---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\silent-fan\SilentFanVorticeBrand.tsx
skeleton_hash: 0a921b4267d5feb0
entity_hashes:
  func:SilentFanVorticeBrand: e07a3a521f52112d
  func:tr: b282b53f03d688a5
  overview: 754a28961314bbb7
  style_tokens: 40e58eb2e4f109bb
generated_at: 2026-06-19T20:47:07Z
---

## Genel Bakış
Bu modül, sessiz fan ürünlerini Vortice markasıyla tanıtan bir React bileşenini ve bu bileşen içinde kullanılan bir çeviri yardımcı fonksiyonunu içerir. Bileşen, markaya özel ürün bilgilerini ve görsel düzeni sunarken, çeviri fonksiyonu arayüz metinlerinin çok dilli olarak görüntülenmesini sağlar.

## Fonksiyon Grupları
### Kullanıcı Arayüzü Bileşeni
Bu grup, Vortice markasına ait sessiz fan ürünlerini ekranda görsel olarak sunan ana React bileşenini ve ilgili düzeni tanımlar.
- SilentFanVorticeBrand

### Çeviri Yardımcı Fonksiyonu
Bu grup, bileşen içindeki sabit metinlerin farklı dillere çevrilmesini sağlamak için kullanılan basit bir yardımcı fonksiyonu barındırır.
- tr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimalist aksiyomlar, yalnızca fonksiyon imzalarından türetilmiştir.

[Aksiyom 1]: Eğer `tr` fonksiyonuna geçilen `key` değeri, çeviri sözlüğünde (translation dictionary) tanımlı bir anahtar değilse, undefined veya boş bir değer döner ve bileşen üzerinde tanımsız metin görüntülenebilir.

[Aksiyom 2]: Eğer `SilentFanVorticeBrand` bileşeni çağrılmadan önce çeviri sözlüğü veya sağlayıcısı (provider) yüklenmemişse, `tr` fonksiyonu çağrılamaz ve bileşen render aşamasında hata verir.

[Aksiyom 3]: Eğer `tr` fonksiyonuna boş string (`""`) geçilirse, bileşen üzerinde boş bir metin alanı oluşur.

[Aksiyom 4]: `SilentFanVorticeBrand` parametresiz çağrılmaktadır; bileşenin ihtiyacı olan tüm veriler (ürün listesi, görseller vb.) modül içi import'lar veya React context aracılığıyla sağlanmalıdır.

---

## FONKSİYON DETAYLARI

### SilentFanVorticeBrand
**Ne yapar**: Silent Fan Vortice markasıyla ilgili bölümün kullanıcı arayüzünü renderlar.  
**Nasıl yapar**: React fonksiyon bileşeni olarak JSX döndürür; bu JSX, markanın ürünlerini, özelliklerini veya görsel öğelerini gösteren alt bileşenleri ve düzenleri içerir.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: Bir React elementi (JSX) döndürür; bu eleman `SilentFanVorticeBrand` bileşeninin ekrana çıktısını temsil eder.

### tr
**Ne yapar**: Verilen anahtar (`key`) ile ilişkili çeviriyi sağlar; genellikle kullanıcı arayüzündeki metinleri çok dilli hale getirmek için kullanılır.  
**Nasıl yapar**: Anahtarını bir çeviri haritası veya veri kaynağında arar, bulunursa ilgili çeviriyi döndürür; bulunamazsa anahtarını kendiyle döndürebilir veya varsayılan bir değer döndürebilir (gerçek dönüş türü belirsiz olduğu için bu davranım uygulama‑bağımlıdır).  
**Parametreler**:  
- key: string — Çevirilecek metnin anahtarını tanımlar.  
**Dönüş**: Belirtilmemiş; fonksiyonun dönüş tipi belirsiz olduğu için net bir açıklama yapılamaz. Gerçekte bir string, void veya başka bir tip döndürebilir.

---

## İTHALATLAR (IMPORTS)
- import: @/components/ui/VentImage::VentImage
- import: @/hooks/useScrollAnimation::scrollAnimationClasses
- import: @/hooks/useScrollAnimation::useScrollAnimation
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Award
- import: lucide-react::Clock
- import: lucide-react::Globe
- import: lucide-react::Star
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/category/sections/silent-fan/SilentFanVorticeBrand.tsx`::SilentFanVorticeBrand
- **params**: (parametre yok) — anonim React functional component, arrow function
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, `tr` içinde sarmalanarak `categorySilentFan.brand.*` alanına yönlendirir
  - `dict` — `useI18n()` hook'undan gelen sözlük objesi, tam çeviri içeriğine erişim sağlar
  - `sectionRef` — `useScrollAnimation<HTMLElement>()` hook'undan dönen ref, `<section>` elementine atanarak IntersectionObserver tetikleme noktası olarak kullanılır
  - `isVisible` — `useScrollAnimation<HTMLElement>()` hook'undan dönen boolean, section'ın ekranda görünüp görünmediğini tutar; `scrollAnimationClasses.slideRight/isVisible` ve `scrollAnimationClasses.slideLeft/isVisible` ile CSS animasyon sınıflarını koşullu aktif eder
  - `tr` — `(key: string) => t(...)` şeklinde tanımlı yerel yardımcı fonksiyon, verilen key'i `categorySilentFan.brand.` prefix'i ile birleştirerek çeviriyi kısaltmalı yoldan getirir
  - `bDict` — `dict.categorySilentFan.brand` erişiminden elde edilen alt sözlük objesi; `bDict.stats` ve `bDict.badges` alanlarından veri okunur
  - `icons` — `[Clock, Globe, Award, Star]` sabit dizisi; lucide-react'ten import edilen 4 ikon bileşeni, stats.map içinde her satıra sırasıyla ikon atamak için kullanılır
  - `stats` — `bDict.stats || []` ifadesinden elde edilen istatistik nesneleri dizisi; her biri `{ value, label }` yapısına sahiptir, `.map()` ile dönülerek kartlar oluşturulur
  - `item` — `stats.map` callback'inde dönen her bir istatistik nesnesi; `item.value` ve `item.label` alanları JSX'te render edilir
  - `index` — `stats.map` callback'indeki sıralama indeksi; `icons[index % icons.length]` ile ikon seçiminde modular aritmetik kullanılır
  - `Icon` — `icons[index % icons.length]` ifadesinden hesaplanan bileşen; `stats.map` içinde her satıra karşılık gelen ikon bileşenini tutar, `<Icon className="..." size={24} />` olarak render edilir
  - `badge` — `(badge: string, i: number)` callback parametresi; `bDict.badges` dizisindeki her bir rozet metni, `<div>` içinde doğrudan.textContent olarak render edilir
  - `i` — `(badge: string, i: number)` callback parametresi; rozet indeksi, `key={i}` için ve `i === 0` koşuluyla ilk rozete mavi arka plan vermek için kullanılır
- **Dönüş**: `JSX.Element` — React bileşeni, hero section'ı render eden `<section>` elementi döner; sol tarafta başlık, açıklama, istatistik kartları ve rozetler, sağ tarafta VentImage ile görsel içeren iki sütunlu grid layout

---

## NODE ID STANDARD

  file: src\components\category\sections\silent-fan\SilentFanVorticeBrand.tsx
  function: src\components\category\sections\silent-fan\SilentFanVorticeBrand.tsx::SilentFanVorticeBrand
  function: src\components\category\sections\silent-fan\SilentFanVorticeBrand.tsx::tr

---

## DISA AKTARILANLAR (EXPORTS)
  export: SilentFanVorticeBrand

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`, `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-600`, `bg-blue-600/20`, `bg-italian-red`, `bg-slate-900`, `bg-vortice-green`, `bg-white`, `bg-white/5`, `border-8`, `border-slate-800`, `border-white/10`, `md:text-5xl`, `text-2xl`, `text-4xl`, `text-blue-400`, `text-blue-500`
- **Layout:** `-bottom-10`, `-right-10`, `-z-10`, `absolute`, `flex`, `flex-wrap`, `gap-16`, `gap-3`, `gap-4`, `gap-6`, `grid`, `grid-cols-2`, `h-12`, `h-6`, `h-64`
- **Varyant/Responsive:** `:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${i`, `${scrollAnimationClasses.slideLeft(isVisible`, `0`, `:`, `===`, `blur-3xl`, `border`, `font-black`, `font-bold`, `leading-relaxed`, `leading-tight`, `lg:px-8`, `mb-10`, `mb-8`, `mx-auto`