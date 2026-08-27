---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\JetFanModel.tsx
skeleton_hash: b4ee918076d4726a
entity_hashes:
  func:FlexibleCable: 7422952d69466487
  func:JetFanModel: b12c8fa3c1846be6
  overview: 492d48d9f7958885
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:43:23Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformundaki jet fan tipi ekipmanın React tabanlı 3D modelini ve bu modelin içinde yer alan yardımcı alt bileşenlerini tanımlar. Modülün temel amacı, ilgili ürünün sahnede gerçekçi ve etkileşimli bir şekilde görselleştirilmesini sağlamaktır.

## Fonksiyon Grupları
### Ana 3B Model Bileşeni
Modülün dışarıya açılan temel bileşeni; jet fanın ana 3B geometrisini, görünümünü ve sahne entegrasyonunu tanımlar.
- JetFanModel

### Yardımcı Alt Bileşenler
Ana modelin yapısı içinde yer alan, belirli bir parça veya özellik için kullanıma özel, yeniden kullanılabilir görsel bileşenleri içerir. `FlexibleCable` bileşeni zorunlu olarak `materials` parametresi alır ve bu parametre `FanMaterials` tipinde olmalıdır; parametre verilmezse bileşen düzgün render edilemez.
- FlexibleCable

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan çıkarılabilen varsayımlar listelenmiştir.

[Aksiyom 1]: Eğer `FanMaterials` tipi tanımlı değilse, `FlexibleCable` bileşeni derleme aşamasında hata verir; çünkü `materials` prop'u bu tipe bağlıdır.

[Aksiyom 2]: Eğer `FlexibleCable` bileşenine `materials` prop'u sağlanmazsa, bileşen eksik veriyle render edilir; prop zorunlu olarak tanımlanmıştır (varsayılan değer yoktur).

[Aksiyom 3]: Eğer `JetFanModel` bileşeni bir React ortamında kullanılmıyorsa (örneğin Three.js sahne bağlamı yoksa), bileşen düzgün çalışmaz; çünkü 3B model görselleştirme React tabanlı bir 3B kütüphane altyapısına bağlıdır.

---

## FONKSİYON DETAYLARI

### JetFanModel
**Ne yapar**: VentHub HVAC projesinin ürünler bölümündeki 3B görselleştirme katmanında kullanılmak üzere jet fan tipi HVAC ekipmanlarının 3 boyutlu React bileşenini tanımlar. Söz konusu jet fanların kullanıcı arayüzünde 3B sahada gösterilmesini sağlayan temel işlevsel bileşendir.
**Nasıl yapar**: React fonksiyonel bileşeni standardında tanımlanır, proje içindeki tiplendirme kurallarına uygun olarak jet fan 3B modelinin tüm yapılandırma, konumlandırma ve temel etkileşim mantığını barındırır. Kaynak kodunun bulunduğu JetFanModel.tsx tip tanım dosyasında proje genelinde kullanılan tiplerle uyumlu çalışacak şekilde yapılandırılır.
**Parametreler**: Bu fonksiyona ait tanımlanmış herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: React.FC tipi döndürür, yani React ekosistemi tarafından işlenip kullanılabilecek bir React fonksiyonel bileşeni döndürür. Bu bileşen 3B sahaya yerleştirilerek kullanıcıya gösterilebilir.

