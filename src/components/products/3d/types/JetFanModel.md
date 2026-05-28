---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx
skeleton_hash: 1f0b601db8cfc268
entity_hashes:
  func:FlexibleCable: 7422952d69466487
  func:JetFanModel: b12c8fa3c1846be6
  overview: 59f3ae10e723f057
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:48Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda ürünlerin 3D görselleştirilmesi için kullanılan jet fan tipi ekipmanın React tabanlı 3D model bileşenini barındırır. Tüm 3D sahaya entegre edilebilecek şekilde tasarlanan modül, ana jet fan modelinin yanı sıra modelin parçası olan yardımcı alt bileşenleri de içerir.

## Fonksiyon Grupları
### Ana 3D Model Bileşeni
Modülün ana sorumluluğunu üstlenen, dışarıya açılan ana jet fan 3D modelini oluşturur, tüm 3D sahada kullanılacak ana bileşeni sunar.
- JetFanModel

### Yardımcı Alt Bileşenler
Ana jet fan modelinin parçası olan ek öğeleri renderlamak için kullanılan, yeniden kullanılabilir alt bileşenleri barındırır.
- FlexibleCable

---

## AXIOMS – Mimari Varsayımlar
Bu 3B jet fan modelleme bileşenleri paketi, yalnızca tanımlı tip bağımlılıklarının ve çalışma ortamı önkoşullarının tam olarak karşılanması durumunda hatasız çalışır.

[Aksiyom 1]: Eğer FlexibleCable bileşenine FanMaterials türünde geçerli bir materials prop'u iletilmezse, tür uyumsuzluğu nedeniyle derleme veya çalışma zamanı hatası meydana gelir, 3B kablo modeli doğru şekilde görüntülenemez.
[Aksiyom 2]: Eğer FanMaterials tür tanımı proje genelinde hiçbir yerde tanımlanmamışsa, hem JetFanModel hem de FlexibleCable bileşenleri TypeScript derleme hatası verir, uygulama üretim ortamına dağıtılamaz.
[Aksiyom 3]: Eğer bu bileşenler 3B grafik işleme yeteneğine sahip bir React ortamında çalıştırılmazsa, jet fan ve kablo modelleri kullanıcı arayüzünde hiçbir şekilde görüntülenemez.
[Aksiyom 4]: Eğer proje genelinde TypeScript tür denetimi devre dışı bırakılmışsa, geçersiz parametre gönderimleri nedeniyle çalışma zamanında beklenmedik kesintiler meydana gelir, modelin tüm işlevselliği devre dışı kalabilir.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'undan elde edilen tüm fan modellerinde kullanılan materyaller nesnesi
  - `fanRef` — iç pervane (rotor) grubunu referanslayan, THREE.Group tipinde useRef nesnesi
  - `useFanMaterials` — materyalleri yüklemek için çağrılan özel hook
  - `useRef` — React DOM referansı oluşturmak için kullanılan hook
  - `useFrame` — react-three/fiber'ın her karede çalışan animasyon hook'u
  - `FlexibleCable` — kablo modelini oluşturan alt bileşen, materials prop'u ile çağrılır
- **Dönüş**: 3 boyutlu jet fan modelini içeren React Three Fiber group JSX elemanı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::useFrame_callback
- **params**: state, delta
- **ic_degiskenler**:
  - `fanRef.current` — fan referansının o anki aktif THREE.Group nesnesi, varlığı kontrol edilir
  - `fanRef.current.rotation.y` — pervanenin y ekseni üzerinden rotasyon değeri, animasyon için güncellenir
  - `delta * 25` — her karedeki rotasyon miktarını hesaplayan çarpan
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::left_flaps_map_callback
- **params**: xVal, k
- **ic_degiskenler**:
  - `r` — sol giriş bölümü yarıçapını tanımlayan 0.31 sabit değeri
  - `w` — x konumuna göre pisagor teoremiyle hesaplanan kanat genişliği
  - `materials.jetOrange` — kanatlarda kullanılan turuncu materyal
  - `k` — map fonksiyonundaki index, benzersiz key değeri olarak kullanılır
- **Dönüş**: tek sol kanat mesh JSX elemanı

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::right_grid_lines_map_callback
- **params**: _, k
- **ic_degiskenler**:
  - `k` — map fonksiyonundaki index, çubuğun rotasyon açısını ve benzersiz key'i hesaplamak için kullanılır
  - `(k / 8) * Math.PI` — ızgara çubuğunun y eksenindeki rotasyon açısı
  - `materials.jetOrange` — ızgara çubuklarında kullanılan turuncu materyal
