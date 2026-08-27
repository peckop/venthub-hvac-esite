---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\types\DuctFanModel.tsx
skeleton_hash: cf9b9eb1f8da034f
entity_hashes:
  func:DuctFanModel: db7d5fa48410ad07
  func:RectangularDuctFanModel: c575246c49ae9f50
  overview: d682035eaa626359
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:26:52Z
---

<!-- ORION-DONDURULMUS: gercek-sembol=2 · kaynak=90aa2b29 · sebep=uretec-sembol-kaybi · kayit=REC-83 -->

## Genel Bakış
Bu modül, 3D ürün görselleştirme katmanında yer alan kanal fan (duct fan) model bileşenlerini tanımlar. Dikdörtgen kesitli kanal fanının 3D modelini sunan bileşenleri içerir. Modül, ürünlerin üç boyutlu görselleştirilmesinde kullanılan tip bazlı bileşen yapısının bir parçasıdır.

## Fonksiyon Grupları

### Model Bileşenleri
Kanal fanının 3D modelini oluşturan ve sunan React bileşenlerini içerir. Bu bileşenler, ürünün üç boyutlu görünümünü kullanıcıya göstermekle sorumludur.
- DuctFanModel, RectangularDuctFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından, yalnızca imzalar (`DuctFanModel()` ve `RectangularDuctFanModel() -> React.FC`) mevcuttur. Kurallar gereği aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir; imzalardan, docstring'lerden veya değişken isimlerinden çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### DuctFanModel
**Ne yapar**: Kanal tipi (round duct fan) havalandırma fanının 3D modelini oluşturan bir React bileşenidir. Ana gövde, taşıyıcı ayak, klemens kutusu ve pervane olmak üzere dört ana parçadan oluşan silindirik kanal fanını Three.js sahnesinde render eder.

**Nasıl yapar**: Bileşen, `useRef` ile pervane grubuna referans oluşturur ve `useResolveMaterials` ile merkezi malzeme tanımlarını çözer. `useFrame` kancası kullanılarak her karede pervane referansının Y ekseni etrafında dönüşü `delta * 8` hızıyla artırılır (animasyon). `useMemo` ile dokuz farklı geometri (silindir, kutu, kanat) yalnızca bir kez hesaplanır ve bellekte tutulur. `useEffect` içinde bileşen unmount olduğunda tüm geometrilerin `dispose()` metodu çağrılarak VRAM belleği temizlenir. Ana grup `[0.8, 0.8, 0.8]` ölçeğinde ve Y ekseninde `-Math.PI / 4` döndürülmüş açılı duruşla render edilir. Model dört alt gruptan oluşur: (1) `mainCylinderGeo1`-`mainCylinderGeo4` geometrileriyle oluşturulmuş ana gövde silindirleri, (2) `footBoxGeo1` ve `footBoxGeo2` ile inşa edilen taşıyıcı ayak, (3) `boxGeo3` ile temsil edilen klemens kutusu, (4) `impellerHubGeo` merkez hub ve 8 adet `bladeGeo` kanattan oluşan pervane grubu. Pervane grubu `fanRef` referansı ile bağlıdır ve animasyon bu gruba uygulanır. Kanatlar 45'er derecelik aralıklarla (0, 45, 90, 135, 180, 225, 270, 315) döndürülmüş gruplar içinde konumlandırılır; her kanat `[0.4, 0, 0]` rotasyonuyla eğimli olarak yerleştirilir. Malzeme olarak `materials.galvanizedSteel` (gövde, ayak, klemens kutusu) ve `materials.ductFanBladeRose` (pervane hub ve kanatlar) kullanılır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: JSX elementi döndüren bir React fonksiyon bileşeni. Belirtilen dönüş tipi `void` veya bilinmiyor; kaynakta açık dönüş tipi bildirimi yoktur.

