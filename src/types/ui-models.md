---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
skeleton_hash: c0ae2609eb4ab5d0
generated_at: 2026-05-23T22:33:11Z
---

## Genel Bakış
Bu TypeScript modülü, VentHub HVAC projesinin kullanıcı arayüzü katmanında kullanılacak UI odaklı veri modellerinin tip tanımlarını barındıran, yalnızca derleme zamanında aktif olan bir tür tanım dosyasıdır. Projenin ilişkili `db-rows` modülünden veritabanı varlıklarına ait kategori ve ürün tiplerini import ederek, bu tipleri temel alarak UI katmanının ihtiyaç duyduğu özel veri tiplerini sunar. Herhangi bir çalıştırılabilir fonksiyon, runtime sabiti, ortam değişkeni kullanımı veya harici API/veritabanı sorgusu içermez, yalnızca TypeScript'in tip güvenliği özelliğini desteklemek için oluşturulmuştur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül yalnızca UI katmanı için TypeScript tip tanımları barındırır, çalışma zamanı yürütülebilir mantığı veya sabiti içermez, tüm işlevselliği TypeScript derleme ortamı tarafından sağlanır.

[Aksiyom 1]: Eğer projenin TypeScript derleyicisi bu modüldeki tip tanımlarının sözdizimini doğru şekilde çözümleyemiyorsa, UI bileşenlerinde tip güvenliği sağlanamaz, tip uyumsuzlukları çalışma zamanında kritik hataya yol açar.
[Aksiyom 2]: Eğer bu modüldeki tip tanımları, backend veya harici servislerden gelen veri yapılarıyla uyumsuz olursa, gelen verilerin UI'da doğru işlenmesi ve gösterilmesi mümkün olmaz, veri aktarım hataları oluşur.
[Aksiyom 3]: Eğer bu modül, proje içindeki import yolları aracılığıyla UI bileşenleri tarafından erişilebilir değilse, bu tipleri kullanan tüm bileşenler derleme aşamasında hata alır.
[Aksiyom 4]: Eğer modül içindeki tip tanımları proje boyunca güncellenen veri yapılarıyla senkronize tutulmazsa, eski tip bildirimleri nedeniyle yanlış UI işlemleri veya veri kayıpları meydana gelir.

---



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
### Kaynak Dosya Analizi: C:\Users\alize\venthub-hvac\src\types\ui-models.ts
- **Tespit Edilen Yapılar**: Dosyada tanımlı herhangi bir fonksiyon, sınıf veya çağrılabilir kod bloğu bulunmamaktadır
- **Mevcut İçerik**: Yalnızca `./db-rows` konumlu dosyadan `DbCategory` ve `DbProduct` tip importları alınmıştır
- **İşlevsel Kod Bloğu Tespiti**: Herhangi bir çalıştırılabilir kod, fonksiyon gövdesi veya değişken tanımı eksik olduğundan analiz edilecek işlevsel yapı bulunamamıştır

---

## NODE ID STANDARD

  file: src\types\ui-models.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: DomainCategory
  export: DomainProduct