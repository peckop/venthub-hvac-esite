---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\parts\Impeller.tsx
skeleton_hash: 365c72f848be0a59
entity_hashes:
  func:Impeller: ee1fdf5cf66e515f
  overview: 56c17e3e57f1edc0
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:09:28Z
---

## Genel Bakış
Bu modül, 3 boyutlu bir impeller (pompa çarkı) görselleştirmesi için kullanılan bir React bileşeni içerir. Bileşen, `type`, `diameter`, `bladeCount` ve `color` parametrelerini alarak impellerin geometrisini, boyutunu ve malzeme rengini dinamik olarak belirler. Geçerli bir 3D sahne bağlamı içinde render edilmesi gerekir; aksi durumda görünür bir çıktı üretilemez.

## Fonksiyon Grupları

### Bileşen Tanımı ve Görselleştirme
Bu grup, impellerin 3D görsel temsilini oluşturan tek bileşen fonksiyonunu içerir. Props olarak aldığı tip, çap, pala sayısı ve renk değerlerine göre impeller geometrisini hesaplayarak ekrana çizer.
- Impeller

## Bağımlılıklar ve Mimari Notlar

**Dış Bağımlılıklar:** Bileşen, bir 3D render kütüphanesine (örneğin Three.js tabanlı bir React kütüphanesi) bağlıdır; ancak bu bağımlılıklar kaynak kodda doğrudan listelenmemiştir, dolayısıyla kesin olarak bilinmemektedir.

**Dinamik/Lazy Yükleme:** Kaynakta bu yönde bir bilgi bulunmamaktadır.

**Mimari Önem:** Bu bileşen, ürün sayfalarında 3D impeller önizlemesi sunan bir sunum (presentation) bileşenidir. İş mantığı içermez; yalnızca verilen props değerlerini görsel bir 3D nesneye dönüştürür. `type` parametresi zorunludur; verilmediğinde hangi geometrik formun oluşturulacağı belirlenemez. `diameter` ve `bladeCount` değerleri sıfır veya negatif olmamalıdır; aksi durumda geometri tanımsız kalır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Impeller
**Ne yapar**: Impeller bileşeni, verilen parametrelere göre bir impeller (pompa veya fan kanadı) modelini render eden bir React bileşenidir.  
**Nasıl yapar**: Bileşen, `type`, `diameter`, `bladeCount` ve `color` props'larını alır; bu değerleri iç geometri ve stil hesaplamalarında kullanarak SVG veya Canvas üzerinden impeller görselini oluşturur. Varsayılan değerler sağlandığı için zorunlu olmayan tüm parametreler isteğe bağlıdır.  
**Parametreler**:
- type: string — Impellerin türü (örneğin 'radial', 'axial' gibi) ve render edilecek geometriyi belirler.  
- diameter: number — Impellerin çapı; birim genellikle metre veya milimetre olarak kabul edilir, varsayılan değer 1.  
- bladeCount: number — Impellerin kanat (palette) sayısı; varsayılan değer 8.  
- color: string — Impellerin rengi; CSS renk değeri alır, varsayılan değer 'aluminum'.  
**Dönüş**: React.FC<ImpellerProps> — Tip güvenli bir React fonksiyonel bileşeni döndürür; bu bileşen JSX elementi olarak kullanılabilir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three
- import: three::type { Group }

---

## INTERFACES

