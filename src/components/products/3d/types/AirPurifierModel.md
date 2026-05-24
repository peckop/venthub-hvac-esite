---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\AirPurifierModel.tsx
skeleton_hash: 20ce6830cb167a2d
generated_at: 2026-05-23T22:22:50Z
---

## Genel Bakış
Bu modül, 3 boyutlu bir hav temizleyici modelini görselleştirmek için kullanılan bir React bileşenidir. Bileşen, modelin görünümünü ve etkileşimlerini tanımlayarak, ürün sayfasında veya ürün katalogunda 3D görüntülemeyi sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Bileşen, hav temizleyici modelinin render edilmesi, gerekli özelliklerin (props) alınması ve 3D görüntüleme kütüphanesi ile entegrasyonu gibi temel görevleri üstlenir.
- AirPurifierModel

---

## AXIOMS – Mimari Varsayımlar
Bu modülün temel varsayımı, `AirPurifierModel` fonksiyonunun parametre almadığı ve bu şartın sağlanmasıyla derleme‑ve çalışma zamanında beklenen davranışının gerçekleşeceğidir.

[Aksiyom 1]: Eğer `AirPurifierModel` fonksiyonuna **argüman geçilmezse**, fonksiyon TypeScript tarafından geçerli olarak kabul edilir ve çalıştırılabilir.  
[Aksiyom 2]: Eğer `AirPurifierModel` fonksiyonuna **bir veya daha fazla argüman geçilirse**, TypeScript derleme hatası oluşur ve fonksiyon çalışmayacaktır.

---

## FONKSIYON DETAYLARI

### AirPurifierModel
**Ne yapar**: AirPurifierModel adlı bir React fonksiyonel bileşenidir; bu dosya bir .tsx uzantılı bileşen tanımlar.  
**Nasıl yapar**: Fonksiyon hiçbir parametre almaz ve JSX döndürür; döndürülen JSX, bileşenin render edilmesi sırasında kullanılır.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: JSX elementi; dönüş tipi açıkça belirtilmemiş ancak React bileşenleri genellikle JSX döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/AirPurifierModel.tsx::AirPurifierModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — material object returned by `useFanMaterials` hook, provides `ral7035`, `brushedAluminum`, `matteBlack`, `industrialSteel` used for rendering meshes
- **Dönüş**: JSX.Element (returns the component’s JSX)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/AirPurifierModel.tsx::(x,i) arrow function (first map)
- **params**: (x, i)
- **ic_degiskenler**:
  - `x` — offset value from the array `[-0.25, 0.25]` used to position the side meshes on the X‑axis
  - `i` — iteration index from `map`, used as the React `key` prop
  - `materials` — material object from the parent scope, provides `brushedAluminum` for the side meshes
- **Dönüş**: JSX.Element (returns a `<mesh>` JSX element)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/AirPurifierModel.tsx::(_,i) arrow function (second map)
- **params**: (_, i)
- **ic_degiskenler**:
  - `_` — unused placeholder for the array element (value) from `Array(10).fill(0)`
  - `i` — iteration index, used to compute the vertical position `0.35 - (i * 0.08)` and as the React `key`
  - `materials` — material object from the parent scope, provides `industrialSteel` for the perforation meshes
- **Dönüş**: JSX.Element (returns a `<mesh>` JSX element)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\AirPurifierModel.tsx
  function: src\components\products\3d\types\AirPurifierModel.tsx::AirPurifierModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: AirPurifierModel