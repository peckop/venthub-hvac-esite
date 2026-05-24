---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\TrustProofSection.tsx
skeleton_hash: a5f3970a11e5b758
generated_at: 2026-05-23T22:08:05Z
---

## Genel Bakış
Bu modül, kullanıcıya güven kanıtı gösteren bir bölüm (TrustProofSection) sunan bir React bileşenini içerir. Bileşen, çeviri sözlüğü ve güven strisi sözlüğü gibi dışarıdan gelen verileri alarak içeriği dinamik olarak doldurur ve görsel olarak güvenilirliği vurgulayan bir arayüz oluşturur.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün tek işlevini oluşturan bileşeni içerir; dışarıdan gelen çeviri ve güven strisi verilerini kullanarak güven kanıtı bölümünü render eder.
- TrustProofSection

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### TrustProofSection
**Ne yapar**: TrustProofSection bileşeni, sağlanan sözlük ve trust strip verilerini kullanarak güven kanıtı bölümünü render eder.  
**Nasıl yapar**: Props olarak gelen `dictionary` nesnesinden çeviri fonksiyonunu `t` olarak çıkarır ve `trustStripDict` verilerini iterate ederek her bir güven kanıtı öğesini JSX olarak döndürür; ardından bu öğeleri uygun bir wrapper içinde döner.  
**Parametreler**:
- dictionary: object — Çeviri anahtarlarını değerlere eşleyen nesne; `t` özelliği üzerinden çevrilen metinlere erişim sağlar.  
- trustStripDict: object — Güven kanıtı bölümünde gösterilecek öğelerin veri kümesi; her bir öğe genellikle başlık, açıklama ve ikon gibi alanları içerir.  
**Dönüş**: React.FC<TrustProofSectionProps> — Render edilen TrustProofSection bileşeni; JSX elementi döndürür.

---

## INTERFACES

### TrustProofDict
- `eyebrow?: string`
- `title?: string`
- `subtitle?: string`
- `visualAlt?: string`
- `badge?: string`
- `items?: Record<string, {`

### TrustStripDict

### TrustProofSectionProps
- `dictionary: TrustProofDict`
- `trustStripDict: TrustStripDict`

---

## SABİTLER
- **proofItems** (as_expression) — `[
  { 
    key: 'brands', 
    icon: (
      <svg width="20" height="20" view...`
- **trustStripKeys** (as_expression) — `['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuid...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/TrustProofSection.tsx::TrustProofSection
- **params**: dictionary: t, trustStripDict: stripDict
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/home/TrustProofSection.tsx::trustStripKeys.map callback
- **params**: key
- **ic_degiskenler**: yok
- **Dönüş**: JSX.Element

### [N3_NASIL] AST Pointer: src/components/home/TrustProofSection.tsx::proofItems.map callback
- **params**: item, index
- **ic_degiskenler**:
  - `itemDict` — object derived from t.items?.[item.key] with fallback {eyebrow:'',title:'',description:''}, used to access eyebrow, title, description for rendering each proof item.
  - `delayClass` — string selected from ['delay-0','delay-100','delay-200','delay-300'] based on index % 4, applied to animate fade‑up delay.
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\home\TrustProofSection.tsx
  function: src\components\home\TrustProofSection.tsx::TrustProofSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: TrustProofSection