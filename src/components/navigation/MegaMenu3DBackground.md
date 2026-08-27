---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: 0d987d56b09d771a
entity_hashes:
  func:MegaMenu3DBackground: bb72cddf66cbd5a0
  overview: 64226aa5800abc8b
  style_tokens: 487664132884f59c
generated_at: 2026-08-27T13:23:16Z
---

## Genel Bakış
Bu modül, mega menü bileşeninin arka planında üç boyutlu bir görsel efekt sunan bir React bileşenini tanımlar. Bileşen, verilen kategori slug'ına göre 3D bir model ve metin okunabilirliğini artıran bir gradyan overlay oluşturarak menünün arka planını render eder. Modül tek bir bileşenden oluşur ve dışarıya yalnızca bu bileşeni dışa aktarır.

## Fonksiyon Grupları
### Ana Bileşen (3D Arka Plan)
Mega menünün arka planını oluşturmak için gerekli olan 3D model ve gradyan overlay'ı bir arada sunan temel React bileşenini tanımlar. Bileşenin üst kısmına büyük bir 3D görsel yerleştirirken, alt kısımda koyu bir gradyan efekti uygulayarak menü metinlerinin okunabilirliğini artırır.
- MegaMenu3DBackground

## Bağımlılıklar ve Mimari Notlar
- **Dış bağımlılıklar**: Bileşenin 3D model yükleme ve gradyan overlay oluşturma işlemleri için hangi harici kütüphaneleri kullandığı fonksiyon gövdesi paylaşılmadığı için bilinmiyor.
- **Dinamik/lazy yükleme**: `categorySlug` prop'una göre dinamik olarak farklı bir 3D model veya tema yüklenip yüklenmediği fonksiyon gövdesi olmadan doğrulanamıyor.
- **Mimari önem**: Bu bileşen, mega menü dropdown'unun görsel deneyimini doğrudan etkilediğinden, navigasyon katmanının kullanıcı arayüzü tarafında kritik bir rol üstlenir. `categorySlug` prop'u sağlanmazsa bileşenin hangi kategoriye ait 3D arka plan modelini render edeceği belirsiz olur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için, fonksiyon gövdesi (içerik) paylaşılmadığından yalnızca fonksiyon imzasından türetilebilecek sınırlı varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `categorySlug` prop'u sağlanmazsa, bileşen hangi kategoriye ait 3D arka planı render edeceğini bilemez; davranış bilinmiyor (fonksiyon gövdesi verilmediği için null kontrolü yapılıp yapılmadığı tespit edilemez).

[Aksiyom 2]: Eğer `MegaMenu3DBackgroundProps` tip tanımı mevcut değilse, bileşen beklenen prop yapısını doğrulayamaz ve TypeScript derleme hatası oluşur.

[Aksiyom 3]: Eğer bileşenin render edildiği ortamda 3D rendering desteği (örneğin WebGL) yoksa, 3D model gösteriminin nasıl davranacağı bilinmiyor (fonksiyon gövdesinde fallback mekanizması olup olmadığı tespit edilemez).

---

**Not:** Fonksiyon gövdesi verilmediği için bu modülün gerçek mimari varsayımları (gradyan overlay davranışı, model yükleme stratejisi, hata yönetimi, performans optimizasyonları vb.) üretilememektedir. Yukarıdaki aksiyomlar yalnızca imzadan çıkarılabilecek minimum düzeyde varsayımlardır. Daha doğru aksiyomlar için fonksiyon gövdesinin sağlanması gerekmektedir.

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

## İTHALATLAR (IMPORTS)
- import: ../products/3d/core::VentHubCanvas
- import: ../products/Category3DIcon::Category3DIcon
- import: @react-three/drei::OrbitControls
- import: react::React
- import: react::Suspense

---

## INTERFACES

### MegaMenu3DBackgroundProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\tmp\vh-t088\src\components\navigation\MegaMenu3DBackground.tsx::MegaMenu3DBackground
- **params**: `categorySlug` — kategori slug bilgisi, Category3DIcon bileşenine prop olarak aktarılır
- **ic_degiskenler**:
  - `VentHubCanvas` — 3D canvas bileşeni; `preset="nav"`, `camera={{ position: [0, 0.1, 2.2], fov: 40 }}`, `frameloop="demand"` ile yapılandırılır
  - `Suspense` — asenkron yüklenen 3D bileşenleri sarmalar; `fallback={null}` ile yüklenirken hiçbir şey göstermez
  - `Category3DIcon` — kategoriye özel 3D ikon bileşeni; `categorySlug={categorySlug}` ve `scale={0.9}` prop'ları ile kullanılır
  - `OrbitControls` — kamera kontrol bileşeni; `enableZoom={false}`, `enablePan={false}`, `enableRotate={false}` ile tüm manuel kontrol devre dışı, `autoRotate` aktif, `autoRotateSpeed={1.5}` ile otomatik dönüş hızı ayarlı
  - `div` (canvas sarmalayıcı) — `className="absolute top-0 left-0 right-0 h-3/4 pointer-events-none"` ile üst yüzde 75'lik alana konumlandırılır, tıklama olaylarını geçirmez
  - `div` (gradient overlay) — `className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent pointer-events-none"` ile beyaz gradient geçiş efekti oluşturur, tıklama olaylarını geçirmez
- **Dönüş**: JSX — iki `div` elementinden oluşan React fragment (`<>...</>`); birincisi 3D canvas'ı üst yüzde 75 alanda gösterir, ikincisi alttan yukarıya doğru beyaz gradient overlay ekler

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