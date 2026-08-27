---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\types\NicotraFanModel.tsx
skeleton_hash: 5ee9180432bca418
entity_hashes:
  func:NicotraFanModel: 2bdd08e329a67558
  overview: a978abdd718e5dd3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:27:00Z
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

### [N2_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::useFrame callback
- **params**: `state`, `delta`
- **ic_degiskenler**:
  - `fanRef.current` — üst kapsamdan erişilen `Group` referansı; `null` kontrolü yapıldıktan sonra `rotation.x` özelliği `delta * 15` kadar azaltılır (X ekseninde sürekli dönüş animasyonu)
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::sideShape useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — `new Shape()` ile oluşturulan nesne; logaritmik spiral profil noktaları ve atış ağzı çizgileri eklenir
  - `segments` — `48` sabit değeri; spiral profil için döngü segment sayısı
  - `i` — `for` döngü sayacı; `0`'dan `segments`'e kadar iterasyon
  - `th` — `(i / segments) * Math.PI * 2.2` formülüyle hesaplanan açı (radyan); spiral profil için polar koordinat açısı
  - `r` — `0.3 + (th / (Math.PI * 2)) * 0.4` formülüyle hesaplanan yarıçap; logaritmik spiral mesafesi
  - `x` — `Math.cos(th) * r` hesaplaması; profil noktasının X koordinatı
  - `y` — `Math.sin(th) * r` hesaplaması; profil noktasının Y koordinatı
  - `hole` — `new Path()` ile oluşturulan nesne; `hole.absarc(0, 0, 0.28, 0, Math.PI * 2, true)` ile dairesel delik tanımlanır ve `shape.holes` dizisine eklenir
- **Dönüş**: `Shape` — logaritmik spiral profilli, dairesel delikli ve atış ağzı çizgili şekil nesnesi

---

### [N4_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::useEffect cleanup factory
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu — `baseFrameGeometry.dispose()`, `vibrationMountGeometry.dispose()`, `sideShapeGeometry.dispose()`, `scrollWrapperGeometry.dispose()`, `dischargeGeometry.dispose()`, `wheelGeometry.dispose()`, `bladeGeometry.dispose()`, `motorGeometry.dispose()` çağrılır

---

### [N5_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::useEffect inner cleanup
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok — sekiz geometri nesnesinin `dispose()` metodu çağrılarak bellek temizliği yapılır

---

### [N6_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::vibration mount outer map
- **params**: `x`
- **ic_degiskenler**: yok
- **Dönüş**: JSX array — `[0.4, -0.4].map(z => ...)` ile iki titreşim takozu mesh'i döndürülür

---

### [N7_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::vibration mount inner map
- **params**: `z`
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `<mesh key={...} position={[x, -0.05, z]} geometry={vibrationMountGeometry} material={materials.matteBlack} />` elementi; üst kapsamdan `x` ve `vibrationMountGeometry` kullanılır

---

### [N8_NASIL] AST Pointer: src/components/products/3d/types/NicotraFanModel.tsx::blade map
- **params**: `_`, `i`
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `<mesh key={i} rotation={[0, (i / 24) * Math.PI * 2, 0]} position={[0.36, 0, 0]} geometry={bladeGeometry} material={materials.galvanizedSteel} />` elementi; `i` indeksine göre 24 kanat eşit açılarla yerleştirilir

---

## NODE ID STANDARD

  file: NicotraFanModel.tsx
  function: NicotraFanModel.tsx::NicotraFanModel

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