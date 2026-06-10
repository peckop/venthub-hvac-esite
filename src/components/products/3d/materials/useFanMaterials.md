---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\materials\useFanMaterials.ts
skeleton_hash: ac08a6998abfba65
entity_hashes:
  func:useFanMaterials: 61fbb447cfb5105d
  overview: 6254e91c186b694f
generated_at: 2026-06-10T09:39:37Z
---

## Genel Bakış
Bu modül, 3D fan ürünlerinin görsel renderında kullanılan malzeme ve yüzey özelliklerini tanımlayan bir React hookudur. Tek bir hook fonksiyonu içerir ve bu fonksiyon, malzeme tanımını oluşturarak diğer 3D bileşenlere hazır bir veri yapısı sunar.

## Fonksiyon Grupları
### Malzeme Tanımlama
Fan modelinin 3D görünümünü belirleyen malzeme özelliklerini (örneğin, parlak, mat siyah yüzey) tutar ve buna ilişkin bir nesneyi dışarıya açar.
- useFanMaterials

---



---

## FONKSİYON DETAYLARI

### useFanMaterials
**Ne yapar**: Bilinmiyor (verilen bilgiye göre fonksiyonun görevi belirtilmemiştir).  
**Nasıl yapar**: Bilinmiyor (fonksiyonun iç mantığı sağlanmamıştır).  
**Parametreler**: Parametre yok.  
**Dönüş**: Return tipi void veya bilinmiyor olarak belirtilmiştir (net bir dönüş değeri belirtilmemiştir).

---

## TYPE ALIASES

### FanMaterials
```typescript
type FanMaterials = ReturnType<typeof useFanMaterials>
```

---

## SABİTLER
- **MATERIALS_CACHE** (object) — `{
    matteBlack: new MeshStandardMaterial({
        color: '#1a1a1a',
      ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/components/products/3d/materials/useFanMaterials.ts`::useFanMaterials
- **params**: (parametre yok)
- **ic_degiskenler**: (fonksiyon gövdesinde bildirilmiş dahili değişken yok)
- **Referanslar (fonksiyon içinde erişilen)**:
  - `MATERIALS_CACHE` — Önceden tanımlı nesne; tüm malzeme tanımlarını barındıran paylaşımlı önbellek nesnesi, spread (`...`) ile kopyalanarak return nesnesinin temelini oluşturur
  - `MATERIALS_CACHE.vorticeGreen` — `clampMat` alias'ı olarak döndürülen MeshBasicMaterial/MeshPhysicalMaterial referansı
  - `MATERIALS_CACHE.industrialSteel` — Hem `baseMat` hem de `galvanizedSteel` alias'ı olarak kullanılan standart malzeme referansı
  - `MATERIALS_CACHE.const_chassisInnerMat` — `chassisInnerMat` alias'ı olarak döndürülen şasi iç yüzey malzemesi referansı
- **Dönüş**: `{...MATERIALS_CACHE, clampMat, baseMat, chassisInnerMat, galvanizedSteel}` — Fan malzemeleri sözlüğü; `MATERIALS_CACHE`'in tüm anahtarlarını genişletir ve kısa isimlerle (alias) erişilebilir malzeme özellikleri ekler

---

## NODE ID STANDARD

  file: src\components\products\3d\materials\useFanMaterials.ts
  function: src\components\products\3d\materials\useFanMaterials.ts::useFanMaterials

---

## DISA AKTARILANLAR (EXPORTS)
  export: FanMaterials
  export: useFanMaterials