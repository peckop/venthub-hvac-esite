---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx
skeleton_hash: e7b54615e0d5c4d3
entity_hashes:
  func:RoundDuctFanModel: d2c6b37b5aca3633
  overview: 3db58d5e3e068a7c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında yer alan, yuvarlak kanal fanlarına özel React bileşenini barındırır. Projede HVAC ürünlerinin 3D olarak kullanıcıya sunulması sürecinde kullanılan bu bileşen, sadece yuvarlak kanal fanı tipi için özel olarak tasarlanmış 3D modelini oluşturur ve ekrana sunar.

## Fonksiyon Grupları
### Ana 3D Fan Modeli Bileşeni
Modülün tek sorumluluğu olan yuvarlak kanal fanı 3D görselleştirmesini üstlenen ana React bileşenini barındırır. Tüm 3D ürün katmanı içinde bu fan tipi için ayrılmış görselleştirme görevini tek başına yerine getirir.
- RoundDuctFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı 3D yuvarlak kanal fanı modelleme modülünün sorunsuz çalışması için proje içi React çalışma zamanı, 3D rendering bağımlılıkları ve HVAC ürünlerine ait tip tanımlarının sürekli erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer modülün içe aktardığı React çalışma zamanı ortamı yoksa, RoundDuctFanModel bileşeni sayfaya monte edilemez ve 3D fan modeli hiçbir şekilde kullanıcıya sunulamaz.
[Aksiyom 2]: Eğer modülün kullandığı proje içi veya üçüncü parti 3D rendering kütüphaneleri erişilemez durumdaysa, yuvarlak kanal fanının 3D geometrisi ekrana çizilemez, boş görsel veya kalıcı render hatası oluşur.
[Aksiyom 3]: Eğer HVAC ürünlerine ait genel tip tanımları modül tarafından okunamıyorsa, fan modeline ait temel özellikler doğru şekilde atanamaz, model uyumsuzlukları veya görsel tutarsızlıklar meydana gelir.
[Aksiyom 4]: Eğer bileşene fan modeline özgü özellikler prop olarak iletilmiyorsa, standart varsayılan fan modeli bile sorunsuz gösterilemez, eksik bilgilerden dolayı modelde görsel arızalar oluşur.

---

## FONKSİYON DETAYLARI

### RoundDuctFanModel
**Ne yapar**: VentHub HVAC projesinin ürün kategorisindeki yuvarlak kanallı fanların 3 boyutlu görselleştirmesini sağlamak amacıyla geliştirilmiş temel React bileşenidir. Proje içerisinde HVAC sistemleri bileşenlerinin 3D olarak kullanıcı arayüzünde sunulması sürecinde, sadece yuvarlak kanal fanı modelini render etmek için özel olarak tasarlanmıştır.
**Nasıl yapar**: Projenin src/components/products/3d/types dizininde tanımlanan bu fonksiyon, React ekosisteminin standart fonksiyonel bileşen standartlarına uygun olarak yapılandırılmıştır. Çağrıldığında projenin kullandığı 3D render altyapısıyla entegre çalışabilecek, fan modelini kullanıcı ekranına çizebilecek nitelikte bir React bileşeni oluşturur ve kullanıma sunar.
**Parametreler**:
- Bu ana fonksiyonun tanımında belirtilen herhangi bir giriş parametresi bulunmamaktadır. Fonksiyon kendisine ait herhangi bir parametre almaksızın çalışır.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, projenin ilgili ürün sayfalarında veya diğer üst bileşenlerinde çağrılarak yuvarlak kanal fanının 3 boyutlu modelini kullanıcı arayüzünde başarıyla render etme görevini yerine getirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::RoundDuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'undan dönen fan materyalleri nesnesi, tüm modeldeki mesh'lere materyal atamak için kullanılır
  - `fanRef` — iç pervane grubunu referanslayan useRef<THREE.Group> nesnesi, dönüş animasyonu için kullanılır
  - `useFanMaterials` — fan için gerekli materyalleri yükleyen custom hook, bileşen başlangıcında çağrılır
  - `useRef` — React hook'u, Three.js nesnelerini referanslamak için kullanılır, fanRef nesnesini oluşturur
  - `useFrame` — @react-three/fiber hook'u, her frame'de çalışarak animasyonu yönetir, fan dönüşünü hesaplar
- **Dönüş**: Tüm fan modelini içeren ölçeklenmiş Three.js <group> JSX bileşeni

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::useFrame_animation_callback
- **params**: state, delta
- **ic_degiskenler**:
  - `delta` — ardışık frame'ler arası geçen süre, fan dönüş hızını platform bağımsız sabit tutmak için kullanılır
  - `fanRef.current` — referanslanan iç pervane Three.js Group nesnesi, mevcutluğu kontrol edilerek rotasyon değeri güncellenir
  - `state` — useFrame tarafından sağlanan sahne state nesnesi, bu callback içinde kullanılmamıştır
- **Dönüş**: yok (yan etki: iç pervanenin z ekseni rotasyonunu her frame'de günceller)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoundDuctFanModel.tsx::Array_map_impeller_blade_callback
- **params**: _, i
- **ic_degiskenler**:
  - `i` — döngü indeksi, her kanatın merkez eksen etrafında eşit açıda konumlanması için rotation değeri hesaplamakta kullanılır
  - `materials.fanRed` — fan pervanesi ve kanatları için tanımlanmış kırmızı materyal, her kanat mesh'ine atanır
  - `key={i}` — React listelerinde gerekli benzersiz anahtar, her kanat için i değeri kullanılır
- **Dönüş**: Her bir fan kanadı için oluşturulmuş Three.js <mesh> JSX bileşeni

---

## NODE ID STANDARD

  file: src\components\products\3d\types\RoundDuctFanModel.tsx
  function: src\components\products\3d\types\RoundDuctFanModel.tsx::RoundDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: RoundDuctFanModel

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