### FlexibleCable
**Ne yapar**: Jet fan modellerine bağlı esnek bağlantı kablolarının 3B görselleştirmesini oluşturan yardımcı React bileşenidir. Jet fanların elektrik veya mekanik bağlantılarını temsil eden kabloların 3B sahada doğru şekilde gösterilmesini sağlar.
**Nasıl yapar**: Kendisine iletilen malzeme verilerine göre kablonun 3B modelindeki görünüm, renk, doku ve diğer görsel özelliklerini yapılandırır. Kablonun bağlı olduğu iki bağlantı noktası arasında otomatik olarak konumlanmasını sağlayarak 3B sahadaki bütünlüğü korur.
**Parametreler**:
- name: materials, type: FanMaterials — 3B kablo modelinde kullanılacak tüm malzeme özelliklerini içeren FanMaterials tipinde nesnedir. Kablonun renk, doku, şeffaflık gibi görsel ayarlarını belirlemek için kullanılır.
**Dönüş**: Tanımda açık bir dönüş tipi belirtilmemiştir, React bileşeni standartlarına uygun olarak JSX formatında 3B sahada işlenecek görsel öğeleri döndürmesi beklenir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: ../materials/useFanMaterials::type FanMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: JetFanModel.tsx::JetFanModel
- **params**: yok
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.jetOrange`, `materials.greyBox`, `materials.matteBlack`, `materials.cableGrey`, `materials.brushedAluminum` alanlarına erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan Three.js Group referansı; `useFrame` içinde `fanRef.current.rotation.y` güncellenerek pervane animasyonu sağlanır
  - `geometries` — `useMemo` ile oluşturulan geometri nesneleri objesi; `cylinder032`, `cylinder034`, `cylinder028`, `cylinderPin`, `cylinderRakor`, `cylinderBolt`, `cylinderRotor`, `torus032`, `torusRings`, `innerBladeGeos`, `boxMazgal`, `boxGrey`, `boxMountVert`, `boxMountHoriz`, `boxRotorBlade` anahtarlarını içerir
- **Dönüş**: JSX (React.FC)

### [N2_NASIL] AST Pointer: JetFanModel.tsx::useFrame callback
- **params**: `state`, `delta`
- **ic_degiskenler**: yok
- **Dönüş**: yok; yan etki olarak `fanRef.current.rotation.y` değerini `delta * 25` kadar azaltır

### [N3_NASIL] AST Pointer: JetFanModel.tsx::useMemo callback (geometries)
- **params**: yok
- **ic_degiskenler**:
  - `cylinder032` — `CylinderGeometry(0.32, 0.32, 0.8, 64, 1, true)`; açık uçlu büyük çaplı silindir geometrisi
  - `cylinder034` — `CylinderGeometry(0.34, 0.34, 0.03, 64)`; flanş geometrisi
  - `cylinder028` — `CylinderGeometry(0.28, 0.28, 0.5, 64, 1, true)`; açık uçlu küçük çaplı silindir geometrisi
  - `cylinderPin` — `CylinderGeometry(0.006, 0.006, 0.012, 8)`; pin geometrisi
  - `cylinderRakor` — `CylinderGeometry(0.02, 0.025, 0.06, 16)`; kablo giriş rakoru geometrisi
  - `cylinderBolt` — `CylinderGeometry(0.008, 0.008, 0.015, 8)`; cıvata geometrisi
  - `cylinderRotor` — `CylinderGeometry(0.12, 0.12, 0.1, 32)`; rotor gövde geometrisi
  - `torus032` — `TorusGeometry(0.32, 0.006, 8, 64)`; silindir uç kenar yuvarlatma geometrisi
  - `torusRings` — `[0.12, 0.2, 0.28]` yarıçaplarıyla oluşturulmuş `TorusGeometry` dizisi; mazgal ızgara halkaları
  - `innerBladeGeos` — `[0, -0.12, -0.22]` xVal değerleriyle hesaplanmış `BoxGeometry` dizisi; iç kanat geometrileri
  - `boxMazgal` — `BoxGeometry(0.64, 0.01, 0.006)`; mazgal ızgara çubuğu geometrisi
  - `boxGrey` — `BoxGeometry(0.16, 0.14, 0.10)`; gri elektrik kutusu geometrisi
  - `boxMountVert` — `BoxGeometry(0.08, 0.12, 0.015)`; dikey montaj ayağı geometrisi
  - `boxMountHoriz` — `BoxGeometry(0.08, 0.015, 0.08)`; yatay montaj ayağı geometrisi
  - `boxRotorBlade` — `BoxGeometry(0.20, 0.012, 0.06)`; rotor kanat geometrisi
- **Dönüş**: geometri nesneleri objesi

### [N4_NASIL] AST Pointer: JetFanModel.tsx::innerBladeGeos map callback
- **params**: `xVal`
- **ic_degiskenler**:
  - `r` — 0.31 sabit değeri; iç kanat yarıçapı
  - `w` — `2 * Math.sqrt(Math.max(0, r * r - xVal * xVal))` formülüyle hesaplanan kanat genişliği
- **Dönüş**: BoxGeometry

### [N5_NASIL] AST Pointer: JetFanModel.tsx::useEffect cleanup (geometries)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu; `geometries` objesindeki tüm geometrilerin `.dispose()` metodunu çağırır

### [N6_NASIL] AST Pointer: JetFanModel.tsx::FlexibleCable
- **params**: `{ materials }` — `FanMaterials` tipinde; `materials.cableGrey` alanına erişilir
- **ic_degiskenler**:
  - `path` — `useMemo` ile oluşturulan `CatmullRomCurve3` eğrisi; `[new Vector3(0, 0, 0), new Vector3(0, 0.04, 0.05), new Vector3(0, 0.06, 0.12), new Vector3(0, 0.06, 0.175)]` noktalarıyla tanımlı kablo yolu
  - `tubeGeo` — `useMemo` ile oluşturulan `TubeGeometry`; `path` eğrisi, 20 segment, 0.012 tüp yarıçapı, 8 radial segment, kapalı değil
- **Dönüş**: JSX (mesh); `materials.cableGrey` malzemesi ve `tubeGeo` geometrisiyle render edilen kablo mesh'i

### [N7_NASIL] AST Pointer: JetFanModel.tsx::FlexibleCable useEffect cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu; `tubeGeo.dispose()` çağrısı yapar

---

## NODE ID STANDARD

  file: src\components\products\3d\types\JetFanModel.tsx
  function: src\components\products\3d\types\JetFanModel.tsx::JetFanModel
  function: src\components\products\3d\types\JetFanModel.tsx::FlexibleCable

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleCable
  export: JetFanModel

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