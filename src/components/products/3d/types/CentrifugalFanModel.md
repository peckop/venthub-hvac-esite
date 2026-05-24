---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx
skeleton_hash: c33c6b43d86f7e23
generated_at: 2026-05-23T22:23:03Z
---

## Genel Bakış
Bu modül, santrifüval fan modelinin üç boyutlu görselleştirmesini sağlayan bir React bileşenini içerir. Bileşen, fanın geometrik ve görsel özelliklerini tanımlayarak 3D ortamında kullanıcıya etkileşimli bir gösterim sunar.

## Fonksiyon Grupları
### Bileşen Tanımı
Bileşenin ana yapısını ve dışa aktarımını gerçekleştiren fonksiyondur.
- CentrifugalFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### CentrifugalFanModel
**Ne yapar**: Bu fonksiyon, santrifüj fanın 3B modelini gösteren bir React bileşeni tanımlar. Bileşen, fanın temel parçalarını (motor, konaklama ve pervane) temsil ederek kullanıcıya görsel bir yapı sunar.

**Nasıl yapar**: Fonksiyon içeriği, verilen docstring’te belirtilen özellikleri açıklayan bir JSX yapısı döndürür; motorun merkezi tahrik olduğu, konaklamanın spiral/salyangoz tipinde olduğu ve pervanenin radyal kanatlı, dönen yapı olduğu bilgileri bileşenin render ettiği öğelerle eşleştirir. Props almadığı için dışarıdan veri beklemez ve statik bir görselleştirme sağlar.

**Parametreler**:  
- (Parametre yok)

**Dönüş**: React.FC türünde bir fonksiyonel bileşen döner; bu, JSX elementi render ederek santrifüj fan modelini ekrana getirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::CentrifugalFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook tarafından döndürülen materyal nesnesi; mesh component’lerde kullanılan renk ve finish referanslarını sağlar.
  - `impellerRef` — döngü pervane (impeller) grubuna referans olan useRef; useFrame içinde pervanenin rotation.z değerini güncelleyerek animasyon sağlar.
  - `impellerBladeGeometry` — useMemo ile bir kez hesaplanan THREE.ExtrudeGeometry; her impeller kanatı için aynı geometriyi yeniden kullanarak performansı artırır.
  - `scrollShape` — useMemo ile bir kez hesaplanan THREE.Shape; spiral housing (salyangoz) profili tanımlar ve extrudeGeometry ile 3D mesh oluşturulur.
- **Dönüş**: JSX.Element (React bileşeninin render çıktısı)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::useFrame_callback
- **params**: state, delta
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (useFrame callback’i bir değer döndürmez; sadece side‑effect yapar)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::impellerBladeGeometry_memo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — THREE.Shape nesnesi; kanat profili dış kenardan iç kenara quadraticCurve ve lineTo komutlarıyla çizilir.
  - `extrudeSettings` — ExtrudeGeometry için derleme, eğrilik ve segment ayarlarını tanımlayan yapı nesnesi.
- **Dönüş**: THREE.ExtrudeGeometry (tek bir impeller kanatı geometrisi)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::scrollShape_memo
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — THREE.Shape nesnesi; spiral housing (salyangoz) dış konturunu moveTo, lineTo ve quadraticCurveTo komutlarıyla tanımlar.
- **Dönüş**: THREE.Shape (spiral housing profili)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::coolingFin_map
- **params**: _, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (her soğutma kanadı için <mesh> elementi)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::impellerBlade_map
- **params**: _, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (her impeller kanatı için <group> içinde <mesh> elementi)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::protectionRing_map
- **params**: r, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (her koruma izgarası halkası için <mesh> elementi)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx::protectionWire_map
- **params**: angle, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (her koruma izgarası tel için <mesh> elementi)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\CentrifugalFanModel.tsx
  function: src\components\products\3d\types\CentrifugalFanModel.tsx::CentrifugalFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CentrifugalFanModel