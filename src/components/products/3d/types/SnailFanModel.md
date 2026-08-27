---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\SnailFanModel.tsx
skeleton_hash: 2f6930ab92e4f727
entity_hashes:
  func:Bolt: 381f5e19a767419a
  func:SnailFanModel: 43312a20c26f093f
  overview: 72ddfa5a87eeec1f
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:44:37Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürün görselleştirme altyapısında salyangoz tipi santrifüj fanların üç boyutlu modellerini tarayıcı ortamında render etmekle yükümlüdür. React ekosistemi içinde çalışarak ürün sayfalarında gerçekçi ve etkileşimli fan görünümleri sunmayı amaçlayan tek amaçlı bir bileşen paketidir. Modül, ana fan modelinin yanı sıra modelin cıvata gibi alt parçalarını da ayrı bileşenler olarak tanımlar.

## Fonksiyon Grupları

### Ana 3D Model Bileşeni
Salyangoz fanın bütünsel üç boyutlu modelini oluşturup kullanıcıya sunan ana bileşendir. Fanın genel yapısını, alt bileşenlerini bir araya getirerek sahneye yerleştirir ve ürün sayfasında görüntülenmesini sağlar.
- SnailFanModel

### Yardımcı Alt Bileşen
Fan modelinin cıvata (bolt) gibi fiziksel parçalarını temsil eden yardımcı bileşendir. Üst bileşen tarafından sağlanan geometri ve materyal bilgilerini kullanarak cıvata görselini oluşturur.
- Bolt

## Fonksiyonlar Arası İlişkiler
- `SnailFanModel`, fan modelini oluştururken `Bolt` bileşenini birden fazla kez çağırarak cıvata parçalarını modele yerleştirir.
- `Bolt`, dışarıdan aldığı `position`, `cylinderGeo`, `sphereGeo` ve `boltChromeMaterial` parametreleriyle konumlandırılır ve görselleştirilir; bu parametreler `SnailFanModel` tarafından sağlanır.

## Bağımlılıklar
- **Dış bağımlılıklar**: React, 3D render kütüphanesi (Three.js tabanlı altyapı)
- **İç bağımlılıklar**: `Bolt` bileşeni `SnailFanModel` tarafından tüketilir; modülün kendisi ürün sayfası/bileşeni tarafından çağrılır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Bolt
**Ne yapar**: 3D sahne içinde bir cıvata (bolt) bileşeni oluşturan bir React fonksiyonel bileşenidir. Verilen geometriler ve malzeme kullanılarak cıvatanın görsel temsilini render eder.

**Nasıl yapar**: Fonksiyon, aldığı `position`, `cylinderGeo`, `sphereGeo` ve `boltChromeMaterial` parametrelerini kullanarak bir cıvata modeli oluşturur. `cylinderGeo` ve `sphereGeo` geometrileri, cıvatanın silindirik gövdesi ve küresel başı gibi kısımlarını temsil etmek üzere kullanılır. `boltChromeMaterial` ise cıvatanın krom görünümünü sağlayan malzeme olarak atanır. Fonksiyon, `BoltProps` tipinde props alarak `React.FC<BoltProps>` tipinde bir bileşen döndürür.

**Parametreler**:
- position: Bilinmiyor — cıvatanın 3D uzaydaki konumunu belirten değer. Tip bilgisi verilmemiştir.
- cylinderGeo: Bilinmiyor — cıvatanın silindirik kısımları için kullanılacak Three.js geometri nesnesi. Tip bilgisi verilmemiştir.
- sphereGeo: Bilinmiyor — cıvatanın küresel kısımları için kullanılacak Three.js geometri nesnesi. Tip bilgisi verilmemiştir.
- boltChromeMaterial: Bilinmiyor — cıvatanın krom malzeme görünümünü sağlayan Three.js malzeme nesnesi. Tip bilgisi verilmemiştir.

**Dönüş**: `React.FC<BoltProps>` — BoltProps tipinde props alan bir React fonksiyonel bileşeni döndürür. BoltProps interface'inin içeriği verilen kaynakta belirtilmemiştir.

