---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\SmartCenterScale.tsx
skeleton_hash: 91a4afb1a705c043
entity_hashes:
  func:SmartCenterScale: ab18f9a5eaf38c7c
  func:getLocalBoundingBox: 8e08dceb1399af38
  overview: c708233fc47ade9a
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:05:32Z
---

## Genel Bakış
SmartCenterScale, Three.js tabanlı React uygulamalarında 3D nesnelerin merkezi olarak ölçeklendirilmesini ve konumlandırılmasını sağlayan bir üst düzey bileşendir. Bileşen, geometrik sınırlayıcı kutuları hesaplayarak nesneleri orijine taşır ve belirtilen hedef boyuta göre yeniden ölçekler. Bu modül, 3D ürün görüntüleme senaryolarında model boyutlarının tutarlılığını sağlamada kritik bir mimari yapı taşıdır.

## Fonksiyon Grupları
### Geometri Hesaplama Yardımcıları
3D nesnelerin yerel koordinat sistemindeki sınırlayıcı kutularını hesaplayan alt düzey geometri işleme fonksiyonlarını içerir. Bu hesaplamalar, merkezleme ve ölçekleme işlemleri için temel metrik verileri sağlar.
- getLocalBoundingBox

### Bileşen Orkestrasyonu
Çocuk 3D nesnelerini sarmalayan ve onlara merkezleme, ölçekleme ile konumlandırma dönüşümlerini uygulayan React bileşen mantığını yönetir. Bu grup, bileşen özelliklerine göre koşullu renderlama ve Three.js dönüşüm matrislerini koordine eder.
- SmartCenterScale

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Three.js `Group` ve `Box3` geometri tipleri üzerine kurulmuştur; bu nesnelerin çalışma zamanında mevcut olması gerekir.

[Aksiyom 1]: Eğer `getLocalBoundingBox` fonksiyonuna geçirilen `root` parametresi geçerli bir Three.js `Group` nesnesi değilse, sınırlayıcı kutu hesaplaması yapılamaz ve `targetBox` doldurulamaz.

[Aksiyom 2]: Eğer `SmartCenterScale` bileşeninde `targetSize` değeri 0 ise, ölçekleme hesaplamasında sıfıra bölme hatası oluşur.

[Aksiyom 3]: Eğer `SmartCenterScale` bileşeninde `enabled` parametresi `false` ise, ölçekleme ve konumlandırma işlemi uygulanmaz; çocuklar oldukları haliyle render edilir.

[Aksiyom 4]: Eğer `SmartCenterScale` bileşenine geçerli bir `children` (Three.js sahne nesnesi) sağlanmazsa, sınırlayıcı kutu hesaplanacak bir geometri bulunamaz.

[Aksiyom 5]: Eğer `shift` parametresi verilmezse, varsayılan değer `[0, 0, ...]` kullanılır; kaydırma vektörünün tam boyutu imzadan kesilmiş olup bilinmiyor.

[Aksiyom 6]: Eğer modül sabitleri (`tempBox`, `tempCenter`, `tempSize`, `tempSphere`, `tempInverse`, `tempMatrix`, `tempMeshBox`) oluşturulamazsa, geometri hesaplama yardımcıları çalışamaz; bu sabitler geçici hesaplama nesneleri olarak kullanılır.

---

## FONKSİYON DETAYLARI

### getLocalBoundingBox
**Ne yapar**: Üst öğe (parent) rotasyonlarının ölçümleri bozmasını önlemek için verilen bir `Group` nesnesi için merkezlenmiş bir yerel sınırlayıcı kutu (bounding box) hesaplar ve bu kutuyu `targetBox` parametresine yazar.
**Nasıl yapar**: Fonksiyon, önce `targetBox`'ı boşaltır ve kök grubun dünya matrisini günceller. Ardından kök grubun dünya matrisinin tersini alarak geçici bir matrise kopyalar. Kök grubun altındaki tüm çocukları dolaşarak (traverse) sadece `Mesh` tipindeki nesneleri işler. Her mesh'in geometrisi için bir sınırlayıcı kutu hesaplanır (veya mevcut olan kullanılır). Bu kutu, mesh'in dünya matrisinin kök grubun ters matrisiyle çarpılması sonucu elde edilen yerel dönüşüm matrisiyle dönüştürülür ve `targetBox` ile birleştirilir (union). Bu sayede, üst öğelerin rotasyonlarından bağımsız, nesnenin kendi koordinat sisteminde bir sınırlayıcı kutu elde edilir.
**Parametreler**:
- root: Group — Sınırlayıcı kutusu hesaplanacak kök Three.js grubu.
- targetBox: Box3 — Hesaplanan yerel sınırlayıcı kutunun yazılacağı hedef `Box3` nesnesi.
**Dönüş**: Belirtilmemiş (void). Fonksiyon, hesaplanan kutuyu doğrudan `targetBox` parametresinin referansı üzerinden değiştirir.

