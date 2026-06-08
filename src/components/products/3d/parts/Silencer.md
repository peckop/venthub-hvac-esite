---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Silencer.tsx
skeleton_hash: e4ebd20f97a501f3
entity_hashes:
  func:Silencer: b0d56de6b93be1bd
  overview: d6a0c154ebf448d9
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, HVAC ürünlerinin 3B görselleştirilmesi için kullanılan bir susturucu (silencer) parçasını tanımlayan bir React bileşenidir. Bileşen, susturucunun yarımçapı, uzunluğu ve konumunu ayarlamak için props kabul eder ve bu parametrelerle ilgili 3B modeli oluşturur.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün tek dışa görünen işlevini içerir; susturucu parçasının görsel ve geometrik özelliklerini belirleyen props ile yapılandırılabilir bir React fonksiyonel bileşeni tanımlar.
- Silencer

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `radius` prop'u verilmezse, varsayılan değer **0.6** kullanılır.  
[Aksiyom 2]: Eğer `length` prop'u verilmezse, varsayılan değer **0.8** kullanılır.  
[Aksiyom 3]: Eğer `position` prop'u verilmezse, varsayılan değer **[0, 0, 0]** kullanılır.

---

## FONKSİYON DETAYLARI

### Silencer
**Ne yapar**: Silencer bileşeni, HVAC sistemlerinde ses azaltma amacıyla kullanılan bir susturucu (silencer) modelini oluşturur. Silindir şeklinde bir dış kabuk ve iç kısmında delikli yüzey barındırarak gürültüyü düşürür.  
**Nasıl yapar**: Bileşen, verilen `radius`, `length` ve `position` parametrelerini kullanarak bir silindir geometrisi üretir; iç yüzeye delikli bir pattern ekleyerek ses emme özelliğini simüle eder ve bu geometriyi React üzerinden JSX olarak döndürür.  
**Parametreler**:
- radius: number — Silindirin yarıçapı (metre cinsinden), varsayılan değer 0.6  
- length: number — Silindirin uzunluğu (metre cinsinden), varsayılan değer 0.8  
- position: number[] — Silencerin 3D uzayda konumunu belirten [x, y, z] koordinatları, varsayılan değer [0, 0, 0]  
**Dönüş**: React.FC<SilencerProps> — Bir React fonksiyonel bileşeni döndürür; render edildiğinde silencerin 3D modelini ekrana çizer.

---

## INTERFACES

### SilencerProps
- `radius?: number`
- `length?: number`
- `position?: [number, number, number]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::Silencer
- **params**: radius, length, position
- **ic_degiskenler**:
  - `materials` — hook returning fan materials object (galvanizedSteel, industrialSteel, matteBlack) used for mesh materials.
  - `_perforationGeometry` — memoized geometry for perforated inner surface with holes pattern, depends on radius.
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::_perforationGeometry callback
- **params**: (none)
- **ic_degiskenler**:
  - `shape` — THREE.Shape instance defining the outer ring where holes are subtracted.
  - `holeRadius` — radius of the ring on which holes are placed (0.85 × radius).
  - `holeCount` — number of holes around the ring (fixed at 12).
  - `angle` — current angle for each hole iteration in radians.
  - `hx`, `hy` — x and y coordinates of the hole center for the current iteration.
  - `hole` — THREE.Path representing a circular hole added to `shape.holes`.
- **Dönüş**: THREE.ShapeGeometry

### [N3_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::perforation rings map
- **params**: _, i
- **ic_degiskenler**:
  - `_` — unused placeholder for the array element (zero).
  - `i` — index of the current perforation ring (0‑5).
  - `zPos` — vertical position along the silencer length for the ring, calculated to distribute six rings evenly.
- **Dönüş**: JSX.Element

### [N4_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::reinforcement rings map
- **params**: z, i
- **ic_degiskenler**:
  - `z` — z‑axis offset for each reinforcement ring (‑0.3, 0, 0.3).
  - `i` — index of the current ring.
- **Dönüş**: JSX.Element

### [N5_NASIL] AST Pointer: src/components/products/3d/parts/Silencer.tsx::mounting brackets map
- **params**: angle, i
- **ic_degiskenler**:
  - `angle` — rotation angle in degrees for each bracket (0, 120, 240).
  - `i` — index of the current bracket.
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Silencer.tsx
  function: src\components\products\3d\parts\Silencer.tsx::Silencer

---

## DISA AKTARILANLAR (EXPORTS)
  export: Silencer

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