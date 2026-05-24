---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx
skeleton_hash: 943b3141203d5b8c
generated_at: 2026-05-23T22:18:31Z
---

## Genel Bakış
Bu modül, bir ürünün teknik özelliklerini ve performansını analiz eden akıllı çıkarım kartını gösterir. Supabase’tan `Product` tablosundan ürün verilerini çeker, `generateEngineeringSummary` fonksiyonu ile bu verilerden mühendislik odaklı özet üretir ve `useI18n` üzerinden çevirileri sağlar; ayrıca lucide-react ikon setiyle görsel destek sunar. Ortam değişkeni kullanımına gerek duyulmadan, sadece veri çekimi ve çıkarım üretimi süreçlerini yönetir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



---

## INTERFACES

### ProductSmartInferenceProps
- `product: Product`

---

## SABİTLER
- **ProductSmartInference** (call) — `React.memo(({ product }) => {
  const { t } = useI18n()
  const summaries =...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx::ProductSmartInference
- **params**: product
- **ic_degiskenler**:
  - `t` — translation function from `useI18n()` used to resolve i18n keys.
  - `summaries` — array of `EngineeringInference` objects produced by `generateEngineeringSummary(product)`.
  - `getIcon` — helper returning the appropriate Lucide icon component for a given inference type.
  - `getThemeColor` — helper returning a CSS gradient string for a given inference type.
- **Dönüş**: JSX element (returns `null` when `summaries` is empty, otherwise a container with the engineering analysis UI).

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx::getIcon
- **params**: type
- **ic_degiskenler**: yok
- **Dönüş**: JSX icon component (`Volume2`, `ShieldCheck`, `Zap`, `Cpu`, or `Activity`) with size 20 and a type‑specific color class.

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx::getThemeColor
- **params**: type
- **ic_degiskenler**: yok
- **Dönüş**: string containing a Tailwind CSS gradient (e.g., `'from-blue-500/10 to-transparent border-blue-200/50 text-blue-700'`).

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\product\ProductSmartInference.tsx::renderItem
- **params**: item, idx
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`div`) representing a single inference item with interactive styling, icon, label, value, and description.

---

## NODE ID STANDARD

  file: src\components\product\ProductSmartInference.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductSmartInference