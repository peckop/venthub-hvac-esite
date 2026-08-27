---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\AxialFanModel.tsx
skeleton_hash: 05ee8941b448815a
entity_hashes:
  func:AxialFanModel: 0cdd9e26f4d0d82f
  overview: a43abf5d84ae7c43
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:12:31Z
---

## Genel Bakış
Bu modül, eksenli fanların 3D modelini oluşturmak için kullanılan bir React bileşenini tanımlar. Bileşen, opsiyonel olarak bir susturucu ekleyebilir ve susturucunun boyutlarını parametrelerle belirleyebilir.

## Fonksiyon Grupları
### 3B Eksenli Fan Modelleme
Bu grup, eksenli fanın temel 3D geometrisini oluşturur ve isteğe bağlı susturucu bileşenini ekleyerek sahneye yerleştirir.
- AxialFanModel

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### AxialFanModel

**Ne yapar**: BVN Reference Style tasarımına uygun bir eksenel fan (axial fan) 3D modeli oluşturan React Three Fiber bileşenidir. Silindirik kovan, 7 adet siyah orak kanat, kırmızı hub merkezi, yoğun tel kafes, motor ve opsiyonel sustalıcı (silencer) gibi parçalardan oluşan eksiksiz bir eksenel fan görselleştirmesi render eder.

**Nasıl yapar**: Bileşen önce `useResolveMaterials` hook'u ile gerekli materyalleri (glossyBlack, bladeBlack, logoRed, matteBlack vb.) çözümler. Ardından `useMemo` ile tüm geometrileri (bılek, kovan, flanş, hub, logo, motor, motor ayağı, konsantrik halkalar, radyal tel, klemens kutusu ve silindiri) bellek sızıntısını önlemek üzere memoize eder. `useFrame` hook'u ile her animasyon karesinde fan pervanesinin Z ekseni etrafında `delta * 15` hızıyla negatif yönde dönmesini sağlar; bu referans `fanRef` üzerinden `Group` nesnesine uygulanır. `useEffect` ile bileşen unmount edildiğinde tüm geometrilerin `dispose()` çağrılarak GPU belleğinin serbest bırakılması sağlanır. JSX tarafında BVN stil kurallarına uygun olarak: siyah parlak silindirik kovan ve flanşlar, 7 adet orak şeklinde siyah kanat (her biri `bezierCurveTo` ile oluşturulmuş `ExtrudeGeometry`), kırmızı logo dairesi, 8 adet konsantrik halka ve 8 radyal telden oluşan yoğun tel kafes, motor ve 3 kollu motor ayakları, klemens kutusu ile opsiyonel sustalıcı (Silencer bileşeni) render edilir. Bileşen genelinde `scale={[0.85, 0.85, 0.85]}` ve `rotation={[0, -Math.PI / 4, 0]}` uygulanmıştır.

**Parametreler**:
- `hasSilencer`: `boolean` (varsayılan: `false`) — Sustalı (silencer) parçasının modele eklenip eklenmeyeceğini belirler. `true` olduğunda fan girişine sustalı eklenir.
- `silencerRadius`: `number` (varsayılan: `0.58`) — Sustalı parçasının yarıçapını belirler. Yalnızca `hasSilencer` `true` olduğunda etkilidir.
- `silencerLength`: `number` (varsayılan: `0.7`) — Sustalı parçasının uzunluğunu belirler. Yalnızca `hasSilencer` `true` olduğunda etkilidir.

**Dönüş**: JSX elementi — React Three Fiber `<group>` bileşeni döndürür. Bu group, eksenel fanın tüm alt parçalarını (kovan, pervane grubu, tel kafes, klemens kutusu ve opsiyonel sustalı) hiyerarşik olarak içerir. Dönüş tipi TypeScript tarafında `AxialFanModelProps` tipinde props alan ve JSX döndüren bir fonksiyon bileşenidir; açık bir dönüş tipi bildirimi kaynak kodda belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: ../parts/Silencer::Silencer
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## INTERFACES

