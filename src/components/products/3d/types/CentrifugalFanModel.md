---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\CentrifugalFanModel.tsx
skeleton_hash: 0bb20c2e782fcbe0
entity_hashes:
  func:CentrifugalFanModel: 2ca1d8ced8088e61
  overview: ed08f0a7a06a9648
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:13:55Z
---

## Genel Bakış
Bu modül, santrifüj tip fanın (salyangoz fan) three.js tabanlı üç boyutlu modelini render eden bağımsız bir React bileşenini tanımlar. Bileşen, fanın ana yapı taşlarını (tahrik motoru, spiral konaklama ve radyal kanatlı pervane) statik bir şekilde 3D ortamında görselleştirerek etkileşimli bir ürün gösterimi sunar. Props almayan bu bileşen, tüm konfigürasyon değerlerini kendi içinde sabit olarak barındırır.

## Fonksiyon Grupları
### 3D Fan Modeli Bileşen Tanımı
Santrifüj fanın three.js geometrisini ve malzemelerini oluşturarak sahneye yerleştiren, dışarıdan yapılandırma almayan tek bir React bileşenini içerir. Bileşen, three.js sahne, kamera ve ışıklandırma gibi bağımlılıklarını kendi içinde yönetir.
- CentrifugalFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzasına dayalı aksiyom üretilememektedir.

[Aksiyom 1]: Eğer `CentrifugalFanModel` bileşeni bir React ortamında (React renderer) çalıştırılmazsa, three.js tabanlı 3D sahne oluşturulamaz ve bileşen render edilemez.

[Aksiyom 2]: Eğer three.js kütüphanesi (veya kullanılan 3D renderer bağımlılığı) proje bağımlılıklarında mevcut değilse, 3D geometri ve malzeme nesneleri oluşturulamaz ve bileşen hata verir.

[Aksiyom 3]: Eğer bileşenin props olarak herhangi bir girdi almadığı doğruysa (fonksiyon imzası `() -> React.FC` şeklinde), bileşen tamamen statik bir model sunar; dışarıdan yapılandırma veya dinamik parametre ile davranış değiştirilemez.

---

## FONKSİYON DETAYLARI

### CentrifugalFanModel
**Ne yapar**: Bu fonksiyon, santrifüj fanın 3B modelini gösteren bir React bileşeni tanımlar. Bileşen, fanın temel parçalarını (motor, konaklama ve pervane) temsil ederek kullanıcıya görsel bir yapı sunar.

**Nasıl yapar**: Fonksiyon içeriği, verilen docstring’te belirtilen özellikleri açıklayan bir JSX yapısı döndürür; motorun merkezi tahrik olduğu, konaklamanın spiral/salyangoz tipinde olduğu ve pervanenin radyal kanatlı, dönen yapı olduğu bilgileri bileşenin render ettiği öğelerle eşleştirir. Props almadığı için dışarıdan veri beklemez ve statik bir görselleştirme sağlar.

**Parametreler**:  
- (Parametre yok)

