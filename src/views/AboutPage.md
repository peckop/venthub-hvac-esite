---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\AboutPage.tsx
skeleton_hash: 7655e1f15f9c8027
entity_hashes:
  func:AboutPage: 7a07cf459964f7ab
  func:t: 8da2dfcaf5ec007a
  overview: a4565203100aa81b
  style_tokens: 61db62d111d1a9a7
generated_at: 2026-08-25T07:40:06Z
---

## Genel Bakış
Bu modül, uygulamanın "Hakkımızda" sayfasını oluşturan bir React bileşenidir. Sayfa içeriğini, kullanıcının dil ayarına göre dinamik olarak gösterir ve metinleri yerelleştirmek için bir çeviri fonksiyonu kullanır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın yapısını ve içeriğini oluşturur. Dışarıdan bir dil parametresi alır ve sayfadaki metinleri bu dile göre göstermek için çeviri fonksiyonunu çağırır.
- AboutPage

### Çeviri Yardımcısı
Verilen bir anahtar (key) karşılığında, o anahtara atanmış çevrilmiş metin dizgesini döndürerek sayfanın çoklu dil desteğini sağlar.
- t

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarım yapılabilir.

[Aksiyom 1]: Eğer `lang` parametresi çağrıda belirtilmezse, varsayılan değer `'tr'` kullanılır.

[Aksiyom 2]: Eğer `AboutPageProps` tipi tanımlı değilse, bileşen derleme hatası verir.

[Aksiyom 3]: Eğer `t` fonksiyonuna geçerli bir `key` değeri sağlanmazsa, davranış bilinmiyor — fonksiyon gövdesi verilmediğinden hangi değeri döndüreceği belirlenemez.

---

## FONKSİYON DETAYLARI

### AboutPage
**Ne yapar**: `AboutPage` fonksiyonu, bir React bileşeni olarak "Hakkında" sayfasını oluşturur. Varsayılan dil parametresi olarak `'tr'` (Türkçe) alır ve `AboutPageProps` tipinde props ile çalışır.

**Nasıl yapar**: Fonksiyon, `lang` parametresini bir prop olarak alır ve varsayılan değeri `'tr'` olarak atanmıştır. Fonksiyon gövdesi verilen kaynakta yer almadığından, iç mantığı hakkında bilgi bulunmamaktadır.

**Parametreler**:
- lang: string — Bileşenin kullanılacağı dil kodu. Varsayılan değeri `'tr'` olarak atanmıştır.

**Dönüş**: `React.FC<AboutPageProps>` — `AboutPageProps` tipinde props alan bir React fonksiyonel bileşeni döndürür.

### t
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/ScrollReveal::ScrollReveal
- import: ../components/Seo::Seo
- import: ../data/brands::HVAC_BRANDS
- import: ../i18n/dictionaries/en::en
- import: ../i18n/dictionaries/tr::tr
- import: @/utils/routes::Routes
- import: @/utils/routes::localizedHref
- import: next/image::Image
- import: next/link::Link
- import: react::React

---

## INTERFACES

### AboutPageProps
- `lang?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/AboutPage.tsx::AboutPage
- **params**: `lang` — varsayılan değeri `'tr'` olan dil parametresi
- **ic_degiskenler**:
  - `dict` — `lang === 'en'` koşulu sağlanırsa `en` sözlüğünü, sağlanmazsa `tr` sözlüğünü atar
  - `t` — `key` parametresi alır, nokta notasyonuyla `dict` içinde gezinerek çeviri döndüren yardımcı fonksiyon
  - `stats` — dört elemanlı istatistik dizisi; her eleman `value` (string), `label` (`t()` ile çevrilmiş string) ve `icon` (React ikon bileşeni) alanlarına sahiptir
  - `coreValues` — üç elemanlı temel değerler dizisi; her eleman `title` (`t()` ile çevrilmiş string), `description` (`t()` ile çevrilmiş string) ve `icon` (React ikon bileşeni) alanlarına sahiptir
- **Dönüş**: JSX elementi — `<div className="min-h-screen bg-white">` kök elemanı içinde `Seo`, `ScrollReveal`, `Image`, `Link`, `BrandIcon` bileşenlerini kullanan React fonksiyonel bileşeni

### [N2_NASIL] AST Pointer: src/views/AboutPage.tsx::t
- **params**: `key` — nokta notasyonlu çeviri anahtarı (string)
- **ic_degiskenler**:
  - `parts` — `key` stringinin `'.'` karakteriyle bölünmesiyle elde edilen dizi
  - `current` — sözlükte gezinmek için kullanılan değişken, başlangıçta `dict` değerini alır (unknown tipinde)
  - `part` — `for...of` döngüsünde her bir anahtar parçası
  - `obj` — `current` değişkeninin `Record<string, unknown>` tipine dönüştürülmüş hali; `obj[part]` erişimiyle bir sonraki seviyeye geçilir
- **Dönüş**: string — çevrilmiş metin; bulunamazsa orijinal `key` değeri döner

---

## NODE ID STANDARD

  file: AboutPage.tsx
  function: AboutPage.tsx::AboutPage
  function: AboutPage.tsx::t

---

## DISA AKTARILANLAR (EXPORTS)
  export: AboutPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`, `sm:tracking-hvac-relaxed`, `tracking-hvac-loose`, `tracking-hvac-tight`, `tracking-hvac-wide`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-cyan-500/10`, `bg-gradient-to-b`, `bg-slate-200`, `bg-slate-50`, `bg-slate-950`, `bg-white`, `bg-white/5`, `border-4`, `border-b`, `border-cyan-500/20`, `border-slate-100`, `border-slate-200`, `border-white`, `border-white/10`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-col`, `flex-wrap`, `from-transparent`, `gap-12`, `gap-16`, `gap-24`, `gap-3`, `gap-6`, `gap-8`, `grid`, `grid-cols-2`, `h-12`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `-space-x-4`, `animate-pulse`, `aspect-square`, `border`, `brightness-0`, `brightness-50`, `duration-1000`, `duration-500`, `font-black`, `font-bold`, `font-extralight`, `font-light`, `font-medium`, `grayscale`, `group`