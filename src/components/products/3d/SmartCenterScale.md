---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\SmartCenterScale.tsx
skeleton_hash: 05c6832f2fb54dac
entity_hashes:
  func:SmartCenterScale: 891dc4c382b38713
  func:getLocalBoundingBox: c8bbc6f3936c29b8
  overview: 7380060fc5ddedbc
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-18T19:50:14Z
---

## Genel Bakış
SmartCenterScale, Three.js tabanlı React uygulamalarında 3D nesnelerin merkezi olarak ölçeklendirilmesini ve konumlandırılmasını sağlayan bir üst düzey bileşendir. Bileşen, geometrik sınırlayıcı kutuları hesaplayarak nesneleri orijine taşır, belirtilen hedef boyuta göre yeniden ölçekler ve opsiyonel kaydırma vektörleri uygular. Bu modül, VR/AR ve 3D ürün görüntüleme senaryolarında model boyutlarının tutarlılığını sağlamada kritik bir mimari yapı taşıdır.

## Fonksiyon Grupları
### Geometri Hesaplama Yardımcıları
3D nesnelerin yerel koordinat sistemindeki sınırlayıcı kutularını (bounding box) hesaplayan alt düzey geometri işleme fonksiyonlarını içerir. Bu hesaplamalar, merkezleme ve ölçekleme operations için temel metrik verileri sağlar.
- getLocalBoundingBox

### Bileşen Orkestrasyonu
Çocuk 3D nesnelerini sarmalayan ve onlara merkezleme, ölçekleme ile konumlandırma dönüşümlerini uygulayan React bileşen mantığını yönetir. Bu grup, bileşen özelliklerine göre koşullu renderlama ve Three.js dönüşüm matrislerini koordine eder.
- SmartCenterScale

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### getLocalBoundingBox
**Ne yapar**: Verilen bir Three.js `Group` nesnesinin yerel (local) bounding box'ını hesaplar. Üst nesnelerin rotasyon bozmalarını engelleyerek 3D modelin gerçek boyutlarını doğru şekilde ölçmeyi hedefler.

**Nasıl yapar**: Fonksiyon, hedef box'ı boşaltarak başlar ve kök nesnenin dünya matrisini günceller. Ardından dünya matrisinin tersini (inverse) alarak geçici bir değişkene kaydeder. Kök nesne altında `traverse` ile tüm alt nesneleri dolaşır; her bir `Mesh` tipindeki çocuğu bulduğunda, geometrinin bounding box'ını hesaplamamışsa hesaplar, bu box'ı geçici bir matris ile çarparak kök nesnenin local koordinat sistemine dönüştürür ve son olarak hedef box ile birleştirir (`union`). Bu sayede üst hiyerarşideki rotasyon ve ölçekleme bozulmaları bertaraf edilir.

**Parametreler**:
- `root: Group` — Hesaplamanın yapılacağı Three.js Group nesnesi. Bu nesnenin dünya matrisi (`matrixWorld`) kullanılarak tüm alt mesh geometrileri yerel koordinat sistemine taşınır.
- `targetBox: Box3` — Sonucun yazılacağı Three.js Box3 nesnesi. Fonksiyon başlangıçta bu box'ı boşaltır (`makeEmpty`) ve hesaplama boyunca union işlemleriyle genişletir.

**Dönüş**: Fonksiyonun dönüş tipi `void`'dur; sonuç doğrudan `targetBox` referansı üzerinden dışarıya aktarılır.

### SmartCenterScale
**Ne yapar**: SmartCenterScale, bir 3D modelin geometrik merkezini hesaplayıp (0,0,0) noktasına taşıyarak otomatik merkezleme yapar; ardından modeli belirtilen `targetSize` değerine uygun şekilde ölçekleyerek normalize eder. Ayrıca hesaplama tamamlanana kadar modelin görüntüsünün titreşmesini (flicker) önleyen bir mekanizma sağlar.

**Nasıl yapar**: Bileşen, içindeki `children` olarak verilen 3D modeli alır; önce modelin sınırlayıcı kutusunu (bounding box) kullanarak merkez noktasını bulur ve bu merkezi origemine getiren bir çeviri matrisi uygular. Sonra modelin en büyük boyutunu ölçer, `targetSize` ile oranını alır ve bu oranı tüm eksenlerde ölçek faktörü olarak kullanarak modeli yeniden boyutlandırır. `enabled` prop’u false olduğunda bu işlemler atlanır ve `shift` prop’u ile ek bir translasyon (ofset) uygulanabilir; bu sayede merkezleme ve ölçekleme sonrası model istenen bir miktar kaydırılabilir.

