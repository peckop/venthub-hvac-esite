---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DomesticFanModel.tsx
skeleton_hash: ce8718fb332bf442
entity_hashes:
  func:DomesticFanModel: c93fddd365c3092d
  overview: 10bc29aea86c412e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, 3D ürün görselleştirme bileşenleri içinde ev tipi tavan fanı modelini tanımlayan bir React bileşeni sağlar. DomesticFanModel fonksiyonu, fanın görsel ve etkileşimli özelliklerini yöneterek UI'ya entegrasyonu kolaylaştırır.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün temel yapı taşı olan fonksiyonu içerir ve fan modelinin render edilmesiyle ilgili sorumluluğu üstlenir.
- DomesticFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### DomesticFanModel
**Ne yapar**: Bu fonksiyon, ev tipi fanların 3D modelini göstermek için kullanılan bir React fonksiyonel bileşenini tanımlar. Bileşen, ilgili görsel ve etkileşimli öğeleri render ederek kullanıcıya fan modelini sunar.  
**Nasıl yapar**: `DomesticFanModel` fonksiyonu, içeriğinde JSX döndürerek temel yapıyı oluşturur; gerekli stilleri ve dış bağımlılıkları (örneğin model veri veya üçüncü parti görüntüleme kütüphaneleri) kapsam dışından alır ve bunları render sürecinde kullanır. Props almadığı için dışarıdan veri beklemez, sadece statik veya varsayılan bir görüntü sağlar.  
**Parametreler**:  
- Bu fonksiyon hiçbir parametre almaz.  
**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen döndürür; bu bileşen render edildiğinde JSX çıktısı üretir ve React tarafından DOM’a monte edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: DomesticFanModel.tsx::DomesticFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — result of useFanMaterials hook providing THREE.js material objects for meshes.
  - `fanRef` — useRef hook holding a reference to the THREE.Group that wraps the fan geometry.
  - `panelSize` — constant defining the width and depth of the front panel (set to 1.0 world units).
  - `panelThickness` — constant defining the thickness of the front panel (set to 0.08 world units).
- **Dönüş**: JSX element representing the fan component (React.FC return).

### [N2_NASIL] AST Pointer: DomesticFanModel.tsx::(row mapper)
- **params**: `_` (unused), `row` (index of the current row in the grid)
- **ic_degiskenler**:
  - `col` — loop variable from the inner map, representing column index.
  - `x` — computed X offset for the hole mesh based on column index and panel size.
  - `y` — computed Y offset for the hole mesh based on row index and panel size.
  - `panelSize` — outer‑scope constant defining panel dimensions, used to scale the grid.
  - `materials` — outer‑scope hook result providing the industrialSteel material.
- **Dönüş**: JSX `<mesh>` element for a single hole in the grid.

### [N3_NASIL] AST Pointer: DomesticFanModel.tsx::(col mapper)
- **params**: `_` (unused), `col` (index of the current column in the inner grid)
- **ic_degiskenler**:
  - `row` — outer‑scope variable from the row mapper, indicating current row.
  - `x` — computed X offset for the hole mesh based on column index and panel size.
  - `y` — computed Y offset for the hole mesh based on row index and panel size.
  - `panelSize` — outer‑scope constant defining panel dimensions.
  - `materials` — outer‑scope hook result providing the industrialSteel material.
- **Dönüş**: JSX `<mesh>` element for a single hole in the grid.

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DomesticFanModel.tsx
  function: src\components\products\3d\types\DomesticFanModel.tsx::DomesticFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DomesticFanModel

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