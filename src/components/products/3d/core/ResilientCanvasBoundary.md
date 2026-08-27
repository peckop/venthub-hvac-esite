---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\core\ResilientCanvasBoundary.tsx
skeleton_hash: 695c546d907a6c73
entity_hashes:
  func:ResilientCanvasBoundary:componentDidCatch: 77eebb86b07563ff
  func:ResilientCanvasBoundary:getDerivedStateFromError: bde8b48e4da18d08
  func:ResilientCanvasBoundary:render: 140f5f633bb5ad7a
  func:Static3DFallback: b2ce76cecd8cb60f
  overview: bf5c11c0f58fb796
  style_tokens: efe3cb23b056f20a
generated_at: 2026-08-27T07:06:01Z
---

## Genel Bakış
Bu modül, React bileşeninde 3D canvas ile ilgili kritik hataları yakalayan ve uygulamanın çökmesini önleyen bir hata sınırı (error boundary) işlevi görür. Hata durumunda kullanıcıya statik bir 3D fallback göstererek dayanıklılık (resilience) sağlar.

## Fonksiyon Grupları
### Hata Yönetimi
Bileşen ağacındaki hataları yakalar ve durumunu günceller, böylece hatalı bileşenin alt kısmının rendering'i durur.
- getDerivedStateFromError, componentDidCatch

### Alternatif Görünüm Sağlama
Hata durumunda 3D canvas yerine gösterilecek statik alternatif bileşeni tanımlar.
- Static3DFallback

### Temsil ve Yapı
Bileşenin mevcut durumuna göre hangi içeriğin (hatalı çocuk veya fallback) render edileceğine karar verir.
- render

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Static3DFallback
**Ne yapar**: Canvas'ın 3D içeriği yüklenemediğinde veya Canvas mount sırasında hata oluştuğunda gösterilecek statik fallback (yedek) UI bileşenini render eder. Bu bileşen, sayfanın tamamen çökmesini engelleyerek kullanıcıya minimal ama anlamlı bir görsel geri bildirim sunar.

**Nasıl yapar**: Sıradan bir React fonksiyonel bileşenidir ve herhangi bir state veya prop almaz. JSX içinde tamamen sabit bir yapı döndürür: Ortalanmış bir `<div>` içerisine, `Box` ikon bileşeni yerleştirir. `bg-product-3d-radial` sınıfı ile radial gradyan arka plan, `text-steel-gray opacity-40` ile soluk gri tonlarında ikon oluşturulur. `aria-hidden="true"` niteliği ile ikonun ekran okuyucular tarafından yok sayılması sağlanır. Bu bileşen, `ResilientCanvasBoundary`'nin dış katmanında (`props.fallback`) kullanılmak üzere tasarlanmıştır. Documentasyon notuna göre, Canvas bileşeninin kendi içindeki `AssetErrorBoundary` bileşeni Canvas mount sırasındaki throw'ları yakalayamaz; bu yüzden `Static3DFallback` gibi bir dış katman bileşeni şarttır. Ayrıca not edilen açık borç: `webglcontextcreationerror` gibi context-CREATION async hataları henüz bu fallback mekanizması tarafından yakalanamamaktadır.

**Parametreler**:
Bu fonksiyon parametre almaz.

**Dönüş**: JSX elementi (`React.JSX.Element`) döndürür — merkezi hizalanmış, soluk ikonlu, radial gradyan arka planlı bir `<div>` yapısı.

### getDerivedStateFromError
**Ne yapar**: React'ın hata yakalama mekanizmasının bir parçası olarak, bir alt bileşende oluşan hatayı tespit ettiğinde bileşenin state'ini günceller. Bu statik metod, render sırasında oluşan hataları yakalamak için React tarafından otomatik olarak çağrılır ve bileşeni hata durumuna geçirir.

**Nasıl yapar**: React, alt bileşen ağacında bir hata yakaladığında bu statik metodu çağırır. Metot, `hasError` alanını `true` olarak ayarlayan yeni bir state nesnesi döndürür. Bu state değişikliği sayesinde bileşenin `render` metodu hata durumunu algılayabilir ve buna göre farklı bir çıktı üretebilir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `State` tipinde bir nesne döndürür. Dönen nesne `{ hasError: true }` şeklindedir ve bileşenin state'ine birleştirilir.

### componentDidCatch
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### render
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: lucide-react::Box
- import: react::React

---

## INTERFACES

### Props
- `children: React.ReactNode`
- `fallback: React.ReactNode`

### State
- `hasError: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/core/ResilientCanvasBoundary.tsx::Static3DFallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `Box` — lucide-react'ten import edilen ikon bileşeni; 48 boyutunda, strokeWidth 1.5, opacity-40 ve text-steel-gray sınıfıyla kullanılır, aria-hidden="true" ile erişilebilirlikten gizlenir
- **Dönüş**: JSX element — `div` kapsayıcı (flex, h-full, w-full, items-center, justify-center, rounded-xl, bg-product-3d-radial sınıflarıyla) içinde `Box` ikonu barındırır

### [N2_NASIL] AST Pointer: src/components/products/3d/core/ResilientCanvasBoundary.tsx::ResilientCanvasBoundary.getDerivedStateFromError
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: State nesnesi — `{ hasError: true }` döndürür; hata yakalandığında state'i günceller

### [N3_NASIL] AST Pointer: src/components/products/3d/core/ResilientCanvasBoundary.tsx::ResilientCanvasBoundary.componentDidCatch
- **params**:
  - `error: Error` — yakalanan hata nesnesi
- **ic_degiskenler**:
  - `error` — `console.error`'a ikinci argüman olarak geçirilir; '[VentHubCanvas] 3D yüzeyi yüklenemedi, sayfa ayakta kalıyor:' mesajıyla birlikte loglanır
- **Dönüş**: yok — yan etki olarak `console.error` ile hata loglar

### [N4_NASIL] AST Pointer: src/components/products/3d/core/ResilientCanvasBoundary.tsx::ResilientCanvasBoundary.render
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `this.state.hasError` — boolean; hata durumunu kontrol eder
  - `this.props.fallback` — hata durumunda gösterilecek bileşen
  - `this.props.children` — hata olmadığında gösterilecek alt bileşenler
- **Dönüş**: JSX element — `this.state.hasError` true ise `this.props.fallback`, false ise `this.props.children` döndürür

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    ResilientCanvasBoundary_tsx__Static3DFallback["Static3DFallback"]
    ResilientCanvasBoundary_tsx__componentDidCatch["componentDidCatch"]
    ResilientCanvasBoundary_tsx__getDerivedStateFromError["getDerivedStateFromError"]
    ResilientCanvasBoundary_tsx__render["render"]
```

## NODE ID STANDARD

  file: src\components\products\3d\core\ResilientCanvasBoundary.tsx
  function: src\components\products\3d\core\ResilientCanvasBoundary.tsx::Static3DFallback
  class: src\components\products\3d\core\ResilientCanvasBoundary.tsx::ResilientCanvasBoundary

---

## DISA AKTARILANLAR (EXPORTS)
  export: ResilientCanvasBoundary
  export: Static3DFallback

---

## BILEŞIM (CONTAINS)
  contains: Component<Props
  contains: State
  contains: State>

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-product-3d-radial`, `text-steel-gray`
- **Layout:** `flex`, `h-full`, `items-center`, `justify-center`, `w-full`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `opacity-40`, `rounded-xl`