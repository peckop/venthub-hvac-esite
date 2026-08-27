---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\ExproofFanModel.tsx
skeleton_hash: 80da54ad7c04f82b
entity_hashes:
  func:Bolt: b31ea5b1071726a7
  func:ExproofFanModel: 9ab526a69ad42620
  overview: 16837123b5c1fbc6
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:16:48Z
---

## Genel Bakış
VentHub HVAC platformunda patlamaya dayanıklı (exproof) fan ürünlerinin 3 boyutlu görselleştirilmesini sağlayan React bileşen modülüdür. Ürün detay sayfalarında kullanılmak üzere tasarlanmış olup, 3D model renderlama altyapısıyla entegre çalışır. Modül, ana fan modeli bileşenini ve bu modelde kullanılan yardımcı civata (bolt) bileşenini içerir.

## Fonksiyon Grupları

### Ana 3B Bileşeni
Exproof fan ürünlerinin 3D modelini ekrana döken, React Three Fiber veya benzeri 3D render kütüphaneleriyle uyumlu çalışan temel bileşeni barındırır. Bu bileşen, alt bileşenleri (örneğin civata modelleri) bir araya getirerek kompleks 3D sahneyi oluşturur.
- ExproofFanModel

### Yardımcı 3B Bileşeni
Exproof fan modelindeki tekrar eden parçaları (civatalar gibi) temsil eden, konum ve malzeme bilgisiyle yapılandırılabilen yardımcı 3B bileşendir. Ana bileşen tarafından çağrılarak fan modelinin tamamlayıcı parçalarını oluşturur.
- Bolt

## Bağımlılıklar

### Dış Bağımlılıklar
- React kütüphanesi (JSX/TSX desteği)
- 3D modelleme/renderleme kütüphanesi (Three.js, React Three Fiber vb.)
- 3D model kaynak varlıklarının erişilebilirliği

### İç Bağımlılıklar
- `Bolt` bileşeni, `ExproofFanModel` bileşeni tarafından çağrılarak kullanılır. `Bolt` fonksiyonu; `position`, `material`, `cylinderGeometry` ve `sphereGeometry` parametrelerini alır ve bu parametrelerle yapılandırılmış bir 3B civata modeli döndürür.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan mimari varsayım üretimi yapılamaz. Aksiyomlar sadece fonksiyon gövdesinden türetilir.

---

## FONKSİYON DETAYLARI

### Bolt
**Ne yapar**: `Bolt`, bir 3D cıvata (bolt) modelini sahneye yerleştiren React fonksiyonel bileşenidir. `ExproofFanModel.tsx` dosyası içinde tanımlı olup, patlamaya dayanıklı fan modelinin cıvata detaylarını oluşturmak için kullanılır.

**Nasıl yapar**: Bileşen, aldığı `position`, `material`, `cylinderGeometry` ve `sphereGeometry` parametrelerini kullanarak 3D sahne içinde cıvata geometrisini render eder. `cylinderGeometry` ve `sphereGeometry` parametreleri, cıvanın silindirik gövdesi ve küresel başı gibi alt geometrileri temsil eder; bu geometriler dışarıdan tanımlanıp prop olarak iletilir. Bileşen `React.FC<BoltProps>` tipinde bir fonksiyonel bileşen olarak tanımlanmıştır ve `BoltProps` arayüzü üzerinden tip güvencesi sağlar.

**Parametreler**:
- position: `BoltProps["position"]` — Cıvatanın 3D uzaydaki konumunu belirten değer. Üç boyutlu koordinat bilgisi içerir.
- material: `BoltProps["material"]` — Cıvatanın yüzey malzemesini tanımlayan değer. Görünüm, renk ve ışık etkileşimini belirler.
- cylinderGeometry: `BoltProps["cylinderGeometry"]` — Cıvanın silindirik gövde kısmının geometri tanımı. Dışarıdan oluşturulup prop olarak iletilir.
- sphereGeometry: `BoltProps["sphereGeometry"]` — Cıvanın küresel baş kısmının geometri tanımı. Dışarıdan oluşturulup prop olarak iletilir.

**Dönüş**: `React.FC<BoltProps>` — `BoltProps` tipinde props alan ve 3D cıvata modelini sahneye çizen bir React fonksiyonel bileşeni döndürür.

### ExproofFanModel
**Ne yapar**: VentHub HVAC projesinin ürünler bölümünde kullanılan, patlamaya dayanıklı (exproof) fanların 3B modelini render eden React fonksiyonel bileşenidir. Sadece exproof fan ürünleri için özel olarak geliştirilmiş bu bileşen, platformdaki ürün detay sayfalarında fanın 3 boyutlu görünümünü kullanıcıya sunmakla görevlidir. Proje içindeki 3B ürün modeli standartlarına uygun olarak tüm exproof fan tipleri için tutarlı bir görselleştirme sunar.
**Nasıl yapar**: React tabanlı projenin mevcut 3B bileşen altyapısını kullanarak, exproof fanlara özgü 3B geometri ve görsel ayarlarını yükleyerek sahneye entegre eder. Kaynak dosyası projenin ürün 3B tipleri dizininde konumlanarak diğer fan ve ürün modelleriyle aynı entegrasyon kurallarına uyar, projenin kullandığı harici 3B kütüphaneleri kullanarak modelin kullanıcı tarafından etkileşimli olarak incelenmesini sağlar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz
**Dönüş**: React.FC türünde, React ekosistemiyle tam uyumlu, ekranda render edilebilir bir fonksiyonel bileşen döndürür. Döndürülen bu bileşen, exproof fanın 3B modelini DOM'a eklemek ve kullanıcı etkileşimlerini yönetmek üzere hazırlanmıştır.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: three::type { Material }

