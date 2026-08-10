---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx
skeleton_hash: a1afc85f10d943e1
entity_hashes:
  func:BentPlaneGeometry: 925b96f61263e22a
  func:handleClick: bffc3b12eebc550c
  overview: d44152fef8988bad
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:48:16Z
---

## Genel Bakış
Bu modül, Three.js ve React-three-fiber kullanılarak oluşturulmuş, 3 boyutlu sahalarda eğilmiş düzlem geometrisi gösteren bir React bileşenini tanımlar. Bileşen, görsel bir dokuya sahip, konumlandırılabilir ve tıklama etkileşimine açık bir 3B nesne sunarak ürün görselleştirmeleri için interaktif ve estetik bir bileşen sağlar.

## Fonksiyon Grupları
### Ana Geometri Bileşeni
Bükülmüş düzlem geometrisini Three.js sahasında oluşturup render eden ana React bileşenidir. Görsel, benzersiz kimlik ve konum bilgilerini alarak 3B nesneyi sahaya yerleştirir.
- BentPlaneGeometry

### Etkileşim İşleyicisi
3B geometri üzerine yapılan fare tıklamalarını algılayıp yöneten olay işleyicisidir. Three.js olay sistemiyle uyumlu çalışarak kullanıcı etkileşimlerini tetikler.
- handleClick

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Three.js tabanlı eğilmiş düzlem geometrisi gösteren bir React bileşeni için aşağıdaki mimari varsayımlara dayanır.

---

**[Aksiyom 1]:** Eğer `image` parametresi sağlanmazsa, `textureLoader` kullanılarak doku oluşturulamaz ve bileşen geçersiz dokuya sahip geometri render eder.

**[Aksiyom 2]:** Eğer `id` parametresi sağlanmazsa, bileşenin Three.js sahasında benzersiz tanımlaması yapılamaz ve potansiyel kimlik çakışmaları oluşur.

**[Aksiyom 3]:** Eğer `BentPlaneMaterial` fonksiyonu çağrılamazsa (modül yüklenemezse), geometri için uygun materyal atanamaz ve nesne görünür hale gelmez.

**[Aksiyom 4]:** Eğer `textureLoader` nesnesi oluşturulamazsa, `image` parametresinden doku yüklenemez ve geometri boş/varsayılan doku ile render edilir.

**[Aksiyom 5]:** Eğer `position` parametresi geçersiz bir dizi formatındaysa (örn: 3 elemanlı değilse), Three.js sahasında beklenmeyen konumlandırma davranışı oluşur.

---

**Not:** Fonksiyon gövdeleri verilmediği için, `handleClick` işleyicisinin gerçekleştirdiği spesifik eylemler (örn: yönlendirme, durum güncelleme) hakkında mimari varsayım üretilememektedir. Sadece fonksiyon imzası ve modül sabitlerine dayalı varsayımlar tanımlanmıştır.

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

## İTHALATLAR (IMPORTS)
- import: ../../utils/routes::Routes
- import: @react-three/drei::shaderMaterial
- import: @react-three/drei::useCursor
- import: @react-three/drei::useScroll
- import: @react-three/fiber::ThreeEvent
- import: @react-three/fiber::extend
- import: @react-three/fiber::type { ThreeElements
- import: @react-three/fiber::useFrame
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: react::useState
- import: three::type { Mesh, ShaderMaterial }

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
        uTexture: new Texture(),
...`
- **textureLoader** (new_expression) — `new TextureLoader()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BentPlaneGeometry.tsx::BentPlaneGeometry
- **params**: `image`, `id`, `position = [0, 0, 0]`
- **ic_degiskenler**:
  - `router` — Next.js navigasyon hook'u, programatik sayfa yönlendirmesi için kullanılır
  - `meshRef` — Three.js mesh referansı, 3D objeye erişim sağlar
  - `materialRef` — Shader material referansı, shader uniform değerlerini güncellemek için kullanılır
  - `scroll` — drei scroll hook'u, sayfa kaydırma offset'ini takip eder
  - `hovered` — Boolean state, mouse'un 3D obje üzerinde olup olmadığını belirtir
  - `setHover` — hovered state'ini güncellemek için setter fonksiyonu
  - `texture` — useMemo ile oluşturulmuş doküman, image parametresinden yüklenen doku
  - `geometry` — useMemo ile oluşturulmuş PlaneGeometry, 3x4 boyutunda 32x32 segmentli düzlem
  - `handleClick` — Click event handler, obje tıklandığında çalışır
- **Dönüş**: JSX (mesh elementi ve içinde bentPlaneMaterial component)

### [N2_NASIL] AST Pointer: BentPlaneGeometry.tsx::useMemo_texture
- **params**: (yok)
- **ic_degiskenler**:
  - `tex` — textureLoader.load(image) ile yüklenen doküman, SRGB renk uzayına ayarlanır
- **Dönüş**: texture (Texture objesi)

### [N3_NASIL] AST Pointer: BentPlaneGeometry.tsx::useEffect_geometry_cleanup
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: cleanup fonksiyonu (geometry.dispose() çağrısı)

### [N4_NASIL] AST Pointer: BentPlaneGeometry.tsx::geometry_dispose
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (geometry.dispose() yan etkisi var)

### [N5_NASIL] AST Pointer: BentPlaneGeometry.tsx::useEffect_texture_cleanup
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: cleanup fonksiyonu (texture.dispose() çağrısı)

### [N6_NASIL] AST Pointer: BentPlaneGeometry.tsx::texture_dispose
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (texture.dispose() yan etkisi var)

### [N7_NASIL] AST Pointer: BentPlaneGeometry.tsx::useFrame_callback
- **params**: `(_, delta)` — frame bilgisi ve delta zamanı
- **ic_degiskenler**:
  - `clampedDelta` — delta değerinin 0.1 ile sınırlanmış hali, sekme arka plandayken büyük sıçramaları önler
  - `lerpFactor` — frame-independent yumuşatma faktörü, ~60 FPS'de 0.1 hızla eşleşecek şekilde ayarlanmış
  - `targetScale` — hover durumuna göre hedef ölçek (1.0 veya 1.1)
- **Dönüş**: yok (side effect: meshRef ve materialRef değerlerini günceller)

### [N8_NASIL] AST Pointer: BentPlaneGeometry.tsx::handleClick
- **params**: `e: ThreeEvent<MouseEvent>` — Three.js mouse event objesi
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (router.push ile navigasyon yan etkisi var)

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