### SnailFanModel
**Ne yapar**: VentHub HVAC projesinde kullanılan standart santrifüj (salyangoz) fan tipinin 3B modelini render eden React fonksiyonel bileşenini tanımlar ve döndürür. Ürün sayfalarında ilgili HVAC ekipmanının üç boyutlu olarak kullanıcılara sunulmasını sağlayan özel bileşen ailesinin bir parçasıdır, yalnızca salyangoz fan modelinin görselleştirilmesi için özel olarak geliştirilmiştir.
**Nasıl yapar**: Projenin 3B ürün bileşenleri kategorisinde yer alan bu fonksiyon, React bileşen standartlarına uygun olarak yapılandırılmıştır. Proje içinde kullanılan 3B modelleme kütüphaneleri ile entegre çalışacak şekilde tasarlanmış, temel olarak salyangoz fanın geometrisini, dokularını ve gerekli etkileşim özelliklerini yükleyerek hedef alanda görüntüleme sorumluluğunu üstlenir.
**Parametreler**:
- Bu fonksiyona herhangi bir giriş parametresi aktarılmaz
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, uygulama içindeki ilgili yerlerde çağrıldığında 3B salyangoz fan modelini hedef DOM alanına render eder, tüm React bileşeni yaşam döngüsü kurallarına uyumlu olarak çalışır.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: three

---

## INTERFACES

### BoltProps
- `position: [number, number, number]`
- `cylinderGeo: THREE.CylinderGeometry`
- `sphereGeo: THREE.SphereGeometry`
- `boltChromeMaterial: THREE.Material`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/SnailFanModel.tsx::Bolt
- **params**: `position`, `cylinderGeo`, `sphereGeo`, `boltChromeMaterial`
- **ic_degiskenler**:
  - `position` — grubun 3D uzaydaki konumunu belirleyen dizi; doğrudan `<group>` elementinin `position` prop'una atanır
  - `cylinderGeo` — silindir geometrisi; ilk `<mesh>` elementinin `geometry` prop'una atanır
  - `sphereGeo` — küre geometrisi; ikinci `<mesh>` elementinin `geometry` prop'una atanır
  - `boltChromeMaterial` — krom kaplama materyali; her iki `<mesh>` elementinin `material` prop'una atanır
- **Dönüş**: JSX — `rotation={[Math.PI / 2, 0, 0]}` ile döndürülmüş bir `<group>` içinde iki `<mesh>` çocuğu (silindir ve küre)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/SnailFanModel.tsx::SnailFanModel
- **params**: yok
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen materyal nesnesi; `industrialBlue`, `darkGrey`, `zincGray`, `motorSilver`, `industrialSteel`, `galvanizedSteel`, `boltChrome`, `matteBlack` alanlarına erişilir
  - `scrollShape` — `useMemo` ile oluşturulan `THREE.Shape` nesnesi; salyangoz formunun dış konturunu tanımlar; `geometries` hesaplamasında `extrude` geometrisi için kullanılır
  - `geometries` — `useMemo` ile oluşturulan geometri nesneleri kümesi; `scrollShape` bağımlılığıyla hesaplanır; şu alanları içerir: `boltCylinder`, `boltSphere`, `motorBody`, `fin`, `klemensBox`, `label`, `rearCover`, `basePlate`, `baseFoot`, `extrude`, `inletFunnel`, `inletRing`, `toruses`, `wire`, `outletBox`, `outletFlange`, `outletHole`
  - `i` — `Array(24).fill(0).map` callback'inde indeks; soğutma kanatlarının rotasyon açısını hesaplamak için `i * (Math.PI / 12)` formülünde kullanılır
  - `angle` — `[45, 135, 225, 315].map` callback'inde vida açısı derece cinsinden; `Math.cos(angle * Math.PI / 180)` ve `Math.sin(angle * Math.PI / 180)` ile vida pozisyonu hesaplanır
  - `torusGeo` — `geometries.toruses.map` callback'inde tek bir torus geometrisi; koruma ızgarası halkalarının `geometry` prop'una atanır
  - `t` — `geometries.toruses.forEach` callback'inde tek bir torus geometrisi; cleanup sırasında `t.dispose()` ile GPU belleği serbest bırakılır
- **Dönüş**: JSX — motor, salyangoz gövde, emiş ünitesi ve atış ağzı bileşenlerini içeren `<group>`

### [N3_NASIL] AST Pointer: src/components/products/3d/types/SnailFanModel.tsx::useMemo::scrollShape
- **params**: yok
- **ic_degiskenler**:
  - `shape` — `new THREE.Shape()` ile oluşturulan şekil nesnesi; `moveTo`, `lineTo`, `quadraticCurveTo` metotlarıyla salyangoz formunun dış konturu çizilir
- **Dönüş**: `THREE.Shape` — salyangoz formunun dış konturunu tanımlayan şekil nesnesi