---

## INTERFACES

### BoltProps
- `position: [number, number, number]`
- `material: Material`
- `cylinderGeometry: CylinderGeometry`
- `sphereGeometry: SphereGeometry`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::Bolt
- **params**: `position`, `material`, `cylinderGeometry`, `sphereGeometry`
- **ic_degiskenler**:
  - `position` — grubun 3D uzaydaki konumunu belirler
  - `material` — silindir ve küre mesh'lerinde kullanılacak malzeme
  - `cylinderGeometry` — silindir mesh'inin geometrisi
  - `sphereGeometry` — küre mesh'inin geometrisi
- **Dönüş**: `React.FC<BoltProps>` (JSX)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::ExproofFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials` hook'undan dönen malzeme nesnesi
  - `scrollShape` — useMemo ile memoize edilmiş salyangoz formu Shape nesnesi
  - `motorBodyGeo` — useMemo ile memoize edilmiş silindir geometrisi (motor gövdesi)
  - `coolingFinGeo` — useMemo ile memoize edilmiş kutu geometrisi (soğutma kanatları)
  - `klemensGeo` — useMemo ile memoize edilmiş kutu geometrisi (klemens kutusu)
  - `warningLabelGeo` — useMemo ile memoize edilmiş düzlem geometrisi (uyarı etiketi)
  - `rearCoverGeo` — useMemo ile memoize edilmiş silindir geometrisi (arka kapak)
  - `mountFoot1Geo` — useMemo ile memoize edilmiş kutu geometrisi (montaj ayağı 1)
  - `mountFoot2Geo` — useMemo ile memoize edilmiş kutu geometrisi (montaj ayağı 2)
  - `scrollExtrudeGeo` — useMemo ile memoize edilmiş extrude geometrisi (salyangoz gövde)
  - `copperHuniGeo` — useMemo ile memoize edilmiş silindir geometrisi (bakır huni)
  - `copperRingGeo` — useMemo ile memoize edilmiş halka geometrisi (bakır yüzey)
  - `boltCylinderGeo` — useMemo ile memoize edilmiş silindir geometrisi (vida silindiri)
  - `boltSphereGeo` — useMemo ile memoize edilmiş küre geometrisi (vida küresi)
  - `ringGeometries` — useMemo ile memoize edilmiş torus geometrileri dizisi (konsentrik halkalar)
  - `wireGeo` — useMemo ile memoize edilmiş kutu geometrisi (radyal teller)
  - `exhaustGeo1` — useMemo ile memoize edilmiş kutu geometrisi (atış ağzı 1)
  - `exhaustGeo2` — useMemo ile memoize edilmiş kutu geometrisi (atış ağzı flanşı)
  - `exhaustGeo3` — useMemo ile memoize edilmiş kutu geometrisi (atış ağzı boşluğu)
- **Dönüş**: `React.FC` (JSX)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (scrollShape useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — yeni oluşturulan Shape nesnesi, salyangoz formunun dış konturunu tanımlar
- **Dönüş**: `Shape`

### [N4_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (motorBodyGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `CylinderGeometry`

### [N5_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (coolingFinGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N6_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (klemensGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N7_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (warningLabelGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `PlaneGeometry`

### [N8_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (rearCoverGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `CylinderGeometry`

### [N9_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (mountFoot1Geo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N10_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (mountFoot2Geo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N11_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (scrollExtrudeGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `ExtrudeGeometry`

### [N12_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (copperHuniGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `CylinderGeometry`

### [N13_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (copperRingGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `RingGeometry`

### [N14_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (boltCylinderGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `CylinderGeometry`

### [N15_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (boltSphereGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `SphereGeometry`

### [N16_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (ringGeometries useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `TorusGeometry[]`

### [N17_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (wireGeo useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N18_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (exhaustGeo1 useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N19_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (exhaustGeo2 useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N20_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (exhaustGeo3 useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `BoxGeometry`

### [N21_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (useEffect callback)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: cleanup fonksiyonu

### [N22_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (cleanup fonksiyonu)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (tüm geometrilerin dispose() metodlarını çağırır)

### [N23_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (coolingFinGeo map callback)
- **params**: `_`, `i`
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı (boşluk doldurma)
  - `i` — dizi indeksi, her soğutma kanadının dönüş açısını hesaplamak için kullanılır
- **Dönüş**: JSX (mesh)

### [N24_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (Bolt map callback)
- **params**: `angle`, `i`
- **ic_degiskenler**:
  - `angle` — vidanın açısal konumu (derece cinsinden)
  - `i` — dizi indeksi, key prop'u için kullanılır
- **Dönüş**: JSX (Bolt bileşeni)

### [N25_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (ringGeometries map callback)
- **params**: `r`, `i`
- **ic_degiskenler**:
  - `r` — halkanın yarıçapı
  - `i` — dizi indeksi, key prop'u için kullanılır
- **Dönüş**: JSX (mesh)

### [N26_NASIL] AST Pointer: src/components/products/3d/types/ExproofFanModel.tsx::anonim (wireGeo map callback)
- **params**: `angle`, `i`
- **ic_degiskenler**:
  - `angle` — telin açısal konumu (derece cinsinden)
  - `i` — dizi indeksi, key prop'u için kullanılır
- **Dönüş**: JSX (mesh)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\ExproofFanModel.tsx
  function: src\components\products\3d\types\ExproofFanModel.tsx::Bolt
  function: src\components\products\3d\types\ExproofFanModel.tsx::ExproofFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: Bolt
  export: ExproofFanModel

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