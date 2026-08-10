---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx
skeleton_hash: 10e06c5262b0c3ce
entity_hashes:
  func:WallMountedCompactFanModel: 500276a0a7bacf11
  overview: 1626429cee72660d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:54Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3D ürün görselleştirme sistemi için duvara monte kompakt fanların üç boyutlu modelini içeren tek bir React fonksiyonel bileşenini tanımlar. Temel amacı, ilgili fan modelinin ürünler sayfasında interaktif bir 3D gösterimini sunmak için gerekli yapıyı sağlamaktır. Modül, projenin tip güvenliği ve 3D entegrasyon standartlarına uygun olarak tasarlanmıştır.

## Fonksiyon Grupları
### 3D Ürün Bileşeni
Bu grup, belirli bir HVAC ürününün (duvara monte kompakt fan) three.js tabanlı 3D modelini barındıran ve React uygulaması içinde doğrudan render edilebilen temel UI bileşenini kapsar.
- WallMountedCompactFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, minimal fonksiyon imzası (parametresiz, sabitsiz) nedeniyle güçlü mimari varsayımlar içermemektedir.

[Aksiyom 1]: Eğer bileşen React component ağacı dışında (örn: Node.js sunucu tarafı) çağrılırsa, `React.FC` dönüş tipi çalışmayacağı için rendering hatası oluşur.

