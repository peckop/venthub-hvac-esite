---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\RoofFanModel.tsx
skeleton_hash: 9a37848baf30c0f7
entity_hashes:
  func:RoofFanModel: 00a33874d8f27b4a
  overview: e6d3caa5c4d66c53
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:21:45Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün görselleştirme altyapısında çatı tipi vantilatörlerin 3D modelini render eden tek bir React bileşeni içerir. Bileşen, projenin 3D sahnelerinde bağımsız bir model gösterim birimi olarak kullanılmak üzere tasarlanmıştır.

## Fonksiyon Grupları
### Ana 3D Model Bileşeni
Modülün tüm işlevini tek bir merkezi bileşen üstlenir; çatı vantilatörünün 3D modelini oluşturur ve React uygulamasına entegre eder.
- RoofFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, gövdeden türetilen özel aksiyom belirlenememiştir.

---

## FONKSİYON DETAYLARI

### RoofFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3B modelleme bileşenleri ailesinde yer alan RoofFanModel, çatı tipi fanların interaktif 3 boyutlu modelini kullanıcı arayüzünde görüntüleyen bir React bileşenidir. Kullanıcıların ürünlerin fiziksel görünümünü ve yapısal detaylarını dijital ortamda inceleyebilmesini sağlayarak ürün vitrini deneyimini geliştirir.
**Nasıl yapar**: React fonksiyonel bileşen standartlarına uygun olarak geliştirilen bu bileşen, proje içindeki src/components/products/3d/types/RoofFanModel.tsx konumunda saklanır. Projede entegre edilen 3B modelleme kütüphaneleri ile uyumlu çalışarak, import edildiği ilgili sayfanın 3B sahnesine çatı fanına özel modeli yükler ve kullanıcının etkileşim kurabileceği bir şekilde sunar.
**Parametreler**: Tanımlı herhangi bir zorunlu özel parametresi bulunmamaktadır, standart React fonksiyonel bileşen kurallarına uygun olarak tüm React bileşen props'larını isteğe bağlı olarak kabul edebilir.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür, bu bileşen herhangi bir DOM konumuna eklendiğinde tanımlı çatı fanı 3B modelini sorunsuz şekilde kullanıcıya sunar.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/drei::useTexture
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## SABİTLER
- **LATHE_POINTS** (array) — `[
    new Vector2(0.69, 0.58),  // Shroud eteği alt (DIŞA AÇILI/KONİK)
    ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::useFrame callback (rotor animasyonu)
- **params**: `_state` — useFrame durum nesnesi (kullanılmıyor), `delta` — kareler arası geçen süre (saniye)
- **ic_degiskenler**:
  - `rotorRef.current` — rotor grubunun Three.js referansı; `rotation.y` özelliği her karede `delta * 6` kadar azaltılır (sürekli dönme animasyonu)
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::logoMat factory (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `logoTexture` — `useTexture` ile yüklenmiş logo dokusu; `map` olarak atanır
  - `MeshStandardMaterial` — Three.js standart materyal sınıfı; `transparent: false`, `side: DoubleSide` ile oluşturulur
- **Dönüş**: `MeshStandardMaterial` nesnesi

### [N3_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::geometries factory (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `basePlateGeo` — `BoxGeometry(1.42, 0.10, 1.42)` taban plakası geometrisi
  - `inletFlangeGeo` — `CylinderGeometry(0.28, 0.32, 0.01, 32)` giriş flanşı geometrisi
  - `inletFlangeCircleGeo` — `CircleGeometry(0.24, 32)` giriş flanşı daire geometrisi
  - `boltGeo` — `CylinderGeometry(0.015, 0.015, 0.04, 8)` köşe cıvatası geometrisi
  - `staticInletGeo` — `CylinderGeometry(0.24, 0.28, 0.24, 64, 1, true)` açık uçlu statik giriş silindiri
  - `supportLamaGeo` — `BoxGeometry(0.01, 0.51, 0.045)` destek laması geometrisi
  - `supportFootGeo` — `BoxGeometry(0.08, 0.01, 0.045)` L-ayak geometrisi
  - `supportBoltNutGeo` — `CylinderGeometry(0.02, 0.02, 0.03, 6)` ayak montaj somunu geometrisi
  - `supportBoltStudGeo` — `CylinderGeometry(0.01, 0.01, 0.02, 16)` ayak montaj saplaması geometrisi
  - `supportBoltSideGeo` — `CylinderGeometry(0.008, 0.008, 0.015, 6)` lama yan cıvatası geometrisi
  - `wireGeo` — `CylinderGeometry(0.002, 0.002, 0.51, 4)` tel geometrisi
  - `ringGeo` — `TorusGeometry(0.665, 0.002, 8, 64)` halka geometrisi
  - `rotorBackPlateGeo` — `CylinderGeometry(0.40, 0.40, 0.012, 64)` rotor arka plakası geometrisi
  - `rotorFrontPlateGeo` — `CylinderGeometry(0.28, 0.40, 0.012, 64)` rotor ön plakası geometrisi
  - `rotorInletLipGeo` — `CylinderGeometry(0.24, 0.28, 0.04, 64, 1, true)` rotor giriş dudağı geometrisi
  - `rotorHubGeo` — `CylinderGeometry(0.055, 0.055, 0.56, 32)` rotor göbek geometrisi
  - `rotorHubFlangeGeo` — `CylinderGeometry(0.08, 0.08, 0.02, 32)` rotor göbek flanşı geometrisi
  - `bladeNarrowGeo` — `BoxGeometry(0.10, 0.54, 0.008)` dar kanat segmenti geometrisi
  - `bladeWideGeo` — `BoxGeometry(0.11, 0.54, 0.008)` geniş kanat segmenti geometrisi
  - `latheGeo` — `LatheGeometry(LATHE_POINTS, 64)` döner geometri; `LATHE_POINTS` sabit dizisi kullanılır
  - `bracketHorizontalGeo` — `BoxGeometry(0.05, 0.02, 0.04)` kelepçe yatay parça geometrisi
  - `bracketVerticalGeo` — `BoxGeometry(0.02, 0.08, 0.04)` kelepçe dikey parça geometrisi
  - `logoPlaneGeo` — `PlaneGeometry(0.14, 0.14)` logo düzlem geometrisi
  - `logoWhiteCircleGeo` — `CircleGeometry(0.035, 32)` logo beyaz daire geometrisi
  - `logoRedCircleGeo` — `CircleGeometry(0.02, 32)` logo kırmızı daire geometrisi
  - `logoCenterCircleGeo` — `CircleGeometry(0.008, 16)` logo merkez daire geometrisi
  - `topCapLowerGeo` — `CylinderGeometry(0.208, 0.208, 0.03, 64)` üst kapak alt parça geometrisi
  - `topCapUpperGeo` — `CylinderGeometry(0.224, 0.224, 0.08, 64)` üst kapak üst parça geometrisi
  - `topCapBoltGeo` — `CylinderGeometry(0.006, 0.006, 0.005, 12)` üst kapak cıvatası geometrisi
  - `eyeboltTorusGeo` — `TorusGeometry(0.02, 0.005, 12, 24)` halkalı cıvata geometrisi
- **Dönüş**: tüm geometrileri içeren nesne (yukarıdaki 30 alan)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::useEffect cleanup factory (dış ok)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `geometries` — useMemo ile oluşturulmuş geometri nesnesi; `Object.values()` ile tüm geometrilere `dispose()` çağrılır
  - `logoMat` — useMemo ile oluşturulmuş logo materyali; `dispose()` çağrılır
- **Dönüş**: cleanup fonksiyonu (iç fonksiyon — kaynak temizleme)

### [N5_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::useEffect cleanup (iç fonksiyon)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `geometries` — `Object.values()` ile gezilir, her geometriye `dispose()` çağrılır
  - `logoMat` — `dispose()` çağrılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::cornerBolt render callback (.map)
- **params**: `pos` — köşe cıvatası [x, z] konum çifti, `i` — dizi indeksi
- **ic_degiskenler**:
  - `pos[0]` — x koordinatı; `position` prop'unun ilk elemanı olarak kullanılır
  - `pos[1]` — z koordinatı; `position` prop'unun üçüncü elemanı olarak kullanılır
  - `geometries.boltGeo` — cıvata geometrisi
  - `materials.industrialSteel` — endüstriyel çelik materyal
- **Dönüş**: `<mesh>` JSX elemanı

### [N7_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::support render callback (.map)
- **params**: `rot` — radyan cinsinden dönüş açısı, `i` — dizi indeksi
- **ic_degiskenler**:
  - `geometries.supportLamaGeo` — lama gövdesi geometrisi
  - `geometries.supportFootGeo` — L-ayak geometrisi
  - `geometries.supportBoltNutGeo` — ayak montaj somunu geometrisi
  - `geometries.supportBoltStudGeo` — ayak montaj saplaması geometrisi
  - `geometries.supportBoltSideGeo` — lama yan cıvatası geometrisi
  - `materials.darkGrey` — koyu gri materyal (lama ve ayak için)
  - `materials.industrialSteel` — endüstriyel çelik materyal (cıvatalar için)
  - `materials.castBladeMat` — döküm kanat materyali (saplama için)
- **Dönüş**: `<group>` JSX elemanı (lama gövdesi, L-ayak, montaj cıvaları ve yan cıvataları içerir)

### [N8_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::supportBolt render callback (iç .map)
- **params**: `y` — y ekseni pozisyonu (0.20, 0, -0.20), `j` — iç dizi indeksi
- **ic_degiskenler**:
  - `i` — dış scope'dan gelen üst dizi indeksi; key oluşturmak için kullanılır
  - `geometries.supportBoltSideGeo` — lama yan cıvatası geometrisi
  - `materials.industrialSteel` — endüstriyel çelik materyal
- **Dönüş**: `<mesh>` JSX elemanı

### [N9_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::wire render callback (.map)
- **params**: `_` — kullanılmayan değer, `i` — dizi indeksi (0-63)
- **ic_degiskenler**:
  - `i % 16` — her 16 telde bir lama yerine denk gelir; bu durumda `null` döner (atlanır)
  - `angle` — `(i / 64) * Math.PI * 2` formülüyle hesaplanan açı
  - `r` — sabit `0.665` yarıçap; lamaların hemen içinden geçecek mesafe
  - `geometries.wireGeo` — tel geometrisi
  - `materials.bladeBlack` — siyah kanat materyali
- **Dönüş**: `<mesh>` JSX elemanı veya `null` (lama pozisyonlarında)

### [N10_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::ring render callback (.map)
- **params**: `_` — kullanılmayan değer, `k` — dizi indeksi
- **ic_degiskenler**:
  - `geometries.ringGeo` — halka geometrisi
  - `materials.bladeBlack` — siyah kanat materyali
- **Dönüş**: `<mesh>` JSX elemanı

### [N11_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::blade render callback (.map)
- **params**: `_` — kullanılmayan değer, `i` — dizi indeksi (0-8, 9 kanat)
- **ic_degiskenler**:
  - `baseAngle` — `(i / 9) * Math.PI * 2` formülüyle hesaplanan kanat açısı
  - `geometries.bladeNarrowGeo` — dar kanat segmenti geometrisi (segment 1 ve 4)
  - `geometries.bladeWideGeo` — geniş kanat segmenti geometrisi (segment 2 ve 3)
  - `materials.roofBlade` — çatı kanat materyali
- **Dönüş**: `<group>` JSX elemanı (4 segmentli kanat yapısı: hub yakını, iç orta, dış orta, dış kenar)

### [N12_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::clip render callback (.map)
- **params**: `rot` — radyan cinsinden dönüş açısı, `i` — dizi indeksi
- **ic_degiskenler**:
  - `geometries.bracketHorizontalGeo` — kelepçe yatay parça geometrisi
  - `geometries.bracketVerticalGeo` — kelepçe dikey parça geometrisi
  - `materials.industrialSteel` — endüstriyel çelik materyal
- **Dönüş**: `<group>` JSX elemanı (yatay ve dikey kelepçe parçaları)

### [N13_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::topBolt render callback (.map)
- **params**: `_` — kullanılmayan değer, `i` — dizi indeksi (0-5, 6 cıvata)
- **ic_degiskenler**:
  - `angle` — `(i / 6) * Math.PI * 2` formülüyle hesaplanan açı
  - `geometries.topCapBoltGeo` — üst kapak cıvatası geometrisi
  - `materials.boltChrome` — krom cıvata materyali
- **Dönüş**: `<mesh>` JSX elemanı

### [N14_NASIL] AST Pointer: src/components/products/3d/types/RoofFanModel.tsx::eyebolt render callback (.map)
- **params**: `x` — x ekseni pozisyonu, `i` — dizi indeksi
- **ic_degiskenler**:
  - `geometries.eyeboltTorusGeo` — halkalı cıvata torus geometrisi
  - `materials.castIron` — dökme demir materyali
- **Dönüş**: `<mesh>` JSX elemanı

---

## NODE ID STANDARD

  file: src\components\products\3d\types\RoofFanModel.tsx
  function: src\components\products\3d\types\RoofFanModel.tsx::RoofFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: RoofFanModel

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