---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\SmokeExhaustFanModel.tsx
skeleton_hash: 9aca146089186f73
entity_hashes:
  func:SmokeExhaustFanModel: 6dbd1881578fd02a
  overview: b093073c22340904
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:24:15Z
---

## Genel Bakış
Bu modül, duman tahliye fanının 3 boyutlu modelini tarayıcı ortamında render eden tekil bir React bileşenidir. React Three Fiber ve Three.js kütüphaneleriyle entegre çalışarak, ürünlerin interaktif 3D görüntülenmesi için temel bir yapı taşı görevi görür.

## Fonksiyon Grupları
### 3D Fan Model Bileşeni
Bu grup, modülün tek bileşeni olan duman tahliye fanının 3D modelinin tüm render sürecini, geometri hesaplamalarını ve rotor animasyonunu yönetir.
- SmokeExhaustFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### SmokeExhaustFanModel
**Ne yapar**: Duman egzoz fanının 3D modelini oluşturan bir React bileşenidir. Bileşen, fanın kasasını, flanşlarını, 6 adet uzun orak şekilli kanadı, göbeği, motoru ve ayak yapısını Three.js geometrileri ve materyalleri kullanarak render eder. Rotor sürekli olarak döndürülerek animasyon efekti sağlanır.

**Nasıl yapar**: Bileşen, `useResolveMaterials` hook'u ile materyalleri çözer ve `useRef` ile rotor grubuna referans oluşturur. `useFrame` hook'u kullanılarak her karede rotor referansının z ekseni etrafında dönüşü, `delta` zamanıyla orantılı olarak güncellenir (hız katsayısı: 8). Çeşitli geometriler (`bladeGeometry`, `casingGeometry`, `flangeRingGeometry`, `flangeCylinderGeometry`, `boltGeometry`, `standLegGeometry`, `standFootGeometry`, `hubGeometry`, `hubCapGeometry`, `motorBodyGeometry`, `motorJunctionBoxGeometry`) `useMemo` ile bellek sızıntılarını önlemek amacıyla önbelleğe alınarak oluşturulur. `useEffect` hook'u ile bileşen unmount edildiğinde tüm geometrilerin `dispose()` metodu çağrılarak kaynaklar temizlenir. JSX dönüşünde, bileşen `scale` ve `rotation` ile ölçeklenip döndürülmüş bir `<group>` içinde; kasa, flanşlar (her iki tarafta 16'şar cıvatalı), rotor (6 kanatlı), motor ve ayak yapısı hiyerarşik olarak yerleştirilir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: JSX elementi döndürür — belirtilen `scale` ve `rotation` özelliklerine sahip bir Three.js `<group>` yapısı içinde fanın tüm parçalarını (kasa, flanşlar, rotor, motor, ayaklar) içerir. Return tipi kaynakta açıkça belirtilmemiştir.

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
- import: three::ExtrudeGeometry
- import: three::RingGeometry
- import: three::Shape
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::SmokeExhaustFanModel
- **params**: yok
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.smokeCoating`, `materials.castBladeMat`, `materials.matteBlack`, `materials.boltMaterial` alanlarına JSX içinde erişilir
  - `rotorRef` — `useRef<Group>(null)` ile oluşturulan rotor grubu referansı; `useFrame` callback'inde `rotorRef.current.rotation.z` güncellenir
  - `bladeGeometry` — `useMemo` ile oluşturulan `ExtrudeGeometry`; bıçak profilinin extrüzyon sonucu oluşan 3D geometrisi
  - `casingGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.7, 0.7, 0.8, 64, 1, true)`; kovan gövdesi
  - `flangeRingGeometry` — `useMemo` ile oluşturulan `RingGeometry(0.7, 0.82, 64)`; flanş halkası
  - `flangeCylinderGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.82, 0.82, 0.04, 64, 1, true)`; flanş silindiri
  - `boltGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.012, 0.012, 0.02, 6)`; cıvata geometrisi
  - `standLegGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.08, 0.4, 0.04)`; ayak bacağı
  - `standFootGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.1, 0.05, 1.2)`; ayak tabanı
  - `hubGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.18, 0.18, 0.12, 16)`; rotor göbeği
  - `hubCapGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.08, 0.14, 0.08, 32)`; göbek kapağı
  - `motorBodyGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.25, 0.25, 0.45, 32)`; motor gövdesi
  - `motorJunctionBoxGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.12, 0.12, 0.08)`; motor bağlantı kutusu
- **Dönüş**: JSX — `<group scale={[0.65, 0.65, 0.65]} rotation={[0, -Math.PI / 4, 0]}>` kök elemanı; duman egzoz fanının 3D modelini render eder

---

### [N2_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::useFrame callback
- **params**: `state`, `delta`
- **ic_degiskenler**:
  - `state` — React Three Fiber kare durumu nesnesi; bu callback içinde kullanılmaz
  - `delta` — son kareden bu kareye geçen süre (saniye cinsinden); rotor dönüş hızını hesaplamak için kullanılır
  - `rotorRef.current` — koşullu erişim (`if (rotorRef.current)`); rotor grubunun mevcut referansı; `rotation.z` değeri `delta * 8` kadar azaltılır
- **Dönüş**: yok — yan etki: `rotorRef.current.rotation.z -= delta * 8` ile rotorun z ekseni etrafında sürekli dönüşü

---

### [N3_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::bladeGeometry useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `shape` — `new Shape()` ile oluşturulan 2D profil; `moveTo(0, -0.05)`, `lineTo(0, 0.05)`, `bezierCurveTo(0.15, 0.12, 0.35, 0.20, 0.51, 0.18)`, `lineTo(0.52, 0.08)`, `bezierCurveTo(0.35, -0.02, 0.15, -0.04, 0, -0.05)` çağrılarıyla uzun orak (cleaver) şeklinde bıçak profili çizilir
  - `extrudeSettings` — extrüzyon ayarları nesnesi; `depth: 0.015`, `bevelEnabled: true`, `bevelThickness: 0.003`, `bevelSize: 0.003`, `bevelSegments: 2` alanlarını içerir
- **Dönüş**: `ExtrudeGeometry` — `new ExtrudeGeometry(shape, extrudeSettings)` ile oluşturulan bıçak 3D geometrisi

---

### [N4_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::useEffect cleanup (dış)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu — geometrilerin `dispose()` çağrısını gerçekleştiren iç fonksiyonu döndürür

---

### [N5_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::useEffect inner cleanup
- **params**: yok
- **ic_degiskenler**:
  - `bladeGeometry` — dış kapsamdan erişilir; `bladeGeometry.dispose()` çağrılır
  - `casingGeometry` — dış kapsamdan erişilir; `casingGeometry.dispose()` çağrılır
  - `flangeRingGeometry` — dış kapsamdan erişilir; `flangeRingGeometry.dispose()` çağrılır
  - `flangeCylinderGeometry` — dış kapsamdan erişilir; `flangeCylinderGeometry.dispose()` çağrılır
  - `boltGeometry` — dış kapsamdan erişilir; `boltGeometry.dispose()` çağrılır
  - `standLegGeometry` — dış kapsamdan erişilir; `standLegGeometry.dispose()` çağrılır
  - `standFootGeometry` — dış kapsamdan erişilir; `standFootGeometry.dispose()` çağrılır
  - `hubGeometry` — dış kapsamdan erişilir; `hubGeometry.dispose()` çağrılır
  - `hubCapGeometry` — dış kapsamdan erişilir; `hubCapGeometry.dispose()` çağrılır
  - `motorBodyGeometry` — dış kapsamdan erişilir; `motorBodyGeometry.dispose()` çağrılır
  - `motorJunctionBoxGeometry` — dış kapsamdan erişilir; `motorJunctionBoxGeometry.dispose()` çağrılır
- **Dönüş**: yok — yan etki: tüm 11 geometrinin GPU belleğini serbest bırakır

---

### [N6_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::flange map callback
- **params**: `zPos`, `i`
- **ic_degiskenler**:
  - `zPos` — flanşın z ekseni pozisyonu; `[0.38, -0.38]` dizisinden gelir
  - `i` — flanş indeksi (0 veya 1); cıvata z pozisyonunu belirler (`i === 0 ? 0.025 : -0.025`)
  - `b` — iç `Array(16).fill(0).map` callback'indeki cıvata indeksi (0–15); `Math.cos(b * Math.PI / 8)` ve `Math.sin(b * Math.PI / 8)` ile dairesel pozisyon hesaplanır
- **Dönüş**: JSX — `<group key={flange-${i}} position={[0, 0, zPos]}>` elemanı; flanş halkası, flanş silindiri, 16 cıvata ve 2 ayak bacağı içerir

---

### [N7_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::bolt map callback
- **params**: `_`, `b`
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı (Array.fill(0) sonucu)
  - `b` — cıvata indeksi (0–15); `0.76 * Math.cos(b * Math.PI / 8)` ve `0.76 * Math.sin(b * Math.PI / 8)` ile x ve y pozisyonu hesaplanır
- **Dönüş**: JSX — `<mesh>` elemanı; `boltGeometry` ve `materials.boltMaterial` ile cıvata render eder

---

### [N8_NASIL] AST Pointer: SmokeExhaustFanModel.tsx::blade map callback
- **params**: `_`, `i`
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı (Array.fill(0) sonucu)
  - `i` — bıçak indeksi (0–5); `i * ((Math.PI * 2) / 6)` ile her bıçak için 60 derece aralıkla rotasyon atanır
- **Dönüş**: JSX — `<group>` elemanı; `bladeGeometry` ve `materials.castBladeMat` ile bıçak render eder; `[0.18, 0, 0]` offset ve `[0.7, 0, 0]` rotasyon ile konumlandırılır

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SmokeExhaustFanModel.tsx
  function: src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmokeExhaustFanModel

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