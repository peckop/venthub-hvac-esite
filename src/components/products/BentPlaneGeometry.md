---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx
skeleton_hash: 0f092659c19f1b1f
entity_hashes:
  func:BentPlaneGeometry: 925b96f61263e22a
  func:handleClick: bffc3b12eebc550c
  overview: 8aa34a9d784b08a2
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:31Z
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

Bu modül, React-three-fiber kullanarak Three.js sahasında eğilmiş düzlem geometrisi render eden bir bileşendir ve aşağıdaki mimari varsayımlarla çalışır:

[Aksiyom 1]: Eğer `image` parametresi geçerli bir görsel kaynağı içermiyorsa (texture, URL veya asset), `BentPlaneMaterial` bileşeni doğru dota uygulanamaz ve geometri boş veya eksik görünümle render edilir.

[Aksiyom 2]: Eğer `BentPlaneMaterial` bileşeni çağrılmazsa veya hatalı parametrelerle çağrılırsa, geometri malzemesi oluşturulamaz ve 3B nesne görünmez hale gelir.

[Aksiyom 3]: Eğer `position` parametresi geçerli bir [x, y, z] vektör dizisi içermiyorsa, bileşen varsayılan `[0, 0, 0]` konumunu kullanır ve bu durum sahada beklenmeyen konumlanmaya yol açabilir.

[Aksiyom 4]: Eğer `id` parametresi benzersiz bir tanımlayıcı sağlamıyorsa, React-three-fiber sahasındaki nesne tanımlama ve tıklama olayları çakışabilir veya yanlış eşleşebilir.

[Aksiyom 5]: Eğer `handleClick` fonksiyonuna geçerli bir `ThreeEvent<MouseEvent>` nesnesi sağlanmıyorsa, tıklama olayı işlenemez ve bileşen interaktif tepki veremez.

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

### [N1_NASIL] AST Pointer: BentPlaneGeometry.tsx::BentPlaneGeometry
- **params**: `{ image, id, position = [0, 0, 0] }`
  - `image` — yüklenmesi gereken dokunun URL'isi
  - `id` — ürünün benzersiz tanımlayıcısı, tıklanınca route'a gönderilir
  - `position` — mesh'in 3D sahnedeki [x, y, z] koordinatları, varsayılan [0, 0, 0]
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi, programlı navigasyon için
  - `meshRef` — `useRef<THREE.Mesh>(null)`, Three.js mesh DOM'a erişmek için ref
  - `materialRef` — `useRef<THREE.ShaderMaterial>(null)`, shader material'a erişmek için ref
  - `scroll` — `useScroll()` hook'undan dönen scroll nesnesi, `.offset` ile mevcut scroll oranı alınır
  - `hovered` — `useState(false)`, imlecin mesh üzerinde olup olmadığını tutan boolean state
  - `texture` — `useMemo(() => new THREE.TextureLoader().load(image), [image])`, image parametresinden yüklenen THREE.Texture, `colorSpace` SRGB olarak ayarlanır
  - `handleClick` — `(e: ThreeEvent<MouseEvent>) => { ... }` tıklama olayını işleyen callback, `e.stopPropagation()` ve `router.push(Routes.category(id))` çağırır
- **Dönüş**: JSX — `<mesh>` elementi, içinde `<planeGeometry>` ve `<bentPlaneMaterial>` barındırır

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