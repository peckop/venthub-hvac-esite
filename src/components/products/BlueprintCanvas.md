---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: eb4c5010ca026ec1
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: e6d08556883a0989
  style_tokens: 31f4acfd42638e52
generated_at: 2026-05-28T22:37:01Z
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

Bu modül için fonksiyon gövdeleri verilmediğinden, aksiyom üretilememektedir. Sadece fonksiyon imzası ve modül sabitlerindeki `image` parametresinin zorunlu olabileceği düşünülebilir, ancak bu bir varsayım olarak kesinleştirilemez.

[Aksiyom 1]: Eğer `CinematicCard` bileşeni çağrıldığında `image` prop'u sağlanmazsa, bileşenin nasıl davranacağı bilinmiyor.

[Aksiyom 2]: Eğer `BlueprintCanvas` bileşeni çağrıldığında `image` prop'u sağlanmazsa, bileşenin nasıl davranacağı bilinmiyor.

[Aksiyom 3]: Eğer `HolographicMaterial` çağrılmak istendiğinde gerekli parametreler sağlanmazsa, nasıl bir hata döneceği bilinmiyor.

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