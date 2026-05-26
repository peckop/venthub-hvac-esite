---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DehumidifierModel.tsx
skeleton_hash: 79d354e4d2dec91d
generated_at: 2026-05-23T22:23:29Z
---

## Genel Bakış
Bu modül, 3B görselleştirme bağlamında bir nemlendirici ürünün modelini tanımlayan bir React bileşeni sağlar. Tek bir fonksiyon üzerinden bileşenin yapısını ve render mantığını oluşturur, böylece ürünün üç boyutlu gösterimi uygulama içinde kolayca kullanılabilir.

## Fonksiyon Grupları
### Bileşen Tanımı
Bu grup, modülün temel yapı taşı olan fonksiyonu içerir ve nemlendirici ürünün 3B modelini oluşturan JSX yapısını döndürür.
- DehumidifierModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### DehumidifierModel
**Ne yapar**: Belge sağlanmamıştır; fonksiyonun amacı belirtilmemiştir.  
**Nasıl yapar**: Uygulama detayları verilmediği için iç mantık açıklanamaz.  
**Parametreler**: yok  
**Dönüş**: void veya bilinmiyor (belirtilmemiş)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::DehumidifierModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanWheelRef` — useRef nesnesi, fan tekerleğinin THREE.Group referansını tutar; useFrame içinde tekerleğin mevcut rotasyonunu okur ve rotation.y'yi günceller.
  - `materials` — useFanMaterials hookundan dönen nesne, boxMat, matteBlack, chassisInnerMat, castIron, industrialSteel, rubber gibi çeşitli THREE materyallerini içerir; JSX'te meshlerin material prop'lerine bu özellikler üzerinden erişilerek uygulanir.
- **Dönüş**: JSX element (3D nemlendirici modelinin React temsilcisi)

### [N2_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::(state, delta) => {}
- **params**: `state` — react-three-fiber'in render durumu nesnesi (kullanılmıyor ancak zorunlu), `delta` — her frame arasındaki zaman farkı (saniye cinsinden).
- **ic_degiskenler**:
  - `fanWheelRef` — dış kapsamdaki useRef referansı; fanWheelRef.current üzerinden fan tekerleğinin Groupsine erişilerek rotation.y değeri artırılır.
  - `delta` — zaman farkı; tekerleğin açısal hızını belirlemek için 6 ile çarpılır ve rotation.y'ye eklenir.
- **Dönüş**: yok (callback bir değer döndürmez, sadece yan etkiyle tekerleği döndürür)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::(x, i) => {}
- **params**: `x` — [-0.5, 0.5] dizisindeki yerleştirme offseti (X ekseni), `i` — dizindeki indeks (0 veya 1).
- **ic_degiskenler**:
  - `materials` — dış scopedan alınan useFanMaterials sonucu; materials.rubber üzerinden lastik materyali alınır.
  - `x` — mesh'in position.x değeri için kullanılan lateral offset; her ayak için sol (-0.5) veya sağ (0.5) yerleştirmesini sağlar.
  - `i` — React key üretiminde kullanılan indeks; `lg1-${i}` biçiminde benzersiz anahtar oluşturur.
- **Dönüş**: JSX element (tek bir lastik ayak meshi)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::(x, i) => {}
- **params**: `x` — [-0.5, 0.5] dizisindeki yerleştirme offseti (X ekseni), `i` — dizindeki indeks (0 veya 1).
- **ic_degiskenler**:
  - `materials` — dış scopedan alınan useFanMaterials sonucu; materials.rubber üzerinden lastik materyali alınır.
  - `x` — mesh'in position.x değeri için kullanılan lateral offset; her ayak için sol (-0.5) veya sağ (0.5) yerleştirmesini sağlar.
  - `i` — React key üretiminde kullanılan indeks; `lg2-${i}` biçiminde benzersiz anahtar oluşturur.
- **Dönüş**: JSX element (tek bir lastik ayak meshi, farklı Z offsetiyle)

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
- **Responsive:** (yok)
