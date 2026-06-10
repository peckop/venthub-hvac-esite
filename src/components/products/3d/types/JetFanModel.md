---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\JetFanModel.tsx
skeleton_hash: c298291b50e6a753
entity_hashes:
  func:FlexibleCable: 7422952d69466487
  func:JetFanModel: b12c8fa3c1846be6
  overview: 036f18c566d2c82f
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:46:54Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformundaki jet fan tipi ekipmanın React tabanlı 3D modelini ve bu modelin içinde yer alan yardımcı alt bileşenlerini tanımlar. Modülün temel amacı, ilgili ürünün sahnede gerçekçi ve etkileşimli bir şekilde görselleştirilmesini sağlamaktır.

## Fonksiyon Grupları
### Ana 3B Model Bileşeni
Modülün dışarıya açılan temel bileşeni; jet fanın ana 3B geometrisini, görünümünü ve sahne entegrasyonunu tanımlar.
- JetFanModel

### Yardımcı Alt Bileşenler
Ana modelin yapısı içinde yer alan, belirli bir parça veya özellik için kullanıma özel, yeniden kullanılabilir görsel bileşenleri içerir.
- FlexibleCable

---

## AXIOMS – Mimari Varsayımlar

Bu modül, jet fan tipi 3D görselleştirme bileşenlerinden oluşmaktadır.

**[Aksiyom 1]:** Eğer `FlexibleCable` bileşeni `materials` parametresi olmadan çağrılırsa, bileşen düzgün render edilemez veya derleme hatası oluşur. `materials` parametresi zorunludur ve `FanMaterials` tipinde olmalıdır.

**[Aksiyom 2]:** Eğer `FanMaterials` tipi tanımlı değilse veya geçerli bir yapıda değilse, `FlexibleCable` bileşeninin malzeme özellikleri eksik kalır ve 3D modelde malzeme gösterimi hatalı olur.

**[Aksiyom 3]:** Eğer `JetFanModel` ana 3D sahneye yerleştirilmezse, jet fan modeli görsel olarak görünmez olur.

---

**Not:** Bu modül için fonksiyon gövdesi detayları paylaşılmadığından, sadece fonksiyon imzalarından türeyen zorunluluklar (parametre gereksinimleri) aksiyom olarak belirlenmiştir. Fonksiyon iç mantığına ilişkin ek varsayımlar, gövde kodu incelendikten sonra eklenebilir.

---

## FONKSİYON DETAYLARI

### JetFanModel
**Ne yapar**: VentHub HVAC projesinin ürünler bölümündeki 3B görselleştirme katmanında kullanılmak üzere jet fan tipi HVAC ekipmanlarının 3 boyutlu React bileşenini tanımlar. Söz konusu jet fanların kullanıcı arayüzünde 3B sahada gösterilmesini sağlayan temel işlevsel bileşendir.
**Nasıl yapar**: React fonksiyonel bileşeni standardında tanımlanır, proje içindeki tiplendirme kurallarına uygun olarak jet fan 3B modelinin tüm yapılandırma, konumlandırma ve temel etkileşim mantığını barındırır. Kaynak kodunun bulunduğu JetFanModel.tsx tip tanım dosyasında proje genelinde kullanılan tiplerle uyumlu çalışacak şekilde yapılandırılır.
**Parametreler**: Bu fonksiyona ait tanımlanmış herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: React.FC tipi döndürür, yani React ekosistemi tarafından işlenip kullanılabilecek bir React fonksiyonel bileşeni döndürür. Bu bileşen 3B sahaya yerleştirilerek kullanıcıya gösterilebilir.

### FlexibleCable
**Ne yapar**: Jet fan modellerine bağlı esnek bağlantı kablolarının 3B görselleştirmesini oluşturan yardımcı React bileşenidir. Jet fanların elektrik veya mekanik bağlantılarını temsil eden kabloların 3B sahada doğru şekilde gösterilmesini sağlar.
**Nasıl yapar**: Kendisine iletilen malzeme verilerine göre kablonun 3B modelindeki görünüm, renk, doku ve diğer görsel özelliklerini yapılandırır. Kablonun bağlı olduğu iki bağlantı noktası arasında otomatik olarak konumlanmasını sağlayarak 3B sahadaki bütünlüğü korur.
**Parametreler**:
- name: materials, type: FanMaterials — 3B kablo modelinde kullanılacak tüm malzeme özelliklerini içeren FanMaterials tipinde nesnedir. Kablonun renk, doku, şeffaflık gibi görsel ayarlarını belirlemek için kullanılır.
**Dönüş**: Tanımda açık bir dönüş tipi belirtilmemiştir, React bileşeni standartlarına uygun olarak JSX formatında 3B sahada işlenecek görsel öğeleri döndürmesi beklenir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::JetFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — useFanMaterials hook'unun dönüş değeri; tüm 3D model malzemelerini (jetOrange, greyBox, matteBlack, cableGrey, brushedAluminum) içerir
  - `fanRef` — useRef<Group>(null) ile oluşturulan React ref; iç pervaneyi (rotor) referans alır, useFrame içinde döndürmek için kullanılır
