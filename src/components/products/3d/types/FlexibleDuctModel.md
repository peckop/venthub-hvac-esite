---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx
skeleton_hash: c528a6e230f99d4c
entity_hashes:
  func:FlexibleDuctModel: 37698f17927cf0cb
  overview: a748c200cfba6807
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:47Z
---

## Genel Bakış
VentHub HVAC projesinde yer alan bu modül, ürün kataloğundaki esnek havalandırma kanallarının 3 boyutlu olarak görselleştirilmesini sağlayan ana React bileşenini barındırır. Uygulamanın 3D ürün görüntüleme sisteminde kullanılan bu bileşen, esnek kanalların 3D sahada doğru şekilde render edilmesinden sorumludur.

## Fonksiyon Grupları
### Ana 3D Bileşen
Modülün tek ana bileşeni olarak, esnek kanalların tüm 3D görselleştirme ve temel bileşen mantığını yürütür, uygulamanın ürün 3D görüntüleme akışında sorunsuz entegrasyon sağlar.
- FlexibleDuctModel

---

## AXIOMS – Mimari Varsayımlar
Venthub HVAC platformunun 3D ürün görselleştirme katmanında kullanılan, esnek kanalların 3D modellemesini yapan React bileşeni olan FlexibleDuctModel'in doğru çalışması için çalışma ortamı, gerekli bağımlılıkları ve giriş parametrelerinin eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer JSX desteğine sahip, React bileşenlerini çalıştırabilecek bir frontend runtime ortamı yoksa, bu bileşen hiçbir şekilde yüklenemez, esnek kanalın 3D modeli kullanıcıya görüntülenemez.
[Aksiyom 2]: Eğer 3D modeli ana sahneye eklemek için gereken geçerli bir 3D motoru referansı bileşene prop olarak iletilmezse, esnek kanalın geometrik yapısı oluşturulamaz, ürün görselleştirmesi tamamen başarısız olur.
[Aksiyom 3]: Eğer modele ait HVAC sistemine özgü temel geometrik parametreler (esnek kanala ait uzunluk, çap vb.) giriş olarak iletilmezse, 3D model gerçek ürün boyutlarına uygun şekilde oluşturulamaz, ürün temsili yanlış olur.
[Aksiyom 4]: Eğer bileşenin üst component'ten aldığı görünürlük, seçilme durumu gibi temel etkileşim prop'ları eksiksiz iletilmezse, modelin kullanıcı işlemlerine uygun olarak gösterilmesi/gizlenmesi sağlanamaz, 3D ürün görünümünde kalıcı tutarsızlık oluşur.

---

## FONKSİYON DETAYLARI

