---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx
skeleton_hash: ad9dd151fef88357
entity_hashes:
  func:RoofFanModel: 00a33874d8f27b4a
  overview: 3c2ffd258e9e4913
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:50Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler kategorisindeki 3D görselleştirme altyapısında kullanılan, çatı tipi vantilatörlerin 3D modelini sunan React bileşenini barındırır. Proje içindeki diğer 3D sahne bileşenlerinin bu modeli kolayca entegre etmesini sağlamak için tek bir ana bileşen olarak tasarlanmıştır.

## Fonksiyon Grupları
### Ana 3D Model Bileşeni
Modülün tüm sorumluluğunu üstlenerek çatı vantilatörünün 3D modelini oluşturan ve React uygulaması için kullanılabilir hale getiren tek ana işlevi barındırır.
- RoofFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin ürünler bölümünde kullanılan çatı tipi fanın 3B modelini render eden TypeScript React bileşenidir, doğru çalışması için projenin React çalışma zamanı, ortak 3D render altyapısı ve bileşene iletilen zorunlu giriş değerlerinin varlığı zorunludur.

[Aksiyom 1]: Eğer proje genelinde React çalışma zamanı ortamı mevcut değilse, bileşen başlatılamaz, hiçbir içerik üretemez.
[Aksiyom 2]: Eğer projenin 3B bileşenler klasörünün ortak kullandığı 3D render kütüphaneleri kurulu ve çalışır durumda değilse, RoofFanModel kendi içindeki fan modelini ekrana yansıtamaz.
[Aksiyom 3]: Eğer üst bileşenden bu bileşene 3B modelin sahadaki konumunu, görünürlüğünü belirleyen zorunlu prop'lar iletilmezse, model arayüzde yanlış konumda görünür veya hiç görüntülenmez.
[Aksiyom 4]: Eğer RoofFanModel tarafından kullanılan 3B model dosyasına (formatı bilinmiyor) uygulama çalışma zamanında erişilemiyorsa, model yüklenemez, kullanıcı arayüzünde boş bir alan oluşur.

---

## FONKSİYON DETAYLARI

### RoofFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3B modelleme bileşenleri ailesinde yer alan RoofFanModel, çatı tipi fanların interaktif 3 boyutlu modelini kullanıcı arayüzünde görüntüleyen bir React bileşenidir. Kullanıcıların ürünlerin fiziksel görünümünü ve yapısal detaylarını dijital ortamda inceleyebilmesini sağlayarak ürün vitrini deneyimini geliştirir.
**Nasıl yapar**: React fonksiyonel bileşen standartlarına uygun olarak geliştirilen bu bileşen, proje içindeki src/components/products/3d/types/RoofFanModel.tsx konumunda saklanır. Projede entegre edilen 3B modelleme kütüphaneleri ile uyumlu çalışarak, import edildiği ilgili sayfanın 3B sahnesine çatı fanına özel modeli yükler ve kullanıcının etkileşim kurabileceği bir şekilde sunar.
**Parametreler**: Tanımlı herhangi bir zorunlu özel parametresi bulunmamaktadır, standart React fonksiyonel bileşen kurallarına uygun olarak tüm React bileşen props'larını isteğe bağlı olarak kabul edebilir.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür, bu bileşen herhangi bir DOM konumuna eklendiğinde tanımlı çatı fanı 3B modelini sorunsuz şekilde kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::RoofFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials` hook'undan alınan 3D modelin tüm parçalarında kullanılan materyaller paketi
  - `rotorRef` — Fan rotorunu temsil eden THREE.Group nesnesine erişmek için kullanılan React referansı
  - `logoTexture` — `/Vortice_logo.png` yolundan yüklenen, model üzerinde gösterilen marka logosu texture'ı
- **Dönüş**: Tüm 3D çatı fanı modelini içeren JSX group elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::useFrame_callback
- **params**: state, delta
- **ic_degiskenler**:
  - `rotorRef.current` — Fan rotorunun aktif THREE.Group nesnesi, rotasyonu güncellemek için kullanılır
- **Dönüş**: yok (sadece rotorun y eksenindeki rotasyonunu her frame'de günceller)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::corner_bolt_map_callback
- **params**: pos, i
- **ic_degiskenler**:
  - `pos[0]` — Köşe cıvatasının x eksenindeki konumu
  - `pos[1]` — Köşe cıvatasının z eksenindeki konumu
  - `materials.industrialSteel` — Cıvata üzerinde kullanılan endüstriyel çelik materyali
- **Dönüş**: Köşe cıvatasını temsil eden JSX mesh elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::support_bar_map_callback
- **params**: rot, i
- **ic_degiskenler**:
  - `materials.industrialSteel` — L-braket ve montaj parçalarında kullanılan endüstriyel çelik materyali
- **Dönüş**: Izgara ana taşıyıcı lamasını ve tüm ek parçalarını içeren JSX group elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::bolt_map_callback
- **params**: y, j
- **ic_degiskenler**:
  - `i` — Üst gruptaki destek lama index'i, benzersiz key oluşturmak için kullanılır
- **Dönüş**: Lama montaj cıvatasını temsil eden JSX mesh elementi

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::wire_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `angle` — Telin düzlemdeki açısını hesaplamak için kullanılan değer
  - `r` — Telin merkezden uzaklığını, lamaların hemen içinden geçecek şekilde ayarlayan yarıçap değeri
- **Dönüş**: Ana lamalara denk gelmeyen teller için JSX mesh elementi, denk gelen durumlarda null

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::ring_map_callback
- **params**: _, k
- **ic_degiskenler**:
  - `k` — Halka index'i, yatay konumu hesaplamak için kullanılır
- **Dönüş**: Izgara yatay destek halkasını temsil eden JSX mesh elementi

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::blade_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `baseAngle` — Kanatın düzlemdeki temel açısını hesaplayan değer
  - `materials.roofBlade` — Fan kanatları üzerinde kullanılan özel materyal
- **Dönüş**: Tek bir fan kanadının tüm segmentlerini içeren JSX group elementi

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::lathe_geometry_points_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `THREE.Vector2` nesneleri — Lathe geometrisi için 2D düzlemdeki şekil noktaları, gövde konik yapısını oluşturur
- **Dönüş**: Lathe geometrisi için kullanılan 5 adet THREE.Vector2 içeren dizi

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::clip_map_callback
- **params**: rot, i
- **ic_degiskenler**:
  - `materials.industrialSteel` — Shroud üzerindeki L-braketlerde kullanılan endüstriyel çelik materyali
- **Dönüş**: Shroud üzerindeki montaj braketini temsil eden JSX group elementi

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::top_bolt_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `angle` — Üst kapak vidasının düzlemdeki açısını hesaplayan değer
- **Dönüş**: Üst kapak montaj vidasını temsil eden JSX mesh elementi

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx::eyebolt_map_callback
- **params**: x, i
- **ic_degiskenler**:
  - `x` — Taşıma halkasının x eksenindeki konumu
- **Dönüş**: Üst kapak üzerindeki taşıma halkasını (eyebolt) temsil eden JSX mesh elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\RoofFanModel.tsx
  function: src\components\products\3d\types\RoofFanModel.tsx::RoofFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: RoofFanModel

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