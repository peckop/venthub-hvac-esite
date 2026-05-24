---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\brands.ts
skeleton_hash: 841b28ef640ab62d
generated_at: 2026-05-23T22:30:57Z
---

## Genel Bakış
VentHub HVAC projesinde yer alan bu basit statik veri modülü, proje genelinde tüm birimlerce erişilebilen HVAC ekipmanı markalarının merkezi bir listesini barındırır. Hiçbir dış bağımlılık, çalıştırılabilir fonksiyon veya dinamik işlem barındırmayan modül, yalnızca `HVAC_BRANDS` adında bir sabit değişken tutar; bu sabit projenin ihtiyaç duyduğu tüm noktalarda içe aktarılarak desteklenen marka listesi olarak kullanılır. Herhangi bir ortam değişkeni veya harici kaynak kullanmayan, hiçbir API veya tablo sorgulaması yapmayan tamamen yerel bir statik veri kaynağıdır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, proje genelinde kullanılan geçerli HVAC marka listesini tutan statik sabit modülüdür, doğru şekilde kullanılabilmesi için tanımlı, erişilebilir ve içeriğinin tutarlı olması zorunludur.

[Aksiyom 1]: Eğer dosya içinde `HVAC_BRANDS` adında dizi tipinde sabit tanımlı değilse, bu modülü import eden tüm modüllerde marka listesi erişiminde derleme veya runtime hatası oluşur.
[Aksiyom 2]: Eğer bu modülün dosya yolu, import edildiği tüm projelerde doğru şekilde çözülemiyorsa, modül yüklenemez ve proje çalıştırılamaz.
[Aksiyom 3]: Eğer `HVAC_BRANDS` dizisindeki hiçbir eleman geçerli marka tanımı içermiyorsa, bu listeyi kullanan marka filtreleme, listeleme işlemleri boş veya hatalı sonuç üretir.
[Aksiyom 4]: Eğer `HVAC_BRANDS` dizisinin runtime içinde değiştirilemezlik garantisi yoksa, harici bir modül tarafından listede yapılan yetkisiz değişiklikler tüm projedeki marka kullanımlarını bozar.

---



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
### Kaynak Dosya: C:\Users\alize\venthub-hvac\src\lib\brands.ts
Bu dosyada tanımlı herhangi bir fonksiyon, metot veya sınıf üyesi işlev bulunmamaktadır. Dosyada sadece tek bir sabit tanımlanmıştır:
- `HVAC_BRANDS` — Dizi (array) tipinde, HVAC markası verilerini depolamak üzere tanımlanmış dosya seviyesi sabit

---

## NODE ID STANDARD

  file: src\lib\brands.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: HVACBrand
  export: HVAC_BRANDS