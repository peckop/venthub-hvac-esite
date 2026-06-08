---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx
skeleton_hash: 47e41151455def74
entity_hashes:
  func:WallMountedCompactFanModel: 500276a0a7bacf11
  overview: d76881c9e49d944d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3D ürün görselleştirme altyapısında yer alan, duvara monte kompakt fan modellerinin üç boyutlu olarak renderlanmasını sağlayan tek bir React bileşenini içerir. Ürün sayfalarında ilgili fan türünün interaktif 3D gösterimini sunmakla sorumludur.

## Fonksiyon Grupları
### Ana 3D Bileşeni
Tek bileşen grubu olup, duvara monte kompakt fanın 3D modelini React uygulaması içinde renderlayan ve ürün sayfasında görüntülenmesini sağlayan temel yapıyı oluşturur.
- WallMountedCompactFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React functional component olup, 3D duvara monte kompakt fan modelini renderlar. Fonksiyon gövdesi içeriği paylaşılmadığı için, yalnızca modül yapısından çıkarılabilecek minimal aksiyomlar tanımlanmıştır.

---

## FONKSİYON DETAYLARI

### WallMountedCompactFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında kullanılmak üzere, duvara monte kompakt vantilatörün 3 boyutlu modelini barındıran bir React fonksiyonel bileşeni sunar. Projenin tip güvenliği standartlarına uygun olarak 3D ürün modelleri ailesinin bir parçası olarak yapılandırılmış, sadece bu spesifik vantilatör modelinin 3B olarak render edilmesini sağlar.
**Nasıl yapar**: TypeScript ile güçlendirilmiş tip güvenliği sunan bir yapı ile, React.FC türünde hazırlanmış bileşeni doğrudan döndüren bir fabrika yapısı sunar. Kaynak kodunun bulunduğu dizin itibarıyla tüm duvara monte kompakt vantilatörlere ait 3B görsel varlıkları ve geometrik tanımları içeren bileşeni projenin diğer bölümlerinin kullanımına sunar, projenin 3D modelleme entegrasyonlarıyla sorunsuz çalışacak şekilde önceden yapılandırılmıştır.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulama içindeki herhangi bir noktada çağrıldığında, duvara monte kompakt vantilatörün 3D modelini React render süreci kapsamında ilgili ekrana çizmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/WallMountedCompactFanModel.tsx::WallMountedCompactFanModel
- **params**: (yok — anonim arrow fonksiyon, parametre almaz)
- **ic_degiskenler**:
  - `fanRef` — `useRef<THREE.Group>(null)` ile oluşturulan ref, pervane grubuna (group element) bağlanır, useFrame callback'inde `fanRef.current.rotation.z` ile pervane döndürülür
  - `plateGeometry` — `useMemo` ile memoize edilmiş `THREE.ExtrudeGeometry`, duvar montaj plakasının 2D shape'inden extrude edilen geometri; montaj delikleri ve merkez delik dahil
  - `COLORS` — Hardcoded renk paleti nesnesi: `PLATE` (galvanize çelik '#94a3b8'), `BLACK_PARTS` (mat siyah '#1e293b'), `BLADE_ORANGE` (turuncu '#ea580c'), `WIRE_GUARD` (çelik gri '#64748b')
  - `useFrame` callback — `(state, delta) => { if(fanRef.current) fanRef.current.rotation.z -= delta * 15 }` — her frame'de pervaneyi `delta * 15` hızıyla saat yönünün tersine döndürür
- **Dönüş**: JSX — `group` elemanı (`scale={[0.8, 0.8, 0.8]}`), içinde plaka, motor, pervane, tel kafes ve klemens kutusu JSX subtree'i

---

## NODE ID STANDARD

  file: src\components\products\3d\types\WallMountedCompactFanModel.tsx
  function: src\components\products\3d\types\WallMountedCompactFanModel.tsx::WallMountedCompactFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: WallMountedCompactFanModel

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