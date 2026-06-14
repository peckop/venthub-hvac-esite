---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\ProblemSection.tsx
skeleton_hash: d4e1011fa291157e
entity_hashes:
  func:ProblemSection: 8fcd7b70f98a256d
  overview: b61cb8f6c12ac577
  style_tokens: a37a5e86138e5e96
generated_at: 2026-06-14T20:13:13Z
---

## Genel Bakış
Bu modül, kategori sayfasında kullanıcının sorununu fark etmesini amaçlayan "Problemi Tanı" adlı empati bölümünü oluşturan bağımsız bir React bileşenidir. Dışarıdan herhangi bir prop veya veri kaynağı almadan çalışır ve tüm içeriği (metin, görseller ve layout) kendi içinde barındırır. Bileşen, sayfanın akışına entegre olarak dinamik bir şekilde render edilir.

## Fonksiyon Grupları
### Bileşen Renderlama
Bu grup, modülün temel ve tek sorumluluğu olan ProblemSection bileşeninin, kategori sayfası içindeki belirlenen yerde kullanıcı arayüzünü oluşturmasını ve sunmasını ifade eder.
- ProblemSection

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### ProblemSection
**Ne yapar**: Kullanıcıya hava perdesi ihtiyacını hissettiren, "Problemi Tanı" bölümü olan bir empati bölümü render eder.  
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır ve JSX döndürerek bölümü UI'ya ekler. İçerik, kullanıcıya problem farkındalığı yaratmak amacıyla metin ve görsel öğeler içerir.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünde bir fonksiyon döndürür; bu fonksiyon render edildiğinde ilgili bölümü gösteren JSX elemanını üretir.

---

## İTHALATLAR (IMPORTS)
- import: ../../../hooks/useScrollAnimation::scrollAnimationClasses
- import: ../../../hooks/useScrollAnimation::useScrollAnimation
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Bug
- import: lucide-react::DollarSign
- import: lucide-react::Thermometer
- import: lucide-react::Wind
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: ProblemSection.tsx::ProblemSection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, bileşen içindeki tüm metinleri uluslararası dilde göstermek için kullanılır
  - `sectionRef` — useScrollAnimation hook'undan dönen ref nesnesi, section DOM elementine referans verir, animasyon kontrolü için kullanılır
  - `isVisible` — useScrollAnimation hook'undan dönen boolean değer, section'ın görünüp görünmediğini belirler, animasyon sınıflarını koşullu olarak ekler
  - `problems` — Dörtproblem nesnesinden oluşan dizi, her problem için icon, başlık, istatistik, açıklama ve renk bilgilerini tutar
- **Dönüş**: JSX section elementi (problemleri ve karşılaştırmayı gösteren bileşen)

### [N2_NASIL] AST Pointer: ProblemSection.tsx::(problem, index) => {...}
- **params**: (problem, index) — problem: problems dizisindeki mevcut problem nesnesi, index: dizi indeks numarası
- **ic_degiskenler**:
  - `Icon` — problem.icon değerinden alınan icon bileşeni (DollarSign, Thermometer, Wind veya Bug), JSX içinde render edilir
- **Dönüş**: JSX div elementi (problem kartını gösteren bileşen)

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