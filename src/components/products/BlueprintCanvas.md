---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: eb4c5010ca026ec1
generated_at: 2026-05-23T22:25:55Z
---

## Genel Bakış
Venthub HVAC projesinin ürün bileşenleri ailesinde yer alan bu modül, ürünlere ait mavi baskı (blueprint) ve görselleri kullanıcı arayüzünde sunmak için tasarlanmış React bileşenlerini barındırır. Ürün görsellerinin hem ana gösterim alanında hem de vurgulu kart formatında sunulmasını sağlayarak ürün sayfalarının görsel ihtiyaçlarını karşılar.

## Fonksiyon Grupları
### Ana Mavi Baskı Gösterim Bileşeni
Ürün mavi baskı görsellerini ana kullanıcı arayüzü üzerinde sorunsuz bir şekilde sunan ana bileşendir, proje içerisinde ürün detay sayfalarında doğrudan kullanıma sunulur.
- BlueprintCanvas

### Vurgulu Sinematik Kart Bileşeni
Görselleri estetik bir kart formatında sunan yardımcı bileşendir, ürün görsellerinin öne çıkarılması gereken özel bölümlerde kullanılır.
- CinematicCard

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ürün bileşenleri modülü, içerdiği iki arayüz bileşeni ve holografik materyal bağımlılığı ile çalışır, tüm işlevlerini yerine getirmesi için dışarıdan iletilen prop'ların ve bağımlı modüllerin eksiksiz olması zorunludur.

[Aksiyom 1]: Eğer BlueprintCanvas componentine zorunlu image prop'u iletilmezse, ana işlevi olan şablon görüntüleme işlevini yerine getiremez, kullanıcı arayüzünde boş içerik alanı oluşur.
[Aksiyom 2]: Eğer CinematicCard componentine zorunlu image prop'u iletilmezse, kart üzerindeki medya içeriği görüntülenemez, arayüzde boş kart görünümü ortaya çıkar.
[Aksiyom 3]: Eğer modülün kullandığı HolographicMaterial çağrılabilir materyal modülü mevcut değilse, tüm bileşenlerin holografik görsel stili bozulur, görsel işlevsellik devre dışı kalır.

---

## FONKSIYON DETAYLARI

### CinematicCard
**Ne yapar**: Aldığı görseli üç boyutlu derinlik etkisi, havada süzülen float animasyonu ve holografik kaplama ile sinematik bir kart olarak ekranda render eder. Özellikle ürün görselleri gibi dikkat çekilmesi gereken içerikleri vurgulamak için tasarlanmış bir React fonksiyonel bileşenidir. Kullanıcı deneyimini artırmak için statik görsellerden farklı olarak dinamik efektler ekleyerek içeriğin öne çıkmasını sağlar.
**Nasıl yapar**: CSS tabanlı 3D perspektif dönüşleri uygulayarak kartın derinlik hissi yaratmasını sağlar, ana görselin arkasında hafif bulanıklaştırma efekti ve önüne eklediği yarı saydam ışık kırılma katmanları ile holografik etkiyi oluşturur. Sürekli düşük genlikli yukarı-aşağı hareket animasyonu ile kartın havada süzülüyormuş gibi görünmesini sağlar, tüm bu efektleri React bileşeninin yaşam döngüsü boyunca stabilize bir şekilde çalıştırır.
**Parametreler**:
- name: image, type: string — Kart içerisinde gösterilecek olan ana görselin geçerli kaynak URL'si veya yerel dosya yolu
**Dönüş**: Sadece string türünde image prop'unu kabul eden bir React fonksiyonel bileşeni (React.FC) döndürür, bu bileşen tüm tanımlı görsel efektlerini uygulayarak içeriği kullanıcıya sunar.

