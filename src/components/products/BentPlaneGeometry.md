---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx
skeleton_hash: ec7de2d2c0a71bfa
entity_hashes:
  func:BentPlaneGeometry: 925b96f61263e22a
  func:handleClick: bffc3b12eebc550c
  overview: e55863820fab41dc
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:03Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde Three.js ve React-three-fiber kullanılarak oluşturulmuş, 3 boyutlu sahalarda eğilmiş düzlem geometrisi gösteren bir React bileşenini tanımlar. Bileşen, görsel bir dokuya sahip, konumlandırılabilir ve tıklama etkileşimine açık bir 3B nesne sunar. Temel olarak, ürün görselleştirmeleri için interaktif ve estetik bir 3B bileşen sağlamakla sorumludur.

## Fonksiyon Grupları
### Ana Geometri Bileşeni
Bükülmüş düzlem geometrisini Three.js sahasında oluşturup render eden ana React bileşenidir. Görsel, benzersiz kimlik ve konum bilgilerini alarak 3B nesneyi sahaya yerleştirir.
- BentPlaneGeometry

### Etkileşim İşleyicisi
3B geometri üzerine yapılan fare tıklamalarını algılayıp yöneten olay işleyicisidir. Three.js olay sistemiyle uyumlu çalışarak kullanıcı etkileşimlerini tetikler.
- handleClick

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Three.js tabanlı 3B sahada eğilmiş düzlem geometrisi oluşturan React bileşenidir.

---

**[Aksiyom 1 - Geometri Görsel Bağımlılığı]:** Eğer `image` parametresi verilmezse veya geçerli bir görsel kaynağı içermiyorsa, `BentPlaneMaterial` bileşeni doğru bir texture/material oluşturamaz ve geometri boş veya hatalı render edilir.

**[Aksiyom 2 - Benzersiz Kimlik Zorunluluğu]:** Eğer `id` parametresi verilmezse, geometri nesnesinin sahada benzersiz tanımlanması mümkün olmaz; bu durumda React reconciliation hataları veya DOM/Three.js obje çakışmaları oluşur.

**[Aksiyom 3 - Konum Dizisi Yapısı]:** Eğer `position` parametresi verilirken 3 elemanlı bir dizi (x, y, z) sağlanmazsa, Three.js transform matrisi hata üretir ve geometri beklenmeyen bir konumda render edilir.

**[Aksiyom 4 - Material Bağımlılığı]:** Eğer `BentPlaneMaterial` modülü erişilebilir durumda değilse veya çağrılamazsa, geometriye material atanamaz ve Three.js render pipeline'ı bu objeyi işleyemez.

**[Aksiyom 5 - Three.js Bağlamı Zorunluluğu]:** Eğer `handleClick` işlevi Three.js uyumlu bir saha (scene) içinde çalışmıyorsa veya gelen olay nesnesi `ThreeEvent<MouseEvent>` formatında değilse, tıklama koordinatları ve intersect bilgileri doğru alınamaz.

**[Aksiyom 6 - Etkileşim Tetikleme]:** Eğer `handleClick` çağrıldığında geometri sahada visible veya interactive olarak işaretlenmemişse, Three.js raycaster tıklamayı algılayamaz ve etkileşim gerçekleşmez.

---

> **Not:** Bu aksiyomlar yalnızca fonksiyon imzası yapılarından türetilmiştir. Bileşenin iç render mantığı, JSX yapısı ve `BentPlaneMaterial`'ın detaylı implementasyonu bilinmemektedir.

---

## FONKSİYON DETAYLARI

### BentPlaneGeometry
**Ne yapar**: Bükülmüş düzlem geometrisi oluşturarak her bir ürünü eğri bir kart formunda Three.js sahnesinde görselleştirir. Bu bileşen, ürün kartlarının eğri yüzeydeki görünümünü sağlamak için kullanılır.

**Nasıl yapar**: React Functional Component olarak tanımlanmış bir Three.js bileşenidir. Verilen görüntüyü (image) ve pozisyon bilgisini alarak eğri bir yüzey üzerinde rendered. Pozisyon parametresi varsayılan olarak [0, 0, 0] koordinatlarını kullanır ancak üst bileşen (ProductCard) tarafından kontrol edilebilir.

