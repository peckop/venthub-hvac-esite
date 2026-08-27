---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\3d\types\PlugFanModel.tsx
skeleton_hash: 5cf8fe96bb2bf840
entity_hashes:
  func:PlugFanModel: b85fe612276b43fc
  overview: 84b4f359828824c7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-25T07:27:02Z
---

## Genel Bakış
PlugFanModel, 3D ürün bileşenleri arasında yer alan bir React bileşenidir. Modül, fiş tipi fan modelinin görsel temsilini sağlayan tek bir bileşen fonksiyonu içerir.

## Fonksiyon Grupları

### Bileşen
Fiş tipi fan modelinin 3D görünümünü oluşturan ana bileşendir.
- PlugFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, gövdeden türetilebilecek aksiyom bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### PlugFanModel
**Ne yapar**: Bu fonksiyon hakkında verilen kaynakta tanımlayıcı bir docstring bulunmamaktadır. Fonksiyonun adı `PlugFanModel` olup, bir React fonksiyonel bileşeni (`React.FC`) döndüren bir üst seviye fonksiyondur. Dosya yolu `src/components/products/3d/types/PlugFanModel.tsx` olarak belirtilmiştir; bu konum, fonksiyonun 3 boyutlu ürün modelleriyle ilgili bir bileşen katmanında yer aldığını gösterir.

**Nasıl yapar**: Kaynakta iç mantığına dair herhangi bir açıklama (docstring) verilmemiştir. Fonksiyon, parametre almadan çağrılır ve bir `React.FC` (React Fonksiyonel Bileşen) döndürür. Bu, fonksiyonun bir bileşen fabrikası (component factory) ya da yüksek dereceli bileşen (higher-order component) örüntüsüyle çalışabileceğini ima eder; ancak kaynakta bu davranış doğrulanmamıştır.

**Parametreler**:
- Fonksiyon tanımlanışında herhangi bir parametre belirtilmemiştir (boş parantez `()`).

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipi. Fonksiyon, çağrıldığında bir React bileşeni döndürmektedir.

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
- import: three::Group

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; JSX içinde `materials.galvanizedSteel`, `materials.industrialSteel`, `materials.safetyOrange`, `materials.ral7035`, `materials.matteBlack` olarak erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan ref; fan pervanesi grubuna atanır, `useFrame` callback'inde `fanRef.current.rotation.z` üzerinden döndürülür
  - `inletConeGeo` — `useMemo(() => new CylinderGeometry(0.38, 0.30, 0.15, 32, 1, true), [])` ile oluşturulan emiş hunisi geometrisi; inlet cone mesh'inde `geometry` prop'u olarak kullanılır
  - `flangeGeo` — `useMemo(() => new CylinderGeometry(0.40, 0.40, 0.02, 32), [])` ile oluşturulan flanş geometrisi; giriş flanşı ve arka disk mesh'lerinde `geometry` prop'u olarak kullanılır
  - `shroudGeo` — `useMemo(() => new CylinderGeometry(0.4, 0.25, 0.05, 32, 1, true), [])` ile oluşturulan ön halka geometrisi; front shroud mesh'inde `geometry` prop'u olarak kullanılır
  - `bladeGeo` — `useMemo(() => new BoxGeometry(0.015, 0.3, 0.25), [])` ile oluşturulan kanat geometrisi; 7 adet pervane kanadı mesh'inde `geometry` prop'u olarak kullanılır
  - `motorBodyGeo` — `useMemo(() => new CylinderGeometry(0.18, 0.18, 0.35, 32), [])` ile oluşturulan motor gövdesi geometrisi; motor gövdesi mesh'inde `geometry` prop'u olarak kullanılır
  - `finGeo` — `useMemo(() => new BoxGeometry(0.04, 0.35, 0.02), [])` ile oluşturulan soğutma kanatçığı geometrisi; 12 adet motor soğutma kanatçığı mesh'inde `geometry` prop'u olarak kullanılır
  - `klemensGeo` — `useMemo(() => new BoxGeometry(0.1, 0.1, 0.05), [])` ile oluşturulan klemens kutusu geometrisi; klemens kutusu mesh'inde `geometry` prop'u olarak kullanılır
  - `baseGeo` — `useMemo(() => new BoxGeometry(0.6, 0.05, 0.6), [])` ile oluşturulan taban kaidesi geometrisi; base frame mesh'inde `geometry` prop'u olarak kullanılır
  - `supportGeo` — `useMemo(() => new BoxGeometry(0.2, 0.4, 0.02), [])` ile oluşturulan motor destek ayağı geometrisi; destek ayağı mesh'inde `geometry` prop'u olarak kullanılır