### [N4_NASIL] AST Pointer: src/components/products/3d/types/SnailFanModel.tsx::useMemo::geometries
- **params**: yok
- **ic_degiskenler**:
  - `scrollShape` — dışarıdan erişilen `THREE.Shape` nesnesi; `extrude` geometrisinin oluşturulmasında `THREE.ExtrudeGeometry`'nin ilk parametresi olarak kullanılır
  - `boltCylinder` — `new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6)` ile oluşturulan silindir geometrisi; vida gövdesi için
  - `boltSphere` — `new THREE.SphereGeometry(0.011, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2)` ile oluşturulan yarım küre geometrisi; vida başı için
  - `motorBody` — `new THREE.CylinderGeometry(0.18, 0.18, 0.42, 32)` ile oluşturulan silindir geometrisi; motor gövdesi için
  - `fin` — `new THREE.BoxGeometry(0.015, 0.39, 0.40)` ile oluşturulan kutu geometrisi; soğutma kanatları için
  - `klemensBox` — `new THREE.BoxGeometry(0.16, 0.12, 0.16)` ile oluşturulan kutu geometrisi; klemens kutusu için
  - `label` — `new THREE.PlaneGeometry(0.08, 0.08)` ile oluşturulan düzlem geometrisi; etiket için
  - `rearCover` — `new THREE.CylinderGeometry(0.19, 0.185, 0.12, 32)` ile oluşturulan silindir geometrisi; arka kapak için
  - `basePlate` — `new THREE.BoxGeometry(0.25, 0.08, 0.30)` ile oluşturulan kutu geometrisi; kaide plakası için
  - `baseFoot` — `new THREE.BoxGeometry(0.32, 0.02, 0.38)` ile oluşturulan kutu geometrisi; kaide ayağı için
  - `extrude` — `new THREE.ExtrudeGeometry(scrollShape, { depth: 0.24, bevelEnabled: false })` ile oluşturulan extrude geometrisi; salyangoz gövde için
  - `inletFunnel` — `new THREE.CylinderGeometry(0.24, 0.20, 0.04, 64, 1, true)` ile oluşturulan açık silindir geometrisi; emiş hunisi için
  - `inletRing` — `new THREE.RingGeometry(0.20, 0.24, 64)` ile oluşturulan halka geometrisi; huni ön yüzeyi için
  - `toruses` — `[0.05, 0.10, 0.15, 0.19].map(r => new THREE.TorusGeometry(r, 0.003, 8, 64))` ile oluşturulan torus geometrileri dizisi; koruma ızgarası halkaları için
  - `r` — `map` callback'inde torus yarıçapı değeri; `0.05`, `0.10`, `0.15`, `0.19` değerlerini alır
  - `wire` — `new THREE.BoxGeometry(0.38, 0.006, 0.006)` ile oluşturulan kutu geometrisi; ızgara telleri için
  - `outletBox` — `new THREE.BoxGeometry(0.3, 0.35, 0.24)` ile oluşturulan kutu geometrisi; atış ağzı kutusu için
  - `outletFlange` — `new THREE.BoxGeometry(0.02, 0.40, 0.28)` ile oluşturulan kutu geometrisi; atış ağzı flanşı için
  - `outletHole` — `new THREE.BoxGeometry(0.32, 0.28, 0.20)` ile oluşturulan kutu geometrisi; ağız boşluğu için
- **Dönüş**: nesne — 17 geometri alanını içeren nesne (`boltCylinder`, `boltSphere`, `motorBody`, `fin`, `klemensBox`, `label`, `rearCover`, `basePlate`, `baseFoot`, `extrude`, `inletFunnel`, `inletRing`, `toruses`, `wire`, `outletBox`, `outletFlange`, `outletHole`)

### [N5_NASIL] AST Pointer: src/components/products/3d/types/SnailFanModel.tsx::useEffect::cleanup
- **params**: yok
- **ic_degiskenler**:
  - `geometries` — dışarıdan erişilen geometri nesneleri kümesi; tüm geometrilerin `dispose()` metodu çağrılarak GPU belleği serbest bırakılır
  - `t` — `geometries.toruses.forEach` callback'inde tek bir torus geometrisi; `t.dispose()` ile bellekten temizlenir
- **Dönüş**: yok — yan etki: bileşen unmount olduğunda tüm geometri nesnelerinin GPU belleğini serbest bırakır

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SnailFanModel.tsx
  function: src\components\products\3d\types\SnailFanModel.tsx::Bolt
  function: src\components\products\3d\types\SnailFanModel.tsx::SnailFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: Bolt
  export: SnailFanModel

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