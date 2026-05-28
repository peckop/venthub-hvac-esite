---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\LazyInView.tsx
skeleton_hash: 1f246a34a210785e
entity_hashes:
  func:LazyInView: a6cf07d9fd7df258
  overview: dcd89aaa1940f652
  style_tokens: 884aa794c8b33f43
generated_at: 2026-05-28T22:36:24Z
---

## Genel Bakış
`LazyInView` modülü, React uygulamalarında performans optimizasyonu için tasarlanmış bir tembel yükleme (lazy loading) bileşenidir. Bileşen, içeriğin yalnızca görünüm alanına (viewport) girmesi durumunda yüklenmesini sağlayarak sayfa yüklenme süresini iyileştirir.

## Fonksiyon Grupları
### Çekirdek Bileşen ve Yükleme Mantığı
Modülün temel işlevini yöneten, görünüm takibi ve asenkron içerik yükleme süreçlerini birleştiren ana React bileşenini tanımlar.
- LazyInView

---

## AXIOMS – Mimari Varsayımlar
Bu modül için temel mimari varsayımlar tanımlanmıştır.

**[Aksiyom 1 - Zorunlu Loader Prop'u]:** Eğer `loader` prop'u sağlanmazsa, TypeScript derleme hatası oluşur ve bileşen render edilemez; çünkü `loader` parametresinin varsayılan değeri yoktur.

**[Aksiyom 2 - Placeholder Varsayılan Değeri]:** Eğer `placeholder` prop'u sağlanmazsa, `<div className="min-h-160px" aria-hidden="true" />` varsayılan olarak kullanılır; bileşen her durumda bir yer tutucu gösterir.

**[Aksiyom 3 - Tek Prop Objesi]:** Eğer bileşen birden fazla bağımsız argüman ile çağrılmazsa, tüm prop'lar tek bir nesne olarak destructure edilmelidir (fonksiyon imzası tek bir `{ loader, placeholder }` objesi bekler).

**[Aksiyom 4 - Generik Tip Parametresi]:** Eğer `T` tipi belirtilmezse, TypeScript'in tip çıkarımı ile belirlenir; `loader`'ın döndüreceği içeriğin tipi bu generik parametreye bağlıdır.

---

## FONKSİYON DETAYLARI

### LazyInView

**Ne yapar**: LazyInView, içeriğin görüntü alanına (viewport) girdiğinde yüklenmesini sağlayan bir React lazy loading (tembel yükleme) bileşenidir. Bu bileşen, sayfa performansını optimize etmek için yalnızca görünür alandaki içeriklerin yüklenmesini mümkün kılar.

**Nasıl yapar**: Intersection Observer API'sini kullanarak placeholder elemanının ekranda görünüp görünmediğini izler. Bileşen görünür alana girdiğinde, `loader` prop'unu değerlendirerek asıl içeriği yükler ve placeholder'ı bu içerikle değiştirir. Generik `<T>` yapısı sayesinde farklı veri tipleri ile çalışabilir.

**Parametreler**:
- `loader`: ReactNode veya () => ReactNode tipinde — Görünür alana girildiğinde yüklenecek olan asıl içeriği temsil eder. Genellikle bir fonksiyon veya React bileşenidir ve lazy yükleme tetiklendiğinde render edilir
- `placeholder`: ReactNode tipinde (varsayılan: `<div className="min-h-160px" aria-hidden="true" />`) — İçerik yüklenene kadar görüntülenen geçici elemandır. Varsayılan değer, ekran okuyucular tarafından yok sayılan 160px yüksekliğinde boş bir divdir
- `T`: Generic tip parametresi — Bileşenin işleyebileceği veri tipini belirler. Lazy yüklenecek içeriğin türünü tanımlamak için kullanılır

**Dönüş**: JSX.Element — Lazy yükleme mantığı uygulanmış React bileşeni döndürür. Bileşen, placeholder'ı veya yüklenmiş içeriği render eder

---

## INTERFACES

### LazyInViewProps
- `loader: () => Promise<{ default: React.ComponentType<T> }>`
- `placeholder?: React.ReactNode`
- `rootMargin?: string`
- `once?: boolean`
- `className?: string`
- `componentProps?: T`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/LazyInView.tsx::LazyInView
- **params**: `(loader, placeholder = <div className="min-h-160px" aria-hidden="true" />, rootMargin = '200px 0px', once = true, className, componentProps)`
- **ic_degiskenler**:
  - `ref` — React ref nesnesi, bir HTMLDivElement'ye atıfta bulunur, IntersectionObserver için DOM elemanını izlemek için kullanılır
  - `shouldLoad` — boolean state, bileşenin yüklenme işleminin tetiklenip tetiklenmediğini kontrol eder
  - `Loaded` — React.ComponentType state, yüklenecek bileşen modülünü tutar (null olarak başlar)
- **Dönüş**: JSX (div elementi içinde Loaded bileşeni veya placeholder)

### [N2_NASIL] AST Pointer: src/components/LazyInView.tsx::pointerdown/touchstart effect callback
- **params**: `()`
- **ic_degiskenler**:
  - `enable` — arrow fonksiyon, shouldLoad state'ini true yaparak yükleme işlemini tetikler
- **Dönüş**: cleanup fonksiyonu (event listener'ları kaldırır)

### [N3_NASIL] AST Pointer: src/components/LazyInView.tsx::effect1 cleanup callback
- **params**: `()`
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: src/components/LazyInView.tsx::IntersectionObserver effect callback
- **params**: `()`
- **ic_degiskenler**:
  - `el` — IntersectionObserver tarafından izlenecek DOM elemanı (ref.current'dan alınır)
  - `io` — IntersectionObserver instance'ı, elemanı gözlemlemek için oluşturulur
- **Dönüş**: cleanup fonksiyonu (observer'ı disconnect eder)

### [N5_NASIL] AST Pointer: src/components/LazyInView.tsx::IntersectionObserver entries callback
- **params**: `(entries)`
- **ic_degiskenler**:
  - `entries` — IntersectionObserverEntry dizisi, gözlemelenen elemanların durumunu içerir
  - `entry` — entries[0], ilk gözlemenen elemanın durum nesnesi
- **Dönüş**: void

### [N6_NASIL] AST Pointer: src/components/LazyInView.tsx::loader effect callback
- **params**: `()`
- **ic_degiskenler**:
  - `cancelled` — boolean flag, useEffect cleanup işleminde kullanılır, asenkron yükleme işlemini iptal etmek için kontrol edilir
- **Dönüş**: cleanup fonksiyonu (cancelled flag'ini true yapar)

### [N7_NASIL] AST Pointer: src/components/LazyInView.tsx::loader().then callback
- **params**: `(mod)`
- **ic_degiskenler**:
  - `mod` — import edilen modül nesnesi, mod.default içinde yüklenecek bileşen bulunur
- **Dönüş**: void

### [N8_NASIL] AST Pointer: src/components/LazyInView.tsx::loader().catch callback
- **params**: `()`
- **ic_degiskenler**: (yok)
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\LazyInView.tsx
  function: src\components\LazyInView.tsx::LazyInView

---

## DISA AKTARILANLAR (EXPORTS)
  export: LazyInView

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `min-h-160px`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)