---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\data\brands.ts
skeleton_hash: d2735fab6497e2fb
entity_hashes:
  overview: 1c324d780c68eb8e
generated_at: 2026-06-12T10:23:07Z
---

## Genel Bakış

Bu modül, HVAC (Isıtma, Ventilasyon ve Klima) markalarına ilişkin statik veri koleksiyonunu içerir. Sistem genelinde kullanılan marka listesini tek bir merkezi noktadan sağlamak amacıyla tasarlanmıştır ve herhangi bir işlevsel mantık barındırmaz — yalnızca veri tanımlaması yapar.

## İçerik

`HVAC_BRANDS` sabiti, uygulama genelinde referans olarak kullanılan marka bilgilerini tutar. Bu veri yapısı, filtreleme menülerinde, raporlama ekranlarında veya marka bazlı arama fonksiyonlarında kullanılmak üzere dışa aktarılır. Dosya saf veri modülüdür; herhangi bir fonksiyon, sınıf veya mantıksal akış içermez.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için temel mimari varsayım, sunulan verinin tutarlılığı ve erişilebilirliğidir.

[Aksiyom 1]: Eğer `HVAC_BRANDS` sabiti tanımlanmamış veya boş bir array (`[]`) olarak tanımlanmışsa, uygulama içindeki tüm marka bazlı filtreleme, arama ve gösterim fonksiyonları (örneğin; filtre menüleri, marka listeleri, raporlama ekranları) boş sonuç döndürür veya marka verisini hiç sunamaz.

[Aksiyom 2]: Eğer `HVACBrand` arayüzündeki `name`, `slug` veya `description` alanları bir nesnede tanımlanmamışsa veya istenen tipte (string) değilse, o marka ile ilgili kullanıcı arayüzünde hatalı veya eksik bilgi görüntülenir. (`country` alanının tipi ve zorunluluğu belirtilmediği için varsayıma girmez.)

[Aksiyom 3

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
- `specialty?: string`
- `logo?: string`

---

## SABİTLER
- **HVAC_BRANDS** (array) — `[
  { 
    name: 'Vortice', 
    slug: 'vortice', 
    description: '1954 yıl...`

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

### Dosya Yapısı Özeti

**`C:\Users\alize\venthub-hvac\src\data\brands.ts`**

- **Tip**: Statik veri dosyası
- **İçerik**: Yalnızca `HVAC_BRANDS` sabit dizisi (array)
- **Fonksiyon**: yok
- **Import**: yok
- **Class**: yok

---

## NODE ID STANDARD

  file: src\data\brands.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: HVACBrand
  export: HVAC_BRANDS