### ImpellerProps
- `type: 'axial' | 'radial' | 'backward_curved'`
- `diameter?: number`
- `bladeCount?: number`
- `color?: 'aluminum' | 'plastic' | 'steel'`
- `spinSpeed?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::Impeller
- **params**: `type`, `diameter` (varsayılan: 1), `bladeCount` (varsayılan: 8), `color` (varsayılan: 'aluminum'), `spinSpeed` (varsayılan: 5)
- **ic_degiskenler**:
  - `groupRef` — `useRef<Group>(null)` ile oluşturulmuş, THREE.Group referansı; useFrame içinde `rotation.z` güncellemesinde kullanılır
  - `materials` — `useResolveMaterials()` hook'undan dönen materyal koleksiyonu; alt tipler: `matteBlack`, `industrialSteel`, `brushedAluminum`, `galvanizedSteel`, `ral5010`
  - `material` — `color` prop değerine göre seçilen materyal: 'plastic' ise `materials.matteBlack`, 'steel' ise `materials.industrialSteel`, diğer durumda `materials.brushedAluminum`
  - `radius` — `diameter / 2` hesaplaması; geometri boyutlandırmalarında ve mesh pozisyonlamalarında kullanılır
  - `geometries` — `useMemo` ile memoize edilmiş `Record<string, THREE.BufferGeometry>` nesnesi; `type` ve `radius` bağımlılıklarıyla oluşturulur, `type` değerine göre farklı geometriler eklenir
- **Dönüş**: JSX element — `<group ref={groupRef}>` içinde `type` prop'una göre koşullu render edilen mesh grupları

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::useFrame callback
- **params**: `_` (kullanılmayan frame zamanı), `delta` (kareler arası geçen süre)
- **ic_degiskenler**:
  - `groupRef.current` — üst kapsamdan erişilen THREE.Group referansı; null kontrolü yapılarak `rotation.z` değeri güncellenir
  - `spinSpeed` — üst kapsamdan erişilen dönme hızı; `delta` ile çarpılarak rotasyon miktarı hesaplanır
- **Dönüş**: yok — yan etki olarak `groupRef.current.rotation.z` değerini azaltır

### [N3_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::useMemo callback (geometries)
- **params**: yok
- **ic_degiskenler**:
  - `geoms` — `Record<string, THREE.BufferGeometry>` tipinde boş sözlük; `type` koşuluna göre geometri nesneleri eklenir
  - `type` — üst kapsamdan erişilen kanatçı tipi; 'axial', 'radial' veya 'backward_curved' değerlerinden biri
  - `radius` — üst kapsamdan erişilen yarıçap değeri; geometri boyut parametrelerinde çarpan olarak kullanılır
  - `geoms.axialHubCylinder` — `type === 'axial'` durumunda oluşturulan silindir geometrisi (`radius * 0.2` taban, 0.1 yükseklik, 16 segment)
  - `geoms.axialHubSphere` — `type === 'axial'` durumunda oluşturulan küre geometrisi (`radius * 0.12` yarıçap, 16x16 segment)
  - `geoms.axialBladeBox` — `type === 'axial'` durumunda oluşturulan kutu geometrisi (`radius * 0.8` genişlik, `radius * 0.25` yükseklik, 0.02 derinlik)
  - `geoms.radialBackplate` — `type === 'radial'` durumunda oluşturulan silindir geometrisi (`radius` taban, 0.02 yükseklik, 32 segment)
  - `geoms.radialFrontTorus` — `type === 'radial'` durumunda oluşturulan torus geometrisi (`radius * 0.8` ana yarıçap, `radius * 0.2` tüp yarıçapı)
  - `geoms.radialFrontRing` — `type === 'radial'` durumunda oluşturulan halka geometrisi (`radius * 0.7` iç, `radius` dış yarıçap)
  - `geoms.radialBladeBox` — `type === 'radial'` durumunda oluşturulan kutu geometrisi (0.02 genişlik, 0.2 yükseklik, `radius * 0.25` derinlik)
  - `geoms.backwardBackplate` — `type === 'backward_curved'` durumunda oluşturulan silindir geometrisi (`radius` taban, 0.05 yükseklik, 32 segment)
  - `geoms.backwardBladeBox` — `type === 'backward_curved'` durumunda oluşturulan kutu geometrisi (`radius * 0.6` genişlik, 0.3 yükseklik, 0.05 derinlik)
- **Dönüş**: `geoms` — `Record<string, THREE.BufferGeometry>` tipinde geometri sözlüğü

### [N4_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok — yalnızca cleanup fonksiyonu döndürür
- **Dönüş**: cleanup fonksiyonu — bağımlılıklar değiştiğinde veya bileşen unmount olduğunda çağrılır

### [N5_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**:
  - `geometries` — üst kapsamdan erişilen memoize geometri sözlüğü; `Object.values()` ile değerleri alınır
  - `geom` — forEach döngüsünde her bir `THREE.BufferGeometry` nesnesi; `dispose()` metodu çağrılarak VRAM temizlenir
- **Dönüş**: yok — yan etki olarak tüm geometrilerin `dispose()` metodunu çağırır

### [N6_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::forEach callback (geom)
- **params**: `geom` — `THREE.BufferGeometry` nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `geom.dispose()` çağrısı yapar

### [N7_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::map callback (axial blades)
- **params**: `_` (kullanılmayan dizi elemanı), `i` (dizi indeksi)
- **ic_degiskenler**:
  - `bladeCount` — üst kapsamdan erişilen kanat sayısı; rotasyon açısı hesaplamasında `(i * Math.PI * 2) / bladeCount` olarak kullanılır
  - `radius` — üst kapsamdan erişilen yarıçap; kanat pozisyonu `radius * 0.6` olarak hesaplanır
  - `material` — üst kapsamdan erişilen seçilmiş materyal; mesh'in `material` prop'una atanır
  - `geometries.axialBladeBox` — üst kapsamdan erişilen kutu geometrisi; mesh'in `geometry` prop'una atanır
- **Dönüş**: JSX element — `<group>` içinde `rotation` ve `<mesh>` ile kanat render eder

### [N8_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::map callback (radial blades)
- **params**: `_` (kullanılmayan dizi elemanı), `i` (dizi indeksi)
- **ic_degiskenler**:
  - `bladeCount` — üst kapsamdan erişilen kanat sayısı; toplam eleman sayısı `bladeCount * 2`, rotasyon açısı `(i * Math.PI * 2) / (bladeCount * 2)` olarak hesaplanır
  - `radius` — üst kapsamdan erişilen yarıçap; kanat pozisyonu `radius * 0.85` olarak hesaplanır
  - `material` — üst kapsamdan erişilen seçilmiş materyal; mesh'in `material` prop'una atanır
  - `geometries.radialBladeBox` — üst kapsamdan erişilen kutu geometrisi; mesh'in `geometry` prop'una atanır
- **Dönüş**: JSX element — `<group>` içinde `rotation` ve `<mesh>` ile kanatçık render eder

### [N9_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::map callback (backward_curved blades)
- **params**: `_` (kullanılmayan dizi elemanı), `i` (dizi indeksi)
- **ic_degiskenler**:
  - `radius` — üst kapsamdan erişilen yarıçap; kanat pozisyonu `radius * 0.6` olarak hesaplanır
  - `materials.industrialSteel` — üst kapsamdan erişilen çelik materyal; mesh'in `material` prop'una atanır
  - `geometries.backwardBladeBox` — üst kapsamdan erişilen kutu geometrisi; mesh'in `geometry` prop'una atanır
- **Dönüş**: JSX element — `<group>` içinde `rotation` ve `<mesh>` ile kavisli kanat render eder; sabit 7 kanat kullanılır

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Impeller.tsx
  function: src\components\products\3d\parts\Impeller.tsx::Impeller

---

## DISA AKTARILANLAR (EXPORTS)
  export: Impeller

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