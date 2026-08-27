---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\NicotraFanModel.tsx
skeleton_hash: a7e500890d07ccb7
entity_hashes:
  func:NicotraFanModel: 2bdd08e329a67558
  overview: a978abdd718e5dd3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:20:16Z
---

## Genel Bakış
Bu modül, Nicotra marka fanların 3D görselleştirmesini sağlayan bir React fonksiyonel bileşenini tanımlar. Ürün kataloğu içindeki 3D ürün tipleri altında konumlanan bu bileşen, fan modelinin üç boyutlu olarak görüntülenmesinden sorumludur.

## Fonksiyon Grupları
### 3D Model Bileşeni
Nicotra fan modelinin 3D sahne içinde render edilmesini üstlenen ana bileşendir. Ürün tipi olarak diğer fan modelleriyle aynı klasör yapısında yer alır ve modüler bir yapı sunar.
- NicotraFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi sağlanmadığından, modülün iç mantığından herhangi bir varsayım çıkarılamamaktadır. Yalnızca imza bilgisi (`NicotraFanModel() -> React.FC`) mevcut olup, bu imzadan modüle özgü bir davranış kuralı üretilememektedir.

---

## FONKSİYON DETAYLARI

### NicotraFanModel
**Ne yapar**: Nicotra markasına ait bir fan modelini temsil eden bir React fonksiyon bileşeni döndüren üst düzey bir fonksiyondur. Dosya konumu (`src/components/products/3d/types`) göz önüne alındığında, bu fonksiyon 3D ürün tipleri arasında Nicotra fan modelinin tanımını sağlar.

**Nasıl yapar**: Fonksiyonun iç mantığı verilen kaynakta belirtilmemiştir. `React.FC` tipinde bir bileşen döndürdüğü bilinmektedir. Docstring boş bırakılmıştır; bu nedenle fonksiyonun nasıl bir uygulama mantığı izlediğine dair kaynakta bilgi bulunmamaktadır.

**Parametreler**:
- Fonksiyonun herhangi bir parametre alıp almadığı verilen kaynakta belirtilmemiştir.

**Dönüş**: `React.FC` — React fonksiyon bileşeni (Function Component) tipinde bir değer döndürür. Bu, JSX elementi render edebilen bir bileşen anlamına gelir.

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
- import: three::Path
- import: three::Shape
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::NicotraFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; JSX içinde `materials.galvanizedSteel`, `materials.matteBlack`, `materials.industrialSteel`, `materials.ral5010` olarak erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulmuş Three.js Group referansı; `useFrame` callback'inde `fanRef.current.rotation.x` güncellenerek rotor animasyonu sağlanır
  - `sideShape` — `useMemo` ile oluşturulan `Shape` nesnesi; logaritmik spiral profil ve dairesel delik içerir, `sideShapeGeometry` hesaplamasında kullanılır
  - `baseFrameGeometry` — `useMemo` ile oluşturulan `BoxGeometry(1.0, 0.05, 1.0)`; X-şasi (taban çerçevesi) mesh'inde kullanılır
  - `vibrationMountGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.1, 0.05, 0.1)`; titreşim takozları mesh'lerinde kullanılır
  - `sideShapeGeometry` — `useMemo` ile oluşturulan `ExtrudeGeometry(sideShape, { depth: 0.02, bevelEnabled: false })`; yan saclar mesh'lerinde kullanılır
  - `scrollWrapperGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.6, 0.6, 0.6, 32, 1, true, 0, 4.5)`; sırt sacı (wrapper) mesh'inde kullanılır
  - `dischargeGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.5, 0.02, 0.64)`; atış ağzı mesh'inde kullanılır
  - `wheelGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.38, 0.38, 0.58, 32, 1, true)`; sık kanatlı çark mesh'inde kullanılır
  - `bladeGeometry` — `useMemo` ile oluşturulan `BoxGeometry(0.02, 0.58, 0.1)`; 24 adet kanat mesh'inde kullanılır
  - `motorGeometry` — `useMemo` ile oluşturulan `CylinderGeometry(0.18, 0.18, 0.3, 32)`; motor mesh'inde kullanılır
- **Dönüş**: JSX — `<group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>` ile başlayan, X-şasi, salyangoz gövde, rotor ve motor alt gruplarını içeren React elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\NicotraFanModel.tsx
  function: src\components\products\3d\types\NicotraFanModel.tsx::NicotraFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: NicotraFanModel

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