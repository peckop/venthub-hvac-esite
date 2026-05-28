---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\AxialFanModel.tsx
skeleton_hash: 4c4f6a930c88d840
entity_hashes:
  func:AxialFanModel: cc382cf8a620825d
  overview: c92f209b9e895d7e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:45Z
---

## Genel Bakış
Bu modül, bir eksenli fanın üç boyutlu görsel temsili oluşturan bir React bileşenidir. Silindir tipi bir susturucu ekleme seçeneği sunarak, fanın temel geometrisini ve isteğe bağlı susturucu parametrelerini alarak modeli renderlar.

## Fonksiyon Grupları
### Temel Renderleme
Bileşen, gelen özelliklere göre fan ve isteğe bağlı susturucu şekillerini oluşturup ekrana çizer.
- AxialFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, silencer özelliğinin etkinliği `hasSilencer` bayrağıyla kontrol edilir; bu bayrak false olduğunda silencer ile ilgili boyut parametreleri etkisiz olur.

[Aksiyom 1]: Eğer `hasSilencer` **false** ise, `silencerRadius` ve `silencerLength` değerlerinin hiçbir etkisi olmaz (komponent silencerı render etmez).  
[Aksiyom 2]: Eğer `hasSilencer` **true** ise, `silencerRadius` pozitif bir sayı (>0) olmalıdır; aksi takdirde silencerin yarıçapı geçersiz olur ve görsel olarak beklenmeyen bir sonuç ortaya çıkabilir.  
[Aksiyom 3]: Eğer `hasSilencer` **true** ise, `silencerLength` pozitif bir sayı (>0) olmalıdır; aksi takdirde silencerin uzunluğu sıfır olduğu için silencer etkisiz olur ve komponent sadece fanı gösterir.  
[Aksiyom 4]: Eğer `silencerLength` **0** (varsayılan değer) ise, `hasSilencer` **false** kabul edilmelidir; aksi takdirde silencer etkin ama uzunluğu sıfır olduğu için görsel olarak etkisiz olur.  
[Aksiyom 5]: Eğer `silencerRadius` **0.58** (varsayılan değer) ve `hasSilencer` **false** ise, bu değerin hiçbir etkisi olmaz; yalnızca `hasSilencer` **true** olduğunda bu varsayılan yarıçap kullanılır.

---

## FONKSİYON DETAYLARI

### AxialFanModel
**Ne yapar**: AxialFanModel bileşenini render eder, gelen `hasSilencer`, `silencerRadius` ve `silencerLength` özelliklerine göre modelin yapılandırmasını yapar.  
**Nasıl yapar**: Fonksiyon, props nesnesinden `hasSilencer`, `silencerRadius` ve `silencerLength` değerlerini destructuring alır; belirtilmemişse varsayılan değerler (`false`, `0.58`, `0`) kullanılır. Daha sonra bu değerlere dayalı olarak silencerin eklenip eklenmeyeceği ve boyutları belirlenerek ilgili JSX/3D model çıktısı üretilir.  
**Parametreler**:
- hasSilencer: boolean — Silencerin modelde bulunup bulunmayacağını kontrol eder; true ise silencer eklenir.
- silencerRadius: number — Silencerin yarıçapını metre cinsinden tanımlar; varsayılan değer 0.58.
- silencerLength: number — Silencerin uzunluğunu metre cinsinden tanımlar; varsayılan değer 0.  
**Dönüş**: Dönüş tipi kaynak kodunda belirtilmemiştir; belirsiz (void veya JSX olabilir).

---

## INTERFACES

### AxialFanModelProps
- `hasSilencer?: boolean`
- `silencerRadius?: number`
- `silencerLength?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::AxialFanModel
- **params**: hasSilencer, silencerRadius, silencerLength
- **ic_degiskenler**:
  - `materials` — fan materials object returned by `useFanMaterials` hook; provides `glossyBlack`, `bladeBlack`, `logoRed`, `matteBlack` etc.
  - `fanRef` — `useRef<THREE.Group>(null)` used to reference the rotating fan assembly so its rotation can be updated each frame.
  - `bladeGeometry` — memoized `THREE.ExtrudeGeometry` representing the sickle‑blade shape, created once via `useMemo`.
- **Dönüş**: JSX element (the rendered `<group>` hierarchy representing the axial fan)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::useFrame callback
- **params**: state, delta
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (callback returns undefined; side‑effect updates `fanRef.current.rotation.z`)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::useMemo factory
- **params**: (yok)
- **ic_degiskenler**:
  - `shape` — a `THREE.Shape` instance built with a series of `moveTo` and `bezierCurveTo` calls defining the blade profile.
  - `extrudeSettings` — object configuring the extrusion (`depth`, bevel flags, thickness, size, segments).
- **Dönüş**: `THREE.ExtrudeGeometry` (the memoized blade geometry)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::flanges map callback
- **params**: y, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (`<group>` containing a `<mesh>` with a flange ring)

### [N5_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::blade group map callback
- **params**: _, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (`<group>` for each blade, holding the blade mesh)

### [N6_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::motor legs map callback
- **params**: angle, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (`<mesh>` representing one motor leg)

### [N7_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::rings map callback
- **params**: _, i
- **ic_degiskenler**:
  - `r` — computed radius for the current ring (`0.1 + i * 0.065`), used to set the inner and outer radii of the ring geometry.
- **Dönüş**: JSX element (`<mesh>` for each concentric ring)

### [N8_NASIL] AST Pointer: src/components/products/3d/types/AxialFanModel.tsx::radials map callback
- **params**: angle, j
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (`<mesh>` for each radial spoke)

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