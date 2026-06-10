---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx
skeleton_hash: 8c1cbc5c9d7f6757
entity_hashes:
  func:SnailFanModel: 43312a20c26f093f
  overview: 0330a77864ae91b3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:51:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürün görselleştirme altyapısında, salyangoz tipi fanların üç boyutlu modellerini tarayıcı ortamında render etmekle yükümlüdür. React ekosistemi içinde çalışarak, ürün sayfalarında gerçekçi ve etkileşimli fan görünümleri sunmayı amaçlayan tek amaçlı bir bileşen paketidir.

## Fonksiyon Grupları
### 3D Fan Modeli Bileşeni
Modülün temel ve tek sorumluluğu, salyangoz fanın üç boyutlu modelini oluşturup kullanıcıya sunmaktır. Fonksiyon, 3D sahne entegrasyonu ve görsel parametreleri yöneterek fanı ekranda canlandırır.
- SnailFanModel

---

## AXIOMS – Mimari Varsayımlar
React tabanlı 3D render bileşeni olarak çalışan bu modül, salyangoz fan modelinin görüntülenmesi için belirli ortam koşullarına bağlıdır.

[Aksiyom 1]: Eğer React runtime ortamı (tarayıcı DOM'u) yoksa, SnailFanModel bileşeni render edilemez.

[Aksiyom 2]: Eğer WebGL desteği veya Three.js benzeri 3D render kütüphanesi yüklü değilse, salyangoz fan 3D modeli görüntülenemez.

[Aksiyom 3]: Eğer bu bileşen 3D ürün görüntüleme altyapısı (ürün sayfası/bileşeni) içinde çağrılmazsa, fan modeli sayfada yer almaz.

---

## FONKSİYON DETAYLARI

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
  - `materials` — useFanMaterials() hook'undan dönen materyal objesi, tüm 3D parçalar için malzeme tanımlarını içerir
  - `scrollShape` — useMemo ile oluşturulan salyangoz formu Shape nesnesi, extrudeGeometry için kullanılır
  - `Bolt` — Standart cıvata bileşeni, position parametresi ile konumlandırılır
- **Dönüş**: JSX.Element (React functional component)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::scrollShapeCreator
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — Three.js Shape nesnesi, salyangoz formunun 2D konturu oluşturulur
- **Dönüş**: Shape (Three.js Shape nesnesi)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::Bolt
- **params**: `{ position: [number, number, number] }` — Cıvatanın 3D koordinat pozisyonu
- **ic_degiskenler**:
  - `materials` — Ana bileşenden gelen materyal objesi, materials.boltChrome kullanılır
- **Dönüş**: JSX.Element (Cıvata 3D modeli)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::coolingFinMapper
- **params**: `(_, i)` — _ kullanılmayan eleman, i döngü indeksi
- **ic_degiskenler**:
  - `materials` — Ana bileşenden gelen materyal objesi, materials.industrialBlue kullanılır
- **Dönüş**: JSX.Element (Soğutma kanadı mesh)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::boltMapper
- **params**: `(angle, i)` — angle açı derecesi (radyana çevrilir), i döngü indeksi
- **ic_degiskenler**:
  - `materials` — Ana bileşenden gelen materyal objesi, Bolt bileşenine aktarılır
- **Dönüş**: JSX.Element (Bolt bileşeni ile konumlandırılmış cıvata)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::ringMapper
- **params**: `(r, i)` — r daire yarıçapı, i döngü indeksi
- **ic_degiskenler**:
  - `materials` — Ana bileşenden gelen materyal objesi, materials.industrialBlue kullanılır
- **Dönüş**: JSX.Element (Torus geometrik halka mesh)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SnailFanModel.tsx::wireMapper
- **params**: `(angle, i)` — angle açı derecesi (radyana çevrilir), i döngü indeksi
- **ic_degiskenler**:
  - `materials` — Ana bileşenden gelen materyal objesi, materials.industrialBlue kullanılır
- **Dönüş**: JSX.Element (Dikdörtgen kutu geometrik tel mesh)

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
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)