---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx
skeleton_hash: 72da243b231bb973
entity_hashes:
  func:FlexibleDuctModel: 37698f17927cf0cb
  overview: 6249aa8e31ba2a59
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda esnek havalandırma kanallarının 3 boyutlu modellerini oluşturarak ürün kataloğunda görselleştirmeyi sağlayan temel React bileşenini içerir. Modül, esnek kanalların geometrik özelliklerini alarak 3D sahada doğru bir şekilde render edilmesini ve ana uygulama akışıyla entegre olmasını sağlar.

## Fonksiyon Grupları
### 3D Model Bileşeni
Esnek havalandırma kanalının 3D geometrisini, temel parametrelerini ve etkileşim mantığını yöneterek, ana sahneye entegre edilebilir bir bileşen halinde sunar.
- FlexibleDuctModel

---

## AXIOMS – Mimari Varsayımlar

FlexibleDuctModel, parametresiz bir React bileşenidir; 3D sahnesi ve ilgili bağımlılıklar dış ortamdan sağlanır.

[Aksiyom 1]: Eğer React canvas / WebGL bağlamı (Three.js sahnesi, kamera, ışıklandırma) bileşenin dışında hazırlanmamışsa, 3D render düzgün çalışmaz.

[Aksiyom 2]: Eğer bileşenin Render Engine (örn. drei/fiber Three.js ortamı) içine yerleştirilmemişse, JSX içindeki 3D primitive'ler (mesh, geometri) hata ile karşılaşır veya görünmez kalır.

[Aksiyom 3]: Eğer FlexibleDuctModel'e ait geometri modeli (buffer, vertices, material) yüklenememiş veya tanımlanmamışsa, bileşen boş/null bir sahne üretir.

[Aksiyom 4]: Eğer bileşen React Suspense veya Error Boundary gibi bir sarmalayıcı tarafından korunmamışsa ve asenkron model yükleme başarısız olursa, üst bileşen ağacı render zinciri kırılır.

[Aksiyom 5]: Eğer bileşenin bağımlı olduğu 3D kitaplık (Three.js / React Three Fiber) proje bağlamında yüklü değilse, modül hiç derlenemez.

---

## FONKSİYON DETAYLARI

### FlexibleDuctModel
**Ne yapar**: Meksika dalgası animasyonlu, fiziksel tabanlı esnek hava kanalı modelini oluşturan bir React bileşenidir. VentHub HVAC projesinin ürün odaklı 3D görselleştirme katmanında görev alan bu component, HVAC sistemlerinde kullanılan esnek hava kanallarının gerçekçi, animasyonlu bir temsilini ekrana sunar. Proje içindeki 3D ürün bileşenleri ailesinin bir parçası olarak, esnek kanal tiplerinin özel olarak modelllenmesini sağlar.
**Nasıl yapar**: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx dosyasında konumlanan bu 3D bileşen, iç işleyişinde fiziksel tabanlı simülasyonlar kullanarak esnek hava kanalının yapısal davranışlarını taklit eder. Entegre ettiği meksika dalgası animasyonu ile statik olmayan, sürekli hareket eden gerçekçi bir görünüm kazandırır, 3D modelleme kütüphanelerini kullanarak kanalın fiziksel esneme özelliklerini simüle eder.
**Parametreler**: Tanımında herhangi bir giriş parametresi belirtilmemiştir.
**Dönüş**: Orijinal tanımında kesin dönüş tipi tanımlanmamış, void veya bilinmiyor olarak işaretlenmiştir; herhangi bir uydurma veri eklenmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: FlexibleDuctModel.tsx::FlexibleDuctModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_materials` — useFanMaterials() hook'unun döndürdüğü malzeme objesi (bileşen içinde kullanılmıyor)
  - `meshRef` — Ana kanal gövdesi (tube) için React ref, THREE.Mesh referansı tutar
  - `spiralRef` — Dış spiral halkaları için React ref, THREE.Group referansı tutar
  - `createWaveCurve` — Dalga eğrisi oluşturmak için iç fonksiyon, time parametresi ile eğri oluşturur
  - `initialCurve` — useMemo ile oluşturulan başlangıç eğrisi, createWaveCurve(0) çağrısı ile elde edilir
  - `spiralCount` — Sabit değer 20, dış spiral halka sayısını belirtir
- **Dönüş**: JSX elementi (group içinde tube mesh ve spiral halkalar)

### [N2_NASIL] AST Pointer: FlexibleDuctModel.tsx::createWaveCurve
- **params**: (time: number) — Animasyon zaman damgası
- **ic_degiskenler**:
  - `points` — THREE.Vector3[] türünde nokta dizisi, eğriyi oluşturmak için kullanılır
  - `segments` — Sabit değer 30, eğrinin segment sayısını belirtir
  - `t` — Döngü değişkeni, her bir noktanın oransal konumu (0-1 arası)
  - `x` — Eğri noktalarının x koordinatı, t değerine bağlı olarak hesaplanır
  - `wavePhase` — Dalga fazı, time ve t değerlerine bağlı olarak hesaplanır
  - `waveAmplitude` — Dalga genliği, sinüs fonksiyonu ile hesaplanır
  - `y` — Eğri noktalarının y koordinatı, dalga fazı ve genliğine bağlı olarak hesaplanır
- **Dönüş**: THREE.CatmullRomCurve3 — Oluşturulan eğri nesnesi

### [N3_NASIL] AST Pointer: FlexibleDuctModel.tsx::useFrame_callback
- **params**: (state) — useFrame hook'unun sağladığı state objesi
- **ic_degiskenler**:
  - `time` — state.clock.elapsedTime, animasyonun geçen süresi
  - `curve` — createWaveCurve(time) çağrısı ile oluşturulan güncellenmiş eğri
  - `newGeometry` — curve kullanılarak oluşturulan yeni TubeGeometry nesnesi
  - `spiralCount` — spiralRef.current.children.length, mevcut spiral halka sayısı
  - `i` — Döngü değişkeni, spiral halkalarını dolaşmak için kullanılır
  - `t` — Döngü içindeki oransal konum (0-1 arası)
  - `point` — curve.getPoint(t) ile eğri üzerindeki belirli bir nokta
  - `tangent` — curve.getTangent(t) ile eğrinin teğet vektörü
  - `child` — spiralRef.current.children[i], döngüdeki mevcut spiral halka nesnesi
  - `quaternion` — Yeni Quaternion nesnesi, halkanın rotasyonunu hesaplamak için kullanılır
- **Dönüş**: yok (yan etkiler: meshRef.current.geometry güncellenir, spiral halkalarının pozisyonu ve rotasyonu güncellenir)

### [N4_NASIL] AST Pointer: FlexibleDuctModel.tsx::Array_map_callback
- **params**: (_, i) — Array.map callback parametreleri (değer, indeks)
- **ic_degiskenler**:
  - `key` — i değeri, React listelemesi için benzersiz anahtar
  - `torusGeometry args` — [0.29, 0.018, 8, 24] sabit değerleri, torus geometrisi parametreleri
  - `meshStandardMaterial props` — color, roughness, metalness değerleri, malzeme özellikleri
- **Dönüş**: JSX elementi (mesh içinde torusGeometry ve meshStandardMaterial)

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