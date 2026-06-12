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
generated_at: 2026-06-12T10:20:40Z
---

## Genel Bakış
Bu modül, 3B bir iç fan rotoru (InternalFanRotor) React bileşenini tanımlar. Bileşen, fan rotorunun geometrik ve dönme özelliklerini (yarıçap, hız, konum, rotasyon) alarak 3B sahnesinde render eden bir fabrika parçasıdır.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün tek bileşeni olan InternalFanRotor'u tanımlar. Fonksiyon, girdi olarak aldığı boyut, hız ve konum özellikleriyle 3B fan rotorunu oluşturan ve döndüren bir React bileşeni döndürür.
- InternalFanRotor

---

## AXIOMS – Mimari Varsayımlar

Bu modül, 3D bir iç fan rotoru bileşenidir ve Three.js/React Three Fiber benzeri bir 3D renderlama ortamında çalışır.

[Aksiyom 1]: Eğer 3D renderlama bağlamı (Three.js Canvas/Scene) yoksa, bileşen düzgün render edilmez ve görünmez olur.

[Aksiyom 2]: Eğer `position` parametresi 3 elemanlı bir dizi [x, y, z] formatında değilse, bileşenin 3D sahnedeki konumu tanımsız olur.

[Aksiyom 3]: Eğer `radius` parametresi 0 veya negatif bir değer olarak verilirse, fan rotor geometrisi oluşmaz veya çöker.

[Aksiyom 4]: Eğer `spinSpeed` parametresi 0 olarak ayarlanırsa, rotor dönmeyecektir; negatif değer yön değişikliğine neden olur (bu beklenen bir davranış olabilir veya olmayabilir, bilinmiyor).

[Aksiyom 5]: Fonksiyon imzası `rotat...` ile kesilmiş olduğundan, bileşenin tam parametre listesi bilinmiyor — olası ek parametreler (rotation, color, material vb.) olabilir.

---

**Not**: Bu aksiyomlar yalnızca fonksiyon imzasından türetilmiştir. Docstring ve yorumlardan bilgi çıkarılmamıştır. Fonksiyon imzası kesik (truncated) olduğu için bileşenin tam sözleşme gereksinimleri belirsizdir.

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