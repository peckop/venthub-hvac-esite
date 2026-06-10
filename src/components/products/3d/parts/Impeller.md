---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Impeller.tsx
skeleton_hash: 69e782a56b6238dd
entity_hashes:
  func:Impeller: ee1fdf5cf66e515f
  overview: 325d6f2b890bb892
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:41:19Z
---

## Genel Bakış
Bu modül, 3 boyutlu bir impeller (pompa çarkı) görselleştirmek için kullanılan bir React bileşenidir. Bileşen, tip, çap, pala sayısı ve renk gibi özellikleri props üzerinden alarak impellerin görünümünü dinamik olarak oluşturur.

## Fonksiyon Grupları
### Bileşen Tanımı ve Renderleme
Bu grup, impellerin görsel temsilini oluşturan ana işlevi içerir; props değerlerine göre impellerin geometrisini, boyutunu ve renk ayarlarını belirleyerek ekrana çizer.
- Impeller (ana bileşen fonksiyonu)

---



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

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::Impeller
- **params**: (type, diameter = 1, bladeCount = 8, color = 'aluminum', spinSpeed = 5)
- **ic_degiskenler**:
  - `groupRef` — Three.js Group objesine referans, useFrame hook'unda döndürme işleminde kullanılır
  - `materials` — useFanMaterials hook'undan gelen materyal objeleri (matteBlack, industrialSteel, brushedAluminum vb.)
  - `material` — color parametresine göre seçilen spesifik materyal (plastic için matteBlack, steel için industrialSteel, diğerleri için brushedAluminum)
  - `radius` — diameter'ın yarısı, tüm geometri hesaplamalarında kullanılır
- **Dönüş**: React JSX elementi (3D impeller modeli)

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::useFrame callback
- **params**: (_, delta)
  - `_` — frame bilgisi (kullanılmıyor)
  - `delta` — son frame'den bu yana geçen süre (animasyon hızı için)
- **ic_degiskenler**:
  - `groupRef.current` — useFrame içinde döndürülecek olan Group objesi
  - `spinSpeed` — dış kapsamdan gelen döndürme hızı (dönüş parametresi)
- **Dönüş**: yok (yan etki: groupRef.current.rotation.z'yi delta * spinSpeed kadar azaltır)

### [N3_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::axial blades map callback
- **params**: (_, i)
  - `_` — Array.fill(0) ile oluşturulan boş eleman (kullanılmıyor)
  - `i` — mevcut kanat index'i (0'dan bladeCount'a kadar)
- **ic_degiskenler**: yok
- **Dönüş**: React JSX elementi (tek bir axial kanat)

### [N4_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::radial blades map callback
- **params**: (_, i)
  - `_` — Array.fill(0) ile oluşturulan boş eleman (kullanılmıyor)
  - `i` — mevcut kanatçık index'i (0'dan bladeCount*2'ye kadar)
- **ic_degiskenler**: yok
- **Dönüş**: React JSX elementi (tek bir radial kanatçık)

### [N5_NASIL] AST Pointer: src/components/products/3d/parts/Impeller.tsx::backward curved blades map callback
- **params**: (_, i)
  - `_` — Array.fill(0) ile oluşturulan boş eleman (kullanılmıyor)
  - `i` — mevcut kanat index'i (0'dan 7'ye kadar, sabit sayı)
- **ic_degiskenler**: yok
- **Dönüş**: React JSX elementi (tek bir backward_curved kanat)

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