[Aksiyom 2]: Eğer 3D model yüklenmesi için gerekli harici kaynaklar (3D model dosyaları, texture'lar, Three.js kütüphanesi) erişilemez durumda ise, bileşen boş/hatalı render edilir.

[Aksiyom 3]: Eğer bileşen React Provider zinciri dışında (Three.js context, Loading context vb.) kullanılırsa, bağımlı context'ler sağlanmadığı için çalışma zamanı hatası oluşur.

---

## FONKSİYON DETAYLARI

### WallMountedCompactFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında kullanılmak üzere, duvara monte kompakt vantilatörün 3 boyutlu modelini barındıran bir React fonksiyonel bileşeni sunar. Projenin tip güvenliği standartlarına uygun olarak 3D ürün modelleri ailesinin bir parçası olarak yapılandırılmış, sadece bu spesifik vantilatör modelinin 3B olarak render edilmesini sağlar.
**Nasıl yapar**: TypeScript ile güçlendirilmiş tip güvenliği sunan bir yapı ile, React.FC türünde hazırlanmış bileşeni doğrudan döndüren bir fabrika yapısı sunar. Kaynak kodunun bulunduğu dizin itibarıyla tüm duvara monte kompakt vantilatörlere ait 3B görsel varlıkları ve geometrik tanımları içeren bileşeni projenin diğer bölümlerinin kullanımına sunar, projenin 3D modelleme entegrasyonlarıyla sorunsuz çalışacak şekilde önceden yapılandırılmıştır.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulama içindeki herhangi bir noktada çağrıldığında, duvara monte kompakt vantilatörün 3D modelini React render süreci kapsamında ilgili ekrana çizmek üzere kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::WallMountedCompactFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanRef` — useRef hook ile oluşturulmuş referans, 3D fan modelinin Group nesnesine erişmek için kullanılır
  - `mats` — useResolveMaterials() hook'unun döndürdüğü malzeme nesnelerini tutar (galvanizedSteel, matteBlack, safetyOrange, industrialSteel)
  - `plateGeometry` — useMemo ile oluşturulmuş, duvar montaj plakasının ExtrudeGeometry nesnesi
  - `venturiGeometry` — useMemo ile oluşturulmuş, venturi ağzının CylinderGeometry nesnesi
  - `motorBodyGeometry` — useMemo ile oluşturulmuş, motor gövdesinin CylinderGeometry nesnesi
  - `finGeometry` — useMemo ile oluşturulmuş, soğutma kanatçıklarının BoxGeometry nesnesi
  - `supportArmGeometry` — useMemo ile oluşturulmuş, motor kollarının BoxGeometry nesnesi
  - `hubGeometry` — useMemo ile oluşturulmuş, pervane göbeğinin CylinderGeometry nesnesi
  - `bladeGeometry` — useMemo ile oluşturulmuş, pervane kanatlarının BoxGeometry nesnesi
  - `standoffPinGeometry` — useMemo ile oluşturulmuş, standof çivilerinin CylinderGeometry nesnesi
  - `standoffCapGeometry` — useMemo ile oluşturulmuş, standof kapaklarının CylinderGeometry nesnesi
  - `frameVertGeometry` — useMemo ile oluşturulmuş, dikey çerçevenin BoxGeometry nesnesi
  - `frameHorizGeometry` — useMemo ile oluşturulmuş, yatay çerçevenin BoxGeometry nesnesi
  - `radialWireGeometry` — useMemo ile oluşturulmuş, radyal tellerin BoxGeometry nesnesi
  - `klemensBoxGeometry` — useMemo ile oluşturulmuş, klemens kutusunun BoxGeometry nesnesi
  - `klemensCylinderGeometry` — useMemo ile oluşturulmuş, klemens silindirinin CylinderGeometry nesnesi
  - `ringGeometries` — useMemo ile oluşturulmuş, 5 adet RingGeometry içeren dizi
- **Dönüş**: JSX (3D fan modelinin tüm bileşenlerini içeren group elementi)

### [N2_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::useFrame callback
- **params**: (state, delta) — Three.js durumu ve frame delta süresi
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: fanRef.current.rotation.z'yi delta * 15 kadar azaltarak fanı döndürür)

### [N3_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::plateGeometry useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — Shape nesnesi, plaka geometrisinin temel şeklini oluşturur
  - `holeRadius` — sabit 0.03, delik yarıçapı
  - `holeOffset` — sabit 0.42, deliklerin merkezden uzaklığı
  - `corners` — 4 köşe deliğinin [x, y] koordinatlarını tutan dizi
  - `hole` — Path nesnesi, her köşe deliğini temsil eder
  - `centerHole` — Path nesnesi, merkez deliği temsil eder
- **Dönüş**: ExtrudeGeometry (plaka geometrisi)

### [N4_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::corners forEach callback
- **params**: ([x, y]) — her deliğin koordinatları
- **ic_degiskenler**:
  - `hole` — Path nesnesi, belirli koordinatlarda delik oluşturur
- **Dönüş**: yok (yan etki: shape.holes dizisine delik ekler)

### [N5_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::ringGeometries useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: Array(5).fill(0).map() ile oluşturulmuş RingGeometry dizisi

### [N6_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::ringGeometries map callback
- **params**: (_, i) — indeks numarası
- **ic_degiskenler**: (yok)
- **Dönüş**: RingGeometry (i. halka için)

### [N7_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::useEffect cleanup callback
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: cleanup fonksiyonu (iade edilen fonksiyon)

### [N8_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::useEffect cleanup fonksiyonu
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: tüm geometri nesnelerinin dispose() methodunu çağırarak VRAM'i temizler)

### [N9_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::cooling fins map callback
- **params**: (_, i) — kanatçık indeksi (0-7)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (soğutma kanatçığını temsil eden mesh elementi)

### [N10_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::motor arms map callback
- **params**: (angle, i) — açı (derece) ve indeks
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (motor kolunu temsil eden group ve mesh elementleri)

### [N11_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::blades map callback
- **params**: (_, i) — kanat indeksi (0-4)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (pervane kanadını temsil eden group ve mesh elementi)

### [N12_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::standoffs outer map callback
- **params**: x — x koordinatı (0.4 veya -0.4)
- **ic_degiskenler**: (yok)
- **Dönüş**: Array ile inner map sonucu (4 adet standoff grubu)

### [N13_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::standoffs inner map callback
- **params**: y — y koordinatı (0.4 veya -0.4)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (standoff çivisi ve kapağını temsil eden group ve mesh elementleri)

### [N14_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::vertical frame map callback
- **params**: x — x koordinatı (-0.42 veya 0.42)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (dikey çerçeve elemanını temsil eden mesh elementi)

### [N15_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::horizontal frame map callback
- **params**: y — y koordinatı (-0.42 veya 0.42)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (yatay çerçeve elemanını temsil eden mesh elementi)

### [N16_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::rings map callback
- **params**: (_, i) — halka indeksi (0-4)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (halkayı temsil eden mesh elementi)

### [N17_NASIL] AST Pointer: types/WallMountedCompactFanModel.tsx::radial wires map callback
- **params**: (angle, i) — açı (derece) ve indeks
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (radyal teli temsil eden mesh elementi)

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