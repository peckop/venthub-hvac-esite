---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx
skeleton_hash: ec7de2d2c0a71bfa
generated_at: 2026-05-23T22:25:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün bileşenleri arasında yer alan, 3 boyutlu dijital sahalarda kullanılmak üzere eğilmiş düzlem geometrisi oluşturan React bileşenini barındırır. Three.js tabanlı bir yapıda çalışan bileşen, ürün görselleştirmelerinde konumlandırılabilir ve kullanıcı etkileşimlerine açık bir 3B nesne sunar.

## Fonksiyon Grupları
### Ana 3B Geometri Bileşeni
Eğilmiş düzlem geometrisini render eden ana React bileşenidir, aldığı konum, görsel ve benzersiz kimlik bilgileriyle geometriyi 3 boyutlu sahada konumlandırarak görüntüler.
- BentPlaneGeometry

### Kullanıcı Etkileşimi İşleyicisi
Geometriye yapılan tıklama etkileşimlerini yöneten işlevdir, Three.js uyumlu fare olaylarını alarak tıklama gerçekleştiğinde gerekli aksiyonları tetikler.
- handleClick

---

## AXIOMS – Mimari Varsayımlar
Bu react-three-fiber tabanlı 3B geometri bileşeni, sahnelerde bükülmüş düzlem objeleri oluşturmak için tasarlanmıştır, çalışması için üst Three.js entegrasyon ortamının ve tüm yerel bağımlılıklarının modül yüklenmeden önce hazırlanmış olması zorunludur.

[Aksiyom 1]: Eğer bileşene aktarılan `id` prop'u 3B sahne içerisinde benzersiz değilse, aynı id'ye sahip başka geometrilerle olay ve render çakışması yaşanır, tıklama olayları hedef dışı elementler üzerinde tetiklenir.
[Aksiyom 2]: Eğer `image` prop'u olarak geçirilen nesne Three.js Texture formatında değilse, çağrılan `BentPlaneMaterial` yüklenemez, geometri üzerinde hiçbir görsel içerik görünmez.
[Aksiyom 3]: Eğer çalışılan ortamda Three.js'in `ThreeEvent<MouseEvent>` olay sistemi aktif değilse, tanımlı `handleClick` fonksiyonu hiçbir zaman tetiklenmez, kullanıcı tıklamaları algılanamaz.
[Aksiyom 4]: Eğer `BentPlaneMaterial` bağımlılığı modül yüklendiğinde mevcut değilse, tüm bileşen çalışmaz, 3B sahneye geometri eklenemez ve bütün sahne render hatası alır.
[Aksiyom 5]: Eğer `position` prop'u 3 boyutlu sayı dizisi formatında (tam olarak 3 adet sayı içerecek şekilde) aktarılmazsa, geometri sahne üzerinde tanımsız konumda render edilir, diğer elemanlarla örtüşme veya tamamen görünmeme sorunu oluşur.

---

## FONKSIYON DETAYLARI

