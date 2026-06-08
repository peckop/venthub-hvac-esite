---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx
skeleton_hash: 37480a504fe00518
entity_hashes:
  func:CentrifugalFanModel: 2ca1d8ced8088e61
  overview: 13b0dbbbe05fc33c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, santrifüj tip fanın (salyangoz fan) üç boyutlu modelini render eden bir React bileşeni içerir. Bileşen, fanın ana yapı taşlarını — tahrik motorunu, spiral konaklamayı ve radyal kanatlı pervaneyi — 3D ortamında görselleştirerek etkileşimli bir ürün gösterimi sunar. Props almayan bağımsız bir bileşendir.

## Fonksiyon Grupları
### 3D Bileşen Tanımı
Fanın three.js tabanlı üç boyutlu geometrisini ve malzemelerini oluşturarak sahneye yerleştiren bileşen tanımı grubudur.
- CentrifugalFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### CentrifugalFanModel
**Ne yapar**: Bu fonksiyon, santrifüj fanın 3B modelini gösteren bir React bileşeni tanımlar. Bileşen, fanın temel parçalarını (motor, konaklama ve pervane) temsil ederek kullanıcıya görsel bir yapı sunar.

**Nasıl yapar**: Fonksiyon içeriği, verilen docstring’te belirtilen özellikleri açıklayan bir JSX yapısı döndürür; motorun merkezi tahrik olduğu, konaklamanın spiral/salyangoz tipinde olduğu ve pervanenin radyal kanatlı, dönen yapı olduğu bilgileri bileşenin render ettiği öğelerle eşleştirir. Props almadığı için dışarıdan veri beklemez ve statik bir görselleştirme sağlar.

**Parametreler**:  
- (Parametre yok)

**Dönüş**: React.FC türünde bir fonksiyonel bileşen döner; bu, JSX elementi render ederek santrifüj fan modelini ekrana getirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CentrifugalFanModel.tsx::CentrifugalFanModel
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi; industrialBlue, industrialSteel, galvanizedSteel, darkGrey, motorSilver, logoRed, bladeBlack, matteBlack özelliklerini içerir, tüm mesh'lerin material prop'larında kullanılır
  - `impellerRef` — `useRef<THREE.Group>(null)` ile oluşturulan React ref nesnesi; dönen impeller grubuna (`<group ref={impellerRef}>`) bağlanır, useFrame callback'inde rotation.z değiştirilerek pervane döndürülür
  - `impellerBladeGeometry` — `useMemo` ile oluşturulan `THREE.ExtrudeGeometry`; geriye kıvrımlı santrifüj kanat geometrisi, 12 adet kanat mesh'inde `geometry` prop'unda kullanılır
  - `scrollShape` — `useMemo` ile oluşturulan `THREE.Shape`; spiral (salyangoz) muhafaza profilini tanımlar, `extrudeGeometry` args'inde kullanılır
- **Dönüş**: JSX — `<group scale={[1,1,1]}>` root elementi içeren 4 alt gruptan oluşan React Three Fiber bileşeni (Motor Grubu, Housing/Spiral Gövde, İmeller Grubu, Koruma Izgarası)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\CentrifugalFanModel.tsx
  function: src\components\products\3d\types\CentrifugalFanModel.tsx::CentrifugalFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CentrifugalFanModel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)