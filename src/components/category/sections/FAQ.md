---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\FAQ.tsx
skeleton_hash: 6ed52d5ed59875d8
generated_at: 2026-05-23T21:59:06Z
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

## FONKSIYON DETAYLARI

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