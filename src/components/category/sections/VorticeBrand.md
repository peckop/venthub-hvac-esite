---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\VorticeBrand.tsx
skeleton_hash: e7b568aa0d2a584f
entity_hashes:
  func:VorticeBrand: a8d2715dd40c7de5
  overview: 0819e90fcacb5fea
  style_tokens: 751231d1b5ff9e5b
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
VorticeBrand modülü, Vortice markasının 70 yıllık İtalyan mühendisliği ve güvenilirlik hikayesini anlatan, sayfa içine yerleştirilmiş bir bölüm bileşenidir. Props almayan bu bileşen, statik içerik ve görsellerle marka hikayesini sunar; ayrıca viewport'a girdiğinde tetiklenen kaydırma animasyonları kullanarak dinamik bir görünüm sağlar.

## Fonksiyon Grupları
### Ana Bileşen ve İçerik Yapısı
Bileşenin temel yapısını ve sunduğu statik içeriği tanımlar. Vortice markasının hikayesini, başlığını, açıklamasını ve temel görsellerini kapsayan bölümü oluşturur.
- VorticeBrand

### Animasyon ve Görünür Alan Mantığı
Bileşenin görünür alana girdiğinde tetiklenen animasyonları kontrol eden mantık ve ilgili CSS sınıf adlarını yönetir. Bu, kaydırma esnasında farklı bölümlerin (başlık, açıklama, istatistikler vb.) sırayla veya eş zamanlı olarak kaybolup belirmesini sağlar.
- VorticeBrand (fonksiyon içindeki animasyon değişkenleri ve mantığı)

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediği için kapsamlı mimari varsayımlar üretilememektedir. Sadece fonksiyon imzasından türetilen temel varsayım aşağıdadır.

[Aksiyom 1]: Eğer VorticeBrand fonksiyonu için hiçbir parametre tanımlanmamışsa, bileşen dış bağımlılıklara ihtiyaç duymayan, tamamen içeriği statik olan bir yapıda çalışır.

---

## FONKSİYON DETAYLARI

### VorticeBrand
**Ne yapar**: Vortice markasının 70 yıllık İtalyan mühendisliği ve güvenilirlik hikayesini gösteren bir bölüm bileşeni render eder.  
**Nasıl yapar**: Fonksiyon, JSX ile bir `<section>` (veya benzeri kapsayıcı) döndürerek başlık, açıklama ve görsel öğeleri yerleştirir; dışarıdan prop almaz ve kendi iç durumunu yönetmez.  
**Parametreler**: Yok  
**Dönüş**: `React.FC` türünde bir fonksiyon bileşeni; render edildiğinde Vortice marka hikayesi bölümüyle ilgili JSX döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: category/sections/VorticeBrand.tsx::VorticeBrand
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `dict` — useI18n hook'undan gelen çeviri sözlüğü nesnesi
  - `sectionRef` — section elementi için ref referansı, scroll animasyonu için DOM elementini temsil eder
  - `isVisible` — section'ın görünür olup olmadığını belirten boolean, scroll animasyonu kontrolü için kullanılır
  - `bDict` — Vortice markasına ait çeviri içeriği (dict.category.vorticeBrand)
  - `icons` — Clock, Globe, Award, Star icon bileşenlerinden oluşan dizi
  - `highlights` — icons dizisinin .map() ile işlenmesiyle oluşan, her bir highlight item için {icon, value, label, description} nesneleri içeren dizi
- **Dönüş**: React.FC (JSX elementi - section yapısı)

### [N2_NASIL] AST Pointer: category/sections/VorticeBrand.tsx::VorticeBrand (first map callback)
- **params**: (Icon, index) - Icon: icon bileşeni, index: dizi indeksi
- **ic_degiskenler**: 
  - `item` — bDict.highlights[index] erişimi ile alınan mevcut highlight verisi
- **Dönüş**: {icon: Icon, value: item.value, label: item.label, description: item.desc} nesnesi

### [N3_NASIL] AST Pointer: category/sections/VorticeBrand.tsx::VorticeBrand (second map callback)
- **params**: (item, index) - item: highlight nesnesi, index: dizi indeksi
- **ic_degiskenler**: 
  - `Icon` — item.icon erişimi ile alınan icon bileşeni
- **Dönüş**: JSX elementi (div yapısı)

---

## NODE ID STANDARD

  file: src\components\category\sections\VorticeBrand.tsx
  function: src\components\category\sections\VorticeBrand.tsx::VorticeBrand

---

## DISA AKTARILANLAR (EXPORTS)
  export: VorticeBrand

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-gradient-to-t`, `bg-green-500`, `bg-red-500`, `bg-white`, `bg-white/10`, `bg-white/5`, `border-t`, `border-white/10`, `from-black/70`, `from-slate-900`, `hover:bg-white/10`, `md:text-4xl`, `sm:text-3xl`, `sm:text-base`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-wrap`, `from-black/70`, `from-slate-900`, `gap-1.5`, `gap-2`, `gap-8`, `grid`, `grid-cols-4`, `h-5`, `h-auto`, `hidden`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${scrollAnimationClasses.fadeIn(isVisible`, `${scrollAnimationClasses.fadeUp(isVisible`, `border`, `font-bold`, `font-medium`, `inset-0`, `lg:px-8`, `mb-1`, `mb-4`, `mb-6`, `mt-8`, `mx-auto`, `opacity-5`, `pt-6`, `px-3`