- **Dönüş**: JSX (React.FC) — 3B jet fan modelini oluşturan React Three Fiber group elemanı

---

### [N2_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::useFrame_callback
- **params**: `(state, delta)` — state: Three.js state objesi (kullanılmıyor), delta: son frame ile geçen süre (saniye)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — fanRef.current.rotation.y değerini delta * 25 kadar azaltarak pervaneyi döndürür (yan etki)

---

### [N3_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_sol_kanatlar
- **params**: `(xVal, k)` — xVal: kanat pozisyonu (0, -0.12, -0.22), k: index anahtarı
- **ic_degiskenler**:
  - `r` — sabit yarıçap değeri 0.31; silindirik gövde yarıçapını temsil eder
  - `w` — hesaplanmış genişlik; `2 * Math.sqrt(Math.max(0, r*r - xVal*xVal))` formülüyle xVal konumundaki daire kirişi genişliğini hesaplar
- **Dönüş**: JSX mesh elemanı — sol taraftaki yatay iç kanat

---

### [N4_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_mazgal_tel
- **params**: `(_, k)` — _ : kullanılmayan index, k: tel çubuk indexi (0-7)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX mesh elemanı — dairesel mazgal ızgaranın tek bir tel çubuğu

---

### [N5_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_mazgal halka
- **params**: `(radius, j)` — radius: halka yarıçapı (0.12, 0.2, 0.28), j: index anahtarı
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX mesh elemanı — mazgal ızgaranın tek bir dairesel halkası

---

### [N6_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_elektrik_bx
- **params**: `bx` — X ekseninde vida pozisyonu (0.065, -0.065)
- **ic_degiskenler**: (yok)
- **Dönüş**: Nested map sonucu JSX — elektrik kutusu vidalarının bir satırı

---

### [N7_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_elektrik_by
- **params**: `by` — Y ekseninde vida pozisyonu (0.05, -0.05)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX mesh elemanı — tek bir vida (matteBlack silindir)

---

### [N8_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_montaj_xPos
- **params**: `xPos` — X ekseninde montaj ayağı pozisyonu (-0.35, 0.35)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX group elemanı — bir montaj ayağı çifti (zPos map'i içinde 2 ayak)

---

### [N9_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_montaj_zPos
- **params**: `zPos` — Z ekseninde montaj ayağı pozisyonu (-0.22, 0.22)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX group elemanı — tek bir montaj ayağı (dikey plaka + yatay taban + somun)

---

### [N10_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::map_callback_pervane
- **params**: `(_, i)` — _ : kullanılmayan index, i: kanat indexi (0-7)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX mesh elemanı — pervanenin tek bir kanadı (cableGrey malzemeli kutu)

---

### [N11_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::FlexibleCable
- **params**: `{ materials }` — FanMaterials tipinde; materials.cableGrey kullanılır
- **ic_degiskenler**:
  - `path` — useMemo ile memoize edilmiş CatmullRomCurve3 nesnesi; 4 noktadan oluşan kablo eğrisi yolu
- **Dönüş**: JSX mesh elemanı — tubeGeometry ile oluşturulmuş 3B kablo modeli

---

### [N12_NASIL] AST Pointer: src/components/products/3d/types/JetFanModel.tsx::useMemo_callback_FlexibleCable
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `CatmullRomCurve3` — 4 Vector3 noktasından (0,0,0 → 0,0.04,0.05 → 0,0.06,0.12 → 0,0.06,0.175) oluşan Catmull-Rom spline eğrisi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\JetFanModel.tsx
  function: src\components\products\3d\types\JetFanModel.tsx::JetFanModel
  function: src\components\products\3d\types\JetFanModel.tsx::FlexibleCable

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleCable
  export: JetFanModel

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