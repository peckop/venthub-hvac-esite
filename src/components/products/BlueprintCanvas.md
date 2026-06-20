---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: 82bf90319b4b4675
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 4cbade83072ab96e
  style_tokens: 31f4acfd42638e52
generated_at: 2026-06-19T20:47:32Z
---

## Genel Bakış
Bu modül, ürünlerin görsel sunumunu güçlendirmek için kullanılan iki bağımsız ve odaklı React bileşenini içerir. Birincil amacı, ürün görsellerini farklı bağlamlarda görsel olarak çekici ve etkileşimli bir şekilde sunmaktır. Modül, bağımsız işlevsellikler sunan iki temel bileşenden oluşur ve ürün vitrini ile promosyon alanlarında estetik bir deneyim yaratmayı hedefler.

## Fonksiyon Grupları
### Etkileşimsel Vurgu Kartı
Ürün görsellerini veya promosyon görsellerini, 3D derinlik, animasyon ve holografik efektlerle zenginleştirerek öne çıkaran ve estetik bir vurgu yapan yardımcı bileşendir. Kullanıcı etkileşimlerine (örneğin, üzerine gelme) tepki vererek sinematik bir deneyim sunar.
- CinematicCard

### Odaklanmış Ürün Görseli Bileşeni
Ürünün ana görselini veya teknik çizimini, genellikle ürün detay sayfalarında büyük ve temiz bir şekilde sergilemek için kullanılan temel bileşendir. Görseli öne çıkararak bilgilendirici ve odaklanmış bir sunum sağlar.
- BlueprintCanvas

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, sunulan fonksiyon imzaları ve belgeye dayalı olarak, modülün doğru çalışması için aşağıdaki mimari varsayımlar tanımlanmıştır. Varsayımlar, yalnızca verilen fonksiyon imzaları ve referans alınan modül yapısından (eski belge) çıkarılabilecek temel gereksinimlere odaklanır.

**[Aksiyom 1]:** Eğer `BlueprintCanvas` veya `CinematicCard` bileşenine iletilen `image` parametresi geçerli bir metin (string) değilse (örn. `null`, `undefined`, boş dize veya yanlış tipte bir değer), bileşen görüntüyü doğru şekilde render edemez veya hata verir.

**[Aksiyom 2]:** Eğer `CinematicCard` bileşeni, eski dokümanda belirtildiği şekilde 3D derinlik ve holografik efektler için `HolographicMaterial` bileşenini kullanıyorsa, bu materyalin veya benzer bir render mekanizmasının uygulama ortamında (ör. Three.js, WebGL desteği) bulunmaması veya çağrının başarısız olması durumunda, bileşenin görsel efektleri bozulur veya bileşen hata verir.

**[Aksiyom 3]:** Modül, iki bağımsız bileşen (`BlueprintCanvas` ve `CinematicCard`) içermektedir. Eğer bu bileşenlerin bağımsız çalışması için gerekli olan alt bileşenler veya yardımcı modüller (ör. `HolographicMaterial` veya benzeri) bağımsız olarak dışarıdan sağlanmıyorsa (içe aktarılmıyorsa), modül derleme veya çalışma zamanı hatası ile karşılaşır.

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

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ./3d/core::VentHubCanvas
- import: @react-three/drei::Float
- import: @react-three/drei::shaderMaterial
- import: @react-three/drei::useTexture
- import: @react-three/fiber::extend
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::Suspense
- import: react::useRef
- import: three::MathUtils
- import: three::type { Mesh, ShaderMaterial,Texture }

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
- **params**: ({ image })
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` ile yüklenen Three.js texture nesnesi, holografik materyale uygulanır
  - `meshRef` — `useRef<Mesh>(null)` ile oluşturulan referans, mesh elemanına erişim sağlar
  - `state` — `useFrame` callback parametresi, frame güncellemelerinde mouse ve clock verilerini sağlar
  - `x` — `state.mouse` destructuring'inden gelen mouse X koordinatı, mesh rotasyonunu etkiler
  - `y` — `state.mouse` destructuring'inden gelen mouse Y koordinatı, mesh rotasyonunu etkiler
  - `material` — `meshRef.current.material` ifadesinden ShaderMaterial'a cast edilen materyal, uniform güncellemeleri için kullanılır
- **Dönüş**: JSX elemanı (Float ile sarılmış 3D sahne)

### [N2_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::BlueprintCanvas
- **params**: ({ image })
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan elde edilen çeviri fonksiyonu, ürün metinlerini uluslararası dilde döndürür
- **Dönüş**: JSX elemanı (VentHubCanvas içinde CinematicCard barındıran tam sayfa bileşeni)

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