---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: 0ed000a95de9a55b
entity_hashes:
  func:MegaMenu3DBackground: bb72cddf66cbd5a0
  overview: bbf3490d865f5caf
  style_tokens: 487664132884f59c
generated_at: 2026-06-11T16:14:54Z
---

## Genel Bakış
Bu modül, mega menü bileşeninin arka planında üç boyutlu bir görsel efekt sunan bir React bileşenini tanımlar. Bileşen, verilen kategori slug'ına göre 3D bir model ve metin okunabilirliğini artıran bir gradyan overlay oluşturarak menünün arka planını render eder.

## Fonksiyon Grupları
### Ana Bileşen (3D Arka Plan)
Mega menünün arka planını oluşturmak için gerekli olan 3D model ve gradyan overlay'ı bir arada sunan temel React bileşenini tanımlar.
- MegaMenu3DBackground

---



---

## FONKSİYON DETAYLARI

### MegaMenu3DBackground
**Ne yapar**: Bu fonksiyon, bir MegaMenü dropdown bileşeninin arka planını oluşturmak için kullanılan bir React functional bileşenidir. Temel amacı, menü içeriğinin arkasına etkileyici bir 3D görsel ve okunabilirlik sağlayan bir gradyan katmanı yerleştirmektir.

**Nasıl yapar**: Fonksiyon, verilen `categorySlug` prop'una göre dinamik olarak bir 3D model veya tema yükleyerek arka planı oluşturur. Bileşenin üst kısmına büyük bir 3D görsel yerleştirirken, alt kısımda koyu bir gradyan efekti uygular. Bu gradyan, üzerine yerleştirilen menü metinlerinin okunabilirliğini önemli ölçüde artırır.

**Parametreler**:
- `categorySlug`: string — Arka planın görsel temasını belirleyen kategori slug'ı. Bu parametre, 3D modelin veya arka planın içeriğini belirlemek için kullanılır.
- `MegaMenu3DBackgroundProps`: object — Bileşenin alabileceği diğer özellikleri tanımlayan props nesnesi.

**Dönüş**: `React.FC<MegaMenu3DBackgroundProps>` tipinde bir React functional bileşeni döndürür.

---

## INTERFACES

### MegaMenu3DBackgroundProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/MegaMenu3DBackground.tsx::MegaMenu3DBackground
- **params**:
  - `categorySlug` — PropTypes destructuring'den gelen kategori slug değeri; Category3DIcon bileşenine hangi kategori ikonunun gösterileceğini belirtir
- **ic_degiskenler**: yok (fonksiyon gövdesinde herhangi bir `const`/`let`/`var` değişken tanımı bulunmamaktadır; doğrudan JSX döner)
- **Dönüş**: React JSX Fragment — Üst %75 alanı kaplayan 3D Canvas (ambientLight, directionalLight, Category3DIcon, OrbitControls ile) ve alttan yukarıya doğru beyaz gradient overlay div'inden oluşan React Element Tree
- **Yan etkiler**: Yok (stateless, side-effect-free saf bileşen)
- **JSX içinde erişilen prop**: `categorySlug` — Category3DIcon'a `categorySlug={categorySlug}` olarak aktarılır
- **Canvas yapılandırma değerleri**: `camera.position = [0, 0.1, 2.2]`, `camera.fov = 40`, `dpr = [1, 1]`, `frameloop = "demand"`
- **OrbitControls yapılandırma değerleri**: `enableZoom = false`, `enablePan = false`, `enableRotate = false`, `autoRotate = true`, `autoRotateSpeed = 1.5`
- **Category3DIcon prop değerleri**: `categorySlug` (prop'tan), `scale = 0.9`
- **Light değerleri**: `ambientLight.intensity = 0.8`, `directionalLight.position = [5, 5, 5]`, `directionalLight.intensity = 1`

---

## NODE ID STANDARD

  file: src\components\navigation\MegaMenu3DBackground.tsx
  function: src\components\navigation\MegaMenu3DBackground.tsx::MegaMenu3DBackground

---

## DISA AKTARILANLAR (EXPORTS)
  export: MegaMenu3DBackground

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-t`, `from-white/60`, `to-transparent`, `via-transparent`
- **Layout:** `absolute`, `from-white/60`, `h-3/4`, `left-0`, `right-0`, `top-0`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `inset-0`, `pointer-events-none`