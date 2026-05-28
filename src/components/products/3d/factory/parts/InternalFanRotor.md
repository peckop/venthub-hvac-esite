---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\parts\InternalFanRotor.tsx
skeleton_hash: eaaf785a44af0afb
entity_hashes:
  func:InternalFanRotor: ac57944d86aa281e
  overview: d9f5198d3b7b9bcf
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:38Z
---

## Genel Bakış
Bu modül, 3D bir iç fan dönörü (InternalFanRotor) bileşenini tanımlar. Bileşen, yarıçap, dönüş hızı, konum ve rotasyon gibi özellikleri alarak bir React fonksiyon bileşeni olarak render eder.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün tek dışa açık işlevi olan InternalFanRotor fonksiyonunu içerir; bu fonksiyon, verilen props ile 3D fan dönörü modelini oluşturan ve döndüren bir React bileşenidir.
- InternalFanRotor

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için prop değerlerinin belirli varsayılanlara veya zorunlu olmasına dayandığı aşağıdaki aksiyomlar geçerlidir.

- Eğer **radius** prop'u verilmezse, varsayılan değer **0.25** kullanılır; aksi takdirde componentin geçirilen radius değeriyle çalışması beklenir.
- Eğer **spinSpeed** prop'u verilmezse, varsayılan değer **10** kullanılır; aksi takdirde componentin geçirilen spinSpeed değeriyle çalışması beklenir.
- Eğer **position** prop'u verilmezse, varsayılan değer **[0, 0, 0]** kullanılır; aksi takdirde componentin geçirilen position değeriyle çalışması beklenir.
- Eğer **rotat** prop'u verilmezse, bu prop için bir default değeri tanımsız olduğu için componentin çalışması için **rotat** değeri zorunludur; eksik olması durumunda `undefined` değeriyle kullanılması beklenmeyen davranışlara veya hata yoluna yol açabilir.

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
- **params**: radius, spinSpeed, position, rotation, isSelected, isIsolated, isHidden, onClick, explode
- **ic_degiskenler**:
  - `groupRef` — REF to THREE.Group for accessing the group's rotation in the animation frame.
  - `materials` — object containing fan material definitions (safetyOrange, vorticeGreen, matteBlack) from the `useFanMaterials` hook.
  - `bladeCount` — number of blades in the rotor (constant value 6).
  - `bladeMaterial` — selected blade material based on the `isSelected` flag (safetyOrange when selected, otherwise vorticeGreen).
- **Dönüş**: JSX element (React.FC<InternalFanRotorProps>)

### [N2_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::useFrameCallback
- **params**: _, delta
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::onClickHandler
- **params**: e
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/products/3d/factory/parts/InternalFanRotor.tsx::bladeMapCallback
- **params**: _, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (<group> containing a blade mesh)

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