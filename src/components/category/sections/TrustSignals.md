---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\TrustSignals.tsx
skeleton_hash: 08cd7eaf3309672a
generated_at: 2026-05-23T22:01:39Z
---

## Genel Bakış
TrustSignals bileşeni, kategori sayfasında güven ve güvenilirliği gösteren işaretleri (örneğin sertifika, garanti, müşteri yorumları) görsel olarak sunar. Bu bileşen, kullanıcıya ürün veya hizmetin güvenilirliğini hızlıca iletmek için tasarlanmıştır.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, kullanıcı arayüzüne güven işaretlerini ekleyen temel fonksiyonu içerir.
- TrustSignals

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### TrustSignals
**Ne yapar**: TrustSignals bileşeni, Vortice markasının güven sinyallerini gösteren bir bölüm render eder. Yeni site için şirketin itibarını ön plana çıkararak kullanıcı gücünü artırır.  
**Nasıl yapar**: Bileşen, iç içe geçmiş JSX elemanlarıyla güven rozetleri, müşteri yorumları, sertifika logoları gibi öğeleri düzenler ve bu öğeleri döndürür. Ekstra mantık veya state yönetimi içermez; sadece statik içerik sunar.  
**Parametreler**: yok  
**Dönüş**: React.FC türünde bir fonksiyon; çağrıldığında güven sinyalleri bölümünü temsil eden JSX döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/TrustSignals.tsx::TrustSignals
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `signals` — const signals = [...] array of objects each containing `icon` (Lucide icon component), `title` (string), and `description` (string); used to render the trust signal items via `.map`.
- **Dönüş**: JSX.Element (returns a `<section>` containing the trust signals grid and certification badges).

### [N2_NASIL] AST Pointer: src/components/category/sections/TrustSignals.tsx::mapCallback
- **params**: (signal, index)
- **ic_degiskenler**:
  - `Icon` — const Icon = signal.icon; extracts the Lucide icon component from the current signal object for rendering.
- **Dönüş**: JSX.Element (returns a `<div>` representing a single trust signal item with its icon, title, and description).

---

## NODE ID STANDARD

  file: src\components\category\sections\TrustSignals.tsx
  function: src\components\category\sections\TrustSignals.tsx::TrustSignals

---

## DISA AKTARILANLAR (EXPORTS)
  export: TrustSignals