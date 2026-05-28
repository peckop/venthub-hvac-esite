---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\brands.ts
skeleton_hash: 841b28ef640ab62d
entity_hashes:
  overview: 1c324d780c68eb8e
generated_at: 2026-05-28T22:38:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kullanılan tüm HVAC markalarını statik olarak barındıran bir veri modülüdür. Modül içinde tanımlanan `HVAC_BRANDS` sabit dizisi, projedeki çeşitli bileşenlerin marka listesine erişmesi için kullanılır. Herhangi bir ortam değişkenine, API çağırmaya veya dış veri kaynağına bağlı olmayan tamamen yerel bir veri seti sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, proje genelinde HVAC markalarını tutan statik bir veri modülüdür. Doğru çalışması için temel veri bütünlüğü varsayımları geçerlidir.

[Aksiyom 1]: Eğer `HVAC_BRANDS` dizisi tanımlı veya dışa aktarılmamışsa, projedeki marka bağımlılıklar alan tüm modüller çalışma zamanında hata alır.

[Aksiyom 2]: Eğer `HVAC_BRANDS` dizisi boş (`[]`) olarak tanımlıysa, marka listesini bekleyen UI bileşenleri veya filtre mekanizmaları işlevsiz kalır.

[Aksiyom 3]: Eğer `HVAC_BRANDS` dizisi değiştirilebilir (`const` yerine `let`) tanımlıysa, modülü farklı yerlerden içe aktaran modüller tutarsız veri看到ebilir (zamanlama bağımlı hatalar oluşabilir).

[Aksiyom 4]: Eğer dizi elemanlarının yapısı (shape) tutarsızsa, dizi elemanlarını işleyen tüketici modüllerde beklenmeyen `undefined` erişim hataları oluşur.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### HVACBrand
- `name: string`
- `slug: string`
- `description: string`
- `country: string`
- `founded?: number`
- `headquarters?: string`
- `website?: string`
- `specialty: string`
- `logo?: string`

---

## SABİTLER
- **HVAC_BRANDS** (array) — `[
  { 
    name: 'Vortice', 
    slug: 'vortice', 
    description: '1954...`

---

## AST POINTERS

Bu dosyada herhangi bir fonksiyon tanımlanmamıştır.

Dosya yalnızca şu sabiti içerir:

- **`HVAC_BRANDS`** — HVAC (Isıtma, Havalandırma, Klima) markalarını içeren array sabiti. Dosya tarafından export edilen tek yapıdır.

---

## NODE ID STANDARD

  file: src\lib\brands.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: HVACBrand
  export: HVAC_BRANDS