- **Dönüş**: JSX — `<group scale={[0.7, 0.7, 0.7]} rotation={[0, Math.PI / 4, 0]}>` ile başlayan, emiş hunisi, pervane grubu, motor grubu ve taban kaidesi içeren 3D plug fan modeli

---

### [N2_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel::useFrame_callback
- **params**: `state`, `delta`
- **ic_degiskenler**:
  - `fanRef.current` — dış kapsamdan erişilen ref nesnesi; varsa `fanRef.current.rotation.z` değerini `6 * delta` kadar azaltarak fanı sürekli döndürür
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel::useEffect_cleanup_factory
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `inletConeGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `flangeGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `shroudGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `bladeGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `motorBodyGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `finGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `klemensGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `baseGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
  - `supportGeo` — dış kapsamdan erişilen geometri; cleanup'ta `.dispose()` çağrılır
- **Dönüş**: cleanup fonksiyonu — bileşen unmount olduğunda tüm memoize edilmiş geometrileri VRAM'den temizler

---

### [N4_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel::useEffect_cleanup_inner
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `inletConeGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `flangeGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `shroudGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `bladeGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `motorBodyGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `finGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `klemensGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `baseGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
  - `supportGeo` — dış kapsamdan erişilen geometri; `.dispose()` ile serbest bırakılır
- **Dönüş**: yok

---

### [N5_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel::blade_map_callback
- **params**: `_`, `i`
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı (fill(0) kaynaklı)
  - `i` — dizi indeksi; `(i / 7) * Math.PI * 2` formülüyle her kanat için Z ekseni etrafında eşit açısal dağılım hesaplanır
  - `bladeGeo` — dış kapsamdan erişilen BoxGeometry; kanat mesh'inin `geometry` prop'u olarak kullanılır
  - `materials.safetyOrange` — dış kapsamdan erişilen malzeme; kanat mesh'inin `material` prop'u olarak kullanılır
- **Dönüş**: JSX — `<group>` içinde döndürülmüş `<mesh>` döndürür; 7 adet geriye eğimli pervane kanadı oluşturur

---

### [N6_NASIL] AST Pointer: src/components/products/3d/types/PlugFanModel.tsx::PlugFanModel::fin_map_callback
- **params**: `_`, `i`
- **ic_degiskenler**:
  - `_` — kullanılmayan dizi elemanı (fill(0) kaynaklı)
  - `i` — dizi indeksi; `(i / 12) * Math.PI * 2` formülüyle her kanatçık için Y ekseni etrafında eşit açısal dağılım hesaplanır
  - `finGeo` — dış kapsamdan erişilen BoxGeometry; soğutma kanatçığı mesh'inin `geometry` prop'u olarak kullanılır
  - `materials.industrialSteel` — dış kapsamdan erişilen malzeme; soğutma kanatçığı mesh'inin `material` prop'u olarak kullanılır
- **Dönüş**: JSX — motor gövdesi etrafına dağıtılmış 12 adet soğutma kanatçığı `<mesh>` döndürür

---

## NODE ID STANDARD

  file: PlugFanModel.tsx
  function: PlugFanModel.tsx::PlugFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: PlugFanModel

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