### BentPlaneGeometry
**Ne yapar**: 3B ortamda bireysel kavisli ürün kartı olarak çalışan React işlevsel bileşenidir. Ürünlerin 3D sahnelerinde görsel temsilini oluşturur, ürün görselini kavisli düzlem geometrisi üzerine yerleştirerek kullanıcının görüntülemesine sunar. Bileşenin konum yönetimi üst bileşen olan ProductCard tarafından gerçekleştirilir.
**Nasıl yapar**: Gelen prop'ları kullanarak kavisli düzlem geometrisini oluşturur, prop olarak alınan görseli geometri yüzeyine yükler ve benzersiz id değeri ile bileşeni tanımlar. Konumunu üst bileşenden aldığı position değerine göre 3D sahnesine yerleştirir, kendi içinde konum ayarlaması yapmak yerine üst bileşenin kontrolündeki koordinatları kullanır.
**Parametreler**:
- image: BentPlaneGeometryProps tipinde prop — Ürün kartının kavisli yüzeyine yüklenecek olan ürün görselinin referansı veya dosyasıdır
- id: BentPlaneGeometryProps tipinde prop — Bileşene atanan benzersiz kimliktir, olay yönetimi ve bileşen takibi için kullanılır
- position: number[] — Bileşenin 3D sahnesindeki x, y, z koordinatlarını tutan dizi, varsayılan değeri [0, 0, 0]'dir, konum yönetimi tamamen üst bileşen ProductCard tarafından yapılır
**Dönüş**: React.FC<BentPlaneGeometryProps> türünde işlevsel React bileşeni döndürür, bu bileşen 3B ortamda kullanılmak üzere tasarlanmış kavisli ürün kartı geometrisini sağlar.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx::BentPlaneGeometry
- **params**: image, id, position = [0, 0, 0]
- **ic_degiskenler**:
  - `router` — Next.js yönlendirme işlemleri için useRouter hook'u ile oluşturulan router nesnesi
  - `meshRef` — Three.js mesh nesnesine erişmek için kullanılan useRef referansı, türü THREE.Mesh
  - `materialRef` — Shader malzemesine erişmek için kullanılan useRef referansı, türü THREE.ShaderMaterial
  - `scroll` — @react-three/drei'nin useScroll hook'u ile döndürülen kaydırma konum nesnesi
  - `hovered` — Fare imlecinin mesh üzerinde olup olmadığını takip eden state değişkeni
  - `setHover` — hovered state değerini güncellemek için kullanılan useState tarafından döndürülen setter fonksiyonu
  - `useCursor` — Fare imlecini hover durumuna göre değiştirmek için kullanılan @react-three/drei hook'u, parametre olarak hovered değeri alır
  - `texture` — Ürün görselini yüklemek için THREE.TextureLoader ile oluşturulan, useMemo ile önbelleğe alınan texture nesnesi
  - `texture.colorSpace` — Texture'ın renk uzayını SRGB olarak ayarlamak için kullanılan özellik
  - `useFrame` — Her frame'de güncelleme çalıştırmak için kullanılan @react-three/fiber hook'u
  - `handleClick` — Mesh tıklandığında tetiklenen olay işleyici fonksiyonu
  - `position[0], position[1], position[2]` - Mesh'in 3D konumunu belirten dizi elemanları, JSX'te mesh prop'una iletilir
- **Dönüş**: JSX (React Three Fiber mesh bileşeni)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx::useFrame_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `meshRef.current` — useRef ile bağlanan THREE.Mesh nesnesinin güncel değeri
  - `materialRef.current` — useRef ile bağlanan THREE.ShaderMaterial nesnesinin güncel değeri
  - `materialRef.current.uniforms.uScrollOffset` — Shader'ın kaydırma ofsetini tutan uniform değişkeni
  - `scroll.offset` — useScroll tarafından döndürülen mevcut kaydırma ofset değeri
  - `materialRef.current.uniforms.uHover` — Shader'ın fare üzerindeyken kullanılacak durumunu tutan uniform değişkeni
  - `THREE.MathUtils.lerp` - İki değer arasında yumuşak geçiş sağlamak için kullanılan Three.js utility fonksiyonu
  - `hovered` - Ana bileşende tanımlanan fare üzerindeyken olma durumu state'i
  - `targetScale` - Hover durumuna göre mesh'in ulaşması gereken ölçek değeri (1.1 veya 1.0)
  - `meshRef.current.scale.x` - Mesh'in X ekseni ölçek değeri, yumuşak ölçekleme için güncellenir
  - `meshRef.current.scale.y` - Mesh'in Y ekseni ölçek değeri, yumuşak ölçekleme için güncellenir
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx::handleClick
- **params**: e: ThreeEvent<MouseEvent>
- **ic_degiskenler**:
  - `e.stopPropagation` - Tıklama olayının üst elemanlara yayılmasını engellemek için kullanılan olay metodu
  - `router.push` - Yeni rotaya yönlendirmek için kullanılan Next.js router metodu
  - `Routes.category` - Uygulama rotaları nesnesinin kategori sayfası rotası üretici fonksiyonu
  - `id` - Ana bileşene parametre olarak geçilen ürün kimliği, kategori rotası oluşturmak için kullanılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\products\BentPlaneGeometry.tsx
  function: src\components\products\BentPlaneGeometry.tsx::BentPlaneGeometry
  function: src\components\products\BentPlaneGeometry.tsx::handleClick

---

## DISA AKTARILANLAR (EXPORTS)
  export: BentPlaneGeometry