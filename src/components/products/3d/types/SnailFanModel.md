---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx
skeleton_hash: a88f0daa446dde1f
generated_at: 2026-05-23T22:25:15Z
---

## Genel Bakış
VentHub HVAC platformunun ürünler bölümündeki 3D görüntüleme altyapısı için geliştirilen bu modül, salyangoz tipi fanların 3D modelini render etmek üzere tasarlanmıştır. React tabanlı bir yapıda çalışan modül, diğer 3D ürün bileşenleriyle uyumlu şekilde entegre olarak platformdaki ürün görselleştirme ihtiyacını karşılar.

## Fonksiyon Grupları
### Ana 3D Bileşeni
Modülün tek ve temel fonksiyonu olarak salyangoz fan 3D modelini uygulamaya sunar, tüm görüntüleme süreçlerini üstlenerek fan modelini platformun ilgili sayfasına entegre eder.
- SnailFanModel

---

## AXIOMS – Mimari Varsayımlar
Tarayıcıda çalışan React tabanlı 3D HVAC ürün modeli bileşenidir, proje içindeki ürün 3D görselleştirme akışında kullanılır, çalışması için ekosistemdeki tüm ilgili 3D altyapı ve React çalışma zamanının sorunsuz şekilde sağlanması zorunludur.

[Aksiyom 1]: Eğer çalıştığı tarayıcıda WebGL desteği bulunmuyorsa, 3D fan modeli hiçbir şekilde ekrana renderlanamaz, kullanıcıya ürün 3D görünümü sunulamaz.
[Aksiyom 2]: Eğer projenin entegre ettiği 3D render kütüphanesi (örn: Three.js, React Three Fiber) bileşen çalıştırılmadan önce yüklenmemişse, modelin geometrik ve görsel öğeleri oluşturulamaz, boş veya hatalı görsel çıktı oluşur.
[Aksiyom 3]: Eğer bu bileşen çağrıldığında üst bileşen tarafından kendisine iletilen geçerli 3D sahne referansı sağlanmamışsa, model mevcut ürün sahnesine eklenemez, ürün görselleştirme akışı tamamen kesilir.
[Aksiyom 4]: Eğer bileşen React bileşen ağacı kurallarına aykırı olarak yetkili olmayan bir bağlamda çağrılırsa, modelin konumlandırma, ölçeklendirme gibi temel görsel özellikleri çalışmaz, proje genelinde tüm ürün görselleştirmelerinde tutarsızlıklar ortaya çıkar.

---

## FONKSIYON DETAYLARI

### SnailFanModel
**Ne yapar**: VentHub HVAC projesinde kullanılan standart santrifüj (salyangoz) fan tipinin 3B modelini render eden React fonksiyonel bileşenini tanımlar ve döndürür. Ürün sayfalarında ilgili HVAC ekipmanının üç boyutlu olarak kullanıcılara sunulmasını sağlayan özel bileşen ailesinin bir parçasıdır, yalnızca salyangoz fan modelinin görselleştirilmesi için özel olarak geliştirilmiştir.
**Nasıl yapar**: Projenin 3B ürün bileşenleri kategorisinde yer alan bu fonksiyon, React bileşen standartlarına uygun olarak yapılandırılmıştır. Proje içinde kullanılan 3B modelleme kütüphaneleri ile entegre çalışacak şekilde tasarlanmış, temel olarak salyangoz fanın geometrisini, dokularını ve gerekli etkileşim özelliklerini yükleyerek hedef alanda görüntüleme sorumluluğunu üstlenir.
**Parametreler**:
- Bu fonksiyona herhangi bir giriş parametresi aktarılmaz
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, uygulama içindeki ilgili yerlerde çağrıldığında 3B salyangoz fan modelini hedef DOM alanına render eder, tüm React bileşeni yaşam döngüsü kurallarına uyumlu olarak çalışır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::SnailFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'undan alınan tüm 3D model materyallerini tutan nesne
  - `scrollShape` — useMemo ile önbelleğe alınan salyangoz gövdesinin 2D şeklini tanımlayan THREE.Shape nesnesi
  - `Bolt` — içeride tanımlanan konum parametresi alan 3D cıvata bileşeni
- **Dönüş**: Tüm fan modelini içeren ana JSX group elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::scrollShapeMemoCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — salyangoz konturunu çizmek için oluşturulan THREE.Shape nesnesi, üzerine çizim komutları eklenir
- **Dönüş**: Tamamlanmış salyangoz şeklini içeren THREE.Shape nesnesi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::BoltComponent
- **params**: [{ position: [number, number, number] }]
- **ic_degiskenler**:
  - `position[0]` — cıvatanın 3D sahnesindeki X konumu
  - `position[1]` — cıvatanın 3D sahnesindeki Y konumu
  - `position[2]` — cıvatanın 3D sahnesindeki Z konumu
  - `materials.boltChrome` — cıvataya uygulanan krom kaplama materyali
  - `cylinderGeometry` — cıvata gövdesi için silindir geometrisi
  - `sphereGeometry` — cıvata başı için kesik küre geometrisi
- **Dönüş**: 3D cıvata modelini içeren JSX group elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::coolingFinMapCallback
- **params**: [_, i]
- **ic_degiskenler**:
  - `i` — map döngüsündeki mevcut soğutma kanadının sıra numarası
  - `materials.industrialBlue` — kanada uygulanan endüstriyel mavi materyal
  - `boxGeometry` — soğutma kanadı için dikdörtgen prizma geometrisi
- **Dönüş**: Tek soğutma kanadını temsil eden JSX mesh elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::mountBoltMapCallback
- **params**: [angle, i]
- **ic_degiskenler**:
  - `angle` — vidanın konumunu hesaplamak için kullanılan açı (derece cinsinden)
  - `i` — map döngüsündeki vidanın sıra numarası
  - `Math.cos(angle * Math.PI / 180) * 0.22` — vidanın X konumu
  - `Math.sin(angle * Math.PI / 180) * 0.22` — vidanın Y konumu
  - `0.025` — vidanın sabit Z konumu
- **Dönüş**: Konumlandırılmış Bolt bileşenini içeren JSX elementi

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::guardRingMapCallback
- **params**: [r, i]
- **ic_degiskenler**:
  - `r` — mevcut koruma halkasının yarıçapı
  - `i` — map döngüsündeki halkanın sıra numarası
  - `materials.industrialBlue` — halkaya uygulanan endüstriyel mavi materyal
  - `torusGeometry` — halka şekli için tor geometrisi
- **Dönüş**: Tek koruma halkasını temsil eden JSX mesh elementi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::guardWireMapCallback
- **params**: [angle, i]
- **ic_degiskenler**:
  - `angle` — mevcut koruma telinin rotasyon açısı (derece cinsinden)
  - `i` — map döngüsündeki telin sıra numarası
  - `materials.industrialBlue` — tele uygulanan endüstriyel mavi materyal
  - `boxGeometry` — koruma teli için dikdörtgen prizma geometrisi
- **Dönüş**: Tek koruma telini temsil eden JSX mesh elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SnailFanModel.tsx
  function: src\components\products\3d\types\SnailFanModel.tsx::SnailFanModel

---

## DISA AKTARILANLAR (EXPORTS)
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
- **Responsive:** (yok)
