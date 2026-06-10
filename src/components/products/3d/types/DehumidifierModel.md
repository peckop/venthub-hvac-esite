---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DehumidifierModel.tsx
skeleton_hash: 4515c32920cb2979
entity_hashes:
  func:DehumidifierModel: 9ef5181c317802b4
  overview: 5b9ba7d5b196184b
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:43:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulaması için özel olarak tasarlanmış, üç boyutlu (3B) bir nemlendirici (kurutucu) ürün modelini temsil eden bir React Three Fiber bileşenidir. Bileşen, cihazın görsel yapısını, dahili bileşenlerini ve dönen fan tekerleği animasyonunu tanımlayarak, ürünün etkileşimli 3B gösterimini sağlar.

## Fonksiyon Grupları
### 3D Model Bileşeni
Bu grup, modülün tek ve temel bileşenini oluşturur. Sorumluluğu, nemlendiricinin geometrik yapısını, malzemelerini ve fan tekerleğinin sürekli döndüğü animasyon mantığını tanımlayarak JSX formatında bir 3B model döndürmektir.
- DehumidifierModel

---



---

## FONKSİYON DETAYLARI

### DehumidifierModel
**Ne yapar**: Bu fonksiyon, bir kurutma makinesinin (dehumidifier) 3D modelini oluşturur ve canlandırır. Fonksiyon, bir React bileşeni olarak Three.js sahnesine yerleştirilecek bir `group` JSX elementi döndürür.

**Nasıl yapar**: Fonksiyon, `useRef` hook'u ile fan pervanesi için bir referans (`fanWheelRef`) oluşturur ve `useFanMaterials()` hook'undan malzeme nesnelerini alır. `useFrame` hook'unu kullanarak her görüntü karesinde (`delta` süresince) fan pervanesinin (`fanWheelRef.current`) Y ekseni etrafında sabit bir hızla (delta * 6) dönmesini sağlar. Döndüğü JSX yapısı, gövde, üst panel, ekran, su tankı, fan montajı (dönen pervane ve ızgara), yan havalandırma deliği ve ayaklar olmak üzere several `mesh` ve `group` nesnelerinden oluşan bir 3D modeli temsil eder. Her `mesh` elementi, belirli bir geometri (`boxGeometry`, `planeGeometry` vb.) ve `materials` objesinden alınan bir malzeme ile tanımlanmıştır.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyon, React bileşeni olarak bir JSX elementi (`React.ReactElement`) döndürür. Dönüş tipi resmi olarak `void` değil, bileşenin render ettiği 3D sahne yapısıdır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::DehumidifierModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanWheelRef` — useRef ile oluşturulmuş bir referans nesnesi, dönen fan tekerleğinin (fanWheelRef.current) döndürülmesi için kullanılır
  - `materials` — useFanMaterials hook'undan dönen malzeme nesnesi (boxMat, matteBlack, chassisInnerMat, castIron, industrialSteel, rubber gibi materyalleri içerir)
- **Dönüş**: JSX - nem alma cihazının (dehumidifier) 3D modelini oluşturan React bileşeni. Gövde, panel, ekran, su tankı, fan sistemi ve ayakları içeren bir 3D model döndürür.

### [N2_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::useFrame callback (state, delta)
- **params**: (state, delta)
  - `state` — useFrame tarafından sağlanan state nesnesi (kullanılmıyor)
  - `delta` — son kareden bu yana geçen süre (saniye cinsinden), fan hızını hesaplamak için kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: yok - her karede çalışarak fanWheelRef.current.rotation.y değerini delta * 6 kadar artırarak fanı döndürür

### [N3_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::map callback (x, i) - lg1 ayağı
- **params**: (x, i)
  - `x` — [-0.5, 0.5] dizisinden gelen x koordinatı, ayakların yatay konumunu belirler
  - `i` — döngü indeksi, benzersiz key oluşturmak için kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX - modelin ön (z=0.3) tarafındaki silindirik ayaklardan birini döndürür

### [N4_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::map callback (x, i) - lg2 ayağı
- **params**: (x, i)
  - `x` — [-0.5, 0.5] dizisinden gelen x koordinatı, ayakların yatay konumunu belirler
  - `i` — döngü indeksi, benzersiz key oluşturmak için kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX - modelin arka (z=-0.3) tarafındaki silindirik ayaklardan birini döndürür

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DehumidifierModel.tsx
  function: src\components\products\3d\types\DehumidifierModel.tsx::DehumidifierModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DehumidifierModel

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