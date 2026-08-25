---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\category\sections\silent-fan\SilentFanTypeComparison.tsx
skeleton_hash: 267e09361eb28321
entity_hashes:
  func:SilentFanTypeComparison: d3f5f980a16f61d9
  func:tr: b282b53f03d688a5
  overview: bed9a48986deb76b
  style_tokens: fb4db20eff738486
generated_at: 2026-08-25T07:25:19Z
---

## Genel Bakış
Bu modül, sessiz fan türlerinin karşılaştırılmasını görselleştiren bir React bileşeni sunar. Bileşen, kullanıcı arayüzünde farklı fan tiplerinin özelliklerini yan yana sergiler. Metin içerikleri çeviri desteğiyle sunulur.

## Fonksiyon Grupları

### Ana Bileşen
Sessiz fan tür karşılaştırma ekranını oluşturur ve render eder. Kullanıcıya farklı fan tiplerinin özelliklerini karşılaştırmalı olarak gösteren arayüzün tamamından sorumludur.
- SilentFanTypeComparison

### Yardımcı Fonksiyonlar
Bileşen içinde kullanılan metinlerin çevirisini sağlar. Verilen bir anahtar değeri karşılık gelen yerelleştirilmiş metinle eşleştirir.
- tr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan aksiyom üretilemez. Aksiyomlar yalnızca fonksiyon gövdelerinden türetilir; çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### SilentFanTypeComparison
**Ne yapar**: Sessiz fan türlerinin karşılaştırmasını gösteren bir React bileşeni oluşturur. React.FC tipinde bir fonksiyon döndürür.
**Nasıl yapar**: Kaynak dosyada fonksiyonun iç mantığı hakkında bilgi verilmemiştir. Bir React fonksiyonel bileşeni olarak tanımlanmıştır ve `React.FC` tipinde bir bileşen döndürür.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: `React.FC` — React fonksiyonel bileşeni döndürür.

### tr
**Ne yapar**: Verilen anahtar (key) değeriyle ilişkili çeviri/metin işleme işlevi gerçekleştirir.
**Nasıl yapar**: Kaynak dosyada fonksiyonun iç mantığı hakkında bilgi verilmemiştir. Muhtemelen bir çeviri (translation) yardımcısıdır; verilen key parametresine karşılık gelen metni işler.
**Parametreler**:
- key: `string` — İşlenecek metin anahtarı
**Dönüş**: Kaynakta dönüş tipi belirtilmemiştir; bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: @/components/ui/VentImage::VentImage
- import: @/hooks/useScrollAnimation::scrollAnimationClasses
- import: @/hooks/useScrollAnimation::useScrollAnimation
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Check
- import: lucide-react::X
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SilentFanTypeComparison.tsx::SilentFanTypeComparison
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu; metin anahtarlarını çevirmek için kullanılır
  - `dict` — useI18n hook'undan gelen sözlük nesnesi; çeviri verilerine erişmek için kullanılır
  - `sectionRef` — useScrollAnimation hook'undan gelen HTMLElement ref'i; section DOM elemanına bağlanır
  - `isVisible` — useScrollAnimation hook'undan gelen boolean; scroll animasyonunun tetiklenip tetiklenmediğini belirtir
  - `tr` — yerel çeviri yardımcısı fonksiyonu; `categorySilentFan.comparison.` öneki ile anahtarları t fonksiyonuna aktarır
  - `features` — `dict.categorySilentFan.comparison.features` dizisi; karşılaştırma özelliklerini içerir, yoksa boş dizi atanır
  - `f` — features.map callback'inde kullanılan tekil feature nesnesi; `f.label`, `f.standard`, `f.quiet` alanlarına erişilir
  - `i` — features.map callback'inde kullanılan sayısal indeks; key prop'u olarak kullanılır
- **Dönüş**: JSX elementi (section bileşeni)

### [N2_NASIL] AST Pointer: SilentFanTypeComparison.tsx::tr
- **params**: `key: string`
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (t fonksiyonunun dönüş değerini döndürür)

### [N3_NASIL] AST Pointer: SilentFanTypeComparison.tsx::features.map callback (orta sütun)
- **params**: `f`, `i: number`
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (div; `f.label` görüntüler)

### [N4_NASIL] AST Pointer: SilentFanTypeComparison.tsx::features.map callback (masaüstü kartlar)
- **params**: `f`, `i: number`
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (div; `f.standard` ve `f.quiet` görüntüler)

### [N5_NASIL] AST Pointer: SilentFanTypeComparison.tsx::features.map callback (mobil görünüm)
- **params**: `f`, `i: number`
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elementi (div; `f.label`, `f.standard`, `f.quiet` görüntüler)

---

## NODE ID STANDARD

  file: SilentFanTypeComparison.tsx
  function: SilentFanTypeComparison.tsx::SilentFanTypeComparison
  function: SilentFanTypeComparison.tsx::tr

---

## DISA AKTARILANLAR (EXPORTS)
  export: SilentFanTypeComparison

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-600`, `bg-blue-900/40`, `bg-center`, `bg-cover`, `bg-slate-100`, `bg-slate-50`, `bg-slate-900`, `bg-white`, `bg-white/80`, `border-b`, `border-slate-100`, `border-slate-200`, `border-white/5`, `last:border-0`, `md:text-5xl`
- **Layout:** `absolute`, `backdrop-blur`, `backdrop-blur-2`, `block`, `flex`, `flex-col`, `gap-0`, `gap-12`, `gap-4`, `grid`, `grid-cols-2`, `h-73px`, `h-full`, `hidden`, `items-center`
- **Varyant/Responsive:** `group-hover:`, `last:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${scrollAnimationClasses.fadeUp(isVisible`, `-mx-48`, `border`, `duration-700`, `font-bold`, `font-extrabold`, `font-medium`, `grayscale`, `group`, `group-hover:scale-110`, `inset-0`, `lg:col-start-3`, `lg:px-8`, `mb-1`, `mb-16`