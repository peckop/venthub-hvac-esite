---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: c3b37221286447d4
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 119d927fb341d61c
  style_tokens: 31f4acfd42638e52
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ürün bileşenleri ailesinde yer alarak, ürünlere ait görsellerin ve mavi baskıların kullanıcı arayüzünde sunulması için tasarlanmış iki bağımsız React bileşenini içerir. Bileşenler, ürün sayfalarının farklı bölümlerinde – ana görsel alanı ve vurgulanmış kart formatı – esnek ve estetik bir görsel gösterim sağlar.

## Fonksiyon Grupları
### Ana Görsel Gösterim Bileşeni
Ürün mavi baskı görsellerini veya ana ürün resmini, genellikle ürün detay sayfalarında tam genişlikte veya belirli bir alanda sunmak için kullanılan temel bileşendir.
- BlueprintCanvas

### Vurgulu Sinematik Kart Bileşeni
Görselleri, havada süzülen animasyonlar ve holografik efektlerle zenginleştirilmiş estetik bir kart formatında sunarak, ürünün öne çıkan özelliklerini veya promosyon görsellerini vurgulamak için kullanılan yardımcı bileşendir.
- CinematicCard

---

## AXIOMS – Mimari Varsayımlar
Bu modül, ürün görsellerinin ve holografik efektlerin etkili bir şekilde sunulmasına dayanır.

[Aksiyom 1]: Eğer `BlueprintCanvas` veya `CinematicCard` bileşenine geçerli bir `image` kaynağı (URL, dosya yolu veya modül) verilmemişse, bileşen bir görsel içeriği gösteremez ve potansiyel olarak kırık bir resim simgesi veya boş alan ile sonuçlanır.

[Aksiyom 2]: Eğer `image` prop'u geçerli bir görsel formatı (örn. jpg, png, svg) veya tarayıcı tarafından çözülebilir bir kaynak içermiyorsa, bileşen görseli gösteremez ve varsayılan tarayıcı kırık resim davranışını sergiler.

[Aksiyom 3]: Eğer `HolographicMaterial` modül sabiti doğru bir şekilde oluşturulmamış veya调用 edilemiyorsa, `BlueprintCanvas` bileşeninin holografik/parıltılı görsel efektleri uygulanamaz ve bileşen düz, efektsiz bir görsel gösterir.

---

## FONKSİYON DETAYLARI

### CinematicCard
**Ne yapar**: Bu fonksiyon, verilen bir görseli derinlik efekti, süzülme animasyonu ve holografik overlay (katman) ile sinematik bir 3D kart formatında render eder. Kullanıcıya interaktif ve görsel olarak zengin bir bileşen sunmayı amaçlar.

**Nasıl yapar**: Fonksiyon, React functional component yapısında tasarlanmıştır. `image` prop'u alarak başlar. İç mantığında, CSS transform ve animation özelliklerini (perspective, rotateX, rotateY, translateZ vb.) kullanarak 3D derinlik hissi yaratır. Hover veya其他 etkileşimlerle süzülme (floating) animasyonunu tetikleyebilir. Son olarak, yarı saydam bir holografik overlay efektini görselin üzerine bindirerek sinematik görünümü tamamlar.

**Parametreler**:
- image: string — 3D kart içinde gösterilecek görselin URL'si veya kaynak yolu.

**Dönüş**: `React.FC<{ image: string }>` tipinde bir React functional component döndürür.

### BlueprintCanvas
**Ne yapar**: Bu fonksiyon, bir mühendislik veya mimari plan (blueprint) görselini interaktif bir tuval (canvas) üzerinde göstermek ve muhtemelen üzerinde çizim veya vurgulama işlemleri yapmak için kullanılır.

**Nasıl yapar**: Fonksiyon, `BlueprintCanvasProps` arayüzünden türetilmiş prop'ları alır. Temel olarak bir `image` prop'u kullanarak arka planda bir mühendislik planı görseli yükler. Bu görseli bir `<canvas>` veya benzeri bir React bileşeni içinde render ederek, kullanıcının üzerinde yakınlaştırma, kaydırma veya çizim yapabilmesini sağlayacak interaktif bir alan oluşturur.

**Parametreler**:
- image: string — Blueprint tuvalinde arka plan olarak görüntülenecek mühendislik planı görselinin URL'si veya yolu.

**Dönüş**: `React.FC<BlueprintCanvasProps>` tipinde bir React functional component döndürür. `BlueprintCanvasProps` arayüzünün tam tanımı dış kaynakta yer almaktadır.

---

## INTERFACES

### BlueprintCanvasProps
- `image: string`

---

## SABİTLER
- **HolographicMaterial** (call) — `shaderMaterial(
    {
        uTime: 0,
        uTexture: null,
        u...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: BlueprintCanvas.tsx::CinematicCard
- **params**: `{ image }` — kart üzerinde gösterilecek görselin URL/path'i (string)
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` ile yüklenen THREE.Texture nesnesi, kart üzerindeki görsel dokuyu temsil eder; holographicMaterial'a `uTexture` olarak geçirilir
  - `meshRef` — `useRef<THREE.Mesh>(null)` ile oluşturulan Ref nesnesi, ana kart mesh'ine (`<mesh ref={meshRef}>`) bağlanır; useFrame içinde rotation ve material erişimi için kullanılır
  - `state` — useFrame callback parametresi, React Three Fiber'ın her frame'de sağladığı durum nesnesi; `state.mouse` (fare pozisyonu) ve `state.clock` (geçen süre) içerir
  - `x` — `state.mouse.x`'ten destructured değer, mouse'un yatay pozisyonu; `meshRef.current.rotation.y` hesaplamasında parallax efekti için kullanılır
  - `y` — `state.mouse.y`'den destructured değer, mouse'un dikey pozisyonu; `meshRef.current.rotation.x` hesaplamasında parallax efekti için kullanılır
  - `material` — `meshRef.current.material`'ın `THREE.ShaderMaterial` tipine cast edilmiş hali; holographic shader'ın uniform'larına (`uTime`) erişim sağlamak için kullanılır
- **Dönüş**: JSX — `<Float>` sarmalayıcısı içinde holographic dokulu ana kart mesh'i ve arkasında ambient glow mesh'inden oluşan React element ağacı

---

## NODE ID STANDARD

  file: src\components\products\BlueprintCanvas.tsx
  function: src\components\products\BlueprintCanvas.tsx::CinematicCard
  function: src\components\products\BlueprintCanvas.tsx::BlueprintCanvas

---

## DISA AKTARILANLAR (EXPORTS)
  export: BlueprintCanvas
  export: CinematicCard

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-surface-darkest`, `bg-white/10`, `bg-white/20`, `border-white/5`, `text-cyan-500`, `text-right`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `absolute`, `bottom-6`, `flex`, `flex-col`, `gap-1`, `gap-2`, `h-0.5`, `h-1.5`, `h-full`, `h-px`, `items-center`, `items-end`, `justify-between`, `justify-end`, `left-6`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `font-black`, `group`, `inset-0`, `leading-none`, `mt-1`, `opacity-20`, `pointer-events-none`, `rounded-3xl`, `rounded-full`, `tracking-widest`, `uppercase`