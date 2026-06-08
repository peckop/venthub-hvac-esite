---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\ProblemSection.tsx
skeleton_hash: c1c1272ecfb3fd81
entity_hashes:
  func:ProblemSection: 8fcd7b70f98a256d
  overview: 691525b7605c18a4
  style_tokens: a37a5e86138e5e96
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, kategori sayfasında kullanıcıya "Problemi Tanı" başlıklı empati bölümünü sunan bir React bileşenidir. Dışarıdan prop almadan çalışır ve scroll animasyonları için gerekli durumları (örneğin görünürlük ve referans) kendi içinde yönetir. Bileşen, hava perdesi ihtiyacını vurgulayan metin ve görsel öğeleri içeren düzenli bir JSX yapısı döndürür.

## Fonksiyon Grupları
### Bileşen Renderlama
Bu grup, sorun bölümünün kullanıcı arayüzünde oluşturulmasını ve dinamik olarak görüntülenmesini sağlar.
- ProblemSection

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React bileşenidir ve dış bağımlılıkları minimum düzeyde tutulmalıdır.

[Aksiyom 1]: Eğer bileşen prop almıyorsa, tüm gösterilecek içerik bileşen içinde tanımlı olmalıdır veya bir veri kaynağından (API, context vb.) bağımsız olarak erişilebilir olmalıdır.

[Aksiyom 2]: Eğer React ortamı (DOM) mevcut değilse veya bileşen bir React ağacı içinde render edilmiyorsa, JSX döndürme işlemi başarısız olur.

[Aksiyom 3]: Eğer bileşen kategori sayfasında "sorun" bölümü olarak kullanılmıyorsa, beklenen sayfa yapısı bozulur.

---

## FONKSİYON DETAYLARI

### ProblemSection
**Ne yapar**: Kullanıcıya hava perdesi ihtiyacını hissettiren, "Problemi Tanı" bölümü olan bir empati bölümü render eder.  
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır ve JSX döndürerek bölümü UI'ya ekler. İçerik, kullanıcıya problem farkındalığı yaratmak amacıyla metin ve görsel öğeler içerir.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünde bir fonksiyon döndürür; bu fonksiyon render edildiğinde ilgili bölümü gösteren JSX elemanını üretir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/ProblemSection.tsx::ProblemSection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sectionRef` — useScrollAnimation hook'undan dönen ref objesi; section DOM elementine bağlanarak scroll izleme referansını sağlar
  - `isVisible` — useScrollAnimation hook'undan dönen boolean değer; section'ın görünür olup olmadığını belirler, CSS animasyon sınıflarının aktifleşmesini kontrol eder
  - `problems` — Problem kartlarının gösterildiği dizi; her eleman `{icon, title, stat, description, color, bgColor}` yapısındadır (DollarSign, Thermometer, Wind, Bug iconları, ilgili başlık, istatistik, açıklama, renk ve arka plan renkleri)
  - `problems[0].icon` — DollarSign icon bileşeni, "Enerji Kaybı" kartı için kullanılır
  - `problems[1].icon` — Thermometer icon bileşeni, "Sıcaklık Farkı" kartı için kullanılır
  - `problems[2].icon` — Wind icon bileşeni, "Hava Akışı" kartı için kullanılır
  - `problems[3].icon` — Bug icon bileşeni, "Zararlı Girişi" kartı için kullanılır
- **Dönüş**: JSX — Scroll animasyonlu problem bölümü; başlık, 4 adet problem kartı grid'i ve hava perdesi karşılaştırma bölümü içeren React section elementi

---

## NODE ID STANDARD

  file: src\components\category\sections\ProblemSection.tsx
  function: src\components\category\sections\ProblemSection.tsx::ProblemSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProblemSection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-blue-500/30`, `bg-gradient-to-b`, `bg-gradient-to-r`, `bg-red-500/30`, `bg-white`, `border-2`, `border-blue-300`, `border-gray-100`, `border-red-300`, `from-gray-50`, `from-red-500`, `hover:border-gray-200`, `md:text-4xl`, `sm:text-3xl`
- **Layout:** `absolute`, `flex`, `from-gray-50`, `from-red-500`, `gap-4`, `gap-8`, `grid`, `grid-cols-2`, `h-10`, `h-20`, `hidden`, `hover:shadow-lg`, `items-center`, `justify-center`, `lg:grid-cols-4`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${problem.bgColor`, `${problem.color`, `${scrollAnimationClasses.fadeUp(isVisible`, `${scrollAnimationClasses.scaleIn(isVisible`, `border`, `duration-300`, `font-bold`, `font-semibold`, `group`, `group-hover:scale-110`, `inset-0`, `lg:px-8`, `mb-1`, `mb-12`, `mb-2`