---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx
skeleton_hash: a03ad3d03d2f2258
generated_at: 2026-05-23T22:25:26Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ürün 3B görselleştirme altyapısında yer alan hız kontrol mekanizması modelini içeren React bileşenidir. Ürünlerin sanal ortamdaki temsili için gereken hız kontrol bileşeninin tanımını yaparak, 3B ürün tipleri kategorisinde kullanıma sunulur.

## Fonksiyon Grupları
### Ana 3B Hız Kontrol Modeli Bileşeni
Modülün tüm sorumluluğunu üstlenerek, 3B ortamdaki hız kontrol sisteminin modelini render etmek ve yönetmek için gereken tüm işlevselliği barındırır.
- SpeedControlModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin 3B ürün bileşenleri katmanında hız kontrolü işlevini modelleyen TypeScript React bileşenidir, doğru çalışması için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer proje içerisinde TypeScript derleyicisi doğru yapılandırılmamışsa, .tsx uzantılı bu modül derlenemez, projeye dahil edilemez.
[Aksiyom 2]: Eğer modülün çalıştığı React ortamı 16.8 ve üstü sürümleri desteklemiyorsa, fonksiyonel bileşen olarak tasarlanan bu modül uyumsuzluk nedeniyle çalışmaz.
[Aksiyom 3]: Eğer projeye 3B görselleştirme için gerekli kütüphane entegrasyonu yapılmamışsa, hız kontrol modelinin 3B sahnesine yerleştirilmesi ve kullanıcıya sunulması mümkün olmaz.
[Aksiyom 4]: Eğer bu modülü çağıran üst bileşen tarafından gerekli giriş parametreleri ve tip tanımları sağlanmamışsa, modül çalışma anında hata fırlatır, hız kontrolü işlevini yerine getiremez.
[Aksiyom 5]: Eğer modülün HVAC sistemlerine ait hız verilerine erişmesini sağlayacak state yönetim altyapısı entegre edilmemişse, gerçek zamanlı hız değerleri modelde gösterilemez, kullanıcı tarafından yapılan kontrol değişiklikleri sisteme iletilemez.

---

## FONKSIYON DETAYLARI

### SpeedControlModel
**Ne yapar**: VentHub HVAC projesinin ürün bileşenleri kapsamında yer alan 3B görselleştirme modülleri için hız kontrol sistemine özel tür tanımlama işlevidir. Proje içindeki HVAC ekipmanlarının hız ayarlama özelliklerinin 3B ortamda kullanılabilmesi için gerekli veri modelinin şemasını tanımlar, tüm ilgili bileşenlerde standartlaştırılmış veri yapısı kullanımını sağlar.
**Nasıl yapar**: TypeScript tabanlı React projesinde tür tanımlama (type definition) rolü üstlenir, 3B bileşenler içerisinde hız kontrol sistemi ile ilgili tüm veri noktalarının tip güvenliğini garanti eder. Proje geliştirme sürecinde hız kontrol parametrelerinin tutarsız kullanımlarını önler, olası tür uyumsuzluğu hatalarını derleme aşamasında yakalanmasına olanak tanır.
**Parametreler**:
- Tanımlı herhangi bir giriş parametresi bulunmamaktadır
**Dönüş**: İşlevin dönüş tipi resmi olarak tanımlanmamıştır, kaynak kodda belirtilen bilgiye göre void veya bilinmeyen bir türdür. Herhangi bir değer döndürmesi amaçlanmamış, yalnızca tür tanımlama amacıyla oluşturulmuştur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx::SpeedControlModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'u ile elde edilen malzeme koleksiyonu, modelin tüm 3D mesh'lerine malzeme atamak için kullanılır
  - `knobRef` — THREE.Group tipinde React ref nesnesi, modelin dönen potansiyometre düğmesine (knob) erişmek için kullanılır, useRef ile oluşturulmuştur
  - `ledRef` — THREE.MeshBasicMaterial tipinde React ref nesnesi, modelin LED göstergesinin malzemesine erişerek renk animasyonu uygulamak için kullanılır, useRef ile oluşturulmuştur
  - `ledMaterial` — useMemo ile önbelleğe alınan THREE.MeshBasicMaterial nesnesi, LED göstergesinin başlangıç malzemesi olarak atanır, bellek sızıntılarını önlemek için memoize edilmiştir
- **Dönüş**: React Three Fiber `<group>` JSX elementi, SpeedControlModel 3D modelini tanımlayan sahne elemanı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx::anon_useFrame_callback
- **params**: [state] — useFrame hook'u tarafından sağlanan sahne durumu nesnesi
- **ic_degiskenler**:
  - `state.clock.elapsedTime` — sahne yüklendiğinden beri geçen toplam süre, animasyonların zamanlamasını hesaplamak için kullanılır
  - `time` — state.clock.elapsedTime değerine atanan yerel değişken, tüm animasyon hesaplamalarında kullanılır
  - `knobRef.current` — knob referansının bağlı olduğu THREE.Group nesnesi, varsa düğmenin Z ekseninde dönme animasyonunu uygulamak için kullanılır
  - `ledRef.current` — led referansının bağlı olduğu THREE.MeshBasicMaterial nesnesi, varsa LED'in renk değerini güncelleyerek nabız animasyonu uygulamak için kullanılır
  - `intensity` — LED'in parlaklık seviyesini hesaplamak için kullanılan yerel değişken, zamanın sinüs değerinin mutlak değeri olarak hesaplanır
  - `greenValue` — LED'in yeşil renk kanalının 8-bit değerini hesaplayan yerel değişken, minimum 100, maksimum 255 olarak ayarlanır
- **Dönüş**: yok, her frame'de çalışan animasyon güncelleme fonksiyonu, void dönüş tipi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx::anon_map_heatl_callback
- **params**: [y, i] — map fonksiyonu tarafından sağlanan konum değeri (y) ve dizi indeksi (i)
- **ic_degiskenler**:
  - `y` — sol soğutma kanalı mesh'inin Y ekseni konumunu belirten sayısal değer, [-0.3, 0, 0.3] dizisinden gelir
  - `i` — map fonksiyonu tarafından üretilen dizi indeksi, benzersiz React anahtarı (key) oluşturmak için kullanılır
  - `materials.matteBlack` — genel malzeme koleksiyonundaki mat siyah malzeme, soğutma kanalı mesh'ine atanır
- **Dönüş**: React Three Fiber `<mesh>` JSX elementi, sol taraftaki tek bir soğutma kanalı 3D elemanı

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx::anon_map_heatr_callback
- **params**: [y, i] — map fonksiyonu tarafından sağlanan konum değeri (y) ve dizi indeksi (i)
- **ic_degiskenler**:
  - `y` — sağ soğutma kanalı mesh'inin Y ekseni konumunu belirten sayısal değer, [-0.3, 0, 0.3] dizisinden gelir
  - `i` — map fonksiyonu tarafından üretilen dizi indeksi, benzersiz React anahtarı (key) oluşturmak için kullanılır
  - `materials.matteBlack` — genel malzeme koleksiyonundaki mat siyah malzeme, soğutma kanalı mesh'ine atanır
- **Dönüş**: React Three Fiber `<mesh>` JSX elementi, sağ taraftaki tek bir soğutma kanalı 3D elemanı

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SpeedControlModel.tsx
  function: src\components\products\3d\types\SpeedControlModel.tsx::SpeedControlModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpeedControlModel