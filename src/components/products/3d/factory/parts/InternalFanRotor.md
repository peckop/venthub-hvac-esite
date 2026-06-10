---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\parts\InternalFanRotor.tsx
skeleton_hash: e86dc5a160b53977
entity_hashes:
  func:InternalFanRotor: ac57944d86aa281e
  overview: 256aaa04411e9436
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:38:43Z
---

## Genel Bakış
Bu modül, 3B bir iç fan rotoru (InternalFanRotor) React bileşenini tanımlar. Bileşen, fan rotorunun geometrik ve dönme özelliklerini (yarıçap, hız, konum, rotasyon) alarak 3B sahnesinde render eden bir fabrika parçasıdır.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün tek bileşeni olan InternalFanRotor'u tanımlar. Fonksiyon, girdi olarak aldığı boyut, hız ve konum özellikleriyle 3B fan rotorunu oluşturan ve döndüren bir React bileşeni döndürür.
- InternalFanRotor

---



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

### [N1_NASIL] AST Pointer: InternalFanRotor.tsx::InternalFanRotor
- **params**:
  - `radius` — fan rotor yarıçapı, varsayılan `0.25`
  - `spinSpeed` — dönme hızı, varsayılan `10`
  - `position` — THREE.js group pozisyonu, varsayılan `[0, 0, 0]`
  - `rotation` — THREE.js group rotasyonu, varsayılan `[0, 0, 0]`
  - `isSelected` — seçili durum flag'i, blade rengini belirler
  - `isIsolated` — izolasyon durumu flag'i, `false` ise gizlenir
  - `isHidden` — gizlilik flag'i, `true` ise `null` döner
  - `onClick` — tıklama callback fonksiyonu
  - `explode` — blade patlama mesafesi, varsayılan `0`
- **ic_degiskenler**:
  - `groupRef` — THREE.js `Group` referansı, `useRef` ile oluşturulur, `useFrame` içinde döndürme yapılır
  - `materials` — `useFanMaterials()` hook'undan dönen material nesnesi (`matteBlack`, `safetyOrange`, `vorticeGreen` içerir)
  - `bladeCount` — sabit `6`, kanat sayısı
  - `bladeMaterial` — `isSelected` durumuna göre `materials.safetyOrange` veya `materials.vorticeGreen` seçilir
- **Dönüş**: `JSX.Element | null` — JSX grubu veya erken `null` dönüşü

---

### [N2_NASIL] AST Pointer: InternalFanRotor.tsx::useFrame_callback
- **params**:
  - `_` — `useFrame` ilk parametresi (unused, clock state)
  - `delta` — son frame ile geçen süre (saniye cinsinden)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (void) — `groupRef.current.rotation.y` üzerinde yan etki: `delta * spinSpeed` kadar Y-ekseninde döndürme, `isSelected` ise durdurulur

---

### [N3_NASIL] AST Pointer: InternalFanRotor.tsx::onClick_handler
- **params**:
  - `e` — React click event nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (void) — `e.stopPropagation()` ile event yayılımını durdurur, ardından `onClick?.()` callback'ini çağırır

---

### [N4_NASIL] AST Pointer: InternalFanRotor.tsx::map_callback
- **params**:
  - `_` — dizi elemanı (kullanılmıyor)
  - `i` — mevcut elemanın indeksi (`0` arası `bladeCount - 1`), kanat açı hesaplamasında kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element` — her kanat için `<group>` + `<mesh>` + `<boxGeometry>` JSX'i döner; `rotation` `(i * Math.PI * 2) / bladeCount` ile hesaplanır, `position` `radius * 0.58 + (explode * 0.1)` ile hesaplanır

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