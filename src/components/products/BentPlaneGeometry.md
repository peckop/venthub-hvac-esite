---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BentPlaneGeometry.tsx
skeleton_hash: 6c4c6bb1b0f73109
entity_hashes:
  func:BentPlaneGeometry: 925b96f61263e22a
  func:handleClick: bffc3b12eebc550c
  overview: 8878452264c689a5
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-12T10:22:31Z
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
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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
        uTexture: new Texture(),
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BentPlaneGeometry.tsx::BentPlaneGeometry
- **params**: `{ image, id, position = [0, 0, 0] }`
  - `image` — texture image source URL, TextureLoader ile yüklenir
  - `id` — ürün/kategori ID'si, tıklanınca navigasyonda kullanılır
  - `position` — mesh'in 3D pozisyonu, varsayılan [0, 0, 0]
- **ic_degiskenler**:
  - `router` — Next.js useRouter hook'u, sayfa yönlendirmesi için
  - `meshRef` — useRef<Mesh>(null), Three.js mesh elementine referans, scale animasyonu için
  - `materialRef` — useRef<ShaderMaterial>(null), shader material'a referans, uniform güncellemeleri için
  - `scroll` — useScroll() drei hook'u, sayfa kaydırma offset'ini takip eder
  - `hovered` — useState(false), fare üstüne gelme durumu boolean state
  - `texture` — useMemo(() => new TextureLoader().load(image), [image]), yüklenen Three.js Texture nesnesi
  - `texture.colorSpace` — SRGBColorSpace değerine atanır, doğru renk uzayı için
  - `handleClick` — tıklama olayı handler fonksiyonu
- **Dönüş**: JSX element (mesh bileşeni)

### [N2_NASIL] AST Pointer: BentPlaneGeometry.tsx::useFrame callback
- **params**: yok (anonim arrow function)
- **ic_degiskenler**:
  - `meshRef.current` — varsa mesh referansı, erişim guard kontrolü yapılır
  - `materialRef.current` — varsa material referansı, erişim guard kontrolü yapılır
  - `materialRef.current.uniforms.uScrollOffset` — shader uniform'u, scroll offset değeri atanır
  - `materialRef.current.uniforms.uHover` — shader uniform'u, hover durumu lerp ile interpolasyon yapılır
  - `scroll.offset` — mevcut sayfa kaydırma offset değeri
  - `hovered` — hover state boolean değeri, 1 veya 0'a lerp edilir
  - `targetScale` — const, hovered durumuna göre 1.1 veya 1.0 ölçek değeri
  - `meshRef.current.scale.x` — mesh'in X ekseni ölçeği, lerp ile animasyon
  - `meshRef.current.scale.y` — mesh'in Y ekseni ölçeği, lerp ile animasyon
- **Dönüş**: yok (her frame çağrılır, uniform ve scale güncelleme yan etkisi)

### [N3_NASIL] AST Pointer: BentPlaneGeometry.tsx::handleClick
- **params**: `(e: ThreeEvent<MouseEvent>)` — Three.js farenin tıklama olayı
- **ic_degiskenler**:
  - `e` — ThreeEvent<MouseEvent> nesnesi, tıklama eventi
  - `router` — component scope'tan kapanır, Next.js yönlendirme için
  - `id` — prop'tan kapanır, category route oluşturmada kullanılır
- **Dönüş**: yok (e.stopPropagation() ile olay yayılımını durdurur, router.push ile navigasyon yan etkisi)

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