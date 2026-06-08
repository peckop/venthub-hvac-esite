---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\RoofFanModel.tsx
skeleton_hash: 735d589cb1665d7b
entity_hashes:
  func:RoofFanModel: 00a33874d8f27b4a
  overview: ce465d71e4aef9af
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
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

**Neden:** Fonksiyon gövdesi paylaşılmamıştır. Mimari varsayımlar sadece fonksiyon gövdesindeki kod akışından, hata yönetimi mekanizmalarından ve bağımlılık ilişkilerinden üretilebilir. Mevcut bilgiler yalnızca fonksiyon imzası (`RoofFanModel()` - parametresiz) ve modülün genel amacını içeren eski dokümandır.

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
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hook'undan alınan malzeme nesnesi, fan için tüm yüzey materyallerini içerir
  - `rotorRef` — useRef ile oluşturulan, THREE.Group tipinde rotor grubuna referans
  - `logoTexture` — useTexture hook'undan alınan Vortice logosu dokusu
- **Dönüş**: React component (JSX tree) — tam roof fan 3D modelini render eder

### [N2_NASIL] AST Pointer: RoofFanModel.tsx::useFrame-callback
- **params**: (state: Three.js state, delta: frame time delta)
- **ic_degiskenler**:
  - `state` — Three.js render state nesnesi
  - `delta` — son frame ile geçen süre (saniye)
- **Dönüş**: yok — rotorRef.current.rotation.y'yi her frame'de azaltarak rotoru döndürür

### [N3_NASIL] AST Pointer: RoofFanModel.tsx::corner-bolt-map
- **params**: (pos: [x,z] koordinat dizisi, i: indis)
- **ic_degiskenler**:
  - `pos` — [x,z] koordinat dizisi, zemin montaj civatasının x ve z pozisyonunu içerir
  - `i` — indis numarası, key üretimi için kullanılır
  - `pos[0]` — x koordinatı, mesh'in x pozisyonunda kullanılır
  - `pos[1]` — z koordinatı, mesh'in z pozisyonunda kullanılır
- **Dönüş**: JSX element — zemin köşelerindeki montaj civatası

### [N4_NASIL] AST Pointer: RoofFanModel.tsx::support-map
- **params**: (rot: radyan cinsinden açı, i: indis)
- **ic_degiskenler**:
  - `rot` — taşyıcı lamanın rotasyon açısı (radyan)
  - `i` — indis numarası, benzersiz key üretimi için kullanılır
- **Dönüş**: JSX element — 4 ana taşıyıcı lama ve detayları

### [N5_NASIL] AST Pointer: RoofFanModel.tsx::bolt-map
- **params**: (y: y-koordinatı, j: indis)
- **ic_degiskenler**:
  - `y` — lama montaj civatasının y-koordinatı (üst/orta/alt)
  - `j` — indis numarası, benzersiz key üretimi için kullanılır
- **Dönüş**: JSX element — lama üzerindeki montaj civatası

### [N6_NASIL] AST Pointer: RoofFanModel.tsx::wire-map
- **params**: (_, i: indis)
- **ic_degiskenler**:
  - `i` — tel indis numarası (0-63 arası)
  - `angle` — hesaplanan açı: (i / 64) * Math.PI * 2
  - `r` — sabit yarıçap: 0.665 (lamaların hemen içinden geçen telsı)
- **Dönüş**: JSX element veya null (eğer i % 16 === 0 ise lamalara denk gelir)

### [N7_NASIL] AST Pointer: RoofFanModel.tsx::ring-map
- **params**: (_, k: indis)
- **ic_degiskenler**:
  - `k` — halka indis numarası (0-7 arası)
- **Dönüş**: JSX element — yatay destek halkası

### [N8_NASIL] AST Pointer: RoofFanModel.tsx::blade-map
- **params**: (_, i: indis)
- **ic_degiskenler**:
  - `i` — kanat indis numarası (0-8 arası)
  - `baseAngle` — kanadın temel açısı: (i / 9) * Math.PI * 2
- **Dönüş**: JSX element — backward-curved fan kanadı (4 segment)

### [N9_NASIL] AST Pointer: RoofFanModel.tsx::useMemo-lathe-points
- **params**: () => (boş)
- **ic_degiskenler**:
  - `[]` — boş bağımlılık dizisi, useMemo'un sadece bir kez çalışmasını sağlar
- **Dönüş**: THREE.Vector2[] — lathe geometrisi için profil noktaları dizisi

### [N10_NASIL] AST Pointer: RoofFanModel.tsx::clip-map
- **params**: (rot: radyan cinsinden açı, i: indis)
- **ic_degiskenler**:
  - `rot` — L-Braket'in rotasyon açısı (radyan)
  - `i` — indis numarası, benzersiz key üretimi için kullanılır
- **Dönüş**: JSX element — shroud üzerindeki L-Braket montaj detayı

### [N11_NASIL] AST Pointer: RoofFanModel.tsx::top-bolt-map
- **params**: (_, i: indis)
- **ic_degiskenler**:
  - `i` — vida indis numarası (0-5 arası)
  - `angle` — hesaplanan açı: (i / 6) * Math.PI * 2
- **Dönüş**: JSX element — üst kapak montaj vidası

### [N12_NASIL] AST Pointer: RoofFanModel.tsx::eyebolt-map
- **params**: (x: x-koordinatı, i: indis)
- **ic_degiskenler**:
  - `x` — eyebolt'un x-koordinatı (-0.10 veya 0.10)
  - `i` — indis numarası
- **Dönüş**: JSX element — taşıma halkası (eyebolt)

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