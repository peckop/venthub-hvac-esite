---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\CentrifugalFanModel.tsx
skeleton_hash: 24a998d3a25d1846
entity_hashes:
  func:CentrifugalFanModel: 2ca1d8ced8088e61
  overview: 6444af53b2b5ccbf
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:43:26Z
---

## Genel Bakış
Bu modül, santrifüj tip fanın (salyangoz fan) three.js tabanlı üç boyutlu modelini render eden bağımsız bir React bileşenini tanımlar. Bileşen, fanın ana yapı taşlarını (tahrik motoru, spiral konaklama ve radyal kanatlı pervane) statik bir şekilde 3D ortamında görselleştirerek etkileşimli bir ürün gösterimi sunar.

## Fonksiyon Grupları
### 3D Fan Modeli Bileşen Tanımı
Santrifüj fanın three.js geometrisini ve malzemelerini oluşturarak sahneye yerleştiren, props almayan tek bir React bileşenini içerir.
- CentrifugalFanModel

---



---

## FONKSİYON DETAYLARI

### CentrifugalFanModel
**Ne yapar**: Bu fonksiyon, santrifüj fanın 3B modelini gösteren bir React bileşeni tanımlar. Bileşen, fanın temel parçalarını (motor, konaklama ve pervane) temsil ederek kullanıcıya görsel bir yapı sunar.

**Nasıl yapar**: Fonksiyon içeriği, verilen docstring’te belirtilen özellikleri açıklayan bir JSX yapısı döndürür; motorun merkezi tahrik olduğu, konaklamanın spiral/salyangoz tipinde olduğu ve pervanenin radyal kanatlı, dönen yapı olduğu bilgileri bileşenin render ettiği öğelerle eşleştirir. Props almadığı için dışarıdan veri beklemez ve statik bir görselleştirme sağlar.

**Parametreler**:  
- (Parametre yok)

**Dönüş**: React.FC türünde bir fonksiyonel bileşen döner; bu, JSX elementi render ederek santrifüj fan modelini ekrana getirir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CentrifugalFanModel.tsx::CentrifugalFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials() hook'undan gelen 3D malzeme nesneleri (industrialBlue, industrialSteel, galvanizedSteel, darkGrey, motorSilver, logoRed, bladeBlack, matteBlack)
  - `impellerRef` — useRef<Group>(null) ile oluşturulan ref; dönen impeller grubuna referans verir, useFrame içinde rotation.z ayarı için kullanılır
  - `impellerBladeGeometry` — useMemo ile hesaplanan ExtrudeGeometry; 12 adet geriye kıvrımlı santrifüj kanatın 3D geometrisini oluşturur
  - `scrollShape` — useMemo ile hesaplanan Shape; spiral (salyangoz) housing profilini tanımlar, extrudeGeometry ile 3D'ye dönüştürülür
- **Dönüş**: JSX — 3D santrifüj fan modeli (motor grubu, spiral housing, dönen impeller, koruma ızgarası)

### [N2_NASIL] AST Pointer: CentrifugalFanModel.tsx::useFrame callback
- **params**: `state` — useFrame tarafından sağlanan frame state objesi (kullanılmıyor), `delta` — geçen süre (saniye cinsinden, rotasyon hızı hesaplamada kullanılır)
- **ic_degiskenler**:
  - (yok — doğrudan impellerRef.current.rotation.z üzerine yazılır)
- **Dönüş**: yok (yan etki: impellerRef.current.rotation.z -= delta * 12 ile pervaneyi her frame döndürür)

### [N3_NASIL] AST Pointer: CentrifugalFanModel.tsx::impellerBladeGeometry useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — new Shape() ile oluşturulan 2D kanat profili; moveTo, quadraticCurveTo, lineTo ile dış kenardan iç kenara kıvrımlı profil çizimi
  - `extrudeSettings` — ExtrudeGeometry için ayarlar nesnesi; depth: 0.03 (kalınlık), bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1
- **Dönüş**: ExtrudeGeometry — şekillendirilmiş 3D kanat geometrisi

### [N4_NASIL] AST Pointer: CentrifugalFanModel.tsx::scrollShape useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `shape` — new Shape() ile oluşturulan 2D spiral housing profili; moveTo, lineTo, quadraticCurveTo ile salyangoz formu çizimi
- **Dönüş**: Shape — spiral housing'in 2D profili

### [N5_NASIL] AST Pointer: CentrifugalFanModel.tsx::soğutma kanatları map callback
- **params**: `_` — doldurma elemanı (kullanılmıyor), `i` — dizi indeksi (0-15 arası, her kanat için açı hesaplamada kullanılır)
- **ic_degiskenler**:
  - (yok — params içindeki i kullanılır)
- **Dönüş**: JSX mesh — tek bir soğutma kanadı; rotation [0, 0, i * (Math.PI / 8)] ile 16 kanat eşit aralıklarla yerleştirilir

### [N6_NASIL] AST Pointer: CentrifugalFanModel.tsx::impeller kanatları map callback
- **params**: `_` — doldurma elemanı (kullanılmıyor), `i` — dizi indeksi (0-11 arası, kanat açısını belirler)
- **ic_degiskenler**:
  - (yok — params içindeki i kullanılır; impellerBladeGeometry closure'dan erişilir)
- **Dönüş**: JSX group — tek bir kanat grubu; rotation [0, 0, (i / 12) * Math.PI * 2] ile 12 kanat eşit açılarla yerleştirilir

### [N7_NASIL] AST Pointer: CentrifugalFanModel.tsx::koruma ızgarası halka map callback
- **params**: `r` — torus yarıçapı değeri (0.06, 0.10, 0.14 veya 0.18 — her bir halkanın yarıçapı), `i` — dizi indeksi (0-3 arası, benzersiz key üretimi için)
- **ic_degiskenler**:
  - (yok — params içindeki r ve i kullanılır)
- **Dönüş**: JSX mesh — tek bir koruma halkası; torusGeometry ile r yarıçapında oluşturulur

### [N8_NASIL] AST Pointer: CentrifugalFanModel.tsx::koruma ızgarası tel map callback
- **params**: `angle` — tel açısı derece cinsinden (0, 60, 120, 180, 240 veya 300 — her telin döndürme açısı), `i` — dizi indeksi (0-5 arası, benzersiz key üretimi için)
- **ic_degiskenler**:
  - (yok — params içindeki angle ve i kullanılır)
- **Dönüş**: JSX mesh — tek bir koruma teli; rotation [0, 0, angle * Math.PI / 180] ile radyana çevrilerek yerleştirilir

---

## NODE ID STANDARD

  file: src\components\products\3d\types\CentrifugalFanModel.tsx
  function: src\components\products\3d\types\CentrifugalFanModel.tsx::CentrifugalFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CentrifugalFanModel

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