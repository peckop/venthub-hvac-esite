---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\factory\parts\InternalFanRotor.tsx
skeleton_hash: a726589210709963
entity_hashes:
  func:InternalFanRotor: ac57944d86aa281e
  overview: 28c39b6b8851f9c0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:06:50Z
---

## Genel Bakış
Bu modül, 3B bir iç fan rotoru bileşeni tanımlar. Bileşen, yarıçap, dönme hızı ve konum gibi özellikleri girdi olarak alarak 3B sahnesinde bir fan rotoru render eder. Fonksiyon imzası kesik (truncated) olduğundan, bileşenin tam parametre listesi bilinmiyor.

## Fonksiyon Grupları
### Bileşen Tanımı
Modülün tek bileşenini tanımlar. Girdi olarak aldığı boyut, hız ve konum özellikleriyle 3B fan rotorunu oluşturan ve döndüren bir React bileşeni döndürür.
- InternalFanRotor

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, gövdedeki mantıktan türetilen aksiyom üretilemez. Yalnızca fonksiyon imzası mevcuttur; imzadan davranışsal çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### InternalFanRotor
**Ne yapar**: InternalFanRotor, bir 3D ortamda iç fan dönüşürü componentini tanımlar. Verilen yarıçap, dönüş hızı, konum ve rotasyon değerlerine göre fanın görsel ve davranışsal özelliklerini ayarlar.

**Nasıl yapar**: Fonksiyon, props olarak alınan değerleri kullanarak bir React functional component döndürür. Bu component, iç fan dönüşürüsünün geometrisini ve animasyonunu (örneğin spinSpeed ile sürekli döndürme) belirleyen JSX veya 3D kitaplık çağrılarını içerir. Varsayılan değerler sağlandığı için props eksik bırakılırsa güvenli bir yedek kullanılır.

**Parametreler**:
- radius: number — Fanın yarıçapı; varsayılan değer 0.25 birim.
- spinSpeed: number — Fanın saniyede dönüş hızı (örneğin devrim/saniye); varsayılan değer 10.
- position: number[] — Fanın 3D uzaydaki konumu; [x, y, z] formatında bir dizi, varsayılan değer [0, 0, 0].
- rotat: ??? — Parçalı görünen parametre; snippet'te tam adı veya tipi belirtilmemiştir, bu yüzden tip ve açıklama kaynak kodunda eksiktir.

**Dönüş**: React.FC<InternalFanRotorProps> — InternalFanRotorProps tipini karşılayan bir React fonksiyonel componenti döndürür; bu component render edildiğinde 3D ortamda iç fan dönüşürüsünü gösterir.

---

## İTHALATLAR (IMPORTS)
- import: ../../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::BoxGeometry
- import: three::CylinderGeometry
- import: three::SphereGeometry
- import: three::type { Group }

---

## INTERFACES

### InternalFanRotorProps
- `radius?: number`
- `spinSpeed?: number`
- `position?: [number, number, number]`
- `rotation?: [number, number, number]`
- `isSelected?: boolean`
- `isIsolated?: boolean`
- `isHidden?: boolean`
- `onClick?: () => void`
- `explode?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::InternalFanRotor
- **params**: `radius` (varsayılan 0.25), `spinSpeed` (varsayılan 10), `position` (varsayılan [0,0,0]), `rotation` (varsayılan [0,0,0]), `isSelected`, `isIsolated`, `isHidden`, `onClick`, `explode` (varsayılan 0)
- **ic_degiskenler**:
  - `groupRef` — `useRef<Group>(null)` ile oluşturulan referans; dönen kanat grubunun DOM erişimi için kullanılır
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.matteBlack`, `materials.safetyOrange`, `materials.vorticeGreen` alanlarına erişilir
  - `bladeCount` — sabit değer 6; kanat sayısını belirler
  - `geometries` — `useMemo` ile üretilen geometri nesnesi; `cylinderGeo`, `sphereGeo`, `boxGeo` alanlarını içerir
  - `bladeMaterial` — `isSelected` true ise `materials.safetyOrange`, değilse `materials.vorticeGreen` olarak atanan malzeme
