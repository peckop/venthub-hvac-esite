---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\preload.ts
skeleton_hash: de26798c54572da7
entity_hashes:
  func:preloadCategory: 5c31b78ecaccbf15
  func:preloadProduct: ffb09955ca2af5e6
  overview: fbf5026e6d49d8ba
generated_at: 2026-05-28T13:52:58Z
---

## Genel Bakış
(Sentez hatası)

---

## AXIOMS – Mimari Varsayımlar
(Sentez hatası)

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **getCachedProductBySlug** (call) — `cache(async (slug: string) => {
  return getProductBySlug(slug)
})`
- **getCachedCategoryData** (call) — `cache(async (slug: string) => {
  const { data, error } = await supabase
    ...`

---

## AST POINTERS
(Sentez hatası)

---

## NODE ID STANDARD

  file: src\lib\data\preload.ts
  function: src\lib\data\preload.ts::preloadProduct
  function: src\lib\data\preload.ts::preloadCategory

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCachedCategoryData
  export: getCachedProductBySlug
  export: preloadCategory
  export: preloadProduct