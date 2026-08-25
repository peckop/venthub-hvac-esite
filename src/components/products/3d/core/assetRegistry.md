---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\core\assetRegistry.ts
skeleton_hash: f37d67e03152c9b0
entity_hashes:
  func:resolveAsset: af5d0cb4d33e6314
  overview: 43e3553e501ef7c3
generated_at: 2026-08-25T07:26:04Z
---

## Genel Bakış
Bu modül, varlık (asset) kayıtlarını çözümlemekten sorumludur. Tek bir fonksiyon barındırır ve verilen bir anahtar (key) ile eşleşen varlık kaydını döndürür; eşleşme bulunamazsa `undefined` döner.

## Fonksiyon Grupları
### Varlık Çözümleme
Verilen bir anahtar değeri kullanarak kayıtlı varlık girişlerini arar ve çözümlemiş sonucu döndürür. İsteğe bağlı olarak kiracı kimliği (`_tenantId`) parametresi alır.
- `resolveAsset`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, gövde içeriğinden aksiyom üretmek mümkün değildir. Yalnızca fonksiyon imzası (`resolveAsset(key: string, _tenantId?: string) -> AssetEntry | undefined`) mevcuttur; imzadan aksiyom çıkarma bu çalışmanın kapsamı dışındadır.

---

## FONKSİYON DETAYLARI

### resolveAsset
**Ne yapar**: Verilen bir anahtar (key) ile ASSET_REGISTRY içindeki bir varlık girişini (AssetEntry) çözer ve döndürür. Bu işlem, tenant'a özel yol çözümlemesi yaparak farklı kiracılar arasında veri sızıntısı (data-bleeding) olmasını engelleyen bir izolasyon mekanizması sağlar.
**Nasıl yapar**: Fonksiyon, aldığı `key` parametresini doğrudan `ASSET_REGISTRY` nesnesinde indeks olarak kullanır ve eşleşen `AssetEntry` değerini döndürür. Eğer belirtilen anahtar kayıt defterinde mevcut değilse `undefined` döner. Gövdedeki yorumda belirtildiği üzere, bu mekanizma `assetBasePath` üzerinden tenant kapsamındaki yolları çözümleyerek D2 seviyesinde veri izolasyonu hedefler.
**Parametreler**:
- key: string — Çözümlenecek varlığın kayıt defterindeki benzersiz tanımlayıcı anahtarı.
- _tenantId?: string — (Opsiyonel) Tenant tanımlayıcısı. Parametre adının alt çizgi (_) ile başlaması ve fonksiyon gövdesinde kullanılmaması, bu bilginin yalnızca arayüz uyumluluğu veya gelecekteki kullanım için tutulduğunu gösterir.
**Dönüş**: AssetEntry | undefined — Belirtilen anahtarla eşleşen bir varlık girişi varsa `AssetEntry` tipinde nesne, aksi takdirde `undefined` döner.

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
- **params**: `key` (string) — erişilecek varlığın anahtar değeri; `ASSET_REGISTRY` sözlüğünde arama yapmak için kullanılır; `_tenantId` (string, opsiyonel) — kiracı kimliği, fonksiyon gövdesinde KULLANILMAZ, yalnızca imzada tanımlıdır
- **ic_degiskenler**: yok — fonksiyon gövdesinde tanımlanmış iç değişken bulunmaz
- **Dönüş**: `ASSET_REGISTRY[key]` — `AssetEntry | undefined`; dışarıdan erişilen `ASSET_REGISTRY` sözlüğünde `key` parametresiyle yapılan subscript erişiminin sonucu. Yorumda belirtildiği üzere tenant-scoped path ile data-bleeding izolasyonu (D2, P2) amaçlıdır

---

## NODE ID STANDARD

  file: assetRegistry.ts
  function: assetRegistry.ts::resolveAsset

---

## DISA AKTARILANLAR (EXPORTS)
  export: AssetEntry
  export: AssetType
  export: resolveAsset