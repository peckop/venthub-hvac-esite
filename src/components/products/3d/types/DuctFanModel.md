---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DuctFanModel.tsx
skeleton_hash: a1ad11ae7c7b34fd
entity_hashes:
  func:DuctFanModel: 17f5aa11f6202531
  func:RectangularDuctFanModel: c575246c49ae9f50
  overview: 68716c558aae1e37
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:47Z
---

## Genel Bakış
Bu modül, havalandırma sistemlerinde kullanılan kanal fanları için veri modelleri ve ilgili React bileşen tanımlarını içerir. Temel veri yapısını tanımlayan fonksiyonla genel bir model sunulurken, belirli bir fan türü için özelleştirilmiş bir bileşen de sağlanır.

## Fonksiyon Grupları
### Model ve Veri Tanımları
Temel kanal fanı veri yapısını ve özelliklerini belirler.
- DuctFanModel

### Bileşen Tanımları
Belirli bir kanal fanı türü için React fonksiyonel bileşeni oluşturur ve döndürür.
- RectangularDuctFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, dışarıdan parametre almayan iki React bileşeni tanımlar; bu yüzden davranışları sadece iç mantık ve (varsa) state'e bağlıdır.

- **Aksiyom 1**: Eğer `DuctFanModel()` veya `RectangularDuctFanModel()` fonksiyonlarına hiçbir argüman geçirilmezse, bileşenin çıktısı sadece iç mantığına ve (varsa) kullanılan hook’lara veya state’e bağlıdır; dışarıdan gelen veri etkilemez.  
- **Aksiyom 2**: Eğer bu bileşenlere prop geçilirse (TypeScript’te izin verilebilir olsa da), fonksiyon imzası hiçbir parametre kabul etmediği için bu prop’lar bileşen tarafından görmezden gelir / kullanılamaz.  
- **Aksiyom 3**: Eğer bileşen render edilirse, üretilen JSX çıktısı yalnızca fonksiyon gövdesindeki sabit ifadeler, hooks ve iç state tarafından belirlenir; dışarıdan değişen değerler etkilemez.  
- **Aksiyom 4**: Eğer bileşenin iç state veya hook’ları hakkında bilgi yoksa, bu değerlerin varsayılanları veya başlangıç değerleri bilinmiyor; bu yüzden sadece “iç mantık” üzerinden varsayım yapılabilir.

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

### [N1_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::DuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `fanRef` — REF to THREE.Group used to rotate the fan in the animation frame
  - `materials` — object returned by useFanMaterials containing predefined material instances
  - `localBladeColor` — Memoized THREE.MeshStandardMaterial with custom blade color, metalness and roughness
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::useFrame_callback
- **params**: state, delta
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::useMemo_factory
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: THREE.MeshStandardMaterial

### [N4_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::map_z_i
- **params**: z, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

### [N5_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::map_rot_i
- **params**: rot, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

### [N6_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::RectangularDuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `materials` — object returned by useFanMaterials containing predefined material instances
- **Dönüş**: JSX.Element

### [N7_NASIL] AST Pointer: src/components/products/3d/types/DuctFanModel.tsx::map_x_i
- **params**: x, i
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

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