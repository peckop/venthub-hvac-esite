---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DuctFanModel.tsx
skeleton_hash: e008da7c837f898d
entity_hashes:
  func:DuctFanModel: 17f5aa11f6202531
  func:RectangularDuctFanModel: c575246c49ae9f50
  overview: 3724c6e43d80601a
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, HVAC (Isıtma, Havalandırma ve Klima) sistemlerinde kullanılan kanal tipi fanlar için 3D model ve bileşen tanımları sunar. Modül, temel bir kanal fanı modeliyle genel bir yapı tanımlarken, belirli bir dikdörtgen kanal fanı türü için özelleştirilmiş bir React bileşeni de içerir. Bileşenler dış parametre almamakta olup, yalnızca iç mantık ve varsayılan yapılandırma ile çalışır.

## Fonksiyon Grupları
### Model ve Yapı Tanımları
Havalandırma kanalı fanlarının temel veri yapısını ve genel 3D model bileşenini tanımlar.
- DuctFanModel

### Özelleşmiş Bileşen Tanımları
Belirli bir kanal fanı türü (örneğin dikdörtgen kesitli) için çalışacak, dışarıdan veri almayan özel bir React bileşeni oluşturur.
- RectangularDuctFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### DuctFanModel
**Ne yapar**: Bu fonksiyon, bir duct fan modelinin görsel temsilini sağlayan bir React bileşenidir. Kullanıcı arayüzünde fanın boyutları, konumu ve diğer özelliklerini göstermek için kullanılır.  
**Nasıl yapar**: Fonksiyon içeriğinde JSX döndürerek fanın geometrisini ve etiketlerini renderlar; dışarıdan prop almadığı için varsayılan stiller ve varsayılan verilerle çalışır.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: Bileşen bir React elementi döndürür; açık bir dönüş tipi belirtilmemiş olduğu için void gibi davranır.

### RectangularDuctFanModel
**Ne yapar**: Bu fonksiyon, dikdörtgen kanal fanı modelini gösteren bir React fonksiyonel bileşenidir. Tasarımcılar ve mühendisler tarafından fanın截面 görünümünü incelemek için kullanılır.  
**Nasıl yapar**: `React.FC` tipini uygulayarak props alabilir ve bu props üzerinden genişlik, yükseklik, malzeme gibi özellikleri alarak dinamik JSX üretir; props tanımlanmadığı sürece varsayılan değerlerle çalışır.  
**Parametreler**:  
- (parametre yok)  
**Dönüş**: `React.FC` türünden bir fonksiyon döndürür; bu, JSX elementi döndüren bir fonksiyon anlamına gelir ve React tarafından doğrudan render edilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: DuctFanModel.tsx::DuctFanModel
- **params**: (yok)
- **ic_degiskenler**:
  - `fanRef` — useRef ile oluşturulmuş, THREE.Group nesnesini referans alan React ref'i. Pervane grubunu döndürmek için kullanılır.
  - `materials` — useFanMaterials hook'unun dönüş değeri. Merkezi malzeme nesnelerini (galvanizedSteel vb.) içerir, JSX'teki mesh bileşenlerine atanır.
  - `localBladeColor` — useMemo ile oluşturulmuş, pervane bıçakları için özelleştirilmiş bir THREE.MeshStandardMaterial nesnesi. Kırmızımsı bir renk ve metalik özelliklere sahiptir.
  - `useFrame` callback'indeki `state` — useFrame hook'una ait, React Three Fiber'in güncelleme döngüsü durumunu temsil eder (kullanılmamıştır).
  - `useFrame` callback'indeki `delta` — Son kareden bu yana geçen süre (saniye). fanRef.current.rotation.y değerini bu delta ile çarpıp azaltarak pervaneyi döndürmek için kullanılır.
- **Dönüş**: JSX elemanı (3D sahne yapısı). `group` elemanı içinde silindirler, kutular ve pervane geometrilerinden oluşan bir kanal fanı modelini render eder.

### [N2_NASIL] AST Pointer: DuctFanModel.tsx::RectangularDuctFanModel
- **params**: (yok)
- **ic_degiskenler**:
  - `materials` — Fonksiyon gövdesinde useFanMaterials hook'u ile alınan malzeme nesneleri. JSX'teki mesh bileşenlerine (galvanizedSteel, industrialSteel, matteBlack, brushedAluminum) atanır.
- **Dönüş**: `React.FC` tipinde bir fonksiyon bileşeni. Dikdörtgen kanal fanı geometrisini (ana gövde, destekler, klemens kutusu, pervane milini) render eder.

### [N3_NASIL] AST Pointer: DuctFanModel.tsx::useFrame Callback (DuctFanModel içinde)
- **params**: `(state, delta)` — useFrame hook'unun parametreleri. state: Fiber durumu, delta: kare süresi.
- **ic_degiskenler**: (yok, sadece outer scope'taki `fanRef` kullanılır)
- **Dönüş**: yok (yan etki: her karede fanRef.current.rotation.y değerini azaltarak pervaneyi döndürür).

### [N4_NASIL] AST Pointer: DuctFanModel.tsx::useMemo Callback (DuctFanModel içinde)
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `THREE.MeshStandardMaterial` nesnesi (renk: '#be123c', metalness: 0.6, roughness: 0.4).

### [N5_NASIL] AST Pointer: DuctFanModel.tsx::map Callback (DuctFanModel - TAŞIYICI AYAK)
- **params**: `(z, i)` — z: [-0.2, 0.2] dizisinden gelen koyma değeri (Y ekseninde), i: dizi indeksi.
- **ic_degiskenler**: (yok, sadece parametreler ve outer scope'taki `materials` kullanılır)
- **Dönüş**: JSX `<mesh>` elemanı (destek ayağı parçası).

### [N6_NASIL] AST Pointer: DuctFanModel.tsx::map Callback (DuctFanModel - PERVANE)
- **params**: `(rot, i)` — rot: [0, 45, ..., 315] dizisinden gelen açı değeri (derece), i: dizi indeksi.
- **ic_degiskenler**: (yok, sadece parametreler ve outer scope'taki `localBladeColor` kullanılır)
- **Dönüş**: JSX `<group>` elemanı (belirli açıyla döndürülmüş bir pervane bıçağı).

### [N7_NASIL] AST Pointer: DuctFanModel.tsx::RectangularDuctFanModel Callback (iç)
- **params**: (yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'undan alınan malzeme nesneleri.
- **Dönüş**: JSX elemanı (dikdörtgen kanal fanı geometrisi).

### [N8_NASIL] AST Pointer: DuctFanModel.tsx::map Callback (RectangularDuctFanModel içinde)
- **params**: `(x, i)` — x: [-0.5, 0.5] dizisinden gelen koyma değeri (X ekseninde), i: dizi indeksi.
- **ic_degiskenler**: (yok, sadece parametreler ve outer scope'taki `materials` kullanılır)
- **Dönüş**: JSX `<mesh>` elemanı (dikdörtgen fanın yan destek parçası).

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DuctFanModel.tsx
  function: src\components\products\3d\types\DuctFanModel.tsx::DuctFanModel
  function: src\components\products\3d\types\DuctFanModel.tsx::RectangularDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DuctFanModel
  export: RectangularDuctFanModel

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