**Parametreler**:
- children: React.ReactNode — 3D modelini veya sahnedeki diğer öğeleri temsil eden JSX içeriği.
- enabled: boolean — Varsayılan `true`. Özelliğin aktif olup olmadığını kontrol eder; `false` olduğunda merkezleme ve ölçekleme atlanır.
- targetSize: number — Varsayılan `1.0`. Modelin en uzun ekseni bu değere eşitlemek için kullanılan hedef boyut.
- shift: number[] — Varsayılan `[0, 0, 0]` (belirtilen parçalı ifadeye göre). Modelin merkezlenip ölçeklendikten sonra uygulanacak ekstra translasyon vektörü (x, y, z).

**Dönüş**: React.FC<SmartCenterScaleProps> — `SmartCenterScaleProps` tipini alan ve işlenen 3D içeriği render eden bir fonksiyonel React bileşeni döner. Bu bileşen, JSX içinde doğrudan kullanılarak sahnedeki modelin otomatik olarak merkezlenip ölçeklenmesini sağlar.

---

## İTHALATLAR (IMPORTS)
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useRef
- import: react::useState
- import: three::Box3
- import: three::Matrix4
- import: three::Mesh
- import: three::Sphere
- import: three::Vector3
- import: three::type { Group }

---

## INTERFACES

### SmartCenterScaleProps
- `children: React.ReactNode`
- `enabled?: boolean`
- `targetSize?: number`
- `shift?: [number, number, number]`
- `visibleDelay?: number`
- `alignment?: 'center' | 'bottom'`

---

## SABİTLER
- **tempBox** (new_expression) — `new Box3()`
- **tempCenter** (new_expression) — `new Vector3()`
- **tempSize** (new_expression) — `new Vector3()`
- **tempSphere** (new_expression) — `new Sphere()`
- **tempInverse** (new_expression) — `new Matrix4()`
- **tempMatrix** (new_expression) — `new Matrix4()`
- **tempMeshBox** (new_expression) — `new Box3()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/SmartCenterScale.tsx::getLocalBoundingBox
- **params**: (root: Group, targetBox: Box3)
- **ic_degiskenler**:
  - `tempInverse` — root'un world matrix'inin ters matrix'i, child'ların world matrix'lerini root space'e dönüştürmek için kullanılır
  - `child` — root.traverse içindeki her bir child düğüm, Mesh olup olmadığı kontrol edilir
  - `mesh` — child'ın Mesh tipine cast edilmiş hali, geometri ve bounding box erişimi için kullanılır
  - `mesh.geometry.boundingBox` — mesh'in geometrisinin bounding box'ı, computeBoundingBox() ile hesaplanmamışsa hesaplanır
  - `tempMeshBox` — her child mesh'in geometri bounding box'ının kopyası, dönüşüm sonrası union işlemi için kullanılır
  - `tempMatrix` — mesh'in world matrix'inin root matrix world'ün tersi ile çarpılmış hali, local space dönüşümü için kullanılır
- **Dönüş**: yok (targetBox parametresini modify eder)

### [N2_NASIL] AST Pointer: src/components/products/3d/SmartCenterScale.tsx::SmartCenterScale
- **params**: (children, enabled, targetSize, shift, visibleDelay, alignment)
- **ic_degiskenler**:
  - `groupRef` — dış group elementine referans, shift pozisyonu için kullanılır
  - `innerGroupRef` — iç group elementine referans, scale ve position uygulanacak ana eleman
  - `isVisible` — component'in görünür olup olmadığını kontrol eden state
  - `isLocked` — hesaplamanın yapılıp yapılmadığını kontrol eden ref, bir kez hesaplama yapıldıktan sonra true olur
  - `frameCount` — useFrame callback'inde frame sayısını sayan ref, visibleDelay kontrolü için kullanılır
  - `diameter` — tempSphere radius'unun 2 katı, normalizasyon faktörünü hesaplamak için kullanılır
  - `scaleFactor` — targetSize / diameter oranıyla hesaplanan ölçek faktörü, iç group'u normalize etmek için kullanılır
  - `yOffset` — vertical hizalama offset'i, alignment parametresine göre hesaplanır
- **Dönüş**: JSX element (<group> yapısı)

---

## NODE ID STANDARD

  file: src\components\products\3d\SmartCenterScale.tsx
  function: src\components\products\3d\SmartCenterScale.tsx::getLocalBoundingBox
  function: src\components\products\3d\SmartCenterScale.tsx::SmartCenterScale

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmartCenterScale
  export: getLocalBoundingBox

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