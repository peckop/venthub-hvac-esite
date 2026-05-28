---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx
skeleton_hash: f781e9b52577f1ed
entity_hashes:
  func:Impeller: ee1fdf5cf66e515f
  overview: aceb6287c6bba380
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:43Z
---

## Genel Bakış
Bu modül, 3 boyutlu bir impeller (pompa çarkı) görselleştirmek için kullanılan bir React bileşenidir. Bileşen, tip, çap, pala sayısı ve renk gibi özellikleri props üzerinden alarak impellerin görünümünü dinamik olarak oluşturur.

## Fonksiyon Grupları
### Bileşen Tanımı ve Renderleme
Bu grup, impellerin görsel temsilini oluşturan ana işlevi içerir; props değerlerine göre impellerin geometrisini, boyutunu ve renk ayarlarını belirleyerek ekrana çizer.
- Impeller (ana bileşen fonksiyonu)

---

## AXIOMS – Mimari Varsayımlar
Impeller componentunun doğru çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `type` prop'u verilmezse, component render edilemez veya hata verir.  
[Aksiyom 2]: Eğer `diameter` prop'u verilmezse, varsayılan değer **1** kullanılır.  
[Aksiyom 3]: Eğer `bladeCount` prop'u verilmezse, varsayılan değer **8** kullanılır.  
[Aksiyom 4]: Eğer `color` prop'u verilmezse, varsayılan değer **'aluminum'** kullanılır.

---

## FONKSİYON DETAYLARI

### Impeller
**Ne yapar**: Impeller bileşeni, verilen parametrelere göre bir impeller (pompa veya fan kanadı) modelini render eden bir React bileşenidir.  
**Nasıl yapar**: Bileşen, `type`, `diameter`, `bladeCount` ve `color` props'larını alır; bu değerleri iç geometri ve stil hesaplamalarında kullanarak SVG veya Canvas üzerinden impeller görselini oluşturur. Varsayılan değerler sağlandığı için zorunlu olmayan tüm parametreler isteğe bağlıdır.  
**Parametreler**:
- type: string — Impellerin türü (örneğin 'radial', 'axial' gibi) ve render edilecek geometriyi belirler.  
- diameter: number — Impellerin çapı; birim genellikle metre veya milimetre olarak kabul edilir, varsayılan değer 1.  
- bladeCount: number — Impellerin kanat (palette) sayısı; varsayılan değer 8.  
- color: string — Impellerin rengi; CSS renk değeri alır, varsayılan değer 'aluminum'.  
**Dönüş**: React.FC<ImpellerProps> — Tip güvenli bir React fonksiyonel bileşeni döndürür; bu bileşen JSX elementi olarak kullanılabilir.

---

## INTERFACES

### ImpellerProps
- `type: 'axial' | 'radial' | 'backward_curved'`
- `diameter?: number`
- `bladeCount?: number`
- `color?: 'aluminum' | 'plastic' | 'steel'`
- `spinSpeed?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx::Impeller
- **params**: type, diameter, bladeCount, color, spinSpeed
- **ic_degiskenler**:
  - `groupRef` — ref to THREE.Group that wraps the impeller meshes, used to rotate the whole model in the animation loop
  - `materials` — object returned by `useFanMaterials` containing all predefined material presets (industrialSteel, matteBlack, brushedAluminum, etc.)
  - `material` — selected material based on the `color` prop (plastic → matteBlack, steel → industrialSteel, otherwise brushedAluminum)
  - `radius` — half of the `diameter` value, used to scale geometries (cylinders, spheres, boxes, etc.) proportionally
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx::useFrame callback
- **params**: _, delta
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx::Axial blade map callback
- **params**: _, i
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: JSX.Element

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx::Radial blade map callback
- **params**: _, i
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: JSX.Element

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx::BackwardCurved blade map callback
- **params**: _, i
- **ic_degiskenler**:
  - (yok)
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Impeller.tsx
  function: src\components\products\3d\parts\Impeller.tsx::Impeller

---

## DISA AKTARILANLAR (EXPORTS)
  export: Impeller

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