**Dönüş**: React.FC türünde bir fonksiyonel bileşen döner; bu, JSX elementi render ederek santrifüj fan modelini ekrana getirir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CentrifugalFanModel.tsx::CentrifugalFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; tüm mesh'lerde `materials.industrialBlue`, `materials.darkGrey`, `materials.industrialSteel`, `materials.galvanizedSteel`, `materials.matteBlack`, `materials.motorSilver`, `materials.logoRed`, `materials.bladeBlack` olarak erişilir
  - `impellerRef` — `useRef<Group>(null)` ile oluşturulan ref; impeller grubunun `<group ref={impellerRef}>` ile bağlanır, `useFrame` içinde `impellerRef.current.rotation.z` üzerinden döndürme animasyonu uygulanır
  - `impellerBladeGeometry` — `useMemo` ile oluşturulan `ExtrudeGeometry`; 12 adet kanat mesh'inde `geometry={impellerBladeGeometry}` olarak kullanılır
  - `scrollShape` — `useMemo` ile oluşturulan `Shape` nesnesi; spiral salyangoz profilini tanımlar, `scrollGeom` hesaplamasında bağımlılık olarak kullanılır
  - `scrollGeom` — `useMemo` ile oluşturulan `ExtrudeGeometry`; `scrollShape` bağımlılığıyla hesaplanır, ana spiral gövde mesh'inde `geometry={scrollGeom}` olarak kullanılır
  - `motorBodyGeom` — `useMemo` ile oluşturulan `CylinderGeometry(0.14, 0.14, 0.35, 32)`; motor gövdesi mesh'inde kullanılır
  - `coolingFinGeom` — `useMemo` ile oluşturulan `BoxGeometry(0.012, 0.33, 0.32)`; 16 adet soğutma kanatı mesh'inde kullanılır
  - `klemensBoxGeom` — `useMemo` ile oluşturulan `BoxGeometry(0.12, 0.10, 0.12)`; klemens kutusu mesh'inde kullanılır
  - `basePlateGeom1` — `useMemo` ile oluşturulan `BoxGeometry(0.28, 0.06, 0.28)`; üst taban plakası mesh'inde kullanılır
  - `basePlateGeom2` — `useMemo` ile oluşturulan `BoxGeometry(0.34, 0.02, 0.34)`; alt taban plakası mesh'inde kullanılır
  - `inletCylinderGeom` — `useMemo` ile oluşturulan `CylinderGeometry(0.20, 0.18, 0.06, 64, 1, true)`; emiş ağzı silindir mesh'inde kullanılır
  - `inletRingGeom` — `useMemo` ile oluşturulan `RingGeometry(0.18, 0.20, 64)`; emiş ağzı halka mesh'inde kullanılır
  - `outletBoxGeom1` — `useMemo` ile oluşturulan `BoxGeometry(0.26, 0.30, 0.20)`; atış ağzı ana kutu mesh'inde kullanılır
  - `outletBoxGeom2` — `useMemo` ile oluşturulan `BoxGeometry(0.015, 0.36, 0.24)`; atış ağzı yan kutu mesh'inde kullanılır
  - `outletVoidGeom` — `useMemo` ile oluşturulan `BoxGeometry(0.28, 0.24, 0.16)`; çıkış boşluğu mesh'inde kullanılır
  - `impellerHubGeom` — `useMemo` ile oluşturulan `CylinderGeometry(0.10, 0.10, 0.08, 32)`; impeller göbek mesh'inde kullanılır
  - `logoGeom` — `useMemo` ile oluşturulan `CircleGeometry(0.05, 32)`; marka logosu mesh'inde kullanılır
  - `torusGeoms` — `useMemo` ile oluşturulan `TorusGeometry[]` dizisi; `[0.06, 0.10, 0.14, 0.18]` yarıçaplarıyla 4 adet torus geometrisi, koruma ızgarası halkalarında kullanılır
  - `wireGeom` — `useMemo` ile oluşturulan `BoxGeometry(0.36, 0.005, 0.005)`; koruma ızgarası tel mesh'lerinde kullanılır
- **Dönüş**: JSX (React element — `<group>` kök elemanı)

