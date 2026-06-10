---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx
skeleton_hash: 744e4deb9ef6c5ae
entity_hashes:
  func:WallMountedCompactFanModel: 500276a0a7bacf11
  overview: 4350355f50e38bb0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:53:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3D ürün görselleştirme sisteminde duvara monte kompakt fanların three boyutlu modelinin render edilmesini sağlayan tek bir React bileşeninden oluşur. Ürün sayfalarında ilgili fan modelinin interaktif 3D gösterimini sunmakla yükümlüdür.

## Fonksiyon Grupları
### 3D Ürün Bileşeni
Duvara monte kompakt fanın three boyutlu modelini React uygulaması içinde renderlayan ve ürün sayfasında görüntülenmesini sağlayan temel yapıdır.
- WallMountedCompactFanModel

---



---

## FONKSİYON DETAYLARI

### WallMountedCompactFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında kullanılmak üzere, duvara monte kompakt vantilatörün 3 boyutlu modelini barındıran bir React fonksiyonel bileşeni sunar. Projenin tip güvenliği standartlarına uygun olarak 3D ürün modelleri ailesinin bir parçası olarak yapılandırılmış, sadece bu spesifik vantilatör modelinin 3B olarak render edilmesini sağlar.
**Nasıl yapar**: TypeScript ile güçlendirilmiş tip güvenliği sunan bir yapı ile, React.FC türünde hazırlanmış bileşeni doğrudan döndüren bir fabrika yapısı sunar. Kaynak kodunun bulunduğu dizin itibarıyla tüm duvara monte kompakt vantilatörlere ait 3B görsel varlıkları ve geometrik tanımları içeren bileşeni projenin diğer bölümlerinin kullanımına sunar, projenin 3D modelleme entegrasyonlarıyla sorunsuz çalışacak şekilde önceden yapılandırılmıştır.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulama içindeki herhangi bir noktada çağrıldığında, duvara monte kompakt vantilatörün 3D modelini React render süreci kapsamında ilgili ekrana çizmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: WallMountedCompactFanModel.tsx::WallMountedCompactFanModel
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan referans; Three.js Group nesnesine erişim sağlar, useFrame içinde pervane rotasyonunu kontrol eder
  - `plateGeometry` — `useMemo` ile hesaplanan ExtrudeGeometry; duvar montaj plakasının 3D geometrisini tutar (kare plaka, montaj delikleri, merkez delik)
  - `COLORS` — Sabit renk paleti nesnesi; tüm 3D parçaların renklerini tanımlar
    - `COLORS.PLATE` — `'#94a3b8'` galvaniz çelik rengi, montaj plakası ve venturi ağzı için
    - `COLORS.BLACK_PARTS` — `'#1e293b'` mat siyah, motor gövdesi ve göbek için
    - `COLORS.BLADE_ORANGE` — `'#ea580c'` güvenlik turuncusu, pervane kanatları için
    - `COLORS.WIRE_GUARD` — `'#64748b'` endüstriyel çelik, tel kafes ve standoffs için
- **Dönüş**: JSX elementi — `<group>` içinde duvar montajlı kompakt fanın tüm 3D bileşenlerini (plaka, motor, pervane, tel kafes, klemens kutusu) içeren React Three Fiber bileşeni

---

### [N2_NASIL] AST Pointer: WallMountedCompactFanModel.tsx::useFrame_callback
- **params**: `state` — useFrame tarafından sağlanan frame durum bilgisi, `delta` — son frame ile geçen süre (saniye cinsinden)
- **ic_degiskenler**:
  - `fanRef.current` — okunuyor; fan referansının geçerli olup olmadığı kontrol edilir (null kontrolü)
- **Dönüş**: yok — yan etki: `fanRef.current.rotation.z` değerini `delta * 15` kadar azaltarak pervaneyi döndürür

---

### [N3_NASIL] AST Pointer: WallMountedCompactFanModel.tsx::useMemo_callback
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `shape` — `new Shape()` ile oluşturulan 2D şekil; montaj plakasının dış konturunu ve deliklerini tanımlar
  - `holeRadius` — `0.03`; köşe montaj deliklerinin yarıçapı
  - `holeOffset` — `0.42`; köşe montaj deliklerinin merkezden uzaklığı
  - `corners` — 4 elemanlı dizi; her biri `[x, y]` koordinat çifti, dört köşedeki montaj deliği pozisyonlarını tutar: `[0.42, 0.42]`, `[-0.42, 0.42]`, `[0.42, -0.42]`, `[-0.42, -0.42]`
  - `hole` — forEach içinde `new Path()` ile oluşturulan her montaj deliği yolu; `absarc` ile dairesel delik tanımlanır
  - `centerHole` — `new Path()` ile oluşturulan merkez delik yolu; `absarc(0, 0, 0.42, ...)` ile tanımlanır, pervane millerinin geçeceği büyük delik
- **Dönüş**: `ExtrudeGeometry` — `{ depth: 0.02, bevelEnabled: false }` parametreleriyle oluşturulmuş extrude edilmiş 3D geometri nesnesi

---

### [N4_NASIL] AST Pointer: WallMountedCompactFanModel.tsx::forEach_mounting_hole_callback
- **params**: `[x, y]` — destructured dizi; `corners` dizisinden gelen montaj deliği koordinatları
- **ic_degiskenler**:
  - `hole` — `new Path()` ile oluşturulan delik yolu nesnesi; `shape.holes` dizisine push edilerek plaka geometrisine delik eklenir
- **Dönüş**: yok — yan etki: `shape.holes.push(hole)` ile shape nesnesine delik ekler

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