- **Dönüş**: tek sağ ızgara çubuğu mesh JSX elemanı

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::right_grid_rings_map_callback
- **params**: radius, j
- **ic_degiskenler**:
  - `radius` — halkanın yarıçapı, torus geometrisinin ana parametresi olarak kullanılır
  - `j` — map fonksiyonundaki index, benzersiz key değeri olarak kullanılır
  - `ring-${j}` — halka için oluşturulan benzersiz key değeri
  - `materials.jetOrange` - ızgara halkalarında kullanılan turuncu materyal
- **Dönüş**: tek sağ ızgara halkası mesh JSX elemanı

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::box_screws_bx_map_callback
- **params**: bx
- **ic_degiskenler**:
  - `bx` - vidanın x ekseni konumu, iç map döngüsünde by parametresi ile kullanılır
  - `[0.05, -0.05]` - vidaların y ekseni konumlarını içeren dizi, map fonksiyonu için kullanılır
  - `materials.matteBlack` - vidalarda kullanılan mat siyah materyal
- **Dönüş**: by konumları için oluşturulan vida mesh'lerini içeren dizi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::box_screws_by_map_callback
- **params**: by
- **ic_degiskenler**:
  - `bx` - üst kapsamdaki x ekseni vidası konumu
  - `by` - mevcut vidanın y ekseni konumu
  - `${bx}-${by}` - vida için oluşturulan benzersiz key değeri
  - `materials.matteBlack` - vidada kullanılan mat siyah materyal
- **Dönüş**: tek elektrik kutusu vida mesh JSX elemanı

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::mount_feet_xpos_map_callback
- **params**: xPos
- **ic_degiskenler**:
  - `xPos` - montaj ayağının x ekseni konumu, benzersiz key ve grup konumu olarak kullanılır
  - `[-0.22, 0.22]` - z ekseni montaj ayağı konumlarını içeren dizi
  - `materials.jetOrange` - montaj parçalarında kullanılan turuncu materyal
  - `materials.cableGrey` - montaj vidalarında kullanılan gri materyal
- **Dönüş**: tek x konumundaki tüm montaj ayaklarını içeren grup JSX elemanı

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::mount_feet_zpos_map_callback
- **params**: zPos
- **ic_degiskenler**:
  - `zPos` - montaj ayağının z ekseni konumu, benzersiz key ve parça konumları için kullanılır
  - `zPos > 0 ? 0.04 : -0.04` - koşullu hesaplanan ayak parçasının konumu
  - `zPos > 0 ? 0.05 : -0.05` - koşullu hesaplanan vidanın konumu
  - `materials.jetOrange` - montaj gövdesinde kullanılan turuncu materyal
  - `materials.cableGrey` - montaj vidasında kullanılan gri materyal
- **Dönüş**: tek z konumundaki montaj ayağı parçasını içeren grup JSX elemanı

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::JetFanModel::rotor_blades_map_callback
- **params**: _, i
- **ic_degiskenler**:
  - `i` - pervane kanadının index değeri, rotasyon açısı ve key olarak kullanılır
  - `(i / 8) * Math.PI * 2` - pervane kanadının y eksenindeki eşit dağılımlı rotasyon açısı
  - `materials.cableGrey` - pervane kanatlarında kullanılan gri materyal
- **Dönüş**: tek iç pervane kanadı mesh JSX elemanı

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::FlexibleCable
- **params**: { materials: FanMaterials }
- **ic_degiskenler**:
  - `materials` - üst bileşenden aktarılan tüm materyaller nesnesi, cableGrey materyali kullanılır
  - `path` - useMemo ile önbelleğe alınan kablonun 3 boyutlu eğrisi, CatmullRomCurve3 tipinde
  - `useMemo` - React'in değer önbelleğe alma hook'u, eğriyi tek sefer oluşturmak için kullanılır
  - `THREE.CatmullRomCurve3` - kablo eğrisini oluşturmak için kullanılan THREE.js sınıfı
  - `materials.cableGrey` - kabloda kullanılan gri materyal
- **Dönüş**: esnek kablo modelini içeren mesh JSX elemanı

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx::FlexibleCable::path_creator_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `new THREE.Vector3(0, 0, 0)` - kablonun başlangıç kontrol noktası
  - `new THREE.Vector3(0, 0.04, 0.05)` - kablonun ikinci kontrol noktası
  - `new THREE.Vector3(0, 0.06, 0.12)` - kablonun üçüncü kontrol noktası
  - `new THREE.Vector3(0, 0.06, 0.175)` - kablonun bitiş kontrol noktası
  - `THREE.CatmullRomCurve3` - tüm kontrol noktalarından eğri oluşturan THREE.js sınıfı
- **Dönüş**: kablonun eğrisini içeren CatmullRomCurve3 nesnesi

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