### [N2_NASIL] AST Pointer: CentrifugalFanModel.tsx::useFrame callback
- **params**: `_state` (kullanılmaz), `delta` (frame'ler arası geçen süre, saniye)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok; yan etki olarak `impellerRef.current.rotation.z` değerini `delta * 12` kadar azaltır (pervaneyi döndürür)

### [N3_NASIL] AST Pointer: CentrifugalFanModel.tsx::impellerBladeGeometry useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — `new Shape()` ile oluşturulan 2D şekil nesnesi; `moveTo(0, 0.12)` ile başlayarak iki adet `quadraticCurveTo` ve bir `lineTo` ile geriye kıvrımlı kanat profilini tanımlar
  - `extrudeSettings` — extrüzyon ayarlarını içeren nesne; `depth: 0.03`, `bevelEnabled: true`, `bevelThickness: 0.004`, `bevelSize: 0.004`, `bevelSegments: 1` değerlerini taşır
- **Dönüş**: `ExtrudeGeometry`

### [N4_NASIL] AST Pointer: CentrifugalFanModel.tsx::scrollShape useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — `new Shape()` ile oluşturulan 2D şekil nesnesi; `moveTo(0, 0.40)` ile başlayarak `lineTo` ve `quadraticCurveTo` çağrılarıyla spiral salyangoz profilini tanımlar
- **Dönüş**: `Shape`

### [N5_NASIL] AST Pointer: CentrifugalFanModel.tsx::scrollGeom useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok; dışarıdan `scrollShape` kullanılır)
- **Dönüş**: `ExtrudeGeometry` — `scrollShape` ve `{ depth: 0.20, bevelEnabled: false }` ayarlarıyla oluşturulur

### [N6_NASIL] AST Pointer: CentrifugalFanModel.tsx::torusGeoms useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok; inline `[0.06, 0.10, 0.14, 0.18].map(r => ...)` kullanılır)
- **Dönüş**: `TorusGeometry[]` — her eleman `new TorusGeometry(r, 0.002, 8, 64)` ile oluşturulur

### [N7_NASIL] AST Pointer: CentrifugalFanModel.tsx::useEffect cleanup-returning callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: cleanup fonksiyonu (`() => void`) — bileşen unmount olduğunda tüm geometrilerin `.dispose()` metodunu çağırır

### [N8_NASIL] AST Pointer: CentrifugalFanModel.tsx::useEffect cleanup function
- **params**: (parametre yok)
- **ic_degiskenler**: (yok; dışarıdan `impellerBladeGeometry`, `scrollGeom`, `motorBodyGeom`, `coolingFinGeom`, `klemensBoxGeom`, `basePlateGeom1`, `basePlateGeom2`, `inletCylinderGeom`, `inletRingGeom`, `outletBoxGeom1`, `outletBoxGeom2`, `outletVoidGeom`, `impellerHubGeom`, `logoGeom`, `torusGeoms`, `wireGeom` erişilir)
- **Dönüş**: yok; yan etki olarak tüm geometri nesnelerinin `.dispose()` metodunu çağırarak VRAM temizliği yapar, `torusGeoms` üzerinde `forEach(g => g.dispose())` uygulanır

### [N9_NASIL] AST Pointer: CentrifugalFanModel.tsx::coolingFin map callback
- **params**: `_` (kullanılmaz), `i` (dizi indeksi, 0–15)
- **ic_degiskenler**: (yok; dışarıdan `coolingFinGeom` ve `materials.industrialBlue` kullanılır)
- **Dönüş**: JSX — `<mesh>` elementi; `rotation={[0, 0, i * (Math.PI / 8)]}` ile her kanat 22.5° döndürülür

### [N10_NASIL] AST Pointer: CentrifugalFanModel.tsx::impellerBlade map callback
- **params**: `_` (kullanılmaz), `i` (dizi indeksi, 0–11)
- **ic_degiskenler**: (yok; dışarıdan `impellerBladeGeometry` ve `materials.bladeBlack` kullanılır)
- **Dönüş**: JSX — `<group>` içinde `<mesh>` elementi; `rotation={[0, 0, (i / 12) * Math.PI * 2]}` ile her kanat eşit açıyla dağıtılır

### [N11_NASIL] AST Pointer: CentrifugalFanModel.tsx::torusGeoms map callback
- **params**: `geom` (tekil `TorusGeometry` nesnesi), `i` (dizi indeksi)
- **ic_degiskenler**: (yok; dışarıdan `materials.industrialBlue` kullanılır)
- **Dönüş**: JSX — `<mesh>` elementi; `key={`ring-${i}`}` ile benzersiz anahtar atanır

### [N12_NASIL] AST Pointer: CentrifugalFanModel.tsx::wireAngles map callback
- **params**: `angle` (derece cinsinden açı: 0, 60, 120, 180, 240, 300), `i` (dizi indeksi)
- **ic_degiskenler**: (yok; dışarıdan `wireGeom` ve `materials.industrialBlue` kullanılır)
- **Dönüş**: JSX — `<mesh>` elementi; `rotation={[0, 0, angle * Math.PI / 180]}` ile radyana dönüştürülerek döndürülür, `key={`wire-${i}`}` ile benzersiz anahtar atanır

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