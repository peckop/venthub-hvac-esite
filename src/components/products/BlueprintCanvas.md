---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: fb3513205dba7fa7
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 38622d63184c12d0
  style_tokens: 31f4acfd42638e52
generated_at: 2026-06-12T10:22:51Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ürün bileşenleri içinde yer alan, ürün görsellerini ve mavi baskıları sunmak için tasarlanmış iki bağımsız React bileşenini barındırır. Temel amacı, ürün sayfalarının farklı bölümlerinde (örneğin ana galeri veya öne çıkan kartlar alanı) esnek ve görsel açıdan çekici bir gösterim sağlamaktır.

## Fonksiyon Grupları
### Ana Ürün Görseli Gösterimi
Ürünün temel görselini veya mavi baskı resmini, genellikle ürün detay sayfalarında ana odak noktası olarak sunmak için kullanılan temel bileşendir.
- BlueprintCanvas

### Sinematik Vurgu Kartı
Görselleri, animasyonlar ve holografik efektlerle zenginleştirerek, ürünün belirli özelliklerini veya promosyon görsellerini estetik bir kart formatında öne çıkarmak için kullanılan yardımcı bileşendir.
- CinematicCard

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel prop bağımlılıkları ve harici bileşen çağrıları varsayımları tanımlanmıştır.

[Aksiyom 1]: Eğer `CinematicCard` bileşenine geçerli bir `image` prop'u (URL veya dosya yolu) sağlanmazsa, bileşen hata verir veya boş/görsel içermeyen bir kart render eder.
[Aksiyom 2]: Eğer `BlueprintCanvas` bileşenine geçerli bir `image` prop'u (URL veya dosya yolu) sağlanmazsa, bileşen hata verir veya boş/mavi baskı içermeyen bir tuval render eder.
[Aksiyom 3]: Eğer `HolographicMaterial` çağrılamıyorsa (örn. Three.js/React Three Fiber ortamı yoksa veya modül bulunamıyorsa), holografik efekt uygulanamaz ve ilgili bileşenlerin görsel performansı önemli ölçüde düşer veya hata verir.

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

### [N1_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::CinematicCard
- **params**: `{ image }` — string, 3D kart üzerinde gösterilecek görselin yolu
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` ile yüklenen Three.js texture nesnesi, `holographicMaterial`'a `uTexture` olarak geçirilir
  - `meshRef` — `useRef<Mesh>(null)`, ana kart mesh'ine referans; `useFrame` içinde rotation ve material erişimi için kullanılır
- **ic_degiskenler (useFrame callback içinde)**:
  - `state` — `useFrame` callback parametresi, Three.js frame state nesnesi; `state.mouse` ve `state.clock` erişimi sağlar
  - `x` — `state.mouse.x` destructured değeri, fare imlecinin yatay normalized konumu (-1 ile 1 arası)
  - `y` — `state.mouse.y` destructured değeri, fare imlecinin dikey normalized konumu (-1 ile 1 arası)
  - `material` — `meshRef.current.material` cast edilmiş `ShaderMaterial` nesnesi; `uTime` uniform güncellenmesi için kullanılır
- **Dönüş**: JSX — `<Float>` sarmalayıcısı içinde holografik materyal ve parlama efektli 3D kart

### [N2_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::BlueprintCanvas
- **params**: `{ image }` — string, canvas'a geçirilecek görselin yolu
- **ic_degiskenler**: yok (fonksiyon gövdesinde herhangi bir değişken tanımlanmamıştır)
- **Dönüş**: JSX — React Three Fiber `Canvas` içeren `CinematicCard` sarmalayan, arka plan grid deseni, köşe teknik dekoratif UI katmanları ve vignette overlay ile tamamlanmış sarmalayıcı div bileşeni

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