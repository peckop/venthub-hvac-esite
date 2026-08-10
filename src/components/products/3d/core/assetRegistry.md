---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\assetRegistry.ts
skeleton_hash: 05c08df6bc6524f4
entity_hashes:
  func:resolveAsset: af5d0cb4d33e6314
  overview: 43e3553e501ef7c3
generated_at: 2026-06-20T04:59:51Z
---

## Genel Bakış
Bu modül, 3D ürün bileşenleri için merkezi bir varlık kaydı (asset registry) işlevi görerek, sistem genelindeki 3D varlıkların (modeller, dokular, materyaller vb.) organize edilmesini ve erişilebilirliğini sağlar. Temel sorumluluğu, belirli bir anahtar ile varlık girdilerini çözüp (resolve) sunmaktır.

## Fonksiyon Grupları
### Varlık Çözümleme (Asset Resolution)
Bu grup, 3D varlık envanterinden belirli bir varlığın bilgilerini anahtar tabanlı olarak getirmekten sorumludur. Fonksiyon, çoklu kiracılı (multi-tenant) yapıyı destekleyerek opsiyonel bir kiracı kimliği ile farklı kiracılara ait varlık sürümlerini ayırt edebilir.
- resolveAsset

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimum sayıda aksiyom tanımlanmıştır; yalnızca fonksiyon imzasından doğrudan çıkarılabilir varsayımlar dahil edilmiştir.

**[Aksiyom 1]**: Eğer `key` parametresi geçerli bir `string` değer içermiyorsa, fonksiyon anlamlı bir varlık çözümlemesi yapamaz.

**[Aksiyom 2]**: Eğer bir asset anahtarı (`key`) kayıtlı asset havuzunda (registry) mevcut değilse, fonksiyon `undefined` döner ve çağrıcının bu durumu ele alması (null-check) gerekir; aksi halde kullanım noktasında runtime hatası oluşur.

**[Aksiyom 3]**: Eğer `_tenantId` parametresi sağlanmazsa (isteğe bağlı olduğundan), fonksiyon tenant-bağımsız (default) bir çözümleme davranışı sergilemelidir; aksi halde zorunlu olmayan parametrenin eksikliği fonksiyonun bozulmasına yol açar.

**[Aksiyom 4]**: Fonksiyonun dönüş tipi `AssetEntry | undefined` olduğundan, çağrı tarafında herhangi bir `_tenantId` kombinasyonu için `undefined` sonucu mümkünse, çağrııcının dönüş değerini doğrudan tip-güvenli (type-safe) biçimde ele alması gerekir; aksi halde TypeScript derleme/runtime döneminde hata oluşur.

---

## FONKSİYON DETAYLARI

### resolveAsset

**Ne yapar**: Bu fonksiyon, verilen bir anahtar (key) ile kayıtlı bir dijital varlığı (asset) arar ve ilgili AssetEntry nesnesini veya bulunamadığında `undefined` değerini döndürerek varlığın çözümlemesini sağlar.

**Nasıl yapar**: Fonksiyon, modülün bir parçası olan `ASSET_REGISTRY` sözlüğünde (veya哈希映射inde) doğrudan bir arama yaparak `key` parametresine karşılık gelen değeri döndürür. Yorum satırında belirtildiği üzere, bu arama işlemi tenant-scoped bir yol izler ve `assetBasePath` yapısıyla data-bleeding izolasyonunu (D2 modülünün bir parçası olarak) uygulamayı amaçlar.

**Parametreler**:
- `key`: `string` — Aranacak varlığın benzersiz tanımlayıcısı veya anahtarı.
- `_tenantId`: `string | undefined` — (Opsiyonel) Kiracı (tenant) identifikasyonu. Fonksiyon gövdesinde doğrudan kullanılmamakla birlikte, gelecekte tenant-scoped arama mantığını genişletmek için ayrılmıştır. Underscore前缀'i, parametrenin şu an için pasif olduğunu işaret eder.

**Dönüş**: `AssetEntry | undefined` — Bulunan varlığın detaylarını içeren bir `AssetEntry` nesnesi veya verilen `key` ile eşleşen bir kayıt yoksa `undefined`.

---

## INTERFACES

### AssetEntry
- `key: string`
- `path: string | null`
- `type: AssetType`
- `draco?: boolean`
- `ktx2?: boolean`

---

## TYPE ALIASES

### AssetType
```typescript
type AssetType = 'glb' | 'hdr' | 'procedural'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/core/assetRegistry.ts::resolveAsset
- **params**: `key: string` — lookup anahtarı; `ASSET_REGISTRY` dictionary'sinde erişim için kullanılır, `_tenantId?: string` — opsiyonel kiracı identifier'ı; fonksiyon gövdesinde kullanılmamaktadır (underscore prefix ile işaretli)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde yerel değişken tanımlanmamıştır)
- **Dönüş**: `AssetEntry | undefined` — `ASSET_REGISTRY[key]` erişiminin sonucu; anahtar registry'de mevcutsa ilgili `AssetEntry`, mevcut değilse `undefined` döner
- **Yan etkiler**: yok (pure lookup)
- **Dış bağımlılıklar**: `ASSET_REGISTRY` — modül seviyesinde tanımlı sözlük yapısı; `[key]` subscript erişimi ile okunur

---

## NODE ID STANDARD

  file: src\components\products\3d\core\assetRegistry.ts
  function: src\components\products\3d\core\assetRegistry.ts::resolveAsset

---

## DISA AKTARILANLAR (EXPORTS)
  export: AssetEntry
  export: AssetType
  export: resolveAsset