### BlueprintCanvas
**Ne yapar**: Verilen teknik plan, şema veya blueprint görselini HTML Canvas tabanlı bir React bileşeni içerisinde kullanıcıya sunar, VentHub HVAC projesinin ürünler bölümündeki teknik çizimleri görüntülemek için özel olarak geliştirilmiştir. Proje içindeki ürünlere ait mühendislik çizimlerini standart bir yapıda sunmak için kullanılan temel görüntüleme bileşenidir. Kullanıcının teknik çizimleri rahatça incelemesini sağlayacak altyapıyı hazırlar.
**Nasıl yapar**: HTML Canvas API'sini kullanarak aldığı görseli canvas elementine yükler, çizimin ölçeklenmesi, kaydırılması gibi temel kullanıcı etkileşimlerini yönetmek için gereken çizim mantığını çalıştırır. Tanımlı olduğu BlueprintCanvasProps tipinden gelen tüm ek özellikleri bileşen içerisinde yönlendirerek görüntüleme işlevselliğini özelleştirir, projenin genel React bileşen yapısına uyumlu şekilde çalışır.
**Parametreler**:
- name: image, type: string — Canvas üzerinde render edilecek olan teknik blueprint, şema veya plan görselinin geçerli kaynak URL'si veya yerel dosya yolu
**Dönüş**: BlueprintCanvasProps arayüzünü tanımlayan tüm prop'ları kabul eden bir React fonksiyonel bileşeni (React.FC) döndürür, bu bileşen içerisine aldığı prop'ları kullanarak teknik çizimleri kararlı bir şekilde canvas üzerinde görüntüler.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx::CinematicCard
- **params**: [image: string]
- **ic_degiskenler**:
  - `texture` — `useTexture` hook'u ile parametre olarak gelen görsel URL'sinden yüklenen 3B doku, holografik malzemeye iletilir
  - `meshRef` — `THREE.Mesh` tipinde React referansı, ana kartın 3B mesh elemanına erişmek için `useRef` ile oluşturulur
- **Dönüş**: Float bileşeni ile sarmalanmış, 3B kart ve arka plan parlaması içeren React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx::useFrame_animation_callback
- **params**: [state: @react-three/fiber.RootState]
- **ic_degiskenler**:
  - `state.mouse.x` — fare konumunun x koordinatı, kartın y ekseni rotasyonunu hesaplamak için kullanılır
  - `state.mouse.y` — fare konumunun y koordinatı, kartın x ekseni rotasyonunu hesaplamak için kullanılır
  - `material` — `meshRef` ile erişilen ana kart malzemesi, `THREE.ShaderMaterial` olarak tip dönüşümü yapılır, shader zamanını güncellemek için kullanılır
  - `material.uniforms.uTime.value` — shader malzemesinin zaman üniforması, her karede toplam geçen süre ile güncellenir
  - `state.clock.getElapsedTime()` — uygulamada geçen toplam süreyi döndüren metod, shader zamanı güncellemesinde kullanılır
- **Dönüş**: yok (sadece fare konumuna göre kart rotasyonu ve shader zamanı güncellemesi gibi yan etkiler üretir, void fonksiyon)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx::BlueprintCanvas
- **params**: [image: string]
- **ic_degiskenler**: hiçbiri, fonksiyon gövdesinde yerel değişken tanımlanmamış, yalnızca parametre olarak alınan `image` değeri kullanılır
- **Dönüş**: Mavi baskı (blueprint) görselleştirmesi için sarmalanmış ana div bileşeni, içinde 3B Canvas, arka plan grid, köşe dekorları ve vint uygulamaları içeren React JSX elementi

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
- **shadow:** `shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]`
- **height:** `h-[1px]`, `h-[2px]`, `min-h-[400px]`
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** (yok)

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-surface-darkest`, `bg-white/10`, `bg-white/20`, `border-white/5`, `text-cyan-500`, `text-right`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `absolute`, `bottom-6`, `flex`, `flex-col`, `gap-1`, `gap-2`, `h-1.5`, `h-full`, `items-center`, `items-end`, `justify-between`, `justify-end`, `left-6`, `overflow-hidden`, `relative`
- **Responsive:** (yok)
