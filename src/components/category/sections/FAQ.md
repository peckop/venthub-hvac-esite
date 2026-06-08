---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\FAQ.tsx
skeleton_hash: 9a13a98a037d1e22
entity_hashes:
  func:FAQ: 09e0c00f56bbdf5d
  overview: 46750effbb9bfa8b
  style_tokens: 44e8cc594d8dadd1
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
Bu modül, kategori sayfalarında sık sorulan sorular (FAQ) bölümünü gösteren bir React bileşeni tanımlar. Tek bir fonksiyonel bileşen üzerinden kullanıcıya soru‑cevap listesi sunar.

## Fonksiyon Grupları
### Ana Bileşen
FAQ bölümünün görsel yapısını ve içeriğini oluşturur.
- FAQ()

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### FAQ
**Ne yapar**: FAQ bileşeni, hava perdeleriyle ilgili sık sorulan soruları (SSS) bir akordiyon (accordion) biçiminde gösterir. Kullanıcıya soruya tıkladığında ilgili cevabı açıp kapatarak bilgiye hızlı erişim sağlar.

**Nasıl yapar**: Bileşen içindeki veri (örnek olarak sabit bir soru‑cevap listesi) harita fonksiyonu ile dönüştürülür; her bir soru için bir akordiyon öğesi oluşturulur ve tıklama olayıyla durum durumu (open/close) yönetilir. Sonuç olarak JSX döndürülür ve React tarafından render edilir.

**Parametreler**: Yok

**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen döner; bu, JSX elementi üreten ve React ağacına entegrasyon sağlayan bir fonksiyon anlamına gelir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/FAQ.tsx::FAQ
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `openIndex` — tutulan açık FAQ indeksi (number | null)
  - `setOpenIndex` — openIndex'i güncelleyen setter fonksiyonu
  - `faqs` — FAQ objelerinin dizisi, her objesi question ve answer stringlerinden oluşur
- **Dönüş**: JSX element (React component render output)

### [N2_NASIL] AST Pointer: src/components/category/sections/FAQ.tsx::(faq, index) => {...}
- **params**: `faq` — tek FAQ objesi (question, answer), `index` — o FAQ'ın dizindeki indeksi
- **ic_degiskenler**: 
  - `isOpen` — o FAQ'ın açık olup olmadığını belirten boolean (openIndex === index)
- **Dönüş**: JSX element (accordion item div)

---

## NODE ID STANDARD

  file: src\components\category\sections\FAQ.tsx
  function: src\components\category\sections\FAQ.tsx::FAQ

---

## DISA AKTARILANLAR (EXPORTS)
  export: FAQ

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gray-50`, `bg-white`, `border-blue-200`, `border-gray-200`, `hover:bg-gray-50`, `hover:text-blue-700`, `md:text-4xl`, `text-3xl`, `text-blue-500`, `text-blue-600`, `text-blue-700`, `text-center`, `text-gray-400`, `text-gray-600`
- **Layout:** `flex`, `flex-shrink-0`, `gap-2`, `gap-4`, `inline-flex`, `items-center`, `justify-between`, `max-h-0`, `max-h-96`, `max-w-3xl`, `overflow-hidden`, `p-5`, `p-6`, `shadow-md`, `w-full`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isOpen`, `:`, `border`, `duration-300`, `focus-ring`, `font-bold`, `font-semibold`, `leading-relaxed`, `lg:px-8`, `mb-12`, `mb-4`, `mt-12`, `mx-auto`, `pt-0`, `px-4`