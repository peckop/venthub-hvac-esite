---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\DomesticFanModel.tsx
skeleton_hash: a82921aef29d25c2
entity_hashes:
  func:DomesticFanModel: c93fddd365c3092d
  overview: 65a1eab25cd13393
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:14:28Z
---

## Genel Bakış

Bu modül, ev tipi vantilatörün 3D modelini temsil eden bir React bileşeni içerir. `src/components/products/3d/types` dizininde yer alır ve ürünün 3D görselleştirme katmanında tip bazlı ayrıştırmanın bir parçasıdır.

## Fonksiyon Grupları

### 3D Ürün Bileşeni

Ev tipi vantilatör modelinin görsel sunumundan sorumludur. Modül, tek bir fonksiyonel bileşen olarak tanımlanmıştır.

- DomesticFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `DomesticFanModel` fonksiyonunun gövdesi verilmemiştir; yalnızca imzası (`() -> React.FC`) mevcuttur. Fonksiyon gövdesi olmadan bu bileşenin doğru çalışması için hangi koşulların var olması gerektiğini belirlemek mümkün değildir. İmzadan çıkarılabilecek bilgiler (parametre almıyor, bir React bileşeni döndürüyor) genel React varsayımlarıdır, bu modüle özgü değildir.

---

## FONKSİYON DETAYLARI

### DomesticFanModel
**Ne yapar**: Ev tipi fanın 3D modelini temsil eden bir React fonksiyonel bileşeni döndüren bir üst düzey fonksiyondur. Bileşen adı ve dosya yolu (`src\components\products\3d\types\DomesticFanModel.tsx`) bu fonksiyonun 3D ürün modelleme katmanında ev tipi fan modelini tanımlamak için kullanıldığını göstermektedir.

**Nasıl yapar**: Fonksiyon çağrıldığında bir `React.FC` (React Functional Component) döndürmektedir. Docstring boş olduğundan, iç mantığı hakkında doğrudan bilgi bulunmamaktadır. Fonksiyonun gövdesinde hangi 3D geometri, materyal veya animasyon mantığının uygulandığı bilinmiyor.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almamaktadır (boş parantez ile tanımlıdır).

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipi. Döndürülen bileşen, ev tipi fanın 3D görselleştirmesini render etmek için kullanılmaktadır. Bileşenin kendisinin kabul ettiği props'lar hakkında verilen kaynakta bilgi bulunmamaktadır.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::BoxGeometry
- import: three::CylinderGeometry
- import: three::InstancedMesh
- import: three::Object3D
- import: three::PlaneGeometry
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/DomesticFanModel.tsx::DomesticFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen materyal koleksiyonu; JSX içinde `materials.brushedAluminum`, `materials.matteBlack`, `materials.industrialSteel`, `materials.ral7035`, `materials.zincGray` olarak erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulmuş Three.js Group referansı; JSX'teki ana `<group>` elementine `ref` olarak bağlanır
  - `gridRef` — `useRef<InstancedMesh>(null)` ile oluşturulmuş InstancedMesh referansı; JSX'teki `<instancedMesh>` elementine `ref` olarak bağlanır
  - `panelSize` — sabit değer `1.0`; ön panel boyutu olarak kullanılır, diğer geometrilerin boyutlarını da orantılar
  - `panelThickness` — sabit değer `0.08`; ön panel kalınlığı, `panel` geometrisinin Z eksenindeki derinliği ve grup pozisyonlamasında kullanılır
  - `panel` — `useMemo(() => new BoxGeometry(panelSize, panelSize, panelThickness), [panelSize, panelThickness])` ile oluşturulmuş kutu geometrisi; ön panel çerçevesi mesh'inde `geometry` prop'u olarak kullanılır
  - `background` — `useMemo(() => new PlaneGeometry(panelSize * 0.85, panelSize * 0.85), [panelSize])` ile oluşturulmuş düzlem geometrisi; ızgara arkaplanı mesh'inde `geometry` prop'u olarak kullanılır
  - `gridBoxGeo` — `useMemo(() => new BoxGeometry(panelSize * 0.05, panelSize * 0.05, 0.005), [panelSize])` ile oluşturulmuş küçük kutu geometrisi; ızgara deliklerini temsil eden `instancedMesh`'in `args` dizisinin ilk elemanı olarak kullanılır
  - `cylinder` — `useMemo(() => new CylinderGeometry(0.35, 0.35, 0.4, 32), [])` ile oluşturulmuş silindir geometrisi; arka gövde mesh'inde `geometry` prop'u olarak kullanılır
  - `plane` — `useMemo(() => new PlaneGeometry(0.15, 0.05), [])` ile oluşturulmuş düzlem geometrisi; markalama mesh'inde `geometry` prop'u olarak kullanılır
  - `tempObject3D` — `useMemo(() => new Object3D(), [])` ile oluşturulmuş geçici Object3D; useEffect içinde instancedMesh matrislerini ayarlamak için konum ve matris aracı olarak kullanılır
- **Dönüş**: JSX — `<group>` elementi döndürür (scale `[0.25, 0.25, 0.25]`); içinde dört alt mesh grubu barındırır: ön panel çerçevesi, ızgara alanı (arkaplan + instancedMesh), arka gövde silindiri, markalama düzlemi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DomesticFanModel.tsx
  function: src\components\products\3d\types\DomesticFanModel.tsx::DomesticFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DomesticFanModel

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