**Parametreler**:
- image: texture veya image source — Eğri yüzey üzerinde gösterilecek ürün görseli
- id: string veya number — Bileşenin benzersiz tanımlayıcısı, DOM ve state yönetiminde kullanılır
- position: [number, number, number] (varsayılan: [0, 0, 0]) — Three.js sahnesindeki 3D konum koordinatları (x, y, z)

**Dönüş**: React.FC<BentPlaneGeometryProps> — Tip güvenli bir React Functional Component, bileşenin Three.js sahnesine entegre edilebilir yapıda olduğunu belirtir

### handleClick
**Ne yapar**: BentPlaneGeometry bileşenine tıklandığında tetiklenen olay işleyici fonksiyondur. Ürün kartı üzerine yapılan tıklama hareketlerini yakalamak ve ilgili aksiyonları tetiklemek için tasarlanmıştır.
**Nasıl yapar**: Three.js tarafından sağlanan, orijinal fare tıklama olayını sarmalayan ThreeEvent nesnesini alır, bu nesne üzerinden tıklama olayının tüm özelliklerine erişerek gerekli işlemleri yürütür.
**Parametreler**:
- e: ThreeEvent<MouseEvent> — Three.js kütüphanesi tarafından üretilen, tarayıcının orijinal MouseEvent'ini sarmalayan olay nesnesidir, tıklamanın konumu, hedefi ve ilgili diğer tüm olay özelliklerine erişim sağlar
**Dönüş**: Dönüş türü belirtilmemiştir, standart olay işleyicilerle uyumlu olarak herhangi bir değer döndürmez, void dönüş tipi beklenir.

---

## INTERFACES

### BentPlaneGeometryProps
- `image: string`
- `id: string`
- `position?: [number, number, number]`

---

## SABİTLER
- **BentPlaneMaterial** (call) — `shaderMaterial(
    {
        uTime: 0,
        uTexture: new THREE.Textur...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BentPlaneGeometry.tsx::BileşenGövdesi
- **params**: `{ image, id, position = [0, 0, 0] }`
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen yönlendirici nesnesi, programlı sayfa geçişleri için kullanılır.
  - `meshRef` — `useRef<THREE.Mesh>(null)` ile oluşturulan, `<mesh>` elementine atanan referans; `useFrame` içinde scaleX ve scaleY değerlerini manipüle etmek için kullanılır.
  - `materialRef` — `useRef<THREE.ShaderMaterial>(null)` ile oluşturulan, `<bentPlaneMaterial>` elementine atanan referans; `useFrame` içinde uniform değerlerini (uScrollOffset, uHover) güncellemek için kullanılır.
  - `scroll` — `useScroll()` hook'undan dönen scroll kontrol nesnesi; `offset` özelliği shader'a kaydırma miktarını iletmek için kullanılır.
  - `hovered` — `useState(false)` ile oluşturulan boolean state; fare imlecinin mesh üzerindeki varlığını tutar, hem cursor değişimini hem de `uHover` uniformunu hem de ölçekleme efektini kontrol eder.
  - `texture` — `useMemo` ile oluşturulan, `image` prop'undan yüklenen `THREE.Texture` nesnesi; `bentPlaneMaterial`'a `uTexture` prop'u olarak geçirilir.
  - `useFrame` callback'i — Her frame'de çağrılan fonksiyon; `materialRef` ve `meshRef` referanslarını kullanarak shader uniformlarını ve mesh ölçeğini günceller.
  - `handleClick` — İçerde tanımlı arrow fonksiyon; mesh tıklandığında tetiklenir.
- **Dönüş**: JSX (React elementi) - `<mesh>` ve içindeki geometri ve materyal elementlerini döndürür.

### [N2_NASIL] AST Pointer: BentPlaneGeometry.tsx::handleClick
- **params**: `(e: ThreeEvent<MouseEvent>)`
- **ic_degiskenler**:
  - `e` — Tıklama olayı nesnesi; `e.stopPropagation()` çağrılarak olayın yukarıya yayılması engellenir.
- **Dönüş**: Yok - Fonksiyon bir şey döndürmez, `router.push()` ile yan etki olarak sayfa yönlendirmesi yapar.

---

## NODE ID STANDARD

  file: src\components\products\BentPlaneGeometry.tsx
  function: src\components\products\BentPlaneGeometry.tsx::BentPlaneGeometry
  function: src\components\products\BentPlaneGeometry.tsx::handleClick

---

## DISA AKTARILANLAR (EXPORTS)
  export: BentPlaneGeometry

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