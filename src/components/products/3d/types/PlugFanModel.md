---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx
skeleton_hash: 2ebc421bbf0113d6
generated_at: 2026-05-23T22:24:32Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürün 3D görselleştirme sisteminin bir parçasıdır ve fişli tip fan (Plug Fan) ürününü 3 boyutlu olarak ekranda sunmak üzere tasarlanmış bir React bileşeni barındırır. Yalnızca ilgili ürünün 3D modelini renderlamakla görevli, bağımsız bir bileşen olarak çalışır.

## Fonksiyon Grupları
### Ana 3D Ürün Bileşeni
Modülün tek ve ana sorumluluğunu üstlenen, Plug Fan ürününün 3D modelini React ortamında istendiği her yerde kullanılmak üzere renderlamak için dışa aktarılan ana bileşendir.
- PlugFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu React TypeScript ile geliştirilen 3D fan modeli bileşeninin doğru çalışması için çalışma zamanında frontend ortamındaki temel 3D çalışma altyapısı, bağımlılıkları ve asset erişimlerinin mevcudiyeti zorunludur.

[Aksiyom 1]: Eğer çalışma zamanında React çalışma ortamı yoksa, bileşen initialize edilemez ve hiçbir şekilde render işlemi gerçekleştirilemez.
[Aksiyom 2]: Eğer proje içerisinde 3D render işlemleri için kullanılan üç.js gibi temel 3D kütüphanesi çalışma zamanında yüklenmemişse, bu bileşen fan modelini sahneye ekleyemez, geçerli bir görsel çıktı üretemez.
[Aksiyom 3]: Eğer proje içerisinde tanımlı olan PlugFan modeline ait 3D model dosyaları, kaplamalar ve ilgili assetlere erişim imkanı yoksa, model yüklenemez, boş veya hatalı görsel çıktı üretilir.
[Aksiyom 4]: Eğer bu bileşeni kullanan üst bileşenler tarafından iletilmesi zorunlu olan modelin konumu, boyutları gibi model spesifikasyonu verileri eksik iletilir veya hiç iletilmezse, model varsayılan konfigürasyonsuz olarak ekrana sığmaz veya istenen ürün özelliklerini yansıtamaz.
[Aksiyom 5]: Eğer bu bileşenin çalıştığı tarayıcı ortamında WebGL desteği yoksa, 3D modelin renderı hiçbir şekilde gerçekleştirilemez, kullanıcıya model görüntülenemez.

---

## FONKSIYON DETAYLARI

### PlugFanModel
**Ne yapar**: VentHub HVAC projesinin 3D ürün bileşenleri dizininde yer alan bu fonksiyon, fişli fan (plug fan) olarak adlandırılan HVAC ekipmanının 3 boyutlu modelini React tabanlı uygulamada görüntülemek üzere kullanılacak bir React bileşeni döndürür. Projenin ürün gösterim akışında özel fan modellerinin 3B sahnelere entegre edilmesini sağlayan temel bileşen görevi görür, sadece ilgili ürün kategorisinin 3B temsilinde kullanılır.
**Nasıl yapar**: TypeScript tabanlı yapısı gereği React'in resmi bileşen standartlarına uygun bir React.FC (Fonksiyonel Bileşen) nesnesi döndürerek, React'in yaşam döngüsü kuralları çerçevesinde 3B fan modelini uygulamanın görüntüleme katmanına entegre eder. Kaynak dosya konumu gereği sadece projenin ürünlere özel 3D bileşenler akışında çağrılır, fişli fan dışındaki farklı ürün modellerinin gösteriminde kullanılmaz.
**Parametreler**:
- Bu fonksiyon herhangi bir girdi parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu dönen bileşen, fişli fanın 3B modelini React uygulamasının ilgili görüntüleme alanına eklemek, güncellemek ve yönetmek için tasarlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx::PlugFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'u ile alınan, tüm fan parçalarında kullanılan malzeme tanımlarını barındıran nesne
  - `fanRef` — useRef ile oluşturulan, dönen fan pervanesi grubunun Three.js Group referansını tutan, animasyon işlemleri için kullanılan ref nesnesi
- **Dönüş**: Tüm fan bileşenlerini içeren ana React Three Fiber JSX group elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx::useFrame_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanRef.current` — fan pervanesi grubunun aktif Three.js nesnesi, null kontrolü yapıldıktan sonra Z ekseni rotasyonu her frame'de güncellenir
- **Dönüş**: yok (sadece pervane rotasyonunu güncelleyen yan etki yaratır)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx::fan_blade_map_callback
- **params**: [_, i] — map fonksiyonunun kullanılmayan dizi elemanı parametresi (_) ve döngü indeksi parametresi (i)
- **ic_degiskenler**:
  - `i` — mevcut kanatın indeksi, tüm kanatların 360 derece boyunca eşit dağılması için rotasyon değeri hesaplamasında kullanılır
  - `materials.safetyOrange` — fan kanatlarında kullanılan turuncu emniyet malzemesi
- **Dönüş**: Tek bir fan kanadını oluşturan React Three Fiber JSX group elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\PlugFanModel.tsx::motor_cooling_fin_map_callback
- **params**: [_, i] — map fonksiyonunun kullanılmayan dizi elemanı parametresi (_) ve döngü indeksi parametresi (i)
- **ic_degiskenler**:
  - `i` — mevcut soğutma kanatçığının indeksi, tüm kanatçıkların motor gövdesi etrafında eşit dağılması için rotasyon değeri hesaplamasında kullanılır
- **Dönüş**: Tek bir motor soğutma kanatçığını oluşturan React Three Fiber JSX mesh elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\PlugFanModel.tsx
  function: src\components\products\3d\types\PlugFanModel.tsx::PlugFanModel

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
- **Responsive:** (yok)