### SmartCenterScale
**Ne yapar**: Profesyonel bir 3D normalizasyon bileşenidir. Verilen çocuk bileşenleri (children) belirli bir hedef boyuta (targetSize) ölçeklendirir ve isteğe bağlı olarak konumlarını kaydırır (shift). Bu, 3D sahnelerde nesneleri tutarlı bir ölçek ve konumda sunmak için kullanılır.
**Nasıl yapar**: Bileşen, bir React fonksiyonel bileşeni olarak tanımlanmıştır. Parametre olarak aldığı `children`, `enabled`, `targetSize` ve `shift` değerlerini kullanarak bir normalizasyon mantığı uygular. `enabled` parametresi `false` olduğunda bileşen normalizasyon işlemini devre dışı bırakır ve çocukları olduğu gibi render eder. `targetSize` parametresi, nesnelerin ölçeklendirileceği referans boyutu belirtir. `shift` parametresi, ölçeklendirme sonrası nesnelerin x, y, z eksenlerinde ne kadar kaydırılacağını tanımlar. Bileşen, `SmartCenterScaleProps` arayüzüne uygun bir yapıdadır.
**Parametreler**:
- children: React.ReactNode — Bileşenin içinde render edilecek alt bileşenler veya 3D nesneler.
- enabled: boolean — Bileşenin normalizasyon işlemini yapıp yapmayacağını kontrol eder. Varsayılan değeri `true`'dur.
- targetSize: number — Nesnelerin ölçeklendirileceği hedef boyut. Varsayılan değeri `1.0`'dır.
- shift: [number, number, number] — Ölçeklendirme sonrası nesnelerin x, y, z eksenlerindeki kaydırma miktarlarını içeren bir dizi. Verilen kodda parametre tanımı eksik (`shift = [0, 0,)` şeklinde kesilmiş), ancak dokümantasyona göre bir vektör (muhtemelen [x, y, z]) bekler.
**Dönüş**: React.FC<SmartCenterScaleProps> — `SmartCenterScaleProps` arayüzüne uygun bir React fonksiyonel bileşeni döndürür.

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
- **params**: `root: Group`, `targetBox: Box3`
- **ic_degiskenler**:
  - `child` — `root.traverse` içindeki her alt çocuğu temsil eder
  - `mesh` — `child`'ın `Mesh` tipine cast edilmiş hali; geometri ve matris bilgilerine erişmek için kullanılır
  - `bb` — `mesh.geometry.boundingBox` referansı; geometrinin yerel sınırlayıcı kutusunu tutar
- **Dönüş**: yok (void). `targetBox` parametresini, `root` grubundaki tüm mesh'lerin birleşik yerel sınırlayıcı kutusuyla günceller.

### [N2_NASIL] AST Pointer: src/components/products/3d/SmartCenterScale.tsx::SmartCenterScale
- **params**: `children`, `enabled = true`, `targetSize = 1.0`, `shift = [0, 0, 0]`, `visibleDelay = 3`, `alignment = 'center'`
- **ic_degiskenler**:
  - `groupRef` — dış `group` elementine referans; `shift` pozisyonunu uygulamak için kullanılır
  - `innerGroupRef` — iç `group` elementine referans; normalizasyon ve merkezleme transformasyonlarının uygulandığı grup
  - `isVisible` — bileşenin görünür olup olmadığını kontrol eden state
  - `setIsVisible` — `isVisible` state'ini güncelleyen setter fonksiyonu
  - `isLocked` — hesaplama tamamlandıktan sonra `useFrame` döngüsünü kilitleyen ref
  - `frameCount` — kaç çerçevenin geçtiğini sayan ref; geometri yüklenmesini beklemek için kullanılır
  - `diameter` — hesaplanan sınırlayıcı kürenin çapı (`tempSphere.radius * 2`)
  - `scaleFactor` — `targetSize` ile `diameter` oranından elde edilen ölçek faktörü
  - `yOffset` — hizalama moduna göre hesaplanan dikey ofset
  - `timer` — `useEffect` içindeki 500ms gecikmeli gösterim için zamanlayıcı
- **Dönüş**: `React.FC<SmartCenterScaleProps>` — iki iç içe `group` elementi döndüren JSX yapısı

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