### AxialFanModelProps
- `hasSilencer?: boolean`
- `silencerRadius?: number`
- `silencerLength?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::AxialFanModel
- **params**:
  - `hasSilencer` — susta (silencer) eklenip eklenmeyeceğini belirten boolean, varsayılan `false`
  - `silencerRadius` — susta yarıçapı, varsayılan `0.58`
  - `silencerLength` — susta uzunluğu, varsayılan `0.7`
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.glossyBlack`, `materials.bladeBlack`, `materials.logoRed`, `materials.matteBlack` alanlarına erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan Three.js Group referansı; `useFrame` içinde `fanRef.current.rotation.z` her karede `delta * 15` kadar azaltılır (pervane dönüşü)
  - `bladeGeometry` — `useMemo` ile oluşturulan orak kanat geometrisi; `Shape` ile bezier eğrileri kullanılarak kanat profili çizilir, `ExtrudeGeometry` ile 3B'ye çıkarılır (`depth: 0.015`, `bevelEnabled: true`, `bevelThickness: 0.005`, `bevelSize: 0.005`, `bevelSegments: 2`)
  - `casingGeometry` — `useMemo` ile oluşturulan silindirik kovan geometrisi; `CylinderGeometry(0.55, 0.55, 0.5, 64, 1, true)` parametreleriyle açık uçlu silindir
  - `flangeGeometry` — `useMemo` ile oluşturulan flanş geometrisi; `RingGeometry(0.55, 0.60, 64)` parametreleriyle halka
  - `hubGeometry` — `useMemo` ile oluşturulan pervane göbeği geometrisi; `CylinderGeometry(0.16, 0.16, 0.06, 32)` parametreleriyle kısa silindir
  - `logoGeometry` — `useMemo` ile oluşturulan logo geometrisi; `CircleGeometry(0.08, 32)` parametreleriyle daire
  - `motorGeometry` — `useMemo` ile oluşturulan motor gövdesi geometrisi; `CylinderGeometry(0.18, 0.18, 0.25, 32)` parametreleriyle silindir
  - `motorFootGeometry` — `useMemo` ile oluşturulan motor ayağı geometrisi; `BoxGeometry(0.04, 0.25, 0.02)` parametreleriyle kutu
  - `concentricRingGeometries` — `useMemo` ile oluşturulan 8 adet konsantrik halka geometrisi dizisi; her halka `RingGeometry(r, r + 0.008, 64)` formülüyle oluşturulur, `r` değeri `0.1 + (i * 0.065)` ile hesaplanır
  - `radialWireGeometry` — `useMemo` ile oluşturulan radyal tel geometrisi; `BoxGeometry(1.1, 0.008, 0.005)` parametreleriyle ince uzun kutu
  - `klemensBoxGeometry` — `useMemo` ile oluşturulan klemens kutusu geometrisi; `BoxGeometry(0.12, 0.15, 0.08)` parametreleriyle kutu
  - `klemensCylinderGeometry` — `useMemo` ile oluşturulan klemens silindir geometrisi; `CylinderGeometry(0.015, 0.015, 0.04, 8)` parametreleriyle ince silindir
- **Dönüş**: JSX — `<group>` kök elemanı döndürür; `position={[0, 0, 0]}`, `scale={[0.85, 0.85, 0.85]}`, `rotation={[0, -Math.PI / 4, 0]}` özellikleriyle konumlandırılmış 3B eksenel fan modeli; `hasSilencer` true ise `<Silencer>` bileşeni eklenir, 7 adet orak kanat, silindirik kovan, flanşlar, motor, tel kafes ve klemens kutusu alt grupları içerir

---

## NODE ID STANDARD

  file: src\components\products\3d\types\AxialFanModel.tsx
  function: src\components\products\3d\types\AxialFanModel.tsx::AxialFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: AxialFanModel

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