---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
skeleton_hash: c0ae2609eb4ab5d0
entity_hashes:
  overview: 6e34f2c4a0b0ebfe
generated_at: 2026-05-28T22:38:42Z
---

## Genel Bakış

Bu dosya, VentHub HVAC projesinin UI katmanı için tip tanımları içeren, yalnızca derleme zamanında var olan bir TypeScript modülüdür. `db-rows` modülünden gelen `DbCategory` ve `DbProduct` veritabanı tiplerini import ederek, bu tipleri UI katmanının ihtiyaçlarına göre düzenlenmiş (sanitize) versiyonlar olarak tanımlar. Dosyada herhangi bir çalıştırılabilir kod, sabit veya fonksiyon bulunmamaktadır; tüm amacı TypeScript derleyicisi aracılığıyla tip güvenliği sağlamaktır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül yalnızca derleme zamanında aktif olan TypeScript tip tanımları içermektedir; herhangi bir çalıştırılabilir fonksiyon gövdesi barındırmaz.

**[Aksiyom 1]:** Eğer `db-rows` modülünden import edilen `Category` ve `Product` tip tanımları yoksa, bu modüldeki UI model tiplerinin temel yapıları tanımsız kalır ve derleme hatası oluşur.

**[Aksiyom 2]:** Eğer TypeScript derleyicisi (tsc) kullanılmıyorsa, bu dosyada tanımlanan tipler runtime ortamında hiçbir etkiye sahip olmaz; dosya tamamen yok sayılır.

**[Aksiyom 3]:** Eğer bu dosya bir UI katmanı bileşeni tarafından import edilmiyorsa, tanımlanan tipler hiçbir tip kontrolüne katkıda bulunmaz ve işlevsel olarak var olmaz.

**[Aksiyom 4]:** Eğer `db-rows` modülündeki kaynak tiplerde değişiklik yapılırsa, bu modüldeki UI model tanımlarının da güncellenmesi gerekir; aksi takdirde tip uyumsuzluk hataları oluşur.

**[Aksiyom 5]:** Bu dosyada herhangi bir runtime sabiti, ortam değişkeni veya harici API çağrısı bulunduğu varsayılamaz; tüm içerik statik tip tanımıyla sınırlıdır.

---

## FONKSİYON DETAYLARI

---

## TYPE ALIASES

### DomainCategory
DomainCategory: The sanitized, UI-ready version of a category. Refines DbCategory to guarantee name and description are strings.
```typescript
type DomainCategory = Omit<DbCategory, 'name' | 'description'> & {
  name: string;
  description: string;
}
```

### DomainProduct
DomainProduct: The sanitized, UI-ready version of a product. Refines DbProduct to guarantee name, description and brand are strings.
```typescript
type DomainProduct = Omit<DbProduct, 'name' | 'description' | 'brand'> & {
  name: string;
  description: string;
  brand: string;
}
```

---

## AST POINTERS

Bu dosyada fonksiyon bulunmamaktadır.

---

### Dosya Özeti: `C:\Users\alize\venthub-hvac\src\types\ui-models.ts`

**Dosya Tipi:** TypeScript type/interface tanım dosyası

**İçe Aktarılan Tipler:**
- `DbCategory` — `./db-rows` modülünden (veritabanı kategori satır yapısı)
- `DbProduct` — `./db-rows` modülünden (veritabanı ürün satır yapısı)

**Durum:** Dosya yalnızca type/interface tanımları içermektedir. Çalışan (executable) fonksiyon gövdesi, method veya sınıf metodu bulunmamaktadır. Bu nedenle AST Pointer oluşturulacak herhangi bir fonksiyon mevcut değildir.

---

## NODE ID STANDARD

  file: src\types\ui-models.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: DomainCategory
  export: DomainProduct