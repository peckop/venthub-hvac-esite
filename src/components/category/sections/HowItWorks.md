---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\HowItWorks.tsx
skeleton_hash: bc4f7b9d7d53d17d
generated_at: 2026-05-23T21:59:27Z
---

## Genel Bakış
Bu modül, ürünün veya hizmetin nasıl çalıştığını açıklayan bir bölümün React bileşenini tanımlar. Tek bir fonksiyon üzerinden kullanıcı arayüzü oluşturularak, “Nasıl Çalışır” içeriği sayfada render edilir.

## Fonksiyon Grupları
### Görüntüleme ve Yerleşim
Bu grup, bölümün görsel yapısını ve içeriğini oluşturan işlevi içerir.
- HowItWorks

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### HowItWorks
**Ne yapar**: İnteraktif bir “Nasıl Çalışır” bölümü oluşturarak hava perdesinin çalışma prensibini görselleştirir.  
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanır; içeriğinde görseller, açıklama metinleri ve gerekli durum yönetimi (state) kullanılarak kullanıcı etkileşimine yanıt veren animasyon veya açıklama kartları render edilir.  
**Parametreler**: Yok  
**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen; JSX döndürerek “Nasıl Çalışır” bölümünün tamamını render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/HowItWorks.tsx::HowItWorks
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `sectionRef` — referans到 DOM öğesi için scroll animasyonu kullanılır
  - `isVisible` — bölümün şu anda görünür olup olmadığını gösteren boolean değer
  - `activeStep` — açılan adımın (akkordiyon) indeksi
  - `setActiveStep` — `activeStep` state'ini güncelleyen setter fonksiyonu
  - `steps` — her adımın ikon, başlık, açıklama ve detayını içeren nesneler dizisi
- **Dönüş**: React.FC

### [N2_NASIL] AST Pointer: src/components/category/sections/HowItWorks.tsx::(step,index)=>...
- **params**: step, index
- **ic_degiskenler**:
  - `Icon` — `step.icon`тенден React bileşeni, adımın ikonunu render etmek için kullanılır
  - `isActive` — `step` indeksi `activeStep` ile eşleşiyorsa true, UI'yı aç/kapatmak için kullanılır
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\category\sections\HowItWorks.tsx
  function: src\components\category\sections\HowItWorks.tsx::HowItWorks

---

## DISA AKTARILANLAR (EXPORTS)
  export: HowItWorks

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-blue-500`, `bg-gray-100`, `bg-white`, `border-2`, `border-blue-500`, `border-gray-200`, `md:text-4xl`, `sm:text-3xl`, `sm:text-lg`, `text-2xl`, `text-base`, `text-blue-600`, `text-blue-700`, `text-center`
- **Layout:** `flex`, `flex-1`, `gap-4`, `gap-8`, `grid`, `h-auto`, `items-center`, `items-start`, `justify-between`, `lg:gap-12`, `lg:grid-cols-2`, `max-h-0`, `max-h-24`, `max-w-2xl`, `max-w-7xl`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
