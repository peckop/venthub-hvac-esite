---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx
skeleton_hash: a6be924df77471b5
entity_hashes:
  func:RoofFanModel: 00a33874d8f27b4a
  overview: c22c0e5b7f773317
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:48:38Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün görselleştirme altyapısında çatı tipi vantilatörlerin 3D modelini render eden tek ve temel React bileşenini içerir. Bileşen, projenin 3D sahnelerinde kullanılmak üzere tasarlanmış, bağımsız bir model gösterim birimidir.

## Fonksiyon Grupları
### Ana 3D Model Bileşeni
Modülün tüm işlevini tek bir merkezi bileşen üstlenerek, çatı vantilatörünün 3D modelini oluşturur ve React uygulamasına entegre eder.
- RoofFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### RoofFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3B modelleme bileşenleri ailesinde yer alan RoofFanModel, çatı tipi fanların interaktif 3 boyutlu modelini kullanıcı arayüzünde görüntüleyen bir React bileşenidir. Kullanıcıların ürünlerin fiziksel görünümünü ve yapısal detaylarını dijital ortamda inceleyebilmesini sağlayarak ürün vitrini deneyimini geliştirir.
**Nasıl yapar**: React fonksiyonel bileşen standartlarına uygun olarak geliştirilen bu bileşen, proje içindeki src/components/products/3d/types/RoofFanModel.tsx konumunda saklanır. Projede entegre edilen 3B modelleme kütüphaneleri ile uyumlu çalışarak, import edildiği ilgili sayfanın 3B sahnesine çatı fanına özel modeli yükler ve kullanıcının etkileşim kurabileceği bir şekilde sunar.
**Parametreler**: Tanımlı herhangi bir zorunlu özel parametresi bulunmamaktadır, standart React fonksiyonel bileşen kurallarına uygun olarak tüm React bileşen props'larını isteğe bağlı olarak kabul edebilir.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür, bu bileşen herhangi bir DOM konumuna eklendiğinde tanımlı çatı fanı 3B modelini sorunsuz şekilde kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: RoofFanModel.tsx::RoofFanModel
- **params**: ()
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hook'undan gelen malzeme nesnesi (matteBlack, industrialSteel, roofAntracite, roofBlade gibi malzemeleri içerir)
  - `rotorRef` — useRef<Group> ile oluşturulan referans; plug fan rotorunu döndürmek için kullanılır (rotorRef.current.rotation.y ile erişilir)
  - `logoTexture` — useTexture('/Vortice_logo.png') ile yüklenen Vortice logo dokusu; anisotropy 16 olarak ayarlanır
- **Dönüş**: JSX element (React.FC) — 3D çatı fanı modelini render eder

### [N2_NASIL] AST Pointer: RoofFanModel.tsx::useFrame_callback
- **params**: (state, delta)
  - `state` — useFrame'den gelen state nesnesi (kullanılmıyor)
  - `delta` — son kareden bu yana geçen süre (saniye cinsinden, rotor dönüş hızı için kullanılır)
- **ic_degiskenler**: yok
- **Dönüş**: yok (yan etki: rotorRef.current.rotation.y azaltarak rotoru döndürür)

### [N3_NASIL] AST Pointer: RoofFanModel.tsx::corner_bolt_map
- **params**: (pos, i)
  - `pos` — dört köşe konumu [x, z] dizisi (örn: [0.64, 0.64])
  - `i` — döngü indeksi (0-3 arası)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (mesh) — zemin montaj civatası (cylinderGeometry)

### [N4_NASIL] AST Pointer: RoofFanModel.tsx::support_lama_map
- **params**: (rot, i)
  - `rot` — lama açısı (radyan, 45°, 135°, 225°, 315° değerleri)
  - `i` — döngü indeksi (0-3 arası)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (group) — lama gövdesi, L-büküm ayak ve montaj civataları

### [N5_NASIL] AST Pointer: RoofFanModel.tsx::lama_bolt_map
- **params**: (y, j)
  - `y` — civata dikey konumu (0.20, 0, -0.20)
  - `j` — döngü indeksi (0-2 arası)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (mesh) — lama montaj civatası (cylinderGeometry)

### [N6_NASIL] AST Pointer: RoofFanModel.tsx::wire_map
- **params**: (_, i)
  - `_` — kullanılmayan parametre
  - `i` — tel indeksi (0-63 arası, 16'nın katları hariç)
- **ic_degiskenler**:
  - `angle` — telin açısal pozisyonu (i/64 * 2π)
  - `r` — telin yarıçapı (0.665, lamaların içinden geçer)
- **Dönüş**: JSX element (mesh) veya null (16'nın katlarında null döner)

### [N7_NASIL] AST Pointer: RoofFanModel.tsx::ring_map
- **params**: (_, k)
  - `_` — kullanılmayan parametre
  - `k` — halka indeksi (0-7 arası)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (mesh) — yatay destek halkası (torusGeometry)

### [N8_NASIL] AST Pointer: RoofFanModel.tsx::blade_map
- **params**: (_, i)
  - `_` — kullanılmayan parametre
  - `i` — kanat indeksi (0-8 arası, 9 kanat)
- **ic_degiskenler**:
  - `baseAngle` — kanatın temel açısı (i/9 * 2π)
- **Dönüş**: JSX element (group) — backward-curved kanat (4 segment)

### [N9_NASIL] AST Pointer: RoofFanModel.tsx::clip_map
- **params**: (rot, i)
  - `rot` — L-braket açısı (0, 90°, 180°, 270°)
  - `i` — döngü indeksi (0-3 arası)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (group) — shroud üzerindeki montaj braketi

### [N10_NASIL] AST Pointer: RoofFanModel.tsx::top_bolt_map
- **params**: (_, i)
  - `_` — kullanılmayan parametre
  - `i` — vida indeksi (0-5 arası, 6 vida)
- **ic_degiskenler**:
  - `angle` — vida açısal pozisyonu (i/6 * 2π)
- **Dönüş**: JSX element (mesh) — üst kapak montaj vidası

### [N11_NASIL] AST Pointer: RoofFanModel.tsx::eyebolt_map
- **params**: (x, i)
  - `x` — eyebolt x konumu (-0.10 veya 0.10)
  - `i` — döngü indeksi (0-1 arası, 2 eyebolt)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (mesh) — taşıma halkası (torusGeometry)

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