### FlexibleDuctModel
**Ne yapar**: Meksika dalgası animasyonlu, fiziksel tabanlı esnek hava kanalı modelini oluşturan bir React bileşenidir. VentHub HVAC projesinin ürün odaklı 3D görselleştirme katmanında görev alan bu component, HVAC sistemlerinde kullanılan esnek hava kanallarının gerçekçi, animasyonlu bir temsilini ekrana sunar. Proje içindeki 3D ürün bileşenleri ailesinin bir parçası olarak, esnek kanal tiplerinin özel olarak modelllenmesini sağlar.
**Nasıl yapar**: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx dosyasında konumlanan bu 3D bileşen, iç işleyişinde fiziksel tabanlı simülasyonlar kullanarak esnek hava kanalının yapısal davranışlarını taklit eder. Entegre ettiği meksika dalgası animasyonu ile statik olmayan, sürekli hareket eden gerçekçi bir görünüm kazandırır, 3D modelleme kütüphanelerini kullanarak kanalın fiziksel esneme özelliklerini simüle eder.
**Parametreler**: Tanımında herhangi bir giriş parametresi belirtilmemiştir.
**Dönüş**: Orijinal tanımında kesin dönüş tipi tanımlanmamış, void veya bilinmiyor olarak işaretlenmiştir; herhangi bir uydurma veri eklenmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx::FlexibleDuctModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_materials` — useFanMaterials hook'u ile alınan malzeme nesneleri topluluğu
  - `meshRef` — Esnek kanalın ana gövde mesh'ine erişmek için kullanılan React ref nesnesi, THREE.Mesh tipinde
  - `spiralRef` — Kanalın dışındaki spiral halka grubuna erişmek için kullanılan React ref nesnesi, THREE.Group tipinde
  - `createWaveCurve` — Zaman değerine göre animasyonlu dalga eğrisi oluşturan iç yardımcı fonksiyon
  - `useFrame` — React-three-fiber'in her frame'de çalışan güncelleme hook'u
  - `initialCurve` — useMemo ile önbelleğe alınan, ilk render'da kullanılacak başlangıç dalga eğrisi
  - `spiralCount` — Dış spiral yapıda oluşturulacak toplam halka sayısını belirten sabit
- **Dönüş**: 3D sahneye eklenen esnek kanal modelini içeren React JSX group elemanı

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx::createWaveCurve
- **params**: [time: number] — Animasyon için kullanılan toplam geçen zaman değeri
- **ic_degiskenler**:
  - `points` — Eğriyi oluşturan 3D vektör noktalarını depolayan dizi
  - `segments` — Eğri için ayrılacak parça sayısını belirten sabit
  - `i` — Segmentleri döngüleyen sayaç
  - `t` - 0 ile 1 arasında normalize edilmiş segment konumu
  - `x` — Noktanın X ekseni koordinatı
  - `wavePhase` — Dalga hareketinin zamanla değişen fazını hesaplayan değer
  - `waveAmplitude` — Dalganın Y eksenindeki maksimum genliğini hesaplayan değer
  - `y` — Noktanın Y ekseni koordinatı, dalga hareketine göre dinamik değişir
- **Dönüş**: Oluşturulan düzgün 3B eğri nesnesi, THREE.CatmullRomCurve3 tipinde

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx::useFrame_callback
- **params**: [state] — React-three-fiber tarafından sağlanan sahne state nesnesi, zamanlayıcı (clock) içerir
- **ic_degiskenler**:
  - `meshRef.current` — Referans edilen ana kanal mesh'inin güncel çalışma zamanı değeri
  - `spiralRef.current` — Referans edilen spiral grubunun güncel çalışma zamanı değeri
  - `time` — State.clock'tan alınan sahnenin toplam geçmiş süresi
  - `curve` — Güncel zaman ile oluşturulan yeni dalga eğrisi
  - `newGeometry` — Yeni eğriye göre oluşturulan THREE.TubeGeometry nesnesi, ana kanala atanır
  - `spiralCount` — Spiral grubu içindeki toplam çocuk eleman (halka) sayısı
  - `i` — Spiral halkalarını döngüleyen sayaç
  - `t` — Mevcut spiral elemanının eğri üzerindeki normalize edilmiş konumu
  - `point` — Eğri üzerindeki spiral elemanının konum vektörü
  - `tangent` — Eğri üzerindeki noktanın teğet vektörü, rotasyon hesaplamak için kullanılır
  - `child` — Döngüdeki mevcut spiral halka mesh'i
  - `quaternion` — Spiral elemanının eğri teğetine göre rotasyonunu hesaplayan THREE.Quaternion nesnesi
- **Dönüş**: void, referanslar yüklenmemişse erken return, aksi halde her frame'de kanal geometrisini ve spiral konumlarını günceller

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx::spiral_map_callback
- **params**: [_, i] — Kullanılmayan dizi elemanı (_), spiral elemanının sıralı indeksi (i)
- **ic_degiskenler**:
  - `key={i}` — React listelemesi için gereken benzersiz anahtar değeri
  - `torusGeometry` — Spiral halka şekli için oluşturulan THREE.TorusGeometry nesnesi
  - `meshStandardMaterial` — Spiral halkasına uygulanan üç boyutlu malzeme, renk, pürüzlülük ve metaliklik değerleri ayarlanmış
- **Dönüş**: Her bir spiral halka için React JSX mesh elemanı

---

## NODE ID STANDARD

  file: src\components\products\3d\types\FlexibleDuctModel.tsx
  function: src\components\products\3d\types\FlexibleDuctModel.tsx::FlexibleDuctModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleDuctModel

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