### RectangularDuctFanModel
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::BoxGeometry
- import: three::CylinderGeometry
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: DuctFanModel.tsx::DuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanRef` — useRef<Group>(null), pervane grubunun referansı; useFrame içinde `fanRef.current.rotation.y` animasyonu için kullanılır
  - `materials` — useResolveMaterials() hook'undan dönen materyal nesnesi; mesh'lerde `material` prop'u olarak kullanılır (`materials.galvanizedSteel`, `materials.ductFanBladeRose`)
  - `geometries` — useMemo ile memoize edilmiş geometri nesnesi; tüm mesh'lerde `geometry` prop'u olarak kullanılır
    - `mainCylinderGeo1` — CylinderGeometry(0.48, 0.48, 0.4, 32), ana gövde silindiri
    - `mainCylinderGeo2` — CylinderGeometry(0.38, 0.48, 0.3, 32), üst gövde silindiri (position [0, 0.35, 0])
    - `mainCylinderGeo3` — CylinderGeometry(0.48, 0.38, 0.3, 32), alt gövde silindiri (position [0, -0.35, 0])
    - `mainCylinderGeo4` — CylinderGeometry(0.38, 0.38, 0.1, 32), uç silindirler (position [0, ±0.55, 0])
    - `footBoxGeo1` — BoxGeometry(0.1, 0.8, 0.6), taşıyıcı ayak ana parçası
    - `footBoxGeo2` — BoxGeometry(0.4, 0.1, 0.4), taşıyıcı ayak destek parçaları
    - `boxGeo3` — BoxGeometry(0.15, 0.25, 0.2), klemens kutusu
    - `impellerHubGeo` — CylinderGeometry(0.12, 0.12, 0.15, 32), pervane göbeği
    - `bladeGeo` — BoxGeometry(0.35, 0.08, 0.02), pervane kanadı
  - `state` — useFrame callback'inin ilk parametresi; fonksiyon gövdesinde doğrudan kullanılmıyor
  - `delta` — useFrame callback'inin ikinci parametresi; `fanRef.current.rotation.y -= delta * 8` hesabında kullanılıyor
  - `z` — taşıyıcı ayak map callback'inin ilk parametresi; [-0.2, 0.2] değerlerini alır, mesh position'ında kullanılır
  - `i` — taşıyıcı ayak map callback'inin ikinci parametresi; key prop'u olarak kullanılır
  - `rot` — pervane kanatları map callback'inin ilk parametresi; [0, 45, 90, 135, 180, 225, 270, 315] derece değerlerini alır, `rot * Math.PI / 180` ile radyana çevrilerek rotation prop'unda kullanılır
  - `i` — pervane kanatları map callback'inin ikinci parametresi; key prop'u olarak kullanılır
- **Dönüş**: JSX — `<group scale={[0.8, 0.8, 0.8]} rotation={[0, -Math.PI / 4, 0]}>` içinde yuvarlak kanal fanı 3D modeli

---

### [N2_NASIL] AST Pointer: DuctFanModel.tsx::RectangularDuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useResolveMaterials() hook'undan dönen materyal nesnesi; mesh'lerde `material` prop'u olarak kullanılır (`materials.galvanizedSteel`, `materials.industrialSteel`, `materials.matteBlack`, `materials.brushedAluminum`)
  - `geometries` — useMemo ile memoize edilmiş geometri nesnesi; tüm mesh'lerde `geometry` prop'u olarak kullanılır
    - `bodyGeo` — BoxGeometry(1, 0.6, 0.6), ana gövde kutusu
    - `flangeGeo` — BoxGeometry(0.05, 0.7, 0.7), flanş kutusu (position [±0.5, 0, 0])
    - `topBoxGeo` — BoxGeometry(0.3, 0.15, 0.2), üst kutu (position [0, 0.35, 0])
    - `cylinderGeo` — CylinderGeometry(0.25, 0.25, 1.02, 32), merkezi silindir (rotation [0, 0, Math.PI / 2])
  - `x` — flanş map callback'inin ilk parametresi; [-0.5, 0.5] değerlerini alır, mesh position'ında kullanılır
  - `i` — flanş map callback'inin ikinci parametresi; key prop'u olarak kullanılır
- **Dönüş**: JSX — `<group>` içinde dikdörtgen kanal fanı 3D modeli

---

## NODE ID STANDARD

  file: DuctFanModel.tsx
  function: DuctFanModel.tsx::DuctFanModel
  function: DuctFanModel.tsx::RectangularDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DuctFanModel
  export: RectangularDuctFanModel

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