- **Dönüş**: JSX `<group>` elementi; `position` ve `rotation` prop'larıyla konumlandırılmış, içinde dönen kanat grubu bulunan React node. `isHidden` true veya `isIsolated === false` ise `null` döner

### [N2_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::useFrame callback
- **params**: `_` (unused, clock nesnesi), `delta` (frame'ler arası geçen süre)
- **ic_degiskenler**:
  - `groupRef.current` — dönen grubun Three.js Group referansı; `rotation.y` değeri artırılır
  - `isHidden` — dışarıdan gelen prop; true ise animasyon durdurulur
  - `isIsolated` — dışarıdan gelen prop; `false` ise animasyon durdurulur
  - `isSelected` — dışarıdan gelen prop; true ise `spinSpeed` yerine 0 kullanılır (dönüş durur)
  - `spinSpeed` — dışarıdan gelen prop; dönüş hızı olarak `delta` ile çarpılır
- **Dönüş**: yok (yan etki: `groupRef.current.rotation.y` değerini günceller)

### [N3_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `radius` — dışarıdan gelen prop; geometri boyutlarını hesaplamak için çarpan olarak kullanılır
  - `cylinderGeo` — `new CylinderGeometry(radius * 0.22, radius * 0.22, 0.08, 16)` ile oluşturulan silindir geometrisi
  - `sphereGeo` — `new SphereGeometry(radius * 0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2)` ile oluşturulan yarım küre geometrisi
  - `boxGeo` — `new BoxGeometry(radius * 0.75, 0.012, radius * 0.35)` ile oluşturulan kutu geometrisi (kanatlar için)
- **Dönüş**: `{ cylinderGeo, sphereGeo, boxGeo }` nesnesi

### [N4_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu (VRAM temizleme için)

### [N5_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**:
  - `geometries` — `Object.values()` ile değerleri alınan geometri nesnesi; her bir geo üzerinde `dispose()` çağrılır
  - `geo` — `forEach` döngüsündeki her geometri nesnesi; `dispose()` metodu çağrılarak VRAM'den temizlenir
- **Dönüş**: yok (yan etki: tüm geometrilerin VRAM belleğini serbest bırakır)

### [N6_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::onClick handler
- **params**: `e` (Three.js click event nesnesi)
- **ic_degiskenler**:
  - `e` — event nesnesi; `stopPropagation()` metodu çağrılarak üst elementlere yayılım engellenir
  - `onClick` — dışarıdan gelen prop; opsiyonel chaining (`?.`) ile çağrılır
- **Dönüş**: yok (yan etki: event yayılımını durdurur ve `onClick` varsa çağırır)

### [N7_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::map callback
- **params**: `_` (unused, array elemanı), `i` (döngü indeksi)
- **ic_degiskenler**:
  - `i` — kanat indeksi (0-5 arası); her kanat için `rotation` hesaplamasında `(i * Math.PI * 2) / bladeCount` formülüyle kullanılır
  - `bladeCount` — dışarıdan erişilen sabit değer 6
  - `radius` — dışarıdan gelen prop; `radius * 0.58` ile kanat pozisyonu hesaplanır
  - `explode` — dışarıdan gelen prop; `explode * 0.1` ile kanat pozisyonuna ek ofset eklenir
  - `geometries.boxBox` — useMemo'dan dönen kutu geometrisi; kanat mesh'inde kullanılır
  - `bladeMaterial` — `isSelected` durumuna göre seçilen malzeme; kanat mesh'inde kullanılır
- **Dönüş**: JSX `<group>` elementi; her kanat için döndürme ve konum bilgisiyle `<mesh>` içerir

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\parts\InternalFanRotor.tsx
  function: src\components\products\3d\factory\parts\InternalFanRotor.tsx::InternalFanRotor

---

## DISA AKTARILANLAR (EXPORTS)
  export: InternalFanRotor

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