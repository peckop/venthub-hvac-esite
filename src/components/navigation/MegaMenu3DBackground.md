---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\navigation\MegaMenu3DBackground.tsx
skeleton_hash: 0c6506896eb744aa
entity_hashes:
  func:MegaMenu3DBackground: bb72cddf66cbd5a0
  overview: 64226aa5800abc8b
  style_tokens: 487664132884f59c
generated_at: 2026-08-27T09:03:55Z
---

## Genel Bakış
Bu modül, mega menü bileşeninin arka planında üç boyutlu bir görsel efekt sunan bir React bileşenini tanımlar. Bileşen, verilen kategori slug'ına göre 3D bir model ve metin okunabilirliğini artıran bir gradyan overlay oluşturarak menünün arka planını render eder. Eğer `categorySlug` prop'u sağlanmazsa, bileşen hedefsiz çalışır ve beklenen 3D görsel efekti üretemez.

## Fonksiyon Grupları
### Ana Bileşen (3D Arka Plan)
Mega menünün arka planını oluşturmak için gerekli olan 3D model ve gradyan overlay'ı bir arada sunan temel React bileşenini tanımlar.
- MegaMenu3DBackground

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (içerik) paylaşılmadığından, yalnızca fonksiyon imzasından aksiyom türetilememektedir.

İmzadan çıkarılabilen tek bilgi:
- Bileşen `categorySlug` adında bir prop almaktadır.
- Bileşen `MegaMenu3DBackgroundProps` tipinde bir props nesnesi beklemektedir.

Ancak bu bileşenin doğru çalışması için hangi koşulların var olması gerektiği (örneğin: hangi bağımlılıklar gerekli, hangi veriler zorunlu, hangi hata durumları ele alınmalı) fonksiyon gövdesi olmadan belirlenemez.

**Sonuç:** Bu modül için fonksiyon gövdesi sağlanmadığından mimari aksiyom tanımlanamamaktadır. Aksiyom üretmek için `MegaMenu3DBackground` fonksiyonunun gerçek implementasyonu gereklidir.

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

### [N1_NASIL] AST Pointer: src/components/navigation/MegaMenu3DBackground.tsx::MegaMenu3DBackground
- **params**: `categorySlug` — destructured props'tan gelen kategori slug değeri
- **ic_degiskenler**:
  - `categorySlug` — `Category3DIcon` bileşenine aynı adla prop olarak aktarılır
  - `preset="nav"` — `VentHubCanvas` bileşenine verilen canvas ön-ayar adı
  - `camera={{ position: [0, 0.1, 2.2], fov: 40 }}` — `VentHubCanvas` kamera konumu ve görüş açısı ayarı
  - `frameloop="demand"` — `VentHubCanvas` kare döngüsü modu; talep üzerine render
  - `fallback={null}` — `Suspense` bileşeninin yükleme sırasında gösterilecek alternatifi; boş
  - `scale={0.9}` — `Category3DIcon` bileşeninin ölçek değeri
  - `enableZoom={false}` — `OrbitControls` zoom özelliğini devre dışı bırakır
  - `enablePan={false}` — `OrbitControls` kaydırma (pan) özelliğini devre dışı bırakır
  - `enableRotate={false}` — `OrbitControls` kullanıcı etkileşimiyle döndürmeyi devre dışı bırakır
  - `autoRotate` — `OrbitControls` otomatik döndürmeyi etkinleştirir (boolean true)
  - `autoRotateSpeed={1.5}` — `OrbitControls` otomatik döndürme hızı
- **Dönüş**: JSX fragment — biri 3D canvas içeren (üst 3/4 alan, `pointer-events-none`, `absolute` konumlu), diğeri beyaz gradient overlay olan iki `div` döndürür

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